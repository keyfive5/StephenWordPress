<?php
/**
 * Plugin Name: ATO Customizer
 * Plugin URI: https://github.com/keyfive5/StephenWordPress
 * Description: Custom sticker & label customizer for All Take Out — product configuration (template, material, size, shape, quantity), drag-and-drop design editor with text/images/clipart/QR codes, VIP membership (50 complimentary stickers + free shipping), admin design review with edit history, and production-spec order emails. Requires WooCommerce.
 * Version: 1.3.0
 * Author: Hasan Zafar
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 * Text Domain: ato-customizer
 */

defined( 'ABSPATH' ) || exit;

define( 'ATO_CUSTOMIZER_VERSION', '1.3.0' );
define( 'ATO_CUSTOMIZER_FILE', __FILE__ );
define( 'ATO_CUSTOMIZER_PATH', plugin_dir_path( __FILE__ ) );
define( 'ATO_CUSTOMIZER_URL', plugin_dir_url( __FILE__ ) );

/**
 * The complimentary sticker credit granted to new VIP members.
 */
define( 'ATO_VIP_STICKER_CREDIT', 50 );

require_once ATO_CUSTOMIZER_PATH . 'includes/class-ato-poll.php';
require_once ATO_CUSTOMIZER_PATH . 'includes/class-ato-designs.php';
require_once ATO_CUSTOMIZER_PATH . 'includes/class-ato-product-options.php';
require_once ATO_CUSTOMIZER_PATH . 'includes/class-ato-frontend.php';
require_once ATO_CUSTOMIZER_PATH . 'includes/class-ato-cart.php';
require_once ATO_CUSTOMIZER_PATH . 'includes/class-ato-vip.php';
require_once ATO_CUSTOMIZER_PATH . 'includes/class-ato-emails.php';
require_once ATO_CUSTOMIZER_PATH . 'includes/class-ato-admin.php';

/**
 * Boot the plugin once all plugins are loaded (so WooCommerce checks work).
 */
function ato_customizer_init() {
	ATO_Designs::init();
	ATO_Poll::init();

	if ( ! class_exists( 'WooCommerce' ) ) {
		add_action( 'admin_notices', 'ato_customizer_wc_missing_notice' );
		return;
	}

	ATO_Product_Options::init();
	ATO_Frontend::init();
	ATO_Cart::init();
	ATO_VIP::init();
	ATO_Emails::init();
	ATO_Admin::init();
}
add_action( 'plugins_loaded', 'ato_customizer_init' );

/**
 * Admin notice when WooCommerce is not active.
 */
function ato_customizer_wc_missing_notice() {
	printf(
		'<div class="notice notice-error"><p>%s</p></div>',
		esc_html__( 'ATO Customizer needs WooCommerce to be installed and active. The design editor, VIP program and order workflow are paused until then.', 'ato-customizer' )
	);
}

/**
 * Activation: register the VIP role and flush rewrites for the account endpoint.
 */
function ato_customizer_activate() {
	add_role(
		'ato_vip',
		__( 'VIP Member', 'ato-customizer' ),
		array( 'read' => true )
	);
	// Endpoint added in ATO_VIP; make sure permalinks pick it up.
	if ( class_exists( 'ATO_VIP' ) ) {
		ATO_VIP::add_endpoint();
	}
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'ato_customizer_activate' );

/**
 * Deactivation: flush rewrites (role is left in place so existing VIPs keep status).
 */
function ato_customizer_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'ato_customizer_deactivate' );

/**
 * Declare WooCommerce HPOS compatibility.
 */
add_action( 'before_woocommerce_init', function () {
	if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
	}
} );
