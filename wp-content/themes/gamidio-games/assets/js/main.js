/**
 * Search panel, archive filtering and footer actions. Works on the static export:
 * games come from the generated index (window.GAMIDIO.indexUrl, contract with gamidio-core).
 */
(function () {
	'use strict';

	var config = window.GAMIDIO || {};
	var i18n = config.i18n || {};
	var indexPromise = null;

	function loadIndex() {
		if (!indexPromise) {
			indexPromise = fetch(config.indexUrl, { credentials: 'omit' })
				.then(function (r) { return r.ok ? r.json() : { games: [] }; })
				.then(function (data) { return data.games || []; })
				.catch(function () { return []; });
		}
		return indexPromise;
	}

	function slugify(name) {
		return String(name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	function makeFuse(games) {
		if (!window.Fuse) {
			return null;
		}
		// Fuzzy on titles only: fuzzy matching on genre names ("car" ~ "Arcade") adds noise. "Similar to" (D-052) counts
		// less, so "diablo" finds Flare and "minecraft" finds Luanti without pushing exact titles down.
		return new window.Fuse(games, {
			keys: [{ name: 'title', weight: 1 }, { name: 'similar', weight: 0.4 }],
			threshold: 0.2,
			ignoreLocation: true,
			minMatchCharLength: 2
		});
	}

	/** Games whose genre or tag starts with the query ("horr" → Horror games). */
	function byLabel(games, q) {
		return games.filter(function (g) {
			var similar = g.similar ? g.similar.split(', ') : [];
			return (g.genres || []).concat(g.tags || [], similar).some(function (name) {
				return name.toLowerCase().indexOf(q) === 0;
			});
		});
	}

	/** Text + genre filter (D-021): both conditions must match. Title matches rank first. */
	function filterGames(games, fuse, query, genre) {
		var list = games;
		if (query) {
			var q = query.toLowerCase();
			var byTitle = fuse
				? fuse.search(query).map(function (r) { return r.item; })
				: games.filter(function (g) { return g.title.toLowerCase().indexOf(q) !== -1; });
			var seen = {};
			list = byTitle.concat(q.length > 2 ? byLabel(games, q) : []).filter(function (g) {
				if (seen[g.id]) { return false; }
				seen[g.id] = true;
				return true;
			});
		}
		if (genre) {
			list = list.filter(function (g) {
				return (g.genres || []).some(function (name) { return slugify(name) === genre; });
			});
		}
		return list;
	}

	function track(event, data) {
		window.dataLayer = window.dataLayer || [];
		var payload = { event: event };
		for (var key in data) {
			payload[key] = data[key];
		}
		window.dataLayer.push(payload);
	}

	/* ---------- Search panel ---------- */

	var panel = document.getElementById('search-panel');
	if (panel) {
		var input = panel.querySelector('[data-search-input]');
		var results = panel.querySelector('[data-search-results]');
		var title = panel.querySelector('[data-search-title]');
		var chips = panel.querySelectorAll('[data-search-chips] .chip');
		var opener = null;
		var genre = '';
		var games = [];
		var fuse = null;
		var debounce = null;

		function tileHtml(g) {
			var a = document.createElement('a');
			a.className = 'tile';
			a.href = g.url;
			if (g.thumbnail) {
				var img = document.createElement('img');
				img.src = g.thumbnail;
				img.alt = '';
				img.loading = 'lazy';
				img.width = 256;
				img.height = 256;
				a.appendChild(img);
			}
			var span = document.createElement('span');
			span.className = 'tile__title';
			span.textContent = g.title;
			a.appendChild(span);
			return a;
		}

		function render() {
			var query = input.value.trim();
			var list;
			if (!query && !genre) {
				list = games.filter(function (g) { return g.popular || g.featured; }).slice(0, 24);
				if (!list.length) {
					list = games.slice(0, 24);
				}
				title.textContent = i18n.popular || 'Popular games';
			} else {
				list = filterGames(games, fuse, query, genre).slice(0, 60);
				title.textContent = i18n.results || 'Results';
			}
			results.textContent = '';
			if (!list.length) {
				var p = document.createElement('p');
				p.className = 'search-empty';
				p.textContent = i18n.noResults || 'No games found.';
				results.appendChild(p);
				return;
			}
			list.forEach(function (g) { results.appendChild(tileHtml(g)); });
		}

		function open(trigger) {
			opener = trigger || null;
			panel.hidden = false;
			document.documentElement.style.overflow = 'hidden';
			document.querySelectorAll('[data-search-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
			input.focus();
			loadIndex().then(function (list) {
				games = list;
				fuse = makeFuse(games);
				render();
			});
		}

		function close() {
			panel.hidden = true;
			document.documentElement.style.overflow = '';
			document.querySelectorAll('[data-search-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
			if (opener) {
				opener.focus();
			}
		}

		document.addEventListener('click', function (e) {
			var openBtn = e.target.closest('[data-search-open]');
			if (openBtn) {
				open(openBtn);
				return;
			}
			if (e.target.closest('[data-search-close]')) {
				close();
			}
		});

		document.addEventListener('keydown', function (e) {
			if (panel.hidden) {
				return;
			}
			if (e.key === 'Escape') {
				close();
			}
			// Keep keyboard focus inside the dialog.
			if (e.key === 'Tab') {
				var focusable = panel.querySelectorAll('input, button, a[href]');
				var first = focusable[0];
				var last = focusable[focusable.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					last.focus();
					e.preventDefault();
				} else if (!e.shiftKey && document.activeElement === last) {
					first.focus();
					e.preventDefault();
				}
			}
		});

		input.addEventListener('input', function () {
			clearTimeout(debounce);
			debounce = setTimeout(function () {
				render();
				if (input.value.trim().length > 2) {
					track('search', { search_term: input.value.trim() });
				}
			}, 120);
		});

		chips.forEach(function (chip) {
			chip.addEventListener('click', function () {
				var value = chip.getAttribute('data-genre');
				genre = genre === value ? '' : value;
				chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-genre') === genre)); });
				render();
				if (genre) {
					track('filter_chip', { genre: genre });
				}
			});
		});
	}

	/* ---------- Genre chips: keep the current genre visible in the scrollable row (mobile) ---------- */

	var currentChip = document.querySelector('.archive-head .chip[aria-current="page"]');
	if (currentChip && currentChip.parentNode.scrollWidth > currentChip.parentNode.clientWidth) {
		currentChip.parentNode.scrollLeft = currentChip.offsetLeft - currentChip.parentNode.offsetLeft - 16;
	}

	/* ---------- Games archive: filter the server-rendered tiles ---------- */

	var archive = document.querySelector('[data-archive]');
	if (archive) {
		var aInput = archive.querySelector('[data-archive-input]');
		// Genre chips are links to the genre pages (D-039); only old ?genre= links still filter here.
		var aChips = archive.querySelectorAll('[data-archive-chips] .chip[data-genre]');
		var aCount = archive.querySelector('[data-archive-count]');
		var aEmpty = archive.querySelector('[data-archive-empty]');
		var tiles = Array.prototype.slice.call(archive.querySelectorAll('.tile[data-game]'));
		var sortButtons = archive.querySelectorAll('[data-archive-sort] [data-sort]');
		// Server order = "Top" (featured, priority, internal score; D-036). Other orders are derived from it.
		tiles.forEach(function (tile, i) { tile.setAttribute('data-rank', i); });
		var state = { q: '', genre: '', sort: '' };
		var aGames = [];
		var aFuse = null;
		var aDebounce = null;

		function readUrl() {
			var params = new URLSearchParams(window.location.search);
			state.q = params.get('q') || '';
			state.genre = params.get('genre') || '';
			state.sort = ['new', 'az'].indexOf(params.get('sort')) !== -1 ? params.get('sort') : '';
			aInput.value = state.q;
		}

		function writeUrl(push) {
			var params = new URLSearchParams();
			if (state.q) { params.set('q', state.q); }
			if (state.genre) { params.set('genre', state.genre); }
			if (state.sort) { params.set('sort', state.sort); }
			var url = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
			window.history[push ? 'pushState' : 'replaceState'](null, '', url);
		}

		function sortTiles() {
			sortButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-sort') === state.sort)); });
			var rank = function (t) { return +t.getAttribute('data-rank'); };
			var compare = {
				'': function (a, b) { return rank(a) - rank(b); },
				'new': function (a, b) { return (+b.getAttribute('data-added') - +a.getAttribute('data-added')) || rank(a) - rank(b); },
				'az': function (a, b) { return a.textContent.trim().localeCompare(b.textContent.trim(), 'en', { sensitivity: 'base' }); }
			}[state.sort];
			tiles.slice().sort(compare).forEach(function (tile) { archive.insertBefore(tile, aEmpty); });
		}

		function apply() {
			aChips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-genre') === state.genre)); });
			var visible;
			if (state.q && aGames.length) {
				var ids = {};
				filterGames(aGames, aFuse, state.q, state.genre).forEach(function (g) { ids[g.id] = true; });
				visible = function (tile) { return !!ids[tile.getAttribute('data-game')]; };
			} else {
				visible = function (tile) {
					return !state.genre || (' ' + tile.getAttribute('data-genres') + ' ').indexOf(' ' + state.genre + ' ') !== -1;
				};
			}
			var shown = 0;
			tiles.forEach(function (tile) {
				var show = visible(tile);
				tile.hidden = !show;
				if (show) { shown++; }
			});
			aEmpty.hidden = shown > 0;
			aCount.textContent = (i18n.gameCount || '%d games').replace('%d', shown);
		}

		readUrl();
		if (state.sort) { sortTiles(); }
		apply();
		if (state.q) {
			loadIndex().then(function (list) { aGames = list; aFuse = makeFuse(list); apply(); });
		}

		aInput.addEventListener('input', function () {
			clearTimeout(aDebounce);
			aDebounce = setTimeout(function () {
				state.q = aInput.value.trim();
				loadIndex().then(function (list) {
					aGames = list;
					aFuse = aFuse || makeFuse(list);
					apply();
					writeUrl(false);
				});
			}, 150);
		});

		aChips.forEach(function (chip) {
			chip.addEventListener('click', function () {
				state.genre = chip.getAttribute('data-genre');
				apply();
				writeUrl(true);
				if (state.genre) {
					track('filter_chip', { genre: state.genre });
				}
			});
		});

		sortButtons.forEach(function (button) {
			button.addEventListener('click', function () {
				state.sort = button.getAttribute('data-sort');
				sortTiles();
				writeUrl(false);
				track('sort', { sort: state.sort || 'top' });
			});
		});

		window.addEventListener('popstate', function () {
			readUrl();
			sortTiles();
			apply();
		});
	}

	/* ---------- Ad placeholders: show the unit size in use at this screen width ---------- */

	var sizeLabels = document.querySelectorAll('[data-ad-size]');
	function showAdSizes() {
		sizeLabels.forEach(function (el) {
			var box = el.parentElement;
			el.textContent = Math.round(box.offsetWidth) + ' × ' + Math.round(box.offsetHeight);
		});
	}
	if (sizeLabels.length) {
		showAdSizes();
		window.addEventListener('resize', showAdSizes);
	}

	/* ---------- Footer: reopen the Google CMP (D-010, D-017) ---------- */

	document.addEventListener('click', function (e) {
		if (!e.target.closest('[data-cookie-settings]')) {
			return;
		}
		window.googlefc = window.googlefc || {};
		window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
		window.googlefc.callbackQueue.push(function () {
			if (typeof window.googlefc.showRevocationMessage === 'function') {
				window.googlefc.showRevocationMessage();
			}
		});
	});

	/* ---------- Analytics: related game clicks (§34) ---------- */

	if (document.body.classList.contains('is-game')) {
		document.addEventListener('click', function (e) {
			var tile = e.target.closest('.grid--game .tile[data-game]');
			if (tile) {
				track('related_game_click', { game_id: tile.getAttribute('data-game') });
			}
		});
	}
})();
