function setupRoomFaucet(scene, a, o) {
    let t;
    let s;
    gameObjects.exhibit.setBackgroundAtIndex(a, "bgs", "bg3");
    gameObjects.roomFaucetObjs = {
        roomIndex: a,
        roomContainer: o,
        rotAccumulate: -4,
        overflowAmt: 0,
        soundCooldown: 0,
        leverLength: 230,
        guideArrowNeedsReset: false,
        arrowDistDelay: 0,
        arrowAccumulateBump: 0,
        dollImages: [],
        redDamper: 0
    };
    gameObjects.roomFaucetObjs.container = o;
    setWashyDollImage("washyHappy");
    setWashyDollImage("washyDrowned");
    setWashyDollImage("washyNeutral");
    setWashyDollImage("washyWorried");
    setWashyDollImage("washyRelaxed");
    setupFaucetInk();
    gameObjects.roomFaucetObjs.pipe1 = scene.add.image(-545, 161, "roomFaucet", "pipe1");
    gameObjects.roomFaucetObjs.pipe2 = scene.add.image(-425, 300, "roomFaucet", "pipe2");
    gameObjects.roomFaucetObjs.pipe3 = scene.add.image(-305, 90, "roomFaucet", "pipe3");
    gameObjects.roomFaucetObjs.pipe4 = scene.add.image(-88, 70, "roomFaucet", "pipe4");
    o.add(gameObjects.roomFaucetObjs.pipe1);
    o.add(gameObjects.roomFaucetObjs.pipe2);
    o.add(gameObjects.roomFaucetObjs.pipe3);
    o.add(gameObjects.roomFaucetObjs.pipe4);
    gameObjects.roomFaucetObjs.portrait = scene.add.image(200, 142, "roomFaucet", "portrait");
    gameObjects.roomFaucetObjs.portraitRed = scene.add.image(
        gameObjects.roomFaucetObjs.portrait.x,
        gameObjects.roomFaucetObjs.portrait.y,
        "roomFaucet",
        "portraitRed"
    );
    gameObjects.roomFaucetObjs.portraitRed.alpha = 0;
    o.add(gameObjects.roomFaucetObjs.portrait);
    o.add(gameObjects.roomFaucetObjs.portraitRed);
    gameObjects.roomFaucetObjs.duck = scene.add.image(310, gameVars.height - 20, "roomFaucet", "duck");
    gameObjects.roomFaucetObjs.duck.setOrigin(0.5, 1);
    gameObjects.roomFaucetObjs.duck.scaleX = 0.45;
    gameObjects.roomFaucetObjs.duck.scaleY = 0.45;
    o.add(gameObjects.roomFaucetObjs.duck);
    gameObjects.roomFaucetObjs.hose = scene.add.image(164, -50, "roomFaucet", "hose");
    gameObjects.roomFaucetObjs.hose.setOrigin(0.5, 0);
    gameObjects.roomFaucetObjs.hose.origX = gameObjects.roomFaucetObjs.hose.x;
    gameObjects.roomFaucetObjs.hose.origY = gameObjects.roomFaucetObjs.hose.y;
    gameObjects.roomFaucetObjs.hose.velX = 0;
    gameObjects.roomFaucetObjs.hose.velY = 0;
    o.add(gameObjects.roomFaucetObjs.hose);
    gameObjects.roomFaucetObjs.handle = new Button(scene, {
        container: o,
        normal: {
            atlas: "buttons",
            ref: "glow",
            x: 0,
            scaleX: 1.15,
            scaleY: 1.15,
            y: gameVars.halfHeight,
            alpha: 0.001
        },
        hover: {
            atlas: "buttons",
            ref: "glow",
            alpha: 0.7
        },
        isDraggable: true,
        onDrop: dropHandle
    });
    gameObjects.roomFaucetObjs.placard = new Button(
        scene,
        o,
        () => {
            if (gameVars.horrorPoint) {
                if (gameObjects.roomFaucetObjs.roomCompleted) {
                    updateInfoText(TEXT.faucet.done);
                } else {
                    updateInfoText(TEXT.faucet.name);
                }
            } else {
                if (gameVars.darkPoint) {
                    updateInfoText(TEXT.faucet.dark);
                } else {
                    updateInfoText(TEXT.faucet.name);
                }
            }
        },
        {
            atlas: "buttons",
            ref: "placard",
            x: 380,
            y: gameVars.height - 240
        },
        {
            atlas: "buttons",
            ref: "placard_hover"
        }
    );
    gameObjects.roomFaucetObjs.lever = scene.add.image(
        gameObjects.roomFaucetObjs.hose.x - 111,
        gameVars.halfHeight - 39,
        "roomFaucet",
        "lever"
    );
    o.add(gameObjects.roomFaucetObjs.lever);
    gameObjects.roomFaucetObjs.lever.rotation = -0.73;
    gameObjects.roomFaucetObjs.lever.rotVel = 0;
    gameObjects.roomFaucetObjs.waterCounter = 1;
    gameObjects.roomFaucetObjs.freeDropletPool = [];
    gameObjects.roomFaucetObjs.activeDroplets = [];
    gameObjects.roomFaucetObjs.dragline = scene.add.sprite(0, -9999, "blackPixel");
    gameObjects.roomFaucetObjs.dragline.scaleY = 20;
    gameObjects.roomFaucetObjs.handle.offsetY = 0;
    resetHandlePos();
    addToUpdateFuncList(roomFaucetUpdate);
    messageBus.subscribe("exhibitMove", (e) => {
        if (e === a) {
            if (gameVars.darkPoint) {
                addToUpdateFuncList(faucetRedUpdate);
                globalScene.tweens.add({
                    targets: gameObjects.roomFaucetObjs.duck,
                    x: 280,
                    ease: "Quad.easeOut",
                    duration: 400,
                    delay: 1500
                });
            }
            addGuideArrowToContainer(gameObjects.roomFaucetObjs.roomContainer);
            updateGuideArrow(0, -9999);
            tweenVolume("gladiator0", 0.3);
            tweenVolume("gladiator1", 0.6);
            tweenVolume("gladiator2", 0.5);
        }
    });
    registerRoomSaveState(a, {
        getStage: roomFaucetGetSaveStage,
        setStage: roomFaucetSetSaveStage
    });
    t = messageBus.subscribe("startDarkSequence", (e) => {
        gameObjects.roomFaucetObjs.isLocked = false;
        gameObjects.roomFaucetObjs.handle.reappear();
        resetHandlePos();
        gameObjects.roomFaucetObjs.portraitRed.alpha = 1;
        t.unsubscribe();
    });
    s = messageBus.subscribe("startHorrorSequence", (e) => {
        gameObjects.roomFaucetObjs.isLocked = false;
        gameObjects.roomFaucetObjs.handle.reappear();
        resetHandlePos();
        gameObjects.roomFaucetObjs.firstComplete = true;
        removeFromUpdateFuncList(faucetRedUpdate);
        gameObjects.roomFaucetObjs.portraitRed.destroy();
        s.unsubscribe();
    });
}
function setupFaucetInk() {
    gameObjects.roomFaucetObjs.ink = globalScene.add.image(-160, gameVars.halfHeight + 99, "roomFaucet", "ink1");
    gameObjects.roomFaucetObjs.ink.origX = gameObjects.roomFaucetObjs.ink.x;
    gameObjects.roomFaucetObjs.ink.setOrigin(0.5, 0);
    gameObjects.roomFaucetObjs.ink.alpha = 0;
    gameObjects.roomFaucetObjs.roomContainer.add(gameObjects.roomFaucetObjs.ink);
}
function roomFaucetUpdate(e) {
    let a = false;
    if (
        !gameObjects.roomFaucetObjs.handle.getIsDragged() ||
        gameObjects.roomFaucetObjs.roomCompleted ||
        gameObjects.roomFaucetObjs.isLocked
    ) {
        if (gameObjects.roomFaucetObjs.guideArrowNeedsReset) {
            gameObjects.roomFaucetObjs.guideArrowNeedsReset = false;
            resetGuideArrowFaucet();
        }
    } else {
        gameObjects.roomFaucetObjs.soundCooldown--;
        let o = gameObjects.roomFaucetObjs.handle.getXPos();
        let t = gameObjects.roomFaucetObjs.handle.getYPos() - gameObjects.roomFaucetObjs.handle.offsetY;
        let s = o - gameObjects.roomFaucetObjs.lever.x;
        let r = t - gameObjects.roomFaucetObjs.lever.y;
        let m = Math.atan2(r, s) + 0.5 * Math.PI;
        if (m > Math.PI) {
            m -= 2 * Math.PI;
        }
        let c = m - gameObjects.roomFaucetObjs.lever.rotation;
        if (c > Math.PI) {
            c -= 2 * Math.PI;
        } else {
            if (c < -Math.PI) {
                c += 2 * Math.PI;
            }
        }
        let b = 0;
        if (
            (c > 0.01 ? (b = Math.min(0.0024, 0.006 * c)) : c < -0.01 && (b = Math.max(-0.0024, 0.006 * c)),
            gameVars.horrorPoint && b < 0 && gameObjects.roomFaucetObjs.lever.rotation > 0.8 && (b = 0),
            (gameObjects.roomFaucetObjs.lever.rotVel += b),
            (gameObjects.roomFaucetObjs.lever.rotVel *= 0.88),
            (a = true),
            Math.abs(gameObjects.roomFaucetObjs.lever.rotation + 0.2) < 0.03 &&
                gameObjects.roomFaucetObjs.soundCooldown <= 0 &&
                (gameObjects.roomFaucetObjs.lever.rotVel > 0.005
                    ? (playSound("metalsqueak1"), (gameObjects.roomFaucetObjs.soundCooldown = 50))
                    : gameObjects.roomFaucetObjs.lever.rotVel < -0.005 &&
                      (playSound("metalsqueak2"), (gameObjects.roomFaucetObjs.soundCooldown = 50)),
                (gameObjects.roomFaucetObjs.lever.rotVel *= 0.5)),
            gameObjects.roomFaucetObjs.lever.rotation < -0.75)
        ) {
            if (gameVars.darkPoint && gameObjects.exhibit.needCleanup) {
                gameObjects.exhibit.needCleanup = false;
                gameObjects.roomFaucetObjs.isLocked = true;
                gameObjects.roomFaucetObjs.handle.disappear();
                setWashyDollImage("washyRelaxed");
                roomFaucetMarkStage(ROOM_FAUCET_STAGE_CLEANED);
                messageBus.publish("saveCheckpoint");
                gameDelay(() => {
                    playSound("deepbell4");
                    updateInfoTextSoft(TEXT.roomCleaned, 2000);
                }, 300);
            }
            gameObjects.roomFaucetObjs.lever.rotation = -0.74;
            gameObjects.roomFaucetObjs.lever.rotVel *= -0.35;
        } else if (
            gameObjects.roomFaucetObjs.lever.rotVel > 0.001 &&
            gameObjects.roomFaucetObjs.lever.rotation > 0.78 &&
            !gameObjects.roomFaucetObjs.firstComplete &&
            !gameVars.horrorPoint &&
            !gameVars.darkPoint
        ) {
            gameObjects.roomFaucetObjs.handle.disappear();
            gameObjects.roomFaucetObjs.firstComplete = true;
            roomFaucetMarkStage(ROOM_FAUCET_STAGE_FIRST);
            gameObjects.roomFaucetObjs.isLocked = true;
            gameObjects.roomFaucetObjs.lever.rotation = 0.799;
            gameDelay(() => {
                createKey(
                    -365,
                    gameVars.halfHeight + 85,
                    gameObjects.roomFaucetObjs.roomIndex,
                    gameObjects.roomFaucetObjs.roomContainer,
                    true
                );
            }, 100);
        } else if (gameObjects.roomFaucetObjs.lever.rotation > 0.8) {
            if (gameVars.horrorPoint) {
                if (gameObjects.roomFaucetObjs.lever.rotVel > 0.002) {
                    let a =
                        0.01 *
                        (2 + gameObjects.roomFaucetObjs.lever.rotation + gameObjects.roomFaucetObjs.rotAccumulate);
                    if (Math.random() < a * e) {
                        gameObjects.roomFaucetObjs.rotAccumulate = -3.25;
                        if (Math.random() < 0.75 * gameObjects.roomFaucetObjs.lever.rotation - 0.75) {
                            if (gameObjects.roomFaucetObjs.soundCooldown <= 0) {
                                playSound("metalgrind", 4);
                                gameObjects.roomFaucetObjs.soundCooldown = 45;
                            }
                            if (
                                gameObjects.roomFaucetObjs.lever.rotation > 1.2 &&
                                !gameObjects.roomFaucetObjs.usingBentLever
                            ) {
                                gameObjects.roomFaucetObjs.usingBentLever = true;
                                gameObjects.roomFaucetObjs.lever.alpha = 0;
                                gameObjects.roomFaucetObjs.leverBent = globalScene.add.image(
                                    gameObjects.roomFaucetObjs.lever.x,
                                    gameObjects.roomFaucetObjs.lever.y,
                                    "roomFaucet",
                                    "leverhalfbroken"
                                );
                                gameObjects.roomFaucetObjs.roomContainer.add(gameObjects.roomFaucetObjs.leverBent);
                            }
                            gameObjects.roomFaucetObjs.lever.rotVel = Math.max(
                                0.03,
                                0.16 - 0.025 * gameObjects.roomFaucetObjs.lever.rotation
                            );
                            if (gameObjects.roomFaucetObjs.lever.rotation < 2.5) {
                                showFlashRand(
                                    1,
                                    undefined,
                                    undefined,
                                    0.4 * (gameObjects.roomFaucetObjs.lever.rotation - 1)
                                );
                            }
                        } else {
                            if (gameObjects.roomFaucetObjs.soundCooldown <= 0) {
                                playSound("metalsqueak1");
                                gameObjects.roomFaucetObjs.soundCooldown = 30;
                            }
                            gameObjects.roomFaucetObjs.lever.rotVel = Math.max(
                                0.015,
                                0.07 - 0.025 * gameObjects.roomFaucetObjs.lever.rotation
                            );
                            if (gameObjects.roomFaucetObjs.lever.rotation < 2.5) {
                                showStaticRand(
                                    1,
                                    undefined,
                                    undefined,
                                    0.45 * (gameObjects.roomFaucetObjs.lever.rotation - 1)
                                );
                            }
                        }
                        createExtraDrops(2);
                    }
                }
            } else {
                gameObjects.roomFaucetObjs.lever.rotation = 0.785;
                gameObjects.roomFaucetObjs.lever.rotVel *= -0.12;
            }
            gameObjects.roomFaucetObjs.rotAccumulate += 0.016;
            gameObjects.roomFaucetObjs.lever.rotVel *= Math.max(1.6 - gameObjects.roomFaucetObjs.lever.rotation, 0.43);
        }
        updateGuideArrowFaucet();
        if (gameObjects.roomFaucetObjs.lever.rotation > 0.63) {
            gameObjects.roomFaucetObjs.arrowAccumulateBump += 0.02;
            if (gameObjects.roomFaucetObjs.arrowAccumulateBump > 1) {
                gameObjects.roomFaucetObjs.arrowAccumulateBump = 0;
                updateGuideArrowFaucet(true);
            }
        }
        updateWashyExpression(gameObjects.roomFaucetObjs.lever.rotation);
        gameObjects.roomFaucetObjs.guideArrowNeedsReset = true;
    }
    if (gameObjects.roomFaucetObjs.lever.rotation > -0.5) {
        let e = Math.max(0, 7 * (gameObjects.roomFaucetObjs.lever.rotation + 0.35));
        let a = 13;
        if (gameObjects.roomFaucetObjs.lever.rotation > 2.8) {
            if ((shakeBGPipes(12), !gameObjects.roomFaucetObjs.roomCompleted)) {
                gameObjects.roomFaucetObjs.duck.scaleX = -0.45;
                let e = gameObjects.roomFaucetObjs.portrait.x;
                let a = gameObjects.roomFaucetObjs.portrait.y;
                gameObjects.roomFaucetObjs.portrait.destroy();
                gameObjects.roomFaucetObjs.portrait = globalScene.add.image(e, a, "roomFaucet", "portraitBlack");
                gameObjects.roomFaucetObjs.roomContainer.add(gameObjects.roomFaucetObjs.portrait);
                gameObjects.roomFaucetObjs.ink.alpha = 1;
                gameObjects.sounds.watergurgle.play({
                    loop: true
                });
                gameObjects.sounds.watergurgle.volume = gameVars.soundMult;
                messageBus.subscribe("exhibitMove", (e) => {
                    let a = Math.abs(e - gameObjects.roomFaucetObjs.roomIndex);
                    tweenVolume("watergurgle", Math.max(0, 1 / (1 + a * a * 0.6) - 0.22) * gameVars.soundMult);
                });
                gameObjects.roomFaucetObjs.hose.destroy();
                let o = gameObjects.roomFaucetObjs.hose.origX;
                let t = gameObjects.roomFaucetObjs.hose.origY;
                gameObjects.roomFaucetObjs.hose = globalScene.add.image(o, t, "roomFaucet", "hosebroken");
                gameObjects.roomFaucetObjs.hose.origX = o;
                gameObjects.roomFaucetObjs.hose.origY = t;
                gameObjects.roomFaucetObjs.hose.setOrigin(0.5, 0);
                gameObjects.roomFaucetObjs.roomContainer.add(gameObjects.roomFaucetObjs.hose);
                gameObjects.roomFaucetObjs.lever.rotation = 2.65;
                gameObjects.roomFaucetObjs.handle.destroy();
                let s = gameObjects.roomFaucetObjs.lever.x;
                let r = gameObjects.roomFaucetObjs.lever.y;
                gameObjects.roomFaucetObjs.leverBent.destroy();
                gameObjects.roomFaucetObjs.leverBent = globalScene.add.image(s, r, "roomFaucet", "leverbroken");
                gameObjects.roomFaucetObjs.roomContainer.add(gameObjects.roomFaucetObjs.leverBent);
                showFlashArr([0, 5, 15, 6, 15, 16, 2, 16, 16, 7, 0], () => {
                    showStaticRand(5);
                    gameDelay(() => {
                        showStaticRand(2);
                        gameDelay(() => {
                            showStaticRand(1, undefined, undefined, 0.05);
                        }, 750);
                    }, 750);
                });
                gameVars.walkSlow = true;
                gameObjects.roomFaucetObjs.roomCompleted = true;
                roomFaucetMarkStage(ROOM_FAUCET_STAGE_BROKEN);
                updateWashyExpression(999);
                gameDelay(() => {
                    gameObjects.roomFaucetObjs.startOverflow = true;
                }, 600);
                gameDelay(() => {
                    createKey(
                        -155,
                        gameVars.halfHeight + 160,
                        gameObjects.roomFaucetObjs.roomIndex,
                        gameObjects.roomFaucetObjs.roomContainer,
                        false
                    );
                }, 1500);
            }
            let e = 3 * (Math.random() - 0.5);
            let a = 1.5 * (Math.random() - 0.5);
            gameObjects.roomFaucetObjs.hose.x = gameObjects.roomFaucetObjs.hose.origX + e;
            gameObjects.roomFaucetObjs.hose.y = gameObjects.roomFaucetObjs.hose.origY + a;
            gameObjects.roomFaucetObjs.lever.x = gameObjects.roomFaucetObjs.hose.x - 111 + e;
            gameObjects.roomFaucetObjs.lever.y = gameVars.halfHeight - 39 + a;
            gameObjects.roomFaucetObjs.lever.rotation = 3;
            gameObjects.roomFaucetObjs.ink.x = gameObjects.roomFaucetObjs.ink.origX + 0.4 * e;
            updateInk();
        } else if (
            (e < a &&
                ((gameObjects.roomFaucetObjs.waterCounter -= e),
                gameObjects.roomFaucetObjs.waterCounter <= 0 &&
                    ((gameObjects.roomFaucetObjs.waterCounter = 100), createWaterDrop())),
            e > a - 4)
        ) {
            shakeBGPipes(e);
            let o = e - (a - 4);
            let t = (Math.random() - 0.5) * o * 0.6;
            let s = (Math.random() - 0.5) * o * 0.3;
            let r = gameObjects.roomFaucetObjs.hose.origX - gameObjects.roomFaucetObjs.hose.x;
            let m = gameObjects.roomFaucetObjs.hose.origY - gameObjects.roomFaucetObjs.hose.y;
            gameObjects.roomFaucetObjs.lever.x = gameObjects.roomFaucetObjs.hose.x - 111 - r;
            gameObjects.roomFaucetObjs.lever.y = gameVars.halfHeight - 39 - m;
            gameObjects.roomFaucetObjs.hose.velX += t + 0.65 * r;
            gameObjects.roomFaucetObjs.hose.velY += s + 0.65 * m;
            gameObjects.roomFaucetObjs.hose.velX *= 0.6;
            gameObjects.roomFaucetObjs.hose.velY *= 0.6;
            gameObjects.roomFaucetObjs.hose.x += gameObjects.roomFaucetObjs.hose.velX;
            gameObjects.roomFaucetObjs.hose.y += gameObjects.roomFaucetObjs.hose.velY;
            gameObjects.roomFaucetObjs.lever.x += 0.75 * gameObjects.roomFaucetObjs.hose.velX;
            gameObjects.roomFaucetObjs.lever.y += 0.5 * gameObjects.roomFaucetObjs.hose.velY;
        }
    }
    for (let a = 0; a < gameObjects.roomFaucetObjs.activeDroplets.length; a++) {
        let o = gameObjects.roomFaucetObjs.activeDroplets[a];
        // splice shifts everything down, so step back to avoid skipping a droplet
        o.velY += 0.1;
        o.y += o.velY * e;
        if (o.y > gameVars.halfHeight + 208) {
            o.y = -9999;
            gameObjects.roomFaucetObjs.activeDroplets.splice(a--, 1);
            gameObjects.roomFaucetObjs.freeDropletPool.push(o);
        }
    }
    if (a) {
        gameObjects.roomFaucetObjs.lever.rotation += gameObjects.roomFaucetObjs.lever.rotVel * e;
    }
    if (gameObjects.roomFaucetObjs.leverBent) {
        gameObjects.roomFaucetObjs.leverBent.x = gameObjects.roomFaucetObjs.lever.x;
        gameObjects.roomFaucetObjs.leverBent.y = gameObjects.roomFaucetObjs.lever.y;
        gameObjects.roomFaucetObjs.leverBent.rotation = gameObjects.roomFaucetObjs.lever.rotation;
    }
}
function updateInk() {
    gameObjects.roomFaucetObjs.ink.scaleX = 0.995 + 0.01 * Math.random();
}
function createWaterDrop() {
    let e = gameObjects.roomFaucetObjs.freeDropletPool.pop();
    if (!e) {
        (e = globalScene.add.image(0, 0, "roomFaucet", "waterdrop")).setDepth(5);
        gameObjects.roomFaucetObjs.container.add(e);
    }
    e.scaleX = 0.85;
    gameDelay(() => {
        e.scaleX = 0.95;
        gameDelay(() => {
            e.scaleX = 1;
        }, 30);
    }, 30);
    e.velY = 0.4;
    e.x = gameObjects.roomFaucetObjs.hose.x - 360 + 90 * Math.random();
    e.y = gameObjects.roomFaucetObjs.hose.y + 624;
    gameObjects.roomFaucetObjs.activeDroplets.push(e);
}
function dropHandle() {
    resetHandlePos();
}
function resetHandlePos() {
    let e = gameObjects.roomFaucetObjs.lever.x;
    let a = gameObjects.roomFaucetObjs.lever.y;
    let o = gameObjects.roomFaucetObjs.lever.rotation - 0.5 * Math.PI;
    let t = e + Math.cos(o) * gameObjects.roomFaucetObjs.leverLength;
    let s = a + Math.sin(o) * gameObjects.roomFaucetObjs.leverLength + gameObjects.roomFaucetObjs.handle.offsetY;
    gameObjects.roomFaucetObjs.handle.setPos(t, s);
}
function updateGuideArrowFaucet(e) {
    let a = gameObjects.roomFaucetObjs.lever.x;
    let o = gameObjects.roomFaucetObjs.lever.y;
    let t = gameObjects.roomFaucetObjs.lever.rotation - 0.5 * Math.PI;
    let s = a + Math.cos(t) * (gameObjects.roomFaucetObjs.leverLength + 7);
    let r = o + Math.sin(t) * (gameObjects.roomFaucetObjs.leverLength + 7) + gameObjects.roomFaucetObjs.handle.offsetY;
    let m = gameVars.mouseposx - s - gameVars.halfWidth;
    let c = gameVars.mouseposy - r;
    let b = Math.min(150, Math.sqrt(m * m + c * c));
    if (b < 35) {
        b = 0;
    } else {
        if (b > 70 && e) {
            b += 20;
        }
    }
    gameObjects.roomFaucetObjs.arrowDistDelay = 0.6 * gameObjects.roomFaucetObjs.arrowDistDelay + 0.4 * b;
    let O = Math.atan2(c, m);
    updateGuideArrow(s, r, O, gameObjects.roomFaucetObjs.arrowDistDelay);
}
function resetGuideArrowFaucet() {
    updateGuideArrow(0, -9999);
    gameObjects.roomFaucetObjs.arrowDistDelay = 0;
}
function createExtraDrops(e) {
    if (e <= 0) return;
    for (let a = 0; a < e; a++) createWaterDrop();
    gameDelay(() => {
        createExtraDrops(e - 1);
    }, 25);
}
function setWashyDollImage(e) {
    if (gameObjects.roomFaucetObjs.doll) {
        if (gameObjects.roomFaucetObjs.doll == gameObjects.roomFaucetObjs.dollImages[e]) return;
        gameObjects.roomFaucetObjs.doll.visible = false;
    }
    if (!gameObjects.roomFaucetObjs.dollImages[e]) {
        let a = globalScene.add.image(-145, gameVars.height - 163, "roomFaucet", e);
        gameObjects.roomFaucetObjs.dollImages[e] = a;
        gameObjects.roomFaucetObjs.roomContainer.add(a);
    }
    gameObjects.roomFaucetObjs.dollImages[e].visible = true;
    gameObjects.roomFaucetObjs.doll = gameObjects.roomFaucetObjs.dollImages[e];
    bounceWashyDoll();
}
function bounceWashyDoll() {
    gameObjects.roomFaucetObjs.doll.scaleY = 1.008;
    gameDelay(() => {
        gameObjects.roomFaucetObjs.doll.scaleY = 1.004;
        gameDelay(() => {
            gameObjects.roomFaucetObjs.doll.scaleY = 1;
        }, 40);
    }, 50);
}
function updateWashyExpression(e) {
    if (!gameObjects.roomFaucetObjs.firstComplete || gameVars.darkPoint || gameVars.horrorPoint) {
        if (gameObjects.roomFaucetObjs.roomCompleted) {
            setWashyDollImage("washyDrowned");
        } else {
            setWashyDollImage(e < -0.25 ? "washyRelaxed" : e < 1.6 ? "washyNeutral" : "washyWorried");
        }
    } else {
        setWashyDollImage("washyHappy");
    }
}
function shakeBGPipes(e) {
    if (e > 9) {
        let a = 0.5 * (e - 9);
        gameObjects.roomFaucetObjs.pipe1.x = Math.random() * a - 545;
        gameObjects.roomFaucetObjs.pipe1.y = 161 + Math.random() * a;
    }
    if (e > 10) {
        let a = 0.5 * (e - 9);
        gameObjects.roomFaucetObjs.pipe2.x = Math.random() * a - 425;
        gameObjects.roomFaucetObjs.pipe2.y = 300 + Math.random() * a;
    }
    if (e > 11) {
        let a = 0.5 * (e - 9);
        gameObjects.roomFaucetObjs.pipe3.x = Math.random() * a - 305;
        gameObjects.roomFaucetObjs.pipe3.y = 90 + Math.random() * a;
    }
    if (e > 11.5) {
        let a = 0.5 * (e - 9);
        gameObjects.roomFaucetObjs.pipe4.x = Math.random() * a - 88;
        gameObjects.roomFaucetObjs.pipe4.y = 70 + Math.random() * a;
    }
}
function faucetRedUpdate() {
    let e = gameVars.mouseposx - gameObjects.roomFaucetObjs.portraitRed.x - gameVars.halfWidth;
    let a = gameVars.mouseposy - gameObjects.roomFaucetObjs.portraitRed.y;
    let o = Math.abs(e) + Math.abs(a);
    let t = Math.max(0, Math.min(1, 0.003 * (o - 70 - gameObjects.roomFaucetObjs.redDamper)));
    if (t > gameObjects.roomFaucetObjs.portraitRed.alpha) {
        gameObjects.roomFaucetObjs.portraitRed.alpha = 0.95 * gameObjects.roomFaucetObjs.portraitRed.alpha + 0.05 * t;
        if (gameObjects.roomFaucetObjs.portraitRed.alpha < 0.85) {
            gameObjects.roomFaucetObjs.redDamper += 0.8;
        }
    } else {
        gameObjects.roomFaucetObjs.portraitRed.alpha = 0.88 * gameObjects.roomFaucetObjs.portraitRed.alpha + 0.12 * t;
    }
}

