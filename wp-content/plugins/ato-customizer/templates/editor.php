<?php
/**
 * Editor overlay markup — shared by the product page (customer mode)
 * and the ATO Designs admin screen (admin mode). All dynamic content
 * is rendered by assets/js/editor.js.
 *
 * @package ato-customizer
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="ato-editor-overlay" id="ato-editor" hidden aria-modal="true" role="dialog" aria-label="<?php esc_attr_e( 'Label design editor', 'ato-customizer' ); ?>">

	<!-- Top bar -->
	<div class="ato-ed-top">
		<div class="ato-ed-title">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6V9a6 6 0 0 1 6-6Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>
			<strong id="ato-ed-product-name"><?php esc_html_e( 'Label editor', 'ato-customizer' ); ?></strong>
			<span class="ato-ed-config-summary" id="ato-ed-config-summary"></span>
		</div>
		<div class="ato-ed-top-actions">
			<button type="button" class="ato-ed-icon-btn" id="ato-ed-undo" title="<?php esc_attr_e( 'Undo', 'ato-customizer' ); ?>" aria-label="<?php esc_attr_e( 'Undo', 'ato-customizer' ); ?>">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>
			</button>
			<button type="button" class="ato-ed-icon-btn" id="ato-ed-redo" title="<?php esc_attr_e( 'Redo', 'ato-customizer' ); ?>" aria-label="<?php esc_attr_e( 'Redo', 'ato-customizer' ); ?>">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg>
			</button>
			<span class="ato-ed-sep"></span>
			<button type="button" class="ato-ed-btn ato-ed-btn--ghost" id="ato-ed-close"><?php esc_html_e( 'Cancel', 'ato-customizer' ); ?></button>
			<button type="button" class="ato-ed-btn ato-ed-btn--primary" id="ato-ed-save"><?php esc_html_e( 'Save design', 'ato-customizer' ); ?></button>
		</div>
	</div>

	<!-- Configuration wizard (customer mode) -->
	<div class="ato-ed-wizard" id="ato-ed-wizard" hidden>
		<div class="ato-ed-wizard-card">
			<ol class="ato-ed-wizard-steps" id="ato-ed-wizard-steps"></ol>
			<div class="ato-ed-wizard-body" id="ato-ed-wizard-body"></div>
			<div class="ato-ed-wizard-nav">
				<button type="button" class="ato-ed-btn ato-ed-btn--ghost" id="ato-ed-wizard-back"><?php esc_html_e( 'Back', 'ato-customizer' ); ?></button>
				<button type="button" class="ato-ed-btn ato-ed-btn--primary" id="ato-ed-wizard-next"><?php esc_html_e( 'Next', 'ato-customizer' ); ?></button>
			</div>
		</div>
	</div>

	<!-- Workspace -->
	<div class="ato-ed-main" id="ato-ed-main" hidden>

		<div class="ato-ed-tools" role="toolbar" aria-label="<?php esc_attr_e( 'Design tools', 'ato-customizer' ); ?>">
			<button type="button" class="ato-ed-tool" id="ato-tool-text">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7V4h16v3M12 4v16m-3 0h6"/></svg>
				<span><?php esc_html_e( 'Text', 'ato-customizer' ); ?></span>
			</button>
			<label class="ato-ed-tool" for="ato-tool-upload-input">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
				<span><?php esc_html_e( 'Image', 'ato-customizer' ); ?></span>
				<input type="file" id="ato-tool-upload-input" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden>
			</label>
			<button type="button" class="ato-ed-tool" id="ato-tool-clipart">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/></svg>
				<span><?php esc_html_e( 'Clipart', 'ato-customizer' ); ?></span>
			</button>
			<button type="button" class="ato-ed-tool" id="ato-tool-qr">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v.01M14 21v.01M21 21v.01M17.5 17.5H21M17.5 17.5V21"/></svg>
				<span><?php esc_html_e( 'QR code', 'ato-customizer' ); ?></span>
			</button>
			<label class="ato-ed-tool" for="ato-tool-bg-input">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22a10 10 0 1 1 10-10c0 2.2-1.8 3-3.5 3H16a2 2 0 0 0-1.5 3.3c.6.7.2 1.7-.7 1.7H12Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="11" cy="7.5" r="1"/><circle cx="16" cy="9" r="1"/></svg>
				<span><?php esc_html_e( 'Colour', 'ato-customizer' ); ?></span>
				<input type="color" id="ato-tool-bg-input" value="#ffffff" hidden>
			</label>
		</div>

		<div class="ato-ed-canvas-col">
			<div class="ato-ed-canvas-wrap" id="ato-ed-canvas-wrap">
				<canvas id="ato-canvas"></canvas>
			</div>
			<p class="ato-ed-canvas-hint"><?php esc_html_e( 'The dashed line is the cut line — keep important content inside it.', 'ato-customizer' ); ?></p>
		</div>

		<div class="ato-ed-side">
			<div class="ato-ed-panel" id="ato-ed-props" hidden>
				<h4><?php esc_html_e( 'Selected element', 'ato-customizer' ); ?></h4>
				<div class="ato-ed-field" id="ato-prop-font-row">
					<label for="ato-prop-font"><?php esc_html_e( 'Font', 'ato-customizer' ); ?></label>
					<select id="ato-prop-font"></select>
				</div>
				<div class="ato-ed-field-row">
					<div class="ato-ed-field" id="ato-prop-size-row">
						<label for="ato-prop-size"><?php esc_html_e( 'Size', 'ato-customizer' ); ?></label>
						<input type="number" id="ato-prop-size" min="8" max="200" step="1">
					</div>
					<div class="ato-ed-field" id="ato-prop-color-row">
						<label for="ato-prop-color"><?php esc_html_e( 'Colour', 'ato-customizer' ); ?></label>
						<input type="color" id="ato-prop-color">
					</div>
				</div>
				<div class="ato-ed-btn-row">
					<button type="button" class="ato-ed-mini-btn" id="ato-prop-bold"><strong>B</strong></button>
					<button type="button" class="ato-ed-mini-btn" id="ato-prop-center" title="<?php esc_attr_e( 'Center on label', 'ato-customizer' ); ?>"><?php esc_html_e( 'Center', 'ato-customizer' ); ?></button>
					<button type="button" class="ato-ed-mini-btn" id="ato-layer-up" title="<?php esc_attr_e( 'Bring forward', 'ato-customizer' ); ?>">&#9650;</button>
					<button type="button" class="ato-ed-mini-btn" id="ato-layer-down" title="<?php esc_attr_e( 'Send backward', 'ato-customizer' ); ?>">&#9660;</button>
					<button type="button" class="ato-ed-mini-btn ato-ed-mini-btn--danger" id="ato-prop-delete"><?php esc_html_e( 'Delete', 'ato-customizer' ); ?></button>
				</div>
			</div>

			<div class="ato-ed-panel" id="ato-ed-clipart-panel" hidden>
				<h4><?php esc_html_e( 'Clipart', 'ato-customizer' ); ?></h4>
				<div class="ato-ed-clipart-grid" id="ato-ed-clipart-grid"></div>
			</div>

			<div class="ato-ed-panel">
				<h4><?php esc_html_e( 'Layers', 'ato-customizer' ); ?></h4>
				<ul class="ato-ed-layer-list" id="ato-ed-layer-list"></ul>
			</div>
		</div>

	</div>

	<div class="ato-ed-toast" id="ato-ed-toast" role="status" aria-live="polite" hidden></div>
	<div id="ato-qr-holder" style="position:absolute;left:-9999px;top:-9999px;" aria-hidden="true"></div>
</div>
