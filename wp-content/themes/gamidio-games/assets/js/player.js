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
		frame.addEventListener('error', function () { track('game_error'); });
	}

	var frame = player.querySelector('iframe');
	if (frame) {
		watchFrame(frame);
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
