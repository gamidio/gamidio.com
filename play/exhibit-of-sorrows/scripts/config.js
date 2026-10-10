// Central place for everything theme-related: text, fonts, credits and asset paths.
// Swapping the game's theme should mostly mean editing this file and the art/audio it points to.

const THEME = {
    font: "Times New Roman",

    title: "EXHIBIT OF SORROWS",
    loadingText: "LOADING",
    warningText: "Warning: Contains spooky and intense scenes",
    headphoneText: "For best experience, play with headphones",
    loadFailedText: "LOADING INTERRUPTED",
    loadFailedHint: "Network connection issue. Tap below to retry:",
    retryButtonText: "[ TAP TO RETRY LOADING ]",
    retryingText: "RETRYING LOAD...",
    // Shown in a corner if some effects still haven't loaded after retrying
    assetsMissingText: "Some effects didn't load.",
    assetsRetryText: "Retry",

    credits: [
        "Game by Maxim Tsai",
        "Art by Theresa Kao",
        "Special Helpers: @hby_stuff, Ester Tsai, Yuan Lin, Peikun Tsai"
    ],
    trivia: [
        "Random game trivia:",
        "",
        "- Engine used: Phaser 3",
        "- Development Time: 4 months",
        "- Number of Image Files: ~320",
        "- Number of Audio Files Files: ~105",
        "- Trickiest thing to draw: Jack in the Box's neck"
    ],
    thanksText: "Thank you for playing"
};

// Game resolution. All layout (gameVars.width/height/halfWidth/halfHeight) and the
// canvas size come from here. Backgrounds are drawn centered at native size, so make
// them larger than this by a margin (currently 1300x1000, i.e. 40px each side) to cover
// the mouse drift and sway.
const DISPLAY = {
    width: 1220,
    height: 920,
    // Width of the decorative hand borders beside the canvas, in game pixels
    borderWidth: 40
};

// The game refuses to run unless the page URL contains one of these.
const SITE_LOCK = {
    allowed: ["itch", "localhost", "127.0.0.1"],
    message: "is an invalid site.\n\nTry the game on itch.io!"
};

// Loaded before the loading screen appears (needed to draw it).
const PRELOAD_IMAGES = {
    whitePixel: "raw/standalone/white_pixel.png",
    blackPixel: "raw/standalone/black_pixel.png",
    darkBluePixel: "raw/standalone/dark_blue_pixel.png",
    hand: "raw/standalone/mouse.png",
    handPoint: "raw/standalone/mouse_point.png",
    funbox: "raw/standalone/funbox.png",
    funlid: "raw/standalone/funlid.png",
    popup: "raw/standalone/popup.png",
    headphones: "raw/standalone/headphones.png"
};

// Sprite sheets, loaded behind the loading bar before the start button appears.
// Each is a texture built from every PNG in its raw/ folder; a frame is named after
// its file without ".png" (e.g. raw/roomjack/doll.png is frame "doll" of roomJack).
const SPRITE_SHEETS = {
    menu: "raw/menu",
    loadingSS: "raw/loading",
    bgs: "raw/backgrounds",
    roomPump: "raw/roompump",
    roomFaucet: "raw/roomfaucet",
    roomHandy: "raw/roomhandy",
    roomStretch: "raw/roomstretch",
    roomJack: "raw/roomjack",
    roomClown: "raw/clown",
    buttons: "raw/buttons",
    misc: "raw/misc"
};

// Single images, loaded by path. Everything that isn't part of a sprite sheet
// lives in raw/standalone/ (including the page background and border images that
// index.html uses).

const IMAGES = {
    handPointBlood: "raw/standalone/mouse_point_blood.png",
    candleBright: "raw/standalone/candleBright.png",
    shinelight: "raw/standalone/shinelight.png",
    generalDim: "raw/standalone/generalDim.png",
    candleDark: "raw/standalone/candleDark.webp",
    redlight: "raw/standalone/redlight.png"
};

// Every audio key (early or deferred) becomes gameObjects.sounds[key], playable with playSound(key).
const AUDIO = {
    loadingMusic: "audio/loadingmusic.mp3",
    click1: "audio/click1.mp3",
    click2: "audio/click2.mp3",
    click3: "audio/click3.mp3",
    click4: "audio/click4.mp3",
    airpump: "audio/airpump.mp3",
    keyfound: "audio/keyfound.mp3",
    keyget: "audio/keyget.mp3",
    fan1: "audio/fan1.mp3",
    fan2: "audio/fan2.mp3",
    gladiator0: "audio/gladiator0.mp3",
    gladiator1: "audio/gladiator1.mp3",
    gladiator2: "audio/gladiator2.mp3",
    gladiatorx: "audio/gladiatorx.mp3",
    pumpamb: "audio/pumpamb.mp3"
};

