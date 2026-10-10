/**
 * @fileoverview Hint system module for managing hint counter and badge display.
 */

// NOTE: no top-level access to gameVars/gameObjects/globalScene in this file.
// main.js declares them with `let`, and it is concatenated after this file in
// the production bundle (build.js), so at load time they are in the temporal
// dead zone - where even `typeof x !== "undefined"` throws rather than yielding
// "undefined". As separate <script> tags the name is merely undeclared and the
// same guard is safe, so a hazard here breaks only the built game.
// hintCount's default lives in the gameVars literal in main.js.

class HintHand {
    constructor(scene, container, x = 0, y = 0, initialFrame = "hinthandopen", frames = ["hinthandopen", "hinthandclose", "hinthandpointer", "hinthandbroken"]) {
        this.scene = scene;
        this.container = container;
        this.x = x;
        this.y = y;
        this.frames = frames;
        this.currentIndex = 0;
        this.sprite = scene.add.sprite(x, y, "roomHandy", initialFrame);
        if (container) {
            container.add(this.sprite);
        }
        this.loopTimer = null;
    }

    setState(indexOrFrame) {
        if (typeof indexOrFrame === "number") {
            this.currentIndex = (indexOrFrame % this.frames.length + this.frames.length) % this.frames.length;
            this.sprite.setFrame(this.frames[this.currentIndex]);
        } else if (typeof indexOrFrame === "string") {
            let idx = this.frames.indexOf(indexOrFrame);
            if (idx !== -1) {
                this.currentIndex = idx;
            }
            this.sprite.setFrame(indexOrFrame);
        }
        return this;
    }

    nextState() {
        this.currentIndex = (this.currentIndex + 1) % this.frames.length;
        this.sprite.setFrame(this.frames[this.currentIndex]);
        return this.frames[this.currentIndex];
    }

    startLoop(intervalMs = 1500) {
        this.stopLoop();
        this.loopTimer = this.scene.time.addEvent({
            delay: intervalMs,
            callback: () => {
                this.nextState();
            },
            loop: true
        });
        return this;
    }

    stopLoop() {
        if (this.loopTimer) {
            this.loopTimer.remove();
            this.loopTimer = null;
        }
        return this;
    }

    setVisible(visible) {
        this.sprite.setVisible(visible);
        return this;
    }

    setFrame(frame) {
        this.setState(frame);
        return this;
    }

