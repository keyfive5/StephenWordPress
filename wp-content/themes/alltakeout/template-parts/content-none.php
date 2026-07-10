<?php
/**
 * Empty state.
 *
 * @package alltakeout
 */
?>
<div class="text-center section--tight">
	<h2><?php esc_html_e( 'Nothing here yet', 'alltakeout' ); ?></h2>
	<p class="lede"><?php esc_html_e( 'Try a different search, or head back to the shop to start designing.', 'alltakeout' ); ?></p>
	<a class="btn btn--primary" href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) ); ?>"><?php esc_html_e( 'Go to the shop', 'alltakeout' ); ?></a>
</div>
