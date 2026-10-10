function setupRoomStretch(scene, t, o) {
    gameObjects.exhibit.setBackgroundAtIndex(t, "bgs", "bg6");
    if (!gameObjects.roomStretchObjs) {
        gameObjects.roomStretchObjs = {
            roomIndex: t,
            roomContainer: o,
            lastSoundUpdate: 0,
            shouldUpdate: false,
            armMinDist: 80,
            roomUnlocked: false,
            doDarkCleanup: false,
            roomCompleted: false,
            accumulateStatic: 0,
            accumulateFlash: 0,
            dollImages: [],
            dollBodyList: [],
            dollPosX: -1,
            dollPosY: -1,
            doHorrorSection: false,
            streamersList: [],
            loosenAmt: 0
        };
    }
    gameObjects.roomStretchObjs.cleanupButton = new Button(
        globalScene,
        gameObjects.roomStretchObjs.roomContainer,
        () => {},
        {
            atlas: "buttons",
            ref: "glow",
            alpha: 0.001,
            x: 0,
            y: 9999,
            scaleX: 1.3,
            scaleY: 1.3
        },
        {
            atlas: "buttons",
            ref: "glow",
            alpha: 0.001,
            scaleX: 1.58,
            scaleY: 1.58
        },
        {
            atlas: "buttons",
            ref: "glow",
            alpha: 0.001,
            scaleX: 1.6,
            scaleY: 1.6
        }
    );
    gameObjects.roomStretchObjs.cleanupButton.setOnMouseDownFunc(stretchCleanup);
    gameObjects.roomStretchObjs.frame1 = scene.add.image(-340, 325, "roomStretch", "framesStretch1");
    gameObjects.roomStretchObjs.frame1x = scene.add.image(-340, 325, "roomStretch", "framesStretch1x");
    gameObjects.roomStretchObjs.frame2 = scene.add.image(-15, 180, "roomStretch", "framesStretch2");
    gameObjects.roomStretchObjs.frame2x = scene.add.image(-15, 180, "roomStretch", "framesStretch3x");
    gameObjects.roomStretchObjs.frame3 = scene.add.image(-65, 380, "roomStretch", "framesStretch3");
    gameObjects.roomStretchObjs.frame1.alpha = 0;
    gameObjects.roomStretchObjs.frame1x.alpha = 0;
    gameObjects.roomStretchObjs.frame2.alpha = 0;
    gameObjects.roomStretchObjs.frame2x.alpha = 0;
    gameObjects.roomStretchObjs.frame3.alpha = 0;
    o.add(gameObjects.roomStretchObjs.frame1);
    o.add(gameObjects.roomStretchObjs.frame1x);
    o.add(gameObjects.roomStretchObjs.frame2);
    o.add(gameObjects.roomStretchObjs.frame2x);
    o.add(gameObjects.roomStretchObjs.frame3);
    gameObjects.roomStretchObjs.doll = -1;
    setStretchDollPos(-236, gameVars.height - 161);
    setStretchDollImage("dollNeutral");
    setStretchDollImage("dollAnxious");
    setStretchDollImage("dollFearful");
    setStretchDollImage("dollNeutral");
    setStretchDollImage("dollExpectant");
    setStretchDollImage("dollHappy");
    gameObjects.roomStretchObjs.touchspot = scene.add.image(204, 380, "roomStretch", "touchspot");
    o.add(gameObjects.roomStretchObjs.touchspot);
    for (let t = 0; t < 8; t++) {
        let s = "streamer" + (t + 1);
        let r = scene.add.image(0, -90, "roomStretch", s).setOrigin(0.5, 0);
        gameObjects.roomStretchObjs.streamersList.push(r);
        o.add(r);
    }
    let s = -525;
    for (let e = 0; e < 7; e++) {
        gameObjects.roomStretchObjs.streamersList[e].x = s;
        s +=
            0.5 * gameObjects.roomStretchObjs.streamersList[e].width +
            0.5 * gameObjects.roomStretchObjs.streamersList[e + 1].width +
            20;
    }
    gameObjects.roomStretchObjs.streamersList[7].x = s;
    gameObjects.roomStretchObjs.armseg1 = scene.add.image(
        gameObjects.roomStretchObjs.dollPosX + 35.5,
        gameObjects.roomStretchObjs.dollPosY - 85,
        "roomStretch",
        "armseg"
    );
    gameObjects.roomStretchObjs.armseg1.rotation = -0.3;
    gameObjects.roomStretchObjs.armseg1.setOrigin(0.02, 0.5);
    o.add(gameObjects.roomStretchObjs.armseg1);
    let r;
    let a;
    let m;
    let c = gameObjects.roomStretchObjs.armseg1.x + 94 * Math.cos(gameObjects.roomStretchObjs.armseg1.rotation);
    let b = gameObjects.roomStretchObjs.armseg1.y + 94 * Math.sin(gameObjects.roomStretchObjs.armseg1.rotation);
    gameObjects.roomStretchObjs.armseg2 = scene.add.image(c, b, "roomStretch", "armseg");
    gameObjects.roomStretchObjs.armseg2.setOrigin(0.029, 0.5);
    o.add(gameObjects.roomStretchObjs.armseg2);
    gameObjects.roomStretchObjs.elbow = scene.add.image(c, b, "roomStretch", "hand");
    gameObjects.roomStretchObjs.elbow.alpha = 0;
    gameObjects.roomStretchObjs.elbow.velX = 0;
    gameObjects.roomStretchObjs.elbow.velY = 0;
    gameObjects.roomStretchObjs.elbow.scaleX = 0.01;
    gameObjects.roomStretchObjs.elbow.scaleY = 0.01;
    o.add(gameObjects.roomStretchObjs.elbow);
    gameObjects.roomStretchObjs.hand = scene.add.image(-120, 630, "roomStretch", "hand");
    gameObjects.roomStretchObjs.hand.scaleX = 0.8;
    gameObjects.roomStretchObjs.hand.scaleY = 0.8;
    gameObjects.roomStretchObjs.hand.velX = 0;
    gameObjects.roomStretchObjs.hand.velY = 0;
    o.add(gameObjects.roomStretchObjs.hand);
    gameObjects.roomStretchObjs.handButton = new Button(scene, {
        container: o,
        normal: {
            atlas: "buttons",
            ref: "glow",
            x: 0,
            y: gameVars.halfHeight,
            alpha: 0.01,
            scaleX: 1,
            scaleY: 1
        },
        hover: {
            atlas: "buttons",
            ref: "glow",
            alpha: 0.02,
            scaleX: 1.02,
            scaleY: 1.02
        },
        disable: {
            atlas: "buttons",
            ref: "glow",
            alpha: 0.02,
            scaleX: 0.0001,
            scaleY: 0.0001
        },
        isDraggable: true,
        onDrop: () => {}
    });
    gameObjects.roomStretchObjs.placard = new Button(
        scene,
        o,
        () => {
            if (gameVars.horrorPoint) {
                if (gameObjects.roomStretchObjs.roomCompleted) {
                    updateInfoText(TEXT.stretch.done);
                } else {
                    updateInfoText(TEXT.stretch.name);
                }
            } else {
                if (gameVars.darkPoint) {
                    updateInfoText(TEXT.stretch.dark);
                } else {
                    updateInfoText(TEXT.stretch.name);
                }
            }
        },
        {
            atlas: "buttons",
            ref: "placard",
            x: 0,
            y: gameVars.height - 73
        },
        {
            atlas: "buttons",
            ref: "placard_hover"
        }
    );
    gameDelay(() => {
        addToUpdateFuncList(roomStretchUpdate);
    }, 500);
    messageBus.subscribe("exhibitMove", (e) => {
        if (e === t) {
            if (
                (tweenVolume("gladiator0", 0.1),
                tweenVolume("gladiator1", 0.8),
                tweenVolume("gladiator2", 0.2),
                (gameObjects.roomStretchObjs.shouldUpdate = true),
                !gameObjects.roomStretchObjs.oneTimeStreamers)
            ) {
                gameObjects.roomStretchObjs.oneTimeStreamers = true;
                for (let e = 0; e < 8; e++) {
                    gameObjects.roomStretchObjs.streamersList[e].scaleY = 0.8 + 0.4 * Math.random();
                    gameObjects.roomStretchObjs.streamersList[e].velY = 0.1 * (Math.random() - 0.5);
                }
                addToUpdateFuncList(updateStreamers);
                gameDelay(() => {
                    removeFromUpdateFuncList(updateStreamers);
                }, 20000);
            }
        } else
            gameDelay(() => {
                gameObjects.roomStretchObjs.shouldUpdate = false;
            }, 700);
    });
    registerRoomSaveState(t, {
        getStage: roomStretchGetSaveStage,
        setStage: roomStretchSetSaveStage
    });
    r = messageBus.subscribe("startDarkSequence", (e) => {
        r.unsubscribe();
        gameObjects.roomStretchObjs.frame1.alpha = 1;
        gameObjects.roomStretchObjs.frame2.alpha = 1;
        gameObjects.roomStretchObjs.frame3.alpha = 1;
        gameObjects.roomStretchObjs.cleanupButton.setPos(
            gameObjects.roomStretchObjs.touchspot.x,
            gameObjects.roomStretchObjs.touchspot.y
        );
    });
    a = messageBus.subscribe("startHorrorSequence", (e) => {
        gameObjects.roomStretchObjs.doDarkCleanup = false;
        gameObjects.roomStretchObjs.roomUnlocked = false;
        a.unsubscribe();
        gameObjects.roomStretchObjs.handButton.setState("normal");
    });
    m = messageBus.subscribe("startTrueStretchHorror", (e) => {
        roomStretchMarkStage(ROOM_STRETCH_STAGE_HORROR_READY);
        gameObjects.roomStretchObjs.doDarkCleanup = false;
        gameObjects.roomStretchObjs.roomUnlocked = false;
        setStretchDollPos(-295, gameVars.height - 161);
        gameObjects.roomStretchObjs.touchspot.x = 355;
        gameObjects.roomStretchObjs.touchspot.y = 185;
        gameObjects.roomStretchObjs.armseg1.x = gameObjects.roomStretchObjs.dollPosX + 35.5;
        m.unsubscribe();
        gameObjects.roomStretchObjs.doHorrorSection = true;
        gameObjects.roomStretchObjs.frame1.destroy();
        gameObjects.roomStretchObjs.frame1x.alpha = 1;
        pullbackStreamers();
    });
}
function roomStretchUpdate(e) {
    if (!gameObjects.roomStretchObjs.shouldUpdate) return;
    let t = gameVars.height - 152;
    let o = gameObjects.roomStretchObjs.armMinDist;
    let s = 0.01 + 0.00043 * o;
    let r =
        !gameObjects.roomStretchObjs.roomUnlocked ||
        gameObjects.roomStretchObjs.doDarkCleanup ||
        gameObjects.roomStretchObjs.roomCompleted;
    gameObjects.roomStretchObjs.elbow.velX *= 0.96;
    gameObjects.roomStretchObjs.elbow.velY *= 0.96;
    gameObjects.roomStretchObjs.elbow.y += gameObjects.roomStretchObjs.elbow.velY * e;
    gameObjects.roomStretchObjs.elbow.x += gameObjects.roomStretchObjs.elbow.velX * e;
    let a = t - 0.25 * gameObjects.roomStretchObjs.elbow.height * gameObjects.roomStretchObjs.elbow.scaleY;
    if (gameObjects.roomStretchObjs.elbow.y > a) {
        gameObjects.roomStretchObjs.elbow.y = a;
        gameObjects.roomStretchObjs.elbow.velY = -0.1;
        if (gameObjects.roomStretchObjs.elbow.velX > 0) {
            gameObjects.roomStretchObjs.elbow.velX = Math.max(0, 0.98 * gameObjects.roomStretchObjs.elbow.velX - 0.2);
        } else {
            if (gameObjects.roomStretchObjs.elbow.velX < 0) {
                gameObjects.roomStretchObjs.elbow.velX = Math.min(
                    0,
                    0.98 * gameObjects.roomStretchObjs.elbow.velX + 0.2
                );
            }
        }
    }
    if (!r) {
        gameObjects.roomStretchObjs.hand.x = gameObjects.roomStretchObjs.touchspot.x;
        gameObjects.roomStretchObjs.hand.velX *= 0.5;
        gameObjects.roomStretchObjs.hand.y = gameObjects.roomStretchObjs.touchspot.y;
        gameObjects.roomStretchObjs.hand.velY *= 0.5;
    }
    gameObjects.roomStretchObjs.hand.velX *= 0.96;
    gameObjects.roomStretchObjs.hand.velY *= 0.96;
    gameObjects.roomStretchObjs.hand.y += gameObjects.roomStretchObjs.hand.velY * e;
    gameObjects.roomStretchObjs.hand.x += gameObjects.roomStretchObjs.hand.velX * e;
    let m = t - 0.25 * gameObjects.roomStretchObjs.hand.height * gameObjects.roomStretchObjs.hand.scaleY;
    if (
        (gameObjects.roomStretchObjs.hand.y > m - 10 &&
            gameObjects.roomStretchObjs.hand.y > m &&
            ((gameObjects.roomStretchObjs.hand.y = m),
            (gameObjects.roomStretchObjs.hand.velY = -0.1),
            gameObjects.roomStretchObjs.hand.velX > 0
                ? (gameObjects.roomStretchObjs.hand.velX = Math.max(
                      0,
                      0.95 * gameObjects.roomStretchObjs.hand.velX - 0.25
                  ))
                : gameObjects.roomStretchObjs.hand.velX < 0 &&
                  (gameObjects.roomStretchObjs.hand.velX = Math.min(
                      0,
                      0.95 * gameObjects.roomStretchObjs.hand.velX + 0.25
                  ))),
        gameObjects.roomStretchObjs.handButton.getIsDragged()
            ? ((gameObjects.roomStretchObjs.hand.scaleX = 0.83), (gameObjects.roomStretchObjs.hand.scaleY = 0.83))
            : ((gameObjects.roomStretchObjs.hand.scaleX = 0.8), (gameObjects.roomStretchObjs.hand.scaleY = 0.8)),
        gameObjects.roomStretchObjs.handButton.getIsDragged())
    ) {
        gameObjects.roomStretchObjs.elbow.velY += 0.08;
        let e = gameObjects.roomStretchObjs.handButton.getXPos();
        let t = gameObjects.roomStretchObjs.handButton.getYPos();
        let o = e - gameObjects.roomStretchObjs.hand.x;
        let s = t - gameObjects.roomStretchObjs.hand.y;
        let r = Math.sqrt(o * o + s * s);
        if (r > 70) {
            let e = 70 / r;
            o *= e;
            s *= e;
        }
        gameObjects.roomStretchObjs.hand.velX += 0.034 * o - 0.14 * gameObjects.roomStretchObjs.hand.velX;
        gameObjects.roomStretchObjs.hand.velY += 0.034 * s - 0.14 * gameObjects.roomStretchObjs.hand.velY;
    } else if (r) {
        gameObjects.roomStretchObjs.elbow.velY += 0.22 * e;
        gameObjects.roomStretchObjs.hand.velY += 0.28 * e;
        gameObjects.roomStretchObjs.handButton.setPos(
            gameObjects.roomStretchObjs.hand.x,
            gameObjects.roomStretchObjs.hand.y
        );
    }
    let c = gameObjects.roomStretchObjs.overstretched ? 26 : 23;
    let b =
        gameObjects.roomStretchObjs.hand.x -
        c * Math.cos(gameObjects.roomStretchObjs.hand.rotation) -
        gameObjects.roomStretchObjs.elbow.x;
    let O =
        gameObjects.roomStretchObjs.hand.y -
        c * Math.sin(gameObjects.roomStretchObjs.hand.rotation) -
        gameObjects.roomStretchObjs.elbow.y;
    let j = Math.sqrt(b * b + O * O);
    if (j > o) {
        let t = j - o;
        let r = t / o;
        let a = b * r * s;
        let m = O * r * s;
        gameObjects.roomStretchObjs.hand.velX -= a;
        gameObjects.roomStretchObjs.hand.velY -= m;
        gameObjects.roomStretchObjs.elbow.velX += a;
        gameObjects.roomStretchObjs.elbow.velY += m;
        if ((o += 0.05 * t * e) < 110) {
            o += 0.015 * t * e;
        }
        let c = gameObjects.roomStretchObjs.hand.rotation;
        if (
            Math.abs(gameObjects.roomStretchObjs.hand.rotation - gameObjects.roomStretchObjs.armseg2.rotation) > Math.PI
        ) {
            if (gameObjects.roomStretchObjs.hand.rotation > gameObjects.roomStretchObjs.armseg2.rotation) {
                c = gameObjects.roomStretchObjs.hand.rotation - 2 * Math.PI;
            } else {
                if (gameObjects.roomStretchObjs.hand.rotation < gameObjects.roomStretchObjs.armseg2.rotation) {
                    c = gameObjects.roomStretchObjs.hand.rotation + 2 * Math.PI;
                }
            }
        }
        gameObjects.roomStretchObjs.hand.rotation = 0.9 * c + 0.1 * gameObjects.roomStretchObjs.armseg2.rotation;
    } else if (
        !gameObjects.roomStretchObjs.overstretched &&
        o > 82 &&
        !gameObjects.roomStretchObjs.handButton.getIsDragged()
    ) {
        o = 0.96 * o - 2 * e;
    }
    let l = gameObjects.roomStretchObjs.elbow.x - gameObjects.roomStretchObjs.armseg1.x;
    let h = gameObjects.roomStretchObjs.elbow.y - gameObjects.roomStretchObjs.armseg1.y;
    let g = Math.sqrt(l * l + h * h);
    if (g > o) {
        let e = (g - o) / o;
        let t = l * e * s;
        let r = h * e * s;
        gameObjects.roomStretchObjs.elbow.velX -= 2 * t;
        gameObjects.roomStretchObjs.elbow.velY -= 2 * r;
    }
    gameObjects.roomStretchObjs.armseg1.rotation = Math.atan2(h, l);
    gameObjects.roomStretchObjs.armseg1.scaleX = 0.01 * g;
    let S = 91 + 0.02 * o;
    let d =
        gameObjects.roomStretchObjs.armseg1.x +
        Math.cos(gameObjects.roomStretchObjs.armseg1.rotation) * S * gameObjects.roomStretchObjs.armseg1.scaleX;
    let n =
        gameObjects.roomStretchObjs.armseg1.y +
        Math.sin(gameObjects.roomStretchObjs.armseg1.rotation) * S * gameObjects.roomStretchObjs.armseg1.scaleX;
    if (
        ((gameObjects.roomStretchObjs.armseg2.x = d),
        (gameObjects.roomStretchObjs.armseg2.y = n),
        (gameObjects.roomStretchObjs.armseg2.rotation = Math.atan2(O, b)),
        (gameObjects.roomStretchObjs.armseg2.scaleX = 0.0113 * j - 0.035),
        r)
    ) {
        let t;
        let s = 0;
        if (o > 225 && gameObjects.roomStretchObjs.doHorrorSection) {
            if (o > 290 && gameObjects.roomStretchObjs.loosenAmt < 0.15) {
                gameObjects.roomStretchObjs.loosenAmt += 0.000033 * e;
            }
            s = 0.000026 * o + 0.83 - gameObjects.roomStretchObjs.loosenAmt - 0.007 * (e - 1);
            if (o > 339.5) {
                t *= 0.999;
            }
        } else {
            if (gameObjects.roomStretchObjs.doHorrorSection) {
                s = 0.0035 * o + 0.088;
            } else {
                s = 0.0048 * o + 0.032;
                if (o > 218) {
                    s *= 2;
                }
            }
        }
        t = o - s * e;
        let r = gameObjects.roomStretchObjs.armMinDist;
        if (
            ((gameObjects.roomStretchObjs.armMinDist = Math.max(
                gameObjects.roomStretchObjs.overstretched ? 230 : 80,
                t
            )),
            o > 120)
        ) {
            if (gameObjects.roomStretchObjs.armMinDist > r + 0.02) {
                updateStretchSounds(o);
            }
            let e = 0.00035 * (o - 120);
            if (o > 210) {
                e += 0.0045 * (o - 210);
            }
            gameObjects.roomStretchObjs.armseg1.scaleY = 1 - e;
            gameObjects.roomStretchObjs.armseg2.scaleY = 1 - e;
        }
    }
    if (
        gameObjects.roomStretchObjs.doHorrorSection &&
        o > 220 &&
        gameObjects.roomStretchObjs.handButton.getIsDragged() &&
        !gameObjects.roomStretchObjs.roomCompleted
    )
        if (Math.random() < 0.0004 * (o - 130) + gameObjects.roomStretchObjs.accumulateStatic - 0.0012) {
            if (
                ((gameObjects.roomStretchObjs.accumulateStatic = 0),
                o > 260 && Math.random() < gameObjects.roomStretchObjs.accumulateFlash - 0.4)
            ) {
                gameObjects.roomStretchObjs.accumulateFlash = 0;
                showFlashRand(2);
                gameObjects.roomStretchObjs.armMinDist += 5;
            } else if (Math.random() < 0.4) {
                showStaticRand(1, undefined, undefined, 0.0025 * (o - 220));
                gameObjects.roomStretchObjs.armMinDist += 1.9;
                gameObjects.roomStretchObjs.accumulateFlash *= 0.5;
            } else {
                gameObjects.roomStretchObjs.armMinDist += 0.5;
                gameObjects.roomStretchObjs.accumulateFlash += 0.1 * e;
            }
        } else gameObjects.roomStretchObjs.accumulateStatic;
    let i = gameObjects.roomStretchObjs.touchspot.x - gameObjects.roomStretchObjs.hand.x;
    let u = gameObjects.roomStretchObjs.touchspot.y - gameObjects.roomStretchObjs.hand.y;
    let p = i * i + u * u;
    if (p < 10500 && !gameObjects.roomStretchObjs.doDarkCleanup)
        if (Math.abs(i) + Math.abs(u) < 20) {
            if (!gameObjects.roomStretchObjs.roomUnlocked) {
                if (((gameObjects.roomStretchObjs.roomUnlocked = true), gameObjects.roomStretchObjs.doHorrorSection)) {
                    gameObjects.roomStretchObjs.roomCompleted = true;
                    roomStretchMarkStage(ROOM_STRETCH_STAGE_COMPLETED);
                    gameDelay(() => {
                        // Both showAltReality("stretch*") call sites live inside
                        // roomStretchUpdate, so once it stops running nothing can
                        // reference these six full-screen JPEGs again (~26MB VRAM).
                        removeFromUpdateFuncList(roomStretchUpdate);
                        releaseTextures(["stretch1", "stretch2", "stretch3", "stretch4", "stretch5", "stretch6"]);
                    }, 10000);
                    gameObjects.roomStretchObjs.frame2.destroy();
                    gameObjects.roomStretchObjs.frame2x.alpha = 1;
                    gameObjects.roomStretchObjs.handButton.destroy();
                    playSound("tear6");
                    showStaticLite(9, 10, 2);
                    showAltReality(
                        ["stretch2", "stretch3", "stretch4", "stretch4", "stretch5", "stretch5", "stretch6"],
                        1.2
                    );
                    gameObjects.sounds.pumpamb.stop();
                    gameObjects.roomStretchObjs.hand.alpha = 0;
                    gameObjects.roomStretchObjs.hand.x = gameObjects.roomStretchObjs.dollPosX + 25;
                    gameObjects.roomStretchObjs.hand.y = 500;
                    let e = globalScene.add.image(
                        gameObjects.roomStretchObjs.touchspot.x,
                        gameObjects.roomStretchObjs.touchspot.y,
                        "roomStretch",
                        "hand"
                    );
                    gameObjects.roomStretchObjs.roomContainer.add(e);
                    gameObjects.roomStretchObjs.armseg1.x = e.x - 25;
                    gameObjects.roomStretchObjs.armseg1.y = e.y + 7;
                    gameObjects.roomStretchObjs.handButton.setState("disable");
                } else {
                    roomStretchMarkStage(ROOM_STRETCH_STAGE_UNLOCKED);
                    if (!gameVars.horrorPoint) {
                        gameObjects.roomStretchObjs.handButton.setState("disable");
                    }
                    setStretchDollImage("dollHappy", true);
                    let e = globalScene.add.image(
                        gameObjects.roomStretchObjs.dollPosX - 65,
                        gameObjects.roomStretchObjs.dollPosY - 125,
                        "roomStretch",
                        "exclamation"
                    );
                    gameObjects.roomStretchObjs.roomContainer.add(e);
                    e.scaleX = 0.5;
                    e.scaleY = 0.5;
                    globalScene.tweens.chain({
                        targets: e,
                        tweens: [
                            {
                                scaleX: 1.2,
                                scaleY: 1.2,
                                duration: 150,
                                ease: "Quad.easeOut"
                            },
                            {
                                scaleX: 0,
                                scaleY: 0,
                                duration: 450,
                                ease: "Quad.easeIn"
                            }
                        ]
                    });
                    globalScene.tweens.chain({
                        targets: e,
                        tweens: [
                            {
                                x: gameObjects.roomStretchObjs.dollPosX - 100,
                                y: gameObjects.roomStretchObjs.dollPosY - 140,
                                ease: "Quad.easeOut"
                            }
                        ]
                    });
                }
                gameDelay(
                    () => {
                        if (gameVars.horrorPoint && !gameObjects.roomStretchObjs.doHorrorSection) {
                            let e = globalScene.add.image(
                                gameObjects.roomStretchObjs.dollPosX - 100,
                                gameObjects.roomStretchObjs.dollPosY - 30,
                                "buttons",
                                "key_yellow"
                            );
                            playSound("keyfound");
                            gameObjects.roomStretchObjs.roomContainer.add(e);
                            gameDelay(() => {
                                showStaticRand(1);
                                gameDelay(() => {
                                    e.destroy();
                                    gameObjects.roomStretchObjs.doDarkCleanup = true;
                                    showStaticRand(3, undefined, () => {
                                        showFlashRand(3);
                                        messageBus.publish("startTrueStretchHorror");
                                    });
                                }, 550);
                            }, 800);
                        } else {
                            createKey(
                                gameObjects.roomStretchObjs.dollPosX - 100,
                                gameObjects.roomStretchObjs.dollPosY - 30,
                                gameObjects.roomStretchObjs.roomIndex,
                                gameObjects.roomStretchObjs.roomContainer,
                                !gameVars.horrorPoint
                            );
                        }
                        if (gameVars.horrorPoint) {
                            gameDelay(() => {
                                gameObjects.generalDarkness.alpha = 0.1;
                                gameDelay(() => {
                                    gameObjects.generalDarkness.alpha = 0.04;
                                    gameDelay(() => {
                                        gameObjects.generalDarkness.alpha = 0.15;
                                        gameDelay(() => {
                                            gameObjects.generalDarkness.alpha = 0.07;
                                        }, 100);
                                    }, 350);
                                }, 100);
                            }, 350);
                        }
                    },
                    gameVars.horrorPoint ? 700 : 300
                );
            }
        } else {
            let e = p < 2200 ? 45 : 25;
            if (gameObjects.roomStretchObjs.doHorrorSection) {
                e *= 4;
            }
            gameObjects.roomStretchObjs.hand.velX += (i * e) / p;
            gameObjects.roomStretchObjs.hand.velY += (u * e) / p;
        }
    if (gameObjects.roomStretchObjs.roomCompleted) setStretchDollImage("dollDefeated");
    else if (gameObjects.roomStretchObjs.roomUnlocked);
    else if (gameObjects.roomStretchObjs.overstretched) {
        if (((gameObjects.sounds.pumpamb.volume = Math.max(0.01, (o - 260) / 90) * gameVars.soundMult), o < 285)) {
            setStretchDollImage("dollAnxious");
            let e = 1.4 * Math.random();
            gameObjects.roomStretchObjs.doll.x = gameObjects.roomStretchObjs.dollPosX - 0.7 + e + 9;
        } else if (o < 340) {
            playSoundOnce("tear4", 250);
            setStretchDollImage("dollFearful");
            gameObjects.roomStretchObjs.doll.rotation += 0.035 * (Math.random() - 0.25);
            let e = 1.7 * Math.random() - 0.85;
            gameObjects.roomStretchObjs.doll.x = gameObjects.roomStretchObjs.dollPosX + e + 9;
            gameObjects.roomStretchObjs.dollBody.x = gameObjects.roomStretchObjs.dollPosX + e;
            gameObjects.roomStretchObjs.armseg1.x = gameObjects.roomStretchObjs.dollPosX + 35.5 + e;
        } else {
            playSoundOnce("tear5", 250);
            setStretchDollImage("dollHorrified");
            gameObjects.roomStretchObjs.doll.rotation += 0.16 * (Math.random() - 0.25);
            let e = 3 * Math.random() - 1.5;
            gameObjects.roomStretchObjs.doll.x = gameObjects.roomStretchObjs.dollPosX + e + 9;
            gameObjects.roomStretchObjs.dollBody.x = gameObjects.roomStretchObjs.dollPosX + e;
            gameObjects.roomStretchObjs.armseg1.x = gameObjects.roomStretchObjs.dollPosX + 35.5 + e;
        }
    } else if (o < 120) {
        setStretchDollImage("dollNeutral");
    } else {
        if (o < 230) {
            setStretchDollImage("dollExpectant");
        } else {
            if (o < 290) {
                if (o > 260 && !gameObjects.roomStretchObjs.flashFear) {
                    setStretchDollImage("dollFearful");
                    playSoundOnce("tear2");
                    showStaticLite(1, 4, 1.5);
                    gameDelay(() => {
                        if (!gameObjects.roomStretchObjs.flashFear) {
                            gameObjects.roomStretchObjs.armMinDist += 5;
                        }
                        gameObjects.roomStretchObjs.flashFear = true;
                    }, 150);
                } else {
                    if (!gameObjects.roomStretchObjs.flashStaticOnce) {
                        gameObjects.roomStretchObjs.flashStaticOnce = true;
                        showStaticLite(2, 8, 1, 0.1);
                        gameObjects.roomStretchObjs.armMinDist += 2;
                        gameDelay(() => {
                            gameObjects.roomStretchObjs.armMinDist += 1;
                            gameDelay(() => {
                                gameObjects.roomStretchObjs.armMinDist += 1;
                            }, 20);
                        }, 20);
                    }
                    playSoundOnce("tear1");
                    setStretchDollImage("dollAnxious");
                }
            } else {
                if (!gameObjects.roomStretchObjs.overstretched) {
                    gameObjects.roomStretchObjs.overstretched = true;
                    gameObjects.sounds.pumpamb.play({
                        loop: true
                    });
                    gameObjects.sounds.pumpamb.volume = 0.01;
                    gameObjects.roomStretchObjs.armseg2.setOrigin(0.022, 0.5);
                    gameObjects.roomStretchObjs.armMinDist += 1;
                    gameDelay(() => {
                        playSoundOnce("tear3");
                        showAltReality(["stretch1", "stretch2", "stretch3", "stretch4"], 1.06);
                        gameObjects.roomStretchObjs.armMinDist += 8;
                    }, 100);
                }
                setStretchDollImage("dollFearful");
            }
        }
    }
    gameObjects.roomStretchObjs.doll.rotation *= 0.75;
}
function stretchCleanup() {
    gameObjects.roomStretchObjs.doDarkCleanup = true;
    gameObjects.roomStretchObjs.cleanupButton.destroy();
    gameObjects.exhibit.needCleanup = false;
    roomStretchMarkStage(ROOM_STRETCH_STAGE_CLEANED);
    messageBus.publish("saveCheckpoint");
    gameDelay(() => {
        playSound("deepbell2");
        updateInfoTextSoft(TEXT.roomCleaned, 2250);
    }, 400);
}
function setStretchDollImage(e, t = false) {
    if (gameObjects.roomStretchObjs.doll == gameObjects.roomStretchObjs.dollImages[e]) return;
    if (((gameObjects.roomStretchObjs.doll.visible = false), "dollDefeated" === e)) {
        updateDollBodyImage("dollDefeated");
        return void (gameObjects.roomStretchObjs.doll.visible = false);
    }
    updateDollBodyImage("dollBody");
    if (!gameObjects.roomStretchObjs.dollImages[e]) {
        let t = globalScene.add.image(
            gameObjects.roomStretchObjs.dollPosX + 9,
            gameObjects.roomStretchObjs.dollPosY + -91,
            "roomStretch",
            e
        );
        gameObjects.roomStretchObjs.dollImages[e] = t;
        gameObjects.roomStretchObjs.roomContainer.add(t);
    }
    gameObjects.roomStretchObjs.dollImages[e].visible = true;
    gameObjects.roomStretchObjs.doll = gameObjects.roomStretchObjs.dollImages[e];
    gameObjects.roomStretchObjs.doHorrorSection;
    gameObjects.roomStretchObjs.doll.x = gameObjects.roomStretchObjs.dollPosX + 9;
    gameObjects.roomStretchObjs.doll.y = gameObjects.roomStretchObjs.dollPosY + -91;
    if (t) {
        gameObjects.roomStretchObjs.doll.rotation = 0.075;
        gameObjects.roomStretchObjs.dollBody.scaleX = 1.01;
        gameObjects.roomStretchObjs.dollBody.scaleY = 1.01;
        gameObjects.roomStretchObjs.doll.scaleX = 1.015;
        gameObjects.roomStretchObjs.doll.scaleY = 1.02;
        gameDelay(() => {
            gameObjects.roomStretchObjs.dollBody.scaleX = 1.004;
            gameObjects.roomStretchObjs.dollBody.scaleY = 1.004;
            gameObjects.roomStretchObjs.doll.scaleX = 1.006;
            gameObjects.roomStretchObjs.doll.scaleY = 1.008;
            gameDelay(() => {
                gameObjects.roomStretchObjs.dollBody.scaleX = 1.001;
                gameObjects.roomStretchObjs.dollBody.scaleY = 1.001;
                gameObjects.roomStretchObjs.doll.scaleX = 1.002;
                gameObjects.roomStretchObjs.doll.scaleY = 1.003;
                gameDelay(() => {
                    gameObjects.roomStretchObjs.dollBody.scaleX = 1;
                    gameObjects.roomStretchObjs.dollBody.scaleY = 1;
                    gameObjects.roomStretchObjs.doll.scaleX = 1;
                    gameObjects.roomStretchObjs.doll.scaleY = 1;
                }, 40);
            }, 40);
        }, 50);
    } else {
        gameObjects.roomStretchObjs.doll.rotation = 0.04;
        gameObjects.roomStretchObjs.dollBody.scaleY = 1.008;
        gameObjects.roomStretchObjs.doll.scaleY = 1.012;
        gameDelay(() => {
            gameObjects.roomStretchObjs.dollBody.scaleY = 1.003;
            gameObjects.roomStretchObjs.doll.scaleY = 1.004;
            gameDelay(() => {
                gameObjects.roomStretchObjs.dollBody.scaleY = 1;
                gameObjects.roomStretchObjs.doll.scaleY = 1;
            }, 40);
        }, 50);
    }
}
function setStretchDollPos(e, t) {
    if (
        ((gameObjects.roomStretchObjs.dollPosX = e),
        (gameObjects.roomStretchObjs.dollPosY = t),
        gameObjects.roomStretchObjs.dollBody &&
            ((gameObjects.roomStretchObjs.dollBody.x = gameObjects.roomStretchObjs.dollPosX),
            (gameObjects.roomStretchObjs.dollBody.y = gameObjects.roomStretchObjs.dollPosY)),
        gameObjects.roomStretchObjs.doll)
    ) {
        let e = 9;
        let t = -91;
        gameObjects.roomStretchObjs.doll.x = gameObjects.roomStretchObjs.dollPosX + e;
        gameObjects.roomStretchObjs.doll.y = gameObjects.roomStretchObjs.dollPosY + t;
    }
}
function updateDollBodyImage(e) {
    if (gameObjects.roomStretchObjs.dollBodyName !== e) {
        gameObjects.roomStretchObjs.dollBodyName = e;
        if (gameObjects.roomStretchObjs.dollBody) {
            gameObjects.roomStretchObjs.dollBody.visible = false;
        }
        if (gameObjects.roomStretchObjs.dollBodyList[e]) {
            gameObjects.roomStretchObjs.dollBodyList[e].visible = true;
            gameObjects.roomStretchObjs.dollBody = gameObjects.roomStretchObjs.dollBodyList[e];
        } else {
            gameObjects.roomStretchObjs.dollBody = globalScene.add.image(
                gameObjects.roomStretchObjs.dollPosX,
                gameObjects.roomStretchObjs.dollPosY,
                "roomStretch",
                e
            );
            gameObjects.roomStretchObjs.roomContainer.add(gameObjects.roomStretchObjs.dollBody);
            gameObjects.roomStretchObjs.dollBodyList[e] = gameObjects.roomStretchObjs.dollBody;
        }
    }
}
function updateStretchSounds(e) {
    if (e > 120) {
        if (gameObjects.roomStretchObjs.lastSoundUpdate <= 0) {
            if (e < 250) {
                playSound("rubber", 5, 0.35);
                gameObjects.roomStretchObjs.lastSoundUpdate = 80 + Math.floor(50 * Math.random());
            } else {
                playSound("rubber", 8, 1);
                gameObjects.roomStretchObjs.lastSoundUpdate = 60 + Math.floor(10 * Math.random());
            }
        } else {
            gameObjects.roomStretchObjs.lastSoundUpdate--;
        }
    }
}
function updateStreamers() {
    for (let e = 0; e < 8; e++) {
        let t = gameObjects.roomStretchObjs.streamersList[e];
        t.velY += 0.1 * (1 - t.scaleY) - 0.03 * t.velY;
        gameObjects.roomStretchObjs.streamersList[e].scaleY += 0.014 * t.velY;
    }
}
function pullbackStreamers() {
    for (let e = 0; e < 8; e++) {
        let t = gameObjects.roomStretchObjs.streamersList[e];
        t.y -= 50;
        if (!(5 !== e && 6 !== e)) {
            t.y -= 100;
        }
        t.scaleY += 0.03 + 0.08 * Math.random();
    }
    addToUpdateFuncList(updateStreamers);
    gameDelay(() => {
        removeFromUpdateFuncList(updateStreamers);
    }, 20000);
}
// ============================================================== save state ===
//
// Ms. Stretch has FOUR beats, not three like the other rooms — the horror phase
// is split in two. Pulling her arm in the horror phase first triggers a lure
// cinematic that publishes startTrueStretchHorror, which moves the doll and the
// touchspot and swaps the frames; only then can the arm actually be torn off.
// Restoring straight to "completed" without that intermediate step would leave
// the doll and touchspot at their pre-horror positions.
//
// roomUnlocked is NOT cumulative progress: startHorrorSequence and
// startTrueStretchHorror both reset it to false, because it means "has the arm
// been pulled far enough during THIS phase". The old legacy restorer used it as
// a stage-1 signal, which is why it needed a separate saveStage.
//
// Two ordering hazards, both from restore republishing phase topics before it
// applies room state — the same pair seen in roompump.js:
//
//  1. startDarkSequence parks cleanupButton at the touchspot. startTrueStretch-
//     Horror later MOVES the touchspot, so the hotspot is re-parked at the end
//     of this function once everything is in place.
//  2. startHorrorSequence re-arms handButton (setState "normal"), which a
//     restorer that unconditionally disables it would undo.

