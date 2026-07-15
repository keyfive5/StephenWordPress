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

	function startWizard() {
		var cfg = DATA.config || {};
		wizardSteps = [];
		selections = {};

		if (cfg.templates && cfg.templates.length) {
			wizardSteps.push({ key: 'template', label: I18N.stepTemplate || 'Template', options: cfg.templates.map(function (t) { return { label: t.name, image: t.image, area: t.area || null }; }) });
		}
		if (cfg.materials && cfg.materials.length) {
			wizardSteps.push({ key: 'material', label: I18N.stepMaterial || 'Material', options: cfg.materials.map(function (m) { return { label: m }; }) });
		}
		if (cfg.sizes && cfg.sizes.length) {
			wizardSteps.push({ key: 'size', label: I18N.stepSize || 'Size', options: cfg.sizes.map(function (s) { return { label: s }; }) });
		}
		if (cfg.shapes && cfg.shapes.length) {
			wizardSteps.push({ key: 'shape', label: I18N.stepShape || 'Shape', options: cfg.shapes.map(function (s) { return { label: s.label, value: s.shape }; }) });
		}
		if (cfg.quantities && cfg.quantities.length) {
			wizardSteps.push({ key: 'quantity', label: I18N.stepQuantity || 'Quantity', options: cfg.quantities.map(function (q) { return { label: String(q.qty), price: q.price }; }) });
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

		var grid = document.createElement('div');
		grid.className = 'ato-ed-option-grid';
		step.options.forEach(function (opt) {
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
			span.textContent = opt.label;
			btn.appendChild(span);
			if (opt.price !== null && typeof opt.price !== 'undefined') {
				var price = document.createElement('span');
				price.className = 'ato-ed-option-price';
				price.textContent = '$' + Number(opt.price).toFixed(2);
				btn.appendChild(price);
			}
			if (selections[step.key] === opt.label) btn.classList.add('is-selected');
			btn.addEventListener('click', function () {
				selections[step.key] = opt.label;
				if (opt.value) selections[step.key + '_value'] = opt.value;
				if (opt.image) selections[step.key + '_image'] = opt.image;
				if (opt.area) selections[step.key + '_area'] = opt.area;
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
			selections[step.key] = step.options[0].label;
			if (step.options[0].value) selections[step.key + '_value'] = step.options[0].value;
			if (step.options[0].image) selections[step.key + '_image'] = step.options[0].image;
			if (step.options[0].area) selections[step.key + '_area'] = step.options[0].area;
		}
		if (wizardIndex < wizardSteps.length - 1) {
			wizardIndex++;
			renderWizard();
		} else {
			$('ato-ed-wizard').hidden = true;
			$('ato-ed-main').hidden = false;
			if (selections.template_image && selections.template_area) {
				initCanvasFromTemplate(selections.template_image, selections.template_area);
			} else {
				initCanvas(selections.shape_value || 'square', selections.template_image || '');
			}
			updateConfigSummary();
		}
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
	 * @param {object} areaFrac Printable area as fractions {x, y, w, h}.
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
				height: Math.round(areaFrac.h * logicalH)
			};
			templateUrl = url;
			img.set({ left: 0, top: 0, selectable: false, evented: false, atoType: 'template', atoName: 'Template (locked)' });
			canvas.add(img);
			canvas.sendToBack(img);
			addAreaCutline();

			canvas.on('selection:created', refreshProps);
			canvas.on('selection:updated', refreshProps);
			canvas.on('selection:cleared', refreshProps);
			canvas.on('object:added', onObjectAdded);
			canvas.on('object:removed', onCanvasChange);
			canvas.on('object:modified', onCanvasChange);
			canvas.on('text:changed', function () { dirty = true; });

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

	/** Dashed guide around the printable area. */
	function addAreaCutline() {
		if (!printArea || !canvas) return;
		var cut = new fabric.Rect({
			left: printArea.left,
			top: printArea.top,
			width: printArea.width,
			height: printArea.height,
			fill: 'transparent',
			stroke: '#E8590C',
			strokeDashArray: [7, 6],
			strokeWidth: 2,
			selectable: false,
			evented: false,
			excludeFromExport: true,
			atoType: 'cutline'
		});
		canvas.add(cut);
		canvas.bringToFront(cut);
	}

	/** Clip a user object to the printable area (template mode only). */
	function clipToArea(obj) {
		if (!printArea || !obj || obj.atoType === 'cutline' || obj.atoType === 'template' || obj.clipPath) return;
		obj.clipPath = new fabric.Rect({
			left: printArea.left,
			top: printArea.top,
			width: printArea.width,
			height: printArea.height,
			absolutePositioned: true
		});
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
			stroke: '#E8590C',
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
				else if (o.atoType !== 'cutline') { o.set({ selectable: true, evented: true }); }
			});
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
	function addText() {
		var c = contentCenter();
		var box = refBox();
		var text = new fabric.IText(I18N.yourText || 'Your text', {
			left: c.x,
			top: c.y,
			originX: 'center',
			originY: 'center',
			fontFamily: (DATA.fonts && DATA.fonts[0]) || 'DM Sans',
			fontSize: Math.max(20, Math.round(Math.min(box.w, box.h) * 0.2)),
			fill: '#1b2a20',
			atoName: 'Text'
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
			(DATA.clipart || []).forEach(function (item) {
				var btn = document.createElement('button');
				btn.type = 'button';
				btn.title = item.label;
				btn.setAttribute('aria-label', item.label);
				var img = document.createElement('img');
				img.src = DATA.clipartUrl + item.file;
				img.alt = item.label;
				btn.appendChild(img);
				btn.addEventListener('click', function () { addClipart(DATA.clipartUrl + item.file, item.label); });
				grid.appendChild(btn);
			});
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
				scaleX: scale,
				scaleY: scale,
				atoType: 'clipart',
				atoName: label
			});
			canvas.add(img);
			canvas.setActiveObject(img);
		}, { crossOrigin: 'anonymous' });
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
				img.set({
					left: c.x,
					top: c.y,
					originX: 'center',
					originY: 'center',
					scaleX: scale,
					scaleY: scale,
					atoType: 'qr',
					atoName: 'QR: ' + url
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
				(DATA.fonts || []).forEach(function (f) {
					var opt = document.createElement('option');
					opt.value = f;
					opt.textContent = f;
					opt.style.fontFamily = f;
					fontSel.appendChild(opt);
				});
			}
			fontSel.value = obj.fontFamily || '';
			$('ato-prop-size').value = Math.round(obj.fontSize || 36);
			var fill = typeof obj.fill === 'string' ? obj.fill : '#1b2a20';
			$('ato-prop-color').value = /^#([0-9a-f]{6})$/i.test(fill) ? fill : '#1b2a20';
			$('ato-prop-bold').classList.toggle('is-active', obj.fontWeight === 'bold' || obj.fontWeight >= 600);
		}
		refreshLayers();
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
		var objs = canvas.getObjects().filter(function (o) { return o.atoType !== 'cutline'; });
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
			cartBtn.style.boxShadow = '0 0 0 4px rgba(232, 89, 12, 0.4)';
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
	function bind() {
		var openBtn = $('ato-open-editor');
		if (!openBtn || !$('ato-editor')) return;

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
			if (!canvas) return;
			canvas.setBackgroundColor(e.target.value, canvas.renderAll.bind(canvas));
			dirty = true;
		});

		$('ato-ed-undo').addEventListener('click', undo);
		$('ato-ed-redo').addEventListener('click', redo);
		$('ato-ed-save').addEventListener('click', saveDesign);

		$('ato-prop-font').addEventListener('change', function (e) {
			var obj = activeObj();
			if (obj && (obj.type === 'i-text' || obj.type === 'text')) {
				obj.set('fontFamily', e.target.value);
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
			if (obj && obj.atoType !== 'cutline' && obj.atoType !== 'template') {
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
			if (obj && !obj.isEditing && obj.atoType !== 'cutline' && obj.atoType !== 'template') {
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
