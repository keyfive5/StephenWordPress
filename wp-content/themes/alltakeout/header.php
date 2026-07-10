<?php
/**
 * Site header.
 *
 * @package alltakeout
 */
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="skip-link" href="#primary"><?php esc_html_e( 'Skip to content', 'alltakeout' ); ?></a>

<header class="site-header" id="site-header">
	<div class="container header-bar">

		<?php if ( has_custom_logo() ) : ?>
			<a class="site-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
				<?php the_custom_logo(); ?>
			</a>
		<?php else : ?>
			<a class="site-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>">
				<span class="brand-dot"><?php ato_the_icon( 'sticker', 22 ); ?></span>
				<span><?php bloginfo( 'name' ); ?></span>
			</a>
		<?php endif; ?>

		<nav class="main-nav" id="main-nav" aria-label="<?php esc_attr_e( 'Primary navigation', 'alltakeout' ); ?>">
			<button class="nav-close" id="nav-close" aria-label="<?php esc_attr_e( 'Close menu', 'alltakeout' ); ?>">
				<?php ato_the_icon( 'close', 22 ); ?>
			</button>
			<?php
			wp_nav_menu( array(
				'theme_location' => 'primary',
				'container'      => false,
				'fallback_cb'    => 'ato_fallback_menu',
				'depth'          => 2,
			) );
			?>
		</nav>

		<div class="header-actions">
			<?php if ( function_exists( 'wc_get_cart_url' ) ) : ?>
				<a class="cart-link" href="<?php echo esc_url( wc_get_cart_url() ); ?>" aria-label="<?php esc_attr_e( 'View cart', 'alltakeout' ); ?>">
					<?php ato_the_icon( 'cart', 20 ); ?>
					<span class="cart-count"><?php echo esc_html( WC()->cart ? WC()->cart->get_cart_contents_count() : 0 ); ?></span>
				</a>
			<?php endif; ?>

			<a class="btn btn--primary btn--sm header-cta" href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' ) ); ?>">
				<?php esc_html_e( 'Design your labels', 'alltakeout' ); ?>
			</a>

			<button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="<?php esc_attr_e( 'Open menu', 'alltakeout' ); ?>">
				<?php ato_the_icon( 'menu', 22 ); ?>
			</button>
		</div>

	</div>
</header>