// Loaded in the background once gameplay begins, so the start screen appears sooner.
// Only put things here that aren't needed in the first room.
const DEFERRED_SPRITE_SHEETS = {
    roomClown2: "raw/clown2",
    flashScreens: "raw/flashscreens",
    staticScreens: "raw/staticscreens",
    staticLite: "raw/staticlite"
};

const DEFERRED_IMAGES = {
    theEnd: "raw/standalone/the_end.webp",
    stretch1: "raw/standalone/stretch1.jpg",
    stretch2: "raw/standalone/stretch2.jpg",
    stretch3: "raw/standalone/stretch3.jpg",
    stretch4: "raw/standalone/stretch4.jpg",
    stretch5: "raw/standalone/stretch5.jpg",
    stretch6: "raw/standalone/stretch6.jpg",
    floaty1: "raw/standalone/floaty1.jpg",
    floaty2: "raw/standalone/floaty2.jpg",
    floaty3: "raw/standalone/floaty3.jpg",
    floaty4: "raw/standalone/floaty4.jpg",
    balloon1: "raw/standalone/balloon1.jpg",
    balloon2: "raw/standalone/balloon2.jpg",
    balloon3: "raw/standalone/balloon3.jpg",
    balloon4: "raw/standalone/balloon4.jpg",
    balloon5: "raw/standalone/balloon5.jpg"
};

const DEFERRED_AUDIO = {
    a7: "audio/notes/a7.mp3",
    b7: "audio/notes/b7.mp3",
    c7: "audio/notes/c7.mp3",
    c7b: "audio/notes/c7b.mp3",
    d7: "audio/notes/d7.mp3",
    e7: "audio/notes/e7.mp3",
    e7b: "audio/notes/e7b.mp3",
    f7: "audio/notes/f7.mp3",
    f7b: "audio/notes/f7b.mp3",
    g6: "audio/notes/g6.mp3",
    g6s: "audio/notes/g6s.mp3",
    g7: "audio/notes/g7.mp3",
    c8: "audio/notes/c8.mp3",
    clownlaugh1: "audio/clownlaugh1.mp3",
    clownlaugh2: "audio/clownlaugh2.mp3",
    clownlaughfinal: "audio/clownlaughfinal.mp3",
    clownhorn: "audio/clown_horn.mp3",
    creepysfx: "audio/creepysfx.mp3",
    void: "audio/void.mp3",
    flickeron: "audio/flickeron.mp3",
    muffle1: "audio/muffle1.mp3",
    muffle2: "audio/muffle2.mp3",
    muffle3: "audio/muffle3.mp3",
    muffle4: "audio/muffle4.mp3",
    muffle5: "audio/muffle5.mp3",
    muffle6: "audio/muffle6.mp3",
    muffle7: "audio/muffle7.mp3",
    muffle8: "audio/muffle8.mp3",
    sing1: "audio/sing1.mp3",
    rubber1: "audio/rubber1.mp3",
    rubber2: "audio/rubber2.mp3",
    rubber3: "audio/rubber3.mp3",
    rubber4: "audio/rubber4.mp3",
    rubber5: "audio/rubber5.mp3",
    rubber6: "audio/rubber6.mp3",
    rubber7: "audio/rubber7.mp3",
    rubber8: "audio/rubber8.mp3",
    tear1: "audio/tear1.mp3",
    tear2: "audio/tear2.mp3",
    tear3: "audio/tear3.mp3",
    tear4: "audio/tear4.mp3",
    tear5: "audio/tear5.mp3",
    tear6: "audio/tear6.mp3",
    glassbreak: "audio/glassbreak.mp3",
    horrortrack1: "audio/horrortrack1.mp3",
    groundthud2: "audio/groundthud2.mp3",
    emerge1: "audio/emerge1.mp3",
    emerge2: "audio/emerge2.mp3",
    squeak1: "audio/squeak1.mp3",
    squeak2: "audio/squeak2.mp3",
    squeak3: "audio/squeak3.mp3",
    doorslam: "audio/doorslam.mp3",
    dooropen: "audio/dooropen.mp3",
    dooropen2: "audio/dooropen2.mp3",
    squeakopen: "audio/squeakopen.mp3",
    lidslam: "audio/lidslam.mp3",
    metalgrind1: "audio/metalgrind1.mp3",
    metalgrind2: "audio/metalgrind2.mp3",
    metalgrind3: "audio/metalgrind3.mp3",
    metalgrind4: "audio/metalgrind4.mp3",
    metalsqueak1: "audio/metalsqueak1.mp3",
    metalsqueak2: "audio/metalsqueak2.mp3",
    keygetred: "audio/keygetred.mp3",
    deepbell1: "audio/deepbell1.mp3",
    deepbell2: "audio/deepbell2.mp3",
    deepbell3: "audio/deepbell3.mp3",
    deepbell4: "audio/deepbell4.mp3",
    deepbell5: "audio/deepbell5.mp3",
    nyaha: "audio/nyaha.mp3",
    splurt: "audio/splurt.mp3",
    watergurgle: "audio/watergurgle.mp3",
    stopmusic: "audio/stopmusic.mp3",
    shout1: "audio/shout1.mp3",
    shout2: "audio/shout2.mp3",
    shout3: "audio/shout3.mp3",
    shout4: "audio/shout4.mp3",
    shout5: "audio/shout5.mp3"
};

