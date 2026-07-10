<?php
/**
 * Template Name: FAQs
 *
 * FAQ items are managed two ways:
 * 1. Page content: each H2/H3 heading becomes a question, following content the answer
 *    (client edits in the normal editor — nothing technical).
 * 2. If the page content is empty, a sensible starter set is shown.
 *
 * @package alltakeout
 */

get_header();
?>
<div class="page-hero">
	<div class="container">
		<span class="eyebrow"><?php esc_html_e( 'Help centre', 'alltakeout' ); ?></span>
		<h1><?php the_title(); ?></h1>
		<p class="lede"><?php esc_html_e( 'Quick answers about ordering, materials, shipping and the label editor.', 'alltakeout' ); ?></p>
	</div>
</div>

<main id="primary" class="site-main">
	<div class="container">
		<?php
		$ato_has_content = false;
		while ( have_posts() ) :
			the_post();
			$ato_raw = trim( get_the_content() );
			if ( $ato_raw ) {
				$ato_has_content = true;
				// Split editor content on headings: heading = question, following markup = answer.
				$ato_blocks = preg_split( '/<h[23][^>]*>(.*?)<\/h[23]>/is', apply_filters( 'the_content', $ato_raw ), -1, PREG_SPLIT_DELIM_CAPTURE );
				echo '<div class="faq-list">';
				$ato_total = count( $ato_blocks );
				for ( $i = 1; $i < $ato_total; $i += 2 ) {
					$ato_q = wp_strip_all_tags( $ato_blocks[ $i ] );
					$ato_a = isset( $ato_blocks[ $i + 1 ] ) ? $ato_blocks[ $i + 1 ] : '';
					printf(
						'<details class="faq-item"><summary>%s</summary><div class="faq-a">%s</div></details>',
						esc_html( $ato_q ),
						wp_kses_post( $ato_a )
					);
				}
				echo '</div>';
			}
		endwhile;

		if ( ! $ato_has_content ) :
			$ato_faqs = array(
				array( __( 'How long does printing and delivery take?', 'alltakeout' ), __( 'Most orders are printed within 2–3 business days after design approval, then shipped via ground. VIP members always ship free.', 'alltakeout' ) ),
				array( __( 'Do I need design experience to use the editor?', 'alltakeout' ), __( 'Not at all. Pick a template, drop in your logo and text, and our print team gives every design a professional once-over before it prints.', 'alltakeout' ) ),
				array( __( 'What materials can I choose from?', 'alltakeout' ), __( 'Each product lists its available materials — from glossy paper to waterproof vinyl and freezer-safe stock for food identification labels.', 'alltakeout' ) ),
				array( __( 'Can you check my design before printing?', 'alltakeout' ), __( 'Yes — every single order is reviewed by a human. We fix alignment issues and flag anything that looks off before it goes to press.', 'alltakeout' ) ),
				array( __( 'How do the 50 free VIP stickers work?', 'alltakeout' ), __( 'Create an account (even during checkout) and 50 complimentary stickers are credited to you automatically, redeemed with your next order.', 'alltakeout' ) ),
				array( __( 'What if my labels arrive damaged?', 'alltakeout' ), __( 'Contact us with a photo and your order number — we reprint and reship at no cost. VIP tickets are prioritized.', 'alltakeout' ) ),
			);
			echo '<div class="faq-list">';
			foreach ( $ato_faqs as $ato_faq ) {
				printf(
					'<details class="faq-item"><summary>%s</summary><div class="faq-a"><p>%s</p></div></details>',
					esc_html( $ato_faq[0] ),
					esc_html( $ato_faq[1] )
				);
			}
			echo '</div>';
		endif;
		?>

		<p class="text-center" style="margin-top: var(--sp-7);">
			<span class="lede"><?php esc_html_e( 'Still stuck?', 'alltakeout' ); ?></span><br><br>
			<a class="btn btn--ghost" href="<?php echo esc_url( home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'Contact our team', 'alltakeout' ); ?></a>
		</p>
	</div>
</main>
<?php
get_footer();