// ============================================================== save state ===
//
// Mr. Washy is completed three times, once per phase: the tap is turned on
// (normal), turned back off (dark cleanup), then forced until the plumbing
// bursts (horror).
//
// The handle is the subtle part. Each phase transition RE-ARMS it — the
// startDarkSequence and startHorrorSequence subscribers in setupRoomFaucet call
// handle.reappear() + resetHandlePos() and clear isLocked, because the player
// needs it again for that phase's work. Restore republishes those topics before
// it applies room state, so a restorer that unconditionally disarms the handle
// undoes them and leaves the tap dead. That was the "handle isn't clickable in
// dark mode" bug: the old restorer called handle.disappear() for stage 1 no
// matter which phase the save was taken in.
//
// The rule below: disarm the handle only when this room's work for the CURRENT
// phase is already done. Otherwise leave it armed, exactly as the phase
// subscriber just set it up.

var ROOM_FAUCET_STAGE_NONE = 0;
var ROOM_FAUCET_STAGE_FIRST = 1; // normal phase: tap turned on, yellow key given
var ROOM_FAUCET_STAGE_CLEANED = 2; // dark phase: tap turned back off
var ROOM_FAUCET_STAGE_BROKEN = 3; // horror phase: plumbing burst, red key given

function roomFaucetMarkStage(stage) {
    let r = gameObjects.roomFaucetObjs;
    if (r && (!r.saveStage || r.saveStage < stage)) {
        r.saveStage = stage;
    }
}
function roomFaucetGetSaveStage() {
    let r = gameObjects.roomFaucetObjs;
    return (r && r.saveStage) || ROOM_FAUCET_STAGE_NONE;
}

