/**
 * All Take Out — catalog data (custom edition).
 * Categories mirror the client-approved tree from the legacy database,
 * including the Social Media subcategories.
 */
(function () {
	'use strict';

	var ICONS = {
		sticker: '<path d="M9 3h6a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6V9a6 6 0 0 1 6-6Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/>',
		megaphone: '<path d="m3 11 18-7-4 14-6-3.5L3 11Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
		qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v.01M14 21v.01M21 21v.01M17.5 17.5H21M17.5 17.5V21"/>',
		tag: '<path d="M12 2H2v10l9.3 9.3a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8L12 2Z"/><circle cx="7" cy="7" r="1.5"/>',
		badge: '<path d="M12 2 14.4 4.5 17.8 4.2 18.5 7.5 21.5 9 20 12 21.5 15 18.5 16.5 17.8 19.8 14.4 19.5 12 22 9.6 19.5 6.2 19.8 5.5 16.5 2.5 15 4 12 2.5 9 5.5 7.5 6.2 4.2 9.6 4.5 12 2Z"/><path d="m9 12 2 2 4-4"/>',
		shield: '<path d="M12 2 20 5v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3Z"/><path d="m9 12 2 2 4-4"/>',
		heart: '<path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6.3a5 5 0 1 1 7.5 6.3Z"/>',
		utensils: '<path d="M7 2v20M4 2v5a3 3 0 0 0 6 0V2"/><path d="M17 2c-2 2-3 4.5-3 8 0 2 1 3 3 3s3-1 3-3c0-3.5-1-6-3-8Zm0 11v9"/>',
		arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
		check: '<path d="M20 6 9 17l-5-5"/>',
		star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/>',
		cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2.5l2.6 12.4a1.5 1.5 0 0 0 1.5 1.1h8.6a1.5 1.5 0 0 0 1.4-1.1L21.5 7H6"/>',
		menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
		close: '<path d="M6 6l12 12M18 6 6 18"/>',
		truck: '<path d="M1 4h14v12H1zM15 9h4l4 4v3h-8z"/><circle cx="6" cy="18.5" r="2"/><circle cx="18" cy="18.5" r="2"/>',
		eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
		gift: '<rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8c-2 0-5-.5-5-3a2 2 0 0 1 4-.9c.4.8 1 2.9 1 3.9Zm0 0c2 0 5-.5 5-3a2 2 0 0 0-4-.9c-.4.8-1 2.9-1 3.9Z"/>',
		user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
		layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>'
	};

	function icon(name, size) {
		size = size || 24;
		return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.sticker) + '</svg>';
	}

	var MATERIALS = ['Glossy paper', 'Matte paper', 'Waterproof vinyl'];
	var SIZES = ['2" x 2"', '3" x 3"', '4" x 4"'];
	var SHAPES = [
		{ shape: 'circle', label: 'Round' },
		{ shape: 'square', label: 'Square' },
		{ shape: 'rectangle', label: 'Rectangle' }
	];
	var TIERS = [
		{ qty: 100, price: 19 },
		{ qty: 250, price: 39 },
		{ qty: 500, price: 69 },
		{ qty: 1000, price: 119 }
	];

	var CATEGORIES = [
		{ slug: 'social-media-labels', name: 'Social Media Labels', icon: 'megaphone', desc: 'Turn every bag into a follow — Instagram, TikTok and Facebook handles your customers can scan.', subs: ['TikTok', 'Facebook', 'Instagram', 'X (Twitter)'] },
		{ slug: 'qr-code-labels', name: 'QR Code Labels', icon: 'qr', desc: 'Link menus, review pages or loyalty programs with crisp, scannable QR stickers.', subs: [] },
		{ slug: 'promotional-labels', name: 'Promotional Labels', icon: 'tag', desc: 'Sales, launches and limited offers — labels that move the needle.', subs: [] },
		{ slug: 'branded-labels', name: 'Branded Labels', icon: 'badge', desc: 'Your logo, your colours, on every order that leaves the kitchen.', subs: [] },
		{ slug: 'tamper-evident-labels', name: 'Tamper-Evident Labels', icon: 'shield', desc: 'Seal orders with confidence — customers see their food arrives untouched.', subs: [] },
		{ slug: 'customer-appreciation-stickers', name: 'Customer Appreciation', icon: 'heart', desc: 'Thank-you stickers that turn first orders into regulars.', subs: [] },
		{ slug: 'food-identification-labels', name: 'Food Identification', icon: 'utensils', desc: 'Allergens, spice levels, prep dates — clear info, zero mix-ups.', subs: [] }
	];

	function product(slug, name, cat, sub, iconName, shapeHint, swatchColor, desc) {
		return {
			slug: slug, name: name, cat: cat, sub: sub, icon: iconName,
			shapeHint: shapeHint, swatch: swatchColor, desc: desc,
			materials: MATERIALS, sizes: SIZES, shapes: SHAPES, tiers: TIERS,
			templates: [{ name: 'Blank canvas', image: '' }]
		};
	}

	var PRODUCTS = [
		product('tiktok-round-sticker', 'TikTok Handle Sticker', 'social-media-labels', 'TikTok', 'megaphone', 'circle', '#1B2A20', 'Your @handle where hungry people already look — right on the bag. Designed live in the editor.'),
		product('instagram-round-sticker', 'Instagram Handle Sticker', 'social-media-labels', 'Instagram', 'megaphone', 'circle', '#E8590C', 'A follow-us sticker your customers will actually photograph. Add your handle, colours and logo.'),
		product('facebook-label', 'Facebook Page Label', 'social-media-labels', 'Facebook', 'megaphone', 'square', '#1D5B33', 'Point customers to your page for reviews, events and specials.'),
		product('x-twitter-label', 'X (Twitter) Label', 'social-media-labels', 'X (Twitter)', 'megaphone', 'square', '#1B2A20', 'Short, sharp and scannable — your X handle on every order.'),
		product('qr-menu-label', 'QR Code Menu Label', 'qr-code-labels', '', 'qr', 'square', '#1D5B33', 'Paste a link — we generate the QR code. Menus, review pages, loyalty signups.'),
		product('promo-sale-sticker', 'Promo & Sale Sticker', 'promotional-labels', '', 'tag', 'circle', '#E8590C', 'Limited offers that move the needle: 20% off, BOGO, new item launches.'),
		product('branded-logo-label', 'Branded Logo Label', 'branded-labels', '', 'badge', 'circle', '#1D5B33', 'Your logo, front and centre, on bags, boxes and cups.'),
		product('tamper-seal', 'Tamper-Evident Seal', 'tamper-evident-labels', '', 'shield', 'rectangle', '#1B2A20', 'Splits cleanly when opened — customers see their food arrives untouched.'),
		product('thank-you-pack', 'Thank You Sticker Pack', 'customer-appreciation-stickers', '', 'heart', 'circle', '#E8590C', 'A warm thank-you on every order turns first-timers into regulars.'),
		product('food-id-label', 'Food ID & Allergen Label', 'food-identification-labels', '', 'utensils', 'rectangle', '#1D5B33', 'Allergens, spice levels, prep dates — clear info, zero mix-ups.')
	];

	// US state tax demo table (rates approximate, for demonstration —
	// production rates come from the tax service at launch).
	var TAX_RATES = {
		'NY': { name: 'New York', rate: 8.875 },
		'FL': { name: 'Florida', rate: 6.0 },
		'CA': { name: 'California', rate: 7.25 },
		'TX': { name: 'Texas', rate: 6.25 },
		'WA': { name: 'Washington', rate: 6.5 },
		'PA': { name: 'Pennsylvania', rate: 6.0 },
		'OH': { name: 'Ohio', rate: 5.75 },
		'OR': { name: 'Oregon', rate: 0 },
		'OTHER': { name: 'Other / outside US', rate: 0 }
	};

	var FONTS = ['DM Sans', 'Fraunces', 'Montserrat', 'Oswald', 'Playfair Display', 'Bebas Neue', 'Pacifico', 'Caveat', 'Lobster', 'Abril Fatface'];

	var CLIPART = [
		{ file: 'burger.svg', label: 'Burger' },
		{ file: 'pizza.svg', label: 'Pizza slice' },
		{ file: 'coffee.svg', label: 'Coffee cup' },
		{ file: 'star.svg', label: 'Star' },
		{ file: 'heart.svg', label: 'Heart' },
		{ file: 'leaf.svg', label: 'Leaf' },
		{ file: 'chef-hat.svg', label: 'Chef hat' },
		{ file: 'sparkle.svg', label: 'Sparkle' }
	];

	window.ATO_DATA = {
		icon: icon,
		categories: CATEGORIES,
		products: PRODUCTS,
		taxRates: TAX_RATES,
		fonts: FONTS,
		clipart: CLIPART,
		productBySlug: function (slug) {
			for (var i = 0; i < PRODUCTS.length; i++) {
				if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
			}
			return null;
		},
		categoryBySlug: function (slug) {
			for (var i = 0; i < CATEGORIES.length; i++) {
				if (CATEGORIES[i].slug === slug) return CATEGORIES[i];
			}
			return null;
		}
	};
})();
