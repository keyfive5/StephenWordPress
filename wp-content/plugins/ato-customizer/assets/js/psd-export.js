/**
 * Layered PSD export for customer designs (ag-psd + Fabric.js).
 *
 * Rebuilds a design from its stored JSON with ONE PSD LAYER PER ELEMENT
 * (template artwork, each text, image, clipart and QR code), so the shop
 * owner can open the file in Adobe Illustrator/Photoshop, inspect and
 * rearrange layers, then hand it to the printing software.
 *
 * Usage: atoExportPsd({ json, width, height, name })
 *  - json:  the design's Fabric JSON (string or object)
 *  - width/height: canvas dimensions in px
 *  - name:  file name base (e.g. the design ref)
 */
(function () {
	'use strict';

	function layerName(obj, index) {
		if (obj.atoType === 'template') return 'Template (locked artwork)';
		if (obj.atoType === 'qr') return obj.atoName || 'QR code';
		if (obj.atoType === 'clipart') return 'Clipart — ' + (obj.atoName || 'art');
		if (obj.type === 'i-text' || obj.type === 'text') return 'Text — ' + String(obj.text || '').slice(0, 30);
		if (obj.type === 'image') return 'Image — ' + (obj.atoName || (index + 1));
		return (obj.atoName || obj.type || 'Layer ') + ' ' + (index + 1);
	}

	function renderObjectToCanvas(objJson, width, height) {
		return new Promise(function (resolve, reject) {
			window.fabric.util.enlivenObjects([objJson], function (objects) {
				if (!objects || !objects[0]) { reject(new Error('enliven failed')); return; }
				var sc = new window.fabric.StaticCanvas(null, { width: width, height: height, backgroundColor: null });
				sc.add(objects[0]);
				sc.renderAll();
				resolve(sc.lowerCanvasEl);
			}, 'fabric');
		});
	}

	window.atoExportPsd = function (opts) {
		var agPsd = window.agPsd;
		if (!agPsd || !window.fabric) {
			window.alert('PSD engine not loaded yet — try again in a moment.');
			return Promise.resolve(false);
		}
		var json = typeof opts.json === 'string' ? JSON.parse(opts.json) : opts.json;
		var width = Math.round(opts.width || 500);
		var height = Math.round(opts.height || 500);
		var objs = (json.objects || []).filter(function (o) { return o.atoType !== 'cutline'; });

		// White base so the composition matches the on-screen label.
		var base = document.createElement('canvas');
		base.width = width;
		base.height = height;
		var ctx = base.getContext('2d');
		if (json.background && typeof json.background === 'string') {
			ctx.fillStyle = json.background;
		} else {
			ctx.fillStyle = '#ffffff';
		}
		ctx.fillRect(0, 0, width, height);

		var children = [{ name: 'Background', canvas: base }];
		var chain = Promise.resolve();
		objs.forEach(function (objJson, i) {
			chain = chain.then(function () {
				return renderObjectToCanvas(objJson, width, height).then(function (layerCanvas) {
					children.push({ name: layerName(objJson, i), canvas: layerCanvas });
				}).catch(function () { /* skip unrenderable layer */ });
			});
		});

		return chain.then(function () {
			var buffer = agPsd.writePsd({ width: width, height: height, children: children });
			var blob = new Blob([buffer], { type: 'image/vnd.adobe.photoshop' });
			var a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = (opts.name || 'ato-design') + '.psd';
			document.body.appendChild(a);
			a.click();
			setTimeout(function () {
				URL.revokeObjectURL(a.href);
				a.remove();
			}, 2000);
			return true;
		});
	};
})();
