function setupRoomPump(scene, o, a) {
    gameObjects.exhibit.setBackgroundAtIndex(o, "bgs", "bg2");
    gameObjects.roomPumpObjs = {
        canPump: true,
        roomIndex: o,
        roomContainer: a,
        shouldUpdate: false,
        pumpAmt: 0,
        pumpCheckpoint: 0,
        prevFloatyState: 0,
        floatyGoalScaleX: 1,
        floatyGoalScaleY: 1,
        floatyGoalPosX: 0,
        floatyGoalPosY: 0,
        pressCooldown: 0
    };
    gameObjects.roomPumpObjs.cleanupBtn = new Button(
        globalScene,
        gameObjects.roomPumpObjs.roomContainer,
        cleanupPump,
        {
            atlas: "buttons",
            ref: "glow",
            alpha: 0.05,
            x: 0,
            y: -9999,
            scaleX: 1.75,
            scaleY: 1.75
        },
        {
            atlas: "buttons",
            ref: "glow",
            alpha: 0.8,
            scaleX: 1.85,
            scaleY: 1.8
        },
        {
            atlas: "buttons",
            ref: "glow",
            alpha: 1,
            scaleX: 1.85,
            scaleY: 1.8
        }
    );
    gameObjects.roomPumpObjs.frames = scene.add.image(0, 245, "roomPump", "framesFloaty1");
    a.add(gameObjects.roomPumpObjs.frames);
    gameObjects.roomPumpObjs.frames.alpha = 0;
    gameObjects.roomPumpObjs.pumpBtn = new Button(
        globalScene,
        gameObjects.roomPumpObjs.roomContainer,
        pumpReleased,
        {
            atlas: "buttons",
            ref: "glow",
            alpha: 0.05,
            x: -240,
            y: 505,
            scaleX: isMobile ? 1.7 : 1.6,
            scaleY: isMobile ? 1.1 : 1
        },
        {
            atlas: "buttons",
            ref: "glow",
            alpha: 0.8,
            scaleX: 1.7,
            scaleY: 1.1
        },
        {
            atlas: "buttons",
            ref: "glow",
            alpha: 0.001,
            scaleX: 1.7,
            scaleY: 1.1
        }
    );
    gameObjects.roomPumpObjs.pumpBtn.setOnMouseDownFunc(pumpPressed);
    gameObjects.roomPumpObjs.extraGlow = scene.add.image(-240, 505, "buttons", "glow");
    gameObjects.roomPumpObjs.extraGlow.scaleX = 1.95;
    gameObjects.roomPumpObjs.extraGlow.scaleY = 1.45;
    gameObjects.roomPumpObjs.extraGlow.alpha = 0;
    gameObjects.roomPumpObjs.roomContainer.add(gameObjects.roomPumpObjs.extraGlow);
    gameObjects.roomPumpObjs.placard = new Button(
        scene,
        a,
        () => {
            if (gameVars.horrorPoint) {
                if (gameObjects.roomPumpObjs.roomComplete) {
                    updateInfoText(TEXT.pump.done);
                } else {
                    updateInfoText(TEXT.pump.name);
                }
            } else {
                if (gameVars.darkPoint) {
                    updateInfoText(TEXT.pump.dark);
                } else {
                    updateInfoText(TEXT.pump.name);
                }
            }
        },
        {
            atlas: "buttons",
            ref: "placard",
            x: 20,
            y: gameVars.height - 100
        },
        {
            atlas: "buttons",
            ref: "placard_hover"
        }
    );
    gameObjects.roomPumpObjs.balloon1 = scene.add.image(-474, gameVars.height - 135, "roomPump", "balloonFloaty1");
    gameObjects.roomPumpObjs.balloon1.rotation = -0.02;
    gameObjects.roomPumpObjs.balloon1.setOrigin(0.5, 1);
    a.add(gameObjects.roomPumpObjs.balloon1);
    gameObjects.roomPumpObjs.balloon2 = scene.add.image(510, gameVars.height - 139, "roomPump", "balloonFloaty2");
    gameObjects.roomPumpObjs.balloon2.rotation = 0.02;
    gameObjects.roomPumpObjs.balloon2.setOrigin(0.5, 1);
    a.add(gameObjects.roomPumpObjs.balloon2);
    gameObjects.roomPumpObjs.button = scene.add.image(-240, 492, "roomPump", "button");
    gameObjects.roomPumpObjs.pumplines = scene.add.image(-240, 415, "roomPump", "pumplines").setVisible(false);
    gameObjects.roomPumpObjs.button.origY = gameObjects.roomPumpObjs.button.y;
    a.add(gameObjects.roomPumpObjs.button);
    a.add(gameObjects.roomPumpObjs.pumplines);
    gameObjects.roomPumpObjs.fan = scene.add.image(-240, 621, "roomPump", "fan");
    gameObjects.roomPumpObjs.fan.rotVel = 0;
    a.add(gameObjects.roomPumpObjs.fan);
    gameObjects.roomPumpObjs.hose = scene.add.image(
        gameObjects.roomPumpObjs.fan.x + 64,
        gameObjects.roomPumpObjs.fan.y + 71,
        "roomPump",
        "hose"
    );
    gameObjects.roomPumpObjs.hose.setOrigin(0, 1);
    gameObjects.roomPumpObjs.hose.rotation = 0.15;
    gameObjects.roomPumpObjs.hose.baseRotation = gameObjects.roomPumpObjs.hose.rotation;
    gameObjects.roomPumpObjs.hose.scaleX = 0.85;
    gameObjects.roomPumpObjs.hose.scaleY = 0.85;
    a.add(gameObjects.roomPumpObjs.hose);
    gameObjects.roomPumpObjs.compressor = scene.add.image(-240, 621, "roomPump", "compressor");
    a.add(gameObjects.roomPumpObjs.compressor);
    addToUpdateFuncList(roomPumpUpdate);
    gameObjects.roomPumpObjs.floatyState = 0;
    let m;
    let t;
    let s;
    let b = gameVars.halfHeight + 175;
    gameObjects.roomPumpObjs.floatyGoalPosX = 135;
    gameObjects.roomPumpObjs.floatyGoalPosY = b;
    gameObjects.roomPumpObjs.floatySprites = [
        scene.add.image(135, b, "roomPump", "floaty1"),
        scene.add.image(135, b, "roomPump", "floaty2"),
        scene.add.image(135, b, "roomPump", "floaty3"),
        scene.add.image(135, b, "roomPump", "floaty4"),
        scene.add.image(135, b, "roomPump", "floaty5"),
        scene.add.image(135, b, "roomPump", "floaty6"),
        scene.add.image(135, b, "roomPump", "floaty7"),
        scene.add.image(135, b, "roomPump", "floatyX"),
        scene.add.image(135, b, "roomPump", "floatyY")
    ];
    for (let e = 0; e < gameObjects.roomPumpObjs.floatySprites.length; e++) {
        gameObjects.roomPumpObjs.floatySprites[e].visible = false;
        gameObjects.roomPumpObjs.floatySprites[e].setOrigin(0.5, 0.55);
        a.add(gameObjects.roomPumpObjs.floatySprites[e]);
    }
    gameObjects.roomPumpObjs.floaty = gameObjects.roomPumpObjs.floatySprites[0];
    gameObjects.roomPumpObjs.floaty.visible = true;
    messageBus.subscribe("exhibitMove", (e, oldScene) => {
        if (e === o) {
            gameDelay(() => {
                gameObjects.roomPumpObjs.shouldUpdate = true;
                gameDelay(() => {
                    if (gameObjects.roomPumpObjs.pumpAmt < 8 && (!gameVars.darkPoint || gameVars.horrorPoint)) {
                        gameObjects.roomPumpObjs.pumplines.visible = true;
                        gameDelay(() => {
                            gameObjects.roomPumpObjs.pumplines.visible = false;
                            gameDelay(() => {
                                gameObjects.roomPumpObjs.pumplines.visible = true;
                                gameDelay(() => {
                                    gameObjects.roomPumpObjs.pumplines.visible = false;
                                    gameDelay(() => {
                                        if (gameObjects.roomPumpObjs.pumpAmt < 20) {
                                            gameObjects.roomPumpObjs.pumplines.visible = true;
                                            gameDelay(() => {
                                                gameObjects.roomPumpObjs.pumplines.visible = false;
                                                gameDelay(() => {
                                                    gameObjects.roomPumpObjs.pumplines.visible = true;
                                                    gameDelay(() => {
                                                        gameObjects.roomPumpObjs.pumplines.visible = false;
                                                    }, 350);
                                                }, 350);
                                            }, 350);
                                        }
                                    }, 5000);
                                }, 350);
                            }, 350);
                        }, 350);
                    }
                }, 4500);
            }, 0);
        } else {
            gameDelay(() => {
                gameObjects.roomPumpObjs.shouldUpdate = false;
            }, 600);
        }
    });
    messageBus.subscribe("mouseUp", pumpReleased);
    m = messageBus.subscribe("exhibitMove", (e) => {
        if (e === o) {
            if (gameVars.darkPoint) {
                gameObjects.roomPumpObjs.frameKid = globalScene.add.image(-15, 140, "roomPump", "frameskid");
                gameObjects.roomPumpObjs.frameKid.origX = gameObjects.roomPumpObjs.frameKid.x;
                gameObjects.roomPumpObjs.frameKid.origY = gameObjects.roomPumpObjs.frameKid.y;
                a.add(gameObjects.roomPumpObjs.frameKid);
                addToUpdateFuncList(frameKidUpdate);
            }
            if (gameVars.horrorPoint && gameObjects.roomPumpObjs.pumpAmt <= 0.1) {
                globalScene.tweens.chain({
                    targets: [gameObjects.roomPumpObjs.extraGlow],
                    tweens: [
                        {
                            alpha: 1,
                            duration: 2000,
                            ease: "Quad.easeIn",
                            delay: 3000
                        },
                        {
                            alpha: 0,
                            duration: 1500,
                            ease: "Quad.easeOut"
                        },
                        {
                            alpha: 1,
                            duration: 2000,
                            ease: "Quad.easeIn",
                            delay: 3000
                        },
                        {
                            alpha: 0,
                            duration: 1500,
                            ease: "Quad.easeOut"
                        }
                    ]
                });
            }
            tweenVolume("gladiator0", 0.5);
            tweenVolume("gladiator1", 0.35);
            tweenVolume("gladiator2", 0.75);
            if (!gameObjects.roomPumpObjs.visitedOnce) {
                gameObjects.roomPumpObjs.visitedOnce = true;
                gameObjects.roomPumpObjs.fan.rotVel += 0.003;
                globalScene.tweens.chain({
                    targets: [gameObjects.roomPumpObjs.balloon1, gameObjects.roomPumpObjs.balloon2],
                    tweens: [
                        {
                            rotation: 0,
                            duration: 5000,
                            yoyo: true,
                            ease: "Sine.easeInOut"
                        }
                    ]
                });
            }
        }
    });
    registerRoomSaveState(o, {
        getStage: roomPumpGetSaveStage,
        setStage: roomPumpSetSaveStage
    });
    t = messageBus.subscribe("startDarkSequence", (e) => {
        gameObjects.roomPumpObjs.cleanupBtn.setPos(
            gameObjects.roomPumpObjs.floaty.x,
            gameObjects.roomPumpObjs.floaty.y
        );
        gameObjects.roomPumpObjs.frames.alpha = 1;
        t.unsubscribe();
    });
    s = messageBus.subscribe("startHorrorSequence", (e) => {
        // frameKid is only created by the exhibitMove subscriber above, and only
        // if the player enters this room while darkPoint is set. Reaching the
        // horror sequence without that having happened left it undefined and
        // threw here, aborting the rest of this handler and leaving the pump
        // permanently unusable.
        removeFromUpdateFuncList(frameKidUpdate);
        if (gameObjects.roomPumpObjs.frameKid && !gameObjects.roomPumpObjs.frameKid.isDestroyed) {
            gameObjects.roomPumpObjs.frameKid.destroy();
        }
        gameObjects.roomPumpObjs.pumpBtn.reappear();
        gameObjects.roomPumpObjs.pumpBtn.setPos(-240, 500);
        gameObjects.roomPumpObjs.canPump = true;
        s.unsubscribe();
    });
}
function roomPumpUpdate(e) {
    if (!gameObjects.roomPumpObjs.shouldUpdate) return;
    let o =
        (gameObjects.roomPumpObjs.buttonPressed || gameObjects.roomPumpObjs.buttonPressCarryOver > 0) &&
        gameObjects.roomPumpObjs.canPump;
    if (
        (o
            ? ((gameObjects.roomPumpObjs.buttonPressCarryOver -= e),
              (gameObjects.roomPumpObjs.fan.rotVel += 0.004 * e),
              (gameObjects.roomPumpObjs.button.y = Math.min(
                  gameObjects.roomPumpObjs.button.origY + 25,
                  gameObjects.roomPumpObjs.button.y + 10
              )),
              gameObjects.roomPumpObjs.button.y >= gameObjects.roomPumpObjs.button.origY + 25 &&
                  (gameObjects.roomPumpObjs.fan.rotVel += 0.005 * e))
            : (gameObjects.roomPumpObjs.button.y = Math.max(
                  gameObjects.roomPumpObjs.button.origY,
                  gameObjects.roomPumpObjs.button.y - 2
              )),
        (gameObjects.roomPumpObjs.fan.rotation += gameObjects.roomPumpObjs.fan.rotVel),
        (gameObjects.roomPumpObjs.fan.rotVel *= 1 - (1 - 0.965) * (1 + 0.8 * (e - 1))),
        gameObjects.roomPumpObjs.fan.rotVel > 0.03 && o)
    ) {
        let o = gameObjects.roomPumpObjs.pressCooldown > 2 ? 0.2 : 0;
        let a = 0.43;
        if (gameObjects.roomPumpObjs.pumpAmt > 100) {
            if (gameObjects.roomPumpObjs.pumpAmt <= 160) {
                a *= 0.7;
                o *= 0.7;
            } else {
                if (gameObjects.roomPumpObjs.pumpAmt <= 250) {
                    a *= 0.9;
                    o *= 0.9;
                }
            }
        } else {
            if (gameObjects.roomPumpObjs.pumpAmt < 30) {
                a *= 1.1;
            }
        }
        gameObjects.roomPumpObjs.pumpAmt += (a + o) * e;
    } else if (!gameObjects.roomPumpObjs.lastBreath) {
        gameObjects.roomPumpObjs.pumpAmt = Math.max(
            (gameObjects.roomPumpObjs.pumpAmt -= e * gameVars.darkPoint ? 1 : 0.2),
            gameObjects.roomPumpObjs.pumpCheckpoint
        );
    }
    updateFloatyPumpState(gameObjects.roomPumpObjs.pumpAmt);
    if (
        gameObjects.roomPumpObjs.floatyState > 4 &&
        gameObjects.roomPumpObjs.floatyState < gameObjects.roomPumpObjs.floatySprites.length - 1 &&
        Math.random() < 0.0005 * gameObjects.roomPumpObjs.floatyState
    ) {
        showStaticRand(Math.floor(Math.random() * gameObjects.roomPumpObjs.floatyState));
    }
    gameObjects.roomPumpObjs.floaty.scaleX =
        0.9 * gameObjects.roomPumpObjs.floaty.scaleX + 0.1 * gameObjects.roomPumpObjs.floatyGoalScaleX;
    gameObjects.roomPumpObjs.floaty.scaleY =
        0.9 * gameObjects.roomPumpObjs.floaty.scaleY + 0.1 * gameObjects.roomPumpObjs.floatyGoalScaleY;
    gameObjects.roomPumpObjs.floaty.x =
        0.9 * gameObjects.roomPumpObjs.floaty.x + 0.1 * gameObjects.roomPumpObjs.floatyGoalPosX;
    gameObjects.roomPumpObjs.floaty.y =
        0.9 * gameObjects.roomPumpObjs.floaty.y + 0.1 * gameObjects.roomPumpObjs.floatyGoalPosY;
    gameObjects.roomPumpObjs.pressCooldown = Math.max(0, gameObjects.roomPumpObjs.pressCooldown - e);
}
function updateFloatyPumpState(e) {
    let o = gameVars.halfHeight + 175;
    if (e < 4) {
        let a = e / 4;
        setFloatyGoalPos(135, o - 2 * a);
        setFloatyGoalScale(1, 1 + 0.02 * a);
        gameObjects.roomPumpObjs.hose.rotation = gameObjects.roomPumpObjs.hose.baseRotation;
        if (0 !== gameObjects.roomPumpObjs.floatyState) {
            gameObjects.roomPumpObjs.floaty.scaleX = 1.02;
            gameObjects.roomPumpObjs.floaty.scaleY = 1.05;
        }
        setFloatyState(0);
        if (!gameVars.darkPoint) {
            gameObjects.roomPumpObjs.pumpCheckpoint = Math.max(gameObjects.roomPumpObjs.pumpCheckpoint, e - 8);
        }
    } else if (e <= 100) {
        let a = Math.min(1, e / 60);
        setFloatyGoalScale(0.75 + 0.26 * a, 0.9 + 0.12 * a);
        let m = 0;
        if (e <= 50) {
            setFloatyGoalPos(135, o + -10 * a);
        } else {
            setFloatyGoalPos(67.5 + 67.5 * (1 - (m = Math.sqrt((e - 50) / 50))), o - 10 + -200 * m);
        }
        gameObjects.roomPumpObjs.hose.rotation =
            0.9 * gameObjects.roomPumpObjs.hose.rotation + 0.1 * (gameObjects.roomPumpObjs.hose.baseRotation - 0.6 * m);
        if (1 !== gameObjects.roomPumpObjs.floatyState) {
            tweenVolume("gladiatorx", 0.25);
            gameObjects.roomPumpObjs.floaty.scaleX = 0.78;
            gameObjects.roomPumpObjs.floaty.scaleY = 0.92;
        }
        setFloatyState(1);
        if (!gameVars.darkPoint) {
            gameObjects.roomPumpObjs.pumpCheckpoint = Math.max(gameObjects.roomPumpObjs.pumpCheckpoint, e - 10);
        }
    } else if (
        ((gameObjects.roomPumpObjs.hose.rotation =
            0.93 * gameObjects.roomPumpObjs.hose.rotation +
            0.07 * (gameObjects.roomPumpObjs.hose.baseRotation - 0.54 - 0.0006 * e)),
        gameVars.horrorPoint || !gameObjects.roomPumpObjs.canPump || gameVars.darkPoint)
    ) {
        if (gameVars.horrorPoint)
            if (
                ((gameObjects.roomPumpObjs.pumpCheckpoint = Math.max(gameObjects.roomPumpObjs.pumpCheckpoint, e - 10)),
                e <= 150)
            ) {
                setFloatyState(1);
                let a = 1 - (150 - e) / 50;
                setFloatyGoalScale(1 + 0.1 * a, 1 + 0.04 * a);
                setFloatyGoalPos(67.5, o - 215 - 30 * a);
            } else if (e <= 200) {
                let a = 1 - (200 - e) / 50;
                if (1 === gameObjects.roomPumpObjs.floatyState) {
                    showStaticRand(1, undefined, undefined, 0.06);
                    gameObjects.roomPumpObjs.floaty.scaleX = 0.95;
                    gameObjects.roomPumpObjs.floaty.scaleY = 0.95;
                    gameObjects.roomPumpObjs.pumpCheckpoint += 8;
                    playSoundOnce("muffle1");
                    addFloatyShake(3);
                    gameDelay(() => {
                        addFloatyShake(2);
                    }, 0);
                } else {
                    if (3 === gameObjects.roomPumpObjs.floatyState) {
                        gameObjects.roomPumpObjs.floaty.scaleX = 0.98 + 0.09 * a;
                        gameObjects.roomPumpObjs.floaty.scaleY = 0.98 + 0.07 * a;
                    }
                }
                setFloatyState(2);
                setFloatyGoalScale(0.98 + 0.09 * a, 0.98 + 0.07 * a);
                setFloatyGoalPos(67.5, o - 245 - 10 * a);
            } else if (e < 270) {
                let a = 1 - (270 - e) / 70;
                if (2 === gameObjects.roomPumpObjs.floatyState) {
                    showStaticRand(2, undefined, undefined, 0.1);
                    showStaticLite(3, 6, 1);
                    addFloatyShake(3);
                    playSoundOnce("muffle2");
                    gameObjects.roomPumpObjs.floaty.scaleX = 0.89;
                    gameObjects.roomPumpObjs.floaty.scaleY = 0.89;
                    gameObjects.roomPumpObjs.pumpCheckpoint += 12;
                } else {
                    if (4 === gameObjects.roomPumpObjs.floatyState) {
                        gameObjects.roomPumpObjs.floaty.scaleX = 0.9 + 0.1 * a;
                        gameObjects.roomPumpObjs.floaty.scaleY = 0.9 + 0.09 * a;
                    }
                }
                setFloatyState(3);
                addFloatyShake(1 + a);
                setFloatyGoalPos(67.5, o - 255 - 10 * a);
                setFloatyGoalScale(0.9 + 0.1 * a, 0.9 + 0.09 * a);
                gameObjects.roomPumpObjs.balloon1.rotation = -0.01 * a - 0.02;
                gameObjects.roomPumpObjs.balloon2.rotation = 0.01 * a + 0.02;
                if (!gameObjects.roomPumpObjs.showOverblown1 && e > 255) {
                    showStaticLite(1, 7, 1.5);
                    setFloatyState(5);
                    gameObjects.roomPumpObjs.floaty.scaleX = 0.78 + 0.05 * Math.random();
                    gameObjects.roomPumpObjs.floaty.scaleY = 0.78 + 0.05 * Math.random();
                    addFloatyShake(4, 0.2);
                    gameDelay(() => {
                        gameObjects.roomPumpObjs.pumpCheckpoint = 270;
                        gameObjects.roomPumpObjs.showOverblown1 = true;
                        setFloatyState(4);
                        gameObjects.roomPumpObjs.floaty.scaleX = 0.9 + 0.1 * a;
                        gameObjects.roomPumpObjs.floaty.scaleY = 0.9 + 0.09 * a;
                    }, 120);
                }
            } else if (e < 370) {
                if (3 === gameObjects.roomPumpObjs.floatyState) {
                    showStaticLite(6, 10, 1.5);
                    showStaticRand(3, undefined, undefined, 0.15);
                    addFloatyShake(3);
                    playSoundOnce("muffle3");
                    gameObjects.roomPumpObjs.floaty.scaleX = 0.82;
                    gameObjects.roomPumpObjs.floaty.scaleY = 0.84;
                    gameObjects.roomPumpObjs.pumpCheckpoint += 15;
                }
                setFloatyState(4);
                let a = 1 - (370 - e) / 100;
                if (!gameObjects.roomPumpObjs.showOverblown2 && e > 355) {
                    showStaticLite(1, 7, 1.5);
                    showStaticRand(1, undefined, undefined, 0.25);
                    playSoundOnce("muffle4");
                    gameObjects.roomPumpObjs.pumpCheckpoint += 1;
                    if (!gameObjects.roomPumpObjs.randFlash1) {
                        gameObjects.roomPumpObjs.randFlash1 = true;
                        showAltReality(["balloon1", "balloon2", "balloon3", "balloon4", "balloon5"], 1.02, true);
                        playSound("rubber6");
                        gameObjects.sounds.pumpamb.play({
                            loop: true
                        });
                        gameObjects.sounds.pumpamb.volume = 0.1 * gameVars.soundMult;
                        tweenVolume("pumpamb", 0.3, 500);
                    }
                    setFloatyState(7);
                    gameObjects.roomPumpObjs.floaty.scaleX = 0.7 + 0.05 * Math.random();
                    gameObjects.roomPumpObjs.floaty.scaleY = 0.68 + 0.05 * Math.random();
                    addFloatyShake(4, 0.6);
                    gameDelay(() => {
                        gameObjects.roomPumpObjs.showOverblown2 = true;
                        setFloatyState(4);
                        gameObjects.roomPumpObjs.floaty.scaleX = 0.83 + 0.1 * a;
                        gameObjects.roomPumpObjs.floaty.scaleY = 0.85 + 0.08 * a;
                    }, 200);
                }
                gameObjects.roomPumpObjs.balloon1.rotation = -0.01 * a - 0.03;
                gameObjects.roomPumpObjs.balloon2.rotation = 0.03 + 0.01 * a;
                addFloatyShake(2 + a);
                setFloatyGoalPos(67.5, o - 265 - 10 * a);
                setFloatyGoalScale(0.83 + 0.1 * a, 0.85 + 0.08 * a);
            } else if (e < 470) {
                setFloatyState(4);
                let o = 1 - (470 - e) / 100;
                gameObjects.roomPumpObjs.balloon1.rotation = -0.01 * o - 0.04;
                gameObjects.roomPumpObjs.balloon2.rotation = 0.04 + 0.01 * o;
                addFloatyShake(3 + o);
                setFloatyGoalScale(0.93 + 0.07 * o, 0.93 + 0.05 * o);
                gameObjects.sounds.pumpamb.volume = (0.3 + 0.7 * o) * gameVars.soundMult;
            } else if (e < 10000) {
                gameObjects.roomPumpObjs.lastBreath = true;
                gameObjects.roomPumpObjs.pumpAmt += 1;
                let o = 1 - (535 - e) / 20;
                if (
                    (playSoundOnce("muffle8"),
                    setFloatyState(5),
                    (gameObjects.roomPumpObjs.floaty.scaleX = 0.75 + 0.01 * Math.random()),
                    (gameObjects.roomPumpObjs.floaty.scaleY = 0.75 + 0.01 * Math.random()),
                    addFloatyShake(4, 0.05),
                    (gameObjects.roomPumpObjs.pumpCheckpoint += 10),
                    e > 535)
                ) {
                    if (!gameObjects.roomPumpObjs.roomComplete) {
                        playSound("splurt");
                        tweenVolume("gladiatorx", 1);
                        showFlashRand(12, undefined, () => {
                            showStaticRand(2, null, () => {
                                createKey(
                                    20,
                                    gameVars.halfHeight + 240,
                                    gameObjects.roomPumpObjs.roomIndex,
                                    gameObjects.roomPumpObjs.roomContainer,
                                    false
                                );
                                gameObjects.generalRedness.alpha = 1;
                            });
                        });
                        gameObjects.sounds.fan1.stop();
                        gameObjects.sounds.fan2.stop();
                        for (let e = 0; e < gameObjects.roomPumpObjs.floatySprites.length; e++)
                            gameObjects.roomPumpObjs.floatySprites[e].destroy();
                        gameObjects.roomPumpObjs.pumpBtn.destroy();
                        gameObjects.roomPumpObjs.hose.destroy();
                        pumpReleased();
                        gameObjects.scene.tweens.chain({
                            targets: gameObjects.roomPumpObjs.balloon1,
                            tweens: [
                                {
                                    rotation: -0.08,
                                    duration: 600,
                                    ease: "Cubic.easeOut"
                                },
                                {
                                    rotation: 0.02,
                                    duration: 3000,
                                    yoyo: true,
                                    ease: "Sine.easeInOut"
                                }
                            ]
                        });
                        gameObjects.scene.tweens.chain({
                            targets: gameObjects.roomPumpObjs.balloon2,
                            tweens: [
                                {
                                    rotation: 0.08,
                                    duration: 600,
                                    ease: "Cubic.easeOut"
                                },
                                {
                                    rotation: -0.02,
                                    duration: 3200,
                                    yoyo: true,
                                    ease: "Sine.easeInOut"
                                }
                            ]
                        });
                        gameDelay(() => {
                            removeFromUpdateFuncList(roomPumpUpdate);
                        }, 10000);
                        gameObjects.roomPumpObjs.roomComplete = true;
                        roomPumpMarkStage(ROOM_PUMP_STAGE_POPPED);
                        gameObjects.roomPumpObjs.frames.destroy();
                        gameObjects.roomPumpObjs.frames = globalScene.add.image(0, 250, "roomPump", "framesFloaty2");
                        gameObjects.roomPumpObjs.roomContainer.add(gameObjects.roomPumpObjs.frames);
                    }
                } else if (e > 525) {
                    setFloatyState(6);
                    gameObjects.roomPumpObjs.floaty.scaleX = 0.75 + 0.1 * Math.random() + 0.1 * o;
                    gameObjects.roomPumpObjs.floaty.scaleY = 0.75 + 0.04 * Math.random() + 0.08 * o;
                } else {
                    if (!gameObjects.roomPumpObjs.showOverblown3 && e > 505) {
                        gameObjects.roomPumpObjs.showOverblown3 = true;
                        tweenVolume("pumpamb", 0);
                        gameDelay(() => {
                            gameObjects.sounds.pumpamb.stop();
                        });
                        showAltReality(["floaty1", "floaty2", "floaty3", "floaty2", "floaty4", "floaty1"], 1.02, true);
                    }
                }
            }
    } else {
        gameObjects.roomPumpObjs.canPump = false;
        roomPumpMarkStage(ROOM_PUMP_STAGE_INFLATED);
        gameObjects.roomPumpObjs.pumpCheckpoint = 100;
        gameObjects.roomPumpObjs.pumpBtn.disappear();
        setFloatyGoalPos(67.5, o - 215);
        gameDelay(() => {
            createKey(
                -60,
                gameVars.halfHeight - 130,
                gameObjects.roomPumpObjs.roomIndex,
                gameObjects.roomPumpObjs.roomContainer,
                true
            );
        }, 300);
    }
    let a = Math.min(1, 8 * gameObjects.roomPumpObjs.fan.rotVel - 0.2);
    if (a < 0.02 || gameObjects.roomPumpObjs.roomComplete) {
        if (gameObjects.sounds.fan1.isPlaying) {
            gameObjects.sounds.fan1.stop();
        }
        if (gameObjects.sounds.fan2.isPlaying) {
            gameObjects.sounds.fan2.stop();
        }
    } else if (
        (gameObjects.sounds.fan1.isPlaying ||
            gameObjects.sounds.fan1.play({
                loop: true
            }),
        gameObjects.sounds.fan2.isPlaying ||
            gameObjects.sounds.fan2.play({
                loop: true
            }),
        e < 150)
    ) {
        gameObjects.sounds.fan1.volume = a * gameVars.soundMult;
        gameObjects.sounds.fan2.volume = 0;
    } else if (e < 300) {
        let o = (e - 150) / 150;
        gameObjects.sounds.fan1.volume = (1 - o) * a * gameVars.soundMult;
        gameObjects.sounds.fan2.volume = o * a * 1.15 * gameVars.soundMult;
    } else {
        gameObjects.sounds.fan1.volume = 0;
        gameObjects.sounds.fan2.volume = 1.15 * a * gameVars.soundMult;
    }
}
function pumpPressed() {
    if (!(gameObjects.roomPumpObjs.pressCooldown > 0)) {
        gameObjects.roomPumpObjs.buttonPressed = true;
        gameObjects.roomPumpObjs.pressCooldown = 20;
        playSound("airpump", undefined, 0.25);
        gameObjects.roomPumpObjs.buttonPressCarryOver = 999999;
    }
}
function pumpReleased() {
    if (gameObjects.roomPumpObjs.buttonPressed) {
        gameObjects.roomPumpObjs.buttonPressed = false;
        gameObjects.roomPumpObjs.buttonPressCarryOver = 23;
    }
}
function cleanupPump() {
    gameObjects.roomPumpObjs.cleanupBtn.destroy();
    gameObjects.roomPumpObjs.pumpCheckpoint = 0;
    gameObjects.exhibit.needCleanup = false;
    roomPumpMarkStage(ROOM_PUMP_STAGE_DEFLATED);
    messageBus.publish("saveCheckpoint");
    gameDelay(() => {
        playSound("deepbell5");
        updateInfoTextSoft(TEXT.roomCleaned, 2250);
    }, 500);
}
function setFloatyState(e) {
    if (e != gameObjects.roomPumpObjs.floatyState) {
        gameObjects.roomPumpObjs.prevFloatyState = gameObjects.roomPumpObjs.floatyState;
        let o = gameObjects.roomPumpObjs.floaty.x;
        let a = gameObjects.roomPumpObjs.floaty.y;
        let m = gameObjects.roomPumpObjs.floaty.scaleX;
        let t = gameObjects.roomPumpObjs.floaty.scaleY;
        gameObjects.roomPumpObjs.floatyState = e;
        gameObjects.roomPumpObjs.floaty.visible = false;
        gameObjects.roomPumpObjs.floaty = gameObjects.roomPumpObjs.floatySprites[gameObjects.roomPumpObjs.floatyState];
        gameObjects.roomPumpObjs.floaty.visible = true;
        gameObjects.roomPumpObjs.floaty.x = o;
        gameObjects.roomPumpObjs.floaty.y = a;
        gameObjects.roomPumpObjs.floaty.scaleX = m;
        gameObjects.roomPumpObjs.floaty.scaleY = t;
    }
}
function setFloatyGoalPos(e, o) {
    gameObjects.roomPumpObjs.floatyGoalPosX = e;
    gameObjects.roomPumpObjs.floatyGoalPosY = o;
}
function addFloatyShake(e, o = 0) {
    gameObjects.roomPumpObjs.floaty.x += (Math.random() - 0.5) * e;
    gameObjects.roomPumpObjs.floaty.y += (Math.random() - 0.5) * e;
    gameObjects.roomPumpObjs.floaty.rotation *= 0.2;
    gameObjects.roomPumpObjs.floaty.rotation += (Math.random() - 0.5) * o;
}
function setFloatyGoalScale(e, o) {
    gameObjects.roomPumpObjs.floatyGoalScaleX = e;
    gameObjects.roomPumpObjs.floatyGoalScaleY = o;
}
function frameKidUpdate() {
    let e = gameVars.mouseposx - gameObjects.roomPumpObjs.frameKid.x - gameVars.halfWidth;
    let o = gameVars.mouseposy - gameObjects.roomPumpObjs.frameKid.y;
    let a = Math.abs(e) + Math.abs(o);
    let m = Math.max(0, Math.min(1, 0.005 * (a - 150)));
    gameObjects.roomPumpObjs.frameKid.alpha = 0.9985 * gameObjects.roomPumpObjs.frameKid.alpha + 0.0015 * m;
    gameObjects.roomPumpObjs.frameKid.x = gameObjects.roomPumpObjs.frameKid.origX + 3 * Math.random() - 1.5;
    gameObjects.roomPumpObjs.frameKid.y = gameObjects.roomPumpObjs.frameKid.origY + 3 * Math.random() - 1.5;
    if (gameObjects.roomPumpObjs.frameKid.alpha < 0.95) {
        removeFromUpdateFuncList(frameKidUpdate);
        gameObjects.roomPumpObjs.frameKid.destroy();
        gameObjects.roomPumpObjs.frameKid.isDestroyed = true;
    }
}

