function setupRoomJack(scene, a, o) {
    let t;
    let s;
    gameObjects.exhibit.setBackgroundAtIndex(a, "bgs", "bg8");
    if (!gameObjects.roomJackObjs) {
        gameObjects.roomJackObjs = {
            roomIndex: a,
            roomContainer: o,
            jackJumpState: "default",
            shouldUpdate: false,
            maxRotSpeed: 0.007,
            totalDistRotated: 0,
            horrorCountdown: 0.6,
            horrorState: 0,
            noteCount: 0,
            rotateMusicAccumulate: 0,
            speedRatio: 1,
            canSpin: true,
            eyeOffsetX: 0,
            eyeOffsetY: 0
        };
    }
    setupJackMusicSequence();
    gameObjects.roomJackObjs.floor = scene.add.image(0, 960, "roomJack", "floor");
    gameObjects.roomJackObjs.floor.setOrigin(0.5, 1);
    o.add(gameObjects.roomJackObjs.floor);
    setupPortraits(o, scene);
    gameObjects.roomJackObjs.streamers = scene.add.image(0, -20, "roomJack", "streamers");
    gameObjects.roomJackObjs.streamers.scaleX = 0.88;
    gameObjects.roomJackObjs.streamers.scaleY = 0.9;
    gameObjects.roomJackObjs.streamers.setOrigin(0.5, 0);
    o.add(gameObjects.roomJackObjs.streamers);
    gameObjects.roomJackObjs.neck1 = scene.add.image(-450, -140, "roomJack", "neck");
    gameObjects.roomJackObjs.neck2 = scene.add.image(0, -150, "roomJack", "neck");
    gameObjects.roomJackObjs.neck3 = scene.add.image(450, -140, "roomJack", "neck");
    gameObjects.roomJackObjs.neck1.scaleX = 0.9;
    gameObjects.roomJackObjs.neck1.scaleY = 0.9;
    gameObjects.roomJackObjs.neck2.scaleX = -0.9;
    gameObjects.roomJackObjs.neck2.scaleY = 0.9;
    gameObjects.roomJackObjs.neck2.rotation = 2;
    gameObjects.roomJackObjs.neck3.scaleX = 0.9;
    gameObjects.roomJackObjs.neck3.scaleY = 0.9;
    gameObjects.roomJackObjs.neck2.rotation = 3;
    gameObjects.roomJackObjs.neck1.visible = false;
    gameObjects.roomJackObjs.neck2.visible = false;
    gameObjects.roomJackObjs.neck3.visible = false;
    o.add(gameObjects.roomJackObjs.neck1);
    o.add(gameObjects.roomJackObjs.neck2);
    o.add(gameObjects.roomJackObjs.neck3);
    setupJackArms(scene);
    gameObjects.roomJackObjs.dollCreepy = scene.add.image(-5, 2010, "roomJack", "dollcreepy");
    gameObjects.roomJackObjs.dollCreepy.origYPos = 2010;
    gameObjects.roomJackObjs.dollCreepy.scaleX = 0.42;
    o.add(gameObjects.roomJackObjs.dollCreepy);
    gameObjects.roomJackObjs.dollHeadUnder = scene.add.image(-5, 2010, "roomJack", "dollEyeless").setOrigin(0.5, 1);
    gameObjects.roomJackObjs.dollHeadUnder.scaleX = 0.42;
    o.add(gameObjects.roomJackObjs.dollHeadUnder);
    gameObjects.roomJackObjs.headPopup1 = scene.add.image(-5, -9999, "roomJack", "popup1");
    gameObjects.roomJackObjs.headPopup1.visible = false;
    o.add(gameObjects.roomJackObjs.headPopup1);
    gameObjects.roomJackObjs.pedestal = scene.add.image(-10, gameVars.height + 66, "roomJack", "pedestal");
    gameObjects.roomJackObjs.pedestal.setOrigin(0.5, 1);
    o.add(gameObjects.roomJackObjs.pedestal);
    gameObjects.roomJackObjs.dollHeadFlash1 = scene.add
        .image(-6, 585, "roomJack", "jack_flashes_rough_1")
        .setOrigin(0.5, 1);
    gameObjects.roomJackObjs.dollHeadFlash1.visible = false;
    o.add(gameObjects.roomJackObjs.dollHeadFlash1);
    gameObjects.roomJackObjs.dollHeadFlash2 = scene.add
        .image(-6, 585, "roomJack", "jack_flashes_rough_2")
        .setOrigin(0.5, 1);
    gameObjects.roomJackObjs.dollHeadFlash2.visible = false;
    o.add(gameObjects.roomJackObjs.dollHeadFlash2);
    gameObjects.roomJackObjs.box = scene.add.image(0, 665, "roomJack", "box");
    o.add(gameObjects.roomJackObjs.box);
    gameObjects.roomJackObjs.lid = scene.add.image(93, 575, "roomJack", "lid");
    gameObjects.roomJackObjs.lid.rotVel = 0;
    o.add(gameObjects.roomJackObjs.lid);
    gameObjects.roomJackObjs.dollEyes = scene.add.image(-5, 2010, "roomJack", "dollEyes").setOrigin(0.5, 1);
    gameObjects.roomJackObjs.dollEyes.scaleX = 0.8;
    gameObjects.roomJackObjs.dollEyes.visible = false;
    o.add(gameObjects.roomJackObjs.dollEyes);
    gameObjects.roomJackObjs.dollHead = scene.add.image(-5, 2010, "roomJack", "dollEyeless").setOrigin(0.5, 1);
    gameObjects.roomJackObjs.dollHead.scaleX = 0.8;
    gameObjects.roomJackObjs.dollHead.visible = false;
    o.add(gameObjects.roomJackObjs.dollHead);
    gameObjects.roomJackObjs.halfHeightDiffDoll =
        0.5 * (gameObjects.roomJackObjs.dollCreepy.height - 2 * gameObjects.roomJackObjs.dollHead.height);
    gameObjects.roomJackObjs.dollHead.y =
        gameObjects.roomJackObjs.dollCreepy.y - gameObjects.roomJackObjs.halfHeightDiffDoll;
    gameObjects.roomJackObjs.dollHeadUnder.y = gameObjects.roomJackObjs.dollHead.y;
    gameObjects.roomJackObjs.dollEyes.y = gameObjects.roomJackObjs.dollHead.y;
    gameObjects.roomJackObjs.headPopup2 = scene.add.image(
        gameObjects.roomJackObjs.dollHead.x,
        -9999,
        "roomJack",
        "popup2"
    );
    gameObjects.roomJackObjs.headPopup2.visible = false;
    o.add(gameObjects.roomJackObjs.headPopup2);
    gameObjects.roomJackObjs.placard = new Button(
        scene,
        o,
        () => {
            if (gameVars.horrorPoint) {
                updateInfoText(TEXT.jack.horror);
            } else {
                if (gameVars.darkPoint && gameObjects.roomJackObjs.canSpin) {
                    updateInfoText(TEXT.jack.dark);
                } else {
                    updateInfoText(TEXT.jack.name);
                }
            }
        },
        {
            atlas: "buttons",
            ref: "placard",
            x: -4,
            y: gameVars.height - 73
        },
        {
            atlas: "buttons",
            ref: "placard_hover",
            preload: true
        }
    );
    gameObjects.roomJackObjs.spinner = scene.add.image(0, 670, "roomJack", "spinner");
    o.add(gameObjects.roomJackObjs.spinner);
    gameObjects.roomJackObjs.spinner.rotVel = 0;
    gameObjects.roomJackObjs.dollface = scene.add.image(80, -320, "roomJack", "dollface");
    gameObjects.roomJackObjs.dollface.rotation = 3.16;
    gameObjects.roomJackObjs.dollface.scaleExpand = 0.001;
    gameObjects.roomJackObjs.dollface.scaleX = 0.5;
    gameObjects.roomJackObjs.dollface.scaleY = 0.5;
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.dollface);
    gameObjects.roomJackObjs.dollmouth = scene.add.image(80, -320, "roomJack", "dollmouth");
    gameObjects.roomJackObjs.dollmouth.rotation = 3.16;
    gameObjects.roomJackObjs.dollmouth.scaleX = 0.5;
    gameObjects.roomJackObjs.dollmouth.scaleY = 0.5;
    gameObjects.roomJackObjs.dollmouth.scaleYRatio = 1.05;
    gameObjects.roomJackObjs.dollmouth.scaleYVel = 0.02;
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.dollmouth);
    gameObjects.roomJackObjs.spinnerButton = new Button(scene, {
        container: o,
        normal: {
            ref: "blackPixel",
            x: 0,
            y: gameVars.halfHeight,
            alpha: 0.001,
            scaleX: 58,
            scaleY: 58
        },
        isDraggable: true,
        onDrop: resetSpinnerButton
    });
    addToUpdateFuncList(roomJackUpdate);
    resetSpinnerButton();
    registerRoomSaveState(a, {
        getStage: roomJackGetSaveState,
        setStage: roomJackSetSaveState
    });
    messageBus.subscribe("exhibitMove", (e, o) => {
        if (e === a) {
            tweenVolume("gladiator0", 0);
            tweenVolume("gladiator1", 0.9);
            tweenVolume("gladiator2", 0.1);
            tweenVolume("gladiatorx", 0.1);
            if (gameVars.darkPoint) {
                gameObjects.roomJackObjs.eyeOffsetX = 4;
                gameDelay(() => {
                    removeFromUpdateFuncList(shakeJackHead);
                    gameObjects.roomJackObjs.eyeOffsetX = 0;
                    gameObjects.roomJackObjs.dollHead.rotation = 0;
                    gameObjects.roomJackObjs.dollHeadSmile.visible = false;
                }, 1300);
            }
            addGuideArrowToContainer(gameObjects.roomJackObjs.roomContainer);
            updateGuideArrow(0, -9999);
            gameObjects.roomJackObjs.shouldUpdate = true;
            if (gameObjects.roomJackObjs.lightsReady) {
                gameObjects.moveLeftBtn.setOnMouseUpFunc(() => {
                    gameObjects.roomJackObjs.eyeOffsetY += 1;
                    gameObjects.moveLeftBtn.setState("disable");
                    updateInfoText(TEXT.jack.noTurningBack, 4500);
                    console.log("...");
                });
                globalScene.tweens.add({
                    targets: gameObjects.roomJackObjs.lights,
                    alpha: 0.8,
                    scaleX: 2,
                    scaleY: 2,
                    duration: 3000
                });
            }
        } else {
            gameDelay(() => {
                gameObjects.roomJackObjs.shouldUpdate = false;
            }, 600);
            if (gameVars.darkPoint && e < a && o === a) {
                gameObjects.roomJackObjs.fakeEyes = globalScene.add.image(
                    gameVars.halfWidth,
                    gameVars.halfHeight + 20,
                    "roomJack",
                    "dollEyesFake"
                );
                gameObjects.roomJackObjs.fakeEyes.scaleY = 0.01;
                gameDelay(() => {
                    gameObjects.roomJackObjs.dollHeadSmile.visible = true;
                }, 250);
                globalScene.tweens.add({
                    targets: gameObjects.roomJackObjs.fakeEyes,
                    scaleY: 1,
                    duration: 150,
                    ease: "Cubic.easeIn",
                    delay: 250
                });
                globalScene.tweens.add({
                    targets: gameObjects.roomJackObjs.fakeEyes,
                    x: gameVars.width + 80 + gameVars.halfWidth,
                    duration: 1510,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        gameObjects.roomJackObjs.fakeEyes.destroy();
                        gameObjects.roomJackObjs.dollHeadSmile.visible = false;
                    }
                });
            }
        }
    });
    t = messageBus.subscribe("startDarkSequence", (e) => {
        gameObjects.roomJackObjs.portraitBox.visible = true;
        gameObjects.roomJackObjs.portraitGiraffe.visible = true;
        gameObjects.roomJackObjs.noteCount = 0;
        gameObjects.roomJackObjs.rotateMusicAccumulate = 0;
        gameObjects.roomJackObjs.totalDistRotated = 0;
        gameObjects.roomJackObjs.canSpin = true;
        gameObjects.roomJackObjs.dollHeadSmile = globalScene.add
            .image(
                gameObjects.roomJackObjs.dollHead.x,
                gameObjects.roomJackObjs.dollHead.y,
                "roomJack",
                "dollEyelessSmile"
            )
            .setOrigin(0.5, 1);
        gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.dollHeadSmile);
        addToUpdateFuncList(shakeJackHead);
        t.unsubscribe();
    });
    s = messageBus.subscribe("startHorrorSequence", (e) => {
        gameObjects.roomJackObjs.noteCount = 0;
        gameObjects.roomJackObjs.rotateMusicAccumulate = 0;
        gameObjects.roomJackObjs.totalDistRotated = 0;
        gameObjects.roomJackObjs.canSpin = true;
        gameObjects.roomJackObjs.eyeOffsetX = 0;
        gameObjects.roomJackObjs.eyeOffsetY = 0;
        s.unsubscribe();
    });
    messageBus.subscribe("speedUp", () => {
        gameObjects.roomJackObjs.speedRatio *= 1.05;
    });
    messageBus.subscribe("speedDown", () => {
        gameObjects.roomJackObjs.speedRatio *= 0.8;
    });
    messageBus.subscribe("passedSafePoint", () => {
        gameObjects.roomJackObjs.passedSafePoint = true;
    });
}
function roomJackUpdate(e) {
    if (gameObjects.roomJackObjs.shouldUpdate) {
        if (
            (gameObjects.roomJackObjs.spinnerButton.getIsDragged() && gameObjects.roomJackObjs.canSpin) ||
            gameObjects.roomJackObjs.isAutopilot
        ) {
            let a = gameObjects.roomJackObjs.spinnerButton.getXPos();
            let o = gameObjects.roomJackObjs.spinnerButton.getYPos();
            let t = a - gameObjects.roomJackObjs.spinner.x;
            let s = o - gameObjects.roomJackObjs.spinner.y;
            let c = Math.atan2(s, t);
            if (c > Math.PI) {
                c -= 2 * Math.PI;
            }
            let m = c - gameObjects.roomJackObjs.spinner.rotation;
            if (m > Math.PI) {
                m -= 2 * Math.PI;
            } else {
                if (m < -Math.PI) {
                    m += 2 * Math.PI;
                }
            }
            let r = gameObjects.roomJackObjs.maxRotSpeed * gameObjects.roomJackObjs.speedRatio;
            let b = 0;
            if (gameObjects.roomJackObjs.isAutopilot) {
                b = r;
                if (gameObjects.roomJackObjs.spinnerButton.getIsDragged() && m < 0.01) {
                    b -= Math.min(0.5 * r, Math.abs(0.003 * m));
                }
            } else {
                if (m > 0.01 && !gameVars.darkPoint) {
                    b = Math.min(r, 0.02 * m);
                } else {
                    if (gameVars.darkPoint && m < 0.01) {
                        b = Math.max(-r, 0.02 * m);
                    }
                }
            }
            if (gameObjects.roomJackObjs.slowRotation) {
                b *= 0.45;
            }
            if (Math.abs(b) > 0.00001) {
                gameObjects.roomJackObjs.spinner.rotVel += b * e;
            }
            gameObjects.roomJackObjs.spinner.rotation += gameObjects.roomJackObjs.spinner.rotVel;
            gameObjects.roomJackObjs.totalDistRotated += gameObjects.roomJackObjs.spinner.rotVel;
            if (gameVars.darkPoint) {
                checkMusicSequenceDark(gameObjects.roomJackObjs.spinner.rotVel);
            } else {
                if (gameVars.horrorPoint) {
                    checkMusicSequenceHorror(gameObjects.roomJackObjs.spinner.rotVel, e);
                } else {
                    checkMusicSequenceNormal(gameObjects.roomJackObjs.spinner.rotVel);
                }
            }
        }
        if (gameObjects.roomJackObjs.spinnerButton.getIsDragged() && gameObjects.roomJackObjs.canSpin) {
            updateGuideArrowJack();
        }
        gameObjects.roomJackObjs.spinner.rotVel *= 0.5;
        if (gameObjects.roomJackObjs.animateLid) {
            gameObjects.roomJackObjs.lid.rotation += gameObjects.roomJackObjs.lid.rotVel;
            gameObjects.roomJackObjs.lid.rotVel *= 0.831;
            if (gameObjects.roomJackObjs.lid.rotVel <= 0.01) {
                gameObjects.roomJackObjs.animateLid = false;
            }
        }
        if ("jump" === gameObjects.roomJackObjs.jackJumpState) {
            gameObjects.roomJackObjs.lid.rotation += gameObjects.roomJackObjs.lid.rotVel;
            gameObjects.roomJackObjs.lid.rotVel *= 0.831;
            if (gameObjects.roomJackObjs.lid.rotation > 3) {
                gameObjects.roomJackObjs.jackJumpState = "finished";
                if (!gameVars.horrorPoint) {
                    roomJackMarkStage(ROOM_JACK_STAGE_POPPED);
                    gameDelay(() => {
                        createKey(
                            gameObjects.roomJackObjs.box.x,
                            gameObjects.roomJackObjs.box.y - 60,
                            gameObjects.roomJackObjs.roomIndex,
                            gameObjects.roomJackObjs.roomContainer,
                            true
                        );
                    }, 250);
                }
            }
        }
        gameObjects.roomJackObjs.dollHead.x = gameObjects.roomJackObjs.dollCreepy.x;
        gameObjects.roomJackObjs.dollHead.y =
            gameObjects.roomJackObjs.dollCreepy.y - gameObjects.roomJackObjs.halfHeightDiffDoll;
        gameObjects.roomJackObjs.dollHead.scaleX = gameObjects.roomJackObjs.dollCreepy.scaleX;
        gameObjects.roomJackObjs.dollEyes.x =
            gameObjects.roomJackObjs.dollCreepy.x + gameObjects.roomJackObjs.eyeOffsetX;
        gameObjects.roomJackObjs.dollEyes.y =
            gameObjects.roomJackObjs.dollCreepy.y -
            gameObjects.roomJackObjs.halfHeightDiffDoll +
            gameObjects.roomJackObjs.eyeOffsetY;
        gameObjects.roomJackObjs.dollEyes.scaleX = gameObjects.roomJackObjs.dollCreepy.scaleX;
        gameObjects.roomJackObjs.dollHeadUnder.x = gameObjects.roomJackObjs.dollHead.x;
        gameObjects.roomJackObjs.dollHeadUnder.y = gameObjects.roomJackObjs.dollHead.y;
        gameObjects.roomJackObjs.dollHeadUnder.scaleX = gameObjects.roomJackObjs.dollHead.scaleX;
        updateJackArmsLeft(e);
        if (gameObjects.roomJackObjs.useAltArmMovement) {
            updateJackArmsRightAuto();
        } else {
            updateJackArmsRight();
        }
    }
}
function resetSpinnerButton() {
    let e = gameObjects.roomJackObjs.spinner.x + 121 * Math.cos(gameObjects.roomJackObjs.spinner.rotation);
    let a = gameObjects.roomJackObjs.spinner.y + 121 * Math.sin(gameObjects.roomJackObjs.spinner.rotation);
    gameObjects.roomJackObjs.spinnerButton.setPos(e, a);
    resetGuideArrowJack();
}
function createNoteVisual(e, a, o = 15728640) {
    let t = null;
    if (gameObjects.noteList.length > 0) {
        t = gameObjects.noteList.pop();
    } else {
        (t = globalScene.add.image(0, 0, "misc", "note")).depth = 999;
        gameObjects.roomJackObjs.roomContainer.add(t);
    }
    t.x = e;
    t.y = a;
    t.scaleX = 0.85;
    t.scaleY = 0.85;
    t.setTint(o);
    let s = 0.1 * Math.random();
    globalScene.tweens.add({
        targets: t,
        ease: "Cubic.easeOut",
        scaleX: 1.03 + s,
        scaleY: 1.03 + s,
        duration: 250,
        onComplete: () => {
            globalScene.tweens.add({
                targets: t,
                ease: "Cubic.easeIn",
                scaleX: 0.99 + s,
                scaleY: 0.99 + s,
                duration: 250,
                onComplete: () => {
                    globalScene.tweens.add({
                        targets: t,
                        scaleX: 1 + s,
                        scaleY: 1 + s,
                        duration: 200,
                        onComplete: () => {
                            globalScene.tweens.add({
                                targets: t,
                                ease: "Cubic.easeIn",
                                scaleX: 0,
                                scaleY: 0,
                                duration: 125
                            });
                        }
                    });
                }
            });
        }
    });
    globalScene.tweens.add({
        targets: t,
        ease: "Cubic.easeOut",
        y: t.y - 50 + 10 * Math.random(),
        duration: 700,
        onComplete: () => {
            gameObjects.noteList.push(t);
        }
    });
}
function checkMusicSequenceNormal(e) {
    if ("default" !== gameObjects.roomJackObjs.jackJumpState) return;
    if (
        ((gameObjects.roomJackObjs.rotateMusicAccumulate += e),
        gameObjects.roomJackObjs.noteCount >= gameObjects.roomJackObjs.musicDataNormal.length)
    ) {
        gameObjects.roomJackObjs.jackJumpState = "jump";
        gameObjects.roomJackObjs.lid.rotVel = 0.51;
        animatePopUp();
        playLastNotes();
        playSound("nyaha");
        playSound("squeakopen");
        gameObjects.roomJackObjs.canSpin = false;
        return void resetGuideArrowJack();
    }
    let a = gameObjects.roomJackObjs.musicDataNormal[gameObjects.roomJackObjs.noteCount];
    if (gameObjects.roomJackObjs.rotateMusicAccumulate > a.accumulate) {
        if (a.static) showStaticRand(1, undefined, undefined, 0.06);
        else if (a.slowSpin) gameObjects.roomJackObjs.slowRotation = true;
        else {
            let e = undefined;
            playMusicBoxNote(a.note, a.volume, a.tint, e);
            gameObjects.roomJackObjs.slowRotation = false;
        }
        gameObjects.roomJackObjs.noteCount++;
        gameObjects.roomJackObjs.rotateMusicAccumulate = 0;
    }
}
function checkMusicSequenceDark(e) {
    if (!gameObjects.exhibit.needCleanup) return;
    gameObjects.roomJackObjs.rotateMusicAccumulate -= e;
    let a = gameObjects.roomJackObjs.musicDataDark[gameObjects.roomJackObjs.noteCount];
    if (a) {
        if (gameObjects.roomJackObjs.rotateMusicAccumulate > a.accumulate) {
            if (a.static) {
                showStaticRand(1, undefined, undefined, 0.06);
            } else {
                if (a.slowSpin) {
                    gameObjects.roomJackObjs.slowRotation = true;
                } else {
                    playMusicBoxNote(a.note, a.volume, a.tint);
                    gameObjects.roomJackObjs.slowRotation = false;
                }
            }
            gameObjects.roomJackObjs.noteCount++;
            gameObjects.roomJackObjs.rotateMusicAccumulate = 0;
        }
    } else {
        gameObjects.roomJackObjs.lid.rotation -= 0.09;
        gameObjects.roomJackObjs.dollCreepy.y = Math.min(2010, gameObjects.roomJackObjs.dollCreepy.y + 11);
        gameObjects.roomJackObjs.dollCreepy.scaleX = Math.max(0.4, gameObjects.roomJackObjs.dollCreepy.scaleX - 0.07);
        gameObjects.roomJackObjs.dollHead.visible = false;
        gameObjects.roomJackObjs.dollEyes.visible = false;
        gameObjects.roomJackObjs.dollHeadUnder.visible = true;
        if (!gameObjects.roomJackObjs.playedSlam) {
            gameDelay(() => {
                playSound("lidslam");
                gameDelay(() => {
                    zoomTemp(1.028);
                    gameObjects.roomJackObjs.dollCreepy.y = 2010;
                    gameObjects.roomJackObjs.lid.rotation = 0;
                }, 170);
            }, 70);
            gameObjects.roomJackObjs.playedSlam = true;
        }
    }
    gameObjects.roomJackObjs.dollCreepy.y = Math.min(2010, gameObjects.roomJackObjs.dollCreepy.y - 5 * e);
    gameObjects.roomJackObjs.lid.rotation = Math.max(0, gameObjects.roomJackObjs.lid.rotation + 0.2 * e);
    if (gameObjects.roomJackObjs.lid.rotation <= 0.01) {
        gameObjects.roomJackObjs.lid.rotation = 0;
        gameObjects.exhibit.needCleanup = false;
        gameObjects.roomJackObjs.canSpin = false;
        roomJackMarkStage(ROOM_JACK_STAGE_CLOSED);
        messageBus.publish("saveCheckpoint");
        resetGuideArrowJack();
        gameDelay(() => {
            playSound("deepbell1");
            updateInfoTextSoft(TEXT.roomCleaned, 2500);
        }, 400);
    }
}
function checkMusicSequenceHorror(e, a = 1) {
    if (((gameObjects.roomJackObjs.rotateMusicAccumulate += e), gameObjects.roomJackObjs.startFinale)) {
        let a = e * (gameObjects.roomJackObjs.isAutopilot ? 23 : 7);
        if (
            ((gameObjects.roomJackObjs.dollCreepy.y -= a),
            (gameObjects.roomJackObjs.neck1.rotation += 0.004 * a),
            (gameObjects.roomJackObjs.neck2.rotation -= 0.004 * a),
            (gameObjects.roomJackObjs.neck3.rotation += 0.004 * a),
            (gameObjects.roomJackObjs.eyeOffsetY -= 0.05 * a),
            gameObjects.roomJackObjs.eyeOffsetY < -24 && (gameObjects.roomJackObjs.eyeOffsetY = 24),
            addScreenShake((Math.random() - 0.5) * e * 3, (Math.random() - 0.5) * e * 3),
            gameObjects.roomJackObjs.dollCreepy.y < -600)
        ) {
            addScreenShake((Math.random() - 0.5) * e * 4, (Math.random() - 0.5) * e * 8);
            gameObjects.roomJackObjs.dollface.y += 40 * e;
            gameObjects.roomJackObjs.dollface.x -= 3 * e;
            gameObjects.roomJackObjs.dollface.rotation += 0.001 * e;
            let a = 0.035 * e;
            gameObjects.roomJackObjs.dollface.scaleY = gameObjects.roomJackObjs.dollface.scaleY + a;
            gameObjects.roomJackObjs.dollface.scaleX =
                gameObjects.roomJackObjs.dollface.scaleY *
                (1 + 0.05 * Math.sin(20 * gameObjects.roomJackObjs.rotateMusicAccumulate));
            showStaticLite();
            if (gameObjects.roomJackObjs.dollface.y > 590) {
                removeFromUpdateFuncList(roomJackUpdate);
                disableMoveLeftButton();
                showFlashRand(5, undefined, () => {
                    showStaticRand(4);
                    gameObjects.sounds.squeak3.stop();
                    gameObjects.exhibit.moveRight(true);
                    gameObjects.roomJackObjs.neck1.visible = false;
                    gameObjects.roomJackObjs.neck2.visible = false;
                    gameObjects.roomJackObjs.neck3.visible = false;
                    disableMoveButtons();
                    gameObjects.roomJackObjs.dollface.destroy();
                    gameObjects.roomJackObjs.dollmouth.destroy();
                    showFlashArr([5, 6, 7, 8, 17, 9, 17, 10, 18], () => {
                        disableMoveLeftButton();
                        gameDelay(() => {
                            disableMoveLeftButton();
                        }, 20);
                    });
                });
            }
        } else if (gameObjects.roomJackObjs.dollCreepy.y < 950) {
            if (Math.random() < 0.25) {
                showStaticLite(1);
            }
            if (!gameObjects.roomJackObjs.playedLaugh) {
                gameObjects.roomJackObjs.playedLaugh = true;
                playSound("clownlaughfinal");
                tweenVolume("gladiatorx", 0);
                messageBus.publish("prepareFinalClown");
            }
        }
    }
    if (
        ((gameObjects.roomJackObjs.dollmouth.x = gameObjects.roomJackObjs.dollface.x),
        (gameObjects.roomJackObjs.dollmouth.y = gameObjects.roomJackObjs.dollface.y),
        (gameObjects.roomJackObjs.dollmouth.scaleX = gameObjects.roomJackObjs.dollface.scaleX),
        (gameObjects.roomJackObjs.dollmouth.scaleY =
            gameObjects.roomJackObjs.dollface.scaleY * gameObjects.roomJackObjs.dollmouth.scaleYRatio),
        gameObjects.roomJackObjs.dollmouth.scaleYRatio <= 1
            ? (gameObjects.roomJackObjs.dollmouth.scaleYVel = 0.035)
            : gameObjects.roomJackObjs.dollmouth.scaleYRatio >= 1.14 &&
              (gameObjects.roomJackObjs.dollmouth.scaleYVel = -0.035),
        (gameObjects.roomJackObjs.dollmouth.scaleYRatio += gameObjects.roomJackObjs.dollmouth.scaleYVel),
        gameObjects.roomJackObjs.noteCount >= gameObjects.roomJackObjs.musicDataHorror.length)
    )
        return;
    let o = gameObjects.roomJackObjs.musicDataHorror[gameObjects.roomJackObjs.noteCount];
    if (gameObjects.roomJackObjs.rotateMusicAccumulate > o.accumulate) {
        if ((o.sfx && playSound(o.sfx), o.static)) {
            if (o.duration) {
                o.duration;
            }
            let e = o.duration ? 1 : 0.25;
            showStaticRand(1, undefined, undefined, e);
        } else if (o.slowSpin) {
            gameObjects.roomJackObjs.slowRotation = true;
        } else {
            if (o.popupHeadHorror) {
                gameObjects.roomJackObjs.placard.setOnMouseUpFunc(() => {
                    showStaticLite();
                    updateInfoText(TEXT.jack.horrorShout);
                });
                gameObjects.roomJackObjs.jackJumpState = "jump";
                gameObjects.roomJackObjs.lid.rotVel = 0.4;
                gameObjects.roomJackObjs.dollHeadUnder.destroy();
                animatePopUp();
                playSound("nyaha");
                playSound("squeakopen");
                gameDelay(() => {
                    showStaticRand(2, undefined, undefined, 0.15);
                    gameDelay(() => {
                        showStaticRand(1, undefined, undefined, 0.07);
                    }, 3000);
                }, 1600);
            } else {
                if (o.startFinale) {
                    startFinale();
                } else {
                    if (o.showLeftArm) {
                        gameObjects.roomJackObjs.dollHeadFlash2.visible = false;
                        showFlashRand(2);
                        jumpOutLeftArm();
                        showStaticRand(2, undefined, undefined, 0.15);
                        gameDelay(() => {
                            if (!gameObjects.roomJackObjs.passedSafePoint) {
                                gameObjects.sounds.pumpamb.play();
                                gameObjects.sounds.pumpamb.volume = 1 * gameVars.soundMult;
                                gameObjects.roomJackObjs.dollHeadFlash2.visible = true;
                                gameObjects.roomJackObjs.dollHeadFlash2.scaleX = 0.9;
                                gameObjects.roomJackObjs.dollHeadFlash2.scaleY = 0.9;
                                gameObjects.roomJackObjs.dollHead.visible = false;
                                gameObjects.roomJackObjs.dollEyes.visible = false;
                                gameObjects.roomJackObjs.dollCreepy.visible = false;
                                addToUpdateFuncList(shakeHeadFlashTwo);
                                gameDelay(() => {
                                    gameObjects.sounds.pumpamb.stop();
                                    gameObjects.roomJackObjs.dollHeadFlash2.visible = false;
                                    removeFromUpdateFuncList(shakeHeadFlashTwo);
                                    showStaticRand(1);
                                    showFlashRand(1);
                                    gameObjects.roomJackObjs.dollHead.visible = true;
                                    gameObjects.roomJackObjs.dollEyes.visible = true;
                                    gameObjects.roomJackObjs.dollCreepy.visible = true;
                                }, 385);
                            }
                        }, 7000);
                    } else {
                        if (o.showRightArm) {
                            gameObjects.roomJackObjs.dollHead.visible = false;
                            gameObjects.roomJackObjs.dollEyes.visible = false;
                            gameObjects.roomJackObjs.dollCreepy.visible = false;
                            gameObjects.roomJackObjs.lights.alpha *= 0.5;
                            gameObjects.roomJackObjs.dollHeadFlash1.visible = true;
                            gameObjects.roomJackObjs.dollHeadFlash1.scaleX = 0.8;
                            gameObjects.roomJackObjs.dollHeadFlash1.scaleY = 0.8;
                            addToUpdateFuncList(shakeHeadFlashOne);
                            showFlashRand(2);
                            gameDelay(() => {
                                showFlashRand(1);
                                playSound("squeak1");
                            }, 150);
                            playSound("void");
                            playSound("stopmusic");
                            gameDelay(() => {
                                showFlashRand(2);
                                gameObjects.roomJackObjs.dollHead.visible = true;
                                gameObjects.roomJackObjs.dollEyes.visible = true;
                                gameObjects.roomJackObjs.dollCreepy.visible = true;
                                removeFromUpdateFuncList(shakeHeadFlashOne);
                                gameObjects.roomJackObjs.dollHeadFlash1.destroy();
                                gameObjects.roomJackObjs.lights.alpha *= 2;
                                jumpOutRightArm();
                                gameObjects.sounds.void.stop();
                            }, 475);
                            showStaticRand(2, undefined, undefined, 0.15);
                        } else {
                            if (o.message) {
                                messageBus.publish(o.message);
                            } else {
                                if (o.startAutoSpin) {
                                    gameObjects.roomJackObjs.spinnerButton.destroy();
                                    gameObjects.roomJackObjs.speedRatio = 12.5;
                                    flipToAutoSpinArm();
                                } else {
                                    if (o.updateProp) {
                                        gameObjects.roomJackObjs[o.updateProp] = o.updateVal;
                                    } else {
                                        if (!o.special) {
                                            playMusicBoxNote(o.note, o.volume, o.tint);
                                            gameObjects.roomJackObjs.slowRotation = false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        gameObjects.roomJackObjs.noteCount++;
        gameObjects.roomJackObjs.rotateMusicAccumulate = 0;
    }
}
function setupJackMusicSequence() {
    gameObjects.roomJackObjs.musicDataNormal = [
        {
            accumulate: 0.1,
            note: "g6",
            tint: 6684842
        },
        {
            accumulate: 0.195,
            slowSpin: true
        },
        {
            accumulate: 0.05,
            note: "c7b",
            tint: 1118702
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.4,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.2,
            note: "g7",
            tint: 16711680
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.45,
            slowSpin: true
        },
        {
            accumulate: 0.05,
            static: true
        },
        {
            accumulate: 0.15,
            static: true
        },
        {
            accumulate: 0.4,
            note: "g6",
            tint: 3342506,
            volume: 0.5
        },
        {
            accumulate: 0.01,
            note: "c7",
            tint: 4607,
            volume: 0.4
        },
        {
            accumulate: 0.01,
            note: "e7",
            tint: 2280618,
            volume: 0.3
        },
        {
            accumulate: 0.01,
            note: "a7",
            tint: 16724787
        }
    ];
    gameObjects.roomJackObjs.musicDataDark = [
        {
            accumulate: 0.02,
            slowSpin: true
        },
        {
            accumulate: 0.05,
            static: true
        },
        {
            accumulate: 0.1,
            note: "a7",
            tint: 16724787
        },
        {
            accumulate: 0.6,
            note: "g7",
            tint: 15597568
        },
        {
            accumulate: 0.6,
            note: "f7b",
            tint: 11184674
        },
        {
            accumulate: 0.6,
            note: "e7",
            tint: 2263159
        },
        {
            accumulate: 0.6,
            note: "d7",
            tint: 26231
        },
        {
            accumulate: 0.6,
            note: "c7b",
            tint: 1118532
        },
        {
            accumulate: 0.8,
            static: true
        },
        {
            accumulate: 0.02,
            slowSpin: true
        },
        {
            accumulate: 0.01,
            note: "g6s",
            tint: 0
        }
    ];
    gameObjects.roomJackObjs.musicDataHorror = [
        {
            accumulate: 0.02,
            slowSpin: true
        },
        {
            accumulate: 0.05,
            note: "g6",
            tint: 3342506
        },
        {
            accumulate: 0.1,
            static: true,
            duration: 4
        },
        {
            accumulate: 0.02,
            slowSpin: true,
            sfx: "squeak2"
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.5,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.4,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 2280618
        },
        {
            accumulate: 0.2,
            note: "g7",
            tint: 16711680
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.8,
            note: "g6",
            tint: 3342506
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.4,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.65,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "g6",
            tint: 3342506
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.4,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.2,
            note: "g7",
            tint: 16711680
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 2280618
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.01,
            static: true
        },
        {
            accumulate: 0.2,
            slowSpin: true
        },
        {
            accumulate: 0.01,
            static: true
        },
        {
            accumulate: 0.2,
            slowSpin: true,
            sfx: "squeak2"
        },
        {
            accumulate: 0.05,
            popupHeadHorror: true
        },
        {
            accumulate: 0.3,
            slowSpin: true
        },
        {
            accumulate: 0.35,
            startFinale: true,
            sfx: "squeak1"
        },
        {
            accumulate: 0.4,
            note: "g6",
            tint: 3342506
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.4,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.01,
            showLeftArm: true
        },
        {
            accumulate: 0.01,
            slowSpin: true
        },
        {
            accumulate: 0.3,
            slowSpin: true,
            sfx: "squeak1"
        },
        {
            accumulate: 0.3,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "g6",
            tint: 3342506
        },
        {
            accumulate: 0.01,
            message: "passedSafePoint"
        },
        {
            accumulate: 0.01,
            message: "speedDown"
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.4,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.2,
            note: "g7",
            tint: 16711680
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.2,
            showRightArm: true
        },
        {
            accumulate: 0.01,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.8,
            note: "g6",
            tint: 3342506
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.4,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.4,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.5,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.6,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.3,
            startAutoSpin: true
        }
    ];
    let e = [
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.4,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.2,
            note: "g7",
            tint: 16711680
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "g6",
            tint: 3342506
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.4,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.6,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "g6",
            tint: 3342506
        }
    ];
    let a = [
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.2,
            note: "g7",
            tint: 65280
        },
        {
            accumulate: 0.01,
            message: "speedUp"
        }
    ];
    let o = [
        {
            accumulate: 0.2,
            note: "f7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "f7b",
            tint: 4607
        },
        {
            accumulate: 0.01,
            message: "speedUp"
        }
    ];
    gameObjects.roomJackObjs.musicDataHorror = gameObjects.roomJackObjs.musicDataHorror.concat([
        {
            accumulate: 0.4,
            note: "g6",
            tint: 3342506
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.4,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.01,
            message: "disableMoveButtons"
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.2,
            note: "g7",
            tint: 16711680
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.01,
            message: "speedUp"
        },
        {
            accumulate: 0.4,
            note: "g6",
            tint: 3342506
        },
        {
            accumulate: 0.2,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.2,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.8,
            note: "d7",
            tint: 56831
        },
        {
            accumulate: 0.2,
            note: "e7",
            tint: 65280
        },
        {
            accumulate: 0.4,
            note: "c7",
            tint: 4607
        },
        {
            accumulate: 0.01,
            message: "speedUp"
        }
    ]);
    gameObjects.roomJackObjs.musicDataHorror = gameObjects.roomJackObjs.musicDataHorror.concat(e);
    gameObjects.roomJackObjs.musicDataHorror = gameObjects.roomJackObjs.musicDataHorror.concat(e);
    gameObjects.roomJackObjs.musicDataHorror = gameObjects.roomJackObjs.musicDataHorror.concat(a);
    gameObjects.roomJackObjs.musicDataHorror = gameObjects.roomJackObjs.musicDataHorror.concat(a);
    gameObjects.roomJackObjs.musicDataHorror = gameObjects.roomJackObjs.musicDataHorror.concat(o);
    gameObjects.roomJackObjs.musicDataHorror = gameObjects.roomJackObjs.musicDataHorror.concat(o);
    gameObjects.roomJackObjs.musicDataHorror = gameObjects.roomJackObjs.musicDataHorror.concat(o);
    gameObjects.roomJackObjs.musicDataHorror = gameObjects.roomJackObjs.musicDataHorror.concat(o);
    gameObjects.roomJackObjs.musicDataHorror = gameObjects.roomJackObjs.musicDataHorror.concat([
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.01,
            message: "speedUp"
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.01,
            message: "speedUp"
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.01,
            message: "speedUp"
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.01,
            message: "speedUp"
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.2,
            note: "creepysfx",
            tint: 0
        },
        {
            accumulate: 0.01,
            message: "speedUp"
        }
    ]);
}
function playLastNotes() {
    gameDelay(() => {
        playMusicBoxNote("d7", undefined, 56831);
        gameDelay(() => {
            playMusicBoxNote("f7", undefined, 16776960);
            gameDelay(() => {
                playMusicBoxNote("e7", undefined, 65280);
                gameDelay(() => {
                    playMusicBoxNote("c7", undefined, 4607);
                }, 400);
            }, 200);
        }, 200);
    }, 1000);
}
function playMusicBoxNote(e, a, o, t) {
    playSound(e, undefined, a);
    let s = t;
    if (null == s) {
        s = gameObjects.roomJackObjs.box.x + 150 * (Math.random() - 0.5);
    }
    createNoteVisual(s, gameObjects.roomJackObjs.box.y - 8 * Math.random() - 110, o);
}
function updateGuideArrowJack() {
    let e = gameObjects.roomJackObjs.spinner.x;
    let a = gameObjects.roomJackObjs.spinner.y;
    let o = gameObjects.roomJackObjs.spinner.rotation;
    let t = e + 121 * Math.cos(o);
    let s = a + 121 * Math.sin(o);
    let c = gameVars.mouseposx - t - gameVars.halfWidth;
    let m = gameVars.mouseposy - s;
    let r = Math.min(120, Math.sqrt(c * c + m * m));
    if (r < 35) {
        r = 0;
    }
    let b = Math.atan2(m, c);
    updateGuideArrow(t, s, b, r);
}
function resetGuideArrowJack() {
    updateGuideArrow(0, -9999);
}
function animatePopUp() {
    gameObjects.roomJackObjs.headPopup1.visible = true;
    gameObjects.roomJackObjs.dollCreepy.visible = false;
    addToUpdateFuncList(updatePopUp);
    globalScene.tweens.add({
        targets: gameObjects.roomJackObjs.dollCreepy,
        y: gameObjects.roomJackObjs.dollCreepy.origYPos - 266,
        ease: "Cubic.easeOut",
        duration: 275,
        onComplete: () => {
            globalScene.tweens.add({
                targets: gameObjects.roomJackObjs.dollCreepy,
                y: gameObjects.roomJackObjs.dollCreepy.origYPos - 260,
                ease: "Elastic",
                easeParams: [1.3, 0.25],
                duration: 500
            });
        }
    });
    globalScene.tweens.add({
        targets: gameObjects.roomJackObjs.dollCreepy,
        scaleX: 0.65,
        ease: "Cubic.easeIn",
        duration: 75,
        onComplete: () => {
            gameObjects.roomJackObjs.headPopup1.visible = false;
            gameObjects.roomJackObjs.headPopup2.visible = true;
            globalScene.tweens.add({
                targets: gameObjects.roomJackObjs.dollCreepy,
                scaleX: 1.3,
                ease: "Cubic.easeIn",
                duration: 110,
                onComplete: () => {
                    globalScene.tweens.add({
                        targets: gameObjects.roomJackObjs.dollCreepy,
                        scaleX: 1,
                        ease: "Cubic.easeOut",
                        duration: 60,
                        onComplete: () => {
                            gameObjects.roomJackObjs.headPopup2.visible = false;
                            gameObjects.roomJackObjs.dollEyes.visible = true;
                            gameObjects.roomJackObjs.dollHead.visible = true;
                            gameObjects.roomJackObjs.dollCreepy.visible = true;
                            gameObjects.roomJackObjs.dollHeadUnder.visible = false;
                            removeFromUpdateFuncList(updatePopUp);
                        }
                    });
                }
            });
        }
    });
}
function updatePopUp() {
    let e = gameObjects.roomJackObjs.dollCreepy.y - 1400;
    let a = gameObjects.roomJackObjs.dollCreepy.scaleX;
    gameObjects.roomJackObjs.headPopup1.y = e;
    gameObjects.roomJackObjs.headPopup2.y = e;
    gameObjects.roomJackObjs.headPopup2.scaleX = a;
}
function setupJackArms(scene) {
    gameObjects.roomJackObjs.leftArm1 = scene.add
        .image(-52, gameVars.height + 310, "roomJack", "upperArm")
        .setOrigin(0.02, 0.5);
    gameObjects.roomJackObjs.leftArm1.shadowLength = 0.03;
    gameObjects.roomJackObjs.leftArm1.origX = gameObjects.roomJackObjs.leftArm1.x;
    gameObjects.roomJackObjs.leftArm1.rotation = 0.5 * -Math.PI;
    gameObjects.roomJackObjs.leftArm1.goalRot = gameObjects.roomJackObjs.leftArm1.rotation;
    gameObjects.roomJackObjs.leftArm1.trueRot = gameObjects.roomJackObjs.leftArm1.rotation;
    gameObjects.roomJackObjs.leftArm2 = scene.add.image(0, 9999, "roomJack", "midArm").setOrigin(0.06, 0.5);
    gameObjects.roomJackObjs.leftArm2.rotation = 0.5 * Math.PI;
    gameObjects.roomJackObjs.leftArm2.goalRot = gameObjects.roomJackObjs.leftArm2.rotation;
    gameObjects.roomJackObjs.leftArm2.trueRot = gameObjects.roomJackObjs.leftArm2.rotation;
    gameObjects.roomJackObjs.leftArm2.scaleY = -1;
    gameObjects.roomJackObjs.leftArm3 = scene.add.image(0, 9999, "roomJack", "lowerArm").setOrigin(0.07, 0.5);
    gameObjects.roomJackObjs.leftArm3.scaleY = -1;
    gameObjects.roomJackObjs.leftArm3.rotation = 0.5 * Math.PI;
    gameObjects.roomJackObjs.leftArm3.goalRot = gameObjects.roomJackObjs.leftArm3.rotation;
    gameObjects.roomJackObjs.leftArm3.trueRot = gameObjects.roomJackObjs.leftArm3.rotation;
    gameObjects.roomJackObjs.leftHand = scene.add.image(0, 9999, "roomJack", "hand2");
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.leftArm1);
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.leftArm2);
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.leftArm3);
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.leftHand);
    gameObjects.roomJackObjs.rightArm1 = scene.add
        .image(52, gameVars.height + 310, "roomJack", "upperArm")
        .setOrigin(0.02, 0.5);
    gameObjects.roomJackObjs.rightArm1.shadowLength = 0.03;
    gameObjects.roomJackObjs.rightArm1.origX = gameObjects.roomJackObjs.rightArm1.x;
    gameObjects.roomJackObjs.rightArm1.rotation = 0.5 * -Math.PI;
    gameObjects.roomJackObjs.rightArm1.goalRot = gameObjects.roomJackObjs.rightArm1.rotation;
    gameObjects.roomJackObjs.rightArm1.trueRot = gameObjects.roomJackObjs.rightArm1.rotation;
    gameObjects.roomJackObjs.rightArm2 = scene.add.image(0, 9999, "roomJack", "midArm").setOrigin(0.06, 0.45);
    gameObjects.roomJackObjs.rightArm2.rotation = 0.5 * Math.PI;
    gameObjects.roomJackObjs.rightArm2.goalRot = gameObjects.roomJackObjs.rightArm2.rotation;
    gameObjects.roomJackObjs.rightArm2.trueRot = gameObjects.roomJackObjs.rightArm2.rotation;
    gameObjects.roomJackObjs.rightArm3 = scene.add.image(0, 9999, "roomJack", "lowerArm").setOrigin(0.07, 0.5);
    gameObjects.roomJackObjs.rightArm3.scaleY = -1;
    gameObjects.roomJackObjs.rightArm3.rotation = 0.5 * Math.PI;
    gameObjects.roomJackObjs.rightArm3.goalRot = gameObjects.roomJackObjs.rightArm3.rotation;
    gameObjects.roomJackObjs.rightArm3.trueRot = gameObjects.roomJackObjs.rightArm3.rotation;
    gameObjects.roomJackObjs.rightHand = scene.add.image(0, 9999, "roomJack", "hand2");
    gameObjects.roomJackObjs.rightHand.scaleX = -1;
    gameObjects.roomJackObjs.rightElbow = {
        x: 0,
        y: 0,
        velX: 0,
        velY: 0
    };
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.rightArm1);
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.rightArm2);
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.rightArm3);
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.rightHand);
    updateJackArmsLeft();
    updateJackArmsRight();
}
function updateJackArmsLeft() {
    let e = gameObjects.roomJackObjs.leftArm1;
    let a = gameObjects.roomJackObjs.leftArm2;
    let o = gameObjects.roomJackObjs.leftArm3;
    gameObjects.roomJackObjs.leftHand;
    a.x = e.x + e.width * e.scaleX * Math.cos(e.rotation) * (0.87 + e.shadowLength);
    a.y = e.y + e.width * e.scaleX * Math.sin(e.rotation) * (0.87 + e.shadowLength);
    o.x = a.x + a.width * a.scaleX * Math.cos(a.rotation) * 0.97;
    o.y = a.y + a.width * a.scaleX * Math.sin(a.rotation) * 0.97;
    gameObjects.roomJackObjs.leftHand.x = o.x + o.width * o.scaleX * Math.cos(o.rotation) * 0.95;
    gameObjects.roomJackObjs.leftHand.y = o.y + o.width * o.scaleX * Math.sin(o.rotation) * 0.95;
    e.x = gameObjects.roomJackObjs.leftArm1.origX - Math.random();
    gameObjects.roomJackObjs.leftArm1.trueRot =
        0.1 * gameObjects.roomJackObjs.leftArm1.trueRot + 0.9 * gameObjects.roomJackObjs.leftArm1.goalRot;
    gameObjects.roomJackObjs.leftArm2.trueRot =
        0.1 * gameObjects.roomJackObjs.leftArm2.trueRot + 0.9 * gameObjects.roomJackObjs.leftArm2.goalRot;
    gameObjects.roomJackObjs.leftArm3.trueRot =
        0.1 * gameObjects.roomJackObjs.leftArm3.trueRot + 0.9 * gameObjects.roomJackObjs.leftArm3.goalRot;
    gameObjects.roomJackObjs.leftArm1.rotation = gameObjects.roomJackObjs.leftArm1.trueRot + 0.02 * Math.random();
    gameObjects.roomJackObjs.leftArm2.rotation = gameObjects.roomJackObjs.leftArm2.trueRot + 0.02 * Math.random();
    gameObjects.roomJackObjs.leftArm3.rotation = gameObjects.roomJackObjs.leftArm3.trueRot + 0.01 * Math.random();
}
function updateJackArmsRight() {
    let e = gameObjects.roomJackObjs.rightArm1;
    let a = gameObjects.roomJackObjs.rightArm2;
    let o = gameObjects.roomJackObjs.rightArm3;
    a.x = e.x + e.width * e.scaleX * Math.cos(e.rotation) * (0.86 + e.shadowLength);
    a.y = e.y + e.width * e.scaleX * Math.sin(e.rotation) * (0.86 + e.shadowLength);
    o.x = a.x + a.width * a.scaleX * Math.cos(a.rotation);
    o.y = a.y + a.width * a.scaleX * Math.sin(a.rotation);
    gameObjects.roomJackObjs.rightHand.x = o.x + o.width * o.scaleX * Math.cos(o.rotation) * 0.97;
    gameObjects.roomJackObjs.rightHand.y = o.y + o.width * o.scaleX * Math.sin(o.rotation) * 0.97;
    e.x = gameObjects.roomJackObjs.rightArm1.origX - Math.random();
    gameObjects.roomJackObjs.rightArm1.trueRot =
        0.1 * gameObjects.roomJackObjs.rightArm1.trueRot + 0.9 * gameObjects.roomJackObjs.rightArm1.goalRot;
    gameObjects.roomJackObjs.rightArm2.trueRot =
        0.1 * gameObjects.roomJackObjs.rightArm2.trueRot + 0.9 * gameObjects.roomJackObjs.rightArm2.goalRot;
    gameObjects.roomJackObjs.rightArm3.trueRot =
        0.1 * gameObjects.roomJackObjs.rightArm3.trueRot + 0.9 * gameObjects.roomJackObjs.rightArm3.goalRot;
    gameObjects.roomJackObjs.rightArm1.rotation = gameObjects.roomJackObjs.rightArm1.trueRot + 0.02 * Math.random();
    gameObjects.roomJackObjs.rightArm2.rotation = gameObjects.roomJackObjs.rightArm2.trueRot + 0.02 * Math.random();
    gameObjects.roomJackObjs.rightArm3.rotation = gameObjects.roomJackObjs.rightArm3.trueRot + 0.01 * Math.random();
    gameObjects.roomJackObjs.rightElbow.x = a.x + a.width * a.scaleX * Math.cos(a.rotation) * 0.96;
    gameObjects.roomJackObjs.rightElbow.y = a.y + a.width * a.scaleX * Math.sin(a.rotation) * 0.96;
}
function updateJackArmsRightAuto() {
    let e = gameObjects.roomJackObjs.rightArm1;
    let a = gameObjects.roomJackObjs.rightArm2;
    let o = gameObjects.roomJackObjs.rightArm3;
    if (
        ((gameObjects.roomJackObjs.rightArm1.rotation =
            gameObjects.roomJackObjs.rightArm1.trueRot +
            0.01 * Math.random() +
            0.3 * Math.sin(gameObjects.roomJackObjs.spinner.rotation) +
            0.25),
        gameObjects.roomJackObjs.readyToGrabSpinner)
    ) {
        let e = 121;
        let a = gameObjects.roomJackObjs.spinner.x + Math.cos(gameObjects.roomJackObjs.spinner.rotation) * e;
        let t = gameObjects.roomJackObjs.spinner.y + Math.sin(gameObjects.roomJackObjs.spinner.rotation) * e;
        gameObjects.roomJackObjs.rightHand.x = a;
        gameObjects.roomJackObjs.rightHand.y = t;
        gameObjects.roomJackObjs.rightHand.rotation = 0.35 * (o.rotation - 2.38);
    }
    if (gameObjects.roomJackObjs.readyToGrabSpinner) {
        o.x = gameObjects.roomJackObjs.rightHand.x + 105;
        o.y = gameObjects.roomJackObjs.rightHand.y + 45;
    } else {
        o.x = gameObjects.roomJackObjs.rightHand.x;
        o.y = gameObjects.roomJackObjs.rightHand.y;
    }
    a.x = e.x + e.width * e.scaleX * Math.cos(e.rotation) * 0.87;
    a.y = e.y + e.width * e.scaleX * Math.sin(e.rotation) * 0.87;
    let t = gameObjects.roomJackObjs.rightElbow.y - a.y;
    let s = gameObjects.roomJackObjs.rightElbow.x - a.x;
    let c = gameObjects.roomJackObjs.rightElbow.y - o.y;
    let m = gameObjects.roomJackObjs.rightElbow.x - o.x;
    a.rotation = Math.atan2(t, s);
    if (gameObjects.roomJackObjs.rightArm2.rotation < 0.5 * -Math.PI) {
        a.rotation = 0.4;
        gameObjects.roomJackObjs.rightElbow.x = a.x + a.width * a.scaleX * Math.cos(a.rotation) * 0.96;
        gameObjects.roomJackObjs.rightElbow.y = a.y + a.width * a.scaleX * Math.sin(a.rotation) * 0.96;
    }
    o.rotation = Math.atan2(c, m) + Math.PI;
    let r = 0.97 * Math.sqrt(s * s + t * t);
    let b = 1.1 * Math.sqrt(m * m + c * c);
    let O = r - a.width;
    gameObjects.roomJackObjs.rightElbow.velX += s * O * -0.003;
    gameObjects.roomJackObjs.rightElbow.velY += t * O * -0.003;
    let j = b - o.width;
    gameObjects.roomJackObjs.rightElbow.velX += m * j * -0.003;
    gameObjects.roomJackObjs.rightElbow.velY += c * j * -0.003;
    gameObjects.roomJackObjs.rightElbow.x += gameObjects.roomJackObjs.rightElbow.velX;
    gameObjects.roomJackObjs.rightElbow.y += gameObjects.roomJackObjs.rightElbow.velY + 0.01;
    gameObjects.roomJackObjs.rightElbow.velX *= 0.75;
    gameObjects.roomJackObjs.rightElbow.velY *= 0.75;
}
function flipToAutoSpinArm() {
    if (gameObjects.roomJackObjs.triggeredAutopilot) return;
    gameObjects.roomJackObjs.triggeredAutopilot = true;
    gameObjects.roomJackObjs.rightArm2.setOrigin(-0.03, 0.5);
    let e = gameObjects.roomJackObjs.rightArm3.rotation;
    gameObjects.roomJackObjs.rightArm3.rotation = e + 2 * Math.PI;
    gameObjects.roomJackObjs.rightArm3.setOrigin(0.98, 0.5);
    gameObjects.roomJackObjs.rightArm3.x = gameObjects.roomJackObjs.rightHand.x;
    gameObjects.roomJackObjs.rightArm3.y = gameObjects.roomJackObjs.rightHand.y;
    globalScene.tweens.add({
        targets: gameObjects.roomJackObjs.rightArm1,
        scaleX: 0.9,
        x: "-=15",
        y: "-=20",
        ease: "Quad.easeOut",
        duration: 200
    });
    let a = gameObjects.roomJackObjs.spinner.x + 121 * Math.cos(gameObjects.roomJackObjs.spinner.rotation);
    let o = gameObjects.roomJackObjs.spinner.y + 121 * Math.sin(gameObjects.roomJackObjs.spinner.rotation);
    gameObjects.roomJackObjs.useAltArmMovement = true;
    globalScene.tweens.add({
        targets: gameObjects.roomJackObjs.rightHand,
        x: a + 120,
        y: o + 5,
        ease: "Quad.easeIn",
        duration: 225,
        onComplete: () => {
            gameObjects.roomJackObjs.isAutopilot = true;
            gameObjects.roomJackObjs.readyToGrabSpinner = true;
            gameDelay(() => {
                gameObjects.sounds.squeak3.play({
                    loop: true
                });
                gameObjects.sounds.squeak3.volume = 1 * gameVars.soundMult;
                showStaticLite();
            }, 2200);
            let e = gameObjects.roomJackObjs.rightHand.x;
            let a = gameObjects.roomJackObjs.rightHand.y;
            gameObjects.roomJackObjs.rightHand.rotation;
            gameObjects.roomJackObjs.rightHand.destroy();
            gameObjects.roomJackObjs.rightHand = globalScene.add.image(e, a, "roomJack", "hand3");
            gameObjects.roomJackObjs.rightHand.rotation = 0;
            gameObjects.roomJackObjs.rightHand.scaleY = 1.08;
            gameObjects.roomJackObjs.rightArm3.scaleY = 1.15;
            zoomTemp(1.01);
            gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.rightHand);
            resetJackLights();
            gameObjects.roomJackObjs.lights.alpha *= 0.5;
            gameDelay(() => {
                gameObjects.roomJackObjs.lights.alpha *= 2;
            }, 80);
            globalScene.tweens.add({
                targets: [gameObjects.roomJackObjs.rightHand, gameObjects.roomJackObjs.rightArm3],
                scaleY: 1,
                ease: "Quad.easeOut",
                duration: 200
            });
        }
    });
    gameObjects.roomJackObjs.roomContainer.bringToTop(gameObjects.roomJackObjs.rightArm3);
    gameObjects.roomJackObjs.roomContainer.bringToTop(gameObjects.roomJackObjs.rightHand);
    resetJackLights();
    updateJackArmsRightAuto();
    if (gameObjects.roomJackObjs.rightArm2.rotation < 0.5 * -Math.PI) {
        gameObjects.roomJackObjs.rightArm2.rotation = -0.1;
    }
}
function jumpOutLeftArm() {
    let e = gameObjects.roomJackObjs.leftArm1;
    gameObjects.roomJackObjs.leftArm2;
    gameObjects.roomJackObjs.leftArm3;
    gameObjects.roomJackObjs.leftHand;
    e.y = gameVars.height + 300;
    gameObjects.roomJackObjs.leftArm3.rotation = 0.5 * Math.PI;
    playSound("emerge1");
    gameObjects.roomJackObjs.dollHead.rotation = 0.15;
    gameObjects.roomJackObjs.dollEyes.rotation = 0.16;
    globalScene.tweens.add({
        targets: [gameObjects.roomJackObjs.dollHead, gameObjects.roomJackObjs.dollEyes],
        rotation: 0,
        ease: "Cubic.easesIn",
        duration: 600
    });
    globalScene.tweens.add({
        targets: gameObjects.roomJackObjs.leftArm2,
        goalRot: 1.5,
        ease: "Quad.easeIn",
        duration: 250,
        onComplete: () => {
            globalScene.tweens.add({
                targets: gameObjects.roomJackObjs.leftArm3,
                ease: "Elastic",
                easeParams: [0.1, 0.92],
                goalRot: 1.4,
                duration: 400,
                onComplete: () => {
                    globalScene.tweens.add({
                        targets: gameObjects.roomJackObjs.leftArm3,
                        ease: "Cubic.easeIn",
                        goalRot: 2.44,
                        duration: 1400,
                        onComplete: () => {
                            globalScene.tweens.add({
                                targets: gameObjects.roomJackObjs.leftArm3,
                                ease: "Cubic.easeIn",
                                goalRot: 1.68,
                                duration: 300,
                                onComplete: () => {
                                    zoomTemp(1.03);
                                    playSound("groundthud2");
                                    gameObjects.roomJackObjs.leftArm1.scaleY = 1.1;
                                    gameObjects.roomJackObjs.leftArm2.scaleY = -1.12;
                                    gameObjects.roomJackObjs.leftArm3.scaleY = -1.12;
                                    globalScene.tweens.add({
                                        targets: [gameObjects.roomJackObjs.leftArm1],
                                        ease: "Cubic.easeIn",
                                        scaleY: 1,
                                        duration: 250
                                    });
                                    globalScene.tweens.add({
                                        targets: [gameObjects.roomJackObjs.leftArm2, gameObjects.roomJackObjs.leftArm3],
                                        ease: "Cubic.easeIn",
                                        scaleY: -1,
                                        duration: 250
                                    });
                                    gameObjects.roomJackObjs.portraitGiraffe.destroy();
                                    gameObjects.roomJackObjs.portraitGiraffe2.visible = true;
                                    gameObjects.roomJackObjs.portraitBox.destroy();
                                    gameObjects.roomJackObjs.portraitBox2.visible = true;
                                    gameObjects.roomJackObjs.streamers.destroy();
                                    gameObjects.roomJackObjs.neck1.visible = true;
                                    gameObjects.roomJackObjs.neck2.visible = true;
                                    gameObjects.roomJackObjs.neck3.visible = true;
                                    gameDelay(() => {
                                        gameObjects.roomJackObjs.lights.alpha *= 0.5;
                                        gameDelay(() => {
                                            gameObjects.roomJackObjs.lights.alpha *= 2;
                                        }, 80);
                                    }, 50);
                                }
                            });
                            globalScene.tweens.add({
                                targets: gameObjects.roomJackObjs.leftArm2,
                                ease: "Cubic.easeIn",
                                scaleX: 1.08,
                                goalRot: 2.86,
                                duration: 300
                            });
                            globalScene.tweens.add({
                                targets: gameObjects.roomJackObjs.leftArm1,
                                shadowLength: 0,
                                scaleX: 0.8,
                                goalRot: -1.9,
                                ease: "Cubic.easeIn",
                                origX: "-=80",
                                y: "+=23",
                                duration: 300
                            });
                            let e = gameObjects.roomJackObjs.leftHand.x;
                            let a = gameObjects.roomJackObjs.leftHand.y;
                            let o = gameObjects.roomJackObjs.leftHand.rotation;
                            gameObjects.roomJackObjs.leftHand.destroy();
                            gameObjects.roomJackObjs.leftHand = globalScene.add.image(e, a, "roomJack", "hand1");
                            gameObjects.roomJackObjs.leftHand.rotation = o;
                            gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.leftHand);
                            resetJackLights();
                            globalScene.tweens.add({
                                targets: gameObjects.roomJackObjs.leftHand,
                                rotation: 0,
                                ease: "Cubic.easeIn",
                                duration: 280
                            });
                        }
                    });
                    globalScene.tweens.add({
                        targets: gameObjects.roomJackObjs.leftArm2,
                        ease: "Quad.easeOut",
                        goalRot: 4.7,
                        duration: 1400
                    });
                    globalScene.tweens.add({
                        targets: gameObjects.roomJackObjs.leftArm1,
                        goalRot: -1.2,
                        ease: "Quad.easeInOut",
                        origX: "-=10",
                        y: "-=60",
                        duration: 1400
                    });
                    gameObjects.roomJackObjs.leftArm2.setOrigin(0.05, 0.5);
                }
            });
            globalScene.tweens.add({
                targets: gameObjects.roomJackObjs.leftArm2,
                goalRot: 2.7,
                duration: 450
            });
            globalScene.tweens.add({
                targets: gameObjects.roomJackObjs.leftArm1,
                shadowLength: 0.02,
                scaleX: 1.1,
                goalRot: -1.35,
                origX: "+=60",
                y: "-=240",
                duration: 350
            });
        }
    });
    globalScene.tweens.add({
        targets: gameObjects.roomJackObjs.leftArm1,
        ease: "Quad.easeIn",
        scaleX: 1.05,
        goalRot: -1.48,
        origX: "+=30",
        y: "-=350",
        duration: 250
    });
}
function jumpOutRightArm() {
    let e = gameObjects.roomJackObjs.rightArm1;
    gameObjects.roomJackObjs.rightArm2;
    gameObjects.roomJackObjs.rightArm3;
    gameObjects.roomJackObjs.rightHand;
    e.scaleX = 0.8;
    e.y = gameVars.height + 300;
    gameObjects.roomJackObjs.rightArm3.rotation = 0.5 * Math.PI;
    playSound("emerge2");
    gameObjects.roomJackObjs.dollHead.rotation = -0.15;
    gameObjects.roomJackObjs.dollEyes.rotation = -0.16;
    globalScene.tweens.add({
        targets: [gameObjects.roomJackObjs.dollHead, gameObjects.roomJackObjs.dollEyes],
        rotation: 0,
        ease: "Cubic.easesIn",
        duration: 600
    });
    globalScene.tweens.add({
        targets: gameObjects.roomJackObjs.rightArm2,
        goalRot: 1.65,
        ease: "Quad.easeIn",
        duration: 200,
        onComplete: () => {
            globalScene.tweens.add({
                targets: gameObjects.roomJackObjs.rightArm3,
                ease: "Elastic",
                easeParams: [0.1, 0.92],
                goalRot: 1.78,
                duration: 350,
                onComplete: () => {
                    globalScene.tweens.add({
                        targets: gameObjects.roomJackObjs.rightArm3,
                        ease: "Cubic.easeIn",
                        goalRot: 0.7,
                        duration: 1200,
                        onComplete: () => {
                            globalScene.tweens.add({
                                targets: gameObjects.roomJackObjs.rightArm3,
                                ease: "Cubic.easeIn",
                                goalRot: 1.44,
                                duration: 300,
                                onComplete: () => {
                                    zoomTemp(1.03);
                                    playSound("groundthud2");
                                    gameObjects.roomJackObjs.rightArm1.scaleY = 1.1;
                                    gameObjects.roomJackObjs.rightArm2.scaleY = 1.12;
                                    gameObjects.roomJackObjs.rightArm3.scaleY = 1.12;
                                    globalScene.tweens.add({
                                        targets: [
                                            gameObjects.roomJackObjs.rightArm1,
                                            gameObjects.roomJackObjs.rightArm2,
                                            gameObjects.roomJackObjs.rightArm3
                                        ],
                                        ease: "Cubic.easeIn",
                                        scaleY: 1,
                                        duration: 250
                                    });
                                    gameObjects.roomJackObjs.portraitGiraffe2.destroy();
                                    gameObjects.roomJackObjs.portraitGiraffe3.visible = true;
                                    gameObjects.roomJackObjs.portraitBox2.destroy();
                                    gameObjects.roomJackObjs.portraitBox3.visible = true;
                                    gameDelay(() => {
                                        playSound("metalsqueak2");
                                        gameObjects.roomJackObjs.placard.tweenScale({
                                            y: "+= 1",
                                            rotation: 0.5,
                                            duration: 200,
                                            ease: "Cubic.easeOut"
                                        });
                                        gameObjects.roomJackObjs.placard.setOnMouseUpFunc(showTurnHandleLots);
                                    }, 300);
                                    gameObjects.roomJackObjs.lights.alpha *= 0.5;
                                    gameDelay(() => {
                                        gameObjects.roomJackObjs.lights.alpha *= 2;
                                    }, 80);
                                    gameDelay(() => {
                                        flipToAutoSpinArm();
                                    }, 7500);
                                }
                            });
                            globalScene.tweens.add({
                                targets: gameObjects.roomJackObjs.rightArm2,
                                ease: "Cubic.easeIn",
                                scaleX: 1.08,
                                goalRot: 0.2,
                                duration: 300
                            });
                            globalScene.tweens.add({
                                targets: gameObjects.roomJackObjs.rightArm1,
                                scaleX: 0.8,
                                goalRot: -1.28,
                                ease: "Cubic.easeIn",
                                origX: "+=80",
                                y: "+=23",
                                duration: 300
                            });
                            let e = gameObjects.roomJackObjs.rightHand.x;
                            let a = gameObjects.roomJackObjs.rightHand.y;
                            let o = gameObjects.roomJackObjs.rightHand.rotation;
                            gameObjects.roomJackObjs.rightHand.destroy();
                            gameObjects.roomJackObjs.rightHand = globalScene.add.image(e, a, "roomJack", "hand1");
                            gameObjects.roomJackObjs.rightHand.scaleX = -1;
                            gameObjects.roomJackObjs.rightHand.rotation = o;
                            gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.rightHand);
                            resetJackLights();
                            globalScene.tweens.add({
                                targets: gameObjects.roomJackObjs.rightHand,
                                rotation: 0,
                                ease: "Cubic.easeIn",
                                duration: 280
                            });
                            gameObjects.roomJackObjs.rightArm2.setOrigin(0, 0.5);
                        }
                    });
                    globalScene.tweens.add({
                        targets: gameObjects.roomJackObjs.rightArm2,
                        ease: "Quad.easeOut",
                        goalRot: -1.56,
                        duration: 1200
                    });
                    globalScene.tweens.add({
                        targets: gameObjects.roomJackObjs.rightArm1,
                        shadowLength: 0,
                        goalRot: -1.94,
                        ease: "Quad.easeInOut",
                        origX: "+=10",
                        y: "-=60",
                        duration: 1200
                    });
                    globalScene.tweens.add({
                        targets: gameObjects.roomJackObjs.rightHand,
                        ease: "Cubic.easeIn",
                        rotation: -0.2,
                        delay: 1200,
                        duration: 200
                    });
                    gameObjects.roomJackObjs.rightArm2.setOrigin(0.05, 0.5);
                }
            });
            globalScene.tweens.add({
                targets: gameObjects.roomJackObjs.rightArm2,
                goalRot: 0.44,
                duration: 400
            });
            globalScene.tweens.add({
                targets: gameObjects.roomJackObjs.rightArm1,
                shadowLength: 0.02,
                scaleX: 1.1,
                goalRot: -1.79,
                origX: "-=60",
                y: "-=240",
                duration: 300
            });
        }
    });
    globalScene.tweens.add({
        targets: gameObjects.roomJackObjs.rightArm1,
        ease: "Quad.easeIn",
        scaleX: 1.05,
        goalRot: -1.66,
        origX: "-=30",
        y: "-=350",
        duration: 200
    });
}
function showTurnHandleLots() {
    gameObjects.roomJackObjs.placard.setOnMouseUpFunc(() => {});
    let e = [
        {
            text: TEXT.jack.horrorShout,
            time: 1000
        },
        {
            text: "TURN THE HANDLE TURN THE HANDLE",
            time: 500
        },
        {
            text: "TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE",
            time: 100
        },
        {
            text: "TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE",
            time: 50
        },
        {
            text: dupeTurnTheHandle(1),
            time: 100
        },
        {
            text: dupeTurnTheHandle(2),
            time: 100
        },
        {
            text: dupeTurnTheHandle(3),
            time: 100
        },
        {
            text: dupeTurnTheHandle(4),
            time: 100
        },
        {
            text: dupeTurnTheHandle(5),
            time: 200
        },
        {
            text: " ",
            time: 800
        }
    ];
    showInfoTextLoop(e, undefined, false);
    gameDelay(() => {
        flipToAutoSpinArm();
    }, 3300);
}
function startFinale() {
    gameObjects.roomJackObjs.startFinale = true;
    gameObjects.roomJackObjs.dollface = globalScene.add.image(80, -320, "roomJack", "dollface");
    gameObjects.roomJackObjs.dollface.rotation = 3.16;
    gameObjects.roomJackObjs.dollface.scaleExpand = 0.001;
    gameObjects.roomJackObjs.dollface.scaleX = 0.5;
    gameObjects.roomJackObjs.dollface.scaleY = 0.5;
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.dollface);
    gameObjects.roomJackObjs.dollmouth = globalScene.add.image(80, -320, "roomJack", "dollmouth");
    gameObjects.roomJackObjs.dollmouth.rotation = 3.16;
    gameObjects.roomJackObjs.dollmouth.scaleX = 0.5;
    gameObjects.roomJackObjs.dollmouth.scaleY = 0.5;
    gameObjects.roomJackObjs.dollmouth.scaleYRatio = 1.05;
    gameObjects.roomJackObjs.dollmouth.scaleYVel = 0.02;
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.dollmouth);
}
function dupeTurnTheHandle(e = 0) {
    let a =
        "TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE TURN THE HANDLE\n";
    for (; e > 0;) {
        e -= 1;
        a += a;
    }
    return a;
}
function resetJackLights() {
    let e = gameObjects.roomJackObjs.lights.x;
    let a = gameObjects.roomJackObjs.lights.y;
    let o = gameObjects.roomJackObjs.lights.alpha;
    gameObjects.roomJackObjs.lights.destroy();
    gameObjects.roomJackObjs.lights = globalScene.add.image(e, a, "roomJack", "lights2");
    gameObjects.roomJackObjs.lights.alpha = o + 0.03;
    gameObjects.roomJackObjs.lights.scaleX = 2;
    gameObjects.roomJackObjs.lights.scaleY = 2;
    gameObjects.roomJackObjs.roomContainer.add(gameObjects.roomJackObjs.lights);
}
function shakeJackHead() {
    gameObjects.roomJackObjs.dollHeadSmile.rotation = -0.01 * Math.random();
}
function setupPortraits(scene, a) {
    gameObjects.roomJackObjs.portraitBox = a.add.image(-345, 295, "roomJack", "portrait1");
    gameObjects.roomJackObjs.portraitBox.visible = false;
    scene.add(gameObjects.roomJackObjs.portraitBox);
    gameObjects.roomJackObjs.portraitBox2 = a.add.image(
        gameObjects.roomJackObjs.portraitBox.x,
        gameObjects.roomJackObjs.portraitBox.y,
        "roomJack",
        "portrait2"
    );
    gameObjects.roomJackObjs.portraitBox2.visible = false;
    scene.add(gameObjects.roomJackObjs.portraitBox2);
    gameObjects.roomJackObjs.portraitBox3 = a.add.image(
        gameObjects.roomJackObjs.portraitBox.x,
        gameObjects.roomJackObjs.portraitBox.y,
        "roomJack",
        "portrait3"
    );
    gameObjects.roomJackObjs.portraitBox3.visible = false;
    scene.add(gameObjects.roomJackObjs.portraitBox3);
    gameObjects.roomJackObjs.portraitGiraffe = a.add.image(330, 400, "roomJack", "portrait4").setOrigin(0.5, 1);
    gameObjects.roomJackObjs.portraitGiraffe.visible = false;
    scene.add(gameObjects.roomJackObjs.portraitGiraffe);
    gameObjects.roomJackObjs.portraitGiraffe2 = a.add.image(330, 400, "roomJack", "portrait7").setOrigin(0.5, 1);
    gameObjects.roomJackObjs.portraitGiraffe2.visible = false;
    scene.add(gameObjects.roomJackObjs.portraitGiraffe2);
    gameObjects.roomJackObjs.portraitGiraffe3 = a.add.image(330, 400, "roomJack", "portrait4x").setOrigin(0.5, 1);
    gameObjects.roomJackObjs.portraitGiraffe3.visible = false;
    scene.add(gameObjects.roomJackObjs.portraitGiraffe3);
}
function shakeHeadFlashOne(e = 1) {
    let a = Math.floor(0.45 * gameObjects.roomJackObjs.dollHeadFlash1.scaleX * 7) / 7 - 0.4;
    gameObjects.roomJackObjs.dollHeadFlash1.rotation = 0.04 * (Math.random() - 0.5) - a;
    let o =
        0.001 + gameObjects.roomJackObjs.dollHeadFlash1.scaleX * gameObjects.roomJackObjs.dollHeadFlash1.scaleX * 0.006;
    gameObjects.roomJackObjs.dollHeadFlash1.scaleX += o * e;
    gameObjects.roomJackObjs.dollHeadFlash1.scaleY += o * e;
}
function shakeHeadFlashTwo(e = 1) {
    let a = Math.floor(0.25 * gameObjects.roomJackObjs.dollHeadFlash1.scaleX * 6) / 6 - 0.2;
    gameObjects.roomJackObjs.dollHeadFlash2.rotation = 0.05 * (Math.random() - 0.5) - a;
    let o =
        0.001 + gameObjects.roomJackObjs.dollHeadFlash2.scaleX * gameObjects.roomJackObjs.dollHeadFlash2.scaleX * 0.006;
    gameObjects.roomJackObjs.dollHeadFlash2.scaleX += o * e;
    gameObjects.roomJackObjs.dollHeadFlash2.scaleY += o * e;
}

