function setupRoomHandy(scene, a, o) {
    gameObjects.exhibit.setBackgroundAtIndex(a, "bgs", "bg5");
    let t;
    let s;
    let r = [
        {
            x: -420,
            y: gameVars.halfHeight - 80,
            arrOffX: -30,
            arrOffY: 10,
            arrOffRot: -0.15
        },
        {
            x: -355,
            y: gameVars.halfHeight - 135,
            arrOffX: 0,
            arrOffY: 0,
            arrOffRot: 0
        },
        {
            x: -260,
            y: gameVars.halfHeight - 160,
            arrOffX: 0,
            arrOffY: 0,
            arrOffRot: 0
        },
        {
            x: -195,
            y: gameVars.halfHeight - 100,
            arrOffX: 55,
            arrOffY: 20,
            arrOffRot: 0.35
        },
        {
            x: 195,
            y: gameVars.halfHeight - 100,
            arrOffX: -55,
            arrOffY: 20,
            arrOffRot: -0.35
        },
        {
            x: 260,
            y: gameVars.halfHeight - 160,
            arrOffX: 0,
            arrOffY: 0,
            arrOffRot: 0
        },
        {
            x: 355,
            y: gameVars.halfHeight - 135,
            arrOffX: 0,
            arrOffY: 0,
            arrOffRot: 0
        },
        {
            x: 420,
            y: gameVars.halfHeight - 80,
            arrOffX: 80,
            arrOffY: 40,
            arrOffRot: 0.55
        },
        {
            x: -470,
            y: gameVars.halfHeight - 115,
            arrOffX: -35,
            arrOffY: 10,
            arrOffRot: -0.25
        },
        {
            x: -390,
            y: gameVars.halfHeight - 195,
            arrOffX: 0,
            arrOffY: 0,
            arrOffRot: 0
        },
        {
            x: -270,
            y: gameVars.halfHeight - 205,
            arrOffX: 0,
            arrOffY: 0,
            arrOffRot: 0
        },
        {
            x: -140,
            y: gameVars.halfHeight - 120,
            arrOffX: 45,
            arrOffY: 15,
            arrOffRot: 0.3
        },
        {
            x: 140,
            y: gameVars.halfHeight - 120,
            arrOffX: -45,
            arrOffY: 15,
            arrOffRot: -0.3
        },
        {
            x: 260,
            y: gameVars.halfHeight - 230,
            arrOffX: 0,
            arrOffY: 0,
            arrOffRot: 0
        },
        {
            x: 230,
            y: gameVars.halfHeight - 225,
            arrOffX: 0,
            arrOffY: 0,
            arrOffRot: 0
        },
        {
            x: 390,
            y: gameVars.halfHeight - 210,
            arrOffX: 0,
            arrOffY: 0,
            arrOffRot: 0
        },
        {
            x: 470,
            y: gameVars.halfHeight - 115,
            arrOffX: 0,
            arrOffY: 0,
            arrOffRot: 0
        },
        {
            x: 475,
            y: gameVars.halfHeight - 45,
            arrOffX: 45,
            arrOffY: 15,
            arrOffRot: 0.3
        },
        {
            x: 470,
            y: gameVars.halfHeight - 50,
            arrOffX: 45,
            arrOffY: 15,
            arrOffRot: 0.3
        }
    ];
    gameObjects.roomHandyObjs = {
        roomIndex: a,
        roomContainer: o,
        listOfButtonPos: r,
        listOfInverseButtonPos: [
            {
                x: r[0].x - 51,
                y: r[0].y - 30
            },
            {
                x: r[1].x - 35,
                y: r[1].y - 55
            },
            {
                x: r[2].x - 20,
                y: r[2].y - 50
            },
            {
                x: r[3].x + 60,
                y: r[3].y - 5
            },
            {
                x: r[4].x - 75,
                y: r[4].y - 5
            },
            {
                x: r[5].x + 5,
                y: r[5].y - 50
            },
            {
                x: r[6].x + 20,
                y: r[6].y - 60
            },
            {
                x: r[7].x + 40,
                y: r[7].y - 35
            },
            {
                x: r[8].x,
                y: r[8].y
            }
        ],
        fingerState: 0,
        dollImages: []
    };
    gameObjects.roomHandyObjs.dollArms = scene.add.image(0, gameVars.height - 260, "roomHandy", "arms");
    o.add(gameObjects.roomHandyObjs.dollArms);
    gameObjects.roomHandyObjs.dollBody = scene.add.image(0, gameVars.height - 260, "roomHandy", "dollBody");
    o.add(gameObjects.roomHandyObjs.dollBody);
    gameObjects.roomHandyObjs.dollPicture = scene.add.sprite(4, 188, "roomHandy", "handy1").setVisible(false);
    o.add(gameObjects.roomHandyObjs.dollPicture);
    setHandyDollImage("dollNeutral");
    o.add(gameObjects.roomHandyObjs.doll);
    gameObjects.roomHandyObjs.leftHand = scene.add.image(-285, 359, "roomHandy", "lefthand1");
    gameObjects.roomHandyObjs.rightHand = scene.add.image(290, 359, "roomHandy", "righthand1");
    o.add(gameObjects.roomHandyObjs.leftHand);
    o.add(gameObjects.roomHandyObjs.rightHand);
    initFingerButton();
    gameObjects.roomHandyObjs.placard = new Button(
        scene,
        o,
        () => {
            if (gameVars.horrorPoint) {
                if (gameObjects.roomHandyObjs.roomComplete) {
                    if (gameObjects.roomHandyObjs.playedOneTimeText) {
                        updateInfoText(TEXT.handy.doneGlitch[2]);
                    } else {
                        gameObjects.roomHandyObjs.playedOneTimeText = true;
                        updateInfoText(TEXT.handy.name);
                        gameDelay(() => {
                            updateInfoText(TEXT.handy.doneGlitch[0]);
                            gameDelay(() => {
                                updateInfoText(TEXT.handy.doneGlitch[1]);
                                gameDelay(() => {
                                    updateInfoText(TEXT.handy.doneGlitch[2]);
                                }, 100);
                            }, 100);
                        }, 700);
                    }
                } else {
                    updateInfoText(TEXT.handy.name);
                }
            } else {
                if (gameVars.darkPoint) {
                    updateInfoText(TEXT.handy.dark);
                } else {
                    updateInfoText(TEXT.handy.name);
                }
            }
        },
        {
            atlas: "buttons",
            ref: "placard",
            x: 260,
            y: gameVars.height - 85
        },
        {
            atlas: "buttons",
            ref: "placard_hover"
        }
    );
    messageBus.subscribe("exhibitMove", (e) => {
        if (e === a) {
            tweenVolume("gladiator0", 0.2);
            tweenVolume("gladiator1", 0.7);
            tweenVolume("gladiator2", 0.35);
            addGuideArrowFatToContainer(o);
            let e = gameObjects.roomHandyObjs.fingerState;
            let a = gameObjects.roomHandyObjs.listOfButtonPos[e];
            if (
                (updateGuideArrowFat(a.x + a.arrOffX, a.y - 200 + a.arrOffY, 0.5 * Math.PI + a.arrOffRot),
                gameVars.darkPoint)
            ) {
                let e = gameObjects.roomHandyObjs.listOfButtonPos[7];
                updateSparklePos(e.x, e.y);
                updateGuideArrowFat(e.x + e.arrOffX + 50, e.y - 230 + e.arrOffY, 0.5 * Math.PI + e.arrOffRot);
            }
        }
    });
    registerRoomSaveState(a, {
        getStage: roomHandyGetSaveStage,
        setStage: roomHandySetSaveStage
    });
    t = messageBus.subscribe("startDarkSequence", (e) => {
        gameObjects.roomHandyObjs.dollPicture.setVisible(true);
        t.unsubscribe();
        let a = gameObjects.roomHandyObjs.listOfInverseButtonPos[7];
        gameObjects.roomHandyObjs.cleanupButton.setPos(a.x, a.y);
    });
    s = messageBus.subscribe("startHorrorSequence", (e) => {
        gameObjects.guideArrowFat.alpha = 1;
        let a = gameObjects.roomHandyObjs.fingerState;
        gameObjects.roomHandyObjs.fingerButton.setPos(
            gameObjects.roomHandyObjs.listOfButtonPos[a].x,
            gameObjects.roomHandyObjs.listOfButtonPos[a].y
        );
        s.unsubscribe();
    });
}
function initFingerButton() {
    let mobileExpand = isMobile ? 1.1 : 1;
    gameObjects.roomHandyObjs.fingerButton = new Button(
        globalScene,
        gameObjects.roomHandyObjs.roomContainer,
        fingerPress,
        {
            ref: "blackPixel",
            alpha: 0.001,
            x: gameObjects.roomHandyObjs.listOfButtonPos[0].x,
            y: gameObjects.roomHandyObjs.listOfButtonPos[0].y,
            scaleX: 87 * mobileExpand,
            scaleY: 89 * mobileExpand
        },
        {
            ref: "blackPixel",
            scaleX: 88 * mobileExpand,
            scaleY: 90 * mobileExpand
        },
        {
            ref: "blackPixel",
            scaleX: 88 * mobileExpand,
            scaleY: 90 * mobileExpand
        }
    );
    gameObjects.roomHandyObjs.cleanupButton = new Button(
        globalScene,
        gameObjects.roomHandyObjs.roomContainer,
        fingerUnPress,
        {
            ref: "blackPixel",
            alpha: 0.001,
            x: 0,
            y: -9999,
            scaleX: 88 * mobileExpand,
            scaleY: 90 * mobileExpand
        },
        {
            ref: "blackPixel",
            scaleX: 94 * mobileExpand,
            scaleY: 96 * mobileExpand
        },
        {
            ref: "blackPixel",
            scaleX: 94 * mobileExpand,
            scaleY: 96 * mobileExpand
        }
    );
}
function fingerPress() {
    if (typeof messageBus !== "undefined" && messageBus) {
        messageBus.publish("fingerClicked");
    }
    let e = gameObjects.roomHandyObjs.fingerState + 1;
    if (gameObjects.roomHandyObjs.fingerState === 16) {
        gameObjects.roomHandyObjs.dollPicture.setFrame("handy4");
    } else if (gameObjects.roomHandyObjs.fingerState === 18) {
        gameObjects.roomHandyObjs.dollPicture.setFrame("handy5");
    } else if (gameObjects.roomHandyObjs.fingerState === 11) {
        gameObjects.roomHandyObjs.dollPicture.setFrame("handy3");
    } else if (gameObjects.roomHandyObjs.fingerState === 8) {
        gameObjects.roomHandyObjs.dollPicture.setFrame("handy2");
    }
    if (gameVars.horrorPoint) {
        if (
            (0 === gameObjects.roomHandyObjs.fingerState && tweenVolume("gladiatorx", 0.5),
            gameObjects.roomHandyObjs.listOfButtonPos.length > gameObjects.roomHandyObjs.fingerState + 1)
        ) {
            if (((gameObjects.roomHandyObjs.fingerState = e), gameVars.darkPoint)) {
                gameObjects.roomHandyObjs.fingerButton.setPos(
                    gameObjects.roomHandyObjs.listOfInverseButtonPos[e].x,
                    gameObjects.roomHandyObjs.listOfInverseButtonPos[e].y
                );
                let a = gameObjects.roomHandyObjs.listOfInverseButtonPos[e];
                updateGuideArrowFat(a.x + a.arrOffX, a.y - 200 + a.arrOffY, 0.5 * Math.PI + a.arrOffRot);
            } else {
                let a = gameObjects.roomHandyObjs.listOfButtonPos[e];
                updateHandyExpression(gameObjects.roomHandyObjs.fingerState);
                if (8 === gameObjects.roomHandyObjs.fingerState) {
                    gameObjects.roomHandyObjs.fingerButton.setPos(a.x, -9999);
                    updateGuideArrowFat(a.x, -9999, 0.5 * Math.PI);
                    gameDelay(() => {
                        gameObjects.roomHandyObjs.fingerButton.setPos(a.x, a.y);
                        updateGuideArrowFat(a.x + a.arrOffX, a.y - 200 + a.arrOffY, 0.5 * Math.PI + a.arrOffRot);
                    }, 1500);
                } else {
                    if (gameObjects.roomHandyObjs.fingerState > 8) {
                        gameObjects.roomHandyObjs.fingerButton.setPos(a.x, -9999);
                        updateGuideArrowFat(a.x, -9999, 0.5 * Math.PI);
                        gameDelay(() => {
                            if (12 === gameObjects.roomHandyObjs.fingerState) {
                                showStaticRand(3, undefined, undefined, 0.4);
                                let e = globalScene.add.image(
                                    gameObjects.roomHandyObjs.leftHand.x,
                                    gameObjects.roomHandyObjs.leftHand.y,
                                    "roomHandy",
                                    "lefthandX"
                                );
                                gameObjects.roomHandyObjs.roomContainer.add(e);
                                e.scaleX = 1.01;
                                e.scaleY = 1.01;
                                gameDelay(() => {
                                    e.scaleX = 1;
                                    e.scaleY = 1;
                                    gameDelay(() => {
                                        e.destroy();
                                        showFlashRand(1);
                                    }, 30);
                                }, 30);
                            }
                        }, 0);
                        gameDelay(() => {
                            gameObjects.roomHandyObjs.fingerButton.setPos(a.x, a.y);
                            updateGuideArrowFat(a.x + a.arrOffX, a.y - 200 + a.arrOffY, 0.5 * Math.PI + a.arrOffRot);
                        }, 800);
                    } else {
                        gameObjects.roomHandyObjs.fingerButton.setPos(a.x, a.y);
                        updateGuideArrowFat(a.x + a.arrOffX, a.y - 200 + a.arrOffY, 0.5 * Math.PI + a.arrOffRot);
                    }
                }
            }
        } else {
            gameObjects.roomHandyObjs.roomComplete = true;
            roomHandyMarkStage(ROOM_HANDY_STAGE_FINISHED);
            updateHandyExpression(gameObjects.roomHandyObjs.fingerState + 1);
            gameObjects.roomHandyObjs.fingerButton.setPos(0, -9999);
            updateGuideArrowFat(0, -9999);
            tweenVolume("gladiatorx", 0.85);
            gameObjects.guideArrowFat.alpha = 0;
            gameDelay(() => {
                gameObjects.hand.switchHand();
                createKey(
                    -15,
                    gameVars.halfHeight - 10,
                    gameObjects.roomHandyObjs.roomIndex,
                    gameObjects.roomHandyObjs.roomContainer,
                    false
                );
            }, 1200);
        }
    } else if (gameObjects.roomHandyObjs.fingerState < 7) {
        gameObjects.roomHandyObjs.fingerState = e;
        updateHandyExpression(gameObjects.roomHandyObjs.fingerState);
        let a = null;
        a = gameVars.darkPoint
            ? gameObjects.roomHandyObjs.listOfInverseButtonPos[e]
            : gameObjects.roomHandyObjs.listOfButtonPos[e];
        gameObjects.roomHandyObjs.fingerButton.setPos(a.x, a.y);
        updateGuideArrowFat(a.x + a.arrOffX, a.y - 200 + a.arrOffY, 0.5 * Math.PI + a.arrOffRot);
        addGuideArrowFatToContainer(gameObjects.roomHandyObjs.roomContainer);
    } else {
        roomHandyMarkStage(ROOM_HANDY_STAGE_COUNTED);
        gameObjects.roomHandyObjs.fingerButton.setPos(0, -9999);
        updateGuideArrowFat(0, -9999);
        updateHandyExpression(gameObjects.roomHandyObjs.fingerState + 1);
        gameObjects.guideArrowFat.alpha = 0;
        gameDelay(() => {
            gameObjects.roomHandyObjs.doll.scaleY = 0.97;
            gameDelay(() => {
                gameObjects.roomHandyObjs.doll.scaleY = 1.05;
                gameDelay(() => {
                    gameObjects.roomHandyObjs.doll.scaleY = 1.04;
                    gameDelay(() => {
                        gameObjects.roomHandyObjs.doll.scaleY = 1;
                        createKey(
                            0,
                            gameVars.halfHeight - 10,
                            gameObjects.roomHandyObjs.roomIndex,
                            gameObjects.roomHandyObjs.roomContainer,
                            true
                        );
                    }, 30);
                }, 50);
            }, 70);
        }, 50);
    }
    handleFingerSound(e);
    let a = 0;
    switch (e) {
        case 1:
        case 2:
        case 3:
        case 4:
            a = e + 1;
            gameObjects.roomHandyObjs.leftHand.destroy();
            gameObjects.roomHandyObjs.leftHand = globalScene.add.image(-285, 360, "roomHandy", "lefthand" + a);
            gameObjects.roomHandyObjs.roomContainer.add(gameObjects.roomHandyObjs.leftHand);
            gameObjects.roomHandyObjs.leftHand.scaleX = 1.01;
            gameObjects.roomHandyObjs.leftHand.scaleY = 1.01;
            gameDelay(() => {
                gameObjects.roomHandyObjs.leftHand.scaleX = 1;
                gameObjects.roomHandyObjs.leftHand.scaleY = 1;
            }, 50);
            break;
        case 5:
        case 6:
        case 7:
        case 8:
            a = e - 3;
            gameObjects.roomHandyObjs.rightHand.destroy();
            gameObjects.roomHandyObjs.rightHand = globalScene.add.image(290, 360, "roomHandy", "righthand" + a);
            gameObjects.roomHandyObjs.roomContainer.add(gameObjects.roomHandyObjs.rightHand);
            gameObjects.roomHandyObjs.rightHand.scaleX = 1.01;
            gameObjects.roomHandyObjs.rightHand.scaleY = 1.01;
            gameDelay(() => {
                gameObjects.roomHandyObjs.rightHand.scaleX = 1;
                gameObjects.roomHandyObjs.rightHand.scaleY = 1;
            }, 50);
            break;
        case 9:
        case 10:
        case 11:
        case 12:
            a = e - 3;
            gameObjects.roomHandyObjs.leftHand.destroy();
            gameObjects.roomHandyObjs.leftHand = globalScene.add.image(-285, 360, "roomHandy", "lefthand" + a);
            gameObjects.roomHandyObjs.roomContainer.add(gameObjects.roomHandyObjs.leftHand);
            gameObjects.roomHandyObjs.leftHand.scaleX = 1.01;
            gameObjects.roomHandyObjs.leftHand.scaleY = 1.01;
            gameDelay(() => {
                gameObjects.roomHandyObjs.leftHand.scaleX = 1;
                gameObjects.roomHandyObjs.leftHand.scaleY = 1;
            }, 50);
            break;
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
            if (
                ((a = e - 7),
                gameObjects.roomHandyObjs.rightHand.destroy(),
                (gameObjects.roomHandyObjs.rightHand = globalScene.add.image(290, 360, "roomHandy", "righthand" + a)),
                gameObjects.roomHandyObjs.roomContainer.add(gameObjects.roomHandyObjs.rightHand),
                (gameObjects.roomHandyObjs.rightHand.scaleX = 1.01),
                (gameObjects.roomHandyObjs.rightHand.scaleY = 1.01),
                gameDelay(() => {
                    gameObjects.roomHandyObjs.rightHand.scaleX = 1;
                    gameObjects.roomHandyObjs.rightHand.scaleY = 1;
                }, 50),
                19 === e)
            ) {
                showFlashRand(2);
                showStaticRand(4, undefined, undefined, 0.6);
                let e = globalScene.add.image(
                    gameObjects.roomHandyObjs.leftHand.x,
                    gameObjects.roomHandyObjs.leftHand.y,
                    "roomHandy",
                    "lefthandY"
                );
                gameObjects.roomHandyObjs.roomContainer.add(e);
                e.scaleX = 1.02;
                e.scaleY = 1.02;
                gameDelay(() => {
                    e.scaleX = 1;
                    e.scaleY = 1;
                    gameDelay(() => {
                        showStaticRand(3, undefined, undefined, 0.2);
                        showFlashRand(1);
                        e.destroy();
                    }, 100);
                }, 70);
                let a = globalScene.add.image(290, 360, "roomHandy", "righthandY");
                gameObjects.roomHandyObjs.roomContainer.add(a);
                a.scaleX = 1.03;
                a.scaleY = 1.03;
                gameDelay(() => {
                    a.scaleX = 1.005;
                    a.scaleY = 1.005;
                    gameDelay(() => {
                        a.destroy();
                    }, 100);
                }, 70);
            }
    }
}
function fingerUnPress() {
    if (typeof messageBus !== "undefined" && messageBus) {
        messageBus.publish("fingerClicked");
    }
    let e = gameObjects.roomHandyObjs.fingerState - 1;
    if (e >= 0) {
        gameObjects.roomHandyObjs.fingerState = e;
        gameObjects.roomHandyObjs.cleanupButton.setPos(
            gameObjects.roomHandyObjs.listOfInverseButtonPos[e].x,
            gameObjects.roomHandyObjs.listOfInverseButtonPos[e].y - 20
        );
        updateGuideArrowFat(
            gameObjects.roomHandyObjs.listOfInverseButtonPos[e].x,
            gameObjects.roomHandyObjs.listOfInverseButtonPos[e].y - 200,
            0.5 * Math.PI
        );
    } else {
        gameObjects.roomHandyObjs.cleanupButton.setPos(0, -9999);
        updateGuideArrowFat(0, -9999);
        gameObjects.exhibit.needCleanup = false;
        roomHandyMarkStage(ROOM_HANDY_STAGE_CLEANED);
        updateHandyExpression(1);
        gameDelay(() => {
            playSound("deepbell3");
            updateInfoTextSoft(TEXT.roomCleaned, 2250);
        }, 100);
    }
    handleFingerSound(e + 2);
    let a = 0;
    switch (e) {
        case -1:
        case 0:
        case 1:
        case 2:
            a = e + 2;
            gameObjects.roomHandyObjs.leftHand.destroy();
            gameObjects.roomHandyObjs.leftHand = globalScene.add.image(-285, 360, "roomHandy", "lefthand" + a);
            gameObjects.roomHandyObjs.roomContainer.add(gameObjects.roomHandyObjs.leftHand);
            break;
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
            a = e - 2;
            gameObjects.roomHandyObjs.rightHand.destroy();
            gameObjects.roomHandyObjs.rightHand = globalScene.add.image(290, 360, "roomHandy", "righthand" + a);
            gameObjects.roomHandyObjs.roomContainer.add(gameObjects.roomHandyObjs.rightHand);
    }
}
function setHandyDollImage(e) {
    if (gameObjects.roomHandyObjs.doll) {
        if (gameObjects.roomHandyObjs.doll == gameObjects.roomHandyObjs.dollImages[e]) return void bounceHandyDoll();
        gameObjects.roomHandyObjs.doll.visible = false;
    }
    if (!gameObjects.roomHandyObjs.dollImages[e]) {
        let a = globalScene.add.image(0, gameVars.height - 270, "roomHandy", e);
        gameObjects.roomHandyObjs.dollImages[e] = a;
        gameObjects.roomHandyObjs.roomContainer.add(a);
    }
    gameObjects.roomHandyObjs.dollImages[e].visible = true;
    gameObjects.roomHandyObjs.doll = gameObjects.roomHandyObjs.dollImages[e];
    bounceHandyDoll();
}
function bounceHandyDoll() {
    gameObjects.roomHandyObjs.doll.scaleY = 1.013;
    gameObjects.roomHandyObjs.dollBody.scaleY = 1.013;
    gameDelay(() => {
        gameObjects.roomHandyObjs.doll.scaleY = 1.004;
        gameObjects.roomHandyObjs.dollBody.scaleY = 1.004;
        gameDelay(() => {
            gameObjects.roomHandyObjs.doll.scaleY = 1;
            gameObjects.roomHandyObjs.dollBody.scaleY = 1;
        }, 40);
    }, 50);
}
function updateHandyExpression(e) {
    switch (e) {
        case 1:
        case 2:
            setHandyDollImage("dollNeutral");
            break;
        case 3:
            setHandyDollImage("dollExpectant");
            break;
        case 4:
            setHandyDollImage("dollHappy");
            gameDelay(() => {
                setHandyDollImage("dollNeutral");
            }, 500);
            break;
        case 5:
        case 6:
            setHandyDollImage("dollNeutral");
            break;
        case 7:
            setHandyDollImage("dollExpectant");
            break;
        case 8:
            setHandyDollImage("dollHappy");
            break;
        case 9:
            showStaticLite(1, 2, 1.25, 0.08);
            setHandyDollImage("dollAnguished");
            gameDelay(() => {
                setHandyDollImage("dollHappy");
            }, 150);
            break;
        case 10:
            showStaticLite(2, 3, 1.25, 0.12);
            setHandyDollImage("dollAnguished");
            gameDelay(() => {
                setHandyDollImage("dollNeutral");
            }, 300);
            break;
        case 11:
            showStaticLite(2, 4, 2, 0.15);
            setHandyDollImage("dollWorried");
            gameDelay(() => {
                showStaticLite(1, 2, 1, 0.05);
                setHandyDollImage("dollAnguished");
            }, 300);
            break;
        case 12:
            showStaticLite(1, 10, 2.5, 0.15);
            setHandyDollImage("dollFearful");
            gameDelay(() => {
                showStaticLite(1, 2, 1, 0.1);
                setHandyDollImage("dollAnguished");
            }, 250);
            break;
        case 13:
            showStaticLite(1, 2, 1.5, 0.1);
            setHandyDollImage("dollFearful");
            gameDelay(() => {
                setHandyDollImage("dollWorried");
                gameObjects.roomHandyObjs.shake = 1;
                gameObjects.roomHandyObjs.vertShakeTemp = 0;
                gameObjects.roomHandyObjs.shakeTemp = 1;
                addToUpdateFuncList(shakeHandyDoll);
            }, 200);
            break;
        case 14:
            showStaticLite(2, 3, 1.5, 0.15);
            setHandyDollImage("dollFearful");
            gameObjects.roomHandyObjs.shakeTemp = 1.5;
            gameDelay(() => {
                setHandyDollImage("dollWorried");
                gameObjects.roomHandyObjs.shake = 1.25;
            }, 250);
            break;
        case 15:
            showStaticLite(1, 3, 2, 0.6);
            setHandyDollImage("dollFearful");
            gameObjects.roomHandyObjs.shake = 3;
            gameObjects.roomHandyObjs.vertShakeTemp = 0.1;
            gameDelay(() => {
                showStaticLite(2, 3, 1.5, 0.15);
                setHandyDollImage("dollWorried");
                gameObjects.roomHandyObjs.shake = 1.75;
            }, 180);
            break;
        case 16:
            showStaticLite(1, 2, 1.5, 0.1);
            setHandyDollImage("dollFearful");
            gameObjects.roomHandyObjs.shakeTemp = 1.5;
            gameObjects.roomHandyObjs.vertShakeTemp = 0.02;
            gameDelay(() => {
                setHandyDollImage("dollWorried");
                gameObjects.roomHandyObjs.shake = 2;
            }, 300);
            break;
        case 17:
            showStaticLite(1, 2, 1.5, 0.1);
            setHandyDollImage("dollFearful");
            gameObjects.roomHandyObjs.shakeTemp = 1.5;
            gameObjects.roomHandyObjs.vertShakeTemp = 0.04;
            gameDelay(() => {
                setHandyDollImage("dollFearful");
                gameObjects.roomHandyObjs.shake = 2;
            }, 300);
            break;
        case 18:
            showStaticLite(4, 7, 2, 0.4);
            setHandyDollImage("dollScreaming");
            gameObjects.roomHandyObjs.shakeTemp = 0.5;
            gameObjects.roomHandyObjs.vertShakeTemp = 0.05;
            gameDelay(() => {
                setHandyDollImage("dollFearful");
                gameObjects.roomHandyObjs.shake = 2.4;
            }, 150);
            break;
        case 19:
            gameObjects.roomHandyObjs.dollBody.setVisible(false);
            showStaticLite(5, 10, 2.5, 1);
            setHandyDollImage("dollScreaming");
            gameObjects.roomHandyObjs.shakeTemp = 3;
            gameObjects.roomHandyObjs.vertShakeTemp = 0.12;
            gameDelay(() => {
                setHandyDollImage("dollDefeated");
                removeFromUpdateFuncList(shakeHandyDoll);
                gameDelay(() => {
                    showStaticRand(2);
                }, 500);
            }, 600);
    }
}
function shakeHandyDoll() {
    let e = gameObjects.roomHandyObjs.shake + gameObjects.roomHandyObjs.shakeTemp;
    let a = gameObjects.roomHandyObjs.vertShakeTemp;
    gameObjects.roomHandyObjs.shakeTemp *= 0.85;
    gameObjects.roomHandyObjs.vertShakeTemp = Math.max(0, 0.8 * gameObjects.roomHandyObjs.vertShakeTemp - 0.01);
    let o = 0.5 * -e + e * Math.random();
    gameObjects.roomHandyObjs.doll.x = o;
    gameObjects.roomHandyObjs.dollArms.x = 0.75 * o;
    gameObjects.roomHandyObjs.dollBody.x = o;
    gameObjects.roomHandyObjs.doll.scaleY = 1 + a + a * Math.random();
    gameObjects.roomHandyObjs.dollBody.scaleY = 1 + a + a * Math.random();
    gameObjects.roomHandyObjs.doll.rotation = 0.005 * o;
}
function handleFingerSound(e) {
    switch (e) {
        case 1:
        case 9:
            playSound("c7");
            break;
        case 2:
        case 10:
            playSound("d7");
            break;
        case 3:
            playSound("e7");
            break;
        case 4:
            playSound("f7");
            break;
        case 5:
        case 13:
            playSound("g7");
            break;
        case 6:
        case 15:
            playSound("a7");
            break;
        case 7:
        case 16:
            playSound("b7");
            break;
        case 19:
            playSound("tear5");
        case 8:
            playSound("c8");
            break;
        case 11:
            playSound("e7b");
            break;
        case 12:
            playSound("f7b");
            break;
        case 14:
            playSound("tear2");
            break;
        case 17:
            playSound("tear1");
            break;
        case 18:
            playSound("tear4");
    }
}

