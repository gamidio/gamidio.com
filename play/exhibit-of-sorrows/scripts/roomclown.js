function setupRoomClown1(scene, o, a) {
    let l;
    gameObjects.exhibit.setBackgroundAtIndex(o, "bgs", "bg4");
    gameObjects.roomClown1 = {
        roomIndex: o,
        roomContainer: a
    };
    gameObjects.roomClown1.portraitWhite = globalScene.add.image(
        0,
        gameVars.halfHeight - 50,
        "roomClown",
        "portraitWhite"
    );
    a.add(gameObjects.roomClown1.portraitWhite);
    gameObjects.roomClown1.portrait = globalScene.add.image(0, gameVars.halfHeight - 50, "roomClown", "portrait");
    a.add(gameObjects.roomClown1.portrait);
    gameObjects.roomClown1.flower = scene.add.image(300, gameVars.height - 28, "misc", "flower1");
    gameObjects.roomClown1.flower.setOrigin(0.5, 1);
    a.add(gameObjects.roomClown1.flower);
    gameObjects.roomClown1.clown = globalScene.add.image(0, gameVars.halfHeight + 93, "roomClown", "clownsmall1");
    a.add(gameObjects.roomClown1.clown);
    gameObjects.roomClown1.nose = new Button(
        scene,
        a,
        () => {
            nosePress1(o, a);
        },
        {
            atlas: "roomClown",
            ref: "noseglow",
            x: 12,
            y: gameVars.halfHeight + 73,
            alpha: 0.001,
            scaleX: 0.155,
            scaleY: 0.155
        },
        {
            atlas: "roomClown",
            ref: "noseglow",
            alpha: 1,
            scaleX: 0.158,
            scaleY: 0.158
        }
    );
    registerRoomSaveState(o, {
        getStage: roomClown1GetSaveStage,
        setStage: roomClown1SetSaveStage
    });
    l = messageBus.subscribe("exhibitMove", (e) => {
        if (e === o) {
            roomClownMarkStage(gameObjects.roomClown1, ROOM_CLOWN_STAGE_VISITED);
            gameDelay(() => {
                if (gameVars.firstNosePressed) {
                    return;
                }
                let clownNoseFlash = globalScene.add.image(
                    gameVars.halfWidth + 26,
                    gameVars.halfHeight + 67,
                    "roomClown",
                    "clownnoseflash"
                );
                clownNoseFlash.setScale(0.27, 0.37).setRotation(-0.35);
                globalScene.tweens.add({
                    targets: clownNoseFlash,
                    alpha: 0,
                    duration: 700,
                    completeDelay: 2000,
                    onComplete: () => {
                        if (!gameVars.firstNosePressed) {
                            clownNoseFlash.alpha = 0.7;
                            clownNoseFlash.scaleX = 0.27;
                            clownNoseFlash.scaleY = 0.37;
                            globalScene.tweens.add({
                                targets: clownNoseFlash,
                                alpha: 0,
                                ease: "Quad.easeOut",
                                duration: 800,
                                onComplete: () => {
                                    clownNoseFlash.destroy();
                                }
                            });
                            globalScene.tweens.add({
                                targets: clownNoseFlash,
                                scaleX: 0.6,
                                scaleY: 0.83,
                                ease: "Cubic.easeOut",
                                duration: 800
                            });
                        } else {
                            clownNoseFlash.destroy();
                        }
                    }
                });
                globalScene.tweens.add({
                    targets: clownNoseFlash,
                    scaleX: 0.6,
                    scaleY: 0.83,
                    ease: "Cubic.easeOut",
                    duration: 700
                });
            }, 1500);
            l.unsubscribe();
            let e = gameObjects.clownWelcomePic.x;
            let o = gameObjects.clownWelcomePic.y;
            let a = gameObjects.clownWelcomePic.scaleX;
            gameObjects.clownWelcomePic.destroy();
            gameObjects.clownWelcomePic = globalScene.add.image(e, o, "menu", "framesEnter4");
            gameObjects.clownWelcomePic.scaleX = a;
            gameObjects.clownWelcomePic.scaleY = a;
            gameObjects.clownWelcomePic.cantChange = true;
            gameObjects.gameCtnr1.add(gameObjects.clownWelcomePic);
            tweenVolume("gladiator0", 0.5);
        }
    });
}
function setupRoomClown2(scene, o, a) {
    let l;
    gameObjects.exhibit.setBackgroundAtIndex(o, "bgs", "bg7");
    if (!gameObjects.roomClown2) {
        gameObjects.roomClown2 = {
            roomIndex: o,
            roomContainer: a
        };
    }
    gameObjects.roomClown2.portraitWhite = globalScene.add.image(
        0,
        gameVars.halfHeight - 50,
        "roomClown",
        "portraitWhite"
    );
    a.add(gameObjects.roomClown2.portraitWhite);
    gameObjects.roomClown2.portrait = globalScene.add.image(0, gameVars.halfHeight - 50, "roomClown", "portrait");
    a.add(gameObjects.roomClown2.portrait);
    gameObjects.roomClown2.flower = scene.add.image(300, gameVars.height - 28, "misc", "flower1");
    gameObjects.roomClown2.flower.setOrigin(0.5, 1);
    a.add(gameObjects.roomClown2.flower);
    gameObjects.roomClown2.clown = globalScene.add.image(0, gameVars.halfHeight + 14, "roomClown", "clownnormal");
    a.add(gameObjects.roomClown2.clown);
    gameObjects.roomClown2.clown.scaleX = 0.25;
    gameObjects.roomClown2.clown.scaleY = 0.25;
    gameObjects.roomClown2.nose = new Button(
        scene,
        a,
        () => {
            nosePress2(o, a);
        },
        {
            atlas: "roomClown",
            ref: "noseglow",
            x: 19,
            y: gameVars.halfHeight - 14,
            alpha: 0.001,
            scaleX: 0.25,
            scaleY: 0.25
        },
        {
            atlas: "roomClown",
            ref: "noseglow",
            alpha: 1,
            scaleX: 0.25,
            scaleY: 0.25
        }
    );
    registerRoomSaveState(o, {
        getStage: roomClown2GetSaveStage,
        setStage: roomClown2SetSaveStage
    });
    l = messageBus.subscribe("exhibitMove", (e) => {
        if (e === o) {
            l.unsubscribe();
            roomClownMarkStage(gameObjects.roomClown2, ROOM_CLOWN_STAGE_VISITED);
            roomClownPrune(gameObjects.roomClown1);
        }
    });
}
function setupRoomClown3(scene, o, a) {
    let l;
    gameObjects.exhibit.setBackgroundAtIndex(o, "bgs", "bg9");
    if (!gameObjects.roomClown3) {
        gameObjects.roomClown3 = {
            roomIndex: o,
            roomContainer: a
        };
    }
    gameObjects.roomClown3.portraitWhite = globalScene.add.image(
        5,
        gameVars.halfHeight - 50,
        "roomClown",
        "portraitWhite"
    );
    a.add(gameObjects.roomClown3.portraitWhite);
    gameObjects.roomClown3.portrait = globalScene.add.image(5, gameVars.halfHeight - 50, "roomClown", "portrait");
    a.add(gameObjects.roomClown3.portrait);
    gameObjects.roomClown3.clown = globalScene.add.image(0, gameVars.halfHeight - 46, "roomClown", "clownlarge1");
    a.add(gameObjects.roomClown3.clown);
    gameObjects.roomClown3.nose = new Button(scene, {
        container: a,
        normal: {
            atlas: "roomClown",
            ref: "noseglow",
            x: 25.5,
            y: gameVars.halfHeight - 83,
            alpha: 0.001,
            scaleX: 0.33,
            scaleY: 0.33
        },
        hover: {
            atlas: "roomClown",
            ref: "noseglow",
            alpha: 1,
            scaleX: 0.335,
            scaleY: 0.335
        },
        onMouseUp: () => {
            nosePress3(o, a);
        }
    });
    registerRoomSaveState(o, {
        getStage: roomClown3GetSaveStage,
        setStage: roomClown3SetSaveStage
    });
    l = messageBus.subscribe("exhibitMove", (e) => {
        if (e === o) {
            l.unsubscribe();
            roomClownMarkStage(gameObjects.roomClown3, ROOM_CLOWN_STAGE_VISITED);
            roomClownPrune(gameObjects.roomClown1);
            roomClownPrune(gameObjects.roomClown2);
        }
    });
    messageBus.subscribe("prepareFinalClown", (l) => {
        disableMoveButtons();
        gameObjects.roomClown3.portrait.destroy();
        gameObjects.roomClown3.clown = globalScene.add.image(0, gameVars.halfHeight + 60, "roomClown", "clowncreepy");
        gameObjects.roomClown3.clown.scaleX = 0.75;
        gameObjects.roomClown3.clown.scaleY = 0.75;
        gameObjects.roomClown3.clownLeftEye = globalScene.add.image(
            -66,
            gameVars.halfHeight - 100,
            "roomClown",
            "leftEye"
        );
        gameObjects.roomClown3.clownLeftEye.origX = gameObjects.roomClown3.clownLeftEye.x;
        gameObjects.roomClown3.clownLeftEye.origY = gameObjects.roomClown3.clownLeftEye.y;
        gameObjects.roomClown3.clownLeftEye.scaleX = 0.75;
        gameObjects.roomClown3.clownLeftEye.scaleY = 0.75;
        gameObjects.roomClown3.clownRightEye = globalScene.add.image(
            203,
            gameVars.halfHeight - 60,
            "roomClown",
            "leftEye"
        );
        gameObjects.roomClown3.clownRightEye.origX = gameObjects.roomClown3.clownRightEye.x;
        gameObjects.roomClown3.clownRightEye.origY = gameObjects.roomClown3.clownRightEye.y;
        gameObjects.roomClown3.clownRightEye.scaleX = 0.75;
        gameObjects.roomClown3.clownRightEye.scaleY = 0.75;
        a.add(gameObjects.roomClown3.clown);
        a.add(gameObjects.roomClown3.clownLeftEye);
        a.add(gameObjects.roomClown3.clownRightEye);
        addToUpdateFuncList(shakeClownEyes);
        disableMoveLeftButton();
        gameObjects.roomClown3.nose2 = new Button(
            scene,
            a,
            () => {
                nosePressFinal(o, a);
            },
            {
                atlas: "roomClown",
                ref: "noseglow",
                x: 58,
                y: gameVars.halfHeight - 22,
                alpha: 0.01,
                scaleX: 0.75,
                scaleY: 0.75
            },
            {
                atlas: "roomClown",
                ref: "noseglow",
                alpha: 0.25
            }
        );
    });
}
function shakeClownEyes() {
    gameObjects.roomClown3.clownRightEye.x =
        gameObjects.roomClown3.clownRightEye.origX +
        2 * Math.random() +
        0.003 * (gameVars.mouseposx - gameVars.halfWidth);
    gameObjects.roomClown3.clownRightEye.y =
        gameObjects.roomClown3.clownRightEye.origY +
        2 * Math.random() +
        0.0012 * (gameVars.mouseposy - gameVars.halfHeight);
    gameObjects.roomClown3.clownLeftEye.x =
        gameObjects.roomClown3.clownLeftEye.origX +
        2 * Math.random() +
        0.003 * (gameVars.mouseposx - gameVars.halfWidth);
    gameObjects.roomClown3.clownLeftEye.y =
        gameObjects.roomClown3.clownLeftEye.origY +
        2 * Math.random() +
        0.0012 * (gameVars.mouseposy - gameVars.halfHeight);
}
function nosePress1(e, scene) {
    let a;
    let l = gameObjects.roomClown1.clown.y;
    gameObjects.roomClown1.clown.destroy();
    gameObjects.roomClown1.clown = globalScene.add.image(0, l, "roomClown", "clownsmall2");
    scene.add(gameObjects.roomClown1.clown);
    gameObjects.roomClown1.nose.destroy();
    gameDelay(() => {
        createKey(
            5,
            gameVars.halfHeight + 130,
            gameObjects.roomClown1.roomIndex,
            gameObjects.roomClown1.roomContainer,
            true
        );
    }, 100);
    a = messageBus.subscribe("exhibitMoveRight", () => {
        a.unsubscribe();
        gameDelay(() => {
            let e = globalScene.add.image(0, l, "roomClown", "clownsmall3");
            scene.add(e);
            playSound("clownlaugh1");
            gameDelay(() => {
                e.destroy();
            }, 1000);
            showStaticRand(1, null, undefined, 0.08);
            gameObjects.generalDarkness.alpha = 0.05;
            gameDelay(() => {
                gameObjects.generalDarkness.alpha = 0;
            }, 50);
        }, 350);
    });
    gameVars.firstNosePressed = true;
}
function nosePress2(e, scene) {
    roomClownMarkStage(gameObjects.roomClown2, ROOM_CLOWN_STAGE_DONE);
    gameObjects.roomClown2.nosePressed = true;
    gameObjects.roomClown2.nose.destroy();
    let a = gameObjects.roomClown2.clown.y;
    gameObjects.roomClown2.clown.destroy();
    gameObjects.roomClown2.clown = globalScene.add.image(0, a, "roomClown", "clownlarge1");
    scene.add(gameObjects.roomClown2.clown);
    gameObjects.roomClown2.clown.scaleX = 0.76;
    gameObjects.roomClown2.clown.scaleY = 0.76;
    gameDelay(() => {
        gameObjects.generalDarkness.alpha = 0.03;
        gameDelay(() => {
            gameObjects.generalDarkness.alpha = 0.1;
            gameDelay(() => {
                gameObjects.generalDarkness.alpha = 0;
                gameDelay(() => {
                    gameObjects.generalDarkness.alpha = 0.05;
                    gameDelay(() => {
                        gameObjects.generalDarkness.alpha = 0;
                    }, 10);
                }, 500);
            }, 10);
        }, 50);
    }, 23);
    gameDelay(() => {
        createKey(
            12,
            gameVars.halfHeight + 150,
            gameObjects.roomClown2.roomIndex,
            gameObjects.roomClown2.roomContainer,
            true
        );
    }, 500);
}
function nosePress3(e, scene) {
    if ((gameObjects.roomClown3.nose.setPos(19, -9999), gameObjects.roomClown3.clickedOnce)) {
        gameObjects.roomClown3.nose.destroy();
        playSound("keyfound");
        gameDelay(() => {
            playSound("click3");
            showStaticRand(5);
        }, 500);
        let a = globalScene.add.image(0, 600, "buttons", "key_red");
        scene.add(a);
        gameVars.clownRedKeyUp = true;
        // messageBus.publish("saveCheckpoint"); // reactivate to save on clown3's red key spawn
        let l = new Button(globalScene, {
            container: scene,
            normal: {
                ref: "blackPixel",
                x: 0,
                y: 615,
                scaleX: 55,
                scaleY: 25,
                alpha: 0.001
            },
            onHover: () => {
                keyPosX = null;
                keyPosY = null;
                keyRoomIdx = null;
                l.destroy();
                gameObjects.roomClown3.clown.visible = false;
                gameObjects.roomClown3.clown.destroy();
                let a = globalScene.add.image(0, gameVars.halfHeight - 50, "roomClown", "clownlarge2");
                scene.add(a);
                showStaticRand(5);
                playSound("clownlaugh2");
                tempFreeze(800);
                gameDelay(() => {
                    a.x = -3;
                    gameDelay(() => {
                        a.scaleX = 1.03;
                        a.x = 4;
                        gameDelay(() => {
                            a.x = -7;
                            a.scaleX = 1.08;
                            a.scaleY = 1.02;
                            gameDelay(() => {
                                a.x = 9;
                                a.scaleX = 1.18;
                                a.scaleY = 1.05;
                                gameDelay(() => {
                                    a.visible = false;
                                    let l = globalScene.add.image(
                                        -150,
                                        gameVars.halfHeight - 94,
                                        "roomClown",
                                        "clownunleashed"
                                    );
                                    scene.add(l);
                                    gameDelay(() => {
                                        l.visible = false;
                                        let t = globalScene.add.image(
                                            0,
                                            gameVars.halfHeight + 70,
                                            "roomClown",
                                            "clownunleashed2"
                                        );
                                        t.scaleX = 1.02;
                                        t.scaleY = 1;
                                        scene.add(t);
                                        gameDelay(() => {
                                            t.scaleX = 1.3;
                                            t.scaleY = 1.3;
                                            gameDelay(() => {
                                                t.scaleX = 1.25;
                                                t.scaleY = 1.25;
                                                showFlashArr([0, 1, 12, 2, 3, 12, 6, 13, 7, 14, 8], () => {
                                                    l.destroy();
                                                    a.destroy();
                                                    t.destroy();
                                                    gameObjects.roomClown3.portrait.destroy();
                                                    gameObjects.roomClown3.portrait = globalScene.add.image(
                                                        0,
                                                        gameVars.halfHeight - 50,
                                                        "roomClown",
                                                        "portraitbroken"
                                                    );
                                                    scene.add(gameObjects.roomClown3.portrait);
                                                    initDarkSequence(e);
                                                    enableMoveButtons();
                                                    gameDelay(() => {
                                                        gameObjects.sounds.gladiator1.volume =
                                                            0.25 * gameVars.soundMult;
                                                        gameObjects.sounds.gladiator2.volume = 0;
                                                        tweenVolume("gladiator1", 1);
                                                        gameObjects.musicBoxNote.alpha = 1;
                                                        gameObjects.musicBoxNote2.alpha = 1;
                                                        gameObjects.musicBoxNote.origX = gameObjects.musicBox.x;
                                                        gameObjects.musicBoxNote.origY = gameObjects.musicBox.y - 50;
                                                        gameObjects.sounds.gladiator0.stop();
                                                        gameObjects.sounds.gladiator1.play({
                                                            loop: true
                                                        });
                                                        gameObjects.sounds.gladiator2.play({
                                                            loop: true
                                                        });
                                                        globalScene.tweens.chain({
                                                            targets: [
                                                                gameObjects.moveRightBtnHighlight,
                                                                gameObjects.moveLeftBtnHighlight
                                                            ],
                                                            tweens: [
                                                                {
                                                                    alpha: 1,
                                                                    ease: "Cubic.easeIn",
                                                                    duration: 800
                                                                },
                                                                {
                                                                    alpha: 0,
                                                                    ease: "Quad.easeOut",
                                                                    duration: 2000
                                                                }
                                                            ]
                                                        });
                                                    }, 1700);
                                                });
                                            }, 50);
                                        }, 50);
                                    }, 200);
                                }, 20);
                            }, 40);
                        }, 40);
                    }, 40);
                }, 10);
            }
        });
    } else
        gameDelay(() => {
            playSound("keyfound");
            let e = globalScene.add.image(gameVars.halfWidth + 20, 600, "buttons", "key_yellow");
            showStaticLite(2, 2);
            gameDelay(() => {
                gameObjects.roomClown3.clownTemp = globalScene.add.image(
                    -100,
                    gameVars.halfHeight - 46,
                    "roomClown",
                    "clownlarge2"
                );
                gameObjects.roomClown3.clownTemp.scaleX = 1.5;
                gameObjects.roomClown3.clownTemp.alpha = 0.5;
                scene.add(gameObjects.roomClown3.clownTemp);
                gameDelay(() => {
                    gameObjects.roomClown3.clownTemp.x = 20;
                }, 0);
                gameDelay(() => {
                    showStaticRand(8);
                    showStaticLite(3, 3);
                    let clownNoseFlash = globalScene.add.image(
                        gameVars.halfWidth + 39,
                        gameVars.halfHeight - 151,
                        "roomClown",
                        "clownnoseflash"
                    );
                    globalScene.tweens.add({
                        targets: clownNoseFlash,
                        alpha: 0,
                        duration: 700,
                        completeDelay: 2000,
                        onComplete: () => {
                            if (!gameVars.clownRedKeyUp) {
                                clownNoseFlash.alpha = 0.7;
                                clownNoseFlash.scaleX = 1.2;
                                clownNoseFlash.scaleY = 1.2;
                                globalScene.tweens.add({
                                    targets: clownNoseFlash,
                                    alpha: 0,
                                    ease: "Quad.easeOut",
                                    duration: 800,
                                    onComplete: () => {
                                        clownNoseFlash.destroy();
                                    }
                                });
                                globalScene.tweens.add({
                                    targets: clownNoseFlash,
                                    scaleX: 2,
                                    scaleY: 2,
                                    ease: "Cubic.easeOut",
                                    duration: 800
                                });
                            } else {
                                clownNoseFlash.destroy();
                            }
                        }
                    });
                    globalScene.tweens.add({
                        targets: clownNoseFlash,
                        scaleX: 2,
                        scaleY: 2,
                        ease: "Cubic.easeOut",
                        duration: 700,
                        onComplete: () => {
                            showStaticRand(5);
                            showStaticLiteObj(1, 1);
                        }
                    });
                    let clownLargeInstant = globalScene.add.image(
                        gameVars.halfWidth,
                        gameVars.halfHeight,
                        "roomClown",
                        "clownlarge3"
                    );
                    clownLargeInstant.setScale(2).setAlpha(0.5);
                    globalScene.tweens.add({
                        targets: clownLargeInstant,
                        alpha: 0,
                        ease: "Quart.easeOut",
                        duration: 100,
                        onComplete: () => {
                            clownLargeInstant.destroy();
                        }
                    });
                    gameObjects.roomClown3.clown.destroy();
                    gameObjects.roomClown3.clownTemp.destroy();
                    gameObjects.roomClown3.clown = globalScene.add.image(
                        0,
                        gameVars.halfHeight - 47,
                        "roomClown",
                        "clownlarge3"
                    );
                    gameObjects.roomClown3.clown.scaleX = 0.93;
                    gameObjects.roomClown3.clown.scaleY = 0.96;
                    scene.add(gameObjects.roomClown3.clown);
                    gameObjects.roomClown3.mouthlarge = globalScene.add.image(
                        0,
                        gameVars.halfHeight - 50,
                        "roomClown",
                        "mouthlarge"
                    );
                    gameObjects.roomClown3.mouthlarge.scaleX = 0.93;
                    gameObjects.roomClown3.mouthlarge.scaleY = 0.96;
                    gameObjects.roomClown3.mouthlarge.origScaleY = gameObjects.roomClown3.mouthlarge.scaleY;
                    scene.add(gameObjects.roomClown3.mouthlarge);
                    addToUpdateFuncList(shakeClownMouth);
                    playSound("click1");
                    gameDelay(() => {
                        e.destroy();
                        playSound("click", 4);
                        showStaticRand(
                            3,
                            null,
                            () => {
                                showFlashRand(1);
                            },
                            0.3
                        );
                        gameDelay(() => {
                            showStaticLite(3, 3);
                        }, 300);
                        gameDelay(() => {
                            gameObjects.roomClown3.nose.setPos(35, gameVars.halfHeight - 155);
                            playSound("click1");
                        }, 400);
                        gameObjects.roomClown3.clickedOnce = true;
                        /* , messageBus.publish("saveCheckpoint") // reactivate to save on clown3's bait key spawn */
                    }, 40);
                }, 50);
            }, 700);
        }, 100);
}
function nosePressFinal(e, scene) {
    gameObjects.roomClown3.nose2.destroy();
    gameObjects.roomClown3.clown.destroy();
    gameObjects.roomClown3.mouthlarge.destroy();
    removeFromUpdateFuncList(shakeClownMouth);
    gameObjects.roomClown3.clown = globalScene.add.image(0, gameVars.halfHeight + 60, "roomClown", "clownnormal");
    gameObjects.roomClown3.clown.scaleX = 0.75;
    gameObjects.roomClown3.clown.scaleY = 0.75;
    scene.add(gameObjects.roomClown3.clown);
    gameDelay(() => {
        createKey(
            25,
            gameVars.halfHeight + 180,
            gameObjects.roomClown3.roomIndex,
            gameObjects.roomClown3.roomContainer,
            true,
            disableMoveLeftButton
        );
    }, 100);
}
function shakeClownMouth() {
    gameObjects.roomClown3.mouthlarge.scaleY =
        gameObjects.roomClown3.mouthlarge.origScaleY + 0.05 * Math.random() + 0.01;
}

