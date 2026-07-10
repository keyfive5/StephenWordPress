<?php
/**
 * Per-product customizer configuration.
 *
 * Adds an "ATO Customizer" tab to the WooCommerce product data box where the
 * admin defines the five configuration attributes from the client spec:
 * templates, materials, sizes, shapes and quantity tiers.
 *
 * Formats (one option per line):
 * - Templates : Label|Image URL          e.g.  Classic Round|https://site.com/tpl.png
 * - Materials : plain text               e.g.  Waterproof vinyl
 * - Sizes     : plain text               e.g.  3" x 3"
 * - Shapes    : one of circle/square/rectangle plus display label, "circle|Round"
 * - Quantities: Qty|Price                e.g.  250|39.00   (price optional)
 *
 * @package ato-customizer
 */

defined( 'ABSPATH' ) || exit;

class ATO_Product_Options {

	public static function init() {
		add_filter( 'woocommerce_product_data_tabs', array( __CLASS__, 'add_tab' ) );
		add_action( 'woocommerce_product_data_panels', array( __CLASS__, 'render_panel' ) );
		add_action( 'woocommerce_process_product_meta', array( __CLASS__, 'save' ) );
	}

	public static function add_tab( $tabs ) {
		$tabs['ato_customizer'] = array(
			'label'  => __( 'ATO Customizer', 'ato-customizer' ),
			'target' => 'ato_customizer_panel',
			'class'  => array(),
		);
		return $tabs;
	}

	public static function render_panel() {
		global $post;
		wp_nonce_field( 'ato_product_options', 'ato_product_options_nonce' );
		?>
		<div id="ato_customizer_panel" class="panel woocommerce_options_panel">
			<div class="options_group">
				<?php
				woocommerce_wp_checkbox( array(
					'id'          => '_ato_enabled',
					'label'       => __( 'Enable customizer', 'ato-customizer' ),
					'description' => __( 'Show the "Customize this label" designer on this product.', 'ato-customizer' ),
				) );
				woocommerce_wp_textarea_input( array(
					'id'          => '_ato_templates',
					'label'       => __( 'Templates', 'ato-customizer' ),
					'description' => __( 'One per line: Name|Image URL. The image becomes the starting background of the design.', 'ato-customizer' ),
					'desc_tip'    => true,
					'placeholder' => "Classic Round|https://example.com/template-round.png\nBlank Canvas|",
					'style'       => 'height:90px',
				) );
				woocommerce_wp_textarea_input( array(
					'id'          => '_ato_materials',
					'label'       => __( 'Materials', 'ato-customizer' ),
					'description' => __( 'One per line, e.g. Glossy paper / Waterproof vinyl.', 'ato-customizer' ),
					'desc_tip'    => true,
					'placeholder' => "Glossy paper\nMatte paper\nWaterproof vinyl",
					'style'       => 'height:90px',
				) );
				woocommerce_wp_textarea_input( array(
					'id'          => '_ato_sizes',
					'label'       => __( 'Sizes', 'ato-customizer' ),
					'description' => __( 'One per line, e.g. 2" x 2".', 'ato-customizer' ),
					'desc_tip'    => true,
					'placeholder' => "2\" x 2\"\n3\" x 3\"\n4\" x 4\"",
					'style'       => 'height:90px',
				) );
				woocommerce_wp_textarea_input( array(
					'id'          => '_ato_shapes',
					'label'       => __( 'Shapes', 'ato-customizer' ),
					'description' => __( 'One per line: shape|Label. Shape must be circle, square or rectangle — it sets the cut line in the editor.', 'ato-customizer' ),
					'desc_tip'    => true,
					'placeholder' => "circle|Round\nsquare|Square\nrectangle|Rectangle",
					'style'       => 'height:90px',
				) );
				woocommerce_wp_textarea_input( array(
					'id'          => '_ato_quantities',
					'label'       => __( 'Quantity tiers', 'ato-customizer' ),
					'description' => __( 'One per line: Quantity|Price. When a price is given it overrides the product price for that tier (e.g. 250|39.00).', 'ato-customizer' ),
					'desc_tip'    => true,
					'placeholder' => "100|19.00\n250|39.00\n500|69.00\n1000|119.00",
					'style'       => 'height:90px',
				) );
				?>
			</div>
		</div>
		<?php
	}