    destroy() {
        this.stopLoop();
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}

function getMajorState() {
    if (typeof gameVars === "undefined") return "normal";
    if (gameVars.horrorPoint) return "horror";
    if (gameVars.darkPoint) return "dark";
    return "normal";
}

let globalActiveHintCleanup = null;

function clearActiveHintHand() {
    if (globalActiveHintCleanup) {
        globalActiveHintCleanup();
        globalActiveHintCleanup = null;
    }
}

function getMoveRightPos() {
    let x = (typeof gameObjects !== "undefined" && gameObjects && gameObjects.moveRightBtn)
        ? gameObjects.moveRightBtn.getPosX()
        : ((typeof gameVars !== "undefined") ? (gameVars.width - 22) : DISPLAY.width - 22);
    let y = (typeof gameObjects !== "undefined" && gameObjects && gameObjects.moveRightBtn)
        ? gameObjects.moveRightBtn.getPosY()
        : ((typeof gameVars !== "undefined") ? gameVars.halfHeight : DISPLAY.height / 2);
    return { x, y };
}

function getMoveLeftPos() {
    let x = (typeof gameObjects !== "undefined" && gameObjects && gameObjects.moveLeftBtn)
        ? gameObjects.moveLeftBtn.getPosX() + 40
        : 55;
    let y = (typeof gameObjects !== "undefined" && gameObjects && gameObjects.moveLeftBtn)
        ? gameObjects.moveLeftBtn.getPosY()
        : ((typeof gameVars !== "undefined") ? gameVars.halfHeight : DISPLAY.height / 2);
    return { x, y };
}

function isMoveRightEnabled() {
    if (typeof gameObjects === "undefined" || !gameObjects || !gameObjects.moveRightBtn) {
        return false;
    }
    return gameObjects.moveRightBtn.state !== "disable";
}

function isMoveLeftEnabled() {
    if (typeof gameObjects === "undefined" || !gameObjects || !gameObjects.moveLeftBtn) {
        return false;
    }
    return gameObjects.moveLeftBtn.state !== "disable";
}

function isDarkCleanupNeeded() {
    if (typeof gameObjects !== "undefined" && gameObjects && gameObjects.exhibit) {
        return gameObjects.exhibit.needCleanup === true;
    }
    return false;
}

function tryPlayMoveButtonHint(state) {
    if ((state === "normal" || state === "horror") && isMoveRightEnabled()) {
        let rightPos = getMoveRightPos();
        playPointHintAnimation(rightPos.x, rightPos.y, -40, false);
        return true;
    }
    if (state === "dark" && !isDarkCleanupNeeded()) {
        let leftPos = getMoveLeftPos();
        playPointHintAnimation(leftPos.x, leftPos.y, -40, false);
        return true;
    }
    return false;
}

function triggerGlitchAndFlash(staticCount = 3, flashCount = 3) {
    if (typeof showStaticRand === "function") showStaticRand(staticCount * 3);
    if (typeof showFlashRand === "function") showFlashRand(flashCount * 3);
}

function createBaseHintHand(initialFrame = "hinthandopen") {
    clearActiveHintHand();

    if (typeof globalScene === "undefined" || !globalScene) return null;

    let hintButtonX = (typeof gameVars !== "undefined") ? (gameVars.width - 140) : DISPLAY.width - 140;
    let hintButtonY = 51;
    let startX = hintButtonX - 40;
    let startY = hintButtonY + 40;

    let hand = globalScene.add.sprite(startX, startY, "roomHandy", initialFrame);
    hand.setScrollFactor(0);
    hand.setDepth(1005);
    hand.setScale(0);
    hand.setAlpha(0);

    let isStopped = false;
    let activeTweens = [];
    let moveSub = null;
    let keySub = null;
    let keyClickSub = null;
    let fingerClickSub = null;
    let roomCleanedSub = null;
    let doorOpenSub = null;
    let powerTurnOnSub = null;

    function stopAnimation() {
        if (isStopped) return;
        isStopped = true;
        activeTweens.forEach(t => {
            if (t && t.isPlaying) t.stop();
        });
        activeTweens = [];
        if (moveSub) { moveSub.unsubscribe(); moveSub = null; }
        if (keySub) { keySub.unsubscribe(); keySub = null; }
        if (keyClickSub) { keyClickSub.unsubscribe(); keyClickSub = null; }
        if (fingerClickSub) { fingerClickSub.unsubscribe(); fingerClickSub = null; }
        if (roomCleanedSub) { roomCleanedSub.unsubscribe(); roomCleanedSub = null; }
        if (doorOpenSub) { doorOpenSub.unsubscribe(); doorOpenSub = null; }
        if (powerTurnOnSub) { powerTurnOnSub.unsubscribe(); powerTurnOnSub = null; }
        if (hand) { hand.destroy(); hand = null; }
    }

    if (typeof messageBus !== "undefined" && messageBus) {
        moveSub = messageBus.subscribe("exhibitMove", stopAnimation);
        keySub = messageBus.subscribe("keyAppeared", stopAnimation);
        keyClickSub = messageBus.subscribe("keyClicked", stopAnimation);
        fingerClickSub = messageBus.subscribe("fingerClicked", stopAnimation);
        roomCleanedSub = messageBus.subscribe("roomCleanedUp", stopAnimation);
        doorOpenSub = messageBus.subscribe("doorOpened", stopAnimation);
        powerTurnOnSub = messageBus.subscribe("powerTurnedOn", stopAnimation);
    }

    globalActiveHintCleanup = stopAnimation;

    function startPopIn(onPopComplete) {
        if (isStopped || !hand) return;
        hand.setFrame(initialFrame);
        hand.setPosition(startX, startY);
        hand.setRotation(0);
        hand.setScale(0);
        hand.setAlpha(0);

        let popTween = globalScene.tweens.add({
            targets: hand,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 300,
            ease: "Back.easeOut",
            onComplete: () => {
                if (isStopped || !hand) return;
                if (onPopComplete) onPopComplete();
            }
        });
        activeTweens.push(popTween);
    }

    return {
        hand,
        startX,
        startY,
        isStopped: () => isStopped,
        activeTweens,
        stopAnimation,
        startPopIn
    };
}

function playPointHintAnimation(targetX, targetY, offsetY = -40, isLongPress = false) {
    let base = createBaseHintHand("hinthandopen");
    if (!base) return;
    let { hand, isStopped, activeTweens, startPopIn } = base;

    let destinationX = targetX;
    let destinationY = targetY + offsetY;

    function runAnimationCycle() {
        if (isStopped() || !hand) return;

        startPopIn(() => {
            let moveTween = globalScene.tweens.add({
                targets: hand,
                x: destinationX,
                y: destinationY,
                duration: 1250,
                ease: "Cubic.easeInOut",
                onStart: () => {
                    if (hand) hand.setFrame("hinthandpointer");
                },
                onComplete: () => {
                    if (isStopped() || !hand) return;

                    let rotateTween = globalScene.tweens.add({
                        targets: hand,
                        angle: -165,
                        duration: 350,
                        ease: "Cubic.easeOut",
                        onComplete: () => {
                            if (isStopped() || !hand) return;

                            let holdDuration = isLongPress ? 500 : 0;
                            let pressDownTween = globalScene.tweens.add({
                                targets: hand,
                                y: destinationY + 25,
                                duration: 120,
                                ease: "Quad.easeOut",
                                onComplete: () => {
                                    if (isStopped() || !hand) return;

                                    let releaseUpTween = globalScene.tweens.add({
                                        targets: hand,
                                        y: destinationY,
                                        duration: 120,
                                        delay: holdDuration,
                                        ease: "Quad.easeIn",
                                        onComplete: () => {
                                            if (isStopped() || !hand) return;

                                            let fadeTween = globalScene.tweens.add({
                                                targets: hand,
                                                alpha: 0,
                                                duration: 400,
                                                delay: 200,
                                                onComplete: () => {
                                                    if (isStopped() || !hand) return;

                                                    if (globalScene && globalScene.time) {
                                                        globalScene.time.delayedCall(500, () => {
                                                            if (!isStopped() && hand) {
                                                                runAnimationCycle();
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                            activeTweens.push(fadeTween);
                                        }
                                    });
                                    activeTweens.push(releaseUpTween);
                                }
                            });
                            activeTweens.push(pressDownTween);
                        }
                    });
                    activeTweens.push(rotateTween);
                }
            });
            activeTweens.push(moveTween);
        });
    }

    runAnimationCycle();
}

function playGrabAtAnimation(targetX, targetY, onCompleteCallback) {
    let base = createBaseHintHand("hinthandopen");
    if (!base) return;
    let { hand, isStopped, activeTweens, startPopIn, stopAnimation } = base;

    function runCycle() {
        if (isStopped() || !hand) return;

        startPopIn(() => {
            let moveTween = globalScene.tweens.add({
                targets: hand,
                x: targetX,
                y: targetY,
                duration: 1250,
                ease: "Cubic.easeInOut",
                onComplete: () => {
                    if (isStopped() || !hand) return;

                    hand.setFrame("hinthandclose");

                    if (onCompleteCallback) {
                        gameDelay(() => {
                            if (isStopped() || !hand) return;
                            onCompleteCallback({
                                hand,
                                isStopped,
                                activeTweens,
                                restartCycle: runCycle,
                                stopAnimation
                            });
                        }, 300);
                    }
                }
            });
            activeTweens.push(moveTween);
        });
    }

    runCycle();
}

function playClockwiseArcAnimation(context, pivotX, pivotY, sweepAngleDeg = 80, durationMs = 1000, onCompleteCallback) {
    let { hand, isStopped, activeTweens } = context;
    if (isStopped() || !hand) return;

    let dx = hand.x - pivotX;
    let dy = hand.y - pivotY;
    let radius = Math.sqrt(dx * dx + dy * dy);
    let startAngle = Math.atan2(dy, dx);
    let sweepAngleRad = sweepAngleDeg * (Math.PI / 180);

    let progressObj = { progress: 0 };
    let arcTween = globalScene.tweens.add({
        targets: progressObj,
        progress: 1,
        duration: durationMs * 2,
        ease: "Cubic.easeInOut",
        onUpdate: () => {
            if (isStopped() || !hand) return;
            let currAngle = startAngle + progressObj.progress * sweepAngleRad;
            hand.x = pivotX + radius * Math.cos(currAngle);
            hand.y = pivotY + radius * Math.sin(currAngle);
        },
        onComplete: () => {
            if (isStopped() || !hand) return;
            if (onCompleteCallback) {
                onCompleteCallback(context);
            }
        }
    });
    activeTweens.push(arcTween);
}

function playFadeOutAnimation(context, delayMs = 200, durationMs = 400, onCompleteCallback) {
    let { hand, isStopped, activeTweens, restartCycle } = context;
    if (isStopped() || !hand) return;

    let fadeTween = globalScene.tweens.add({
        targets: hand,
        alpha: 0,
        delay: delayMs,
        duration: durationMs,
        onComplete: () => {
            if (isStopped() || !hand) return;
            if (onCompleteCallback) {
                onCompleteCallback(context);
            } else if (globalScene && globalScene.time) {
                globalScene.time.delayedCall(500, () => {
                    if (!isStopped() && hand) {
                        restartCycle();
                    }
                });
            }
        }
    });
    activeTweens.push(fadeTween);
}

function getFaucetHandleAndPivot() {
    let halfW = (typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2;
    let halfH = (typeof gameVars !== "undefined") ? gameVars.halfHeight : DISPLAY.height / 2;

    let leverX = halfW + 53;
    let leverY = halfH - 39;

    if (typeof gameObjects !== "undefined" && gameObjects && gameObjects.roomFaucetObjs && gameObjects.roomFaucetObjs.lever) {
        leverX = halfW + gameObjects.roomFaucetObjs.lever.x;
        leverY = gameObjects.roomFaucetObjs.lever.y;
    }

    let handleX = leverX;
    let handleY = leverY - 230;

    if (typeof gameObjects !== "undefined" && gameObjects && gameObjects.roomFaucetObjs && gameObjects.roomFaucetObjs.handle) {
        handleX = halfW + gameObjects.roomFaucetObjs.handle.getPosX();
        handleY = gameObjects.roomFaucetObjs.handle.getPosY();
    }

    return { handleX, handleY, pivotX: leverX, pivotY: leverY };
}

function handleEntranceHint(state) {
    if (!tryPlayMoveButtonHint(state)) {
        console.log(`Hint: Entrance Room (${state} State)`);
    }
}

function handlePumpHint(state) {
    if (tryPlayMoveButtonHint(state)) return;

    if (state === "dark") {
        let halfW = (typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2;
        let floatyX = halfW + 135;
        let floatyY = (typeof gameObjects !== "undefined" && gameObjects.roomPumpObjs && gameObjects.roomPumpObjs.floaty)
            ? gameObjects.roomPumpObjs.floaty.y
            : (((typeof gameVars !== "undefined") ? gameVars.halfHeight : DISPLAY.height / 2) + 175);
        if (typeof gameObjects !== "undefined" && gameObjects.roomPumpObjs && gameObjects.roomPumpObjs.cleanupBtn && gameObjects.roomPumpObjs.cleanupBtn.getPosX() !== 0) {
            floatyX = halfW + gameObjects.roomPumpObjs.cleanupBtn.getPosX();
            floatyY = gameObjects.roomPumpObjs.cleanupBtn.getPosY();
        }
        playPointHintAnimation(floatyX, floatyY, -40, false);
    } else {
        let fanX = ((typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2) - 240;
        let fanY = (typeof gameObjects !== "undefined" && gameObjects.roomPumpObjs && gameObjects.roomPumpObjs.button)
            ? gameObjects.roomPumpObjs.button.y
            : 492;
        playPointHintAnimation(fanX + 18, fanY, -110, true);
    }
}

function handleFaucetHint(state) {
    if (tryPlayMoveButtonHint(state)) return;

    let { handleX, handleY, pivotX, pivotY } = getFaucetHandleAndPivot();
    let sweepAngle = (state === "dark") ? -80 : 80;
    let duration = (state === "dark") ? 1500 : 800;

    playGrabAtAnimation(handleX, handleY, (context) => {
        playClockwiseArcAnimation(context, pivotX, pivotY, sweepAngle, duration, (ctx) => {
            playFadeOutAnimation(ctx, 200, 400);
        });
    });
}

function handleClown1Hint(state) {
    let nose = getClownNosePos("roomClown1", 12, 73);
    playPointHintAnimation(nose.x + 20, nose.y, -100, false);
}

function playBrokenHintAnimation(targetX, targetY, offsetY = -40) {
    let base = createBaseHintHand("hinthandbroken");
    if (!base) return;
    let { hand, isStopped, activeTweens, stopAnimation, startPopIn } = base;

    let destinationX = targetX;
    let destinationY = targetY + offsetY;

    startPopIn(() => {
        let moveTween = globalScene.tweens.add({
            targets: hand,
            x: destinationX,
            y: destinationY,
            duration: 4000,
            ease: "Linear",
            onComplete: () => {
                if (isStopped() || !hand) return;
                stopAnimation();
                triggerGlitchAndFlash(3, 3);
            }
        });
        activeTweens.push(moveTween);
    });
}

function getClownNosePos(roomKey, defaultOffX, defaultOffY) {
    let halfW = (typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2;
    let halfH = (typeof gameVars !== "undefined") ? gameVars.halfHeight : DISPLAY.height / 2;

    let noseX = halfW + defaultOffX;
    let noseY = halfH + defaultOffY;

    if (typeof gameObjects !== "undefined" && gameObjects[roomKey] && gameObjects[roomKey].nose) {
        noseX = halfW + gameObjects[roomKey].nose.getPosX();
        noseY = gameObjects[roomKey].nose.getPosY();
    }
    return { x: noseX, y: noseY };
}

function getActiveFingerPos() {
    let halfW = (typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2;
    let halfH = (typeof gameVars !== "undefined") ? gameVars.halfHeight : DISPLAY.height / 2;

    let x = halfW - 420;
    let y = halfH - 80;

    if (typeof gameObjects !== "undefined" && gameObjects.roomHandyObjs && gameObjects.roomHandyObjs.fingerButton && gameObjects.roomHandyObjs.fingerButton.getPosY() >= 0) {
        x = halfW + gameObjects.roomHandyObjs.fingerButton.getPosX();
        y = gameObjects.roomHandyObjs.fingerButton.getPosY();
    } else if (typeof gameObjects !== "undefined" && gameObjects.roomHandyObjs) {
        let stateIdx = gameObjects.roomHandyObjs.fingerState || 0;
        let list = (typeof gameVars !== "undefined" && gameVars.darkPoint && gameObjects.roomHandyObjs.listOfInverseButtonPos)
            ? gameObjects.roomHandyObjs.listOfInverseButtonPos
            : gameObjects.roomHandyObjs.listOfButtonPos;
        if (list) {
            let pos = list[stateIdx] || list[0];
            if (pos) {
                x = halfW + pos.x;
                y = pos.y;
            }
        }
    }
    return { x, y };
}

function handleHandyHint(state) {
    let fingerPos = getActiveFingerPos();

    if (typeof gameVars !== "undefined" && gameVars.bloodHandActive) {
        let hintButtonX = (typeof gameVars !== "undefined") ? (gameVars.width - 140) : DISPLAY.width - 140;
        let hintButtonY = 51;
        let startX = hintButtonX - 40;
        let startY = hintButtonY + 40;
        let destX = (typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2;
        let destY = (typeof gameVars !== "undefined") ? gameVars.halfHeight : DISPLAY.height / 2;
        let midX = startX + 0.6 * (destX - startX);
        let midY = startY + 0.6 * (destY - startY);
        playBrokenHintAnimation(midX, midY, 0);
        return;
    }

    if (state === "horror" && isMoveRightEnabled()) {
        let rightPos = getMoveRightPos();
        playBrokenHintAnimation(rightPos.x, rightPos.y, -40);
        return;
    }

    if (tryPlayMoveButtonHint(state)) return;

    playPointHintAnimation(fingerPos.x + 20, fingerPos.y, -100, false);
}

function getStretchHandAndDropPos() {
    let halfW = (typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2;

    let handX = halfW - 120;
    let handY = 630;

    if (typeof gameObjects !== "undefined" && gameObjects.roomStretchObjs) {
        if (gameObjects.roomStretchObjs.handButton) {
            handX = halfW + gameObjects.roomStretchObjs.handButton.getPosX();
            handY = gameObjects.roomStretchObjs.handButton.getPosY();
        } else if (gameObjects.roomStretchObjs.hand) {
            handX = halfW + gameObjects.roomStretchObjs.hand.x;
            handY = gameObjects.roomStretchObjs.hand.y;
        }
    }

    let dropX = halfW + 204;
    let dropY = 380;

    if (typeof gameObjects !== "undefined" && gameObjects.roomStretchObjs && gameObjects.roomStretchObjs.touchspot) {
        dropX = halfW + gameObjects.roomStretchObjs.touchspot.x;
        dropY = gameObjects.roomStretchObjs.touchspot.y;
    }

    return { handX, handY, dropX, dropY };
}

function handleStretchHint(state) {
    let rightPos = getMoveRightPos();
    let leftPos = getMoveLeftPos();
    let { handX, handY, dropX, dropY } = getStretchHandAndDropPos();

    let hintButtonX = (typeof gameVars !== "undefined") ? (gameVars.width - 140) : DISPLAY.width - 140;
    let hintButtonY = 51;
    let startX = hintButtonX - 40;
    let startY = hintButtonY + 40;

    switch (state) {
        case "normal":
            if (isMoveRightEnabled()) {
                playPointHintAnimation(rightPos.x, rightPos.y, -40, false);
            } else {
                playGrabAtAnimation(handX, handY, (context) => {
                    let { hand, isStopped, activeTweens } = context;
                    if (isStopped() || !hand) return;

                    let moveToDropTween = globalScene.tweens.add({
                        targets: hand,
                        x: dropX,
                        y: dropY,
                        duration: 1250,
                        ease: "Cubic.easeInOut",
                        onComplete: () => {
                            if (isStopped() || !hand) return;
                            playFadeOutAnimation(context, 200, 400);
                        }
                    });
                    activeTweens.push(moveToDropTween);
                });
            }
            break;
        case "dark":
            if (!isDarkCleanupNeeded()) {
                playPointHintAnimation(leftPos.x, leftPos.y, -40, false);
            } else {
                playPointHintAnimation(dropX, dropY, -40, false);
            }
            break;
        case "horror":
            let destX = isMoveRightEnabled() ? rightPos.x : handX;
            let destY = isMoveRightEnabled() ? (rightPos.y - 40) : handY;

            let midX = startX + 0.6 * (destX - startX);
            let midY = startY + 0.6 * (destY - startY);

            playBrokenHintAnimation(midX, midY, 0);
            break;
    }
}

function handleClown2Hint(state) {
    if (isMoveRightEnabled()) {
        let rightPos = getMoveRightPos();
        playPointHintAnimation(rightPos.x, rightPos.y, -40, false);
        return;
    }
    let nose = getClownNosePos("roomClown2", 19, -14);
    playPointHintAnimation(nose.x + 20, nose.y, -100, false);
}

function handleFlowerHint(roomIndex, state) {
    switch (state) {
        case "normal":
            console.log(`Hint: Flower Corridor (Room ${roomIndex}, Normal State)`);
            break;
        case "dark":
            console.log(`Hint: Flower Corridor (Room ${roomIndex}, Dark State)`);
            break;
        case "horror":
            console.log(`Hint: Flower Corridor (Room ${roomIndex}, Horror State)`);
            break;
    }
}

function getJackHandleAndPivot() {
    let halfW = (typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2;

    let pivotX = halfW;
    let pivotY = 670;

    if (typeof gameObjects !== "undefined" && gameObjects.roomJackObjs && gameObjects.roomJackObjs.spinner) {
        pivotX = halfW + gameObjects.roomJackObjs.spinner.x;
        pivotY = gameObjects.roomJackObjs.spinner.y;
    }

    let handleX = pivotX + 121;
    let handleY = pivotY;

    if (typeof gameObjects !== "undefined" && gameObjects.roomJackObjs && gameObjects.roomJackObjs.spinnerButton) {
        handleX = halfW + gameObjects.roomJackObjs.spinnerButton.getPosX();
        handleY = gameObjects.roomJackObjs.spinnerButton.getPosY();
    }

    return { handleX, handleY, pivotX, pivotY };
}

function handleJackHint(state) {
    let rightPos = getMoveRightPos();
    let leftPos = getMoveLeftPos();
    let { handleX, handleY, pivotX, pivotY } = getJackHandleAndPivot();

    let hintButtonX = (typeof gameVars !== "undefined") ? (gameVars.width - 140) : DISPLAY.width - 140;
    let hintButtonY = 51;
    let startX = hintButtonX - 40;
    let startY = hintButtonY + 40;

    let centerX = (typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2;
    let centerY = (typeof gameVars !== "undefined") ? gameVars.halfHeight : DISPLAY.height / 2;
    switch (state) {
        case "normal":
            if (isMoveRightEnabled()) {
                playPointHintAnimation(rightPos.x, rightPos.y, -40, false);
            } else {
                playGrabAtAnimation(handleX, handleY, (context) => {
                    playClockwiseArcAnimation(context, pivotX, pivotY, 270, 1000, (ctx) => {
                        playFadeOutAnimation(ctx, 200, 400);
                    });
                });
            }

            break;
        case "dark":
            if (!isDarkCleanupNeeded()) {
                playPointHintAnimation(leftPos.x, leftPos.y, -40, false);
            } else {
                playGrabAtAnimation(handleX, handleY, (context) => {
                    playClockwiseArcAnimation(context, pivotX, pivotY, -180, 1000, (ctx) => {
                        playFadeOutAnimation(ctx, 200, 400);
                    });
                });
            }
            break;
        case "horror":
            let midX = startX + 0.6 * (centerX - startX);
            let midY = startY + 0.6 * (centerY - startY);
            playBrokenHintAnimation(midX, midY, 0);
            break;
    }
}

function playPointHintAnimationGlitch(targetX, targetY, offsetY = -40) {
    let base = createBaseHintHand("hinthandopen");
    if (!base) return;
    let { hand, isStopped, activeTweens, stopAnimation, startPopIn } = base;

    let destinationX = targetX;
    let destinationY = targetY + offsetY;

    startPopIn(() => {
        let moveTween = globalScene.tweens.add({
            targets: hand,
            x: destinationX,
            y: destinationY,
            duration: 1250,
            ease: "Cubic.easeInOut",
            onStart: () => {
                if (hand) hand.setFrame("hinthandpointer");
            },
            onComplete: () => {
                if (isStopped() || !hand) return;
                stopAnimation();
                triggerGlitchAndFlash(3, 3);
            }
        });
        activeTweens.push(moveTween);
    });
}

function handleClown3Hint(state) {
    let nose = getClownNosePos("roomClown3", 25.5, -83);
    let leftPos = getMoveLeftPos();

    let hintButtonX = (typeof gameVars !== "undefined") ? (gameVars.width - 140) : DISPLAY.width - 140;
    let hintButtonY = 51;
    let startX = hintButtonX - 40;
    let startY = hintButtonY + 40;

    let centerX = (typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2;
    let centerY = (typeof gameVars !== "undefined") ? gameVars.halfHeight : DISPLAY.height / 2;

    switch (state) {
        case "normal":
            playPointHintAnimationGlitch(nose.x, nose.y, -40);
            break;
        case "dark":
            playPointHintAnimation(leftPos.x, leftPos.y, -40, false);
            break;
        case "horror":
            let midX = startX + 0.6 * (centerX - startX);
            let midY = startY + 0.6 * (centerY - startY);
            playBrokenHintAnimation(midX, midY, 0);
            break;
    }
}

function getLightSwitchPos() {
    let halfW = (typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2;
    let x = halfW - 395;
    let y = 550;
    if (typeof gameObjects !== "undefined" && gameObjects.powerSwitch) {
        x = halfW + gameObjects.powerSwitch.getPosX();
        y = gameObjects.powerSwitch.getPosY();
    }
    return { x, y };
}

function getExitDoorPos() {
    let halfW = (typeof gameVars !== "undefined") ? gameVars.halfWidth : DISPLAY.width / 2;
    let x = halfW - 215;
    let y = 507;
    if (typeof gameObjects !== "undefined" && gameObjects.exitDoor) {
        x = halfW + gameObjects.exitDoor.getPosX();
        y = gameObjects.exitDoor.getPosY();
    }
    return { x, y };
}

function isExitDoorDisabled() {
    if (typeof gameObjects !== "undefined" && gameObjects.exitDoor) {
        return gameObjects.exitDoor.state === "disable";
    }
    if (typeof gameVarsTemp !== "undefined" && gameVarsTemp.doorFailed) {
        return true;
    }
    return false;
}

function handleIntroHint(state) {
    let rightPos = getMoveRightPos();
    let switchPos = getLightSwitchPos();
    let doorPos = getExitDoorPos();

    if (state === "normal") {
        playPointHintAnimation(rightPos.x, rightPos.y, -40, false);
    } else if (state === "dark") {
        playPointHintAnimation(switchPos.x, switchPos.y, -40, false);
    } else if (state === "horror" && isExitDoorDisabled()) {
        playPointHintAnimation(rightPos.x, rightPos.y, -40, false);
    } else {
        playPointHintAnimation(doorPos.x + 200, doorPos.y, -240, false);
    }
}

function handleHintPress() {
    let currentRoomIndex = (typeof gameObjects !== "undefined" && gameObjects && gameObjects.exhibit)
        ? gameObjects.exhibit.currentScene
        : 1;

    if (typeof keyPosX !== "undefined" && keyPosX !== null && typeof keyRoomIdx !== "undefined" && keyRoomIdx === currentRoomIndex) {
        playPointHintAnimation(keyPosX + 20, keyPosY - 65, -40, false);
        return;
    }

    let state = getMajorState();

    switch (currentRoomIndex) {
        case 0:
            handleIntroHint(state);
            break;
        case 1:
            handleEntranceHint(state);
            break;
        case 2:
            handlePumpHint(state);
            break;
        case 3:
            handleFaucetHint(state);
            break;
        case 4:
            handleClown1Hint(state);
            break;
        case 5:
            handleHandyHint(state);
            break;
        case 6:
            handleStretchHint(state);
            break;
        case 7:
            handleClown2Hint(state);
            break;
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
            handleFlowerHint(currentRoomIndex, state);
            break;
        case 13:
            handleJackHint(state);
            break;
        case 14:
            handleClown3Hint(state);
            break;
        case 15:
            console.log("Hint requested in Final Room / Exit - doing nothing.");
            break;
        default:
            console.log(`Hint requested in unhandled room index ${currentRoomIndex} (${state} state) - doing nothing.`);
            break;
    }
}

function showHint() {
    playSound("keyfound");
    handleHintPress();
}

function isHintDisabledForRoom(roomIndex) {
    return (roomIndex >= 8 && roomIndex <= 12) || roomIndex === 15;
}

function setHintButtonEnabled(enabled) {
    if (typeof gameObjects === "undefined" || !gameObjects) return;

    if (gameObjects.hintButton) {
        gameObjects.hintButton.setState(enabled ? "normal" : "disable");
    }
}

function updateHintButtonForRoom(roomIndex) {
    if (typeof roomIndex === "undefined" && typeof gameObjects !== "undefined" && gameObjects.exhibit) {
        roomIndex = gameObjects.exhibit.currentScene;
    }
    let disabled = isHintDisabledForRoom(roomIndex);
    setHintButtonEnabled(!disabled);
}

// Called from initOneTimeListeners (main.js) rather than subscribing at file
// scope. restartGame clears the message bus, and a Phaser scene restart does
// not re-evaluate this file — a top-level subscription here would be dropped by
// that clear and never come back, silently freezing the hint button on
// whatever room the player restarted from.
function initHintRoomListeners() {
    if (typeof messageBus === "undefined" || !messageBus) return;
    messageBus.subscribe("exhibitMove", (newRoomIndex) => {
        updateHintButtonForRoom(newRoomIndex);
    });
    messageBus.subscribe("exhibitMoveComplete", (newRoomIndex) => {
        updateHintButtonForRoom(newRoomIndex);
    });
}

function updateHintCounter(count) {
    if (typeof gameVars !== "undefined") {
        gameVars.hintCount = Math.max(0, count);
    }
    if (typeof gameObjects !== "undefined" && gameObjects && gameObjects.hintCountText) {
        let val = (gameVars && gameVars.hintCount > 0) ? String(gameVars.hintCount) : "▷";
        gameObjects.hintCountText.setText(val);
        if (gameVars && gameVars.hintCount > 0 && typeof globalScene !== "undefined" && globalScene && globalScene.tweens) {
            if (gameObjects.hintCountCircle && gameObjects.hintCountText) {
                globalScene.tweens.killTweensOf([gameObjects.hintCountCircle, gameObjects.hintCountText]);
                gameObjects.hintCountCircle.setScale(0.56);
                gameObjects.hintCountText.setScale(0.56);
            }
        }
    }
}

let isHintOnCooldown = false;

function onHintButtonPressed() {
    if (isHintOnCooldown) return;

    let currentRoomIndex = (typeof gameObjects !== "undefined" && gameObjects && gameObjects.exhibit)
        ? gameObjects.exhibit.currentScene
        : 1;

    if (isHintDisabledForRoom(currentRoomIndex)) {
        console.log(`Hint button is disabled in room ${currentRoomIndex}.`);
        return;
    }

    isHintOnCooldown = true;
    setTimeout(() => {
        isHintOnCooldown = false;
    }, 1200);
    let currentHints = (typeof gameVars !== "undefined" && gameVars.hintCount !== undefined) ? gameVars.hintCount : 1;
    if (currentHints >= 1) {
        updateHintCounter(currentHints - 1);
    }
    // Out of free hints: still show one (there are no rewarded ads to earn more).
    showHint();
}
