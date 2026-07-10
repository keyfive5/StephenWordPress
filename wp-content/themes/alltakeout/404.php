<?php
/**
 * 404.
 *
 * @package alltakeout
 */

get_header();
?>
<main id="primary" class="site-main">
	<div class="container error-404">
		<div class="num">404</div>
		<h1><?php esc_html_e( 'This label peeled off', 'alltakeout' ); ?></h1>
		<p class="lede"><?php esc_html_e( "The page you're looking for isn't here. Let's get you back to the good stuff.", 'alltakeout' ); ?></p>
		<a class="btn btn--primary btn--lg" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Back to home', 'alltakeout' ); ?></a>
	</div>
</main>
<?php
get_footer();