// ============================================================== save state ===
//
// The three clown rooms prune the corridor behind them: walking into clown 2
// removes clown 1, walking into clown 3 removes clown 2 (the exhibitMove
// subscribers in setupRoomClown2 / setupRoomClown3). That pruning is triggered
// by ENTERING a room, and a restore only re-enters the one room the player was
// saved in — so reloading anywhere else left the earlier clown rooms back in
// the corridor, and the player could walk into clown 1 again during the dark
// phase. Each room therefore records that it was visited and re-applies the
// pruning itself on restore.
//
// Pruning is stated absolutely rather than as a chain: clown 2 removes clown 1,
// clown 3 removes BOTH. Live, clown 1 is already gone by the time clown 3 is
// reached, so the extra call is a no-op — but it means a save can never come
// back with a clown room that should have been left behind.

var ROOM_CLOWN_STAGE_NONE = 0;
var ROOM_CLOWN_STAGE_VISITED = 1; // player has walked in; corridor pruning applies
var ROOM_CLOWN_STAGE_DONE = 2; // this room's nose has been pressed

function roomClownMarkStage(room, stage) {
    if (room && (!room.saveStage || room.saveStage < stage)) {
        room.saveStage = stage;
    }
}
function roomClownGetStage(room, doneCondition) {
    if (!room) return ROOM_CLOWN_STAGE_NONE;
    if (doneCondition) return ROOM_CLOWN_STAGE_DONE;
    return room.saveStage || ROOM_CLOWN_STAGE_NONE;
}

