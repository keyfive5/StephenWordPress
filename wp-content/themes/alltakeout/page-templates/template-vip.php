<?php
/**
 * Template Name: VIP Members
 *
 * @package alltakeout
 */

get_header();

$ato_account_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' );
?>
<main id="primary" class="site-main">

	<section class="hero">
		<div class="container hero-grid">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'VIP membership', 'alltakeout' ); ?></span>
				<h1><?php echo wp_kses_post( __( 'Perks that <span class="mark"><span>stick around</span></span>', 'alltakeout' ) ); ?></h1>
				<p class="lede"><?php esc_html_e( 'VIP membership is completely free. Create an account — on its own or during checkout — and the benefits apply to every order you place with us.', 'alltakeout' ); ?></p>
				<div class="hero-ctas">
					<a class="btn btn--accent btn--lg" href="<?php echo esc_url( $ato_account_url ); ?>"><?php esc_html_e( 'Join free today', 'alltakeout' ); ?></a>
				</div>
			</div>
			<div class="hero-visual" style="min-height: 320px;" aria-hidden="true">
				<div class="sticker sticker--round sticker-1" style="top: 8%; left: 16%;">
					<div>
						<?php ato_the_icon( 'gift', 34 ); ?>
						<div class="s-title">50</div>
						<div class="s-sub"><?php esc_html_e( 'Free stickers', 'alltakeout' ); ?></div>
					</div>
				</div>
				<div class="sticker sticker--die sticker-5" style="bottom: 12%; right: 14%;">
					<?php ato_the_icon( 'truck', 30 ); ?>
					<div class="s-title"><?php esc_html_e( 'Free shipping', 'alltakeout' ); ?></div>
					<div class="s-sub"><?php esc_html_e( 'Every order', 'alltakeout' ); ?></div>
				</div>
			</div>
		</div>
	</section>

	<section class="section section--kraft">
		<div class="container">
			<div class="section-head section-head--center">
				<h2><?php esc_html_e( 'Everything VIPs get', 'alltakeout' ); ?></h2>
			</div>
			<div class="cat-grid">
				<div class="cat-card reveal">
					<span class="cat-icon"><?php ato_the_icon( 'gift', 28 ); ?></span>
					<h3><?php esc_html_e( '50 complimentary stickers', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'Added to your account automatically the moment you join — redeemed with your next order.', 'alltakeout' ); ?></p>
				</div>
				<div class="cat-card reveal">
					<span class="cat-icon"><?php ato_the_icon( 'truck', 28 ); ?></span>
					<h3><?php esc_html_e( 'Free ground shipping', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'No minimums, no codes. VIP orders always ship free within our ground network.', 'alltakeout' ); ?></p>
				</div>
				<div class="cat-card reveal">
					<span class="cat-icon"><?php ato_the_icon( 'star', 28 ); ?></span>
					<h3><?php esc_html_e( 'Priority support', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'Jump the queue. VIP tickets and design reviews are handled first.', 'alltakeout' ); ?></p>
				</div>
				<div class="cat-card reveal">
					<span class="cat-icon"><?php ato_the_icon( 'tag', 28 ); ?></span>
					<h3><?php esc_html_e( 'Exclusive discounts', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'Member-only pricing events and early access to new materials and shapes.', 'alltakeout' ); ?></p>
				</div>
			</div>
		</div>
	</section>

	<section class="section">
		<div class="container container--narrow">
			<div class="section-head section-head--center">
				<h2><?php esc_html_e( 'How to join', 'alltakeout' ); ?></h2>
				<p class="lede"><?php esc_html_e( 'Two ways in — both take under a minute.', 'alltakeout' ); ?></p>
			</div>
			<div class="steps" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
				<div class="step reveal">
					<h3><?php esc_html_e( 'At checkout', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'Tick “Create an account” while placing an order. Your VIP status and 50 stickers apply immediately.', 'alltakeout' ); ?></p>
				</div>
				<div class="step reveal">
					<h3><?php esc_html_e( 'Right now', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'Register from the My Account page and your perks will be waiting on your first order.', 'alltakeout' ); ?></p>
				</div>
			</div>
			<p class="text-center" style="margin-top: var(--sp-6);">
				<a class="btn btn--primary btn--lg" href="<?php echo esc_url( $ato_account_url ); ?>"><?php esc_html_e( 'Create my free account', 'alltakeout' ); ?></a>
			</p>
		</div>
	</section>

	<?php
	// Optional editor-managed content below the built-in sections.
	while ( have_posts() ) :
		the_post();
		if ( trim( get_the_content() ) ) :
			?>
			<section class="section section--tight">
				<div class="container container--narrow entry-content">
					<?php the_content(); ?>
				</div>
			</section>
			<?php
		endif;
	endwhile;
	?>

</main>
<?php
get_footer();
