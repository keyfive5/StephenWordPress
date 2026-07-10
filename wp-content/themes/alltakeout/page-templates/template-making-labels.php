<?php
/**
 * Template Name: Making Labels
 *
 * @package alltakeout
 */

get_header();

$ato_shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' );
?>
<div class="page-hero">
	<div class="container">
		<span class="eyebrow"><?php esc_html_e( 'Behind the press', 'alltakeout' ); ?></span>
		<h1><?php esc_html_e( 'How your labels get made', 'alltakeout' ); ?></h1>
		<p class="lede"><?php esc_html_e( 'From your browser to our press to your kitchen — here’s the whole journey.', 'alltakeout' ); ?></p>
	</div>
</div>

<main id="primary" class="site-main">

	<section class="section" style="padding-top: 0;">
		<div class="container">
			<div class="steps" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
				<div class="step reveal">
					<h3><?php esc_html_e( 'You design', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'Choose template, material, size, shape and quantity — then make it yours in the drag-and-drop editor with text, images, clipart and QR codes.', 'alltakeout' ); ?></p>
				</div>
				<div class="step reveal">
					<h3><?php esc_html_e( 'We review', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'A print specialist checks every design: alignment, bleed, resolution, spelling. If something needs a nudge, we fix it and note it in your order history.', 'alltakeout' ); ?></p>
				</div>
				<div class="step reveal">
					<h3><?php esc_html_e( 'We print & cut', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'Commercial presses, food-environment-safe inks and precision die-cutting for clean edges on every shape.', 'alltakeout' ); ?></p>
				</div>
				<div class="step reveal">
					<h3><?php esc_html_e( 'You peel & stick', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'Labels arrive on easy-peel liners, ready for bags, boxes, cups and containers.', 'alltakeout' ); ?></p>
				</div>
			</div>
		</div>
	</section>

	<section class="section section--kraft">
		<div class="container split">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'Materials', 'alltakeout' ); ?></span>
				<h2><?php esc_html_e( 'Built for real kitchens', 'alltakeout' ); ?></h2>
				<ul class="feature-list">
					<li><?php ato_the_icon( 'check', 22 ); ?><div><strong><?php esc_html_e( 'Glossy & matte paper', 'alltakeout' ); ?></strong><span><?php esc_html_e( 'Vivid colour for bags and boxes at everyday prices.', 'alltakeout' ); ?></span></div></li>
					<li><?php ato_the_icon( 'check', 22 ); ?><div><strong><?php esc_html_e( 'Waterproof vinyl', 'alltakeout' ); ?></strong><span><?php esc_html_e( 'Shrugs off condensation on cold drinks and fridge storage.', 'alltakeout' ); ?></span></div></li>
					<li><?php ato_the_icon( 'check', 22 ); ?><div><strong><?php esc_html_e( 'Freezer-safe stock', 'alltakeout' ); ?></strong><span><?php esc_html_e( 'Stays put and stays legible from prep line to freezer.', 'alltakeout' ); ?></span></div></li>
					<li><?php ato_the_icon( 'check', 22 ); ?><div><strong><?php esc_html_e( 'Tamper-evident film', 'alltakeout' ); ?></strong><span><?php esc_html_e( 'Splits cleanly when opened so customers know their order is untouched.', 'alltakeout' ); ?></span></div></li>
				</ul>
			</div>
			<div class="split-media">
				<div class="editor-mock" aria-hidden="true">
					<div class="editor-mock-bar"><i></i><i></i><i></i></div>
					<div class="editor-mock-body">
						<div class="editor-mock-tools"><i></i><i></i><i></i><i></i><i></i></div>
						<div class="editor-mock-canvas">
							<div class="editor-mock-label"><?php esc_html_e( 'Sealed Fresh', 'alltakeout' ); ?></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<?php
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

	<section class="section text-center">
		<div class="container container--narrow">
			<h2><?php esc_html_e( 'See it for yourself', 'alltakeout' ); ?></h2>
			<p class="lede"><?php esc_html_e( 'Open any product and take the editor for a spin — no account needed.', 'alltakeout' ); ?></p>
			<a class="btn btn--primary btn--lg" href="<?php echo esc_url( $ato_shop_url ); ?>"><?php esc_html_e( 'Start a design', 'alltakeout' ); ?><?php ato_the_icon( 'arrow', 18 ); ?></a>
		</div>
	</section>

</main>
<?php
get_footer();