// Drops a clown room out of the corridor. removeIndex only nulls the exhibit's
// list entries; the sprites stay put but were already parked off-screen and
// invisible by setup, so nothing needs destroying. Safe to call twice.
function roomClownPrune(room) {
    if (room && gameObjects.exhibit) {
        gameObjects.exhibit.removeIndex(room.roomIndex);
    }
}

// ------------------------------------------------------------- clown 1 (4) ---

function roomClown1GetSaveStage() {
    return roomClownGetStage(gameObjects.roomClown1, typeof gameVars !== "undefined" && gameVars.firstNosePressed);
}
function roomClown1SetSaveStage(stage) {
    let r = gameObjects.roomClown1;
    if (!r || !stage) return;
    r.saveStage = stage;
    if (stage < ROOM_CLOWN_STAGE_DONE) return;
    // Nose already pressed: it is gone and the clown has changed face.
    if (typeof gameVars !== "undefined") gameVars.firstNosePressed = true;
    if (saveAlive(r.nose)) r.nose.destroy();
    let y = r.clown.y;
    if (saveAlive(r.clown)) r.clown.destroy();
    r.clown = globalScene.add.image(0, y, "roomClown", "clownsmall2");
    r.roomContainer.add(r.clown);
}

// ------------------------------------------------------------- clown 2 (7) ---

