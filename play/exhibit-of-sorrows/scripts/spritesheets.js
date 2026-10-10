// Loads a sprite sheet from a folder of individual PNGs in raw/.
//
// Each sheet is one texture (e.g. "roomJack") whose frames are the PNGs in its
// folder, named after the file without ".png". The frame list comes from
// scripts/spritemanifest.js, generated from raw/ (see tools/sprite-manifest.js).
//
// To change a sprite, edit its PNG (any size) and refresh. To add one, drop the
// PNG into the folder; the dev server and the build pick it up automatically.
//
// If some frames fail to load for good (after the loader's retries), the sheet is
// still built, with a transparent stand-in for each missing frame, so the rest of
// the sheet works and nothing shows a wrong frame. If every frame fails, no
// texture is made, and retryFailedSpriteSheets() can load the sheet again later.

// key -> { folder, frames, imageKeys, loaded, failed, listeners, done }
const spriteSheetState = {};

function loadSpriteSheet(scene, key, folder) {
    // Textures outlive a scene restart (replay), and sprites may already be using
    // this one, so keep it rather than rebuilding it
    if (scene.textures.exists(key)) return;
    const frames = SPRITE_MANIFEST[folder];
    if (!frames || frames.length === 0) {
        console.error("loadSpriteSheet: no PNGs listed for " + folder + " (" + key + ")");
        return;
    }
    const state = {
        folder: folder,
        frames: frames,
        imageKeys: frames.map((name) => spriteFrameImageKey(key, name)),
        loaded: new Set(),
        failed: new Set(),
        listeners: [],
        done: false
    };
    spriteSheetState[key] = state;
    frames.forEach((name, i) => {
        const imageKey = state.imageKeys[i];
        const event = "filecomplete-image-" + imageKey;
        const listener = () => {
            state.loaded.add(imageKey);
            settleSpriteSheet(scene, key);
        };
        state.listeners.push([event, listener]);
        scene.load.once(event, listener);
        scene.load.image(imageKey, folder + "/" + name + ".png");
    });
}

function spriteFrameImageKey(sheetKey, frameName) {
    return "__sprite_" + sheetKey + "/" + frameName;
}

// Called by main.js once the loader has given up on one of a sheet's frames
function onSpriteFramePermanentlyFailed(scene, imageKey) {
    for (const key in spriteSheetState) {
        const state = spriteSheetState[key];
        if (!state.done && state.imageKeys.includes(imageKey)) {
            state.failed.add(imageKey);
            settleSpriteSheet(scene, key);
            return;
        }
    }
}

function isSpriteFrameImageKey(key) {
    return key.startsWith("__sprite_");
}

// Builds the sheet once every frame has either loaded or failed for good
function settleSpriteSheet(scene, key) {
    const state = spriteSheetState[key];
    if (state.done || state.loaded.size + state.failed.size < state.frames.length) return;
    state.done = true;
    state.listeners.forEach(([event, listener]) => scene.load.off(event, listener));
    if (state.loaded.size === 0) {
        console.error("loadSpriteSheet: every frame of " + key + " failed to load (" + state.folder + ")");
        return;
    }
    if (state.failed.size > 0) {
        const names = state.frames.filter((name, i) => state.failed.has(state.imageKeys[i]));
        console.error("loadSpriteSheet: " + key + " is missing " + names.join(", ") + "; showing them as blank");
    }
    assembleSpriteSheet(scene, key, state);
}

// A shared transparent 1x1 image standing in for frames that failed to load
let transparentStandIn = null;
function getTransparentStandIn() {
    if (!transparentStandIn) {
        transparentStandIn = document.createElement("canvas");
        transparentStandIn.width = 1;
        transparentStandIn.height = 1;
    }
    return transparentStandIn;
}

// One texture with one source image per frame, each frame covering its whole image
function assembleSpriteSheet(scene, key, state) {
    const images = state.imageKeys.map((k) =>
        state.loaded.has(k) ? scene.textures.get(k).getSourceImage() : getTransparentStandIn()
    );
    const texture = scene.textures.create(key, images);
    state.frames.forEach((name, i) => texture.add(name, i, 0, 0, images[i].width, images[i].height));
    state.imageKeys.forEach((k) => {
        if (scene.textures.exists(k)) scene.textures.remove(k);
    });
}

// Sheets whose every frame failed have no texture; queue them to load again.
// Returns how many were queued. The caller starts the loader.
function retryFailedSpriteSheets(scene) {
    let queued = 0;
    for (const key in spriteSheetState) {
        const state = spriteSheetState[key];
        if (state.done && state.loaded.size === 0 && !scene.textures.exists(key)) {
            delete spriteSheetState[key];
            loadSpriteSheet(scene, key, state.folder);
            queued++;
        }
    }
    return queued;
}