var ROOM_STRETCH_STAGE_NONE = 0;
var ROOM_STRETCH_STAGE_UNLOCKED = 1; // normal phase: arm pulled, key given
var ROOM_STRETCH_STAGE_CLEANED = 2; // dark phase: room cleaned up
var ROOM_STRETCH_STAGE_HORROR_READY = 3; // horror lure done, true horror set up
var ROOM_STRETCH_STAGE_COMPLETED = 4; // horror phase: arm torn off

function roomStretchMarkStage(stage) {
    let r = gameObjects.roomStretchObjs;
    if (r && (!r.saveStage || r.saveStage < stage)) {
        r.saveStage = stage;
    }
}
function roomStretchGetSaveStage() {
    let r = gameObjects.roomStretchObjs;
    return (r && r.saveStage) || ROOM_STRETCH_STAGE_NONE;
}
function roomStretchPhaseSatisfied(stage) {
    if (gameVars.horrorPoint) return stage >= ROOM_STRETCH_STAGE_COMPLETED;
    if (gameVars.darkPoint) return stage >= ROOM_STRETCH_STAGE_CLEANED;
    return stage >= ROOM_STRETCH_STAGE_UNLOCKED;
}

// Puts the room straight into the end state of `stage`.
//
// STATE ONLY — no tweens, sounds, static or gameDelay chains.
function roomStretchSetSaveStage(stage) {
    let r = gameObjects.roomStretchObjs;
    if (!r || !stage) return;
    r.saveStage = stage;
    if (stage >= ROOM_STRETCH_STAGE_CLEANED) {
        // doDarkCleanup belongs to the phase: both startHorrorSequence and
        // startTrueStretchHorror clear it, because the arm has to be pulled
        // again in the horror phase. roomStretchUpdate gates its ENTIRE
        // completion path on !doDarkCleanup, so setting it here once the horror
        // phase has begun would make the room impossible to finish.
        if (!gameVars.horrorPoint) r.doDarkCleanup = true;
        if (saveAlive(r.cleanupButton)) r.cleanupButton.destroy();
    }
    if (stage >= ROOM_STRETCH_STAGE_HORROR_READY) {
        // Re-run the room's own horror setup rather than copying it: the
        // subscriber unsubscribes itself, so this fires exactly once.
        messageBus.publish("startTrueStretchHorror");
    }
    if (stage >= ROOM_STRETCH_STAGE_COMPLETED) {
        // Tail of the arm-tearing branch in roomStretchUpdate (line 190).
        r.roomCompleted = true;
        r.roomUnlocked = true;
        if (saveAlive(r.frame2)) r.frame2.destroy();
        r.frame2x.alpha = 1;
        r.hand.alpha = 0;
        r.hand.x = r.dollPosX + 25;
        r.hand.y = 500;
        let h = globalScene.add.image(r.touchspot.x, r.touchspot.y, "roomStretch", "hand");
        r.roomContainer.add(h);
        r.armseg1.x = h.x - 25;
        r.armseg1.y = h.y + 7;
        setStretchDollImage("dollDefeated");
        if (saveAlive(r.handButton)) r.handButton.setState("disable");
        removeFromUpdateFuncList(roomStretchUpdate);
        return;
    }
    if (stage >= ROOM_STRETCH_STAGE_UNLOCKED && !gameVars.horrorPoint) {
        // roomUnlocked carries through the dark phase — startDarkSequence does
        // not reset it, only startHorrorSequence and startTrueStretchHorror do.
        //
        // It is load-bearing, not cosmetic: while it is true and the room is
        // neither cleaned nor completed, roomStretchUpdate pins the hand to the
        // touchspot every frame (roomstretch.js:123). That is what keeps the
        // hand stuck on the pad. Guarding this on !darkPoint left it false on a
        // dark-phase restore, so the hand fell off the pad instead.
        r.roomUnlocked = true;
        setStretchDollImage("dollHappy", true);
    }

    // Arm the control this phase actually uses. Never unconditionally disable
    // handButton — startHorrorSequence deliberately re-armed it.
    let satisfied = roomStretchPhaseSatisfied(stage);
    if (satisfied) {
        if (saveAlive(r.handButton)) r.handButton.setState("disable");
    } else if (gameVars.darkPoint && !gameVars.horrorPoint) {
        // Dark phase: the cleanup hotspot, re-parked now the touchspot is final.
        if (saveAlive(r.cleanupButton)) {
            r.cleanupButton.setPos(r.touchspot.x, r.touchspot.y);
        }
    } else if (saveAlive(r.handButton)) {
        r.handButton.setState("normal");
    }
}