// ============================================================== save state ===
//
// Mr. Floaty is completed three times: inflated until he floats (normal),
// deflated again (dark cleanup), then overinflated until he pops (horror).
//
// Two ordering hazards, both caused by restore republishing the phase topics
// BEFORE it applies room state:
//
//  1. startDarkSequence parks cleanupBtn — the "click Mr. Floaty to deflate
//     him" hotspot — at floaty.x/floaty.y. At that point Floaty is still on his
//     pedestal, so the hotspot was left down there while this function then
//     lifted Floaty into the air, and clicking him did nothing. cleanupBtn is
//     therefore re-parked at the END of this function, once Floaty has moved.
//  2. startHorrorSequence re-arms pumpBtn (reappear + canPump), which a
//     restorer that unconditionally disarms the pump would undo.
//
// Same rule as roomfaucet.js: only disarm a control when this room's work for
// the phase the player is CURRENTLY in has already been done.

var ROOM_PUMP_STAGE_NONE = 0;
var ROOM_PUMP_STAGE_INFLATED = 1; // normal phase: pumped up, yellow key given
var ROOM_PUMP_STAGE_DEFLATED = 2; // dark phase: deflated again
var ROOM_PUMP_STAGE_POPPED = 3; // horror phase: popped, red key given

function roomPumpMarkStage(stage) {
    let r = gameObjects.roomPumpObjs;
    if (r && (!r.saveStage || r.saveStage < stage)) {
        r.saveStage = stage;
    }
}
function roomPumpGetSaveStage() {
    let r = gameObjects.roomPumpObjs;
    return (r && r.saveStage) || ROOM_PUMP_STAGE_NONE;
}
function roomPumpPhaseSatisfied(stage) {
    if (gameVars.horrorPoint) return stage >= ROOM_PUMP_STAGE_POPPED;
    if (gameVars.darkPoint) return stage >= ROOM_PUMP_STAGE_DEFLATED;
    return stage >= ROOM_PUMP_STAGE_INFLATED;
}

