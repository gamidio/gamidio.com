/* Gamidio virtual gamepad for keyboard-driven games on touch screens (part of Gamidio's changes, same license as the game).
 *
 * Phones have no keyboard, so action games (platformers, shooters) cannot be played. This layer shows a gamepad over
 * the game on touch devices only and sends keyboard events for it:
 *   left side      joystick: drag from where the thumb lands; 8 directions -> the arrow keys (or the configured keys)
 *   right side     round buttons A, B (X, Y): each sends its configured key(s) while held
 *   top right      menu button (e.g. Escape), top left: hide/show the gamepad
 * Taps outside the gamepad still reach the game (menus with touch/mouse support keep working). The gamepad appears
 * with the first touch, so laptops with a touch screen played with a keyboard never see it.
 *
 * Configuration, set before this script runs:
 *   window.GAMIDIO_GAMEPAD = {
 *     stick: {up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight'},  // default
 *     buttons: [{label: 'A', keys: [' ']}, {label: 'B', keys: ['Control']}],                // 1 to 4 buttons
 *     menu: {label: '☰', keys: ['Escape']},                                                  // optional
 *     target: 'canvas'                                                                       // element that gets the keys
 *   };
 * Keys are KeyboardEvent.key values; code and keyCode are filled in for engines that read them (SDL/Emscripten).
 */
