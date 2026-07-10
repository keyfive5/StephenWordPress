<?php
/**
 * All Take Out theme setup.
 *
 * @package alltakeout
 */

defined( 'ABSPATH' ) || exit;

define( 'ATO_THEME_VERSION', '1.0.0' );

require get_template_directory() . '/inc/icons.php';

/**
 * Theme supports, menus, image sizes.
 */
function ato_theme_setup() {
	load_theme_textdomain( 'alltakeout', get_template_directory() . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo', array(
		'height'      => 88,
		'width'       => 300,
		'flex-height' => true,
		'flex-width'  => true,
	) );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );

	// WooCommerce.
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );

	register_nav_menus( array(
		'primary' => __( 'Primary Menu', 'alltakeout' ),
		'footer'  => __( 'Footer Menu', 'alltakeout' ),
		'legal'   => __( 'Legal Menu', 'alltakeout' ),
	) );
}
add_action( 'after_setup_theme', 'ato_theme_setup' );

/**
 * Enqueue styles and scripts.
 */
function ato_enqueue_assets() {
	wp_enqueue_style(
		'ato-fonts',
		'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=DM+Sans:wght@400;500;700&display=swap',
		array(),
		null
	);
	wp_enqueue_style( 'alltakeout-style', get_stylesheet_uri(), array( 'ato-fonts' ), ATO_THEME_VERSION );
	wp_enqueue_script( 'alltakeout-main', get_template_directory_uri() . '/assets/js/main.js', array(), ATO_THEME_VERSION, true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'ato_enqueue_assets' );

/**
 * Preconnect for Google Fonts.
 */
function ato_resource_hints( $urls, $relation_type ) {
	if ( 'preconnect' === $relation_type ) {
		$urls[] = array( 'href' => 'https://fonts.gstatic.com', 'crossorigin' );
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'ato_resource_hints', 10, 2 );

/**
 * Fallback menu: pulls the pages the site is expected to have.
 */
function ato_fallback_menu() {
	$items = array(
		__( 'Shop', 'alltakeout' )          => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' ),
		__( 'VIP Members', 'alltakeout' )   => home_url( '/vip-members/' ),
		__( 'Making Labels', 'alltakeout' ) => home_url( '/making-labels/' ),
		__( 'FAQs', 'alltakeout' )          => home_url( '/faqs/' ),
		__( 'Blog', 'alltakeout' )          => home_url( '/blog/' ),
	);
	echo '<ul>';
	foreach ( $items as $label => $url ) {
		printf( '<li><a href="%s">%s</a></li>', esc_url( $url ), esc_html( $label ) );
	}
	echo '</ul>';
}

/**
 * Cart count fragment so the header badge refreshes via AJAX.
 */
function ato_cart_count_fragment( $fragments ) {
	$count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
	$fragments['.cart-count'] = '<span class="cart-count">' . esc_html( $count ) . '</span>';
	return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'ato_cart_count_fragment' );

/**
 * Wrap WooCommerce output in theme containers.
 */
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );

function ato_wc_wrapper_start() {
	echo '<div class="container ato-shop-wrap"><main id="primary" class="site-main">';
}
add_action( 'woocommerce_before_main_content', 'ato_wc_wrapper_start', 10 );

function ato_wc_wrapper_end() {
	echo '</main></div>';
}
add_action( 'woocommerce_after_main_content', 'ato_wc_wrapper_end', 10 );

/**
 * Shop grid: 3 columns, 12 per page.
 */
add_filter( 'loop_shop_columns', function () { return 3; } );
add_filter( 'loop_shop_per_page', function () { return 12; } );

/**
 * Excerpt length + more link.
 */
add_filter( 'excerpt_length', function () { return 24; } );
add_filter( 'excerpt_more', function () { return '&hellip;'; } );

/**
 * The seven ATO shop categories used across the site.
 * If WooCommerce product categories exist they take priority;
 * otherwise this static list keeps the storefront navigable pre-launch.
 *
 * @return array[] { name, description, icon, url, count }
 */
function ato_get_categories() {
	$static = array(
		array( 'name' => __( 'Social Media Labels', 'alltakeout' ), 'desc' => __( 'Turn every bag into a follow — Instagram, TikTok and Facebook handles your customers can scan.', 'alltakeout' ), 'icon' => 'megaphone', 'slug' => 'social-media-labels' ),
		array( 'name' => __( 'QR Code Labels', 'alltakeout' ), 'desc' => __( 'Link menus, review pages or loyalty programs with crisp, scannable QR stickers.', 'alltakeout' ), 'icon' => 'qr', 'slug' => 'qr-code-labels' ),
		array( 'name' => __( 'Promotional Labels', 'alltakeout' ), 'desc' => __( 'Sales, launches and limited offers — labels that move the needle.', 'alltakeout' ), 'icon' => 'tag', 'slug' => 'promotional-labels' ),
		array( 'name' => __( 'Branded Labels', 'alltakeout' ), 'desc' => __( 'Your logo, your colours, on every order that leaves the kitchen.', 'alltakeout' ), 'icon' => 'badge', 'slug' => 'branded-labels' ),
		array( 'name' => __( 'Tamper-Evident Labels', 'alltakeout' ), 'desc' => __( 'Seal orders with confidence — customers see their food arrives untouched.', 'alltakeout' ), 'icon' => 'shield', 'slug' => 'tamper-evident-labels' ),
		array( 'name' => __( 'Customer Appreciation', 'alltakeout' ), 'desc' => __( 'Thank-you stickers that turn first orders into regulars.', 'alltakeout' ), 'icon' => 'heart', 'slug' => 'customer-appreciation-stickers' ),
		array( 'name' => __( 'Food Identification', 'alltakeout' ), 'desc' => __( 'Allergens, spice levels, prep dates — clear info, zero mix-ups.', 'alltakeout' ), 'icon' => 'utensils', 'slug' => 'food-identification-labels' ),
	);

	$cats = array();

	if ( taxonomy_exists( 'product_cat' ) ) {
		$terms = get_terms( array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => false,
			'exclude'    => array( (int) get_option( 'default_product_cat', 0 ) ),
		) );
		if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
			$icon_map = wp_list_pluck( $static, 'icon', 'slug' );
			foreach ( $terms as $term ) {
				$cats[] = array(
					'name'  => $term->name,
					'desc'  => $term->description ? $term->description : '',
					'icon'  => isset( $icon_map[ $term->slug ] ) ? $icon_map[ $term->slug ] : 'sticker',
					'url'   => get_term_link( $term ),
					'count' => (int) $term->count,
				);
			}
			return $cats;
		}
	}

	foreach ( $static as $cat ) {
		$cats[] = array(
			'name'  => $cat['name'],
			'desc'  => $cat['desc'],
			'icon'  => $cat['icon'],
			'url'   => home_url( '/product-category/' . $cat['slug'] . '/' ),
			'count' => 0,
		);
	}
	return $cats;
}

/**
 * Body class helper for scrolled-header JS.
 */
function ato_body_classes( $classes ) {
	if ( ! is_front_page() ) {
		$classes[] = 'has-page-hero';
	}
	return $classes;
}
add_filter( 'body_class', 'ato_body_classes' );
