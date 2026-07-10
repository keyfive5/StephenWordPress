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
	var revealEls = document.querySelectorAll('.reveal');
	if (revealEls.length && 'IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					io.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
		revealEls.forEach(function (el) { io.observe(el); });
	} else {
		revealEls.forEach(function (el) { el.classList.add('is-visible'); });
	}
})();