// ============================================================== save state ===
//
// Jack owns his own progress, same contract as roomhandy.js: save.js stores
// whatever roomJackGetSaveState returns and hands it straight back to
// roomJackSetSaveState on restore, without interpreting it. Jack needs more
// than a bare stage number — the crank keeps whatever angle the player left it
// at — so the value is a small object rather than an integer.
//
// The horror finale is deliberately absent. It is one uninterruptible sequence
// and save.js refuses to write a save once it starts (saveInFinale), so there
// is no such thing as a save taken part-way through it.

var ROOM_JACK_STAGE_NONE = 0;
var ROOM_JACK_STAGE_POPPED = 1; // normal phase: music finished, Jack sprang out
var ROOM_JACK_STAGE_CLOSED = 2; // dark phase: handle unturned, Jack shut back in

// Called by the live gameplay path at each milestone so the stage is recorded
// rather than re-derived from lid angles later. Monotonic: never goes back.
function roomJackMarkStage(stage) {
    let r = gameObjects.roomJackObjs;
    if (r && (!r.saveStage || r.saveStage < stage)) {
        r.saveStage = stage;
    }
}
function roomJackGetSaveState() {
    let r = gameObjects.roomJackObjs;
    if (!r || !r.saveStage) return null;
    return {
        stage: r.saveStage,
        // Cosmetic, but the crank sitting back at zero next to an open box is
        // exactly what makes a restored room look wrong.
        spin: r.spinner ? r.spinner.rotation : 0
    };
}

