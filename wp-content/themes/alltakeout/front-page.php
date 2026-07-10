<?php
/**
 * Front page: hero, categories, how-it-works, customizer feature, VIP band, testimonials, blog teaser.
 *
 * @package alltakeout
 */

get_header();

$ato_shop_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' );
?>

<main id="primary" class="site-main">

	<!-- HERO -->
	<section class="hero">
		<div class="container hero-grid">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'Custom labels for restaurants & cafés', 'alltakeout' ); ?></span>
				<h1><?php echo wp_kses_post( __( 'Turn every takeout order into a <span class="mark"><span>marketing win</span></span>', 'alltakeout' ) ); ?></h1>
				<p class="lede"><?php esc_html_e( 'Design branded stickers and labels in minutes with our online editor. Our print team reviews every order before it hits the press — so your bags, boxes and cups always look sharp.', 'alltakeout' ); ?></p>
				<div class="hero-ctas">
					<a class="btn btn--primary btn--lg" href="<?php echo esc_url( $ato_shop_url ); ?>">
						<?php esc_html_e( 'Start designing', 'alltakeout' ); ?>
						<?php ato_the_icon( 'arrow', 18 ); ?>
					</a>
					<a class="btn btn--ghost btn--lg" href="<?php echo esc_url( home_url( '/making-labels/' ) ); ?>"><?php esc_html_e( 'How it works', 'alltakeout' ); ?></a>
				</div>
				<div class="hero-proof">
					<div class="proof-item"><?php ato_the_icon( 'eye', 22 ); ?><span><?php esc_html_e( 'Every design reviewed by a human', 'alltakeout' ); ?></span></div>
					<div class="proof-item"><?php ato_the_icon( 'truck', 22 ); ?><span><?php esc_html_e( 'Free ground shipping for VIPs', 'alltakeout' ); ?></span></div>
					<div class="proof-item"><?php ato_the_icon( 'gift', 22 ); ?><span><?php esc_html_e( '50 free stickers when you join', 'alltakeout' ); ?></span></div>
				</div>
			</div>

			<div class="hero-visual" aria-hidden="true">
				<div class="sticker sticker--round sticker-1">
					<div>
						<?php ato_the_icon( 'utensils', 34 ); ?>
						<div class="s-title"><?php esc_html_e( 'Thank You!', 'alltakeout' ); ?></div>
						<div class="s-sub"><?php esc_html_e( 'Enjoy your meal', 'alltakeout' ); ?></div>
					</div>
				</div>
				<div class="sticker sticker--die sticker-2">
					<?php ato_the_icon( 'qr', 34 ); ?>
					<div class="s-title"><?php esc_html_e( 'Scan for menu', 'alltakeout' ); ?></div>
					<div class="s-sub"><?php esc_html_e( 'QR label', 'alltakeout' ); ?></div>
				</div>
				<div class="sticker sticker--round sticker-3">
					<div>
						<?php ato_the_icon( 'star', 30 ); ?>
						<div class="s-title"><?php esc_html_e( '20% Off', 'alltakeout' ); ?></div>
						<div class="s-sub"><?php esc_html_e( 'Next order', 'alltakeout' ); ?></div>
					</div>
				</div>
				<div class="sticker sticker-4">
					<?php ato_the_icon( 'shield', 30 ); ?>
					<div class="s-title"><?php esc_html_e( 'Sealed Fresh', 'alltakeout' ); ?></div>
					<div class="s-sub"><?php esc_html_e( 'Tamper-evident', 'alltakeout' ); ?></div>
				</div>
				<div class="sticker sticker--die sticker-5">
					<?php ato_the_icon( 'megaphone', 30 ); ?>
					<div class="s-title">@yourrestaurant</div>
					<div class="s-sub"><?php esc_html_e( 'Follow us', 'alltakeout' ); ?></div>
				</div>
			</div>
		</div>
	</section>

	<!-- CATEGORIES -->
	<section class="section section--kraft" id="shop-categories">
		<div class="container">
			<div class="section-head">
				<span class="eyebrow"><?php esc_html_e( 'The shop', 'alltakeout' ); ?></span>
				<h2><?php esc_html_e( 'Seven ways to label everything you send out', 'alltakeout' ); ?></h2>
				<p class="lede"><?php esc_html_e( 'Pick a category, choose your material, size and shape — then make it yours in the editor.', 'alltakeout' ); ?></p>
			</div>
			<div class="cat-grid">
				<?php foreach ( ato_get_categories() as $ato_cat ) : ?>
					<a class="cat-card reveal" href="<?php echo esc_url( $ato_cat['url'] ); ?>">
						<span class="cat-icon"><?php ato_the_icon( $ato_cat['icon'], 28 ); ?></span>
						<h3><?php echo esc_html( $ato_cat['name'] ); ?></h3>
						<p><?php echo esc_html( $ato_cat['desc'] ); ?></p>
						<span class="cat-meta">
							<span><?php esc_html_e( 'Browse & customize', 'alltakeout' ); ?></span>
							<span class="cat-arrow"><?php ato_the_icon( 'arrow', 20 ); ?></span>
						</span>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<!-- HOW IT WORKS -->
	<section class="section">
		<div class="container">
			<div class="section-head section-head--center">
				<span class="eyebrow"><?php esc_html_e( 'How it works', 'alltakeout' ); ?></span>
				<h2><?php esc_html_e( 'From idea to your door in four steps', 'alltakeout' ); ?></h2>
			</div>
			<div class="steps">
				<div class="step reveal">
					<h3><?php esc_html_e( 'Pick your product', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'Choose a label type, then select template, material, size, shape and quantity.', 'alltakeout' ); ?></p>
				</div>
				<div class="step reveal">
					<h3><?php esc_html_e( 'Design it live', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'Add your logo, text, colours and QR codes in our drag-and-drop editor — no design skills needed.', 'alltakeout' ); ?></p>
				</div>
				<div class="step reveal">
					<h3><?php esc_html_e( 'We double-check it', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'A real print specialist reviews alignment, spelling and colours before anything is printed.', 'alltakeout' ); ?></p>
				</div>
				<div class="step reveal">
					<h3><?php esc_html_e( 'Printed & shipped', 'alltakeout' ); ?></h3>
					<p><?php esc_html_e( 'Your stickers arrive ready to peel. VIP members ship free, every time.', 'alltakeout' ); ?></p>
				</div>
			</div>
		</div>
	</section>

	<!-- CUSTOMIZER FEATURE -->
	<section class="section section--kraft">
		<div class="container split">
			<div class="split-media">
				<div class="editor-mock" aria-hidden="true">
					<div class="editor-mock-bar"><i></i><i></i><i></i></div>
					<div class="editor-mock-body">
						<div class="editor-mock-tools"><i></i><i></i><i></i><i></i><i></i></div>
						<div class="editor-mock-canvas">
							<div class="editor-mock-label"><?php esc_html_e( "Maria's Kitchen", 'alltakeout' ); ?></div>
						</div>
					</div>
				</div>
			</div>
			<div>
				<span class="eyebrow"><?php esc_html_e( 'The label editor', 'alltakeout' ); ?></span>
				<h2><?php esc_html_e( 'A design studio in your browser', 'alltakeout' ); ?></h2>
				<p class="lede"><?php esc_html_e( 'Everything you need to make labels that look professionally designed — because they are.', 'alltakeout' ); ?></p>
				<ul class="feature-list">
					<li>
						<?php ato_the_icon( 'type', 22 ); ?>
						<div><strong><?php esc_html_e( 'Text & fonts', 'alltakeout' ); ?></strong><span><?php esc_html_e( 'Move, resize and rotate text with a curated font library.', 'alltakeout' ); ?></span></div>
					</li>
					<li>
						<?php ato_the_icon( 'upload', 22 ); ?>
						<div><strong><?php esc_html_e( 'Your logo & images', 'alltakeout' ); ?></strong><span><?php esc_html_e( 'Upload artwork and position it exactly where you want it.', 'alltakeout' ); ?></span></div>
					</li>
					<li>
						<?php ato_the_icon( 'qr', 22 ); ?>
						<div><strong><?php esc_html_e( 'QR codes, generated for you', 'alltakeout' ); ?></strong><span><?php esc_html_e( 'Paste a link — we build the QR code and drop it on your label.', 'alltakeout' ); ?></span></div>
					</li>
					<li>
						<?php ato_the_icon( 'layers', 22 ); ?>
						<div><strong><?php esc_html_e( 'Layers & clipart', 'alltakeout' ); ?></strong><span><?php esc_html_e( 'Stack, reorder and fine-tune every element in real time.', 'alltakeout' ); ?></span></div>
					</li>
				</ul>
				<a class="btn btn--primary" href="<?php echo esc_url( $ato_shop_url ); ?>"><?php esc_html_e( 'Try the editor', 'alltakeout' ); ?><?php ato_the_icon( 'arrow', 18 ); ?></a>
			</div>
		</div>
	</section>

	<!-- VIP BAND -->
	<section class="section section--ink vip-band">
		<div class="container vip-inner">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'VIP membership — free to join', 'alltakeout' ); ?></span>
				<h2><?php esc_html_e( 'Create an account, get 50 stickers on the house', 'alltakeout' ); ?></h2>
				<p class="lede"><?php esc_html_e( 'Join at checkout in one step. No card, no commitment — just perks.', 'alltakeout' ); ?></p>
				<ul class="vip-perks">
					<li><?php ato_the_icon( 'gift', 20 ); ?><span><?php esc_html_e( '50 complimentary stickers with your first order', 'alltakeout' ); ?></span></li>
					<li><?php ato_the_icon( 'truck', 20 ); ?><span><?php esc_html_e( 'Free ground shipping on every order', 'alltakeout' ); ?></span></li>
					<li><?php ato_the_icon( 'star', 20 ); ?><span><?php esc_html_e( 'Priority support and exclusive discounts', 'alltakeout' ); ?></span></li>
				</ul>
				<a class="btn btn--accent btn--lg" href="<?php echo esc_url( home_url( '/vip-members/' ) ); ?>"><?php esc_html_e( 'Become a VIP', 'alltakeout' ); ?></a>
			</div>
			<div class="vip-chip" aria-hidden="true">
				<div class="num">50</div>
				<div class="lbl"><?php esc_html_e( 'Free stickers', 'alltakeout' ); ?></div>
			</div>
		</div>
	</section>

	<!-- TESTIMONIALS -->
	<section class="section">
		<div class="container">
			<div class="section-head section-head--center">
				<span class="eyebrow"><?php esc_html_e( 'Loved by kitchens', 'alltakeout' ); ?></span>
				<h2><?php esc_html_e( 'Restaurants that stick with us', 'alltakeout' ); ?></h2>
			</div>
			<div class="quote-grid">
				<?php
				$ato_quotes = array(
					array( 'q' => __( 'Our bags finally look like our brand. The editor took ten minutes and the print team caught a typo before it went out. Class act.', 'alltakeout' ), 'n' => __( 'Maria G.', 'alltakeout' ), 'r' => __( 'Owner, Casa Maria', 'alltakeout' ) ),
					array( 'q' => __( 'The QR labels doubled our Google reviews in a month. Customers scan them right at the table.', 'alltakeout' ), 'n' => __( 'Devon T.', 'alltakeout' ), 'r' => __( 'Manager, Smoke & Bao', 'alltakeout' ) ),
					array( 'q' => __( 'Tamper seals were a must for delivery apps. These look premium and our drivers stopped getting complaints.', 'alltakeout' ), 'n' => __( 'Priya S.', 'alltakeout' ), 'r' => __( 'Owner, Spice Route', 'alltakeout' ) ),
				);
				foreach ( $ato_quotes as $ato_quote ) :
					?>
					<div class="quote-card reveal">
						<div class="quote-stars" aria-label="<?php esc_attr_e( '5 out of 5 stars', 'alltakeout' ); ?>">
							<?php for ( $i = 0; $i < 5; $i++ ) { ato_the_icon( 'star', 18 ); } ?>
						</div>
						<blockquote><?php echo esc_html( $ato_quote['q'] ); ?></blockquote>
						<div class="quote-who">
							<span class="quote-avatar"><?php echo esc_html( mb_substr( $ato_quote['n'], 0, 1 ) ); ?></span>
							<div><strong><?php echo esc_html( $ato_quote['n'] ); ?></strong><span><?php echo esc_html( $ato_quote['r'] ); ?></span></div>
						</div>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<!-- BLOG TEASER -->
	<?php
	$ato_posts = new WP_Query( array(
		'posts_per_page'      => 3,
		'ignore_sticky_posts' => true,
	) );
	if ( $ato_posts->have_posts() ) :
		?>
		<section class="section section--tight">
			<div class="container">
				<div class="section-head">
					<span class="eyebrow"><?php esc_html_e( 'From the blog', 'alltakeout' ); ?></span>
					<h2><?php esc_html_e( 'Label ideas & takeout marketing tips', 'alltakeout' ); ?></h2>
				</div>
				<div class="post-grid">
					<?php
					while ( $ato_posts->have_posts() ) :
						$ato_posts->the_post();
						get_template_part( 'template-parts/content', 'card' );
					endwhile;
					wp_reset_postdata();
					?>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<!-- FINAL CTA -->
	<section class="section text-center">
		<div class="container container--narrow">
			<h2><?php echo wp_kses_post( __( 'Ready to make your takeout <span class="mark"><span>unforgettable?</span></span>', 'alltakeout' ) ); ?></h2>
			<p class="lede"><?php esc_html_e( 'Start with any product — your first design takes about five minutes.', 'alltakeout' ); ?></p>
			<a class="btn btn--primary btn--lg" href="<?php echo esc_url( $ato_shop_url ); ?>"><?php esc_html_e( 'Design your labels now', 'alltakeout' ); ?><?php ato_the_icon( 'arrow', 18 ); ?></a>
		</div>
	</section>

</main>

<?php
get_footer();
