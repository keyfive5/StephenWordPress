<?php
/**
 * Cart & order plumbing: carries the design + configuration from the
 * product page through the cart into the order, and applies quantity-tier pricing.
 *
 * @package ato-customizer
 */

defined( 'ABSPATH' ) || exit;

class ATO_Cart {

	public static function init() {
		add_filter( 'woocommerce_add_cart_item_data', array( __CLASS__, 'capture_design' ), 10, 2 );
		add_filter( 'woocommerce_get_item_data', array( __CLASS__, 'display_in_cart' ), 10, 2 );
		add_action( 'woocommerce_before_calculate_totals', array( __CLASS__, 'apply_tier_pricing' ), 20 );
		add_action( 'woocommerce_checkout_create_order_line_item', array( __CLASS__, 'save_to_order_item' ), 10, 3 );
	}

	/**
	 * Pick up the hidden fields posted with add-to-cart.
	 */
	public static function capture_design( $cart_item_data, $product_id ) {
		if ( ! empty( $_POST['ato_design_id'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- WooCommerce add-to-cart flow.
			$design_id = absint( $_POST['ato_design_id'] );
			if ( ATO_Designs::get_design_summary( $design_id ) ) {
				$cart_item_data['ato_design_id'] = $design_id;
				// A unique key stops WooCommerce merging two different designs of the same product.
				$cart_item_data['unique_key'] = 'ato-' . $design_id;
			}
		}
		if ( ! empty( $_POST['ato_config'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			$config = json_decode( sanitize_text_field( wp_unslash( $_POST['ato_config'] ) ), true );
			if ( is_array( $config ) ) {
				$cart_item_data['ato_config'] = array_map( 'sanitize_text_field', $config );
			}
		}
		return $cart_item_data;
	}

	/**
	 * Show the configuration + preview under the cart line item.
	 */
	public static function display_in_cart( $item_data, $cart_item ) {
		if ( ! empty( $cart_item['ato_config'] ) && is_array( $cart_item['ato_config'] ) ) {
			$labels = array(
				'template' => __( 'Template', 'ato-customizer' ),
				'material' => __( 'Material', 'ato-customizer' ),
				'size'     => __( 'Size', 'ato-customizer' ),
				'shape'    => __( 'Shape', 'ato-customizer' ),
				'quantity' => __( 'Quantity', 'ato-customizer' ),
			);
			foreach ( $labels as $key => $label ) {
				if ( ! empty( $cart_item['ato_config'][ $key ] ) ) {
					$item_data[] = array(
						'key'   => $label,
						'value' => wc_clean( $cart_item['ato_config'][ $key ] ),
					);
				}
			}
		}
		if ( ! empty( $cart_item['ato_design_id'] ) ) {
			$summary = ATO_Designs::get_design_summary( $cart_item['ato_design_id'] );
			if ( $summary ) {
				$preview = $summary['preview']
					? '<span class="ato-cart-design"><img src="' . esc_url( $summary['preview'] ) . '" alt="' . esc_attr__( 'Design preview', 'ato-customizer' ) . '"><span>' . esc_html( $summary['ref'] ) . '</span></span>'
					: esc_html( $summary['ref'] );
				$item_data[] = array(
					'key'     => __( 'Your design', 'ato-customizer' ),
					'display' => $preview,
					'value'   => $summary['ref'],
				);
			}
		}
		return $item_data;
	}

	/**
	 * If the chosen quantity tier has a price, it becomes the line price.
	 */
	public static function apply_tier_pricing( $cart ) {
		if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
			return;
		}
		foreach ( $cart->get_cart() as $cart_item ) {
			if ( empty( $cart_item['ato_config']['quantity'] ) ) {
				continue;
			}
			$product_id = $cart_item['product_id'];
			$tier_price = ATO_Product_Options::get_tier_price( $product_id, (int) $cart_item['ato_config']['quantity'] );
			if ( null !== $tier_price ) {
				$cart_item['data']->set_price( $tier_price );
			}
		}
	}

	/**
	 * Persist everything on the order line item for production + admin review.
	 */
	public static function save_to_order_item( $item, $cart_item_key, $values ) {
		if ( ! empty( $values['ato_config'] ) && is_array( $values['ato_config'] ) ) {
			foreach ( $values['ato_config'] as $key => $value ) {
				$item->add_meta_data( ucfirst( $key ), wc_clean( $value ), true );
			}
		}
		if ( ! empty( $values['ato_design_id'] ) ) {
			$design_id = (int) $values['ato_design_id'];
			$summary   = ATO_Designs::get_design_summary( $design_id );
			$item->add_meta_data( '_ato_design_id', $design_id, true );
			if ( $summary ) {
				$item->add_meta_data( __( 'Design ref', 'ato-customizer' ), $summary['ref'], true );
			}
		}
	}
}