// Has this room's work for the phase the player is currently in been done?
function roomFaucetPhaseSatisfied(stage) {
    if (gameVars.horrorPoint) return stage >= ROOM_FAUCET_STAGE_BROKEN;
    if (gameVars.darkPoint) return stage >= ROOM_FAUCET_STAGE_CLEANED;
    return stage >= ROOM_FAUCET_STAGE_FIRST;
}

// Puts the room straight into the end state of `stage`.
//
// STATE ONLY — no tweens, sounds, static or gameDelay chains.
function roomFaucetSetSaveStage(stage) {
    let r = gameObjects.roomFaucetObjs;
    if (!r || !stage) return;
    r.saveStage = stage;
    if (stage >= ROOM_FAUCET_STAGE_FIRST) r.firstComplete = true;
    if (stage >= ROOM_FAUCET_STAGE_BROKEN) {
        // Tail of the horror completion in roomFaucetUpdate.
        r.roomCompleted = true;
        let px = r.portrait.x;
        let py = r.portrait.y;
        if (saveAlive(r.portrait)) r.portrait.destroy();
        r.portrait = globalScene.add.image(px, py, "roomFaucet", "portraitBlack");
        r.roomContainer.add(r.portrait);
        r.ink.alpha = 1;
        let hx = r.hose.origX;
        let hy = r.hose.origY;
        if (saveAlive(r.hose)) r.hose.destroy();
        r.hose = globalScene.add.image(hx, hy, "roomFaucet", "hosebroken");
        r.hose.origX = hx;
        r.hose.origY = hy;
        r.hose.setOrigin(0.5, 0);
        r.hose.velX = 0;
        r.hose.velY = 0;
        r.roomContainer.add(r.hose);
        if (saveAlive(r.leverBent)) r.leverBent.destroy();
        r.leverBent = globalScene.add.image(r.lever.x, r.lever.y, "roomFaucet", "leverbroken");
        r.roomContainer.add(r.leverBent);
        r.duck.scaleX = -0.45;
        r.lever.rotation = 3;
    } else if (stage === ROOM_FAUCET_STAGE_CLEANED) {
        r.lever.rotation = -0.74;
        setWashyDollImage("washyRelaxed");
    } else {
        r.lever.rotation = 0.799;
    }

    // Arm or disarm the handle for the phase the player is actually in. Never
    // unconditionally disappear it — see the note at the top of this section.
    if (roomFaucetPhaseSatisfied(stage)) {
        r.isLocked = true;
        if (saveAlive(r.handle)) r.handle.disappear();
    } else {
        r.isLocked = false;
        if (saveAlive(r.handle)) {
            r.handle.reappear();
            resetHandlePos();
        }
    }
}
