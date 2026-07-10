<?php
/**
 * Front-end integration: the "Customize this label" button on product pages,
 * the editor overlay, and asset loading.
 *
 * @package ato-customizer
 */

defined( 'ABSPATH' ) || exit;

class ATO_Frontend {

	public static function init() {
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		add_action( 'woocommerce_before_add_to_cart_button', array( __CLASS__, 'render_customize_ui' ) );
		add_action( 'wp_footer', array( __CLASS__, 'render_editor_shell' ) );
	}

	/**
	 * Should the editor load on this request?
	 */
	protected static function should_load() {
		return is_product() && ATO_Product_Options::is_enabled( get_the_ID() );
	}

	public static function enqueue() {
		if ( ! self::should_load() ) {
			return;
		}
		self::enqueue_editor_assets();

		$product_id = get_the_ID();
		wp_localize_script( 'ato-editor', 'atoEditorData', array(
			'ajaxUrl'      => admin_url( 'admin-ajax.php' ),
			'nonce'        => wp_create_nonce( 'ato-editor' ),
			'mode'         => 'customer',
			'productId'    => $product_id,
			'productName'  => get_the_title( $product_id ),
			'config'       => ATO_Product_Options::get_config( $product_id ),
			'clipartUrl'   => ATO_CUSTOMIZER_URL . 'assets/clipart/',
			'clipart'      => self::clipart_list(),
			'fonts'        => self::editor_fonts(),
			'i18n'         => self::i18n(),
		) );
	}

	/**
	 * Shared by front end and the admin review screen.
	 */
	public static function enqueue_editor_assets() {
		wp_enqueue_style( 'ato-editor', ATO_CUSTOMIZER_URL . 'assets/css/editor.css', array(), ATO_CUSTOMIZER_VERSION );
		wp_enqueue_style(
			'ato-editor-fonts',
			'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Fraunces:opsz,wght@9..144,600&family=Oswald:wght@500&family=Playfair+Display:wght@600&family=Pacifico&family=Bebas+Neue&family=Caveat:wght@600&family=Montserrat:wght@500;700&family=Lobster&family=Abril+Fatface&display=swap',
			array(),
			null
		);
		wp_enqueue_script( 'fabric-js', ATO_CUSTOMIZER_URL . 'assets/vendor/fabric.min.js', array(), '5.3.1', true );
		wp_enqueue_script( 'qrcode-js', ATO_CUSTOMIZER_URL . 'assets/vendor/qrcode.min.js', array(), '1.0.0', true );
		wp_enqueue_script( 'ato-editor', ATO_CUSTOMIZER_URL . 'assets/js/editor.js', array( 'fabric-js', 'qrcode-js' ), ATO_CUSTOMIZER_VERSION, true );
	}

	/**
	 * Fonts offered inside the editor. Names must match the loaded Google Fonts.
	 * (Adobe Fonts can be appended here once the client's web project kit ID is provided.)
	 */
	public static function editor_fonts() {
		return array( 'DM Sans', 'Fraunces', 'Montserrat', 'Oswald', 'Playfair Display', 'Bebas Neue', 'Pacifico', 'Caveat', 'Lobster', 'Abril Fatface' );
	}

	/**
	 * Bundled clipart (SVG files in assets/clipart).
	 */
	public static function clipart_list() {
		return array(
			array( 'file' => 'burger.svg', 'label' => __( 'Burger', 'ato-customizer' ) ),
			array( 'file' => 'pizza.svg', 'label' => __( 'Pizza slice', 'ato-customizer' ) ),
			array( 'file' => 'coffee.svg', 'label' => __( 'Coffee cup', 'ato-customizer' ) ),
			array( 'file' => 'star.svg', 'label' => __( 'Star', 'ato-customizer' ) ),
			array( 'file' => 'heart.svg', 'label' => __( 'Heart', 'ato-customizer' ) ),
			array( 'file' => 'leaf.svg', 'label' => __( 'Leaf', 'ato-customizer' ) ),
			array( 'file' => 'chef-hat.svg', 'label' => __( 'Chef hat', 'ato-customizer' ) ),
			array( 'file' => 'sparkle.svg', 'label' => __( 'Sparkle', 'ato-customizer' ) ),
		);
	}

	/**
	 * Editor strings.
	 */
	public static function i18n() {
		return array(
			'stepTemplate'  => __( 'Template', 'ato-customizer' ),
			'stepMaterial'  => __( 'Material', 'ato-customizer' ),
			'stepSize'      => __( 'Size', 'ato-customizer' ),
			'stepShape'     => __( 'Shape', 'ato-customizer' ),
			'stepQuantity'  => __( 'Quantity', 'ato-customizer' ),
			'next'          => __( 'Next', 'ato-customizer' ),
			'back'          => __( 'Back', 'ato-customizer' ),
			'startDesign'   => __( 'Start designing', 'ato-customizer' ),
			'addText'       => __( 'Add text', 'ato-customizer' ),
			'yourText'      => __( 'Your text', 'ato-customizer' ),
			'saving'        => __( 'Saving your design…', 'ato-customizer' ),
			'saveFailed'    => __( 'Saving failed — please check your connection and try again.', 'ato-customizer' ),
			'qrPrompt'      => __( 'Enter the link your QR code should open', 'ato-customizer' ),
			'imageTooBig'   => __( 'That image is over 2 MB. Please use a smaller file so your design saves smoothly.', 'ato-customizer' ),
			'confirmClose'  => __( 'Close the editor? Unsaved changes will be lost.', 'ato-customizer' ),
			'designSaved'   => __( 'Design saved!', 'ato-customizer' ),
			'deleteLayer'   => __( 'Delete selected', 'ato-customizer' ),
		);
	}

	/**
	 * Button + hidden fields inside the add-to-cart form.
	 */
	public static function render_customize_ui() {
		if ( ! self::should_load() ) {
			return;
		}
		?>
		<div class="ato-customize-wrap">
			<button type="button" class="ato-customize-btn" id="ato-open-editor">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
				<?php esc_html_e( 'Customize this label', 'ato-customizer' ); ?>
			</button>
			<p class="ato-customize-hint"><?php esc_html_e( 'Design it live — add your logo, text and QR codes before you order.', 'ato-customizer' ); ?></p>
			<input type="hidden" name="ato_design_id" id="ato_design_id" value="">
			<input type="hidden" name="ato_config" id="ato_config" value="">
			<div class="ato-design-summary" id="ato-design-summary" hidden>
				<img src="" alt="<?php esc_attr_e( 'Your design preview', 'ato-customizer' ); ?>" id="ato-design-thumb">
				<div>
					<strong id="ato-design-ref"></strong>
					<span id="ato-design-config"></span>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Editor overlay markup, once per page.
	 */
	public static function render_editor_shell() {
		if ( ! self::should_load() ) {
			return;
		}
		include ATO_CUSTOMIZER_PATH . 'templates/editor.php';
	}
}
