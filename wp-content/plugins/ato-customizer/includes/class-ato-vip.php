<?php
/**
 * VIP membership.
 *
 * Per the client flow document:
 * - Any customer who creates an account (including during checkout) becomes a VIP.
 * - VIPs receive 50 complimentary stickers automatically on account creation.
 * - VIP benefits (free ground shipping) apply on every order.
 * - The sticker credit and VIP status are visible in My Account,
 *   and the credit award is logged on the triggering order.
 *
 * @package ato-customizer
 */

defined( 'ABSPATH' ) || exit;

class ATO_VIP {

	const ENDPOINT = 'vip-benefits';

	public static function init() {
		add_action( 'woocommerce_created_customer', array( __CLASS__, 'grant_vip' ), 10, 1 );
		add_action( 'woocommerce_checkout_order_processed', array( __CLASS__, 'note_credit_on_order' ), 20, 1 );
		add_action( 'init', array( __CLASS__, 'add_endpoint' ) );
		add_filter( 'woocommerce_account_menu_items', array( __CLASS__, 'account_menu' ) );
		add_action( 'woocommerce_account_' . self::ENDPOINT . '_endpoint', array( __CLASS__, 'render_account_tab' ) );
		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'vip_free_ground_shipping' ), 20, 1 );
	}

	/**
	 * Is this user a VIP member?
	 */
	public static function is_vip( $user_id = 0 ) {
		$user = $user_id ? get_user_by( 'id', $user_id ) : wp_get_current_user();
		return $user && $user->exists() && in_array( 'ato_vip', (array) $user->roles, true );
	}

	/**
	 * Every new customer account = VIP + 50 complimentary stickers.
	 * Fires for standalone registration AND account-created-at-checkout.
	 */
	public static function grant_vip( $customer_id ) {
		$user = get_user_by( 'id', $customer_id );
		if ( ! $user ) {
			return;
		}
		$user->add_role( 'ato_vip' );

		if ( '' === get_user_meta( $customer_id, '_ato_sticker_credit', true ) ) {
			update_user_meta( $customer_id, '_ato_sticker_credit', ATO_VIP_STICKER_CREDIT );
			update_user_meta( $customer_id, '_ato_vip_since', current_time( 'mysql' ) );
		}
	}

	/**
	 * If the order's customer is a VIP with an unacknowledged credit,
	 * log the award on the order so admins see it in the order history.
	 */
	public static function note_credit_on_order( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		$user_id = $order->get_customer_id();
		if ( ! $user_id || ! self::is_vip( $user_id ) ) {
			return;
		}
		$credit = (int) get_user_meta( $user_id, '_ato_sticker_credit', true );
		if ( $credit > 0 && ! get_user_meta( $user_id, '_ato_credit_noted', true ) ) {
			$order->add_order_note(
				sprintf(
					/* translators: %d: number of complimentary stickers. */
					__( 'VIP member: %d complimentary stickers credited to this customer. Include them with this shipment.', 'ato-customizer' ),
					$credit
				)
			);
			update_user_meta( $user_id, '_ato_credit_noted', $order_id );
		}
		$order->update_meta_data( '_ato_vip_order', self::is_vip( $user_id ) ? 'yes' : 'no' );
		$order->save();
	}

	/**
	 * My Account endpoint.
	 */
	public static function add_endpoint() {
		add_rewrite_endpoint( self::ENDPOINT, EP_ROOT | EP_PAGES );
	}

	public static function account_menu( $items ) {
		$new = array();
		foreach ( $items as $key => $label ) {
			$new[ $key ] = $label;
			if ( 'dashboard' === $key ) {
				$new[ self::ENDPOINT ] = __( 'VIP Benefits', 'ato-customizer' );
			}
		}
		return $new;
	}

	public static function render_account_tab() {
		$user_id = get_current_user_id();
		$credit  = (int) get_user_meta( $user_id, '_ato_sticker_credit', true );
		$is_vip  = self::is_vip( $user_id );
		?>
		<h2><?php esc_html_e( 'Your VIP benefits', 'ato-customizer' ); ?></h2>
		<?php if ( $is_vip ) : ?>
			<div class="ato-credit-chip">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8c-2 0-5-.5-5-3a2 2 0 0 1 4-.9c.4.8 1 2.9 1 3.9Zm0 0c2 0 5-.5 5-3a2 2 0 0 0-4-.9c-.4.8-1 2.9-1 3.9Z"/></svg>
				<span>
					<?php
					printf(
						/* translators: %d: sticker credit balance. */
						esc_html__( 'Complimentary sticker balance: %d', 'ato-customizer' ),
						(int) $credit
					);
					?>
				</span>
			</div>
			<ul>
				<li><?php esc_html_e( 'Free ground shipping is applied automatically at checkout.', 'ato-customizer' ); ?></li>
				<li><?php esc_html_e( 'Your complimentary stickers ship with your next order — no code needed.', 'ato-customizer' ); ?></li>
				<li><?php esc_html_e( 'Priority support: mention you are a VIP when you contact us.', 'ato-customizer' ); ?></li>
			</ul>
		<?php else : ?>
			<p><?php esc_html_e( 'Your account is not a VIP membership yet. Place an order or contact us and we will sort it out.', 'ato-customizer' ); ?></p>
		<?php endif; ?>
		<?php
	}

	/**
	 * Free ground shipping for VIPs: zero out flat-rate style ground methods.
	 * Express/overnight methods (if any) keep their price.
	 */
	public static function vip_free_ground_shipping( $rates ) {
		if ( ! is_user_logged_in() || ! self::is_vip( get_current_user_id() ) ) {
			return $rates;
		}
		foreach ( $rates as $rate ) {
			if ( in_array( $rate->get_method_id(), array( 'flat_rate', 'local_pickup' ), true ) ) {
				$rate->set_cost( 0 );
				$rate->set_taxes( array() );
				$rate->set_label( sprintf( '%s — %s', $rate->get_label(), __( 'Free for VIPs', 'ato-customizer' ) ) );
			}
		}
		return $rates;
	}
}
