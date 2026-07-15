/**
 * All Take Out theme interactions:
 * sticky header state, mobile drawer, scroll-reveal.
 */
(function () {
	'use strict';

	// Sticky header shadow.
	var header = document.getElementById('site-header');
	if (header) {
		var onScroll = function () {
			header.classList.toggle('is-scrolled', window.scrollY > 8);
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
	}

	// Mobile drawer.
	var nav = document.getElementById('main-nav');
	var toggle = document.getElementById('nav-toggle');
	var close = document.getElementById('nav-close');

	function setNav(open) {
		if (!nav || !toggle) return;
		nav.classList.toggle('is-open', open);
		toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		document.body.style.overflow = open ? 'hidden' : '';
		if (open && close) close.focus();
		if (!open) toggle.focus();
	}

	if (toggle) toggle.addEventListener('click', function () { setNav(true); });
	if (close) close.addEventListener('click', function () { setNav(false); });
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) setNav(false);
	});
	if (nav) {
		nav.addEventListener('click', function (e) {
			if (e.target.closest('a')) setNav(false);
		});
	}

	// Scroll reveal (respects reduced motion via CSS override).
	// Exposed as window.atoRevealScan so pages that inject .reveal content
	// after this script runs can register the new elements — otherwise
	// they would stay at opacity 0 forever.
	var revealIO = null;
	if ('IntersectionObserver' in window) {
		revealIO = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					revealIO.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
	}
	function revealScan() {
		// Hidden pages (background tabs) suspend timers and observers -
		// skip the animation and show everything immediately.
		if (document.hidden) {
			document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
				el.classList.add('is-visible');
			});
			return;
		}
		document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
			if (revealIO) {
				revealIO.observe(el);
			} else {
				el.classList.add('is-visible');
			}
		});
		// Failsafe: content must never stay invisible (throttled observers,
		// background tabs, exotic mobile browsers). Animation is optional,
		// visibility is not.
		setTimeout(function () {
			document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
				el.classList.add('is-visible');
			});
		}, 1500);
	}
	revealScan();
	window.atoRevealScan = revealScan;
})();
