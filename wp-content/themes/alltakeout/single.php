<?php
/**
 * Single post.
 *
 * @package alltakeout
 */

get_header();

while ( have_posts() ) :
	the_post();
	?>
	<div class="page-hero">
		<div class="container container--narrow">
			<div class="post-meta" style="margin-bottom: var(--sp-3);">
				<span><?php echo esc_html( get_the_date() ); ?></span>
				<span><?php the_author(); ?></span>
			</div>
			<h1><?php the_title(); ?></h1>
		</div>
	</div>
	<main id="primary" class="site-main">
		<div class="container container--narrow">
			<?php if ( has_post_thumbnail() ) : ?>
				<div style="margin-bottom: var(--sp-6);">
					<?php the_post_thumbnail( 'large', array( 'style' => 'border-radius: var(--radius-lg);' ) ); ?>
				</div>
			<?php endif; ?>
			<div class="entry-content">
				<?php the_content(); ?>
			</div>
			<?php
			if ( comments_open() || get_comments_number() ) {
				comments_template();
			}
			?>
		</div>
	</main>
	<?php
endwhile;

get_footer();
