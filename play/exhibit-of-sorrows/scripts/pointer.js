function onPointerDown(e) {
    gameVars.mousedown = true;
    let s = mouseToHand(e.x, e.y);
    gameVars.mouseposx = s.x;
    gameVars.mouseposy = s.y;
    let a = s.x - gameObjects.exhibCntr.goalOffsetX;
    let o = s.y - gameObjects.exhibCntr.goalOffsetY;
    gameVars.lastmousedown.x = s.x;
    gameVars.lastmousedown.y = s.y;
    gameObjects.hand.setPos(s.x, s.y);
    gameObjects.lastObjMouseDowned = null;
    for (let e = gameObjects.buttonList.length - 1; e >= 0; e--) {
        let s = gameObjects.buttonList[e];
        if (s.checkCoordOver(a, o)) {
            s.onMouseDown();
            gameObjects.lastObjMouseDowned = s;
            break;
        }
    }
}
function onPointerMove(e) {
    let s = mouseToHand(e.x, e.y);
    if (
        ((gameVars.mouseposx = s.x),
        (gameVars.mouseposy = s.y),
        gameObjects.hand.setPos(s.x, s.y),
        gameObjects.maskImage && ((gameObjects.maskImage.goalX = s.x), (gameObjects.maskImage.goalY = s.y)),
        gameObjects.draggedObj && gameVars.mousedown)
    ) {
        let e = gameVars.mouseposx - gameVars.lastmousedown.x;
        let s = gameVars.mouseposy - gameVars.lastmousedown.y;
        if (Math.sqrt(e * e + s * s) >= 3) {
            gameObjects.draggedObj.setPos(gameVars.mouseposx - gameVars.halfWidth, gameVars.mouseposy);
        }
    }
    gameObjects.exhibCntr.goalOffsetX = -0.05 * (e.x - gameVars.halfWidth);
    gameObjects.exhibCntr.goalOffsetY = -0.03 * (e.y - gameVars.halfHeight);
    gameObjects.loadingCntr.goalOffsetX = gameObjects.exhibCntr.goalOffsetX;
    gameObjects.loadingCntr.goalOffsetY = gameObjects.exhibCntr.goalOffsetY;
    let a = s.x - gameObjects.exhibCntr.goalOffsetX;
    let o = s.y - gameObjects.exhibCntr.goalOffsetY;
    if (typeof buttonManager !== "undefined") {
        buttonManager.updateHover(a, o);
    }
}
function onPointerUp(e) {
    gameVars.mousedown = false;
    let s = mouseToHand(e.x, e.y);
    gameVars.mouseposx = s.x;
    gameVars.mouseposy = s.y;
    let a = s.x - gameObjects.exhibCntr.goalOffsetX;
    let o = s.y - gameObjects.exhibCntr.goalOffsetY;
    let t = gameObjects.lastObjMouseDowned;
    if (t && !t.isDestroyed && t.checkCoordOver(a, o)) {
        t.onMouseUp();
    }
    gameObjects.lastObjMouseDowned = null;
    if (typeof buttonManager !== "undefined") {
        buttonManager.cancelClick();
    }
    if (gameObjects.draggedObj && gameObjects.draggedObj.onDrop) {
        gameObjects.draggedObj.onDrop();
    }
    messageBus.publish("mouseUp");
}
