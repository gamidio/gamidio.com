function setupRoomFinal(scene, roomIndex, roomContainer) {
    gameObjects.exhibit.setBackgroundAtIndex(roomIndex, "bgs", "bg4");
    let tempDoor = scene.add.image(0, 507, "buttons", "exitDoorWhite");
    roomContainer.add(tempDoor);
    gameObjects.exitDoorFinal = new Button(
        scene,
        roomContainer,
        () => {
            onFinalExitClick(scene);
        },
        {
            atlas: "buttons",
            ref: "exitDoorNormal",
            x: -210,
            y: 507
        },
        {
            atlas: "buttons",
            ref: "exitDoorOver"
        },
        {
            atlas: "buttons",
            ref: "exitDoorOver"
        },
        {
            atlas: "buttons",
            ref: "exitDoorNormal"
        }
    );
    gameObjects.exitDoorFinal.setOrigin(0, 0.5);
}
function onFinalExitClick(scene) {
    if (typeof messageBus !== "undefined" && messageBus) {
        messageBus.publish("doorOpened");
    }
    gameObjects.exitDoorFinal.setState("disable");
    gameDelay(() => {
        playSound("dooropen2");
    }, 50);
    scene.tweens.add({
        targets: scene.cameras.main,
        zoom: 4.1,
        ease: "Quad.easeIn",
        duration: 6250,
        onComplete: () => {
            scene.cameras.main.setZoom(1);
            let fakeBackground = scene.add.image(0, gameVars.halfHeight, "misc", "scrollworld");
            fakeBackground.x = gameVars.width - fakeBackground.width * 0.5;
            fakeBackground.y = fakeBackground.height * 0.5;
            let whiteScreen = scene.add.image(gameVars.halfWidth, gameVars.halfHeight, "whitePixel");
            whiteScreen.scaleX = 1000;
            whiteScreen.scaleY = 800;
            scene.tweens.add({
                targets: whiteScreen,
                alpha: 0,
                duration: 2200
            });
            scene.tweens.add({
                targets: whiteScreen,
                scaleX: whiteScreen.scaleX + 1,
                duration: 2400,
                onComplete: () => {
                    runEpilogue(fakeBackground);
                }
            });
            scene.tweens.add({
                targets: fakeBackground,
                y: fakeBackground.y - (fakeBackground.height - gameVars.height),
                duration: 25000
            });
        }
    });
    gameObjects.exitDoorFinal.tweenScale({
        scaleX: 0.96,
        duration: 100,
        ease: "Cubic.easeOut",
        onComplete: () => {
            gameObjects.exitDoorFinal.tweenScale({
                scaleX: 0.2,
                duration: 5000,
                ease: "Cubic.easeIn",
                onComplete: () => {
                    gameObjects.exitDoorFinal.tweenScale({
                        scaleX: 0.15,
                        duration: 500,
                        ease: "Cubic.easeOut",
                        onComplete: () => {}
                    });
                }
            });
        }
    });
}
function runEpilogue(background) {
    let clown = globalScene.add.image(gameVars.halfWidth + 95, 450, "roomClown", "clowndoor");
    let clownFrame = globalScene.add.image(gameVars.halfWidth - 1200, 457, "buttons", "exitDoorOpenSurround");
    let clownhand = globalScene.add.image(gameVars.halfWidth + 40, 565, "roomClown", "clownhand");
    clown.scaleX = -0.3;
    clown.scaleY = 0.72;
    clown.rotation = -0.9;
    clown.visible = false;
    clownhand.visible = false;
    let box = globalScene.add.image(gameVars.halfWidth + 100, 774, "buttons", "musicBox");
    box.visible = false;
    let clownDoor = globalScene.add.image(gameVars.halfWidth - 1200 + 200, 507, "buttons", "exitDoorNormal");
    clownDoor.setOrigin(0, 0.5);
    clownDoor.scaleX = -0.6;
    globalScene.tweens.add({
        targets: background,
        x: background.x + 1200,
        ease: "Cubic.easeInOut",
        duration: 3200
    });
    globalScene.tweens.add({
        targets: [clownDoor, clownFrame],
        x: "+=1200",
        ease: "Cubic.easeInOut",
        duration: 3200,
        onComplete: () => {
            clown.visible = true;
            clownhand.visible = true;
            globalScene.tweens.add({
                targets: clown,
                x: "-=125",
                scaleX: -0.71,
                ease: "Cubic.easeOut",
                duration: 1000,
                onComplete: () => {
                    if (!gameObjectsTemp.boxBroken) {
                        box.visible = true;
                        globalScene.tweens.add({
                            targets: [box],
                            x: "-=350",
                            ease: "Cubic.easeOut",
                            duration: 1000,
                            onComplete: () => {
                                playSound("g6");
                            }
                        });
                    }
                    globalScene.tweens.add({
                        targets: clownhand,
                        rotation: -0.25,
                        yoyo: true,
                        ease: "Sine.easeInOut",
                        duration: 400,
                        repeat: 1,
                        onComplete: () => {
                            // clown closes door
                            globalScene.tweens.add({
                                targets: [clownhand, clown],
                                scaleX: "-=0.1",
                                x: "+=65",
                                ease: "Cubic.easeIn",
                                duration: 350
                            });
                            globalScene.tweens.add({
                                targets: clownDoor,
                                scaleX: -1,
                                ease: "Quad.easeIn",
                                duration: 350,
                                onComplete: () => {
                                    playSound("doorslam");
                                    zoomTemp(1.04);
                                    showStaticLite(6, 25, 4, 1);
                                    globalScene.add.image(gameVars.halfWidth, gameVars.halfHeight, "theEnd");
                                    gameDelay(() => {
                                        let background = document.getElementById("background");
                                        background.style.opacity = "0";
                                        let leftborder = document.getElementById("leftborder");
                                        if (leftborder) leftborder.style.opacity = "0";
                                        let rightborder = document.getElementById("rightborder");
                                        if (rightborder) rightborder.style.opacity = "0";
                                        let topborder = document.getElementById("topborder");
                                        if (topborder) topborder.style.opacity = "0";
                                        let bottomborder = document.getElementById("bottomborder");
                                        if (bottomborder) bottomborder.style.opacity = "0";
                                        let gameEndScreen = globalScene.add.image(
                                            gameVars.halfWidth,
                                            gameVars.halfHeight,
                                            "blackPixel"
                                        );
                                        gameEndScreen.scaleX = 999;
                                        gameEndScreen.scaleY = 999;
                                        gameObjectsTemp.endText = globalScene.add.text(100, 80, THEME.credits[0], {
                                            fontFamily: THEME.font,
                                            fontSize: 30,
                                            color: "#ffffff",
                                            align: "left"
                                        });
                                        gameObjectsTemp.endText.alpha = 0;
                                        globalScene.tweens.add({
                                            targets: gameObjectsTemp.endText,
                                            alpha: 1,
                                            duration: 900,
                                            onComplete: () => {
                                                gameObjectsTemp.endText2 = globalScene.add.text(
                                                    100,
                                                    140,
                                                    THEME.credits[1],
                                                    {
                                                        fontFamily: THEME.font,
                                                        fontSize: 30,
                                                        color: "#ffffff",
                                                        align: "left"
                                                    }
                                                );
                                                gameObjectsTemp.endText2.alpha = 0;
                                                globalScene.tweens.add({
                                                    targets: gameObjectsTemp.endText2,
                                                    alpha: 1,
                                                    duration: 900,
                                                    onComplete: () => {
                                                        gameObjectsTemp.endText3 = globalScene.add.text(
                                                            100,
                                                            200,
                                                            THEME.credits[2],
                                                            {
                                                                fontFamily: THEME.font,
                                                                fontSize: 30,
                                                                color: "#ffffff",
                                                                align: "left"
                                                            }
                                                        );
                                                        gameObjectsTemp.endText3.alpha = 0;
                                                        globalScene.tweens.add({
                                                            targets: gameObjectsTemp.endText3,
                                                            alpha: 1,
                                                            duration: 900,
                                                            onComplete: () => {
                                                                let finalText = THEME.trivia.join("\n") + "\n";
                                                                gameObjectsTemp.endText5 = globalScene.add.text(
                                                                    100,
                                                                    380,
                                                                    finalText,
                                                                    {
                                                                        fontFamily: THEME.font,
                                                                        fontSize: 26,
                                                                        color: "#ffffff",
                                                                        align: "left"
                                                                    }
                                                                );
                                                                gameObjectsTemp.endText5.setOrigin(0, 0.5);
                                                                gameObjectsTemp.endText5.alpha = 0;
                                                                globalScene.tweens.add({
                                                                    targets: gameObjectsTemp.endText5,
                                                                    alpha: 1,
                                                                    duration: 900,
                                                                    onComplete: () => {
                                                                        gameObjectsTemp.lastText = globalScene.add.text(
                                                                            100,
                                                                            530,
                                                                            THEME.thanksText,
                                                                            {
                                                                                fontFamily: THEME.font,
                                                                                fontSize: 48,
                                                                                color: "#ffffff",
                                                                                align: "center"
                                                                            }
                                                                        );
                                                                        gameObjectsTemp.lastText.setOrigin(0, 0.5);
                                                                        gameObjectsTemp.lastText.alpha = 0;
                                                                        globalScene.tweens.add({
                                                                            targets: gameObjectsTemp.lastText,
                                                                            alpha: 1,
                                                                            duration: 2500,
                                                                            delay: 2500
                                                                        });
                                                                        gameDelay(() => {
                                                                            gameObjectsTemp.replayText =
                                                                                globalScene.add.text(
                                                                                    100,
                                                                                    700,
                                                                                    TEXT.replay,
                                                                                    {
                                                                                        fontFamily: THEME.font,
                                                                                        fontSize: 28,
                                                                                        color: "#ffffff",
                                                                                        align: "right"
                                                                                    }
                                                                                );
                                                                            gameObjectsTemp.replayText.setOrigin(
                                                                                0,
                                                                                0.5
                                                                            );
                                                                            gameObjectsTemp.replayText.alpha = 0.05;
                                                                            globalScene.tweens.add({
                                                                                targets: gameObjectsTemp.replayText,
                                                                                alpha: 0.6,
                                                                                duration: 2000
                                                                            });
                                                                            let replay = new Button(
                                                                                globalScene,
                                                                                undefined,
                                                                                () => {
                                                                                    const restartGame = () => {
                                                                                        saveClear();
                                                                                        if (
                                                                                            globalScene &&
                                                                                            globalScene.sound
                                                                                        ) {
                                                                                            globalScene.sound.stopAll();
                                                                                        }
                                                                                        gameVars = {
                                                                                            bloodHandActive: false,
                                                                                            hintCount:
                                                                                                gameVars &&
                                                                                                gameVars.hintCount !==
                                                                                                    undefined
                                                                                                    ? gameVars.hintCount
                                                                                                    : 2,
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
                                                                                            halfWidth:
                                                                                                DISPLAY.width / 2,
                                                                                            height: DISPLAY.height,
                                                                                            halfHeight:
                                                                                                DISPLAY.height / 2,
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
                                                                                        oneTimeScares = {};
                                                                                        gameObjectsTemp = {};
                                                                                        gameVarsTemp = {
                                                                                            darkFlickerCountdown: 1000
                                                                                        };
                                                                                        gameObjects = {
                                                                                            buttonList: [],
                                                                                            draggedObj: null,
                                                                                            loadingWelcomes: [],
                                                                                            noteList: [],
                                                                                            starPressSequence: []
                                                                                        };
                                                                                        updateFuncList = [];
                                                                                        keyPosX = null;
                                                                                        keyPosY = null;
                                                                                        keyRoomIdx = null;

                                                                                        // These live at module scope in main.js and survive a scene
                                                                                        // restart, so they must be cleared by hand. Leaving them set
                                                                                        // strands the replay on the loading screen with no start
                                                                                        // button: bootLoadHandled makes onLoaderBatchComplete return
                                                                                        // early, and onLoadComplete itself begins with
                                                                                        // `if (deferredAudioLoaded) return`. deferredAudioLoaded also
                                                                                        // gates loadDeferredAudio, so without this the 51 deferred
                                                                                        // sounds never get re-registered after a replay.
                                                                                        bootLoadHandled = false;
                                                                                        deferredAudioLoaded = false;
                                                                                        // The deferred assets load again after the restart. Until they
                                                                                        // do, anything waiting on them must wait again, and the static
                                                                                        // effects must not reach for images the restart destroyed.
                                                                                        deferredAssetsReady = false;
                                                                                        deferredReadyCallbacks = [];
                                                                                        if (backgroundRetry.timer) clearTimeout(backgroundRetry.timer);
                                                                                        backgroundRetry.timer = null;
                                                                                        backgroundRetry.attempt = 0;
                                                                                        gameObjectsTemp.assetFailureNotice = null;
                                                                                        gameObjects.staticScreens = undefined;
                                                                                        gameObjects.staticLite = undefined;

                                                                                        // The scene shutdown tears the loader's listeners down, but the
                                                                                        // `installed` latch would stop them being re-registered, which
                                                                                        // silently disables asset retries for the whole replay.
                                                                                        assetRetry.installed = false;
                                                                                        assetRetry.counts = {};
                                                                                        assetRetry.failedReqs = {};
                                                                                        assetRetry.pending = 0;

                                                                                        // The message bus is built once at script-eval time and a
                                                                                        // scene restart does not re-evaluate the scripts, so every
                                                                                        // subscription that never unsubscribed would survive into
                                                                                        // the replay and run a second time alongside the fresh one.
                                                                                        // Mr. Jack's speedUp/speedDown are the clearest casualty:
                                                                                        // they compound, so his finale ran faster on every replay.
                                                                                        //
                                                                                        // Everything re-subscribes from setupGame (rooms, the Exhibit
                                                                                        // constructor, initOneTimeListeners), so clearing here is
                                                                                        // safe — but only because nothing subscribes at file scope
                                                                                        // any more. Keep it that way.
                                                                                        if (
                                                                                            typeof messageBus !==
                                                                                                "undefined" &&
                                                                                            messageBus &&
                                                                                            messageBus.reset
                                                                                        ) {
                                                                                            messageBus.reset();
                                                                                        }
                                                                                        // Lets initSaveSystem re-subscribe against the cleared bus.
                                                                                        // Without this it returns early and the save system ends up
                                                                                        // with no listeners at all.
                                                                                        if (
                                                                                            typeof initSaveSystem ===
                                                                                            "function"
                                                                                        )
                                                                                            initSaveSystem.done = false;
                                                                                        if (
                                                                                            globalScene &&
                                                                                            globalScene.scene
                                                                                        ) {
                                                                                            globalScene.scene.restart();
                                                                                        } else {
                                                                                            location.reload();
                                                                                        }
                                                                                    };
                                                                                    restartGame();
                                                                                },
                                                                                {
                                                                                    ref: "whitePixel",
                                                                                    x: 195,
                                                                                    y: 700,
                                                                                    scaleX: 390,
                                                                                    scaleY: 40,
                                                                                    alpha: 0.001
                                                                                }
                                                                            );
                                                                            replay.setOnHoverFunc(() => {
                                                                                if (
                                                                                    gameObjectsTemp &&
                                                                                    gameObjectsTemp.replayText
                                                                                )
                                                                                    gameObjectsTemp.replayText.alpha = 1;
                                                                            });
                                                                            replay.setOnHoverOutFunc(() => {
                                                                                if (
                                                                                    gameObjectsTemp &&
                                                                                    gameObjectsTemp.replayText
                                                                                )
                                                                                    gameObjectsTemp.replayText.alpha = 0.7;
                                                                            });
                                                                        }, 2500);
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                        if (!gameObjectsTemp.boxBroken) {
                                            playSound("gladiator0");
                                            gameObjects.sounds["gladiator0"].volume = 1 * gameVars.soundMult;
                                        } else {
                                            tweenVolume("gladiatorx", 0.6);
                                        }
                                    }, 325);
                                }
                            });
                        }
                    });
                }
            });
            globalScene.tweens.add({
                targets: [clownhand],
                x: "-=130",
                ease: "Cubic.easeOut",
                duration: 1250
            });
        }
    });
}