	public static function save( $post_id ) {
		if ( ! isset( $_POST['ato_product_options_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['ato_product_options_nonce'] ), 'ato_product_options' ) ) {
			return;
		}
		update_post_meta( $post_id, '_ato_enabled', isset( $_POST['_ato_enabled'] ) ? 'yes' : 'no' );
		foreach ( array( '_ato_templates', '_ato_materials', '_ato_sizes', '_ato_shapes', '_ato_quantities' ) as $key ) {
			$value = isset( $_POST[ $key ] ) ? sanitize_textarea_field( wp_unslash( $_POST[ $key ] ) ) : '';
			update_post_meta( $post_id, $key, $value );
		}
	}

	/**
	 * Whether the customizer is on for a product.
	 */
	public static function is_enabled( $product_id ) {
		return 'yes' === get_post_meta( $product_id, '_ato_enabled', true );
	}

	/**
	 * Parse the option textareas into structured arrays for the editor.
	 *
	 * @param int $product_id Product ID.
	 * @return array
	 */
	public static function get_config( $product_id ) {
		$parse_lines = function ( $meta_key ) use ( $product_id ) {
			$raw   = (string) get_post_meta( $product_id, $meta_key, true );
			$lines = array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', $raw ) ) );
			return array_values( $lines );
		};

		$templates = array();
		foreach ( $parse_lines( '_ato_templates' ) as $line ) {
			$parts       = array_map( 'trim', explode( '|', $line, 2 ) );
			$templates[] = array(
				'name'  => $parts[0],
				'image' => isset( $parts[1] ) ? esc_url_raw( $parts[1] ) : '',
			);
		}

		$shapes = array();
		foreach ( $parse_lines( '_ato_shapes' ) as $line ) {
			$parts  = array_map( 'trim', explode( '|', $line, 2 ) );
			$key    = strtolower( $parts[0] );
			if ( ! in_array( $key, array( 'circle', 'square', 'rectangle' ), true ) ) {
				$key = 'square';
			}
			$shapes[] = array(
				'shape' => $key,
				'label' => isset( $parts[1] ) ? $parts[1] : ucfirst( $key ),
			);
		}

		$quantities = array();
		foreach ( $parse_lines( '_ato_quantities' ) as $line ) {
			$parts        = array_map( 'trim', explode( '|', $line, 2 ) );
			$quantities[] = array(
				'qty'   => (int) $parts[0],
				'price' => isset( $parts[1] ) && '' !== $parts[1] ? (float) $parts[1] : null,
			);
		}

		// Sensible defaults so the editor always works, even on a bare product.
		if ( empty( $templates ) ) {
			$templates = array( array( 'name' => __( 'Blank canvas', 'ato-customizer' ), 'image' => '' ) );
		}
		if ( empty( $shapes ) ) {
			$shapes = array(
				array( 'shape' => 'circle', 'label' => __( 'Round', 'ato-customizer' ) ),
				array( 'shape' => 'square', 'label' => __( 'Square', 'ato-customizer' ) ),
			);
		}

		return array(
			'templates'  => $templates,
			'materials'  => $parse_lines( '_ato_materials' ),
			'sizes'      => $parse_lines( '_ato_sizes' ),
			'shapes'     => $shapes,
			'quantities' => $quantities,
		);
	}

	/**
	 * Price for a quantity tier, if the admin set one.
	 *
	 * @param int $product_id Product ID.
	 * @param int $qty        Chosen quantity tier.
	 * @return float|null
	 */
	public static function get_tier_price( $product_id, $qty ) {
		$config = self::get_config( $product_id );
		foreach ( $config['quantities'] as $tier ) {
			if ( $tier['qty'] === (int) $qty && null !== $tier['price'] ) {
				return $tier['price'];
			}
		}
		return null;
	}
}
