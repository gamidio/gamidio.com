/**
 * @fileoverview Button component and ButtonManager for UI interactions
 */

const NORMAL = "normal";
const HOVER = "hover";
const PRESS = "press";
const DISABLE = "disable";
const ButtonState = {
    NORMAL: "normal",
    HOVER: "hover",
    PRESS: "press",
    DISABLE: "disable"
};

/** Shared rectangle for hit detection to avoid GC pressure */
const hitBoundsRect = new Phaser.Geom.Rectangle();
class InternalButtonManager {
    constructor() {
        this.buttonList = [];
        this.lastHovered = null;
        this.lastClickedButton = null;
        this.draggedObj = null;
        this.isBlocked = false;
    }
    setBlocked(val) {
        this.isBlocked = val;
        if (val && this.lastHovered) {
            this.lastHovered.onHoverOut();
            this.lastHovered = null;
        }
    }
    updateHover(mouseX, mouseY) {
        if (this.isBlocked) return;
        let list =
            typeof gameObjects !== "undefined" && gameObjects.buttonList ? gameObjects.buttonList : this.buttonList;
        let currentHovered = null;
        let newHovered = null;
        for (let i = list.length - 1; i >= 0; i--) {
            let buttonObj = list[i];
            if (buttonObj && buttonObj.checkCoordOver(mouseX, mouseY)) {
                if (this.lastHovered !== buttonObj) {
                    newHovered = buttonObj;
                }
                currentHovered = buttonObj;
                break;
            }
        }
        let oldHovered = this.lastHovered;
        this.lastHovered = currentHovered;
        if (oldHovered && oldHovered !== currentHovered) {
            oldHovered.onHoverOut();
        }
        if (newHovered) {
            newHovered.onHover();
        }
    }
    addToButtonList(button) {
        if (!this.buttonList.includes(button)) {
            this.buttonList.push(button);
        }
        if (typeof gameObjects !== "undefined" && gameObjects.buttonList) {
            if (!gameObjects.buttonList.includes(button)) {
                gameObjects.buttonList.push(button);
            }
        }
    }
    getLastClickedButton() {
        return this.lastClickedButton;
    }
    removeButton(button) {
        let index = this.buttonList.indexOf(button);
        if (index !== -1) {
            this.buttonList.splice(index, 1);
        }
        if (typeof gameObjects !== "undefined" && gameObjects.buttonList) {
            let idx = gameObjects.buttonList.indexOf(button);
            if (idx !== -1) {
                gameObjects.buttonList.splice(idx, 1);
            }
        }
    }
    cancelClick() {
        this.lastClickedButton = null;
    }
    bringButtonToTop(button) {
        this.removeButton(button);
        this.addToButtonList(button);
    }
    getDraggedObj() {
        return typeof gameObjects !== "undefined" && gameObjects.draggedObj ? gameObjects.draggedObj : this.draggedObj;
    }
    setDraggedObj(newObj = null) {
        this.draggedObj = newObj;
        if (typeof gameObjects !== "undefined") {
            gameObjects.draggedObj = newObj;
        }
    }
    isAnyButtonHovered(x, y) {
        let list =
            typeof gameObjects !== "undefined" && gameObjects.buttonList ? gameObjects.buttonList : this.buttonList;
        for (let i = list.length - 1; i >= 0; i--) {
            const btn = list[i];
            if (btn && btn.checkCoordOver(x, y)) return true;
        }
        return false;
    }
    getHoveredButton(x, y) {
        let list =
            typeof gameObjects !== "undefined" && gameObjects.buttonList ? gameObjects.buttonList : this.buttonList;
        for (let i = list.length - 1; i >= 0; i--) {
            const btn = list[i];
            if (btn && btn.checkCoordOver(x, y)) return btn;
        }
        return null;
    }
}
const buttonManager = new InternalButtonManager();
class Button {
    constructor(e, s, t, i, a, r, h, o = false) {
        let scene;
        let container;
        let onMouseUpFunc;
        let normal;
        let hover;
        let press;
        let disable;
        let isDraggable;
        let onHoverFunc;
        let onDropFunc;
        let onMouseDownFunc;
        let onHoverOutFunc;
        let cursorInteractive;
        if (e && typeof e === "object" && !e.add && (e.normal || e.ref)) {
            // Form C: single object parameter
            let data = e;
            scene =
                data.scene ||
                (typeof globalScene !== "undefined"
                    ? globalScene
                    : typeof PhaserScene !== "undefined"
                      ? PhaserScene
                      : null);
            container = data.container || null;
            onMouseUpFunc = data.onMouseUp;
            onMouseDownFunc = data.onMouseDown;
            onHoverFunc = data.onHover;
            onHoverOutFunc = data.onHoverOut;
            onDropFunc = data.onDrop;
            normal = data.normal || data;
            hover = data.hover;
            press = data.press;
            disable = data.disable;
            isDraggable = data.isDraggable || false;
            cursorInteractive = data.cursorInteractive;
        } else {
            scene =
                e ||
                (typeof globalScene !== "undefined"
                    ? globalScene
                    : typeof PhaserScene !== "undefined"
                      ? PhaserScene
                      : null);
            if (!t && !i && s && typeof s === "object") {
                // Form B: new Button(scene, { container, ... })
                let config = s;
                container = config.container || null;
                onMouseUpFunc = config.onMouseUp;
                onMouseDownFunc = config.onMouseDown;
                onHoverFunc = config.onHover;
                onHoverOutFunc = config.onHoverOut;
                onDropFunc = config.onDrop;
                normal = config.normal;
                hover = config.hover;
                press = config.press;
                disable = config.disable;
                isDraggable = config.isDraggable || false;
                cursorInteractive = config.cursorInteractive;
            } else {
                // Form A: positional arguments
                container = s || null;
                onMouseUpFunc = t;
                normal = i;
                hover = a;
                press = r;
                disable = h;
                isDraggable = o;
            }
        }
        this.scene = scene;
        this.state = NORMAL;
        this.normal = normal || {};
        this.hover = hover || this.normal;
        this.press = press || this.normal;
        this.disable = disable || this.normal;
        this.onMouseDownFunc = onMouseDownFunc || null;
        this.onMouseUpFunc = onMouseUpFunc || null;
        this.onHoverFunc = onHoverFunc || null;
        this.onHoverOutFunc = onHoverOutFunc || null;
        this.onDropFunc = onDropFunc || null;
        this.cursorInteractive = cursorInteractive;
        this.destructibles = [];
        this.bgSprite = null;
        this.imageRefs = {}; // Backwards-compatibility getter helper
        this.forceInvis = false;
        this.container = container;
        if (!container) this.noContainer = true;
        buttonManager.addToButtonList(this);
        this.depth = this.normal && this.normal.depth !== undefined ? this.normal.depth : 0;
        this.handlePreload();

        // Create the single backing sprite
        let initialRef = this.normal ? this.normal.ref : null;
        if (initialRef && this.scene) {
            let initX = this.normal.x !== undefined ? this.normal.x : 0;
            let initY = this.normal.y !== undefined ? this.normal.y : 0;
            if (this.normal.atlas) {
                this.bgSprite = this.scene.add.image(initX, initY, this.normal.atlas, initialRef);
            } else {
                this.bgSprite = this.scene.add.image(initX, initY, initialRef);
            }
            if (this.container) {
                this.container.add(this.bgSprite);
            }
            this.bgSprite.setDepth(this.depth);
            if (this.normal.origin) {
                this.bgSprite.setOrigin(this.normal.origin.x, this.normal.origin.y);
            }
        }
        this.isDraggable = isDraggable || false;
        this.hoverWhileDisabled = false;
        this._container = container;
        this.setState(NORMAL);
    }
    setState(newState) {
        if (this.isDestroyed || !this.bgSprite || !this.bgSprite.scene) return;
        if (
            newState === NORMAL &&
            this.checkCoordOver(
                typeof gameVars !== "undefined" ? gameVars.mouseposx : 0,
                typeof gameVars !== "undefined" ? gameVars.mouseposy : 0
            )
        ) {
            if (buttonManager.lastHovered === this) {
                newState = HOVER;
            }
        }
        let stateData;
        switch (newState) {
            case NORMAL:
                stateData = this.normal;
                break;
            case HOVER:
                stateData = this.hover;
                break;
            case PRESS:
                stateData = this.press;
                break;
            case DISABLE:
                stateData = this.disable;
                break;
            default:
                console.error("Invalid state ", newState);
                return;
        }
        this.state = newState;
        if (!stateData) return;
        let targetRef = stateData.ref || (this.normal ? this.normal.ref : null);
        let targetAtlas = stateData.atlas || (this.normal ? this.normal.atlas : null);
        if (targetRef) {
            if (targetAtlas) {
                if (this.scene.textures && this.scene.textures.exists(targetAtlas)) {
                    this.bgSprite.setTexture(targetAtlas, targetRef);
                } else if (this.scene.textures && this.scene.textures.exists(targetRef)) {
                    this.bgSprite.setTexture(targetRef);
                }
            } else {
                if (this.scene.textures && this.scene.textures.exists(targetRef)) {
                    this.bgSprite.setTexture(targetRef);
                }
            }
        }

        // Unlike the old per-state-sprite implementation, there is only ONE
        // bgSprite shared by every state, so it already holds whatever value was
        // last legitimately set on it (construction, setPos/setScale, or a live
        // tween) - the same guarantee `rotation` and `origin` below already rely
        // on. A state that doesn't define a property is left alone rather than
        // reset to `this.normal`'s stored value: that value is a static snapshot
        // that tweenScale()/tweenToPos() never update, so falling back to it used
        // to permanently overwrite any in-progress or completed tween the moment
        // the button was hovered, pressed, or disabled.
        if (stateData.x !== undefined) {
            this.bgSprite.x = stateData.x;
            if (this.text) {
                this.updateTextPosition();
            }
        }
        if (stateData.y !== undefined) {
            this.bgSprite.y = stateData.y;
            if (this.text) {
                this.updateTextPosition();
            }
        }
        if (stateData.alpha !== undefined) {
            this.bgSprite.alpha = stateData.alpha;
            if (this.text) this.text.alpha = stateData.alpha;
        }
        if (stateData.scaleX !== undefined) {
            this.bgSprite.scaleX = stateData.scaleX;
        }
        if (stateData.scaleY !== undefined) {
            this.bgSprite.scaleY = stateData.scaleY;
        }
        if (stateData.origin !== undefined) {
            this.setOrigin(stateData.origin.x, stateData.origin.y);
        }
        if (stateData.rotation !== undefined) {
            this.setRotation(stateData.rotation);
        }
        this.currImageRef = targetRef;
    }
    handlePreload() {
        // Texture references initialized dynamically
    }
    checkCoordOver(valX, valY) {
        if (this.isDestroyed || !this.bgSprite || !this.bgSprite.visible || this.bgSprite.alpha <= 0) return false;
        if (this.state === DISABLE && !this.hoverWhileDisabled) {
            return false;
        }
        if (this.hitArea) {
            if (
                valX < this.hitArea.x ||
                valX > this.hitArea.x + this.hitArea.w ||
                valY < this.hitArea.y ||
                valY > this.hitArea.y + this.hitArea.h
            ) {
                return false;
            }
        }
        let currImage = this.bgSprite;
        if (!currImage) return false;

        // A hidden parent container is an off-screen room, so nothing inside it
        // can be under the cursor. Container.visible does not propagate down to
        // child.visible, so the sprite check above does not cover this. Testing
        // it here also skips the getBounds() parent-matrix walk - which runs for
        // every button, every frame, from buttonManager.updateHover.
        let parent = currImage.parentContainer;
        while (parent) {
            if (!parent.visible) return false;
            parent = parent.parentContainer;
        }
        let scrollFactorX =
            this.scrollFactorX !== undefined
                ? this.scrollFactorX
                : this.normal && this.normal.scrollFactorX !== undefined
                  ? this.normal.scrollFactorX
                  : 1;
        let scrollFactorY =
            this.scrollFactorY !== undefined
                ? this.scrollFactorY
                : this.normal && this.normal.scrollFactorY !== undefined
                  ? this.normal.scrollFactorY
                  : 1;
        let x = valX;
        let y = valY;
        if (this.isUI || scrollFactorX === 0) {
            if (typeof gameVars !== "undefined" && undefined !== gameVars.mouseposx) {
                x = gameVars.mouseposx;
                y = gameVars.mouseposy;
            }
        }
        currImage.getBounds(hitBoundsRect);
        if (x < hitBoundsRect.x || x > hitBoundsRect.right || y < hitBoundsRect.y || y > hitBoundsRect.bottom) {
            return false;
        }
        return true;
    }
    onHover() {
        if (this.isDestroyed) return;
        if (this.state === NORMAL) {
            this.setState(HOVER);
        }
        if (this.onHoverFunc) {
            this.onHoverFunc();
        }
    }
    onHoverOut() {
        if (this.isDestroyed) return;
        if (this.onHoverOutFunc) {
            this.onHoverOutFunc();
        }
        if (this.state !== DISABLE) {
            this.setState(NORMAL);
        }
    }
    onMouseDown(x, y) {
        if (this.isDestroyed) return;
        if (this.state !== DISABLE) {
            this.setState(PRESS);
            if (this.onMouseDownFunc) {
                this.onMouseDownFunc(x, y);
            }
            if (this.isDraggable) {
                if (!this.isDragged) {
                    if (typeof gameVars !== "undefined") {
                        this.setPos(gameVars.mouseposx - gameVars.halfWidth, gameVars.mouseposy);
                    }
                    this.isDragged = true;
                    let oldDraggedObj = buttonManager.getDraggedObj();
                    if (oldDraggedObj && oldDraggedObj.onDrop) {
                        oldDraggedObj.onDrop(x, y);
                    }
                    buttonManager.setDraggedObj(this);
                }
            }
        }
    }
    onMouseUp(x, y) {
        if (this.isDestroyed) return;
        if (this.state === PRESS) {
            this.setState(HOVER);
            if (this.onMouseUpFunc) {
                this.onMouseUpFunc(x, y);
            }
        }
    }
    onDrop(x, y) {
        if (this.isDestroyed) return;
        this.isDragged = false;
        buttonManager.setDraggedObj(null);
        if (this.onDropFunc) {
            this.onDropFunc(x, y);
        }
    }
    setVisible(vis = true) {
        if (this.isDestroyed || !this.bgSprite) return this;
        this.bgSprite.setVisible(vis);
        this.forceInvis = !vis;
        if (this.text) {
            this.text.setVisible(vis);
        }
        return this;
    }
    disappear() {
        this.setVisible(false);
        this.state = DISABLE;
    }
    reappear() {
        this.setVisible(true);
        this.setState(NORMAL);
    }
    getPosX() {
        return this.getXPos();
    }
    getPosY() {
        return this.getYPos();
    }
    getXPos() {
        return this.bgSprite ? this.bgSprite.x : this.normal ? this.normal.x || 0 : 0;
    }
    getYPos() {
        return this.bgSprite ? this.bgSprite.y : this.normal ? this.normal.y || 0 : 0;
    }
    get x() {
        return this.getXPos();
    }
    set x(value) {
        this.setPos(value, undefined);
    }
    get y() {
        return this.getYPos();
    }
    set y(value) {
        this.setPos(undefined, value);
    }
    setX(x) {
        this.setPos(x, undefined);
        return this;
    }
    setY(y) {
        this.setPos(undefined, y);
        return this;
    }
    getScaleX() {
        return this.bgSprite ? this.bgSprite.scaleX : 1;
    }
    getScaleY() {
        return this.bgSprite ? this.bgSprite.scaleY : 1;
    }
    get scaleX() {
        return this.getScaleX();
    }
    set scaleX(value) {
        this.setScale(value, this.scaleY);
    }
    get scaleY() {
        return this.getScaleY();
    }
    set scaleY(value) {
        this.setScale(this.scaleX, value);
    }
    getWidth() {
        if (!this.bgSprite) return 0;
        return this.bgSprite.width * this.bgSprite.scaleX;
    }
    getHeight() {
        if (!this.bgSprite) return 0;
        return this.bgSprite.height * this.bgSprite.scaleY;
    }
    getState() {
        return this.state;
    }
    getIsDragged() {
        return this.isDragged && this.state !== DISABLE;
    }
    getIsInteracted() {
        return this.state === HOVER || this.isDragged || this.state === PRESS;
    }
    getIsHovered() {
        return this.state === HOVER;
    }
    setOnMouseDownFunc(func) {
        this.onMouseDownFunc = func;
    }
    setOnMouseUpFunc(func) {
        this.onMouseUpFunc = func;
    }
    setOnHoverFunc(func) {
        this.onHoverFunc = func;
    }
    setOnHoverOutFunc(func) {
        this.onHoverOutFunc = func;
    }
    setNormalRef(ref) {
        if (this.normal) this.normal.ref = ref;
        if (this.state === NORMAL) {
            this.setState(NORMAL);
        }
    }
    setHoverRef(ref) {
        if (this.hover) this.hover.ref = ref;
        if (this.state === HOVER) {
            this.setState(HOVER);
        }
    }
    setHoverAlpha(alpha) {
        if (this.hover) this.hover.alpha = alpha;
    }
    setPressRef(ref) {
        if (this.press) this.press.ref = ref;
        if (this.state === PRESS) {
            this.setState(PRESS);
        }
    }
    setDisableRef(ref) {
        if (this.disable) this.disable.ref = ref;
        if (this.state === DISABLE) {
            this.setState(DISABLE);
        }
    }
    setAllRef(ref) {
        if (this.normal) this.normal.ref = ref;
        if (this.hover) this.hover.ref = ref;
        if (this.press) this.press.ref = ref;
        if (this.disable) this.disable.ref = ref;
        this.setState(this.state);
    }
    setPos(x, y) {
        if (this.isDestroyed || !this.bgSprite) return this;
        if (x !== undefined) {
            if (this.normal) this.normal.x = x;
            if (this.hover) this.hover.x = x;
            if (this.press) this.press.x = x;
            if (this.disable) this.disable.x = x;
            this.bgSprite.x = x;
        }
        if (y !== undefined) {
            if (this.normal) this.normal.y = y;
            if (this.hover) this.hover.y = y;
            if (this.press) this.press.y = y;
            if (this.disable) this.disable.y = y;
            this.bgSprite.y = y;
        }
        if (this.text) {
            this.updateTextPosition();
        }
        return this;
    }
    setPosition(x, y) {
        return this.setPos(x, y);
    }
    setScrollFactor(x, y) {
        if (y === undefined) y = x;
        this.scrollFactorX = x;
        this.scrollFactorY = y;
        if (x === 0 && y === 0) {
            this.isUI = true;
        }
        if (this.bgSprite) {
            this.bgSprite.setScrollFactor(x, y);
        }
        if (this.text) {
            this.text.setScrollFactor(x, y);
        }
        return this;
    }
    setAlpha(alpha = 1) {
        if (this.isDestroyed || !this.bgSprite) return this;
        this.bgSprite.alpha = alpha;
        if (this.text) {
            this.text.setAlpha(alpha);
        }
        return this;
    }
    getAlpha() {
        return this.bgSprite ? this.bgSprite.alpha : 1;
    }
    get alpha() {
        return this.getAlpha();
    }
    set alpha(value) {
        this.setAlpha(value);
    }
    setScale(scaleX, scaleY) {
        if (this.isDestroyed || !this.bgSprite) return this;
        if (scaleY === undefined) scaleY = scaleX;
        if (this.normal) {
            this.normal.scaleX = scaleX;
            this.normal.scaleY = scaleY;
        }
        if (this.hover) {
            this.hover.scaleX = scaleX;
            this.hover.scaleY = scaleY;
        }
        if (this.press) {
            this.press.scaleX = scaleX;
            this.press.scaleY = scaleY;
        }
        if (this.disable) {
            this.disable.scaleX = scaleX;
            this.disable.scaleY = scaleY;
        }
        this.bgSprite.setScale(scaleX, scaleY);
        return this;
    }
    setOrigin(origX, origY) {
        if (origY === undefined) origY = origX;
        if (this.normal)
            this.normal.origin = {
                x: origX,
                y: origY
            };
        if (this.hover)
            this.hover.origin = {
                x: origX,
                y: origY
            };
        if (this.press)
            this.press.origin = {
                x: origX,
                y: origY
            };
        if (this.disable)
            this.disable.origin = {
                x: origX,
                y: origY
            };
        if (this.bgSprite) {
            this.bgSprite.setOrigin(origX, origY);
        }
        if (this.text) {
            this.updateTextPosition();
        }
        return this;
    }
    setDepth(depth = 0) {
        this._depth = depth;
        if (this.normal) this.normal.depth = depth;
        if (this.hover) this.hover.depth = depth;
        if (this.press) this.press.depth = depth;
        if (this.disable) this.disable.depth = depth;
        if (this.bgSprite) {
            this.bgSprite.setDepth(depth);
        }
        if (this.text) {
            this.text.setDepth(depth + 1);
        }
        return this;
    }
    getDepth() {
        return this.bgSprite
            ? this.bgSprite.depth
            : this._depth !== undefined
              ? this._depth
              : this.normal
                ? this.normal.depth || 0
                : 0;
    }
    get depth() {
        return this.getDepth();
    }
    set depth(value) {
        this.setDepth(value);
    }
    setRotation(rot) {
        if (this.isDestroyed || !this.bgSprite) return;
        if (this.normal) this.normal.rotation = rot;
        if (this.hover) this.hover.rotation = rot;
        if (this.press) this.press.rotation = rot;
        if (this.disable) this.disable.rotation = rot;
        this.bgSprite.setRotation(rot);
        if (this.text) {
            this.text.setRotation(rot);
        }
    }
    get rotation() {
        return this.normal ? this.normal.rotation || 0 : 0;
    }
    set rotation(value) {
        this.setRotation(value);
    }
    bringToTop() {
        if (this.container && this.bgSprite) {
            this.container.bringToTop(this.bgSprite);
            if (this.text) this.container.bringToTop(this.text);
        }
    }
    tweenScale(e) {
        if (this.bgSprite && this.scene && this.scene.tweens) {
            let targets = [this.bgSprite];
            if (this.text) targets.push(this.text);
            // Kept on the button, NOT in gameVarsTemp.updateTextAnim.
            //
            // That global slot belongs to the info text: updateInfoText and
            // updateInfoTextSoft (helpermain.js) both .stop() whatever is in it
            // before starting their own. Parking a button's tween there meant
            // any info-text message cancelled it mid-flight, and a stopped
            // Phaser chain never fires onComplete — so tweens that fade a
            // button out and destroy it in onComplete left it frozen on screen,
            // still swallowing every click.
            this.currentTween = this.scene.tweens.chain({
                targets: targets,
                tweens: [e]
            });
        }
    }
    tweenToPos(x, y, duration, ease, onUpdate) {
        if (this.isDestroyed || !this.bgSprite || !this.scene || !this.scene.tweens) return;
        let tweenObj = {
            targets: this.bgSprite,
            ease: ease,
            duration: duration,
            onUpdate: onUpdate,
            onComplete: () => {
                this.setPos(x, y);
            }
        };
        if (x !== undefined) tweenObj.x = x;
        if (y !== undefined) tweenObj.y = y;
        this.scene.tweens.add(tweenObj);
    }
    updateTextPosition() {
        if (!this.text || !this.bgSprite) return;
        const spr = this.bgSprite;
        const width = spr.width * spr.scaleX;
        const height = spr.height * spr.scaleY;
        const offsetX = (0.5 - spr.originX) * width;
        const offsetY = (0.5 - spr.originY) * height;
        this.text.x = spr.x + offsetX + (this.text.offsetX || 0);
        this.text.y = spr.y + offsetY + (this.text.offsetY || 0);
    }
    addText(text, font) {
        let d = this.depth ? this.depth + 1 : 1;
        this.text = this.scene.add
            .text(this.getXPos(), this.getYPos(), text, font)
            .setAlpha(this.getAlpha())
            .setOrigin(0.5, 0.5)
            .setDepth(d);
        if (this._mask) this.text.setMask(this._mask);
        if (this.container) this.container.add(this.text);
        return this.text;
    }
    getBounds(output) {
        if (this.isDestroyed || !this.bgSprite) return output || new Phaser.Geom.Rectangle();
        return this.bgSprite.getBounds(output);
    }
    getSprite() {
        return this.bgSprite;
    }
    setHitArea(x, y, w, h) {
        this.hitArea = {
            x,
            y,
            w,
            h
        };
        return this;
    }
    clearHitArea() {
        this.hitArea = null;
        return this;
    }
    runFuncOnImage(e) {
        if (this.bgSprite) e(this.bgSprite);
    }
    update() {}
    destroy() {
        this.isDestroyed = true;
        buttonManager.removeButton(this);
        if (this.bgSprite) {
            this.bgSprite.destroy();
            this.bgSprite = null;
        }
        if (this.text) {
            this.text.destroy();
            this.text = null;
        }
    }
}
