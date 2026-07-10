<?php
/**
 * WooCommerce wrapper template.
 * Content wrappers are handled in functions.php via
 * woocommerce_before_main_content / woocommerce_after_main_content.
 *
 * @package alltakeout
 */

get_header();

woocommerce_content();

get_footer();
