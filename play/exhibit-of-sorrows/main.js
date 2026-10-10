function testMobile() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
}
let isMobile = testMobile();
var currentResize;

// Canvas size. Must match gameVars.width/height below, which all layout is built on.
let pixelWidth = DISPLAY.width;
let pixelHeight = DISPLAY.height;
let config = {
    type: Phaser.AUTO,
    scale: {
        // No parent: there is no #phaser-app element, so Phaser was silently
        // falling back to document.body anyway. The canvas is centred by the
        // `canvas { position: absolute; ... }` rule in index.html.
        mode: Phaser.Scale.FIT,
        width: pixelWidth,
        height: pixelHeight
    },
    antialias: true,
    transparent: true,
    // Anything that failed to load is drawn as nothing, rather than Phaser's green
    // "missing texture" box
    images: {
        missing: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
let globalScene;
let gameVars = {
    bloodHandActive: false,
    hintCount: 2,
    baseSway: 0.025,
    gameStarted: false,
    gameConstructed: false,
    mousedown: false,
    mouseposx: 0,
    mouseposy: 0,
    prevMouseposx: 0,
    prevMouseposy: 0,
    mouseaccx: 0,
    mouseaccy: 0,
    lastmousedown: {
        x: 0,
        y: 0
    },
    width: DISPLAY.width,
    halfWidth: DISPLAY.width / 2,
    height: DISPLAY.height,
    halfHeight: DISPLAY.height / 2,
    horrorPoint: false,
    darkPoint: false,
    isFrozen: false,
    lastLoadingWelcomeRef: null,
    walkSlow: false,
    initialExtraDark: 0,
    masterAudio: 1,
    soundMult: 1,
    smallWindow: false
};
let oneTimeScares = {};
let gameObjectsTemp = {};
let gameVarsTemp = {
    darkFlickerCountdown: 1000,
    loadAmt: 0.001
};
let gameObjects = {
    buttonList: [],
    draggedObj: null,
    loadingWelcomes: [],
    noteList: [],
    starPressSequence: []
};
let updateFuncList = [];
let phaserGame;
let selfMe;
let game;
setTimeout(() => {
    game = new Phaser.Game(config);
}, 20);

// Asset lists live in scripts/config.js. Each entry is [key, path].
let earlyAudio = Object.entries(AUDIO);
let deferredAudio = Object.entries(DEFERRED_AUDIO);
let deferredSpriteSheets = Object.entries(DEFERRED_SPRITE_SHEETS);
let deferredImages = Object.entries(DEFERRED_IMAGES);
let deferredAudioLoaded = false;

// True once the deferred batch above has finished loading (loadDeferredAudio),
// including any assets that failed and were given stand-ins. A save restores
// before that, so anything restore can trigger that needs them should wait with
// whenDeferredAssetsReady.
let deferredAssetsReady = false;
let deferredReadyCallbacks = [];
// Nothing in the story may wait on an asset forever: past this, the waiting
// effect is skipped (onTimeout) instead.
const DEFERRED_WAIT_TIMEOUT = 10000;
function whenDeferredAssetsReady(callback, onTimeout, timeoutMs = DEFERRED_WAIT_TIMEOUT) {
    if (deferredAssetsReady) {
        callback();
        return;
    }
    const entry = {
        callback: callback,
        settled: false
    };
    deferredReadyCallbacks.push(entry);
    gameDelay(() => {
        if (entry.settled) return;
        entry.settled = true;
        deferredReadyCallbacks = deferredReadyCallbacks.filter((e) => e !== entry);
        if (onTimeout) onTimeout();
    }, timeoutMs);
}
function flushDeferredReadyCallbacks() {
    let entries = deferredReadyCallbacks;
    deferredReadyCallbacks = [];
    for (let i = 0; i < entries.length; i++) {
        if (entries[i].settled) continue;
        entries[i].settled = true;
        entries[i].callback();
    }
}
const MAX_ASSET_RETRIES = 3;
let assetRetry = {
    installed: false,
    counts: {},
    // request key -> attempts already made
    failedReqs: {},
    // request key -> descriptor, so the retry button can re-queue
    pending: 0,
    // retries scheduled but not yet back through the loader
    onPermanentFailure: null,
    scene: null
};

// Everything the game loads is a single image or audio file, so the file that
// failed is exactly the request to repeat.
function getAssetRequest(file) {
    return {
        key: file.key,
        type: file.type,
        url: file.url
    };
}
function requeueAsset(scene, req) {
    switch (req.type) {
        case "audio":
            scene.load.audio(req.key, req.url);
            return true;
        case "image":
            scene.load.image(req.key, req.url);
            return true;
    }
    console.warn(`[AssetLoader] no retry rule for type "${req.type}" (${req.key})`);
    return false;
}
function markAssetPermanentlyFailed(req) {
    console.error(`[AssetLoader] permanently failed "${req.key}" (${req.url}) after ${MAX_ASSET_RETRIES} retries`);
    assetRetry.failedReqs[req.key] = req;
    // After boot, a sheet with some frames missing is built with blank stand-ins
    // (scripts/spritesheets.js). During boot the loading screen's retry button
    // gets another go at the frame first.
    if (bootLoadHandled && isSpriteFrameImageKey(req.key) && assetRetry.scene) {
        onSpriteFramePermanentlyFailed(assetRetry.scene, req.key);
    }
    if (assetRetry.onPermanentFailure) {
        assetRetry.onPermanentFailure(req);
    }
}
function assetRetryScheduleRequeue(scene, req, delay) {
    setTimeout(() => {
        // load.start() is ignored while a batch is in flight, which would leave the
        // re-added file sitting in the queue forever. Wait for the loader to idle.
        if (scene.load.isLoading()) {
            assetRetryScheduleRequeue(scene, req, 250);
            return;
        }
        assetRetry.pending--;
        if (requeueAsset(scene, req)) {
            scene.load.start();
        } else {
            markAssetPermanentlyFailed(req);
        }
    }, delay);
}
function setupLoaderRetryHandlers(scene, onPermanentFailure) {
    assetRetry.scene = scene;
    if (onPermanentFailure) {
        assetRetry.onPermanentFailure = onPermanentFailure;
    }
    // The loader's emitter lives on the scene and outlives each batch. Installing
    // twice (preload + the deferred batch) would run both handlers per failure:
    // double-counting attempts and queueing every failed file twice.
    if (assetRetry.installed) {
        return;
    }
    assetRetry.installed = true;
    // "loaderror" is the real event name - there is no "filefailed" in Phaser.
    scene.load.on("loaderror", (file) => {
        let req = getAssetRequest(file);
        let attempts = (assetRetry.counts[req.key] || 0) + 1;
        assetRetry.counts[req.key] = attempts;
        if (attempts <= MAX_ASSET_RETRIES) {
            console.warn(`[AssetLoader] retrying "${req.key}" (${req.url}) - attempt ${attempts}/${MAX_ASSET_RETRIES}`);
            // Counted from the moment of failure so that a "complete" landing
            // during the backoff is never mistaken for a successful load.
            assetRetry.pending++;
            assetRetryScheduleRequeue(scene, req, Math.min(1000 * attempts, 3000));
        } else {
            markAssetPermanentlyFailed(req);
        }
    });
}
function assetLoadHasFailures() {
    for (let key in assetRetry.failedReqs) {
        return true;
    }
    return false;
}

// A destroyed Phaser GameObject is still a live reference, so a truthiness check
// is not enough - setText() on one throws inside the texture update.
function setLoadingTextSafe(text) {
    let t = gameObjectsTemp.loadingText;
    if (t && t.scene) {
        t.setText(text);
    }
}
function hideLoadingFailureUI() {
    if (gameObjectsTemp.loadingFailureText) {
        gameObjectsTemp.loadingFailureText.destroy();
        gameObjectsTemp.loadingFailureText = null;
    }
    if (gameObjectsTemp.retryBtn) {
        gameObjectsTemp.retryBtn.destroy();
        gameObjectsTemp.retryBtn = null;
    }
}
function showLoadingFailureUI(scene) {
    if (gameObjectsTemp.loadingFailureText) return;
    setLoadingTextSafe(THEME.loadFailedText);
    gameObjectsTemp.loadingFailureText = scene.add
        .text(gameVars.halfWidth, gameVars.height - 210, THEME.loadFailedHint, {
            fontFamily: THEME.font,
            fontSize: 20,
            color: "#ff9999",
            align: "center"
        })
        .setOrigin(0.5)
        .setDepth(10);
    gameObjectsTemp.retryBtn = scene.add
        .text(gameVars.halfWidth, gameVars.height - 160, THEME.retryButtonText, {
            fontFamily: THEME.font,
            fontSize: 26,
            color: "#ffffff",
            align: "center"
        })
        .setOrigin(0.5)
        .setDepth(10)
        .setInteractive({
            useHandCursor: true
        });
    gameObjects.loadingCntr.add(gameObjectsTemp.loadingFailureText);
    gameObjects.loadingCntr.add(gameObjectsTemp.retryBtn);
    gameObjectsTemp.retryBtn.on("pointerdown", () => {
        retryBootAssets(scene);
    });
}
function retryBootAssets(scene) {
    hideLoadingFailureUI();
    setLoadingTextSafe(THEME.retryingText);
    // Re-queue the recorded failures. Clearing the bookkeeping and calling
    // start() on its own runs the loader on an empty queue, which completes
    // instantly and boots the game with the assets still missing.
    let reqs = [];
    for (let key in assetRetry.failedReqs) reqs.push(assetRetry.failedReqs[key]);
    assetRetry.counts = {};
    assetRetry.failedReqs = {};
    let queued = 0;
    for (let i = 0; i < reqs.length; i++) {
        if (requeueAsset(scene, reqs[i])) queued++;
    }
    if (queued === 0) {
        // Nothing could be re-issued; keep the failure on screen rather than
        // letting an empty batch report success.
        for (let i = 0; i < reqs.length; i++) assetRetry.failedReqs[reqs[i].key] = reqs[i];
        showLoadingFailureUI(scene);
        return;
    }
    scene.load.start();
}

// Back online: retry straight away instead of waiting for the player or a timer
window.addEventListener("online", () => {
    if (!globalScene || !globalScene.load) return;
    if (gameObjectsTemp.retryBtn) {
        retryBootAssets(globalScene);
    } else if (bootLoadHandled && assetLoadHasFailures()) {
        backgroundRetry.attempt = 0;
        runBackgroundRetry(globalScene);
    }
});
let bootLoadHandled = false;
function onLoaderBatchComplete(a) {
    // Each retry runs the loader again, so "complete" fires several times. Only
    // the pass with nothing outstanding decides whether boot succeeded.
    if (assetRetry.pending > 0) {
        return;
    }
    if (assetLoadHasFailures()) {
        if (!gameVars.gameStarted) showLoadingFailureUI(a);
        return;
    }
    if (bootLoadHandled) {
        return;
    }
    bootLoadHandled = true;
    hideLoadingFailureUI();
    onLoadComplete(a);
}
function preload() {
    let gameDiv = document.getElementById("preload-notice");
    if (gameDiv) gameDiv.innerHTML = "";
    handleBorders();
    phaserGame = this;
    selfMe = this;
    gameObjects.exhibCntr = makeSwayContainer(this);
    gameObjects.shadowCntr = this.add.container(0, 0);
    gameObjects.portraitCntr = this.add.container(0, 0);
    gameObjects.btnCntr = this.add.container(0, 0);
    gameObjects.hueCntr = this.add.container(0, 0);
    gameObjects.mainDarkCntr = this.add.container(0, 0);
    gameObjects.topBtnCntr = this.add.container(0, 0);
    gameObjects.loadingCntr = makeSwayContainer(this);
    gameObjects.loadingCntr.shakeAccX = 0;
    gameObjects.loadingCntr.shakeAccY = 0;
    for (let key in PRELOAD_IMAGES) {
        this.load.image(key, PRELOAD_IMAGES[key]);
    }
}

// Container that drifts with the mouse and sways (see handleViewShift)
function makeSwayContainer(scene) {
    let cntr = scene.add.container(0, 0);
    cntr.goalOffsetX = 0;
    cntr.goalOffsetY = 0;
    cntr.offsetX = 0;
    cntr.offsetY = 0;
    cntr.offsetAccX = 0;
    cntr.offsetAccY = 0;
    cntr.swayX = 0;
    cntr.swayY = 0;
    cntr.swayAccX = 0;
    cntr.swayAccY = 0;
    cntr.swayAmt = 0;
    return cntr;
}
function create() {
    // Push the saved mute state into Phaser now that phaserGame.sound exists, or
    // a muted player would still hear the direct .play() calls that bypass playSound().
    applyMuteState();
    onPreloadComplete(this);
}
function addLoadingText(scene, x, y, text, fontSize, color = "#ffffff") {
    let t = scene.add.text(x, y, text, {
        fontFamily: THEME.font,
        fontSize: fontSize,
        color: color,
        align: "center"
    });
    t.setOrigin(0.5, 0.5);
    t.setDepth(1);
    return t;
}
function onPreloadComplete(scene) {
    setupHand(scene);
    globalScene = scene;
    gameObjectsTemp.loadingBg = scene.add.image(gameVars.halfWidth, gameVars.halfHeight, "blackPixel");
    gameObjectsTemp.loadingBg.scaleX = 1000;
    gameObjectsTemp.loadingBg.scaleY = 1000;
    gameObjects.loadingCntr.add(gameObjectsTemp.loadingBg);
    gameObjectsTemp.loadingText = addLoadingText(
        scene,
        gameVars.halfWidth,
        gameVars.halfHeight + 155,
        THEME.loadingText,
        38
    );
    gameObjectsTemp.loadingBarBacking = scene.add.image(gameVars.halfWidth, gameVars.height - 260, "whitePixel");
    gameObjectsTemp.loadingBarBacking.alpha = 0.25;
    gameObjectsTemp.loadingBarBacking.scaleY = 4;
    gameObjectsTemp.loadingBarBacking.scaleX = 200;
    gameObjectsTemp.loadingBarBacking.setDepth(1);
    gameObjectsTemp.loadingBar = scene.add.image(gameVars.halfWidth, gameVars.height - 260, "whitePixel");
    gameObjectsTemp.loadingBar.scaleY = 4;
    gameObjectsTemp.loadingBar.setDepth(1);
    gameObjectsTemp.warningText = addLoadingText(
        scene,
        gameVars.halfWidth,
        gameVars.height - 188,
        THEME.warningText,
        22
    );
    gameObjectsTemp.exhibitText = addLoadingText(scene, gameVars.halfWidth, 140, THEME.title, 36, "#777777");
    gameObjectsTemp.popup = scene.add.image(gameVars.halfWidth, gameVars.halfHeight + 1, "popup");
    gameObjectsTemp.funbox = scene.add.image(gameVars.halfWidth, gameVars.halfHeight - 25, "funbox");
    gameObjectsTemp.funlid = scene.add.image(gameVars.halfWidth + 95, gameVars.halfHeight - 90, "funlid");
    gameObjectsTemp.headphones = scene.add.image(gameVars.halfWidth, gameVars.height - 135, "headphones");
    gameObjectsTemp.headphoneText = addLoadingText(
        scene,
        gameVars.halfWidth,
        gameVars.height - 85,
        THEME.headphoneText,
        22
    );
    setupLoaderRetryHandlers(scene, () => {
        if (!gameVars.gameStarted) {
            showLoadingFailureUI(scene);
        }
    });
    scene.load.on("progress", function (amt) {
        gameVarsTemp.loadAmt = amt;
    });
    scene.load.on("complete", () => {
        onLoaderBatchComplete(scene);
    });
    for (let key in SPRITE_SHEETS) {
        loadSpriteSheet(scene, key, SPRITE_SHEETS[key]);
    }
    for (let key in IMAGES) {
        scene.load.image(key, IMAGES[key]);
    }
    for (let key in AUDIO) {
        scene.load.audio(key, AUDIO[key]);
    }
    scene.load.start();
}
function onLoadComplete(scene) {
    if (deferredAudioLoaded) {
        return;
    }
    const currentHref = document.location.href;
    const isValidDomain = SITE_LOCK.allowed.some((site) => currentHref.includes(site));
    if (!isValidDomain) {
        // Stops execution of rest of game
        let gameDiv = document.getElementById("preload-notice");
        let invalidSite = currentHref.substring(0, 25);
        if (gameDiv) gameDiv.innerText = invalidSite + "...\n" + SITE_LOCK.message;
        return;
    }
    gameObjectsTemp.popup.alpha = 1;
    gameObjectsTemp.popup.rotation = 0.01;
    scene.tweens.add({
        targets: gameObjectsTemp.popup,
        y: gameVars.halfHeight + 25,
        ease: "Cubic.easeOut",
        duration: 150,
        onComplete: () => {
            gameObjectsTemp.popup.destroy();
        }
    });
    scene.tweens.chain({
        targets: [gameObjectsTemp.loadingText, gameObjectsTemp.funlid, gameObjectsTemp.funbox],
        tweens: [
            {
                delay: 100,
                alpha: 0,
                duration: 150
            }
        ],
        onComplete() {
            gameObjectsTemp.loadingText.destroy();
            gameObjectsTemp.funlid.destroy();
            gameObjectsTemp.funbox.destroy();
        }
    });
    gameObjectsTemp.brightLight = scene.add.image(
        gameVars.halfWidth,
        gameVars.halfHeight - 50,
        "loadingSS",
        "bright_light"
    );
    gameObjectsTemp.brightLight.scaleX = 1;
    gameObjectsTemp.brightLight.scaleY = 1;
    gameObjectsTemp.brightLight.alpha = 0;
    gameObjects.loadingCntr.add(gameObjectsTemp.brightLight);
    gameObjectsTemp.loadingWelcome = makeWelcomeImage("loading_welcome");
    gameObjects.loadingCntr.add(gameObjectsTemp.loadingWelcome);
    gameObjectsTemp.loadingWelcome.rotation = 0;
    gameObjectsTemp.loadingWelcome.alpha = 0;
    gameObjectsTemp.loadingWelcome.scaleX = 0.8;
    gameObjectsTemp.loadingWelcome.scaleY = 0.8;
    scene.tweens.chain({
        targets: [gameObjectsTemp.loadingWelcome],
        tweens: [
            {
                alpha: 0.01,
                duration: 1,
                onComplete() {
                    gameObjects.startGameButton = new Button(
                        scene,
                        gameObjects.loadingCntr,
                        () => {
                            startGame(scene);
                        },
                        {
                            ref: "transparent_pixel",
                            atlas: "loadingSS",
                            x: gameVars.halfWidth,
                            y: gameVars.halfHeight - 60,
                            scaleX: 240,
                            scaleY: 160
                        }
                    );
                    if (typeof maybeShowSaveWipeUI === "function") maybeShowSaveWipeUI(scene);
                }
            },
            {
                alpha: 1,
                duration: 400
            }
        ]
    });
}
function loadDeferredAudio(scene) {
    if (deferredAudioLoaded) {
        return;
    }
    deferredAudioLoaded = true;
    deferredSetupDone = {};
    setupLoaderRetryHandlers(scene);
    for (let d = 0; d < deferredAudio.length; d++) scene.load.audio(deferredAudio[d][0], deferredAudio[d][1]);
    for (let t = 0; t < deferredSpriteSheets.length; t++)
        loadSpriteSheet(scene, deferredSpriteSheets[t][0], deferredSpriteSheets[t][1]);
    for (let i = 0; i < deferredImages.length; i++) scene.load.image(deferredImages[i][0], deferredImages[i][1]);
    let onDeferredComplete = () => {
        // A retry re-runs the loader; wait for the pass that follows it, or the
        // assets being retried would be written off as failed here.
        if (assetRetry.pending > 0) {
            scene.load.once("complete", onDeferredComplete);
            return;
        }
        finishDeferredAssets(scene);
        deferredAssetsReady = true;
        flushDeferredReadyCallbacks();
        // Anything still missing keeps being retried quietly in the background
        if (assetLoadHasFailures()) scheduleBackgroundRetry(scene);
    };
    scene.load.once("complete", onDeferredComplete);
    scene.load.start();
}

// Which one-time setups (below) have run with their real assets this session.
// Cleared when the deferred batch starts again (replay rebuilds the scene).
let deferredSetupDone = {};

// Puts whatever deferred assets have arrived to use. Safe to run again: after a
// background retry it upgrades stand-ins to the real assets that just arrived.
function finishDeferredAssets(scene) {
    for (let d = 0; d < deferredAudio.length; d++) {
        let key = deferredAudio[d][0];
        let current = gameObjects.sounds[key];
        if (scene.cache.audio.exists(key)) {
            if (!current || current.isStandIn) gameObjects.sounds[key] = scene.sound.add(key);
        } else if (!current) {
            console.warn("loadDeferredAudio: audio failed to load, using silence: " + key);
            gameObjects.sounds[key] = makeSilentSound(key);
        }
    }
    for (let i = 0; i < deferredImages.length; i++) {
        let key = deferredImages[i][0];
        if (!scene.textures.exists(key) && !deferredSetupDone["warned:" + key]) {
            // Drawn as nothing (config.images.missing) until a retry brings it in
            deferredSetupDone["warned:" + key] = true;
            console.warn("loadDeferredAudio: image failed to load, drawing nothing: " + key);
        }
    }
    // These were built during setupGame, before the sheets above existed, so they
    // are rebuilt now that the sheets are here. Sheets that failed entirely are
    // skipped until a background retry brings them in.
    runDeferredSetup(scene, "flashScreens", initFlashScreens);
    if (!deferredSetupDone.staticScreens && scene.textures.exists("staticScreens") && scene.textures.exists("staticLite")) {
        deferredSetupDone.staticScreens = true;
        initStaticScreens();
    }
    runDeferredSetup(scene, "roomClown2", refreshCrawlClown);
}
function runDeferredSetup(scene, textureKey, setup) {
    if (deferredSetupDone[textureKey] || !scene.textures.exists(textureKey)) return;
    deferredSetupDone[textureKey] = true;
    setup();
}

// Stands in for a sound that failed to load: every call is accepted and nothing
// plays. It never fires "complete", so nothing may wait on one (nothing does).
function makeSilentSound(key) {
    return {
        key: key,
        isStandIn: true,
        isPlaying: false,
        isPaused: false,
        volume: 1,
        mute: false,
        loop: false,
        duration: 0,
        play() {
            return false;
        },
        stop() {
            return false;
        },
        pause() {
            return false;
        },
        resume() {
            return false;
        },
        setVolume(v) {
            this.volume = v;
            return this;
        },
        setMute(m) {
            this.mute = m;
            return this;
        },
        setLoop(l) {
            this.loop = l;
            return this;
        },
        setRate() {
            return this;
        },
        setDetune() {
            return this;
        },
        setSeek() {
            return this;
        },
        on() {
            return this;
        },
        once() {
            return this;
        },
        off() {
            return this;
        },
        destroy() {}
    };
}

// ---- Background retries for deferred assets ----
// The loader already retries each file a few times within seconds. Whatever is
// still missing after that is retried here, spaced further apart, and at once
// when the browser reports it is back online. Only when these run out is the
// player told, with a small non-blocking notice that has its own Retry.
const BACKGROUND_RETRY_DELAYS = [5000, 15000, 30000, 60000, 120000];
let backgroundRetry = {
    attempt: 0,
    timer: null
};
function scheduleBackgroundRetry(scene) {
    if (backgroundRetry.timer) return;
    if (backgroundRetry.attempt >= BACKGROUND_RETRY_DELAYS.length) {
        showAssetFailureNotice(scene);
        return;
    }
    let delay = BACKGROUND_RETRY_DELAYS[backgroundRetry.attempt];
    backgroundRetry.timer = setTimeout(() => {
        backgroundRetry.timer = null;
        runBackgroundRetry(scene);
    }, delay);
}
function runBackgroundRetry(scene) {
    if (backgroundRetry.timer) {
        clearTimeout(backgroundRetry.timer);
        backgroundRetry.timer = null;
    }
    // The scene is gone (replay); the new run loads everything again anyway
    if (!scene.sys || !scene.sys.isActive()) return;
    if (scene.load.isLoading()) {
        backgroundRetry.timer = setTimeout(() => {
            backgroundRetry.timer = null;
            runBackgroundRetry(scene);
        }, 500);
        return;
    }
    // Sheets that failed entirely are reloaded whole; single frames of sheets that
    // were built with blank stand-ins stay blank until the page is reloaded.
    let reqs = [];
    for (let key in assetRetry.failedReqs) {
        if (!isSpriteFrameImageKey(key)) reqs.push(assetRetry.failedReqs[key]);
        delete assetRetry.failedReqs[key];
    }
    let queued = retryFailedSpriteSheets(scene);
    for (let i = 0; i < reqs.length; i++) {
        // One attempt each: the loader's quick retries were already used up
        assetRetry.counts[reqs[i].key] = MAX_ASSET_RETRIES;
        if (requeueAsset(scene, reqs[i])) queued++;
    }
    if (queued === 0) {
        hideAssetFailureNotice();
        return;
    }
    backgroundRetry.attempt++;
    console.log("[AssetLoader] background retry " + backgroundRetry.attempt + ": " + queued + " asset(s)");
    let onDone = () => {
        if (assetRetry.pending > 0) {
            scene.load.once("complete", onDone);
            return;
        }
        finishDeferredAssets(scene);
        if (assetLoadHasFailures()) {
            scheduleBackgroundRetry(scene);
        } else {
            console.log("[AssetLoader] all assets recovered");
            backgroundRetry.attempt = 0;
            hideAssetFailureNotice();
        }
    };
    scene.load.once("complete", onDone);
    scene.load.start();
}

// Small corner notice, shown only after the background retries run out
function showAssetFailureNotice(scene) {
    if (gameObjectsTemp.assetFailureNotice) return;
    let style = {
        fontFamily: THEME.font,
        fontSize: 18,
        color: "#ffdddd",
        backgroundColor: "#000000aa",
        padding: {
            x: 8,
            y: 4
        }
    };
    let text = scene.add.text(14, 14, THEME.assetsMissingText, style).setScrollFactor(0).setDepth(1001);
    let retry = scene.add
        .text(text.x + text.width + 6, 14, THEME.assetsRetryText, Object.assign({}, style, { color: "#ffffff" }))
        .setScrollFactor(0)
        .setDepth(1001)
        .setInteractive({
            useHandCursor: true
        });
    retry.on("pointerdown", () => {
        hideAssetFailureNotice();
        backgroundRetry.attempt = 0;
        runBackgroundRetry(scene);
    });
    gameObjectsTemp.assetFailureNotice = [text, retry];
}
function hideAssetFailureNotice() {
    let notice = gameObjectsTemp.assetFailureNotice;
    if (!notice) return;
    notice.forEach((o) => o.destroy());
    gameObjectsTemp.assetFailureNotice = null;
}
function onLoadAnimComplete(scene) {
    scene.tweens.chain({
        targets: [gameObjectsTemp.loadingBar, gameObjectsTemp.loadingBarBacking],
        tweens: [
            {
                offset: 0,
                scaleY: 0,
                ease: "Cubic.easeOut",
                duration: 600
            },
            {
                offset: 0,
                alpha: 0,
                scaleX: 800,
                duration: 600,
                onComplete() {
                    gameObjectsTemp.loadingBar.destroy();
                    gameObjectsTemp.loadingBarBacking.destroy();
                }
            }
        ]
    });
    scene.tweens.chain({
        targets: [
            gameObjectsTemp.headphones,
            gameObjectsTemp.headphoneText,
            gameObjectsTemp.warningText,
            gameObjectsTemp.exhibitText
        ],
        tweens: [
            {
                alpha: 0.5,
                duration: 250
            }
        ]
    });
}
function startGame(a) {
    if (typeof destroySaveWipeUI === "function") destroySaveWipeUI();
    gameVars.gameplayBegan = false;
    gameObjects.loadingMusic = a.sound.add("loadingMusic");
    gameObjects.loadingMusic.play();
    gameObjects.startGameButton.destroy();
    gameVars.gameStarted = true;
    gameObjects.scene = a;
    setupGame(a);
    gameObjectsTemp.blackTeeth = a.add.image(gameVars.halfWidth, gameVars.halfHeight - 50, "menu", "teethBlack");
    gameObjectsTemp.blackTeeth.scaleX = 1.6;
    gameObjectsTemp.blackTeeth.scaleY = 1.6;
    gameObjectsTemp.blackTeethAnim = a.tweens.chain({
        targets: [gameObjectsTemp.blackTeeth],
        tweens: [
            {
                scaleX: 1.45,
                scaleY: 1.45,
                ease: "Quad.easeIn",
                duration: 3000
            }
        ]
    });
    a.tweens.chain({
        targets: [
            gameObjectsTemp.headphones,
            gameObjectsTemp.headphoneText,
            gameObjectsTemp.warningText,
            gameObjectsTemp.exhibitText
        ],
        tweens: [
            {
                alpha: 0,
                duration: 260,
                onComplete() {
                    gameObjectsTemp.headphones.destroy();
                    gameObjectsTemp.headphoneText.destroy();
                    gameObjectsTemp.warningText.destroy();
                    gameObjectsTemp.exhibitText.destroy();
                }
            }
        ]
    });
    gameObjects.clickBlocker = new Button(
        a,
        gameObjects.loadingCntr,
        () => {
            // Do nothing, block clicks until the starting intro anim is done.
            console.log("Blocked");
        },
        {
            ref: "transparent_pixel",
            atlas: "loadingSS",
            x: gameVars.halfWidth,
            y: gameVars.halfHeight,
            scaleX: 2000,
            scaleY: 2000
        }
    );
    a.tweens.chain({
        targets: [gameObjectsTemp.brightLight],
        tweens: [
            {
                alpha: 1.2,
                scaleX: 3,
                scaleY: 3,
                duration: 2500,
                ease: "Quad.easeOut"
            }
        ]
    });
    a.tweens.chain({
        targets: [gameObjectsTemp.loadingWelcome],
        tweens: [
            {
                rotation: 0.01,
                scaleX: 1.14,
                scaleY: 1.14,
                duration: 2500,
                ease: "Quad.easeIn"
            }
        ]
    });
    gameObjectsTemp.circleLoading = [];
    a.tweens.chain({
        targets: [gameObjectsTemp.loadingWelcome],
        tweens: [
            {
                alpha: 0.999,
                duration: 800
            },
            {
                alpha: 0,
                duration: 10,
                onStart() {
                    makeWelcomeImage("loading_welcome_x1", true);
                    addToUpdateFuncList(updateWelcomeFollower);
                }
            },
            {
                alpha: 0.001,
                duration: 10,
                onStart() {
                    makeWelcomeImage("loading_welcome_x2", true);
                }
            },
            {
                alpha: 0.001,
                duration: 400,
                onStart() {
                    let b = a.add.image(gameVars.halfWidth, gameVars.halfHeight - 50 - 105, "loadingSS", "circle");
                    gameObjectsTemp.circleLoading.push(b);
                    gameObjects.loadingCntr.add(b);
                    a.tweens.add({
                        targets: b,
                        y: gameVars.halfHeight - 50 - 165,
                        duration: 1500
                    });
                    makeWelcomeImage("loading_welcome_x3", true);
                }
            },
            {
                alpha: 0.001,
                duration: 10,
                onStart() {
                    makeWelcomeImage("loading_welcome_x4", true);
                }
            },
            {
                alpha: 0.001,
                duration: 350,
                onStart() {
                    let b = a.add.image(gameVars.halfWidth + 155, gameVars.halfHeight - 50 + 70, "loadingSS", "circle");
                    gameObjectsTemp.circleLoading.push(b);
                    gameObjects.loadingCntr.add(b);
                    a.tweens.add({
                        targets: b,
                        x: gameVars.halfWidth + 250,
                        y: gameVars.halfHeight - 50 + 110,
                        duration: 1300
                    });
                    makeWelcomeImage("loading_welcome_x5", true);
                }
            },
            {
                alpha: 0.001,
                duration: 10,
                onStart() {
                    makeWelcomeImage("loading_welcome_x6", true);
                }
            },
            {
                alpha: 0.001,
                duration: 300,
                onStart() {
                    let b = a.add.image(gameVars.halfWidth - 190, gameVars.halfHeight - 50 - 75, "loadingSS", "circle");
                    gameObjectsTemp.circleLoading.push(b);
                    gameObjects.loadingCntr.add(b);
                    a.tweens.add({
                        targets: b,
                        x: gameVars.halfWidth - 250,
                        y: gameVars.halfHeight - 50 - 100,
                        duration: 1000
                    });
                    makeWelcomeImage("loading_welcome_x7", true);
                }
            },
            {
                alpha: 0.001,
                duration: 10,
                onStart() {
                    makeWelcomeImage("loading_welcome_x8", true);
                }
            },
            {
                alpha: 0.001,
                duration: 200,
                onStart() {
                    let b = a.add.image(gameVars.halfWidth, gameVars.halfHeight - 50 + 135, "loadingSS", "circle");
                    gameObjectsTemp.circleLoading.push(b);
                    gameObjects.loadingCntr.add(b);
                    a.tweens.add({
                        targets: b,
                        y: gameVars.halfHeight - 50 + 185,
                        duration: 700
                    });
                    makeWelcomeImage("loading_welcome_x9", true);
                }
            },
            {
                alpha: 0.001,
                duration: 10,
                onStart() {
                    makeWelcomeImage("loading_welcome_x10", true);
                }
            },
            {
                alpha: 0.001,
                duration: 150,
                onStart() {
                    let b = a.add.image(
                        gameVars.halfWidth + 250,
                        gameVars.halfHeight - 50 - 100,
                        "loadingSS",
                        "circle"
                    );
                    gameObjectsTemp.circleLoading.push(b);
                    gameObjects.loadingCntr.add(b);
                    makeWelcomeImage("loading_welcome_x11", true);
                }
            },
            {
                alpha: 0.001,
                duration: 10,
                onStart() {
                    makeWelcomeImage("loading_welcome_x12", true);
                }
            },
            {
                alpha: 0.001,
                duration: 500,
                onStart() {
                    let b = a.add.image(
                        gameVars.halfWidth - 250,
                        gameVars.halfHeight - 50 + 110,
                        "loadingSS",
                        "circle"
                    );
                    gameObjectsTemp.circleLoading.push(b);
                    gameObjects.loadingCntr.add(b);
                    makeWelcomeImage("loading_welcome_x13", true);
                },
                onComplete() {
                    beginGameplay(a);
                    gameObjects.clickBlocker.destroy();
                }
            }
        ]
    });
}
function beginGameplay(scene) {
    if (gameVars.gameplayBegan) {
        return;
    }
    gameVars.gameplayBegan = true;
    loadDeferredAudio(scene);
    if (typeof logCurrentGameMode === "function") logCurrentGameMode("Game started");
    let background = document.getElementById("background");
    background.style.opacity = "1";
    let leftborder = document.getElementById("leftborder");
    leftborder.style.opacity = "1";
    let rightborder = document.getElementById("rightborder");
    rightborder.style.opacity = "1";
    let topborder = document.getElementById("topborder");
    if (topborder) topborder.style.opacity = "1";
    let bottomborder = document.getElementById("bottomborder");
    if (bottomborder) bottomborder.style.opacity = "1";
    gameObjects.topBtnCntr.setScrollFactor(0);
    gameObjects.topBtnCntr.setDepth(1000);

    // Hints Button (Left of Mute Button, Top Right)
    gameObjects.hintButton = new Button(
        scene,
        gameObjects.topBtnCntr,
        onHintButtonPressed,
        {
            atlas: "buttons",
            ref: "hint_normal",
            x: gameVars.width - 140,
            y: 51,
            alpha: 0.94
        },
        {
            atlas: "buttons",
            ref: "hint_hover",
            alpha: 1
        },
        {
            atlas: "buttons",
            ref: "hint_hover",
            alpha: 0.65
        },
        {
            atlas: "buttons",
            ref: "hint_normal",
            alpha: 0.3
        }
    );
    gameObjects.hintButton.setScrollFactor(0);
    gameObjects.hintButton.setDepth(1000);

    // Hint count badge (circle icon + text at bottom right of hint button)
    gameObjects.hintCountCircle = scene.add.image(gameVars.width - 140 + 25, 51 + 25, "buttons", "circle");
    gameObjects.hintCountCircle.setScrollFactor(0);
    gameObjects.hintCountCircle.setDepth(1002);
    gameObjects.hintCountCircle.setScale(0.56);
    gameObjects.topBtnCntr.add(gameObjects.hintCountCircle);
    gameObjects.hintCountText = scene.add.text(
        gameVars.width - 140 + 25,
        51 + 25,
        gameVars && gameVars.hintCount > 0 ? String(gameVars.hintCount) : "▷",
        {
            fontFamily: "Arial",
            fontSize: "32px",
            fontStyle: "bold",
            color: "#ffffff",
            align: "center"
        }
    );
    gameObjects.hintCountText.setOrigin(0.5, 0.5);
    gameObjects.hintCountText.setScrollFactor(0);
    gameObjects.hintCountText.setDepth(1003);
    gameObjects.hintCountText.setScale(0.56);
    gameObjects.topBtnCntr.add(gameObjects.hintCountText);
    gameObjects.hintButton.setOnHoverFunc(() => {
        if (typeof gameVars !== "undefined" && gameVars.hintCount === 0 && globalScene && globalScene.tweens) {
            globalScene.tweens.killTweensOf([gameObjects.hintCountCircle, gameObjects.hintCountText]);
            globalScene.tweens.add({
                targets: [gameObjects.hintCountCircle, gameObjects.hintCountText],
                scaleX: 1,
                scaleY: 1,
                duration: 350,
                ease: "Bounce.easeOut"
            });
        }
    });
    gameObjects.hintButton.setOnHoverOutFunc(() => {
        if (globalScene && globalScene.tweens && gameObjects.hintCountCircle && gameObjects.hintCountText) {
            globalScene.tweens.killTweensOf([gameObjects.hintCountCircle, gameObjects.hintCountText]);
            globalScene.tweens.add({
                targets: [gameObjects.hintCountCircle, gameObjects.hintCountText],
                scaleX: 0.56,
                scaleY: 0.56,
                duration: 200,
                ease: "Cubic.easeOut"
            });
        }
    });

    // Sound Mute Button (Top Right)
    gameObjects.muteButton = new Button(
        scene,
        gameObjects.topBtnCntr,
        () => {
            gameVars.manualMuted = !gameVars.manualMuted;
            let suffix = gameVars.darkPoint ? "2" : "";
            if (gameVars.manualMuted) {
                gameObjects.muteButton.setNormalRef("sfx_muted_normal" + suffix);
                gameObjects.muteButton.setHoverRef("sfx_muted_hover" + suffix);
                gameObjects.muteButton.setPressRef("sfx_muted_hover" + suffix);
            } else {
                gameObjects.muteButton.setNormalRef("sfx_normal" + suffix);
                gameObjects.muteButton.setHoverRef("sfx_hover" + suffix);
                gameObjects.muteButton.setPressRef("sfx_hover" + suffix);
            }

            // Phaser's global mute silences everything in one place - including the
            // ambient loops started with a direct .play(), which playSound() never
            // sees. Nothing here touches individual sound volumes: zeroing them on
            // mute meant only the four tracks someone remembered to hardcode came
            // back on unmute, and it overwrote whatever mix the current room had
            // faded to. Leaving them alone means the mix is simply still correct
            // when the sound comes back, and in-flight fades keep running silently
            // rather than being frozen part-way.
            applyMuteState();
        },
        {
            atlas: "buttons",
            ref: gameVars.manualMuted ? "sfx_muted_normal" : "sfx_normal",
            x: gameVars.width - 58,
            y: 51,
            alpha: 0.94
        },
        {
            atlas: "buttons",
            ref: gameVars.manualMuted ? "sfx_muted_hover" : "sfx_hover",
            alpha: 1
        },
        {
            atlas: "buttons",
            ref: gameVars.manualMuted ? "sfx_muted_hover" : "sfx_hover",
            alpha: 0.65
        }
    );
    gameObjects.muteButton.setScrollFactor(0);
    gameObjects.muteButton.setDepth(1000);
    for (let b in (removeFromUpdateFuncList(updateWelcomeFollower),
    gameObjects.loadingMusic.stop(),
    (gameVars.gameConstructed = true),
    gameObjects.loadingWelcomes))
        gameObjects.loadingWelcomes[b].destroy();
    for (let a = 0; a < gameObjectsTemp.circleLoading.length; a++) gameObjectsTemp.circleLoading[a].destroy();
    gameObjectsTemp.brightLight.destroy();
    gameObjects.clickBlocker.destroy();
    gameObjectsTemp.loadingBg.destroy();
    gameObjectsTemp.blackTeeth.destroy();
    gameObjectsTemp.blackTeethAnim.destroy();
    gameDelay(() => {
        // Skipped when loading straight into the horror phase: the music box is
        // silenced on restore (silenceMusicBox) and gladiatorx is the track that
        // plays by then. This callback is deferred, so without the guard it
        // would restart gladiator0 after restore had already stopped it.
        if (!gameVars.horrorPoint) {
            gameObjects.sounds.gladiator0.play({
                loop: true
            });
            gameObjects.sounds.gladiator0.volume = 0.6;
            tweenVolume("gladiator0", 0.7, 50);
        }
    }, 0);
    gameDelay(() => {
        addToUpdateFuncList(flipEntryLights);
    }, 350);
    gameDelay(() => {
        if (!gameVarsTemp.hasMoved) {
            ftueMoveButton();
        }
    }, 4000); // Everything drawn from the "loadingSS" sprite sheet (the welcome images,
    // the circles, brightLight, and the two transparent_pixel click blockers) has
    // just been destroyed above, and nothing outside the intro references it.
    // Its images would otherwise sit in GPU memory for the rest of the session.
    releaseTextures(["loadingSS"]);
}
function updateWelcomeFollower() {
    gameObjectsTemp.loadingWelcomeFollower.scaleX = 2 * gameObjectsTemp.loadingWelcome.scaleX;
    gameObjectsTemp.loadingWelcomeFollower.scaleY = 2 * gameObjectsTemp.loadingWelcome.scaleY;
    let c = 0.86 * gameObjectsTemp.loadingWelcome.scaleX * (1 + 0.12 * gameObjectsTemp.loadingWelcome.scaleX);
    let d = 0.86 * gameObjectsTemp.loadingWelcome.scaleY * (1 + 0.12 * gameObjectsTemp.loadingWelcome.scaleY);
    for (let a = 0; a < gameObjectsTemp.circleLoading.length; a++) {
        let b = gameObjectsTemp.circleLoading[a];
        b.scaleX = c * (1 + 0.45 * Math.random());
        b.scaleY = d * (1 + 0.45 * Math.random());
    }
}
function handleBorders() {
    let leftBorder = document.getElementById("leftborder");
    let rightBorder = document.getElementById("rightborder");
    let topBorder = document.getElementById("topborder");
    let bottomBorder = document.getElementById("bottomborder");
    if (!leftBorder || !rightBorder || !topBorder || !bottomBorder) {
        return;
    }
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = pixelWidth / pixelHeight;
    var gameScale = 1;
    let isNarrow = false;
    if (windowRatio < gameRatio) {
        gameScale = windowWidth / pixelWidth;
        isNarrow = true;
    } else {
        gameScale = windowHeight / pixelHeight;
    }
    if (isNarrow) {
        rightBorder.style.display = "none";
        leftBorder.style.display = "none";
        topBorder.style.display = "block";
        bottomBorder.style.display = "block";
    } else {
        rightBorder.style.display = "block";
        leftBorder.style.display = "block";
        topBorder.style.display = "none";
        bottomBorder.style.display = "none";
    }
    //block

    let widthAmt = DISPLAY.borderWidth * gameScale;
    leftBorder.style.width = widthAmt + "px";
    rightBorder.style.width = widthAmt + "px";
    let shiftAmt = pixelWidth * gameScale * 0.5 + widthAmt - 2;
    leftBorder.style.left = "calc(50% - " + shiftAmt + "px)";
    rightBorder.style.right = "calc(50% - " + shiftAmt + "px)";
    let heightAmt = DISPLAY.borderWidth * gameScale;
    topBorder.style.width = heightAmt + "px";
    bottomBorder.style.width = heightAmt + "px";
    let shiftCenterY = pixelHeight * gameScale * 0.5 + heightAmt * 0.5 - 2;
    topBorder.style.top = "calc(50% - " + shiftCenterY + "px)";
    bottomBorder.style.top = "calc(50% + " + shiftCenterY + "px)";
}
function initializeSounds(scene) {
    // Deferred sounds get registered later, in loadDeferredAudio's complete
    // callback. Keep whatever is already registered rather than resetting to {}:
    // a second pass through here after the deferred batch has landed would drop
    // all 51 deferred sounds while leaving them in the cache, which is silent and
    // leaves every horror-sequence sound permanently missing.
    if (!gameObjects.sounds) {
        gameObjects.sounds = {};
    }
    for (let d = 0; d < earlyAudio.length; d++) {
        let key = earlyAudio[d][0];
        if (key === "loadingMusic") {
            continue;
        }
        if (!gameObjects.sounds[key]) {
            gameObjects.sounds[key] = scene.sound.add(key);
        }
    }
}

// Applies the in-game mute button's state. This is the ONLY place that writes
// Phaser's global mute.
function applyMuteState() {
    const audible = !gameVars.manualMuted;
    if (typeof phaserGame !== "undefined" && phaserGame && phaserGame.sound) {
        // Keep Phaser's own flag in step (it emits GLOBAL_MUTE off this setter)...
        phaserGame.sound.mute = !audible;

        // ...but do not trust it to actually take effect. Phaser mutes with
        // masterMuteNode.gain.setValueAtTime(v, 0) - always at the fixed
        // timestamp 0 - so every toggle appends another event at the same past
        // time. After enough toggling Chrome stops applying new ones and the
        // game is stranded silent (or audible) for the rest of the session,
        // with sound.mute still reporting the value we asked for. Clearing the
        // timeline and asserting the gain directly makes it deterministic.
        // Guarded: the HTML5 Audio fallback has no masterMuteNode.
        let muteNode = phaserGame.sound.masterMuteNode;
        if (muteNode && muteNode.gain) {
            try {
                muteNode.gain.cancelScheduledValues(0);
            } catch (e) {}
            muteNode.gain.value = audible ? 1 : 0;
        }
        if (audible && phaserGame.sound.context && phaserGame.sound.context.state === "suspended") {
            phaserGame.sound.context.resume().catch(() => {});
        }
    }
}
function playSound(d, a, e = 1) {
    let b = "";
    if (undefined !== a) {
        b = Math.floor(Math.random() * a) + 1;
    }
    let c = d + b;
    if (!gameObjects.sounds[c]) {
        console.warn("playSound: sound not registered: " + c);
        return null;
    }
    gameObjects.sounds[c].play();
    // Always the true volume. Muting is handled once, globally, by
    // applyMuteState - writing 0 here would strand this sound silent after
    // the player unmutes, because nothing re-sets a looping sound's volume.
    gameObjects.sounds[c].volume = e * gameVars.masterAudio * gameVars.soundMult;
    return gameObjects.sounds[c];
}
function tweenVolume(a, b, c = 1500) {
    if (!gameObjects.sounds[a]) {
        console.warn("tweenVolume: sound not registered: " + a);
        return null;
    }
    if (globalScene && globalScene.tweens) {
        globalScene.tweens.killTweensOf(gameObjects.sounds[a]);
    }
    // Fades always run to their true target; the global mute decides whether any
    // of it is audible. Tweening to 0 while muted left the mix wrong on unmute.
    let targetVol = b * gameVars.masterAudio * gameVars.soundMult;
    if (c <= 0) {
        gameObjects.sounds[a].volume = targetVol;
    } else {
        globalScene.tweens.chain({
            targets: [gameObjects.sounds[a]],
            tweens: [
                {
                    volume: targetVol,
                    duration: c
                }
            ]
        });
    }
    return gameObjects.sounds[a];
}
function playSoundOnce(a, b, c = 1) {
    if (!gameObjects.sounds[a]) {
        console.warn("playSoundOnce: sound not registered: " + a);
        return null;
    }
    let targetVol = c * gameVars.masterAudio * gameVars.soundMult;
    if (!oneTimeScares[a]) {
        oneTimeScares[a] = true;
        if (b) {
            gameDelay(() => {
                gameObjects.sounds[a].volume = targetVol;
                gameObjects.sounds[a].play();
            }, b);
        } else {
            gameObjects.sounds[a].volume = targetVol;
            gameObjects.sounds[a].play();
        }
    }
}
function setupHand(scene) {
    gameObjects.baseTouchLayer = scene.make.image({
        x: 0,
        y: 0,
        key: "whitePixel",
        add: true,
        scale: {
            x: 2000,
            y: 1000
        },
        alpha: 0.01
    });
    gameObjects.baseTouchLayer.setInteractive();
    gameObjects.baseTouchLayer.on("pointerdown", onPointerDown, scene);
    gameObjects.baseTouchLayer.on("pointermove", onPointerMove, scene);
    gameObjects.baseTouchLayer.on("pointerup", onPointerUp, scene);
    gameObjects.hand = new Hand(scene);
}
function setupGame(scene) {
    initializeSounds(scene);
    gameObjects.generalDarkness = scene.add.image(gameVars.halfWidth, gameVars.halfHeight, "darkBluePixel");
    gameObjects.generalDarkness.scaleX = 1000;
    gameObjects.generalDarkness.scaleY = 1000;
    gameObjects.generalDarkness.setBlendMode(Phaser.BlendModes.MULTIPLY);
    gameObjects.generalDarkness.alpha = 0;
    gameObjects.generalDim = scene.add.image(gameVars.halfWidth, gameVars.halfHeight, "generalDim");
    gameObjects.generalDim.alpha = 0.75;
    gameObjects.hueCntr.add(gameObjects.generalDim);
    gameObjects.exhibit = new Exhibit(
        scene,
        gameObjects.exhibCntr,
        gameObjects.shadowCntr,
        gameObjects.portraitCntr,
        gameObjects.btnCntr
    );
    gameObjects.flashDim = scene.add.image(gameVars.halfWidth, gameVars.halfHeight, "blackPixel");
    gameObjects.flashDim.scaleX = 1000;
    gameObjects.flashDim.scaleY = 1000;
    gameObjects.flashDim.alpha = 0;
    gameObjects.flashDim.brightVal = 0;
    gameObjects.flashDim.blackOut = false;
    gameObjects.flashDim.recovering = false;
    gameObjects.mainDarkCntr.add(gameObjects.flashDim);
    gameObjects.candleBright = scene.make.sprite({
        x: gameVars.halfWidth,
        y: gameVars.halfHeight,
        key: "candleBright",
        add: true
    });
    gameObjects.candleBright.alpha = 0;
    gameObjects.candleBright.scaleX = 2.75;
    gameObjects.candleBright.scaleY = 2.75;
    gameObjects.candleBright.setBlendMode(Phaser.BlendModes.MULTIPLY);
    gameObjects.mainDarkCntr.add(gameObjects.candleBright);
    gameObjects.candleDark = scene.make.sprite({
        x: gameVars.halfWidth,
        y: gameVars.halfHeight,
        key: "candleDark",
        add: true
    });
    gameObjects.candleDark.alpha = 0;
    gameObjects.candleDark.accX = 0;
    gameObjects.candleDark.accY = 0;
    gameObjects.candleDark.swayX = 0;
    gameObjects.candleDark.swayY = 0;
    gameObjects.candleDark.swayAccX = 0;
    gameObjects.candleDark.swayAccY = 0;
    gameObjects.candleDark.scaleSpdX = 0;
    gameObjects.candleDark.scaleSpdY = 0;
    gameObjects.candleDark.setBlendMode(Phaser.BlendModes.MULTIPLY);
    gameObjects.mainDarkCntr.add(gameObjects.candleDark);
    gameObjects.generalRedness = scene.add.image(gameVars.halfWidth, gameVars.halfHeight, "redlight");
    gameObjects.generalRedness.alpha = 0;
    gameObjects.hueCntr.add(gameObjects.generalRedness);
    this.setupMoveButtons(scene);
    this.setupGameplayButtons(scene);
    initGuideIndicators(scene);
    this.initExhibit(scene);
    this.setupInstructionsStand(scene);
    initFlashScreens();
    initOneTimeListeners();
    gameObjects.infoText = scene.make.text({
        x: gameVars.halfWidth,
        y: gameVars.halfHeight + 220,
        text: " ",
        origin: {
            x: 0.5,
            y: 0.5
        },
        style: {
            font: "bold 46px Times New Roman",
            align: "center",
            fill: "white"
        }
    });
    gameObjects.infoText.setOrigin(0.5, 0.5);
    gameObjects.infoText.setShadow(0, 0, undefined, 6, true, true);
    gameObjects.infoText.setStroke("#000000", 6);
    gameObjects.infoText.alpha = 0;
    initSaveSystem();
    applySaveStateIfNeeded();
}
function update(w, s) {
    let a = Math.min(5, s / 16.666666);
    if (gameVarsTemp.skipUpdateFrame) {
        gameVarsTemp.skipUpdateFrame = false;
        return;
    }
    for (let f = 0; f < updateFuncList.length; f++) updateFuncList[f](a);
    gameVars.mouseaccx = gameVars.mouseposx - gameVars.prevMouseposx;
    gameVars.mouseaccy = gameVars.mouseposy - gameVars.prevMouseposy;
    gameVars.prevMouseposx = gameVars.mouseposx;
    gameVars.prevMouseposy = gameVars.mouseposy;
    gameObjects.hand.update(a);
    let j = gameObjects.hand.getPosX() - gameObjects.exhibCntr.goalOffsetX;
    let k = gameObjects.hand.getPosY() - gameObjects.exhibCntr.goalOffsetY; // Re-checked every frame (not just on pointer move) because the exhibit sways
    // continuously, so a button can drift into or out from under a stationary
    // cursor. buttonManager is the single authority on hover state - it used to
    // be duplicated here with its own onHover()/onHoverOut() bookkeeping, which
    // fired every frame a button was hovered and, combined with Button.setState()
    // re-applying static config over live tween values, permanently froze any
    // button whose scale/alpha was mid-tween while the cursor sat on it.
    buttonManager.updateHover(j, k);
    gameObjects.hand.setPointing(!!buttonManager.lastHovered);
    if (!gameVars.gameConstructed) {
        handleViewShift();
        handleViewShiftLoading();
        let t = 0;
        let l =
            (t =
                gameVarsTemp.loadAmt < 0.8
                    ? 0.6 * gameVarsTemp.loadAmt
                    : gameVarsTemp.loadAmt < 0.999
                      ? 0.6 * gameVarsTemp.loadAmt + (gameVarsTemp.loadAmt - 0.8) * 1.98
                      : gameVarsTemp.loadAmt) *
                gameObjectsTemp.loadingBarBacking.scaleX -
            gameObjectsTemp.loadingBar.scaleX;
        if (
            (1 === gameVarsTemp.loadAmt && (l += 12),
            (gameObjectsTemp.loadingBar.scaleX = Math.min(
                gameObjectsTemp.loadingBarBacking.scaleX,
                gameObjectsTemp.loadingBar.scaleX + 0.05 * l
            )),
            (gameObjectsTemp.funlid.rotation =
                gameObjectsTemp.loadingBar.scaleX * gameObjectsTemp.loadingBar.scaleX * 0.00007),
            gameObjectsTemp.loadingBar.scaleX >= gameObjectsTemp.loadingBarBacking.scaleX &&
                !gameVarsTemp.loadAnimComplete &&
                ((gameVarsTemp.loadAnimComplete = true), onLoadAnimComplete(this)),
            gameObjectsTemp.loadingWelcome && gameVars.gameStarted)
        ) {
            let m = gameObjectsTemp.loadingWelcome.rotation * (1 + gameObjectsTemp.loadingWelcome.rotation) * 4000;
            gameObjects.loadingCntr.shakeAccX = -0.4 * gameObjects.loadingCntr.swayX + (Math.random() - 0.5) * m;
            gameObjects.loadingCntr.shakeAccY = -0.4 * gameObjects.loadingCntr.swayY + (Math.random() - 0.5) * m;
            gameObjects.loadingCntr.swayX += gameObjects.loadingCntr.shakeAccX;
            gameObjects.loadingCntr.swayY += gameObjects.loadingCntr.shakeAccY;
        }
        if (gameObjectsTemp.popup.rotation == 0) {
            gameObjectsTemp.popup.y =
                gameVars.halfHeight +
                22 -
                gameObjectsTemp.loadingBar.scaleX * gameObjectsTemp.loadingBar.scaleX * 0.006;
        }
        return;
    }
    if ((handleViewShift(), gameVars.darkPoint)) {
        let c = gameObjects.candleDark.x - j + gameObjects.exhibCntr.swayX;
        let d = gameObjects.candleDark.y - k + gameObjects.exhibCntr.swayY;
        if (10 > Math.sqrt(c * c + d * d)) {
            c *= 0.5;
            d *= 0.5;
        }
        let h = Math.sqrt(gameVars.mouseaccx * gameVars.mouseaccx + gameVars.mouseaccy * gameVars.mouseaccy);
        let n = 1 - 0.02 * a;
        gameObjects.candleDark.swayAccX =
            gameObjects.candleDark.swayAccX * n + (Math.random() - 0.5) * (0.015 + 0.004 * h);
        gameObjects.candleDark.swayAccY =
            gameObjects.candleDark.swayAccY * n + (Math.random() - 0.5) * (0.015 + 0.004 * h);
        let u = 0.1 / a;
        let o = a * a * 0.005;
        let p = 1.2 - Math.min(0.1, u);
        gameObjects.candleDark.swayX += 0.016 * c - gameObjects.candleDark.swayX * p + gameObjects.candleDark.swayAccX;
        gameObjects.candleDark.swayY += 0.013 * d - gameObjects.candleDark.swayY * p + gameObjects.candleDark.swayAccY;
        gameObjects.candleDark.accX += -(0.11 * gameObjects.candleDark.accX) + gameObjects.candleDark.swayX;
        gameObjects.candleDark.accY += -(0.11 * gameObjects.candleDark.accY) + gameObjects.candleDark.swayY;
        gameObjects.candleDark.x -= gameObjects.candleDark.accX * a + o * c;
        gameObjects.candleDark.y -= gameObjects.candleDark.accY * a + o * d;
        gameObjects.candleBright.x = gameObjects.candleDark.x;
        gameObjects.candleBright.y = gameObjects.candleDark.y;
        gameObjects.candleDark.scaleSpdX = 0.985 * gameObjects.candleDark.scaleSpdX + 0.08 * h;
        gameObjects.candleDark.scaleSpdY = gameObjects.candleDark.scaleSpdX;
        let q = 4 + 0.08 * Math.random() - Math.min(1.4, 0.05 * Math.abs(gameObjects.candleDark.scaleSpdX));
        let r = 4 + 0.08 * Math.random() - Math.min(1.4, 0.05 * Math.abs(gameObjects.candleDark.scaleSpdY));
        if (gameObjects.flashDim.blackOut) {
            if (Math.random() > 0.97) {
                gameObjects.flashDim.alpha = 1 - 0.5 * Math.random();
            } else {
                gameObjects.flashDim.alpha = 1;
            }
            gameObjects.flashDim.brightVal += 0.006;
            if (gameObjects.flashDim.brightVal > 0.4) {
                gameObjects.flashDim.blackOut = false;
                gameObjects.flashDim.recovering = true;
                q = 2;
                r = 2;
                gameObjects.flashDim.alpha = 0;
            }
        } else {
            gameVars.darkPoint;
        }
        gameObjects.candleDark.scaleX = q + gameVars.initialExtraDark;
        gameObjects.candleDark.scaleY = r + gameVars.initialExtraDark;
        if (gameVars.initialExtraDark > 0.01) {
            gameVars.initialExtraDark *= 0.94;
            gameObjects.candleBright.scaleX = 2.75 + 0.25 * gameVars.initialExtraDark;
            gameObjects.candleBright.scaleY = 2.75 + 0.25 * gameVars.initialExtraDark;
        }
    }
    if (
        ((globalScene.cameras.main.x *= 0.6),
        (globalScene.cameras.main.y *= 0.6),
        gameVars.horrorPoint &&
            (gameObjects.generalRedness.alpha = Math.max(0, 0.998 * gameObjects.generalRedness.alpha - 0.0001 * a)),
        updateMusicBox(a),
        gameVarsTemp.startDarkFlicker &&
            ((gameVarsTemp.darkFlickerCountdown -= a), gameVarsTemp.darkFlickerCountdown <= 0))
    ) {
        gameVarsTemp.darkFlickerCountdown = 1000 + 4000 * Math.random();
        let v = 0.01 + 0.1 * Math.random();
        gameObjects.generalDarkness.alpha += v;
        let i = 12 * Math.random() + 5;
        gameDelay(
            () => {
                gameObjects.generalDarkness.alpha -= v;
                if (0.6 > Math.random()) {
                    gameDelay(
                        () => {
                            let a = 15 * Math.random();
                            a = Math.floor(a * a);
                            let b = 0.03 + 0.06 * Math.random();
                            gameObjects.generalDarkness.alpha += b;
                            gameDelay(() => {
                                gameObjects.generalDarkness.alpha -= b;
                            }, a);
                        },
                        800 + 1200 * Math.random()
                    );
                }
            },
            (i = Math.floor(i * i))
        );
    }
}
function handleViewShift() {
    if (gameVars.isFrozen) return;
    gameObjects.exhibCntr.swayAmt = Math.max(gameVars.baseSway, gameObjects.exhibCntr.swayAmt - 0.001);
    gameObjects.exhibCntr.swayAccX += (Math.random() - 0.5) * gameObjects.exhibCntr.swayAmt;
    gameObjects.exhibCntr.swayAccY += (Math.random() - 0.5) * gameObjects.exhibCntr.swayAmt;
    gameObjects.exhibCntr.swayAccX *= 0.975;
    gameObjects.exhibCntr.swayAccY *= 0.975;
    gameObjects.exhibCntr.swayX += gameObjects.exhibCntr.swayAccX;
    gameObjects.exhibCntr.swayY += gameObjects.exhibCntr.swayAccY;
    gameObjects.exhibCntr.swayX *= 0.995;
    gameObjects.exhibCntr.swayY *= 0.995;
    let a = gameObjects.exhibCntr.goalOffsetX - gameObjects.exhibCntr.offsetX;
    let b = gameObjects.exhibCntr.goalOffsetY - gameObjects.exhibCntr.offsetY;
    gameObjects.exhibCntr.offsetAccX += 0.0012 * a - 0.02 * gameObjects.exhibCntr.offsetAccX;
    gameObjects.exhibCntr.offsetAccY += 0.0012 * b - 0.02 * gameObjects.exhibCntr.offsetAccY;
    gameObjects.exhibCntr.offsetX = 0.9 * gameObjects.exhibCntr.offsetX + gameObjects.exhibCntr.offsetAccX;
    gameObjects.exhibCntr.offsetY = 0.9 * gameObjects.exhibCntr.offsetY + gameObjects.exhibCntr.offsetAccY;
    gameObjects.exhibCntr.x = gameObjects.exhibCntr.swayX + gameObjects.exhibCntr.offsetX;
    gameObjects.exhibCntr.y = gameObjects.exhibCntr.swayY + gameObjects.exhibCntr.offsetY + 4;
    gameObjects.shadowCntr.x = 1.01 * gameObjects.exhibCntr.x;
    gameObjects.shadowCntr.y = 1.01 * gameObjects.exhibCntr.y;
    gameObjects.portraitCntr.x = gameObjects.exhibCntr.x;
    gameObjects.portraitCntr.y = gameObjects.exhibCntr.y;
    gameObjects.btnCntr.x = gameObjects.exhibCntr.x;
    gameObjects.btnCntr.y = gameObjects.exhibCntr.y;
    gameObjects.mainDarkCntr.x = gameObjects.exhibCntr.x;
    gameObjects.mainDarkCntr.y = gameObjects.exhibCntr.y;
    gameObjects.hueCntr.x = -5 * gameObjects.exhibCntr.x;
    gameObjects.hueCntr.y = -5 * gameObjects.exhibCntr.y;
}
function handleViewShiftLoading() {
    if (!gameObjects.loadingCntr || gameVars.isFrozen) return;
    gameObjects.exhibCntr.swayAmt = Math.max(gameVars.baseSway, gameObjects.exhibCntr.swayAmt - 0.001);
    gameObjects.loadingCntr.swayAccX += (Math.random() - 0.5) * gameObjects.loadingCntr.swayAmt;
    gameObjects.loadingCntr.swayAccY += (Math.random() - 0.5) * gameObjects.loadingCntr.swayAmt;
    gameObjects.loadingCntr.swayAccX *= 0.975;
    gameObjects.loadingCntr.swayAccY *= 0.975;
    gameObjects.loadingCntr.swayX += gameObjects.loadingCntr.swayAccX;
    gameObjects.loadingCntr.swayY += gameObjects.loadingCntr.swayAccY;
    gameObjects.loadingCntr.swayX *= 0.995;
    gameObjects.loadingCntr.swayY *= 0.995;
    let a = gameObjects.loadingCntr.goalOffsetX - gameObjects.loadingCntr.offsetX;
    let b = gameObjects.loadingCntr.goalOffsetY - gameObjects.loadingCntr.offsetY;
    gameObjects.loadingCntr.offsetAccX += 0.0012 * a - 0.02 * gameObjects.loadingCntr.offsetAccX;
    gameObjects.loadingCntr.offsetAccY += 0.0012 * b - 0.02 * gameObjects.loadingCntr.offsetAccY;
    gameObjects.loadingCntr.offsetX = 0.9 * gameObjects.loadingCntr.offsetX + gameObjects.loadingCntr.offsetAccX;
    gameObjects.loadingCntr.offsetY = 0.9 * gameObjects.loadingCntr.offsetY + gameObjects.loadingCntr.offsetAccY;
    gameObjects.loadingCntr.x = gameObjects.loadingCntr.swayX + gameObjects.loadingCntr.offsetX;
    gameObjects.loadingCntr.y = gameObjects.loadingCntr.swayY + gameObjects.loadingCntr.offsetY;
}
function mouseToHand(d, e) {
    let c = 10;
    gameVars.halfWidth;
    gameVars.halfHeight;
    let f = gameVars.halfWidth / (gameVars.halfWidth - c);
    let g = gameVars.halfHeight / (gameVars.halfHeight - c);
    let a = gameVars.halfWidth + f * (d - gameVars.halfWidth);
    let b = gameVars.halfHeight + g * (e - gameVars.halfHeight);
    a = Math.min(Math.max(0, a), gameVars.width - 1);
    b = Math.min(Math.max(0, b), gameVars.height - 1);
    return {
        x: a,
        y: b
    };
}
function disableMoveButtons() {
    gameObjects.moveLeftBtn.setState("disable");
    gameObjects.moveRightBtn.setState("disable");
}
function showMoveRightFlash() {
    let flashDur = 1150;
    let scaleMult = 1;
    if (gameVars.shownFirstFlash) {
        flashDur = 900;
        scaleMult = 0.65;
        gameObjects.moveRightFlash.alpha = 0.9;
    } else {
        gameObjects.moveRightFlash.alpha = 1.08;
    }
    gameObjects.moveRightFlash.scaleX = 1;
    gameObjects.moveRightFlash.scaleY = 1;
    gameVars.shownFirstFlash = true;
    globalScene.tweens.add({
        delay: 0,
        targets: gameObjects.moveRightFlash,
        alpha: 0,
        ease: "Quad.easeOut",
        duration: flashDur
    });
    globalScene.tweens.add({
        delay: 0,
        targets: gameObjects.moveRightFlash,
        scaleX: 2.6 * scaleMult,
        scaleY: 3.7 * scaleMult,
        ease: "Quart.easeOut",
        duration: flashDur
    });
}
function enableMoveButtons(showFlash = false) {
    if (0 !== gameObjects.exhibit.getCurrentScene()) {
        gameObjects.moveLeftBtn.setState("normal");
    }
    gameObjects.moveRightBtn.setState("normal");
    if (showFlash) {
        showMoveRightFlash();
    }
}
function disableMoveRightButton() {
    gameObjects.moveRightBtn.setState("disable");
}
function disableMoveLeftButton() {
    gameObjects.moveLeftBtn.setState("disable");
}
function enableMoveLeftButton() {
    if (0 !== gameObjects.exhibit.getCurrentScene()) {
        gameObjects.moveLeftBtn.setState("normal");
    }
}
function enableMoveRightButton() {
    gameObjects.moveRightBtn.setState("normal");
}
function setupMoveButtons(a) {
    gameObjects.moveLeftBtn = new Button(
        a,
        gameObjects.topBtnCntr,
        gameObjects.exhibit.moveLeft.bind(gameObjects.exhibit),
        {
            atlas: "buttons",
            ref: "move_btn_normal",
            x: 15,
            y: gameVars.halfHeight,
            scaleX: -1
        },
        {
            atlas: "buttons",
            ref: "move_btn_over"
        },
        {
            atlas: "buttons",
            ref: "move_btn_press"
        },
        {
            atlas: "buttons",
            ref: "move_btn_disable"
        }
    );
    gameObjects.moveLeftBtnHighlight = globalScene.add.image(
        gameObjects.moveLeftBtn.getPosX(),
        gameObjects.moveLeftBtn.getPosY(),
        "buttons",
        "move_btn_glow"
    );
    gameObjects.moveLeftBtnHighlight.scaleX = -1;
    gameObjects.moveLeftBtnHighlight.alpha = 0;
    gameObjects.moveRightBtn = new Button(
        a,
        gameObjects.topBtnCntr,
        gameObjects.exhibit.moveRight.bind(gameObjects.exhibit),
        {
            atlas: "buttons",
            ref: "move_btn_normal",
            x: gameVars.width - 22,
            y: gameVars.halfHeight
        },
        {
            atlas: "buttons",
            ref: "move_btn_over"
        },
        {
            atlas: "buttons",
            ref: "move_btn_press"
        },
        {
            atlas: "buttons",
            ref: "move_btn_disable"
        }
    );
    gameObjects.moveRightBtnHighlight = globalScene.add.image(
        gameObjects.moveRightBtn.getPosX(),
        gameObjects.moveRightBtn.getPosY(),
        "buttons",
        "move_btn_glow"
    );
    gameObjects.moveRightBtnHighlight.alpha = 0;
    gameObjects.moveRightBtnHighlight.state = "brightening";
    gameObjects.moveLeftBtn.setScrollFactor(0);
    gameObjects.moveRightBtn.setScrollFactor(0);
    gameObjects.moveRightFlash = globalScene.add.image(
        gameObjects.moveRightBtn.getPosX(),
        gameObjects.moveRightBtn.getPosY() + 55,
        "buttons",
        "move_btn_normal"
    );
    gameObjects.moveRightFlash.setOrigin(0.38, 0.59);
    gameObjects.moveRightFlash.alpha = 0;
}
function tempFreeze(a = 1000) {
    gameVars.isFrozen = true;
    gameDelay(() => {
        gameVars.isFrozen = false;
    }, a);
}
function initOneTimeListeners() {
    // hint.js used to register these at file scope, which a message-bus reset
    // could not restore. Registered here so they survive restartGame.
    if (typeof initHintRoomListeners === "function") initHintRoomListeners();
    let a;
    a = messageBus.subscribe("startDarkSequence", (b) => {
        a.unsubscribe();
        gameObjects.entrance.entryLights1.alpha = 0;
        gameObjects.entrance.entryLights2.alpha = 0;
        removeFromUpdateFuncList(flipEntryLights);
        gameObjects.entrance.welcomeBtn.setState("disable");
        if (gameObjects.hintButton) {
            gameObjects.hintButton.setNormalRef("hint_normal2");
            gameObjects.hintButton.setHoverRef("hint_hover2");
            gameObjects.hintButton.setPressRef("hint_hover2");
        }
        if (gameObjects.muteButton) {
            if (gameVars.manualMuted) {
                gameObjects.muteButton.setNormalRef("sfx_muted_normal2");
                gameObjects.muteButton.setHoverRef("sfx_muted_hover2");
                gameObjects.muteButton.setPressRef("sfx_muted_hover2");
            } else {
                gameObjects.muteButton.setNormalRef("sfx_normal2");
                gameObjects.muteButton.setHoverRef("sfx_hover2");
                gameObjects.muteButton.setPressRef("sfx_hover2");
            }
        }
    });
    messageBus.subscribe("powerTurnedOn", () => {
        if (gameObjects.hintButton) {
            gameObjects.hintButton.setNormalRef("hint_normal");
            gameObjects.hintButton.setHoverRef("hint_hover");
            gameObjects.hintButton.setPressRef("hint_hover");
        }
        if (gameObjects.muteButton) {
            if (gameVars.manualMuted) {
                gameObjects.muteButton.setNormalRef("sfx_muted_normal");
                gameObjects.muteButton.setHoverRef("sfx_muted_hover");
                gameObjects.muteButton.setPressRef("sfx_muted_hover");
            } else {
                gameObjects.muteButton.setNormalRef("sfx_normal");
                gameObjects.muteButton.setHoverRef("sfx_hover");
                gameObjects.muteButton.setPressRef("sfx_hover");
            }
        }
    });
    messageBus.subscribe("switchToSet2Buttons", () => {
        if (gameObjects.hintButton) {
            gameObjects.hintButton.setNormalRef("hint_normal2");
            gameObjects.hintButton.setHoverRef("hint_hover2");
            gameObjects.hintButton.setPressRef("hint_hover2");
        }
        if (gameObjects.muteButton) {
            if (gameVars.manualMuted) {
                gameObjects.muteButton.setNormalRef("sfx_muted_normal2");
                gameObjects.muteButton.setHoverRef("sfx_muted_hover2");
                gameObjects.muteButton.setPressRef("sfx_muted_hover2");
            } else {
                gameObjects.muteButton.setNormalRef("sfx_normal2");
                gameObjects.muteButton.setHoverRef("sfx_hover2");
                gameObjects.muteButton.setPressRef("sfx_hover2");
            }
        }
    });
    let b;
    b = messageBus.subscribe("startHorrorSequence", (e) => {
        b.unsubscribe();
        addToUpdateFuncList(flipEntryLights);
        gameObjects.entrance.welcomeBtn.setState("normal");
        gameObjects.entrance.welcomeBtn.setNormalRef("welcomeTextDisable");
        gameObjects.entrance.welcomeBtn.setHoverRef("welcomeTextDisable");
        gameObjects.entrance.welcomeBtn.setPressRef("welcomeTextDisable");
        gameObjects.museumStand.bringToTop();
        gameObjects.standArrow = globalScene.add.image(
            gameObjects.museumStand.getPosX(),
            gameObjects.museumStand.getPosY(),
            "buttons",
            "stand_arrow"
        );
        gameObjects.standArrow.setOrigin(0.5, 1);
        gameObjects.gameCtnr1.add(gameObjects.standArrow);
        gameObjects.museumStand.tweenScale({
            rotation: -0.01,
            duration: 150,
            ease: "Cubic.easeOut",
            onComplete() {
                gameObjects.museumStand.tweenScale({
                    rotation: 0,
                    yoyo: true,
                    ease: "Sine.easeInOut",
                    duration: 650
                });
            }
        });
        setupRoomFlower1(globalScene, 8, gameObjects.gameCtnr8);
        setupRoomFlower2(globalScene, 9, gameObjects.gameCtnr9);
        setupRoomFlower3(globalScene, 10, gameObjects.gameCtnr10);
        setupRoomFlower4(globalScene, 11, gameObjects.gameCtnr11);
        setupRoomFlower5(globalScene, 12, gameObjects.gameCtnr12);
        gameObjects.sounds.gladiatorx.play({
            loop: true
        });
        gameObjects.sounds.gladiatorx.volume = 0.01;
        globalScene.tweens.add({
            targets: gameObjects.sounds.gladiatorx,
            volume: 0.7,
            duration: 5000
        });
        gameDelay(() => {
            tweenVolume("gladiatorx", 0.9);
        }, 5000);
        setClownWelcomePicFrame5();
    });
}
function adStarted() {
    gameVars.masterAudio = 0;
    gameVars.isFrozen = true;
    let c = ["gladiator1", "gladiator2", "gladiatorx"];
    for (let a = 0; a < c.length; a++) {
        let b = c[a];
        gameObjects.sounds[b].oldVolume = gameObjects.sounds[b].volume || 1;
        gameObjects.sounds[b].volume = 0;
    }
}
function restoreAdMutedSounds() {
    gameVars.masterAudio = 1;
    gameVars.isFrozen = false;
    let c = ["gladiator1", "gladiator2", "gladiatorx"];
    for (let a = 0; a < c.length; a++) {
        let b = gameObjects.sounds[c[a]];
        if (b) {
            b.volume = b.oldVolume ? b.oldVolume : 1;
        }
    }
}
function adFinished() {
    restoreAdMutedSounds();
}
function adError() {
    restoreAdMutedSounds();
}

// One pooled full-screen image reused for the whole sequence. The old version
// created and destroyed a GameObject every 40ms.
let altRealityImage = null;
let altRealitySeq = 0; // Called by releaseTextures before it frees a key: if the pooled image is still
// showing that texture, move it off before the texture is destroyed.
function clearAltRealityTexture(key) {
    if (!altRealityImage || !altRealityImage.scene) return;
    if (altRealityImage.texture && altRealityImage.texture.key !== key) return;
    if (globalScene.textures.exists("blackPixel")) altRealityImage.setTexture("blackPixel");
}

// releaseWhenDone frees the sequence's textures once it finishes - only pass it
// for a group whose call site is the sole user, or the other call site will draw
// missing frames. The altreality JPEGs are 1300x920 each, ~4.6MB of VRAM apiece.
function showAltReality(a, c = 1, releaseWhenDone = false) {
    if (!a || 0 === a.length) return;
    let remaining = a.slice();
    let toRelease = releaseWhenDone ? a.slice() : null;
    let seq = ++altRealitySeq;
    if (!altRealityImage || !altRealityImage.scene) {
        altRealityImage = globalScene.add.image(gameVars.halfWidth, gameVars.halfHeight, remaining[0]);
    }
    let b = altRealityImage;
    b.depth = 1;
    b.scaleX = c;
    b.scaleY = c;
    b.setVisible(true);
    let step = () => {
        // A later sequence has taken over the shared image; leave it alone.
        if (seq !== altRealitySeq) return;
        if (0 === remaining.length) {
            b.setVisible(false);
            // releaseTextures moves the pooled image off any key it frees.
            if (toRelease) releaseTextures(toRelease);
            return;
        }
        let d = remaining.shift();
        if (globalScene.textures.exists(d)) b.setTexture(d);
        gameDelay(step, 1 === remaining.length ? 70 : 40);
    };
    step();
}

// Coalesced into one pass per frame: handleBorders() interleaves reads of
// window.innerWidth/innerHeight with style writes, so running it once per resize
// event forces a synchronous layout for each one during a drag-resize.
let borderResizeQueued = false;
window.addEventListener(
    "resize",
    function (a, b) {
        if (borderResizeQueued) return;
        borderResizeQueued = true;
        requestAnimationFrame(() => {
            borderResizeQueued = false;
            handleBorders();
        });
    },
    false
);
window.addEventListener("keydown", (ev) => {
    if (["ArrowDown", "ArrowUp", " "].includes(ev.key)) {
        ev.preventDefault();
    }
});
window.addEventListener("wheel", (ev) => ev.preventDefault(), {
    passive: false
});
window.addEventListener("pointerdown", () => {
    if (
        globalScene &&
        globalScene.sound &&
        globalScene.sound.context &&
        globalScene.sound.context.state === "suspended"
    ) {
        globalScene.sound.context.resume().catch(() => {});
    }
});