function roomClown2GetSaveStage() {
    return roomClownGetStage(gameObjects.roomClown2, gameObjects.roomClown2 && gameObjects.roomClown2.nosePressed);
}
function roomClown2SetSaveStage(stage) {
    let r = gameObjects.roomClown2;
    if (!r || !stage) return;
    r.saveStage = stage;
    // Reaching clown 2 at all means clown 1 is behind us for good.
    roomClownPrune(gameObjects.roomClown1);
    if (stage < ROOM_CLOWN_STAGE_DONE) return;
    r.nosePressed = true;
    if (saveAlive(r.nose)) r.nose.destroy();
    let y = r.clown.y;
    if (saveAlive(r.clown)) r.clown.destroy();
    r.clown = globalScene.add.image(0, y, "roomClown", "clownlarge1");
    r.roomContainer.add(r.clown);
    r.clown.scaleX = 0.76;
    r.clown.scaleY = 0.76;
}

// ------------------------------------------------------------ clown 3 (14) ---

function roomClown3GetSaveStage() {
    return roomClownGetStage(gameObjects.roomClown3, gameObjects.roomClown3 && gameObjects.roomClown3.clickedOnce);
}
function roomClown3SetSaveStage(stage) {
    let r = gameObjects.roomClown3;
    if (!r || !stage) return;
    r.saveStage = stage;
    // Reaching clown 3 means both earlier clown rooms are behind us.
    roomClownPrune(gameObjects.roomClown1);
    roomClownPrune(gameObjects.roomClown2);
    if (stage < ROOM_CLOWN_STAGE_DONE) return;
    r.clickedOnce = true;
    // End of the live first-press chain (nosePress3): the nose returns as the
    // clickable second nose, with the bait key on the floor.
    if (saveAlive(r.nose)) r.nose.setPos(35, gameVars.halfHeight - 155);
    let bait = globalScene.add.image(gameVars.halfWidth + 20, 600, "buttons", "key_yellow");
    r.roomContainer.add(bait);
}
