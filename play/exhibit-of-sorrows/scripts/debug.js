// Debug and self-testing tools. Does nothing unless the page URL has ?debug.
// Not included in release builds (see devOnlyFiles in build.js).
//
// URL parameters (combine with &):
//   debug              turn the tools on (required for everything below)
//   room=N             start in room N, skipping the menu and intro
//   phase=P            story phase for room=: normal (default), dark, horror
//   speed=K            run tweens and game timers K times faster
//   nosandbox          let saves read/write the real save (off by default: debug
//                      sessions keep saves in memory and never touch the real one)
//   seed=S             make Math.random repeatable (implied by capture)
//   failassets=REGEX   make asset downloads matching REGEX fail, to test the
//                      retry / stand-in handling (gameDebug.setFailAssets(null) to stop)
//   capture=NAME       deterministic screenshot: fixed random seed and fixed 16ms
//                      frames, runs settle= ms (default 3000) of game time after the
//                      room is ready, then uploads NAME.png to tools/devserver.js
//
//   e.g. index.html?debug&room=13&phase=horror
//        index.html?debug&room=5&phase=dark&capture=handy_dark
//
// From the browser console, window.gameDebug:
//   state()            snapshot: room, phase, fps, errors, ...
//   goto(room, phase)  reload straight into a room
//   exportSave()       the game's current save data (what it would store)
//   load(save)         reload starting from a save object from exportSave()
//   advance(ms)        run the game ms forward immediately, independent of the
//                      browser's frame rate (for hidden or throttled tabs)
//   setSpeed(k)        tween/timer speed multiplier
//   errors             uncaught errors and console.error calls since load
//   captureAll(list)   screenshot many states in one go, reloading between them:
//                      list = [{room: 2, phase: "normal"}, ...] or "all" for every
//                      room in every phase. Progress/results: captureStatus()
//
// Room numbers: 1 lobby, 2 pump, 3 faucet, 4 clown 1, 5 handy, 6 stretch,
// 7 clown 2, 8-12 flower corridor, 13 jack, 14 clown 3, 15 exit.