// ============================================================== save state ===
//
// Mr. Handy owns his own progress ladder. save.js stores whatever number
// roomHandyGetSaveStage returns and hands it straight back to
// roomHandySetSaveStage on restore — it never interprets the value, so the
// stages below describe this room and nothing else.
//
// The room is completed three separate times over the course of the game, which
// is why a plain "finished / not finished" bit was never enough here.

var ROOM_HANDY_STAGE_NONE = 0;
var ROOM_HANDY_STAGE_COUNTED = 1; // normal phase: fingers counted, yellow key given
var ROOM_HANDY_STAGE_CLEANED = 2; // dark phase: fingers uncounted again
var ROOM_HANDY_STAGE_FINISHED = 3; // horror phase: counted to the end, red key given

// Called by the live gameplay path at each milestone, so the stage is recorded
// rather than re-derived from fingerState later. Monotonic: never goes back.
function roomHandyMarkStage(stage) {
    let r = gameObjects.roomHandyObjs;
    if (r && (!r.saveStage || r.saveStage < stage)) {
        r.saveStage = stage;
    }
}
function roomHandyGetSaveStage() {
    let r = gameObjects.roomHandyObjs;
    return (r && r.saveStage) || ROOM_HANDY_STAGE_NONE;
}

// Swaps both hand images. The frames are recreated rather than re-framed
// because that is what fingerPress/fingerUnPress do.
function roomHandySetHands(leftFrame, rightFrame) {
    let r = gameObjects.roomHandyObjs;
    if (r.leftHand) r.leftHand.destroy();
    if (r.rightHand) r.rightHand.destroy();
    r.leftHand = globalScene.add.image(-285, 360, "roomHandy", leftFrame);
    r.rightHand = globalScene.add.image(290, 360, "roomHandy", rightFrame);
    r.roomContainer.add(r.leftHand);
    r.roomContainer.add(r.rightHand);
}

