<?php
/**
 * Archives (category, tag, date, author).
 *
 * @package alltakeout
 */

get_header();
?>
<div class="page-hero">
	<div class="container">
		<span class="eyebrow"><?php esc_html_e( 'Archive', 'alltakeout' ); ?></span>
		<h1><?php the_archive_title(); ?></h1>
		<?php the_archive_description( '<p class="lede">', '</p>' ); ?>
	</div>
</div>

<main id="primary" class="site-main">
	<div class="container">
		<?php if ( have_posts() ) : ?>
			<div class="post-grid">
				<?php
				while ( have_posts() ) :
					the_post();
					get_template_part( 'template-parts/content', 'card' );
				endwhile;
				?>
			</div>
			<nav class="pagination" aria-label="<?php esc_attr_e( 'Posts pagination', 'alltakeout' ); ?>">
				<?php echo wp_kses_post( paginate_links( array( 'type' => 'plain' ) ) ); ?>
			</nav>
		<?php else : ?>
			<?php get_template_part( 'template-parts/content', 'none' ); ?>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
