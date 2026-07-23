/**
 * All Take Out — custom edition store engine.
 * State (cart, saved designs, account/VIP, orders, poll votes, consent)
 * lives in localStorage so the whole platform runs serverlessly for the
 * demo; at launch these calls swap 1:1 for real API endpoints.
 * Also renders the shared header/footer and the cookie-consent banner.
 */
(function () {
	'use strict';

	var D = window.ATO_DATA;

	// ------------------------------------------------------------------
	// Storage helpers
	// ------------------------------------------------------------------
	function read(key, fallback) {
		try {
			var raw = window.localStorage.getItem(key);
			return raw ? JSON.parse(raw) : fallback;
		} catch (e) { return fallback; }
	}
	function write(key, value) {
		try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full */ }
	}

	// Products added/edited in the admin dashboard live in localStorage and
	// merge over the base catalog (API-backed at launch, same shape).
	(function mergeProducts() {
		read('ato_products', []).forEach(function (p) { D.products.push(p); });
		var overrides = read('ato_product_overrides', {});
		D.products.forEach(function (prod) {
			var o = overrides[prod.slug];
			if (o) {
				Object.keys(o).forEach(function (k) { prod[k] = o[k]; });
			}
		});
	})();

	function addProduct(prod) {
		var list = read('ato_products', []);
		list.push(prod);
		write('ato_products', list);
		D.products.push(prod);
	}
	function updateProduct(slug, partial) {
		var overrides = read('ato_product_overrides', {});
		overrides[slug] = Object.assign(overrides[slug] || {}, partial);
		write('ato_product_overrides', overrides);
		D.products.forEach(function (prod) {
			if (prod.slug === slug) {
				Object.keys(partial).forEach(function (k) { prod[k] = partial[k]; });
			}
		});
	}
	function removeCustomProduct(slug) {
		write('ato_products', read('ato_products', []).filter(function (p) { return p.slug !== slug; }));
		var i = D.products.findIndex(function (p) { return p.slug === slug && p.custom; });
		if (i > -1) D.products.splice(i, 1);
	}

	function uid(prefix) {
		return prefix + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
	}
	function esc(s) {
		return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
		});
	}
	function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2); }
	function now() { return new Date().toLocaleString(); }

	// ------------------------------------------------------------------
	// Designs
	// ------------------------------------------------------------------
	function listDesigns() { return read('ato_designs', []); }

	function saveDesign(payload) {
		var designs = read('ato_designs', []);
		var existing = null;
		if (payload.design_id) {
			for (var i = 0; i < designs.length; i++) {
				if (designs[i].id === payload.design_id) { existing = designs[i]; break; }
			}
		}
		if (existing) {
			existing.json = payload.json;
			existing.preview = payload.preview || existing.preview;
			existing.fonts = payload.fonts || existing.fonts;
			existing.log.push({ time: now(), user: 'Admin', note: payload.note || 'Design updated by admin.' });
		} else {
			existing = {
				id: uid('D'),
				ref: uid('ATO'),
				product: payload.product || '',
				config: payload.config || {},
				json: payload.json,
				preview: payload.preview,
				fonts: payload.fonts || '',
				created: now(),
				log: [{ time: now(), user: 'Customer', note: 'Design created by customer.' }]
			};
			designs.push(existing);
			if (designs.length > 8) designs = designs.slice(designs.length - 8); // keep localStorage lean
		}
		write('ato_designs', designs);
		return existing;
	}

	function getDesign(id) {
		var designs = listDesigns();
		for (var i = 0; i < designs.length; i++) {
			if (designs[i].id === id || designs[i].ref === id) return designs[i];
		}
		return null;
	}

	// ------------------------------------------------------------------
	// Cart
	// ------------------------------------------------------------------
	function getCart() { return read('ato_cart', []); }

	function addToCart(item) {
		var cart = getCart();
		cart.push(item);
		write('ato_cart', cart);
		updateBadge();
	}
	function removeFromCart(index) {
		var cart = getCart();
		cart.splice(index, 1);
		write('ato_cart', cart);
		updateBadge();
	}
	function clearCart() { write('ato_cart', []); updateBadge(); }

	function tierPrice(product, qty) {
		for (var i = 0; i < product.tiers.length; i++) {
			if (product.tiers[i].qty === qty) return product.tiers[i].price;
		}
		return product.tiers[0].price;
	}

	function cartTotals(stateCode) {
		var cart = getCart();
		var user = getUser();
		var subtotal = 0;
		cart.forEach(function (item) { subtotal += item.price * item.packs; });
		var shipping = cart.length ? (user && user.vip ? 0 : 9.99) : 0;
		var taxInfo = (D.taxRates[stateCode] || D.taxRates.OTHER);
		var tax = Math.round(subtotal * taxInfo.rate) / 100;
		return {
			subtotal: subtotal,
			shipping: shipping,
			shippingFree: !!(user && user.vip && cart.length),
			taxRate: taxInfo.rate,
			taxName: taxInfo.name,
			tax: tax,
			total: subtotal + shipping + tax
		};
	}

	// ------------------------------------------------------------------
	// Account / VIP  (demo auth — name & email only, no passwords stored)
	// ------------------------------------------------------------------
	function getUser() { return read('ato_user', null); }

	function signup(name, email) {
		// VIP (per the client's BP #7): 50 extra labels ship with EVERY
		// regular-priced order + free ground shipping. No fees, no balance.
		var user = { name: name, email: email, vip: true, since: now() };
		write('ato_user', user);
		updateBadge();
		return user;
	}
	function logout() { window.localStorage.removeItem('ato_user'); updateBadge(); }

	// ------------------------------------------------------------------
	// Orders
	// ------------------------------------------------------------------
	function listOrders() { return read('ato_orders', []); }

	function placeOrder(customer, stateCode, mode) {
		var totals = cartTotals(stateCode);
		var user = getUser();
		var log = [{ time: now(), note: 'Order created (' + mode + ').' }];
		log.push({ time: now(), note: 'Payment confirmed — demo gateway (Stripe connects at launch).' });
		if (user && user.vip) {
			log.push({ time: now(), note: 'VIP: 50 extra labels included with this order — every order, every time.' });
		}
		var cart = getCart();
		cart.forEach(function (item) {
			if (item.designRef) log.push({ time: now(), note: 'Customized template ' + item.designRef + ' attached to order.' });
		});
		var order = {
			id: uid('ORD'),
			items: cart,
			customer: customer,
			state: stateCode,
			totals: totals,
			vip: !!(user && user.vip),
			mode: mode,
			status: 'paid (demo)',
			created: now(),
			log: log
		};
		var orders = listOrders();
		orders.push(order);
		write('ato_orders', orders);
		clearCart();
		return order;
	}

	// ------------------------------------------------------------------
	// One Question poll (client spec): one vote per device, percentages
	// always total exactly 100 (largest-remainder rounding), and when the
	// question changes the old results are archived for the admin area.
	// ------------------------------------------------------------------
	function pollDef() { return D.poll || { id: 'q1', question: '', options: [], seed: [] }; }

	function pollMigrate() {
		var def = pollDef();
		var state = read('ato_poll_state', null);
		if (state && state.id !== def.id) {
			var archives = read('ato_poll_archive', []);
			archives.push({
				id: state.id,
				question: state.question,
				options: state.options,
				counts: state.counts,
				total: state.counts.reduce(function (a, b) { return a + b; }, 0),
				archivedAt: now()
			});
			write('ato_poll_archive', archives);
			state = null;
		}
		if (!state) {
			state = {
				id: def.id,
				question: def.question,
				options: def.options.slice(),
				counts: (def.seed && def.seed.length === def.options.length) ? def.seed.slice() : def.options.map(function () { return 0; }),
				voted: false,
				choice: -1
			};
			write('ato_poll_state', state);
		}
		return state;
	}

	function pollState() {
		var s = pollMigrate();
		return {
			id: s.id,
			question: s.question,
			options: s.options,
			counts: s.counts,
			total: s.counts.reduce(function (a, b) { return a + b; }, 0),
			voted: !!s.voted,
			choice: typeof s.choice === 'number' ? s.choice : -1
		};
	}

	function pollVote(choice) {
		var s = pollMigrate();
		if (s.voted || choice < 0 || choice >= s.counts.length) return pollState();
		s.counts[choice] += 1;
		s.voted = true;
		s.choice = choice;
		write('ato_poll_state', s);
		return pollState();
	}

	function pollArchives() { return read('ato_poll_archive', []); }

	/** Whole-number percentages that always sum to exactly 100. */
	function pollPercentages(counts) {
		var total = counts.reduce(function (a, b) { return a + b; }, 0);
		if (!total) return counts.map(function () { return 0; });
		var exact = counts.map(function (c) { return c * 100 / total; });
		var floors = exact.map(Math.floor);
		var used = floors.reduce(function (a, b) { return a + b; }, 0);
		var order = exact.map(function (v, i) { return { i: i, rem: v - floors[i] }; })
			.sort(function (a, b) { return b.rem - a.rem; });
		for (var k = 0; k < 100 - used; k++) floors[order[k % order.length].i] += 1;
		return floors;
	}

	// ------------------------------------------------------------------
	// Header / footer
	// ------------------------------------------------------------------
	var NAV = [
		{ href: 'bundle.html', label: 'Bundle & Save', page: 'bundle' },
		{ href: 'shop.html', label: 'Shop', page: 'shop' },
		{ href: 'vip.html', label: 'VIP Members', page: 'vip' },
		{ href: 'making-labels.html', label: 'Making Labels', page: 'making' },
		{ href: 'about.html', label: 'About Us', page: 'about' },
		{ href: 'faqs.html', label: 'FAQs', page: 'faqs' },
		{ href: 'blog.html', label: 'Blog', page: 'blog' },
		{ href: 'one-question.html', label: 'One Question', page: 'poll' }
	];

	function renderHeader() {
		var mount = document.getElementById('app-header');
		if (!mount) return;
		var page = document.body.getAttribute('data-page') || '';
		var user = getUser();
		var links = NAV.map(function (n) {
			return '<li' + (n.page === page ? ' class="current-menu-item"' : '') + '><a href="' + n.href + '">' + n.label + '</a></li>';
		}).join('');
		mount.outerHTML =
			'<a class="skip-link" href="#primary">Skip to content</a>' +
			'<header class="site-header" id="site-header"><div class="container header-bar">' +
			'<a class="site-brand" href="index.html"><img class="site-logo" src="assets/img/logo.png" alt="All Takeout — home"></a>' +
			'<nav class="main-nav" id="main-nav" aria-label="Primary navigation">' +
			'<button class="nav-close" id="nav-close" aria-label="Close menu">' + D.icon('close', 22) + '</button>' +
			'<ul>' + links + '</ul></nav>' +
			'<div class="header-actions">' +
			'<a class="cart-link" href="account.html" aria-label="Account" title="' + (user ? esc(user.name) : 'Account') + '">' + D.icon('user', 20) + '</a>' +
			'<a class="cart-link" href="cart.html" aria-label="View cart">' + D.icon('cart', 20) + '<span class="cart-count" id="ato-cart-count">0</span></a>' +
			'<a class="btn btn--accent btn--sm header-cta" href="bundle.html">Build my bundle</a>' +
			'<button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Open menu">' + D.icon('menu', 22) + '</button>' +
			'</div></div></header>';
	}

	function renderFooter() {
		var mount = document.getElementById('app-footer');
		if (!mount) return;
		var cats = D.categories.slice(0, 5).map(function (c) {
			return '<li><a href="shop.html#' + c.slug + '">' + esc(c.name) + '</a></li>';
		}).join('');
		mount.outerHTML =
			'<footer class="site-footer"><div class="container">' +
			'<div class="footer-grid">' +
			'<div><a class="footer-brand" href="index.html"><span class="brand-dot">' + D.icon('sticker', 22) + '</span><span>All Take Out</span></a>' +
			'<p class="footer-tag">Custom labels and stickers that turn every takeout order into a marketing opportunity. Designed by you, reviewed by our print team, delivered to your door.</p></div>' +
			'<div class="footer-col"><h4>Shop</h4><ul>' + cats + '</ul></div>' +
			'<div class="footer-col"><h4>Company</h4><ul><li><a href="about.html">About Us</a></li><li><a href="vip.html">VIP Members</a></li><li><a href="making-labels.html">Making Labels</a></li><li><a href="faqs.html">FAQs</a></li><li><a href="blog.html">Blog</a></li></ul></div>' +
			'<div class="footer-col"><h4>Account</h4><ul><li><a href="account.html">My Account</a></li><li><a href="cart.html">Cart</a></li><li><a href="admin.html">Admin panel</a></li></ul></div>' +
			'</div>' +
			'<div class="footer-bottom"><span>&copy; 2026 All Take Out &middot; Kew Stick Inc.</span><span>Custom platform — no CMS required</span></div>' +
			'</div></footer>';
	}

	function updateBadge() {
		var badge = document.getElementById('ato-cart-count');
		if (badge) badge.textContent = String(getCart().length);
	}

	// ------------------------------------------------------------------
	// Cookie consent (CookieYes-equivalent, built in)
	// ------------------------------------------------------------------
	function renderConsent() {
		if (read('ato_consent', null)) return;
		var el = document.createElement('div');
		el.className = 'cookie-banner';
		el.setAttribute('role', 'dialog');
		el.setAttribute('aria-label', 'Cookie consent');
		el.innerHTML =
			'<p><strong>Cookies?</strong> We use essential cookies to run the cart, and optional analytics cookies to improve the shop. Your choice is remembered.</p>' +
			'<button class="btn btn--accent" id="ato-consent-yes">Accept all</button>' +
			'<button class="btn btn--ghost" id="ato-consent-no" style="color:#fff;border-color:rgba(255,255,255,.4)">Essential only</button>';
		document.body.appendChild(el);
		document.getElementById('ato-consent-yes').addEventListener('click', function () {
			write('ato_consent', { analytics: true, time: now() });
			el.remove();
		});
		document.getElementById('ato-consent-no').addEventListener('click', function () {
			write('ato_consent', { analytics: false, time: now() });
			el.remove();
		});
	}

	// ------------------------------------------------------------------
	// Boot
	// ------------------------------------------------------------------
	renderHeader();
	renderFooter();
	updateBadge();
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', renderConsent);
	} else {
		renderConsent();
	}

	window.ATO = {
		esc: esc,
		money: money,
		uid: uid,
		listDesigns: listDesigns,
		saveDesign: saveDesign,
		getDesign: getDesign,
		getCart: getCart,
		addToCart: addToCart,
		removeFromCart: removeFromCart,
		clearCart: clearCart,
		tierPrice: tierPrice,
		cartTotals: cartTotals,
		getUser: getUser,
		signup: signup,
		logout: logout,
		listOrders: listOrders,
		placeOrder: placeOrder,
		updateBadge: updateBadge,
		addProduct: addProduct,
		updateProduct: updateProduct,
		removeCustomProduct: removeCustomProduct,
		pollState: pollState,
		pollVote: pollVote,
		pollArchives: pollArchives,
		pollPercentages: pollPercentages
	};
})();