// In-game lines. Rooms show one line per phase when their placard is clicked:
// name (normal), dark (lights out), done (after the room is cleaned up in the horror phase).
const TEXT = {
    roomCleaned: "Room cleaned up.",
    cleanUpFirst: "Clean up the room first.",
    // Second, more specific hint when leaving a room before cleaning it, by exhibit index
    cleanupHints: {
        2: "Deflate him",
        3: "Turn off the tap",
        5: "Uncount the fingers",
        6: "Unstretch her hand",
        13: "Unturn the handle"
    },

    lobby: {
        welcome: "Exhibit of Smiles! :)\n   <== EXIT    EXHIBITS ==>",
        welcomeAfterBrokenBox: "Exhibit of Smiles.\n   <== EXIT    EXHIBITS ==>",
        // {text, time in ms} frames shown the first time the sign is clicked in the horror phase
        welcomeGlitch: [
            { text: "Exhibit of Smiles! :)\n   <=- EXIT    EXHIBITS =->", time: 750 },
            { text: "Exhibit of S̶m̵i̷l̸e̵s̵!! :)\n   <-= EXIT    EXHIBITS -=>", time: 100 },
            { text: "Exhibit of S̶m̵i̷l̸e̵s̵!! :)\n <=- NOEXIT    EXHIBITS =->", time: 25 },
            { text: "Exhibit of S̴o̵r̷r̷o̵w̴s̵!̶ :̵(\n   <=- EXIT    EXHIBITS =->", time: 25 },
            { text: "Exhibit of S̷̢͛m̷͕͒i̷̜̍l̵͓̏e̵̳̿s̵͈͒!̸͎̄ ̶̩͑:̶̛̣(̶͚͂", time: 25 },
            { text: "Exhibit of Smiles! :)\n   <=- EXIT    EXHIBITS =>", time: 100 },
            { text: "Exhibit of S̵o̶r̸r̷o̸w̸s̵!̴:|\n   <== EXIT    EXHIBITS =>", time: 50 },
            { text: "Exhibit of Sorrows   \n ", time: 1750 }
        ],
        // shorter version shown on later clicks
        welcomeGlitchRepeat: [
            { text: "Exhibit of S̶m̵i̷l̸e̵s̵!! :)", time: 100 },
            { text: "Exhibit of Smiles! :)", time: 200 },
            { text: "Exhibit of S̴o̵r̷r̷o̵w̴s̵!̶ :̵(", time: 50 },
            { text: "Exhibit of Smiles! :)", time: 100 },
            { text: "Exhibit of S̵o̶r̸r̷o̸w̸s̵!̴:|", time: 100 },
            { text: "Exhibit of Sorrows   ", time: 300 },
            { text: "Exhibit of S̷̢͛m̷͕͒i̷̜̍l̵͓̏e̵̿s̵͈͒!̸͎̄", time: 50 },
            { text: " ", time: 550 }
        ],
        standHorror: "==>\n==>\n==>",
        justArrived: "You just arrived\nExibits to the right! ->",
        lightsFirst: "Turn on the lights first",
        doorLocked: "Locked. But now that the lights\nare on, I can head RIGHT ->",
        emergencyPower: "Emergency power is on. It might not last long.",
        lightsFine: "The lights are working fine.",
        tooDark: "It's too dark to go forward. \n<- Head left to EXIT.",
        stayedLongEnough: "You have stayed long enough. You should EXIT. ",
        musicBoxBroken: "The music box is... broken?",
        musicBoxWontTurnOn: "The music box won't turn on now."
    },

    pump: {
        name: "Mr. Floaty",
        dark: "He liked balloons,\nhow they float, how they pop",
        done: "Pop."
    },
    faucet: {
        name: "Mr. Washy",
        dark: "Just a gentle rinse",
        done: "Faucet out of order"
    },
    handy: {
        name: "Mr. Handy",
        dark: "8, 7, 6, 5... ",
        // shown in order (100-700ms apart) the first time; the last one stays afterwards
        doneGlitch: [ "Mr. H̵a̵n̸d̸ ", "Mr. H̴a̸      ", "Mr.            " ]
    },
    stretch: {
        name: "Ms. Stretch",
        dark: "What is the furthest she could reach?",
        done: "..."
    },
    jack: {
        name: "Jack in the Box",
        dark: "Unturn the handle.",
        horror: "Turn the handle.",
        horrorShout: "TURN THE HANDLE",
        noTurningBack: "There is no reason to turn back"
    },

    replay: "REPLAY"
};
