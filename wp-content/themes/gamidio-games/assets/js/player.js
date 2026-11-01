/**
 * Game player: fullscreen, "best on desktop" notice on touch devices, analytics events (§13, §34).
 */
(function () {
	'use strict';

	var player = document.querySelector('[data-player]');
	if (!player) {
		return;
	}
	var stage = player.querySelector('[data-player-stage]');
	var i18n = (window.GAMIDIO && window.GAMIDIO.i18n) || {};

	function track(event) {
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({ event: event, game_title: document.title });
	}

	function watchFrame(frame) {
		track('game_start');
		// The game may have loaded before this script: ask again whether it has an on-screen gamepad.
		var ask = function () {
			if (frame.contentWindow) {
				frame.contentWindow.postMessage({ gamidioAsk: true }, '*');
			}
		};
		frame.addEventListener('load', ask);
		ask();
		frame.addEventListener('error', function () { track('game_error'); });
	}

	// Some games draw at the size of their window, so on a phone they turn blurry and their layout breaks. Such a game
	// gets the window it was made for, scaled down to the stage (D-062). Same breakpoint as the game block in main.css.
	var designWidth = Number(player.getAttribute('data-design-width'));
	var smallScreen = window.matchMedia('(max-width: 1143px)');
	var refit = null;

	function fitFrame(game) {
		var ratio = Number(player.style.getPropertyValue('--game-ar')) || 16 / 9;
		var designHeight = Math.round(designWidth / ratio);

		function fit() {
			// With an on-screen gamepad the window takes the shape of the stage, so the controls reach the screen edges.
			var gamepad = player.classList.contains('player--gamepad');
			var height = gamepad ? Math.round(designWidth * stage.clientHeight / stage.clientWidth) : designHeight;
			var scale = gamepad ? stage.clientWidth / designWidth : Math.min(stage.clientWidth / designWidth, stage.clientHeight / designHeight);
			var scaled = smallScreen.matches && scale < 1;
			game.classList.toggle('player__frame--scaled', scaled);
			game.style.setProperty('--design-w', designWidth + 'px');
			game.style.setProperty('--design-h', height + 'px');
			game.style.setProperty('--design-scale', scale);
			// An on-screen gamepad inside the game must not shrink with the frame.
			if (game.contentWindow) {
				game.contentWindow.postMessage({ gamidioScale: scaled ? scale : 1 }, '*');
			}
		}

		game.addEventListener('load', fit);
		refit = fit;
		fit();
		new ResizeObserver(fit).observe(stage);
	}

	// A game with an on-screen gamepad announces itself: its frame then fills the stage, so the gamepad reaches the edges
	// of the screen, and the game keeps its proportions inside (scaled frames and games for any window size need no ratio).
	window.addEventListener('message', function (event) {
		var game = player.querySelector('iframe');
		if (!game || event.source !== game.contentWindow || !event.data) {
			return;
		}
		// A game with text fields: the phone's keyboard floats over the page, so the game keeps its size. Only the top page may ask.
		if (event.data.gamidioFloatingKeyboard && navigator.virtualKeyboard) {
			navigator.virtualKeyboard.overlaysContent = true;
		}
		if (!event.data.gamidioGamepad) {
			return;
		}
		player.classList.add('player--gamepad');
		if (refit) {
			refit();
		}
		if (!designWidth && player.getAttribute('data-orientation') !== 'portrait') {
			game.contentWindow.postMessage({ gamidioFill: Number(player.style.getPropertyValue('--game-ar')) || 16 / 9 }, '*');
		}
	});

	var frame = player.querySelector('iframe');
	if (frame) {
		watchFrame(frame);
		if (designWidth) {
			fitFrame(frame);
		}
	}

	// Games from other servers: the frame is created only after a click on Play (D-059).
	var start = player.querySelector('[data-frame-start]');
	var startLink = start && start.querySelector('[data-frame-src]');

	function startFrame() {
		var game = document.createElement('iframe');
		game.className = 'player__frame';
		game.src = startLink.getAttribute('data-frame-src');
		game.title = startLink.getAttribute('data-frame-title');
		game.setAttribute('allow', startLink.getAttribute('data-frame-allow'));
		game.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
		start.parentNode.replaceChild(game, start);
		watchFrame(game);
		if (designWidth) {
			fitFrame(game);
		}
		game.focus();
	}

	if (startLink) {
		startLink.addEventListener('click', function (event) {
			event.preventDefault();
			startFrame();
		});
	}

	var fullscreenBtn = player.querySelector('[data-fullscreen]');
	if (fullscreenBtn) {
		var canFullscreen = stage.requestFullscreen || stage.webkitRequestFullscreen;
		if (!canFullscreen) {
			fullscreenBtn.hidden = true;
		}
		fullscreenBtn.addEventListener('click', function () {
			if (document.fullscreenElement || document.webkitFullscreenElement) {
				(document.exitFullscreen || document.webkitExitFullscreen).call(document);
				return;
			}
			(stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
			track('fullscreen');
		});
		document.addEventListener('fullscreenchange', function () {
			// Fullscreen also uses the strip of the camera cutout, so the gamepad reaches the real edges of the phone.
			var viewport = document.querySelector('meta[name="viewport"]');
			if (viewport) {
				viewport.content = viewport.content.replace(/,\s*viewport-fit=cover/, '') + (document.fullscreenElement ? ', viewport-fit=cover' : '');
			}
			fullscreenBtn.setAttribute('aria-label', document.fullscreenElement ? (i18n.exitFull || 'Exit fullscreen') : (i18n.fullscreen || 'Fullscreen'));
		});
	}

	// Desktop-only games on touch devices: explain first, let the player decide.
	var notice = player.querySelector('[data-mobile-notice]');
	if (notice && window.matchMedia('(pointer: coarse)').matches) {
		notice.hidden = false;
		notice.querySelector('[data-mobile-play]').addEventListener('click', function () {
			notice.hidden = true;
		});
	}
})();
