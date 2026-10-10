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

	var frame = player.querySelector('iframe');
	if (frame) {
		track('game_start');
		frame.addEventListener('error', function () { track('game_error'); });
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