(function () {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("debug")) return;

    const SESSION_SAVE_KEY = "gameDebugSave";
    const PHASES = {
        normal: {},
        dark: { darkPoint: true },
        // The playable horror phase: power turned on, then the exit door failed
        horror: { horrorPoint: true, finishedDarkPoint: true, doorFailed: true }
    };
    const ROOMS = {
        1: "lobby", 2: "pump", 3: "faucet", 4: "clown1", 5: "handy", 6: "stretch", 7: "clown2",
        8: "flower1", 9: "flower2", 10: "flower3", 11: "flower4", 12: "flower5",
        13: "jack", 14: "clown3", 15: "exit"
    };

    const dbg = {
        enabled: true,
        sandbox: !params.has("nosandbox"),
        // Save the game should start from (JSON string), or null for a fresh game
        saveOverride: null,
        // Most recent save the game wrote while sandboxed
        lastSave: null,
        errors: [],
        // True once gameplay has begun (intro finished or skipped)
        ready: false,
        rooms: ROOMS,
        speed: parseFloat(params.get("speed")) || 1
    };
    window.gameDebug = dbg;

    // ---- error capture: available even if the console wasn't open at load ----
    // Warnings matter too: save restore catches its own failures and only warns.
    dbg.warnings = [];
    const describe = (args) => args.map((a) => (a && a.stack ? a.stack : String(a))).join(" ");
    window.addEventListener("error", (e) => {
        dbg.errors.push({
            type: "error",
            message: e.message,
            source: e.filename + ":" + e.lineno,
            stack: e.error && e.error.stack,
            time: Date.now()
        });
    });
    window.addEventListener("unhandledrejection", (e) => {
        dbg.errors.push({ type: "rejection", message: String(e.reason), stack: e.reason && e.reason.stack, time: Date.now() });
    });
    const origConsoleError = console.error;
    console.error = function (...args) {
        dbg.errors.push({ type: "console.error", message: describe(args), time: Date.now() });
        return origConsoleError.apply(console, args);
    };
    const origConsoleWarn = console.warn;
    console.warn = function (...args) {
        dbg.warnings.push({ message: describe(args), time: Date.now() });
        return origConsoleWarn.apply(console, args);
    };

    // ---- simulated load failures ----
    // ?failassets=REGEX makes every asset download whose URL matches fail (404),
    // to test the retry and stand-in handling. gameDebug.setFailAssets(null) stops
    // failing (like the network coming back); follow it with
    // window.dispatchEvent(new Event("online")) to trigger the immediate retry.
    let failAssetsPattern = params.get("failassets") ? new RegExp(params.get("failassets")) : null;
    dbg.setFailAssets = function (pattern) {
        failAssetsPattern = pattern ? new RegExp(pattern) : null;
        return String(failAssetsPattern);
    };
    const origXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        const args = Array.prototype.slice.call(arguments);
        if (failAssetsPattern && typeof url === "string" && failAssetsPattern.test(url)) {
            args[1] = "/__simulated_missing__/" + url;
        }
        return origXhrOpen.apply(this, args);
    };

    // ---- starting save: from a previous goto()/load(), or built from room=/phase= ----
    let startSave = null;
    try {
        startSave = sessionStorage.getItem(SESSION_SAVE_KEY);
        sessionStorage.removeItem(SESSION_SAVE_KEY);
    } catch (e) { /* storage blocked */ }
    if (!startSave && params.has("room")) {
        startSave = JSON.stringify(buildSave(parseInt(params.get("room"), 10), params.get("phase") || "normal"));
    }
    dbg.saveOverride = startSave;
    const autoStart = !!startSave || params.has("autostart");
    const captureName = params.get("capture");

    // ---- repeatable randomness (mulberry32) ----
    const nativeRandom = Math.random;
    // Counts calls, so captures that differ can be compared by how many random
    // numbers each drew (see fingerprint in runCapture)
    dbg.randomCalls = 0;
    function seedRandom(seed) {
        let a = seed >>> 0;
        dbg.randomCalls = 0;
        Math.random = function () {
            dbg.randomCalls++;
            if (dbg.randomTrace) dbg.randomTrace.push((new Error().stack.split("\n")[2] || "").trim());
            a = (a + 0x6d2b79f5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const seed = parseInt(params.get("seed"), 10) || (captureName ? 12345 : 0);
    if (seed) seedRandom(seed);
    dbg.unseedRandom = function () {
        Math.random = nativeRandom;
    };

    function buildSave(room, phase) {
        if (!PHASES[phase]) throw new Error("unknown phase " + phase + ", use one of " + Object.keys(PHASES).join("/"));
        return {
            version: SAVE_VERSION,
            savedAt: Date.now(),
            scene: room,
            story: Object.assign({}, PHASES[phase]),
            rooms: {},
            // Every door open, so the tester can walk anywhere
            cantMove: new Array(17).fill(false),
            needCleanup: false,
            keys: []
        };
    }

    // ---- controllable clock ----
    // Phaser's tween manager times itself with Date.now(), not the frame delta, so
    // stepping frames by hand only moves tweens if Date.now() moves with them.
    // While frozen, Date.now() only advances when a frame is stepped; unfreezing
    // continues from the stepped time so running tweens don't jump or stall.
    const realDateNow = Date.now.bind(Date);
    let frozenAt = null;
    let clockOffset = 0;
    Date.now = function () {
        return frozenAt !== null ? frozenAt : realDateNow() + clockOffset;
    };
    function freezeClock() {
        if (frozenAt === null) frozenAt = Date.now();
    }
    function tickClock(ms) {
        frozenAt += ms;
    }
    function unfreezeClock() {
        clockOffset = frozenAt - realDateNow();
        frozenAt = null;
    }

    // ---- keep the game loop running when the tab/pane is hidden or occluded ----
    // requestAnimationFrame is throttled in background tabs; setTimeout keeps
    // ticking. `config` is main.js's Phaser config, read when the game is created.
    if (typeof config !== "undefined") {
        config.fps = Object.assign({}, config.fps, { forceSetTimeOut: true, target: 60 });
        // Lets the canvas be read back after rendering, for screenshots
        config.render = Object.assign({}, config.render, { preserveDrawingBuffer: true });
    }

    function scene() {
        return typeof globalScene !== "undefined" ? globalScene : null;
    }

    function applySpeed() {
        const s = scene();
        if (!s) return;
        s.tweens.timeScale = dbg.speed;
        s.time.timeScale = dbg.speed;
    }

    dbg.setSpeed = function (k) {
        dbg.speed = k;
        applySpeed();
        return k;
    };

    dbg.state = function () {
        const loop = typeof game !== "undefined" && game ? game.loop : null;
        const phase = gameVars.horrorPoint ? "horror" : gameVars.darkPoint ? "dark" : gameVars.finishedDarkPoint ? "finishedDark" : "normal";
        const room = gameObjects.exhibit ? gameObjects.exhibit.getCurrentScene() : null;
        return {
            ready: dbg.ready,
            started: !!gameVars.gameStarted,
            room: room,
            roomName: ROOMS[room] || null,
            phase: phase,
            moving: !!(gameObjects.exhibit && gameObjects.exhibit.isMoving),
            fps: loop ? Math.round(loop.actualFps) : null,
            frame: loop ? loop.frame : null,
            speed: dbg.speed,
            sandbox: dbg.sandbox,
            errors: dbg.errors.length,
            warnings: dbg.warnings.length
        };
    };

    dbg.exportSave = function () {
        const s = typeof collectSaveState === "function" ? collectSaveState() : null;
        return s ? JSON.parse(JSON.stringify(s)) : null;
    };

    function reloadWith(save) {
        try {
            sessionStorage.setItem(SESSION_SAVE_KEY, JSON.stringify(save));
        } catch (e) { /* storage blocked */ }
        const p = new URLSearchParams(window.location.search);
        p.delete("room");
        p.delete("phase");
        window.location.search = p.toString();
    }

    dbg.goto = function (room, phase) {
        reloadWith(buildSave(room, phase || dbg.state().phase.replace("finishedDark", "normal")));
    };

    dbg.load = function (save) {
        reloadWith(typeof save === "string" ? JSON.parse(save) : save);
    };

    dbg.advance = function (ms, stepMs) {
        const loop = game.loop;
        const step = stepMs || 1000 / 60;
        let t = loop.lastTime;
        freezeClock();
        for (let elapsed = 0; elapsed < ms; elapsed += step) {
            t += step;
            tickClock(step);
            loop.step(t);
        }
        unfreezeClock();
        // Re-sync with the real clock so the next normal frame has a normal delta
        loop.lastTime = window.performance.now();
        return dbg.state();
    };

    // ---- screenshots ----
    dbg.snapshot = function (name) {
        const data = game.canvas.toDataURL("image/png");
        const upload = (body) => fetch("/__snapshot/" + encodeURIComponent(name), { method: "POST", body: body })
            .then((r) => {
                if (!r.ok) throw new Error("snapshot upload failed: " + r.status + " (is tools/devserver.js serving the page?)");
            });
        // NAME.png, plus NAME.json with the state fingerprint when capturing
        return upload(data)
            .then(() => (dbg.fingerprint ? upload(JSON.stringify(dbg.fingerprint)) : null))
            .then(() => name);
    };

    // Loading runs in real time before a capture takes over, and some state builds
    // up every frame during it (the random camera sway, mouse drift). Put it back to
    // fixed values so the capture doesn't depend on how long loading took.
    function resetFrameAccumulatedState() {
        for (const c of [gameObjects.exhibCntr, gameObjects.loadingCntr]) {
            if (!c) continue;
            for (const k of ["swayX", "swayY", "swayAccX", "swayAccY", "swayAmt", "offsetX", "offsetY",
                "offsetAccX", "offsetAccY", "goalOffsetX", "goalOffsetY", "shakeAccX", "shakeAccY"]) {
                if (k in c) c[k] = 0;
            }
            c.x = 0;
            c.y = 0;
        }
        gameVars.mouseposx = gameVars.prevMouseposx = gameVars.halfWidth;
        gameVars.mouseposy = gameVars.prevMouseposy = gameVars.halfHeight;
        gameVars.mouseaccx = 0;
        gameVars.mouseaccy = 0;
    }

    // Runs everything from "assets loaded" onward deterministically in one
    // synchronous burst: fixed seed, the real loop paused, and every frame exactly
    // 16ms. Nothing asynchronous (network, timers, input) can land in the middle,
    // so the same code always produces the same pixels, and a hidden or throttled
    // tab takes no longer than a visible one.
    //
    // 16ms rather than 1000/60: frame times start from the real clock, and adding
    // an inexact 16.666... to different starting values rounds differently, which
    // was enough to fire a 350ms timer on frame 21 in one run and 22 in the next.
    // Whole milliseconds keep all the timing arithmetic exact.
    function runCapture(s) {
        const loop = game.loop;
        const step = 16;
        let t = Math.round(loop.lastTime);
        loop.lastTime = t;
        let frames = 0;
        const frame = () => {
            t += step;
            frames++;
            tickClock(step);
            loop.step(t);
        };
        seedRandom(seed);
        dbg.randomTrace = [];
        loop.sleep();
        freezeClock();
        loop.smoothStep = false;
        resetFrameAccumulatedState();
        // The loading screen's reveal animation, until BEGIN appears
        let guard = 60 * 60;
        while (!(gameObjects.startGameButton && !gameObjects.startGameButton.isDestroyed) && guard-- > 0) frame();
        startGame(s);
        guard = 60 * 60;
        while (!gameVars.gameplayBegan && guard-- > 0) frame();
        if (!gameVars.gameplayBegan) {
            dbg.errors.push({ type: "capture", message: "gameplay never began", time: Date.now() });
        }
        dbg.ready = true;
        const randomAtReady = dbg.randomCalls;
        const framesToReady = frames;
        const settle = parseInt(params.get("settle"), 10);
        const settleFrames = Math.round((isNaN(settle) ? 3000 : settle) / step);
        for (let i = 0; i < settleFrames; i++) frame();
        // Enough state to tell two captures apart without looking at pixels
        const round = (v) => (typeof v === "number" ? Math.round(v * 1e4) / 1e4 : v);
        dbg.fingerprint = {
            framesToReady: framesToReady,
            randomAtReady: randomAtReady,
            randomTotal: dbg.randomCalls,
            updateFuncs: typeof updateFuncList !== "undefined" ? updateFuncList.length : null,
            tweens: s.tweens.getTweens().length,
            timers: s.time._active.length,
            exhibX: round(gameObjects.exhibCntr.x),
            exhibY: round(gameObjects.exhibCntr.y),
            flashDim: gameObjects.flashDim ? round(gameObjects.flashDim.alpha) : null,
            candleDark: gameObjects.candleDark ? round(gameObjects.candleDark.scaleX) : null,
            sounds: gameObjects.sounds ? Object.keys(gameObjects.sounds).length : null
        };
        // Where every random number came from, in order, with repeats collapsed:
        // [[site, count], ...]. Two captures that differ can be diffed on this to
        // find the first point where they drew randomness differently.
        const trace = [];
        for (const site of dbg.randomTrace) {
            const last = trace[trace.length - 1];
            if (last && last[0] === site) last[1]++;
            else trace.push([site, 1]);
        }
        dbg.fingerprint.randomTrace = trace;
        const done = (result) => {
            dbg.captureResult = result;
            if (!advanceCaptureQueue(result)) {
                // Not part of a batch: hand the game back to the real clock and loop
                unfreezeClock();
                loop.smoothStep = true;
                if (dbg.releaseLoop) dbg.releaseLoop();
                loop.wake();
            }
        };
        dbg.snapshot(captureName).then(
            () => done({ name: captureName, ok: true, state: dbg.state(), fingerprint: dbg.fingerprint, errors: dbg.errors.slice(), warnings: dbg.warnings.slice() }),
            (e) => done({ name: captureName, ok: false, error: String(e), errors: dbg.errors.slice(), warnings: dbg.warnings.slice() })
        );
    }

    // ---- batch capture across reloads (queue kept in sessionStorage) ----
    const QUEUE_KEY = "gameDebugCaptureQueue";
    const RESULTS_KEY = "gameDebugCaptureResults";

    function readJSON(key, fallback) {
        try {
            const v = sessionStorage.getItem(key);
            return v ? JSON.parse(v) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function writeJSON(key, v) {
        try {
            sessionStorage.setItem(key, JSON.stringify(v));
        } catch (e) { /* storage blocked */ }
    }

    function captureUrl(item) {
        const p = new URLSearchParams();
        p.set("debug", "");
        p.set("room", item.room);
        p.set("phase", item.phase);
        p.set("capture", item.name);
        if (item.settle !== undefined) p.set("settle", item.settle);
        // Extra URL flags, e.g. {extra: "speed=2"}
        const extra = item.extra ? "&" + item.extra : "";
        return window.location.pathname + "?" + p.toString().replace("debug=&", "debug&") + extra;
    }

    // Records the result and moves on to the next queued capture.
    // Returns false when this capture was not part of a batch.
    function advanceCaptureQueue(result) {
        const queue = readJSON(QUEUE_KEY, null);
        if (!queue) return false;
        const results = readJSON(RESULTS_KEY, []);
        results.push({
            name: result.name,
            ok: result.ok,
            errors: result.errors.length,
            errorList: result.errors,
            warningList: result.warnings,
            error: result.error,
            state: result.state,
            fingerprint: result.fingerprint
        });
        writeJSON(RESULTS_KEY, results);
        if (queue.length === 0) {
            sessionStorage.removeItem(QUEUE_KEY);
            return false;
        }
        const next = queue.shift();
        writeJSON(QUEUE_KEY, queue);
        window.location.href = captureUrl(next);
        return true;
    }

    dbg.captureAll = function (list, settle) {
        if (list === "all" || !list) {
            list = [];
            for (const phase of Object.keys(PHASES)) {
                for (const room of Object.keys(ROOMS)) list.push({ room: +room, phase: phase });
            }
        }
        const items = list.map((it) => Object.assign({
            name: "r" + String(it.room).padStart(2, "0") + "_" + ROOMS[it.room] + "_" + it.phase,
            settle: settle
        }, it));
        // The first capture after starting from a normal page has been seen to
        // differ from later ones, so start with a throwaway run of the first item.
        // Files starting with "_" are ignored by tools/compare-snapshots.js.
        items.unshift(Object.assign({}, items[0], { name: "_warmup" }));
        writeJSON(RESULTS_KEY, []);
        const first = items.shift();
        writeJSON(QUEUE_KEY, items);
        window.location.href = captureUrl(first);
        return items.length + 1 + " captures queued";
    };

    dbg.captureStatus = function () {
        const queue = readJSON(QUEUE_KEY, null);
        const results = readJSON(RESULTS_KEY, []);
        return {
            running: !!queue,
            remaining: queue ? queue.length : 0,
            done: results.length,
            failed: results.filter((r) => !r.ok || r.errors).map((r) => ({ name: r.name, error: r.error, errors: r.errors }))
        };
    };

    // ---- capture driver ----
    // Browsers throttle timers in hidden tabs (down to once a minute after a few
    // minutes), which would stall both a polling timer and Phaser's own loop.
    // Message events aren't throttled, so in capture mode a MessageChannel pump
    // drives the game instead of Phaser's own loop. It steps frames only until the
    // scene has been created; after that it only ticks the asset loader (which
    // starts queued downloads from its update) until everything has loaded. No
    // game update runs before runCapture takes over, so nothing accumulates from a
    // variable number of real-time loading frames.
    //
    // Phaser's own loop must never tick while the pump owns the game: even one
    // stray frame between scene creation and the handover changes the result. Its
    // first frame is scheduled by TimeStep.start, so cancel that as soon as it's
    // scheduled, and ignore wake() (e.g. on tab visibility changes) until done.
    let pumpOwnsLoop = !!captureName;
    if (captureName && window.Phaser && Phaser.Core && Phaser.Core.TimeStep) {
        const proto = Phaser.Core.TimeStep.prototype;
        const origStart = proto.start;
        const origWake = proto.wake;
        proto.start = function (callback) {
            const result = origStart.call(this, callback);
            if (pumpOwnsLoop) {
                this.raf.stop();
                this.running = false;
            }
            return result;
        };
        proto.wake = function () {
            if (pumpOwnsLoop) return;
            return origWake.apply(this, arguments);
        };
        dbg.releaseLoop = function () {
            pumpOwnsLoop = false;
        };
    }
    if (captureName) {
        const channel = new MessageChannel();
        let lastStep = 0;
        channel.port1.onmessage = () => {
            const g = typeof game !== "undefined" ? game : null;
            const s = scene();
            // bootLoadHandled (main.js) turns true once every asset has loaded
            if (s && typeof bootLoadHandled !== "undefined" && bootLoadHandled) {
                runCapture(s);
                return;
            }
            if (g && g.isBooted && g.loop) {
                if (g.loop.running) g.loop.sleep();
                const now = window.performance.now();
                if (!s && now - lastStep >= 16) {
                    lastStep = now;
                    g.loop.step(now);
                } else if (s) {
                    s.load.update();
                }
            }
            channel.port2.postMessage(0);
        };
        channel.port2.postMessage(0);
        console.log("[debug] capture mode: " + captureName);
        return;
    }

    // ---- auto start: press BEGIN as soon as it exists, and hurry the intro ----
    const poll = setInterval(() => {
        if (typeof gameVars === "undefined" || typeof gameObjects === "undefined") return;
        const s = scene();
        if (!s) return;
        applySpeed();
        if (autoStart && !gameVars.gameStarted && gameObjects.startGameButton && !gameObjects.startGameButton.isDestroyed) {
            startGame(s);
            // The intro is a fixed cinematic; run it quickly unless a speed was chosen
            if (!params.has("speed")) {
                s.tweens.timeScale = 20;
                s.time.timeScale = 20;
            }
        }
        if (gameVars.gameplayBegan && !dbg.ready) {
            dbg.ready = true;
            applySpeed();
            console.log("[debug] ready", dbg.state());
        }
        if (dbg.ready) clearInterval(poll);
    }, 50);

    console.log("[debug] tools on. sandbox=" + dbg.sandbox + (startSave ? ", starting from save" : ""));
})();
