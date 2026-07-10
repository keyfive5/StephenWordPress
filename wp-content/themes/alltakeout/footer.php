<?php
/**
 * Site footer.
 *
 * @package alltakeout
 */
?>
<footer class="site-footer">
	<div class="container">
		<div class="footer-grid">
			<div>
				<a class="footer-brand" href="<?php echo esc_url( home_url( '/' ) ); ?>">
					<span class="brand-dot"><?php ato_the_icon( 'sticker', 22 ); ?></span>
					<span><?php bloginfo( 'name' ); ?></span>
				</a>
				<p class="footer-tag"><?php esc_html_e( 'Custom labels and stickers that turn every takeout order into a marketing opportunity. Designed by you, reviewed by our print team, delivered to your door.', 'alltakeout' ); ?></p>
			</div>

			<div class="footer-col">
				<h4><?php esc_html_e( 'Shop', 'alltakeout' ); ?></h4>
				<ul>
					<?php foreach ( array_slice( ato_get_categories(), 0, 5 ) as $ato_cat ) : ?>
						<li><a href="<?php echo esc_url( $ato_cat['url'] ); ?>"><?php echo esc_html( $ato_cat['name'] ); ?></a></li>
					<?php endforeach; ?>
				</ul>
			</div>

			<div class="footer-col">
				<h4><?php esc_html_e( 'Company', 'alltakeout' ); ?></h4>
				<?php
				wp_nav_menu( array(
					'theme_location' => 'footer',
					'container'      => false,
					'depth'          => 1,
					'fallback_cb'    => function () {
						printf(
							'<ul><li><a href="%1$s">%2$s</a></li><li><a href="%3$s">%4$s</a></li><li><a href="%5$s">%6$s</a></li><li><a href="%7$s">%8$s</a></li></ul>',
							esc_url( home_url( '/vip-members/' ) ),
							esc_html__( 'VIP Members', 'alltakeout' ),
							esc_url( home_url( '/making-labels/' ) ),
							esc_html__( 'Making Labels', 'alltakeout' ),
							esc_url( home_url( '/faqs/' ) ),
							esc_html__( 'FAQs', 'alltakeout' ),
							esc_url( home_url( '/blog/' ) ),
							esc_html__( 'Blog', 'alltakeout' )
						);
					},
				) );
				?>
			</div>

			<div class="footer-col">
				<h4><?php esc_html_e( 'Support', 'alltakeout' ); ?></h4>
				<ul>
					<li><a href="<?php echo esc_url( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ) ); ?>"><?php esc_html_e( 'My Account', 'alltakeout' ); ?></a></li>
					<li><a href="<?php echo esc_url( function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' ) ); ?>"><?php esc_html_e( 'Cart', 'alltakeout' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Contact us', 'alltakeout' ); ?></a></li>
				</ul>
			</div>
		</div>

		<div class="footer-bottom">
			<span>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?> &middot; <?php esc_html_e( 'Kew Stick Inc.', 'alltakeout' ); ?></span>
			<?php
			wp_nav_menu( array(
				'theme_location' => 'legal',
				'container'      => false,
				'depth'          => 1,
				'fallback_cb'    => false,
				'menu_class'     => 'footer-legal',
			) );
			?>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