(function () {
	'use strict';
	if (!('ontouchstart' in window) && !(navigator.maxTouchPoints > 0)) return;
	var cfg = window.GAMIDIO_GAMEPAD || {};
	var stickKeys = cfg.stick || {up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight'};
	var buttons = cfg.buttons || [{label: 'A', keys: [' ']}, {label: 'B', keys: ['Control']}];

	var KEYS = {
		'ArrowUp': ['ArrowUp', 38], 'ArrowDown': ['ArrowDown', 40], 'ArrowLeft': ['ArrowLeft', 37], 'ArrowRight': ['ArrowRight', 39],
		' ': ['Space', 32], 'Enter': ['Enter', 13], 'Escape': ['Escape', 27], 'Control': ['ControlLeft', 17],
		'Shift': ['ShiftLeft', 16], 'Alt': ['AltLeft', 18], 'Tab': ['Tab', 9], 'Backspace': ['Backspace', 8]
	};
	function info(key) {
		if (KEYS[key]) return KEYS[key];
		if (/^[a-z]$/i.test(key)) return ['Key' + key.toUpperCase(), key.toUpperCase().charCodeAt(0)];
		if (/^[0-9]$/.test(key)) return ['Digit' + key, key.charCodeAt(0)];
		return [key, 0];
	}

	var down = {};  // key -> number of pads holding it
	var MIN_HOLD = 80;  // ms: games that poll the keyboard once per frame miss a press shorter than a frame or two
	var since = {};
	function send(type, key) {
		var t = document.querySelector(cfg.target || 'canvas') || document.body;
		var i = info(key);
		var e = new KeyboardEvent(type, {key: key, code: i[0], bubbles: true, cancelable: true, view: window});
		// keyCode/which are read-only in the constructor but still used by many engines (SDL 2.0 on Emscripten).
		Object.defineProperty(e, 'keyCode', {get: function () { return i[1]; }});
		Object.defineProperty(e, 'which', {get: function () { return i[1]; }});
		t.dispatchEvent(e);
	}
	function press(key) { if (down[key] === 0.5) { down[key] = 1; return; } if (!down[key]) { send('keydown', key); since[key] = Date.now(); } down[key] = (down[key] || 0) + 1; }
	function release(key) {
		if (!down[key]) return;
		if (--down[key] > 0) return;
		var wait = MIN_HOLD - (Date.now() - since[key]);
		if (wait <= 0) { send('keyup', key); return; }
		down[key] = 0.5;  // still down until the timer lifts it; a new press in between keeps it down
		setTimeout(function () { if (down[key] === 0.5) { down[key] = 0; send('keyup', key); } }, wait);
	}

	var css = document.createElement('style');
	css.textContent =
		'#gp{position:fixed;inset:0;pointer-events:none;z-index:2147483000;font:600 18px system-ui,sans-serif;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
		'#gp.off .gp-pad{display:none}#gp.idle{display:none}' +
		'#gp-zone{position:absolute;left:0;bottom:0;width:45%;height:60%;pointer-events:auto;touch-action:none}' +
		'#gp-base,#gp-knob{position:absolute;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%)}' +
		'#gp-base{width:min(120px,30vh);height:min(120px,30vh);background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.35)}' +
		'#gp-knob{width:54px;height:54px;background:rgba(255,255,255,.45)}' +
		'.gp-btn{position:absolute;display:flex;align-items:center;justify-content:center;border-radius:50%;pointer-events:auto;touch-action:none;' +
		'width:min(72px,17vh);height:min(72px,17vh);background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.45);color:rgba(255,255,255,.9)}' +
		'.gp-btn.on{background:rgba(255,255,255,.45)}' +
		'.gp-small{width:44px;height:44px;font-size:16px}' +
		'@media (orientation:portrait){#gp-zone{height:45%}}';
	(document.head || document.documentElement).appendChild(css);

	var root = document.createElement('div');
	root.id = 'gp';
	root.className = 'idle';
	addEventListener('touchstart', function () { root.classList.remove('idle'); }, {capture: true, passive: true, once: true});
	root.innerHTML = '<div id="gp-zone" class="gp-pad"></div>';
	var zone = root.firstChild;
	var base = document.createElement('div'), knob = document.createElement('div');
	base.id = 'gp-base'; knob.id = 'gp-knob';
	base.className = knob.className = 'gp-pad';
	base.style.display = knob.style.display = 'none';
	root.appendChild(base); root.appendChild(knob);

	// Buttons in a diamond / row on the right, A nearest to the thumb (bottom right).
	var spots = [[20, 20], [96, 58], [96, -18], [172, 20]];  // [right, bottom] offsets in px
	buttons.slice(0, 4).forEach(function (b, n) {
		var el = document.createElement('div');
		el.className = 'gp-btn gp-pad';
		el.textContent = b.label;
		el.style.right = spots[n][0] + 'px';
		el.style.bottom = 'calc(' + (spots[n][1] + 24) + 'px + env(safe-area-inset-bottom))';
		hold(el, b.keys);
		root.appendChild(el);
	});
	if (cfg.menu) {
		var m = document.createElement('div');
		m.className = 'gp-btn gp-small gp-pad';
		m.textContent = cfg.menu.label || '☰';
		m.style.right = '12px'; m.style.top = '12px';
		hold(m, cfg.menu.keys);
		root.appendChild(m);
	}
	var toggle = document.createElement('div');
	toggle.className = 'gp-btn gp-small';
	toggle.textContent = '🎮';
	toggle.title = 'Show or hide the on-screen gamepad';
	toggle.style.left = '12px'; toggle.style.top = '12px';
	toggle.addEventListener('touchstart', function (e) {
		e.preventDefault(); e.stopPropagation();
		root.classList.toggle('off');
	}, {passive: false});
	root.appendChild(toggle);

	function hold(el, keys) {
		var ids = {};
		el.addEventListener('touchstart', function (e) {
			e.preventDefault(); e.stopPropagation();
			for (var i = 0; i < e.changedTouches.length; i++) ids[e.changedTouches[i].identifier] = 1;
			if (!el.classList.contains('on')) { el.classList.add('on'); keys.forEach(press); if (navigator.vibrate) navigator.vibrate(10); }
		}, {passive: false});
		function end(e) {
			e.preventDefault(); e.stopPropagation();
			for (var i = 0; i < e.changedTouches.length; i++) delete ids[e.changedTouches[i].identifier];
			if (Object.keys(ids).length === 0 && el.classList.contains('on')) { el.classList.remove('on'); keys.forEach(release); }
		}
		el.addEventListener('touchend', end, {passive: false});
		el.addEventListener('touchcancel', end, {passive: false});
	}

	// Joystick: the base appears where the thumb lands; direction = angle of the knob, 8 sectors.
	var stickId = null, origin = null, held = [];
	function setDirs(dirs) {
		held.forEach(function (d) { if (dirs.indexOf(d) < 0) release(stickKeys[d]); });
		dirs.forEach(function (d) { if (held.indexOf(d) < 0) press(stickKeys[d]); });
		held = dirs;
	}
	function place(el, x, y) { el.style.left = x + 'px'; el.style.top = y + 'px'; }
	zone.addEventListener('touchstart', function (e) {
		e.preventDefault(); e.stopPropagation();
		if (stickId !== null) return;
		var t = e.changedTouches[0];
		stickId = t.identifier; origin = {x: t.clientX, y: t.clientY};
		place(base, origin.x, origin.y); place(knob, origin.x, origin.y);
		base.style.display = knob.style.display = 'block';
	}, {passive: false});
	zone.addEventListener('touchmove', function (e) {
		e.preventDefault(); e.stopPropagation();
		for (var i = 0; i < e.changedTouches.length; i++) {
			var t = e.changedTouches[i];
			if (t.identifier !== stickId) continue;
			var dx = t.clientX - origin.x, dy = t.clientY - origin.y, d = Math.hypot(dx, dy), r = 50;
			var k = d > r ? r / d : 1;
			place(knob, origin.x + dx * k, origin.y + dy * k);
			if (d < 16) { setDirs([]); continue; }
			var a = Math.atan2(dy, dx) * 180 / Math.PI, dirs = [];  // 0 = right, 90 = down
			if (a > -67.5 && a < 67.5) dirs.push('right');
			if (a > 112.5 || a < -112.5) dirs.push('left');
			if (a > 22.5 && a < 157.5) dirs.push('down');
			if (a < -22.5 && a > -157.5) dirs.push('up');
			setDirs(dirs);
		}
	}, {passive: false});
	function stickEnd(e) {
		e.preventDefault(); e.stopPropagation();
		for (var i = 0; i < e.changedTouches.length; i++) {
			if (e.changedTouches[i].identifier !== stickId) continue;
			stickId = null; setDirs([]);
			base.style.display = knob.style.display = 'none';
		}
	}
	zone.addEventListener('touchend', stickEnd, {passive: false});
	zone.addEventListener('touchcancel', stickEnd, {passive: false});

	function mount() { document.body.appendChild(root); }
	if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
