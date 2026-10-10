function setupRoomFlower1(scene, roomIndex, roomContainer) {
    gameObjects.exhibit.setBackgroundAtIndex(roomIndex, 'bgs', 'bg9');
    let flower = scene.add.image(300, gameVars.height - 28, 'misc', 'flower1');
    flower.setOrigin(0.5, 1);
    roomContainer.add(flower);

    let subscription2;
    subscription2 = messageBus.subscribe('exhibitMove', (index) => {
        if (index === roomIndex) {
            subscription2.unsubscribe();
            globalScene.tweens.add({
                targets: gameObjects.generalDarkness,
                alpha: 0.22,
                duration: 4000
            });
        }
    });
}

function setupRoomFlower2(scene, roomIndex, roomContainer) {
    gameObjects.exhibit.setBackgroundAtIndex(roomIndex, 'bgs', 'bg9');
    let flower = scene.add.image(300, gameVars.height - 28, 'misc', 'flower2');
    flower.setOrigin(0.5, 1);
    roomContainer.add(flower);

    let subscription;
    subscription = messageBus.subscribe('exhibitMoveComplete', (index) => {
        if (index === roomIndex) {
            subscription.unsubscribe();
            gameObjects.exhibit.removeIndex(roomIndex - 1);
        }
    });

    let subscription2;
    subscription2 = messageBus.subscribe('exhibitMove', (index) => {
        if (index === roomIndex) {
            subscription2.unsubscribe();
            globalScene.tweens.add({
                targets: gameObjects.generalDarkness,
                alpha: 0.35,
                duration: 4000
            });
        }
    });
}

function setupRoomFlower3(scene, roomIndex, roomContainer) {
    gameObjects.exhibit.setBackgroundAtIndex(roomIndex, 'bgs', 'bg9');
    let flower = scene.add.image(300, gameVars.height - 28, 'misc', 'flower3');
    flower.setOrigin(0.5, 1);
    roomContainer.add(flower);

    let subscription;
    subscription = messageBus.subscribe('exhibitMoveComplete', (index) => {
        if (index === roomIndex) {
            subscription.unsubscribe();
            gameObjects.exhibit.removeIndex(roomIndex - 1);
        }
    });

    let subscription2;
    subscription2 = messageBus.subscribe('exhibitMove', (index) => {
        if (index === roomIndex) {
            subscription2.unsubscribe();
            globalScene.tweens.add({
                targets: gameObjects.generalDarkness,
                alpha: 0.48,
                duration: 4000
            });
        }
    });
}

function setupRoomFlower4(scene, roomIndex, roomContainer) {
    gameObjects.exhibit.setBackgroundAtIndex(roomIndex, 'bgs', 'bg9');
    let flower = scene.add.image(300, gameVars.height - 28, 'misc', 'flower4');
    flower.setOrigin(0.5, 1);
    roomContainer.add(flower);

    let subscription;
    subscription = messageBus.subscribe('exhibitMoveComplete', (index) => {
        if (index === roomIndex) {
            subscription.unsubscribe();
            gameObjects.exhibit.removeIndex(roomIndex - 1);
        }
    });

    let subscription2;
    subscription2 = messageBus.subscribe('exhibitMove', (index) => {
        if (index === roomIndex) {
            subscription2.unsubscribe();
            globalScene.tweens.add({
                targets: gameObjects.generalDarkness,
                alpha: 0.6,
                duration: 4000
            });
        }
    });
}

function setupRoomFlower5(scene, roomIndex, roomContainer) {
    gameObjects.exhibit.setBackgroundAtIndex(roomIndex, 'bgs', 'bg9');
    let flower = scene.add.image(300, gameVars.height - 28, 'misc', 'flower5');
    flower.setOrigin(0.5, 1);
    roomContainer.add(flower);

    let subscription;
    subscription = messageBus.subscribe('exhibitMoveComplete', (index) => {
        if (index === roomIndex) {
            subscription.unsubscribe();
            gameObjects.exhibit.removeIndex(roomIndex - 1);
        }
    });

    let subscription2;
    subscription2 = messageBus.subscribe('exhibitMove', (index) => {
        if (index === roomIndex) {
            subscription2.unsubscribe();
            roomFlower5ArmJackLights();

            // Cinematic half: the lights swell up out of a burst of static.
            // roomFlower5ArmJackLights has already left them at their settled
            // values, so wind them back and tween to it.
            let lights = gameObjects.roomJackObjs.lights;
            lights.alpha = 0.6;
            lights.scaleX = 2.1;
            lights.scaleY = 2.1;
            if (typeof showStaticLite === "function") {
                showStaticLite(6, 12, 2.5, 0.4);
            }
            if (typeof showStaticRand === "function") {
                showStaticRand(2);
            }
            globalScene.tweens.add({
                targets: lights,
                alpha: 0.7,
                scaleX: 2,
                scaleY: 2,
                duration: 3000
            });
        }
    });

    registerRoomSaveState(roomIndex, {
        getStage: roomFlower5GetSaveStage,
        setStage: roomFlower5SetSaveStage
    });
}

// ======================================== save state (last flower room) ======
//
// Mr. Jack's lights do not belong to Mr. Jack: they are created here, the first
// time the player reaches the last flower room, and added to his container.
// Nothing in roomjack.js ever makes them.
//
// That matters after a reload, because his horror sequences dereference them
// freely — resetJackLights() reads lights.x/y/alpha, and several beats do
// `lights.alpha *= 2`. With this subscriber unfired, roomJackObjs.lights is
// undefined and the lights2 visual simply never appears.

var ROOM_FLOWER5_STAGE_NONE = 0;
var ROOM_FLOWER5_STAGE_ENTERED = 1; // player has reached the last flower room

function roomFlower5GetSaveStage() {
    return (gameObjects.roomJackObjs && gameObjects.roomJackObjs.lightsReady)
        ? ROOM_FLOWER5_STAGE_ENTERED
        : ROOM_FLOWER5_STAGE_NONE;
}

function roomFlower5SetSaveStage(stage) {
    if (stage) roomFlower5ArmJackLights();
}

// The durable half of arriving at the last flower room: Jack's lights exist
// from here on, his room stays visible from down the corridor, and the corridor
// darkness is gone for good. No static, no fade — the live path adds those.
//
// Idempotent: safe if the lights already exist.
function roomFlower5ArmJackLights() {
    if (typeof gameVarsTemp !== "undefined") {
        gameVarsTemp.keepJackVisible = true;
        gameVarsTemp.startDarkFlicker = false;
    }
    let j = gameObjects.roomJackObjs;
    if (!j) return;
    j.lightsReady = true;
    if (!saveAlive(j.lights)) {
        j.lights = globalScene.add.image(0, gameVars.halfHeight, 'roomJack', 'lights2');
        j.roomContainer.add(j.lights);
    }
    // Settled values, i.e. the far end of the live fade-in.
    j.lights.scaleX = 2;
    j.lights.scaleY = 2;
    j.lights.alpha = 0.7;

    if (gameObjects.generalDarkness) {
        gameObjects.generalDarkness.alpha = 0;
        gameObjects.generalDarkness.scaleX = 0;
        gameObjects.generalDarkness.scaleY = 0;
    }
    // Swaps the hint/mute button art; idempotent, so safe to republish.
    if (typeof messageBus !== "undefined" && messageBus) {
        messageBus.publish("switchToSet2Buttons");
    }
}