// Puts the room straight into the end state of `state.stage`.
//
// STATE ONLY — no tweens, sounds, static or gameDelay chains. animatePopUp and
// the dark-phase slam play those live; this is the half a reloaded game needs.
//
// Runs after save.js has republished startDarkSequence / startHorrorSequence,
// so anything those subscribers own (canSpin, noteCount — they reset the puzzle
// for the next phase) is deliberately left alone unless we are still in the
// normal phase.
function roomJackSetSaveState(state) {
    let r = gameObjects.roomJackObjs;
    if (!r || !state || !state.stage) return;
    r.saveStage = state.stage;
    let normalPhase = !gameVars.darkPoint && !gameVars.horrorPoint;

    // The crank, and the drag handle that rides on it.
    if (state.spin !== undefined) {
        r.spinner.rotation = state.spin;
        r.spinner.rotVel = 0;
    }
    if (saveAlive(r.spinnerButton)) resetSpinnerButton();

    // saveAlive (save.js) rather than a bare isDestroyed check: only Buttons
    // carry that flag, Phaser images just drop their scene reference. The horror
    // sequence destroys spinnerButton and dollHeadUnder, so both can be gone.
    //
    // The pop-up animation is over either way: make sure its per-frame helper is
    // not left running and its two transition sprites stay hidden.
    removeFromUpdateFuncList(updatePopUp);
    r.headPopup1.visible = false;
    r.headPopup2.visible = false;
    r.animateLid = false;
    r.lid.rotVel = 0;
    r.jackJumpState = "finished";
    resetGuideArrowJack();
    if (state.stage === ROOM_JACK_STAGE_POPPED) {
        // End state of animatePopUp plus the lid swing in roomJackUpdate, which
        // flips to "finished" the moment rotation passes 3 (rotVel starts at
        // .51 and decays by .831, converging just above it).
        r.lid.rotation = 3.02;
        r.dollCreepy.y = r.dollCreepy.origYPos - 260;
        r.dollCreepy.scaleX = 1;
        r.dollCreepy.visible = true;
        r.dollHead.visible = true;
        r.dollEyes.visible = true;
        if (saveAlive(r.dollHeadUnder)) r.dollHeadUnder.visible = false;
        if (normalPhase) {
            // canSpin is decided below, for every phase at once.
            r.noteCount = r.musicDataNormal.length;
            r.rotateMusicAccumulate = 0;
            r.slowRotation = false;
        }
    } else {
        // ROOM_JACK_STAGE_CLOSED — the tail of checkMusicSequenceDark: the lid
        // is shut, Jack has sunk back to his resting depth and the eyeless head
        // is showing again.
        r.lid.rotation = 0;
        r.dollCreepy.y = r.dollCreepy.origYPos;
        r.dollCreepy.scaleX = 0.4;
        r.dollCreepy.visible = true;
        r.dollHead.visible = false;
        r.dollEyes.visible = false;
        if (saveAlive(r.dollHeadUnder)) r.dollHeadUnder.visible = true;
        r.playedSlam = true;
    }

    // canSpin belongs to the phase, not the stage — startDarkSequence and
    // startHorrorSequence both re-arm the crank because each phase needs it
    // turned again. Decide it once, here, after the branches above.
    //
    // The horror finale is never saved (saveInFinale), so arriving in the
    // horror phase always means there is still spinning to do.
    let spinDone = gameVars.horrorPoint
        ? false
        : gameVars.darkPoint
          ? state.stage >= ROOM_JACK_STAGE_CLOSED
          : state.stage >= ROOM_JACK_STAGE_POPPED;
    r.canSpin = !spinDone;

    // roomJackUpdate re-derives these from dollCreepy every frame, but only
    // while the player is in the room. Sync them now so the room also looks
    // right if it is restored from a distance and walked into later.
    r.dollHead.x = r.dollCreepy.x;
    r.dollHead.y = r.dollCreepy.y - r.halfHeightDiffDoll;
    r.dollHead.scaleX = r.dollCreepy.scaleX;
    r.dollEyes.x = r.dollCreepy.x + r.eyeOffsetX;
    r.dollEyes.y = r.dollHead.y + r.eyeOffsetY;
    r.dollEyes.scaleX = r.dollCreepy.scaleX;
    if (saveAlive(r.dollHeadUnder)) {
        r.dollHeadUnder.x = r.dollHead.x;
        r.dollHeadUnder.y = r.dollHead.y;
        r.dollHeadUnder.scaleX = r.dollHead.scaleX;
    }
}
