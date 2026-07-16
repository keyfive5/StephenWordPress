/**
 * All Take Out — catalog data (custom edition).
 * Categories mirror the client-approved tree from the legacy database.
 * Products use Stephen's real template graphics (assets/templates/) —
 * each template has fixed artwork plus a defined printable area
 * (fractions of the image: x, y, w, h) that customers can customize.
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

	function tpl(name, file, area) {
		return { name: name, image: 'assets/templates/' + file, area: area };
	}

	var CATEGORIES = [
		{ slug: 'social-media-labels', name: 'Social Media Labels', icon: 'megaphone', desc: 'Turn every bag into a follow — Instagram, TikTok and Facebook handles your customers can scan.', subs: ['TikTok', 'Facebook', 'Instagram', 'X (Twitter)'] },
		{ slug: 'qr-code-labels', name: 'QR Code Labels', icon: 'qr', desc: 'Link menus, review pages or loyalty programs with crisp, scannable QR stickers.', subs: [] },
		{ slug: 'promotional-labels', name: 'Promotional Labels', icon: 'tag', desc: 'Sales, launches and limited offers — labels that move the needle.', subs: [] },
		{ slug: 'branded-labels', name: 'Branded Labels', icon: 'badge', desc: 'Your logo, your colours, on every order that leaves the kitchen.', subs: [] },
		{ slug: 'tamper-evident-labels', name: 'Tamper-Evident Labels', icon: 'shield', desc: 'Seal orders with confidence — customers see their food arrives untouched.', subs: [] },
		{ slug: 'customer-appreciation-stickers', name: 'Customer Appreciation', icon: 'heart', desc: 'Thank-you stickers that turn first orders into regulars.', subs: [] },
		{ slug: 'food-identification-labels', name: 'Food Identification', icon: 'utensils', desc: 'Allergens, spice levels, prep dates — clear info, zero mix-ups.', subs: [] }
	];

	function product(slug, name, cat, sub, iconName, shapeHint, swatchColor, desc, templates) {
		return {
			slug: slug, name: name, cat: cat, sub: sub, icon: iconName,
			shapeHint: shapeHint, swatch: swatchColor, desc: desc,
			materials: MATERIALS, sizes: SIZES, shapes: SHAPES, tiers: TIERS,
			templates: templates && templates.length ? templates : [{ name: 'Blank canvas', image: '' }]
		};
	}

	var PRODUCTS = [
		product('tiktok-label', 'TikTok Label', 'social-media-labels', 'TikTok', 'megaphone', 'rectangle', '#1B2A20',
			'Your TikTok where hungry people already look — right on the bag. Pick a layout, then customize the editable zone.',
			[
				tpl('Address zone', 'tt-address.png', { x: 0.42, y: 0.58, w: 0.54, h: 0.24 }),
				tpl('Bottom strip', 'tt-bottom.png', { x: 0.04, y: 0.76, w: 0.92, h: 0.20 }),
				tpl('Message panel', 'tt-message.png', { x: 0.43, y: 0.10, w: 0.53, h: 0.80 })
			]),
		product('instagram-label', 'Instagram Label', 'social-media-labels', 'Instagram', 'megaphone', 'rectangle', '#E8590C',
			'A follow-us sticker your customers will actually photograph. Fixed Instagram artwork, your details in the printable area.',
			[
				tpl('Address zone', 'ig-address.png', { x: 0.36, y: 0.60, w: 0.60, h: 0.24 }),
				tpl('Message panel', 'ig-message.png', { x: 0.40, y: 0.10, w: 0.56, h: 0.80 })
			]),
		product('facebook-label', 'Facebook Label', 'social-media-labels', 'Facebook', 'megaphone', 'rectangle', '#1D5B33',
			'Point customers to your page for reviews, events and specials — three layouts, one editable zone each.',
			[
				tpl('Address zone', 'fb-address.png', { x: 0.41, y: 0.60, w: 0.55, h: 0.23 }),
				tpl('Bottom strip', 'fb-bottom.png', { x: 0.04, y: 0.76, w: 0.92, h: 0.20 }),
				tpl('Message panel', 'fb-message.png', { x: 0.43, y: 0.10, w: 0.53, h: 0.80 })
			]),
		product('x-twitter-label', 'X (Twitter) Label', 'social-media-labels', 'X (Twitter)', 'megaphone', 'rectangle', '#1B2A20',
			'Short, sharp and scannable — your X handle on every order.',
			[
				tpl('Address zone', 'x-address.png', { x: 0.40, y: 0.61, w: 0.56, h: 0.22 }),
				tpl('Bottom strip', 'x-bottom.png', { x: 0.04, y: 0.76, w: 0.92, h: 0.20 }),
				tpl('Message panel', 'x-message.png', { x: 0.43, y: 0.10, w: 0.53, h: 0.80 })
			]),
		product('qr-code-label', 'QR Code Label', 'qr-code-labels', '', 'qr', 'square', '#1D5B33',
			'Paste a link — the editor generates the QR code. Four layouts: from a blank QR canvas to menu and thank-you designs.',
			[
				tpl('Generate your QR', 'qr-generate.png', { x: 0.01, y: 0.01, w: 0.98, h: 0.98 }),
				tpl('Our Menu — scan here', 'qr-menu.png', { x: 0.06, y: 0.29, w: 0.88, h: 0.57 }),
				tpl('Thank You + QR', 'qr-thankyou.png', { x: 0.03, y: 0.07, w: 0.27, h: 0.86 }),
				tpl('Social Media + QR', 'qr-social.png', { x: 0.03, y: 0.07, w: 0.27, h: 0.86 })
			]),
		product('promo-label', 'Promotional Label', 'promotional-labels', '', 'tag', 'rectangle', '#E8590C',
			'Create your own promotion: sales, launches and limited offers on a full-canvas template.',
			[
				tpl('Portrait', 'promo-rect.png', { x: 0.01, y: 0.01, w: 0.98, h: 0.98 }),
				tpl('Square', 'promo-square.png', { x: 0.01, y: 0.01, w: 0.98, h: 0.98 })
			]),
		product('branded-label', 'Branded Label', 'branded-labels', '', 'badge', 'rectangle', '#1D5B33',
			'Your logo, your colours — a full printable canvas in two formats.',
			[
				tpl('Portrait', 'brand-rect.png', { x: 0.01, y: 0.01, w: 0.98, h: 0.98 }),
				tpl('Square', 'brand-square.png', { x: 0.01, y: 0.01, w: 0.98, h: 0.98 })
			]),
		product('tamper-seal', 'Tamper-Evident Seal', 'tamper-evident-labels', '', 'shield', 'rectangle', '#1B2A20',
			'Splits cleanly when opened — customers see their food arrives untouched.', null),
		product('thank-you-stickers', 'Thank You Stickers', 'customer-appreciation-stickers', '', 'heart', 'square', '#E8590C',
			'Five designer thank-you layouts — drop your restaurant name into the printable zone and go.',
			[
				tpl('Thanks — blue', 'thanks-blue.png', { x: 0.18, y: 0.25, w: 0.64, h: 0.19 }),
				tpl('Thanks · Gracias · Merci', 'thanks-multi.png', { x: 0.14, y: 0.30, w: 0.70, h: 0.42 }),
				tpl('You Rock!', 'thanks-rock.png', { x: 0.05, y: 0.06, w: 0.52, h: 0.52 }),
				tpl('Your Support', 'thanks-support.png', { x: 0.13, y: 0.05, w: 0.74, h: 0.15 }),
				tpl('Gratitude Grows', 'thanks-gratitude.png', { x: 0.03, y: 0.09, w: 0.55, h: 0.21 })
			]),
		product('food-certification-label', 'Food Certification Label', 'food-identification-labels', '', 'utensils', 'rectangle', '#1D5B33',
			'Allergy, Halal and Kosher certification labels — your brand in the top zone, the certification mark stays fixed.',
			[
				tpl('Allergy', 'food-allergy.png', { x: 0.05, y: 0.03, w: 0.90, h: 0.28 }),
				tpl('Halal Certified', 'food-halal.png', { x: 0.05, y: 0.03, w: 0.90, h: 0.28 }),
				tpl('Kosher Certified', 'food-kosher.png', { x: 0.05, y: 0.03, w: 0.90, h: 0.28 })
			])
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
		{ file: 'sparkle.svg', label: 'Sparkle' },
		{ file: 'taco.svg', label: 'Taco' },
		{ file: 'sushi.svg', label: 'Sushi' },
		{ file: 'cupcake.svg', label: 'Cupcake' },
		{ file: 'icecream.svg', label: 'Ice cream' },
		{ file: 'drink.svg', label: 'Drink cup' },
		{ file: 'bowl.svg', label: 'Noodle bowl' },
		{ file: 'bread.svg', label: 'Bread' },
		{ file: 'apple.svg', label: 'Apple' },
		{ file: 'chili.svg', label: 'Chili — spicy' },
		{ file: 'snowflake.svg', label: 'Snowflake — frozen' },
		{ file: 'crown.svg', label: 'Crown' },
		{ file: 'thumbsup.svg', label: 'Thumbs up' },
		{ file: 'badge100.svg', label: '100% badge' }
	];

	// The One Question poll (per client spec): changing the id replaces the
	// question — the new one starts at zero and old results stay archived
	// in the admin area.
	var POLL = {
		id: 'q1',
		question: 'What matters most to your business on takeout packaging?',
		options: ['Getting more social media followers', 'Reviews and repeat orders', 'Food safety and certification info'],
		seed: [61, 48, 28]
	};

	window.ATO_DATA = {
		icon: icon,
		categories: CATEGORIES,
		products: PRODUCTS,
		taxRates: TAX_RATES,
		fonts: FONTS,
		clipart: CLIPART,
		poll: POLL,
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