// Puts the room straight into the end state of `stage`.
//
// STATE ONLY — no tweens, sounds, static, flashes or gameDelay chains. The live
// path plays those itself and then calls roomHandyMarkStage; this function is
// the half of each completion that a reloaded game needs to look right.
// Has this room's work for the phase the player is currently in been done?
function roomHandyPhaseSatisfied(stage) {
    if (gameVars.horrorPoint) return stage >= ROOM_HANDY_STAGE_FINISHED;
    if (gameVars.darkPoint) return stage >= ROOM_HANDY_STAGE_CLEANED;
    return stage >= ROOM_HANDY_STAGE_COUNTED;
}
function roomHandySetSaveStage(stage) {
    let r = gameObjects.roomHandyObjs;
    if (!r || !stage) return;
    r.saveStage = stage;
    if (stage === ROOM_HANDY_STAGE_COUNTED) {
        // fingerPress stops advancing at 7 outside the horror phase, then falls
        // through to the completion branch with handleFingerSound(8), which
        // leaves both hands on their fifth frame.
        r.fingerState = 7;
        roomHandySetHands("lefthand5", "righthand5");
        updateHandyExpression(8);
    } else if (stage === ROOM_HANDY_STAGE_CLEANED) {
        // fingerUnPress counts back down to -1, landing both hands on frame 1
        // and resetting the expression to case 1.
        r.fingerState = 0;
        roomHandySetHands("lefthand1", "righthand1");
        updateHandyExpression(1);
        if (r.cleanupButton) r.cleanupButton.setPos(0, -9999);
    } else {
        // ROOM_HANDY_STAGE_FINISHED. In the horror phase the count runs the
        // full length of listOfButtonPos; fingerPress advances while
        // `length > fingerState + 1`, so it ends one short of the length. It
        // must stay a valid index — the room's exhibitMove subscriber does an
        // unguarded listOfButtonPos[fingerState] on every entry.
        r.roomComplete = true;
        r.fingerState = r.listOfButtonPos.length - 1;
        // handleFingerSound is called with fingerState + 1, so the last frames
        // the live path paints are case 19's righthand12 and case 12's lefthand9.
        roomHandySetHands("lefthand9", "righthand12");
        if (r.dollPicture) r.dollPicture.setFrame("handy5");
        if (r.cleanupButton) r.cleanupButton.setPos(0, -9999);
        // The tail of updateHandyExpression(19), without its static and delays.
        if (r.dollBody) r.dollBody.setVisible(false);
        setHandyDollImage("dollDefeated");
        removeFromUpdateFuncList(shakeHandyDoll);
    }

    // Where the finger counter sits belongs to the PHASE, not the stage.
    // Parking it unconditionally (as this used to) undid startHorrorSequence,
    // which places it on the current finger so the horror count can begin —
    // Mr. Handy arrives in the horror phase at CLEANED, so that path matters.
    if (roomHandyPhaseSatisfied(stage)) {
        if (r.fingerButton) r.fingerButton.setPos(0, -9999);
        if (gameObjects.guideArrowFat) gameObjects.guideArrowFat.alpha = 0;
    } else if (gameVars.horrorPoint) {
        let pos = r.listOfButtonPos[r.fingerState];
        if (pos && r.fingerButton) r.fingerButton.setPos(pos.x, pos.y);
        if (gameObjects.guideArrowFat) gameObjects.guideArrowFat.alpha = 1;
    } else {
        // Dark phase: cleanupButton does the work, the counter stays parked.
        if (r.fingerButton) r.fingerButton.setPos(0, -9999);
        if (gameObjects.guideArrowFat) gameObjects.guideArrowFat.alpha = 0;
    }
}
