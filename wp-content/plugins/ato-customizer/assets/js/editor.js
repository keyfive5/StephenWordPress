/**
 * ATO Customizer — label design editor.
 *
 * Two modes (set by atoEditorData.mode):
 *  - "customer": product page. Config wizard (template/material/size/shape/quantity)
 *    then the canvas. Saving stores the design and attaches it to the add-to-cart form.
 *  - "admin": ATO Designs screen. Loads an existing design for review/refinement;
 *    saving updates it and appends to the edit history.
 *
 * Built on Fabric.js 5 + qrcodejs. No build step — plain ES5-compatible browser JS.
 */
(function () {
	'use strict';

	if (typeof window.atoEditorData === 'undefined' || typeof window.fabric === 'undefined') {
		return;
	}

	var DATA = window.atoEditorData;
	var I18N = DATA.i18n || {};
	var EXTRA_PROPS = ['atoType', 'atoName', 'selectable', 'evented'];

	var canvas = null;
	var logicalW = 500;
	var logicalH = 500;
	var currentShape = 'square';
	var selections = {};           // template/material/size/shape/quantity labels
	var designId = DATA.designId ? parseInt(DATA.designId, 10) : 0;
	var undoStack = [];
	var redoStack = [];
	var suppressHistory = false;
	var dirty = false;
	var printArea = null;   // px rect when a template defines a printable area
	var templateUrl = '';

	// ---------------------------------------------------------------------
	// DOM helpers
	// ---------------------------------------------------------------------
	function $(id) { return document.getElementById(id); }

	function toast(message, isError) {
		var el = $('ato-ed-toast');
		if (!el) return;
		el.textContent = message;
		el.classList.toggle('is-error', !!isError);
		el.hidden = false;
		clearTimeout(el._t);
		el._t = setTimeout(function () { el.hidden = true; }, 3500);
	}

	// ---------------------------------------------------------------------
	// Overlay open / close
	// ---------------------------------------------------------------------
	function openOverlay() {
		$('ato-editor').hidden = false;
		document.body.style.overflow = 'hidden';

		if (DATA.mode === 'admin') {
			$('ato-ed-wizard').hidden = true;
			$('ato-ed-main').hidden = false;
			loadAdminDesign();
		} else {
			$('ato-ed-main').hidden = true;
			$('ato-ed-wizard').hidden = false;
			startWizard();
		}
		var closeBtn = $('ato-ed-close');
		if (closeBtn) closeBtn.focus();
	}

	function closeOverlay(force) {
		if (!force && dirty && !window.confirm(I18N.confirmClose || 'Close the editor? Unsaved changes will be lost.')) {
			return;
		}
		$('ato-editor').hidden = true;
		document.body.style.overflow = '';
	}

	// ---------------------------------------------------------------------
	// Config wizard (customer mode)
	// ---------------------------------------------------------------------
	var wizardSteps = [];
	var wizardIndex = 0;

	/** Sizes must match the template's proportions. */
	var SIZES_BY_SHAPE = {
		square: ['2" x 2"', '3" x 3"', '4" x 4"'],
		rectangle: ['2" x 3"', '3" x 4"', '4" x 6"']
	};

	/**
	 * Money helpers. The host page supplies the active currency; when a
	 * tier carries a price the owner typed in that currency it is shown
	 * as-is rather than converted from USD.
	 */
	function curSymbol() { return (DATA.money && DATA.money.symbol) ? DATA.money.symbol : '$'; }
	function curRate() { return (DATA.money && DATA.money.rate) ? DATA.money.rate : 1; }
	function isCad() { return !!(DATA.money && DATA.money.code === 'CAD'); }

	function localAmount(usd, cadOverride) {
		if (isCad() && cadOverride !== null && cadOverride !== undefined && isFinite(cadOverride)) {
			return Number(cadOverride);
		}
		return usd * curRate();
	}
	function fmtMoney(usd, cadOverride) {
		return curSymbol() + (Math.round(localAmount(usd, cadOverride) * 100) / 100).toFixed(2);
	}
	function fmtUnit(usd, cadOverride) {
		return curSymbol() + localAmount(usd, cadOverride).toFixed(3);
	}

	/**
	 * Steps always run in the client-mandated order:
	 *   Material → Shape → Size → Quantity → Start design.
	 * When the customer already picked a template on the product page the
	 * template *is* the shape, so both the template and shape steps drop
	 * out and sizes are drawn from the template's own proportions.
	 */
	function startWizard() {
		var cfg = DATA.config || {};
		wizardSteps = [];
		selections = {};

		var preset = cfg.presetTemplate || null;
		if (preset) {
			selections.template = preset.name;
			selections.template_image = preset.image || '';
			selections.template_area = preset.area || null;
			selections.shape_value = preset.shape || 'rectangle';
			selections.restrict = preset.restrict || null;
		} else if (cfg.templates && cfg.templates.length > 1) {
			wizardSteps.push({
				key: 'template',
				label: I18N.stepTemplate || 'Template',
				options: cfg.templates.map(function (t) {
					return { label: t.name, image: t.image, area: t.area || null, value: t.shape || 'rectangle', restrict: t.restrict || null };
				})
			});
		}

		if (cfg.materials && cfg.materials.length) {
			wizardSteps.push({ key: 'material', label: I18N.stepMaterial || 'Material', options: cfg.materials.map(function (m) { return { label: m }; }) });
		}
		if (!preset && cfg.shapes && cfg.shapes.length) {
			wizardSteps.push({ key: 'shape', label: I18N.stepShape || 'Shape', options: cfg.shapes.map(function (s) { return { label: s.label, value: s.shape }; }) });
		}
		// Size options depend on the shape chosen just before, so they are
		// resolved when the step renders rather than up front.
		wizardSteps.push({
			key: 'size',
			label: I18N.stepSize || 'Size',
			optionsFn: function () {
				var shape = selections.shape_value || (preset && preset.shape) || 'rectangle';
				return (SIZES_BY_SHAPE[shape] || SIZES_BY_SHAPE.rectangle).map(function (s) { return { label: s }; });
			}
		});
		if (cfg.quantities && cfg.quantities.length) {
			// The two prices do the selling, so the tile carries nothing but
			// them plus the quantity: no repeated "per roll" / "per label".
			// The unit price is what nudges shoppers up the ladder, so the
			// cheapest-per-label tier is flagged.
			var qtys = cfg.quantities;
			var best = 0;
			qtys.forEach(function (q, i) {
				if (q.price / q.qty < qtys[best].price / qtys[best].qty) best = i;
			});
			wizardSteps.push({
				key: 'quantity',
				label: I18N.stepQuantity || 'Quantity',
				options: qtys.map(function (q, i) {
					var cad = (q.cad === null || q.cad === undefined) ? null : Number(q.cad);
					return {
						label: String(q.qty) + ' labels',
						price: q.price,
						priceCad: cad,
						note: fmtUnit(q.price / q.qty, cad === null ? null : cad / q.qty) + ' each',
						badge: i === best ? 'Best value' : null,
						value: String(q.qty)
					};
				})
			});
		}

		wizardIndex = 0;
		renderWizard();
	}

	function renderWizard() {
		var stepsEl = $('ato-ed-wizard-steps');
		var bodyEl = $('ato-ed-wizard-body');
		stepsEl.innerHTML = '';
		bodyEl.innerHTML = '';

		wizardSteps.forEach(function (step, i) {
			var li = document.createElement('li');
			li.textContent = step.label;
			if (i === wizardIndex) li.classList.add('is-active');
			if (i < wizardIndex) li.classList.add('is-done');
			stepsEl.appendChild(li);
		});

		var step = wizardSteps[wizardIndex];
		if (!step) return;

		var h = document.createElement('h3');
		h.textContent = step.label;
		bodyEl.appendChild(h);

		var options = step.optionsFn ? step.optionsFn() : step.options;
		var grid = document.createElement('div');
		grid.className = 'ato-ed-option-grid' + (step.key === 'quantity' ? ' ato-ed-option-grid--qty' : '');
		options.forEach(function (opt) {
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'ato-ed-option';
			if (opt.image) {
				var img = document.createElement('img');
				img.src = opt.image;
				img.alt = '';
				btn.appendChild(img);
			}
			var span = document.createElement('span');
			span.className = 'ato-ed-option-label';
			span.textContent = opt.label;
			btn.appendChild(span);
			if (opt.price !== null && typeof opt.price !== 'undefined') {
				var price = document.createElement('span');
				price.className = 'ato-ed-option-price';
				price.textContent = fmtMoney(Number(opt.price), opt.priceCad);
				btn.appendChild(price);
			}
			if (opt.note) {
				var note = document.createElement('span');
				note.className = 'ato-ed-option-note';
				note.textContent = opt.note;
				btn.appendChild(note);
			}
			if (opt.badge) {
				var badge = document.createElement('span');
				badge.className = 'ato-ed-option-badge';
				badge.textContent = opt.badge;
				btn.appendChild(badge);
			}
			if (selections[step.key] === opt.label) btn.classList.add('is-selected');
			btn.addEventListener('click', function () {
				selections[step.key] = opt.label;
				if (opt.value) selections[step.key + '_value'] = opt.value;
				if (opt.image) selections[step.key + '_image'] = opt.image;
				if (opt.area) selections[step.key + '_area'] = opt.area;
				if (step.key === 'template') selections.restrict = opt.restrict || null;
				grid.querySelectorAll('.ato-ed-option').forEach(function (b) { b.classList.remove('is-selected'); });
				btn.classList.add('is-selected');
			});
			grid.appendChild(btn);
		});
		bodyEl.appendChild(grid);

		$('ato-ed-wizard-back').style.visibility = wizardIndex === 0 ? 'hidden' : 'visible';
		$('ato-ed-wizard-next').textContent = wizardIndex === wizardSteps.length - 1 ? (I18N.startDesign || 'Start designing') : (I18N.next || 'Next');
	}

	function wizardNext() {
		var step = wizardSteps[wizardIndex];
		if (step && !selections[step.key]) {
			// Auto-select the first option so nobody gets stuck.
			var opts = step.optionsFn ? step.optionsFn() : step.options;
			selections[step.key] = opts[0].label;
			if (opts[0].value) selections[step.key + '_value'] = opts[0].value;
			if (opts[0].image) selections[step.key + '_image'] = opts[0].image;
			if (opts[0].area) selections[step.key + '_area'] = opts[0].area;
			if (step.key === 'template') selections.restrict = opts[0].restrict || null;
		}
		if (wizardIndex < wizardSteps.length - 1) {
			wizardIndex++;
			renderWizard();
		} else {
			$('ato-ed-wizard').hidden = true;
			$('ato-ed-main').hidden = false;
			applyToolRestrictions(selections.restrict);
			if (selections.template_image && selections.template_area) {
				initCanvasFromTemplate(selections.template_image, selections.template_area);
			} else {
				initCanvas(selections.shape_value || 'square', selections.template_image || '');
			}
			updateConfigSummary();
		}
	}

	/**
	 * Some templates only need a handle or address, so the toolbar is
	 * narrowed to text/font/colour for them (client request). Passing a
	 * falsy value restores the full toolset.
	 */
	function applyToolRestrictions(mode) {
		var textOnly = mode === 'text';
		[
			['ato-tool-upload-input', true],
			['ato-tool-clipart', false],
			['ato-tool-qr', false]
		].forEach(function (pair) {
			var el = $(pair[0]);
			if (!el) return;
			var host = pair[1] ? el.closest('label') : el;
			if (host) host.style.display = textOnly ? 'none' : '';
		});
		var bgPanel = $('ato-ed-bg-panel');
		if (bgPanel) bgPanel.style.display = textOnly ? 'none' : '';
		var bgTool = $('ato-tool-bg-input');
		if (bgTool && bgTool.closest('label')) bgTool.closest('label').style.display = textOnly ? 'none' : '';
	}

	function wizardBack() {
		if (wizardIndex > 0) {
			wizardIndex--;
			renderWizard();
		}
	}

	function updateConfigSummary() {
		var parts = [];
		['template', 'material', 'size', 'shape', 'quantity'].forEach(function (k) {
			if (selections[k]) parts.push(selections[k]);
		});
		$('ato-ed-config-summary').textContent = parts.join(' · ');
		if (DATA.productName) $('ato-ed-product-name').textContent = DATA.productName;
	}

	// ---------------------------------------------------------------------
	// Canvas
	// ---------------------------------------------------------------------
	function initCanvas(shape, templateImage) {
		printArea = null;
		templateUrl = '';
		currentShape = shape || 'square';
		logicalW = currentShape === 'rectangle' ? 600 : 500;
		logicalH = currentShape === 'rectangle' ? 400 : 500;

		if (canvas) {
			canvas.dispose();
			canvas = null;
		}

		canvas = new fabric.Canvas('ato-canvas', {
			width: logicalW,
			height: logicalH,
			backgroundColor: '#ffffff',
			preserveObjectStacking: true,
			selection: true
		});

		applyShapeMask();
		if (templateImage) {
			setTemplateBackground(templateImage);
		}

		canvas.on('selection:created', refreshProps);
		canvas.on('selection:updated', refreshProps);
		canvas.on('selection:cleared', refreshProps);
		canvas.on('object:added', onObjectAdded);
		canvas.on('object:removed', onCanvasChange);
		canvas.on('object:modified', onCanvasChange);
		canvas.on('text:changed', function () { dirty = true; });
		attachQrGuard();

		undoStack = [];
		redoStack = [];
		dirty = false;
		pushHistory();
		fitCanvas();
		refreshLayers();
		refreshProps();

		window.addEventListener('resize', fitCanvas);
	}

	/**
	 * Printable-area mode: the product template is fixed artwork; only the
	 * defined region is editable. The template loads as a locked bottom
	 * layer, the area gets a dashed guide, and every user object is
	 * clipped to the area so the surrounding artwork stays untouched.
	 *
	 * @param {string} url      Template image URL.
	 * @param {object} areaFrac Printable area as fractions {x, y, w, h} plus
	 *                          an optional `angle` in degrees. Several of
	 *                          Stephen's designs set the name panel on a
	 *                          diagonal, so the zone — its guide, its
	 *                          background fill and the clip applied to the
	 *                          customer's artwork — rotates with it.
	 */
	function initCanvasFromTemplate(url, areaFrac) {
		fabric.Image.fromURL(url, function (img) {
			if (!img || !img.width) { initCanvas('square', ''); return; }
			currentShape = 'template';
			logicalW = img.width;
			logicalH = img.height;
			if (canvas) { canvas.dispose(); canvas = null; }
			canvas = new fabric.Canvas('ato-canvas', {
				width: logicalW,
				height: logicalH,
				backgroundColor: '#ffffff',
				preserveObjectStacking: true,
				selection: true
			});
			printArea = {
				left: Math.round(areaFrac.x * logicalW),
				top: Math.round(areaFrac.y * logicalH),
				width: Math.round(areaFrac.w * logicalW),
				height: Math.round(areaFrac.h * logicalH),
				angle: areaFrac.angle || 0
			};
			templateUrl = url;
			img.set({ left: 0, top: 0, selectable: false, evented: false, atoType: 'template', atoName: 'Template (locked)' });
			canvas.add(img);
			canvas.sendToBack(img);
			// Blank out the printable zone: the template's baked-in
			// placeholder text ("Your Address Here" etc.) must not show
			// under the customer's design. The colour tool recolors this.
			setAreaBackground('#ffffff');
			addAreaCutline();

			canvas.on('selection:created', refreshProps);
			canvas.on('selection:updated', refreshProps);
			canvas.on('selection:cleared', refreshProps);
			canvas.on('object:added', onObjectAdded);
			canvas.on('object:removed', onCanvasChange);
			canvas.on('object:modified', onCanvasChange);
			canvas.on('text:changed', function () { dirty = true; });
			attachQrGuard();

			undoStack = [];
			redoStack = [];
			dirty = false;
			pushHistory();
			fitCanvas();
			refreshLayers();
			refreshProps();
			window.addEventListener('resize', fitCanvas);
		}, { crossOrigin: 'anonymous' });
	}

	/** The zone's tilt, in degrees. 0 for the axis-aligned templates. */
	function zoneAngle() {
		return (printArea && printArea.angle) || 0;
	}

	/**
	 * Fabric geometry matching the printable zone, optionally inflated.
	 * Anchored at the centre so `angle` pivots about the middle of the
	 * zone rather than its top-left corner.
	 */
	function areaRectProps(padX, padY) {
		padX = padX || 0;
		padY = padY || 0;
		return {
			left: printArea.left + printArea.width / 2,
			top: printArea.top + printArea.height / 2,
			originX: 'center',
			originY: 'center',
			width: printArea.width + padX * 2,
			height: printArea.height + padY * 2,
			angle: zoneAngle()
		};
	}

	/** Dashed guide around the printable area. */
	function addAreaCutline() {
		if (!printArea || !canvas) return;
		var cut = new fabric.Rect(Object.assign(areaRectProps(), {
			fill: 'transparent',
			stroke: '#2E6DB4',
			strokeDashArray: [7, 6],
			strokeWidth: 2,
			selectable: false,
			evented: false,
			excludeFromExport: true,
			atoType: 'cutline'
		}));
		canvas.add(cut);
		canvas.bringToFront(cut);
	}

	/** In template mode the canvas background sits behind the locked
	 * artwork, so "background colour" means filling the printable area
	 * itself — a locked rect kept just above the template layer. */
	function setAreaBackground(color) {
		if (!printArea || !canvas) return;
		var existing = null;
		canvas.getObjects().forEach(function (o) { if (o.atoType === 'areabg') existing = o; });
		if (existing) {
			existing.set('fill', color);
		} else {
			// Overspill the measured zone slightly. The template's printed
			// box has soft/anti-aliased edges, so an exactly-sized rect left
			// a pale hairline of the original placeholder showing through.
			var padX = Math.max(3, Math.round(printArea.width * 0.012));
			var padY = Math.max(3, Math.round(printArea.height * 0.012));
			var bg = new fabric.Rect(Object.assign(areaRectProps(padX, padY), {
				fill: color,
				selectable: false,
				evented: false,
				atoType: 'areabg',
				atoName: 'Area background'
			}));
			canvas.add(bg);
			// keep it right above the template artwork
			canvas.getObjects().forEach(function (o) {
				if (o.atoType === 'template') canvas.sendToBack(o);
			});
			canvas.sendToBack(bg);
			canvas.getObjects().forEach(function (o) {
				if (o.atoType === 'template') canvas.sendToBack(o);
			});
		}
		canvas.requestRenderAll();
		dirty = true;
	}

	/** Clip a user object to the printable area (template mode only). */
	function clipToArea(obj) {
		if (!printArea || !obj || obj.atoType === 'cutline' || obj.atoType === 'template' || obj.clipPath) return;
		obj.clipPath = new fabric.Rect(Object.assign(areaRectProps(), {
			absolutePositioned: true
		}));
	}

	function onObjectAdded(e) {
		if (e && e.target) clipToArea(e.target);
		onCanvasChange();
	}

	/** Where new elements land + how big they start. */
	function contentCenter() {
		if (printArea) {
			return { x: printArea.left + printArea.width / 2, y: printArea.top + printArea.height / 2 };
		}
		return { x: logicalW / 2, y: logicalH / 2 };
	}
	function refBox() {
		return printArea ? { w: printArea.width, h: printArea.height } : { w: logicalW, h: logicalH };
	}

	/** Dashed cut line + clip mask matching the chosen shape. */
	function applyShapeMask() {
		var pad = 14;
		var cut;
		if (currentShape === 'circle') {
			var r = Math.min(logicalW, logicalH) / 2;
			canvas.clipPath = new fabric.Circle({ radius: r, left: logicalW / 2, top: logicalH / 2, originX: 'center', originY: 'center', absolutePositioned: true });
			cut = new fabric.Circle({
				radius: r - pad, left: logicalW / 2, top: logicalH / 2,
				originX: 'center', originY: 'center'
			});
		} else {
			var rx = currentShape === 'square' ? 24 : 18;
			canvas.clipPath = new fabric.Rect({ width: logicalW, height: logicalH, rx: rx, ry: rx, left: 0, top: 0, absolutePositioned: true });
			cut = new fabric.Rect({
				width: logicalW - pad * 2, height: logicalH - pad * 2,
				rx: rx, ry: rx, left: pad, top: pad
			});
		}
		cut.set({
			fill: 'transparent',
			stroke: '#2E6DB4',
			strokeDashArray: [7, 6],
			strokeWidth: 1.5,
			selectable: false,
			evented: false,
			excludeFromExport: true,
			atoType: 'cutline'
		});
		canvas.add(cut);
		canvas.sendToBack(cut);
		canvas.bringToFront(cut);
	}

	function setTemplateBackground(url) {
		fabric.Image.fromURL(url, function (img) {
			if (!img || !img.width) return;
			var scale = Math.max(logicalW / img.width, logicalH / img.height);
			canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
				scaleX: scale,
				scaleY: scale,
				left: logicalW / 2,
				top: logicalH / 2,
				originX: 'center',
				originY: 'center'
			});
		}, { crossOrigin: 'anonymous' });
	}

	/** Scale the canvas down to fit its container (logical size unchanged). */
	function fitCanvas() {
		if (!canvas) return;
		var wrap = $('ato-ed-canvas-wrap');
		if (!wrap) return;
		var available = Math.max(240, Math.min(wrap.parentElement.clientWidth - 48, 640));
		var scale = Math.min(1, available / logicalW);
		canvas.setDimensions({ width: logicalW * scale, height: logicalH * scale });
		canvas.setZoom(scale);
		canvas.requestRenderAll();
	}

	/** Export a clean PNG at print-friendly resolution regardless of screen zoom. */
	function exportPNG() {
		var zoom = canvas.getZoom();
		canvas.setDimensions({ width: logicalW, height: logicalH });
		canvas.setZoom(1);
		canvas.discardActiveObject();
		canvas.requestRenderAll();
		var url = canvas.toDataURL({ format: 'png', multiplier: 2 });
		canvas.setDimensions({ width: logicalW * zoom, height: logicalH * zoom });
		canvas.setZoom(zoom);
		canvas.requestRenderAll();
		return url;
	}

	// ---------------------------------------------------------------------
	// History
	// ---------------------------------------------------------------------
	function onCanvasChange() {
		if (suppressHistory) return;
		dirty = true;
		pushHistory();
		refreshLayers();
	}

	function pushHistory() {
		undoStack.push(JSON.stringify(canvas.toJSON(EXTRA_PROPS)));
		if (undoStack.length > 40) undoStack.shift();
		redoStack = [];
		updateHistoryButtons();
	}

	function restoreState(state) {
		suppressHistory = true;
		canvas.loadFromJSON(state, function () {
			canvas.getObjects().forEach(function (o) {
				if (o.atoType === 'template') { o.set({ selectable: false, evented: false }); canvas.sendToBack(o); }
				else if (o.atoType === 'areabg') { o.set({ selectable: false, evented: false }); }
				else if (o.atoType !== 'cutline') { o.set({ selectable: true, evented: true }); }
			});
			canvas.getObjects().forEach(function (o) { if (o.atoType === 'areabg') canvas.sendToBack(o); });
			canvas.getObjects().forEach(function (o) { if (o.atoType === 'template') canvas.sendToBack(o); });
			// Cut line is excluded from export/serialization — put it back.
			var hasCut = canvas.getObjects().some(function (o) { return o.atoType === 'cutline'; });
			if (!hasCut) { if (printArea) { addAreaCutline(); } else { applyShapeMask(); } }
			canvas.renderAll();
			suppressHistory = false;
			refreshLayers();
		});
	}

	function undo() {
		if (undoStack.length < 2) return;
		redoStack.push(undoStack.pop());
		restoreState(undoStack[undoStack.length - 1]);
		updateHistoryButtons();
	}

	function redo() {
		if (!redoStack.length) return;
		var state = redoStack.pop();
		undoStack.push(state);
		restoreState(state);
		updateHistoryButtons();
	}

	function updateHistoryButtons() {
		$('ato-ed-undo').disabled = undoStack.length < 2;
		$('ato-ed-redo').disabled = !redoStack.length;
	}

	// ---------------------------------------------------------------------
	// Tools
	// ---------------------------------------------------------------------
	/** Font entries are {label, stack, weight, style}; older configs may
	 *  still pass plain strings. */
	function fontList() {
		return (DATA.fonts || []).map(function (f) {
			return typeof f === 'string' ? { label: f, stack: f } : f;
		});
	}
	function defaultFont() {
		var list = fontList();
		return list.length ? list[0] : { label: 'Montserrat Bold', stack: '"Montserrat", sans-serif', weight: 700 };
	}

	function addText() {
		var c = contentCenter();
		var box = refBox();
		var def = defaultFont();
		var text = new fabric.IText(I18N.yourText || 'Your text', {
			left: c.x,
			top: c.y,
			originX: 'center',
			originY: 'center',
			angle: zoneAngle(),
			fontFamily: def.stack,
			fontWeight: def.weight || 'normal',
			fontStyle: def.style || 'normal',
			fontSize: Math.max(20, Math.round(Math.min(box.w, box.h) * 0.2)),
			fill: '#182a3d',
			atoName: 'Text',
			atoFontLabel: def.label,
			// A loud selection box so it is obvious the text tool is live
			// (customers were clicking past a faint outline).
			borderColor: '#2E6DB4',
			borderScaleFactor: 3,
			cornerColor: '#2E6DB4',
			cornerStrokeColor: '#FFFFFF',
			cornerSize: 12,
			transparentCorners: false,
			padding: 6
		});
		text.atoPlaceholder = true;
		text.on('editing:entered', function () {
			if (text.atoPlaceholder) {
				text.atoPlaceholder = false;
				text.text = '';
				text.hiddenTextarea && (text.hiddenTextarea.value = '');
				text.setSelectionStart(0);
				text.setSelectionEnd(0);
				canvas.requestRenderAll();
			}
		});
		// Nothing typed? Remove the empty text object instead of leaving
		// an invisible layer behind.
		text.on('editing:exited', function () {
			if (!text.text || !text.text.trim()) {
				canvas.remove(text);
				canvas.requestRenderAll();
				refreshLayers();
			}
		});
		canvas.add(text);
		canvas.setActiveObject(text);
		text.enterEditing();
		text.selectAll();
	}

	function addUploadedImage(file) {
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			toast(I18N.imageTooBig || 'That image is over 2 MB. Please use a smaller file.', true);
			return;
		}
		var reader = new FileReader();
		reader.onload = function (e) {
			fabric.Image.fromURL(e.target.result, function (img) {
				var c = contentCenter();
				var box = refBox();
				var scale = Math.min((box.w * 0.8) / img.width, (box.h * 0.8) / img.height, 1);
				img.set({
					left: c.x,
					top: c.y,
					originX: 'center',
					originY: 'center',
					angle: zoneAngle(),
					scaleX: scale,
					scaleY: scale,
					atoName: file.name
				});
				canvas.add(img);
				canvas.setActiveObject(img);
			});
		};
		reader.readAsDataURL(file);
	}

	function toggleClipartPanel() {
		var panel = $('ato-ed-clipart-panel');
		panel.hidden = !panel.hidden;
		if (!panel.hidden && !panel.dataset.built) {
			var grid = $('ato-ed-clipart-grid');
			var search = document.createElement('input');
			search.type = 'search';
			search.placeholder = I18N.searchClipart || 'Search clipart…';
			search.setAttribute('aria-label', 'Search clipart');
			search.style.cssText = 'width:100%;min-height:38px;margin-bottom:8px;padding:6px 10px;border:1px solid #dbe4ef;border-radius:8px;font:inherit;';
			panel.insertBefore(search, grid);
			function build(filter) {
				grid.innerHTML = '';
				(DATA.clipart || []).forEach(function (item) {
					if (filter && item.label.toLowerCase().indexOf(filter) === -1) return;
					var btn = document.createElement('button');
					btn.type = 'button';
					btn.title = item.label;
					btn.setAttribute('aria-label', item.label);
					var img = document.createElement('img');
					img.src = DATA.clipartUrl + item.file;
					img.alt = item.label;
					img.loading = 'lazy';
					btn.appendChild(img);
					btn.addEventListener('click', function () { addClipart(DATA.clipartUrl + item.file, item.label); });
					grid.appendChild(btn);
				});
			}
			search.addEventListener('input', function () { build(search.value.trim().toLowerCase()); });
			build('');
			panel.dataset.built = '1';
		}
	}

	function addClipart(url, label) {
		fabric.Image.fromURL(url, function (img) {
			if (!img || !img.width) return;
			var c = contentCenter();
			var box = refBox();
			var scale = Math.min((box.w * 0.5) / img.width, (box.h * 0.5) / img.height);
			img.set({
				left: c.x,
				top: c.y,
				originX: 'center',
				originY: 'center',
				angle: zoneAngle(),
				scaleX: scale,
				scaleY: scale,
				atoType: 'clipart',
				atoName: label
			});
			canvas.add(img);
			canvas.setActiveObject(img);
		}, { crossOrigin: 'anonymous' });
	}

	// ---------------------------------------------------------------------
	// QR minimum size
	//
	// A QR code printed too small stops scanning, so the customer can never
	// shrink one below MIN_QR_INCHES of finished label. The canvas is a
	// pixel stand-in for the physical label, so the floor is worked out
	// from the selected size (e.g. '2" x 3"') rather than a fixed pixel
	// count — 0.6" has to mean 0.6" on a 2" label and on a 6" one.
	// ---------------------------------------------------------------------
	var MIN_QR_INCHES = 0.6;

	/** Parse '2" x 3"' → {w: 2, h: 3}. Falls back to a square 2". */
	function labelInches() {
		var raw = selections.size || '';
		var nums = raw.match(/[\d.]+/g);
		if (nums && nums.length >= 2) {
			return { w: parseFloat(nums[0]), h: parseFloat(nums[1]) };
		}
		return { w: 2, h: 2 };
	}

	/** Smallest on-canvas pixel size a QR code is allowed to be. */
	function minQrPixels() {
		var inches = labelInches();
		if (!inches.w || !inches.h) return 0;
		// Pixels per inch differs per axis when the template's proportions
		// don't exactly match the ordered size — take the stricter one so
		// the printed code clears 0.6" on both axes.
		var perInchX = logicalW / inches.w;
		var perInchY = logicalH / inches.h;
		var minPx = MIN_QR_INCHES * Math.max(perInchX, perInchY);
		// Never demand more than the printable zone can hold, or the code
		// would be forced outside its own clip path.
		var box = refBox();
		return Math.min(minPx, Math.min(box.w, box.h) * 0.95);
	}

	/**
	 * Clamp a QR object back up to the minimum. Returns true if it had to
	 * step in, so callers can tell the customer why it stopped shrinking.
	 */
	function enforceQrMinimum(obj) {
		if (!obj || obj.atoType !== 'qr' || !obj.width) return false;
		var minPx = minQrPixels();
		if (!minPx) return false;
		var minScale = minPx / obj.width;
		if (obj.scaleX >= minScale && obj.scaleY >= minScale) return false;
		obj.set({ scaleX: minScale, scaleY: minScale });
		obj.setCoords();
		return true;
	}

	var qrNoticeAt = 0;
	function qrMinNotice() {
		// One message per gesture, not one per mouse-move.
		var now = Date.now();
		if (now - qrNoticeAt < 2000) return;
		qrNoticeAt = now;
		toast('QR codes stay at least ' + MIN_QR_INCHES + '" so they still scan.');
	}

	/**
	 * Stop QR codes being dragged below the scannable minimum. Clamping on
	 * `object:scaling` means the handle refuses to go further while the
	 * customer is still dragging, rather than snapping back afterwards.
	 */
	function attachQrGuard() {
		if (!canvas) return;
		canvas.on('object:scaling', function (e) {
			if (enforceQrMinimum(e.target)) qrMinNotice();
		});
		canvas.on('object:modified', function (e) {
			if (enforceQrMinimum(e.target)) {
				qrMinNotice();
				canvas.requestRenderAll();
			}
		});
	}

	function addQRCode() {
		var url = window.prompt(I18N.qrPrompt || 'Enter the link your QR code should open', 'https://');
		if (!url || url === 'https://') return;
		var holder = $('ato-qr-holder');
		holder.innerHTML = '';
		/* global QRCode */
		new QRCode(holder, { text: url, width: 256, height: 256, correctLevel: QRCode.CorrectLevel.H });

		// qrcodejs renders a canvas (and/or img) into the holder.
		setTimeout(function () {
			var qrCanvas = holder.querySelector('canvas');
			var qrImg = holder.querySelector('img');
			var dataUrl = qrCanvas ? qrCanvas.toDataURL('image/png') : (qrImg ? qrImg.src : '');
			if (!dataUrl) return;
			fabric.Image.fromURL(dataUrl, function (img) {
				var box = refBox();
				var c = contentCenter();
				var scale = (Math.min(box.w, box.h) * 0.8) / img.width;
				// Never place one below the scannable minimum either.
				var minScale = minQrPixels() / img.width;
				if (minScale && scale < minScale) scale = minScale;
				img.set({
					left: c.x,
					top: c.y,
					originX: 'center',
					originY: 'center',
					angle: zoneAngle(),
					scaleX: scale,
					scaleY: scale,
					atoType: 'qr',
					atoName: 'QR: ' + url,
					lockUniScaling: true
				});
				canvas.add(img);
				canvas.setActiveObject(img);
			});
		}, 50);
	}

	// ---------------------------------------------------------------------
	// Properties panel + layers
	// ---------------------------------------------------------------------
	function activeObj() {
		return canvas ? canvas.getActiveObject() : null;
	}

	function refreshProps() {
		var obj = activeObj();
		var panel = $('ato-ed-props');
		if (!obj || obj.atoType === 'cutline') {
			panel.hidden = true;
			refreshLayers();
			return;
		}
		panel.hidden = false;

		var isText = obj.type === 'i-text' || obj.type === 'text';
		$('ato-prop-font-row').style.display = isText ? '' : 'none';
		$('ato-prop-size-row').style.display = isText ? '' : 'none';
		$('ato-prop-color-row').style.display = isText ? '' : 'none';
		$('ato-prop-bold').style.display = isText ? '' : 'none';

		if (isText) {
			var fontSel = $('ato-prop-font');
			if (!fontSel.options.length) {
				fontList().forEach(function (f) {
					var opt = document.createElement('option');
					opt.value = f.label;
					opt.textContent = f.label;
					opt.style.fontFamily = f.stack;
					if (f.weight) opt.style.fontWeight = f.weight;
					if (f.style) opt.style.fontStyle = f.style;
					fontSel.appendChild(opt);
				});
			}
			fontSel.value = obj.atoFontLabel || defaultFont().label;
			$('ato-prop-size').value = Math.round(obj.fontSize || 36);
			var fill = typeof obj.fill === 'string' ? obj.fill : '#182a3d';
			var hex = /^#([0-9a-f]{6})$/i.test(fill) ? fill : '#182a3d';
			$('ato-prop-color').value = hex;
			showCmyk('ato-prop-color-cmyk', hex);
			$('ato-prop-bold').classList.toggle('is-active', obj.fontWeight === 'bold' || obj.fontWeight >= 600);
		}
		refreshLayers();
	}

	/**
	 * Print work is specified in CMYK, so every colour control reports
	 * CMYK rather than RGB/hex (client request). Values are the standard
	 * naive conversion — the press applies its own ICC profile at output.
	 */
	function hexToCmyk(hex) {
		var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
		if (!m) return { c: 0, m: 0, y: 0, k: 0 };
		var r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
		var k = 1 - Math.max(r, g, b);
		if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };
		return {
			c: Math.round(((1 - r - k) / (1 - k)) * 100),
			m: Math.round(((1 - g - k) / (1 - k)) * 100),
			y: Math.round(((1 - b - k) / (1 - k)) * 100),
			k: Math.round(k * 100)
		};
	}

	function cmykLabel(hex) {
		var v = hexToCmyk(hex);
		return 'C ' + v.c + '  M ' + v.m + '  Y ' + v.y + '  K ' + v.k;
	}

	function showCmyk(id, hex) {
		var el = $(id);
		if (el) el.textContent = cmykLabel(hex);
	}

	function layerDisplay(obj) {
		if (obj.type === 'i-text' || obj.type === 'text') {
			return { type: 'Text', name: (obj.text || '').slice(0, 24) || 'Text' };
		}
		if (obj.atoType === 'template') return { type: 'Lock', name: obj.atoName || 'Template (locked)' };
		if (obj.atoType === 'qr') return { type: 'QR', name: obj.atoName || 'QR code' };
		if (obj.atoType === 'clipart') return { type: 'Art', name: obj.atoName || 'Clipart' };
		if (obj.type === 'image') return { type: 'Img', name: obj.atoName || 'Image' };
		return { type: obj.type, name: obj.atoName || obj.type };
	}

	function refreshLayers() {
		var list = $('ato-ed-layer-list');
		if (!list || !canvas) return;
		list.innerHTML = '';
		var objs = canvas.getObjects().filter(function (o) { return o.atoType !== 'cutline' && o.atoType !== 'areabg'; });
		var active = activeObj();
		// Topmost first.
		objs.slice().reverse().forEach(function (obj) {
			var li = document.createElement('li');
			var d = layerDisplay(obj);
			var type = document.createElement('span');
			type.className = 'ato-layer-type';
			type.textContent = d.type;
			var name = document.createElement('span');
			name.className = 'ato-layer-name';
			name.textContent = d.name;
			li.appendChild(type);
			li.appendChild(name);
			if (obj === active) li.classList.add('is-active');
			li.addEventListener('click', function () {
				canvas.setActiveObject(obj);
				canvas.requestRenderAll();
				refreshProps();
			});
			list.appendChild(li);
		});
	}

	// ---------------------------------------------------------------------
	// Saving
	// ---------------------------------------------------------------------
	function usedFonts() {
		var fonts = {};
		canvas.getObjects().forEach(function (o) {
			if (o.fontFamily) fonts[o.fontFamily] = true;
		});
		return Object.keys(fonts).join(', ');
	}

	function buildConfigPayload() {
		var payload = {
			template: selections.template || '',
			material: selections.material || '',
			size: selections.size || '',
			shape: selections.shape || '',
			shape_value: selections.shape_value || currentShape,
			quantity: selections.quantity || '',
			canvas_w: logicalW,
			canvas_h: logicalH,
			template_image: templateUrl || '',
			area: printArea ? JSON.stringify(printArea) : ''
		};
		return payload;
	}

	function saveDesign() {
		if (!canvas) return;
		var saveBtn = $('ato-ed-save');
		saveBtn.disabled = true;
		toast(I18N.saving || 'Saving your design…');

		var body = new FormData();
		body.append('action', 'ato_save_design');
		body.append('nonce', DATA.nonce);
		body.append('design_id', DATA.mode === 'admin' ? designId : 0);
		body.append('design_json', JSON.stringify(canvas.toJSON(EXTRA_PROPS)));
		body.append('preview', exportPNG());
		body.append('config', JSON.stringify(buildConfigPayload()));
		body.append('fonts', usedFonts());
		body.append('product_id', DATA.productId || 0);
		if (DATA.mode === 'admin') {
			var note = window.prompt('Describe this change for the edit history (optional):', '') || '';
			body.append('note', note);
		}

		window.fetch(DATA.ajaxUrl, { method: 'POST', body: body, credentials: 'same-origin' })
			.then(function (res) { return res.json(); })
			.then(function (json) {
				saveBtn.disabled = false;
				if (!json || !json.success) {
					var msg = json && json.data && json.data.message ? json.data.message : (I18N.saveFailed || 'Saving failed.');
					toast(msg, true);
					return;
				}
				dirty = false;
				toast(I18N.designSaved || 'Design saved!');
				if (DATA.mode === 'admin') {
					// Show the new preview + log entry.
					window.setTimeout(function () { window.location.reload(); }, 700);
				} else {
					attachToProductForm(json.data);
					closeOverlay(true);
				}
			})
			.catch(function () {
				saveBtn.disabled = false;
				toast(I18N.saveFailed || 'Saving failed — please try again.', true);
			});
	}

	/** Fill the hidden add-to-cart fields and show the confirmation card. */
	function attachToProductForm(data) {
		var idField = $('ato_design_id');
		var cfgField = $('ato_config');
		if (idField) idField.value = data.design_id;
		if (cfgField) cfgField.value = JSON.stringify(buildConfigPayload());

		var summary = $('ato-design-summary');
		if (summary) {
			summary.hidden = false;
			var thumb = $('ato-design-thumb');
			if (thumb && data.preview) thumb.src = data.preview;
			var ref = $('ato-design-ref');
			if (ref) ref.textContent = data.ref;
			var cfg = $('ato-design-config');
			if (cfg) {
				var parts = [];
				['template', 'material', 'size', 'shape', 'quantity'].forEach(function (k) {
					if (selections[k]) parts.push(selections[k]);
				});
				cfg.textContent = parts.join(' · ');
			}
		}

		// Guide the customer to the add-to-cart button.
		var cartBtn = document.querySelector('form.cart button[type="submit"], form.cart .single_add_to_cart_button');
		if (cartBtn) {
			cartBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
			cartBtn.style.transition = 'box-shadow 300ms ease';
			cartBtn.style.boxShadow = '0 0 0 4px rgba(46, 109, 180, 0.4)';
			window.setTimeout(function () { cartBtn.style.boxShadow = ''; }, 2400);
		}
	}

	// ---------------------------------------------------------------------
	// Admin mode: load an existing design
	// ---------------------------------------------------------------------
	function loadAdminDesign() {
		if (!designId) return;
		var url = DATA.ajaxUrl + '?action=ato_load_design&design_id=' + designId + '&nonce=' + encodeURIComponent(DATA.nonce);
		window.fetch(url, { credentials: 'same-origin' })
			.then(function (res) { return res.json(); })
			.then(function (json) {
				if (!json || !json.success) {
					toast((json && json.data && json.data.message) || 'Could not load the design.', true);
					return;
				}
				var cfg = json.data.config || {};
				selections = {
					template: cfg.template || '',
					material: cfg.material || '',
					size: cfg.size || '',
					shape: cfg.shape || '',
					shape_value: cfg.shape_value || 'square',
					quantity: cfg.quantity || ''
				};
				initCanvas(selections.shape_value, '');
				if (cfg.template_image && cfg.area) {
					templateUrl = cfg.template_image;
					try { printArea = typeof cfg.area === 'string' ? JSON.parse(cfg.area) : cfg.area; } catch (e2) { printArea = null; }
					logicalW = parseInt(cfg.canvas_w, 10) || logicalW;
					logicalH = parseInt(cfg.canvas_h, 10) || logicalH;
				}
				$('ato-ed-product-name').textContent = json.data.ref || 'Design';
				updateConfigSummary();
				suppressHistory = true;
				canvas.loadFromJSON(json.data.design_json, function () {
					canvas.getObjects().forEach(function (o) {
						if (o.atoType === 'template') { o.set({ selectable: false, evented: false }); canvas.sendToBack(o); }
						else if (o.atoType === 'areabg') { o.set({ selectable: false, evented: false }); }
						else if (o.atoType !== 'cutline') { o.set({ selectable: true, evented: true }); }
					});
					var hasCut = canvas.getObjects().some(function (o) { return o.atoType === 'cutline'; });
					if (!hasCut) { if (printArea) { addAreaCutline(); } else { applyShapeMask(); } }
					canvas.renderAll();
					suppressHistory = false;
					undoStack = [JSON.stringify(canvas.toJSON(EXTRA_PROPS))];
					redoStack = [];
					updateHistoryButtons();
					refreshLayers();
					fitCanvas();
				});
			})
			.catch(function () { toast('Could not load the design.', true); });
	}

	// ---------------------------------------------------------------------
	// Wire up
	// ---------------------------------------------------------------------
	// ------------------------------------------------------------------
	// Background colour: every customizable product gets a visible
	// "Background" control — preset swatches plus a custom picker.
	// In template mode this recolours the printable area; in classic
	// mode it recolours the whole label canvas.
	// ------------------------------------------------------------------
	var BG_SWATCHES = [
		'#FFFFFF', '#FFF7E0', '#FFD84D', '#F59B23', '#E5484D', '#F2A7C3',
		'#3FA45B', '#8FCBA0', '#5688C5', '#14304C', '#D8B98A', '#182A3D'
	];

	function applyBackground(color) {
		if (!canvas) return;
		if (printArea) {
			setAreaBackground(color);
		} else {
			canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
			dirty = true;
		}
		var toolInput = $('ato-tool-bg-input');
		if (toolInput) toolInput.value = /^#([0-9a-f]{6})$/i.test(color) ? color : '#ffffff';
		var custom = $('ato-bg-custom');
		if (custom) custom.value = toolInput ? toolInput.value : '#ffffff';
		showCmyk('ato-bg-cmyk', toolInput ? toolInput.value : color);
		var grid = $('ato-ed-bg-swatches');
		if (grid) {
			grid.querySelectorAll('.ato-ed-swatch').forEach(function (b) {
				b.classList.toggle('is-selected', b.getAttribute('data-color').toLowerCase() === color.toLowerCase());
			});
		}
	}

	/** Build the side-panel "Background colour" section (all editor hosts). */
	function ensureBgPanel() {
		var side = document.querySelector('#ato-editor .ato-ed-side');
		if (!side || $('ato-ed-bg-panel')) return;
		var panel = document.createElement('div');
		panel.className = 'ato-ed-panel';
		panel.id = 'ato-ed-bg-panel';
		panel.innerHTML =
			'<h4>Background colour</h4>' +
			'<div class="ato-ed-swatches" id="ato-ed-bg-swatches">' +
			BG_SWATCHES.map(function (c) {
				return '<button type="button" class="ato-ed-swatch" data-color="' + c + '" style="background:' + c + '" title="' + c + '" aria-label="Background ' + c + '"></button>';
			}).join('') +
			'</div>' +
			'<div class="ato-ed-field" style="margin-top:8px;"><label for="ato-bg-custom">Custom colour</label>' +
			'<input type="color" id="ato-bg-custom" value="#ffffff">' +
			'<span class="ato-ed-cmyk" id="ato-bg-cmyk">C 0  M 0  Y 0  K 0</span></div>';
		side.insertBefore(panel, side.firstChild);
		panel.addEventListener('click', function (e) {
			var b = e.target.closest('.ato-ed-swatch');
			if (b) applyBackground(b.getAttribute('data-color'));
		});
		$('ato-bg-custom').addEventListener('input', function (e) {
			applyBackground(e.target.value);
		});
	}

	function bind() {
		var openBtn = $('ato-open-editor');
		if (!openBtn || !$('ato-editor')) return;

		ensureBgPanel();
		openBtn.addEventListener('click', openOverlay);
		$('ato-ed-close').addEventListener('click', function () { closeOverlay(false); });
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && !$('ato-editor').hidden) closeOverlay(false);
		});

		$('ato-ed-wizard-next').addEventListener('click', wizardNext);
		$('ato-ed-wizard-back').addEventListener('click', wizardBack);

		$('ato-tool-text').addEventListener('click', addText);
		$('ato-tool-upload-input').addEventListener('change', function (e) {
			addUploadedImage(e.target.files[0]);
			e.target.value = '';
		});
		$('ato-tool-clipart').addEventListener('click', toggleClipartPanel);
		$('ato-tool-qr').addEventListener('click', addQRCode);
		$('ato-tool-bg-input').addEventListener('input', function (e) {
			applyBackground(e.target.value);
		});

		$('ato-ed-undo').addEventListener('click', undo);
		$('ato-ed-redo').addEventListener('click', redo);
		$('ato-ed-save').addEventListener('click', saveDesign);

		$('ato-prop-font').addEventListener('change', function (e) {
			var obj = activeObj();
			if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
				var picked = null;
				fontList().forEach(function (f) { if (f.label === e.target.value) picked = f; });
				if (picked) {
					obj.set({
						fontFamily: picked.stack,
						fontWeight: picked.weight || 'normal',
						fontStyle: picked.style || 'normal'
					});
					obj.atoFontLabel = picked.label;
				}
				canvas.requestRenderAll();
				onCanvasChange();
			}
		});
		$('ato-prop-size').addEventListener('input', function (e) {
			var obj = activeObj();
			var v = parseInt(e.target.value, 10);
			if (obj && v >= 8 && v <= 200) {
				obj.set('fontSize', v);
				canvas.requestRenderAll();
				dirty = true;
			}
		});
		$('ato-prop-color').addEventListener('input', function (e) {
			var obj = activeObj();
			showCmyk('ato-prop-color-cmyk', e.target.value);
			if (obj) {
				obj.set('fill', e.target.value);
				canvas.requestRenderAll();
				dirty = true;
			}
		});
		$('ato-prop-bold').addEventListener('click', function () {
			var obj = activeObj();
			if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
				obj.set('fontWeight', obj.fontWeight === 'bold' ? 'normal' : 'bold');
				canvas.requestRenderAll();
				onCanvasChange();
				refreshProps();
			}
		});
		$('ato-prop-center').addEventListener('click', function () {
			var obj = activeObj();
			if (obj) {
				var c = contentCenter();
				obj.set({ left: c.x, top: c.y, originX: 'center', originY: 'center' });
				obj.setCoords();
				canvas.requestRenderAll();
				onCanvasChange();
			}
		});
		$('ato-layer-up').addEventListener('click', function () {
			var obj = activeObj();
			if (obj) { canvas.bringForward(obj); onCanvasChange(); }
		});
		$('ato-layer-down').addEventListener('click', function () {
			var obj = activeObj();
			if (obj) { canvas.sendBackwards(obj); onCanvasChange(); }
		});
		$('ato-prop-delete').addEventListener('click', function () {
			var obj = activeObj();
			if (obj && obj.atoType !== 'cutline' && obj.atoType !== 'template' && obj.atoType !== 'areabg') {
				canvas.remove(obj);
				canvas.discardActiveObject();
				canvas.requestRenderAll();
				refreshProps();
			}
		});

		// Delete key removes the selected object (unless typing).
		document.addEventListener('keydown', function (e) {
			if ($('ato-editor').hidden) return;
			if (e.key !== 'Delete' && e.key !== 'Backspace') return;
			var tag = (document.activeElement && document.activeElement.tagName) || '';
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
			var obj = activeObj();
			if (obj && !obj.isEditing && obj.atoType !== 'cutline' && obj.atoType !== 'template' && obj.atoType !== 'areabg') {
				e.preventDefault();
				canvas.remove(obj);
				canvas.discardActiveObject();
				canvas.requestRenderAll();
				refreshProps();
			}
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', bind);
	} else {
		bind();
	}
})();