// roomPumpUpdate only lerps toward the goals, so a restored room would visibly
// drift into place when walked into. Snap Floaty onto them instead.
function roomPumpSnapFloatyToGoals() {
    let r = gameObjects.roomPumpObjs;
    if (!r.floaty) return;
    r.floaty.x = r.floatyGoalPosX;
    r.floaty.y = r.floatyGoalPosY;
    r.floaty.scaleX = r.floatyGoalScaleX;
    r.floaty.scaleY = r.floatyGoalScaleY;
}

// Puts the room straight into the end state of `stage`.
//
// STATE ONLY — no tweens, sounds, static or gameDelay chains.
function roomPumpSetSaveStage(stage) {
    let r = gameObjects.roomPumpObjs;
    if (!r || !stage) return;
    r.saveStage = stage;
    if (stage >= ROOM_PUMP_STAGE_POPPED) {
        // Tail of the horror pop in updateFloatyPumpState. Floaty's sprites are
        // destroyed here, so nothing below may touch him — return early.
        r.roomComplete = true;
        r.canPump = false;
        for (let i = 0; i < r.floatySprites.length; i++) {
            if (saveAlive(r.floatySprites[i])) r.floatySprites[i].destroy();
        }
        if (saveAlive(r.pumpBtn)) r.pumpBtn.destroy();
        if (saveAlive(r.hose)) r.hose.destroy();
        if (saveAlive(r.cleanupBtn)) r.cleanupBtn.destroy();
        pumpReleased();
        if (saveAlive(r.frames)) r.frames.destroy();
        r.frames = globalScene.add.image(0, 250, "roomPump", "framesFloaty2");
        r.roomContainer.add(r.frames);
        removeFromUpdateFuncList(roomPumpUpdate);
        return;
    }
    if (stage === ROOM_PUMP_STAGE_DEFLATED) {
        // cleanupPump: the checkpoint drops to 0 and Floaty sinks back down.
        // NOTE: canPump is deliberately NOT set here — it belongs to the phase,
        // and is decided once in the control block below.
        r.pumpAmt = 0;
        r.pumpCheckpoint = 0;
        updateFloatyPumpState(0);
        roomPumpSnapFloatyToGoals();
    } else {
        // ROOM_PUMP_STAGE_INFLATED — the tail of the normal-phase branch in
        // updateFloatyPumpState (roompump.js:236).
        //
        // Deliberately NOT replaying that branch's setFloatyGoalPos(67.5, o-215):
        // roomPumpUpdate calls updateFloatyPumpState every frame, which
        // recomputes the goal as o-210 and wins. o-215 is a one-frame value
        // Floaty never rests at, and parking the cleanup hotspot there left it
        // 5px off him. Let the room compute its own settled goal.
        r.pumpAmt = 100;
        r.pumpCheckpoint = 100;
        updateFloatyPumpState(100);
        roomPumpSnapFloatyToGoals();
    }

    // Arm the control this phase actually uses, now that Floaty is in place.
    //
    // canPump is set on BOTH paths of every branch. Leaving it untouched on the
    // "not satisfied" path is not good enough: a stage branch above may have
    // cleared it, which is exactly how the horror phase broke — Floaty is at
    // DEFLATED when horror begins, startHorrorSequence re-armed the pump, and
    // the DEFLATED branch then set canPump back to false, leaving the button
    // visible but inert.
    let satisfied = roomPumpPhaseSatisfied(stage);
    if (gameVars.horrorPoint) {
        // The horror phase pumps him again, harder.
        if (satisfied) {
            r.canPump = false;
            if (saveAlive(r.pumpBtn)) r.pumpBtn.disappear();
        } else {
            r.canPump = true;
            if (saveAlive(r.pumpBtn)) {
                r.pumpBtn.reappear();
                r.pumpBtn.setPos(-240, 500);
            }
        }
    } else if (gameVars.darkPoint) {
        // The dark phase is a single click on Floaty himself, never pumping.
        r.canPump = false;
        if (satisfied) {
            if (saveAlive(r.cleanupBtn)) r.cleanupBtn.destroy();
        } else if (saveAlive(r.cleanupBtn)) {
            // Re-park the hotspot on Floaty AFTER he has been moved above.
            r.cleanupBtn.setPos(r.floaty.x, r.floaty.y);
        }
    } else {
        r.canPump = false;
        if (saveAlive(r.pumpBtn)) r.pumpBtn.disappear();
    }
}
