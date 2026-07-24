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

	// Category marketing copy comes from Stephen's REVISED page PDFs
	// (July 2026 drive folder, preserved in repo client-assets/).
	var CATEGORIES = [
		{
			slug: 'social-media-labels', name: 'Social Media Labels', icon: 'megaphone',
			desc: 'Turn every takeout order into a follower.', subs: ['TikTok', 'Facebook', 'Instagram', 'X (Twitter)'],
			photo: 'assets/img/social-chefalex.jpg',
			long: [
				'Custom social media labels make it easy for customers to find and follow your restaurant online. Add them to takeout bags, boxes, cups, and containers to grow your audience, promote offers, and keep your brand active long after the order is delivered.',
				'Customize your labels with your social media handles or links, brand colors and logo, calls-to-action (Follow us, Tag us, Share your meal), and restaurant-themed design elements. Choose a template, add your details, and get high-quality printed labels ready for your packaging.'
			],
			bullets: ['Increase followers and online engagement', 'Turn customers into long-term social media audiences', 'Promote specials, events, and new menu items', 'Strengthen brand visibility across platforms', 'Low-cost marketing on every order', 'Works perfectly on takeout packaging and delivery orders']
		},
		{
			slug: 'qr-code-labels', name: 'QR Code Labels', icon: 'qr',
			desc: 'Turn every takeout order into a direct marketing channel.', subs: [],
			photo: 'assets/img/qr-menu.jpg',
			long: [
				'Create custom QR code labels in minutes using our built-in QR Code Generator—no design experience needed. Link customers straight to your menu, website, Google reviews, ordering platforms, or social media.',
				'Designed for takeout bags, cups, boxes, and food containers, these QR code stickers help you turn offline customers into online traffic, reviews, and repeat orders. Every order includes free professional design support from real designers who check your artwork for clarity, accuracy, and print quality.'
			],
			bullets: ['Turn packaging into a 24/7 marketing tool', 'Drive more Google reviews and online visibility', 'Increase direct orders and reduce third-party fees', 'Send customers directly to menus and ordering pages', 'Promote social media and special offers instantly', 'Build repeat business from every order']
		},
		{
			slug: 'promotional-labels', name: 'Promotional Labels', icon: 'tag',
			desc: 'Turn every takeout order into advertising.', subs: [],
			photo: 'assets/img/promo-roll.jpg',
			long: [
				'Custom promotional labels help restaurants promote special offers, limited-time deals, new menu items, events, and loyalty programs directly on their packaging. Every order becomes a way to keep your brand and message in front of customers long after they leave.',
				'More than just labels, they are a low-cost marketing tool that helps increase brand awareness, boost sales during promotions, drive repeat orders, and keep customers engaged with your offers.'
			],
			bullets: ['Promote special offers, deals, and new menu items', 'Turn packaging into ongoing advertising', 'Increase repeat orders and customer engagement', 'Strengthen brand awareness with every order', 'Flexible materials, sizes, and quantities available', 'Easy updates for seasonal or limited-time campaigns', 'Professional design review included on every order']
		},
		{
			slug: 'branded-labels', name: 'Branded Labels', icon: 'badge',
			desc: 'Turn every order into a branding opportunity.', subs: [],
			photo: 'assets/img/branded-foodtruck.jpg',
			long: [
				'Create custom branded labels in minutes using our simple online design tool—no design experience needed. Upload your logo, add your artwork, and design professional labels that make your packaging instantly recognizable.',
				'Perfect for takeout bags, food containers, cups, pizza boxes, and delivery packaging, these custom restaurant labels help your business look more professional and memorable with every order you send out. Strong branding increases customer trust, improves recognition, and encourages repeat orders—turning one-time buyers into loyal customers.'
			],
			bullets: ['Build strong, consistent brand recognition', 'Make takeout packaging look professional and premium', 'Increase customer trust and perceived value', 'Encourage repeat orders and customer loyalty', 'Stand out from competitors in a crowded market', 'Easy reordering with saved artwork on file']
		},
		{
			slug: 'tamper-evident-labels', name: 'Tamper-Evident Labels', icon: 'shield',
			desc: 'Seal It, Brand It, Protect It.', subs: [],
			photo: 'assets/img/tamper-roll.jpg',
			long: [
				'Create tamper-evident labels that match your restaurant’s brand while making food protection visible. You can place your logo, brand name, or artwork directly on the template for a clean, professional look that reinforces trust with every order.',
				'Our Tamper Evident Labels are designed for restaurants that want to show customers their order was sealed with care before pickup or delivery. They add visible reassurance to takeout and delivery orders, helping customers feel more comfortable from handoff to first bite.'
			],
			bullets: ['Make sealed packaging clearly visible to customers', 'Show customers their order was closed with care', 'Add trust and reassurance at pickup or delivery', 'Build professionalism into every handoff', 'Strengthen brand recognition', 'Ideal for paper takeout bags, delivery orders, and catering packaging']
		},
		{
			slug: 'customer-appreciation-stickers', name: 'Customer Appreciation', icon: 'heart',
			desc: 'Show some love to the backbone of your business—your repeat customers.', subs: [],
			photo: 'assets/img/appreciation-erik.jpg',
			long: [
				'Custom customer appreciation stickers help restaurants turn every order into a personal experience. Add a simple “thank you” that makes customers feel valued, recognized, and more likely to return.',
				'Make your regular customers feel special with personalized name-based stickers designed for repeat business. Simply provide 5, 10, or 15 customer names, and our design team will create a set of custom appreciation stickers using professionally designed templates. No design experience needed. We handle the layout, styling, and print-ready setup for you.'
			],
			bullets: ['Strengthen loyalty with repeat customers', 'Add a personal touch to every order', 'Increase customer retention and repeat visits', 'Turn packaging into a positive brand experience', 'Encourage word-of-mouth and social sharing', 'Easy personalized design process—no effort required', 'Professionally designed, print-ready sticker sets']
		},
		{
			slug: 'food-identification-labels', name: 'Food Identification', icon: 'utensils',
			desc: 'Stay fast, organized, and on-brand.', subs: [],
			photo: 'assets/img/food-halal.jpg',
			// Verbatim from Stephen's Food Identification Labels page copy.
			heading: 'Custom Food Identification Labels & Stickers for Restaurants',
			long: [
				'Custom food identification labels help busy restaurants clearly mark orders, dietary needs, and packaging details without slowing down service. Designed for fast-paced kitchens, these labels improve accuracy while keeping your branding visible on every order.',
				'Perfect for takeout bags, boxes, containers, and delivery orders, they help your team move faster while reducing mistakes and improving customer experience.',
				'<h3>Branding Made Simple</h3>',
				'You don’t need a designer to look professional.',
				'Use our easy online design tool and pre-made templates to create clean, consistent food labels in minutes.',
				'Customize your labels with:',
				'<ul class="bullet-list"><li>Your logo or artwork</li><li>Brand colours and fonts</li><li>Dietary icons (Vegan, Gluten-Free, Dairy-Free, etc.)</li><li>Custom text for order identification or instructions</li></ul>',
				'Simply choose a template, personalize it, and create professional food identification labels ready for printing.',
				'<h3>Built for Better Service</h3>',
				'Food identification labels do more than organize orders—they improve customer confidence.',
				'Clearly mark menu items, dietary requirements, and special instructions so customers receive exactly what they ordered. This reduces mistakes, speeds up service, and improves overall kitchen efficiency.',
				'At the same time, every label reinforces your brand identity on every box, bag, and container leaving your kitchen.'
			],
			whyTitle: 'Why Restaurants Choose Food Identification Labels',
			bullets: ['Improve order accuracy and reduce mistakes', 'Speed up kitchen workflow and service times', 'Clearly mark dietary and allergy requirements', 'Strengthen customer trust and confidence', 'Keep packaging organized in busy environments', 'Add professional branding to every order', 'Works for takeout, delivery, and dine-in packaging'],
			outro: [
				'<h3>Built for Busy Restaurant Kitchens</h3>',
				'Food identification labels are designed for restaurants that need speed, clarity, and consistency.',
				'From order prep to delivery, every label helps your team stay organized while ensuring customers receive accurate, clearly marked meals—every time.'
			]
		}
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
		product('tiktok-label', 'TikTok Label', 'social-media-labels', 'TikTok', 'megaphone', 'rectangle', '#182A3D',
			'Your TikTok where hungry people already look — right on the bag. Pick a layout, then customize the editable zone.',
			[
				tpl('Address zone', 'tt-address.png', { x: 0.43, y: 0.5817, w: 0.5253, h: 0.19 }),
				tpl('Bottom strip', 'tt-bottom.png', { x: 0.022, y: 0.8553, w: 0.9582, h: 0.1203 }),
				tpl('Message panel', 'tt-message.png', { x: 0.393, y: 0.0333, w: 0.595, h: 0.94 })
			]),
		product('instagram-label', 'Instagram Label', 'social-media-labels', 'Instagram', 'megaphone', 'rectangle', '#2E6DB4',
			'A follow-us sticker your customers will actually photograph. Fixed Instagram artwork, your details in the printable area.',
			[
				tpl('Address zone', 'ig-address.png', { x: 0.3221, y: 0.6289, w: 0.6298, h: 0.2186 }),
				tpl('Message panel', 'ig-message.png', { x: 0.3343, y: 0.0309, w: 0.6549, h: 0.932 })
			]),
		product('facebook-label', 'Facebook Label', 'social-media-labels', 'Facebook', 'megaphone', 'rectangle', '#2E639E',
			'Point customers to your page for reviews, events and specials — three layouts, one editable zone each.',
			[
				tpl('Address zone', 'fb-address.png', { x: 0.362, y: 0.6167, w: 0.6073, h: 0.1967 }),
				tpl('Bottom strip', 'fb-bottom.png', { x: 0.022, y: 0.8553, w: 0.9582, h: 0.1203 }),
				tpl('Message panel', 'fb-message.png', { x: 0.397, y: 0.0333, w: 0.592, h: 0.94 })
			]),
		product('x-twitter-label', 'X (Twitter) Label', 'social-media-labels', 'X (Twitter)', 'megaphone', 'rectangle', '#182A3D',
			'Short, sharp and scannable — your X handle on every order.',
			[
				tpl('Address zone', 'x-address.png', { x: 0.362, y: 0.6167, w: 0.6073, h: 0.1967 }),
				tpl('Bottom strip', 'x-bottom.png', { x: 0.022, y: 0.8553, w: 0.9582, h: 0.1203 }),
				tpl('Message panel', 'x-message.png', { x: 0.402, y: 0.0333, w: 0.586, h: 0.94 })
			]),
		product('qr-code-label', 'QR Code Label', 'qr-code-labels', '', 'qr', 'square', '#2E639E',
			'Paste a link — the editor generates the QR code. Four layouts: from a blank QR canvas to menu and thank-you designs.',
			[
				tpl('Generate your QR', 'qr-generate.png', { x: 0.0122, y: 0.0122, w: 0.9744, h: 0.9744 }),
				tpl('Our Menu — scan here', 'qr-menu.png', { x: 0.06, y: 0.3, w: 0.88, h: 0.545 }),
				tpl('Thank You + QR', 'qr-thankyou.png', { x: 0.0108, y: 0.0309, w: 0.297, h: 0.9402 }),
				tpl('Social Media + QR', 'qr-social.png', { x: 0.0108, y: 0.0309, w: 0.297, h: 0.9402 })
			]),
		product('promo-label', 'Promotional Label', 'promotional-labels', '', 'tag', 'rectangle', '#2E6DB4',
			'Create your own promotion: sales, launches and limited offers on a full-canvas template.',
			[
				tpl('Portrait', 'promo-rect.png', { x: 0.0233, y: 0.0156, w: 0.9517, h: 0.9678 }),
				tpl('Square', 'promo-square.png', { x: 0.0122, y: 0.0122, w: 0.9744, h: 0.9744 })
			]),
		product('branded-label', 'Branded Label', 'branded-labels', '', 'badge', 'rectangle', '#2E639E',
			'Your logo, your colours — a full printable canvas in two formats.',
			[
				tpl('Portrait', 'brand-rect.png', { x: 0.0233, y: 0.0156, w: 0.9517, h: 0.9678 }),
				tpl('Square', 'brand-square.png', { x: 0.0122, y: 0.0122, w: 0.9744, h: 0.9744 })
			]),
		product('tamper-seal', 'Tamper-Evident Seal', 'tamper-evident-labels', '', 'shield', 'rectangle', '#182A3D',
			'Splits cleanly when opened — customers see their food arrives untouched.', null),
		product('thank-you-stickers', 'Thank You Stickers', 'customer-appreciation-stickers', '', 'heart', 'square', '#2E6DB4',
			'Five designer thank-you layouts — drop your restaurant name into the printable zone and go.',
			[
				tpl('Thanks — blue', 'thanks-blue.png', { x: 0.18, y: 0.25, w: 0.64, h: 0.19 }),
				tpl('Thanks · Gracias · Merci', 'thanks-multi.png', { x: 0.14, y: 0.30, w: 0.70, h: 0.42 }),
				tpl('You Rock!', 'thanks-rock.png', { x: 0.05, y: 0.06, w: 0.52, h: 0.52 }),
				tpl('Your Support', 'thanks-support.png', { x: 0.13, y: 0.05, w: 0.74, h: 0.15 }),
				tpl('Gratitude Grows', 'thanks-gratitude.png', { x: 0.03, y: 0.09, w: 0.55, h: 0.21 })
			]),
		product('food-certification-label', 'Food Certification Label', 'food-identification-labels', '', 'utensils', 'rectangle', '#2E639E',
			'Allergy, Halal and Kosher certification labels — your brand in the top zone, the certification mark stays fixed.',
			[
				tpl('Allergy', 'food-allergy.png', { x: 0.0183, y: 0.0122, w: 0.955, h: 0.3244 }),
				tpl('Halal Certified', 'food-halal.png', { x: 0.0183, y: 0.0122, w: 0.955, h: 0.3944 }),
				tpl('Kosher Certified', 'food-kosher.png', { x: 0.0183, y: 0.0122, w: 0.955, h: 0.4267 })
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
	// One Question REVISED (July 2026): new question — the old one is
	// auto-archived by the id change and stays visible in the admin area.
	var POLL = {
		id: 'q2',
		question: 'What is the greatest challenge for your takeout business?',
		options: ['Eco-friendly packaging costs', 'Food tampering/security', 'High delivery commission fees', 'Shifting from dine-in to takeout', 'Unreliable delivery pickups/cancellations'],
		seed: [17, 24, 31, 12, 21]
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
