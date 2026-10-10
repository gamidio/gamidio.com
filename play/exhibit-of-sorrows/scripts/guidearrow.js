function initGuideIndicators(scene) {
    gameObjects.guideArrow = scene.add.image(0, -9999, "misc", "arrow");
    gameObjects.guideArrow.setOrigin(0.01, 0.5);
    gameObjects.guideArrowFat = scene.add.image(0, -9999, "misc", "arrowFat");
    gameObjects.guideArrowFat.setOrigin(0.01, 0.5);
    gameObjects.guideSparkle = scene.add.image(0, -999, "buttons", "sparkle");
    gameObjects.guideSparkle.animateState = "SHRINK";
    gameObjects.guideSparkle.rotation = -1;
    gameObjects.guideSparkle.counter = 0;
    gameObjects.guideSparkle.depth = 99999;
    addToUpdateFuncList(animateSparkle);
}
function updateGuideArrow(e, a, t = 0, r = 200) {
    gameObjects.guideArrow.x = e;
    gameObjects.guideArrow.y = a;
    gameObjects.guideArrow.rotation = t;
    gameObjects.guideArrow.scaleX = r / 200;
    gameObjects.guideArrow.scaleY = r / 200;
}
function updateGuideArrowFat(e, a, t = 0, r = 200) {
    gameObjects.guideArrowFat.x = e;
    gameObjects.guideArrowFat.y = a;
    gameObjects.guideArrowFat.rotation = t;
    gameObjects.guideArrowFat.scaleX = (0.95 * r) / 200;
    gameObjects.guideArrowFat.scaleY = (0.95 * r) / 200;
    gameDelay(() => {
        gameObjects.guideArrowFat.scaleX = (1.01 * r) / 200;
        gameObjects.guideArrowFat.scaleY = (1.01 * r) / 200;
        gameDelay(() => {
            gameObjects.guideArrowFat.scaleX = r / 200;
            gameObjects.guideArrowFat.scaleY = r / 200;
        }, 50);
    }, 50);
}
function addGuideArrowToContainer(scene) {
    scene.add(gameObjects.guideArrow);
}
function addGuideArrowFatToContainer(scene) {
    scene.add(gameObjects.guideArrowFat);
}
function updateSparklePos(e, a) {
    gameObjects.guideSparkle.x = e;
    gameObjects.guideSparkle.y = a;
    resetSparkle();
}
function resetSparkle() {
    gameObjects.guideSparkle.animateState = "PAUSE";
    gameObjects.guideSparkle.scaleX = 0;
    gameObjects.guideSparkle.scaleY = 0;
    gameObjects.guideSparkle.counter = 150;
}
function animateSparkle() {}
