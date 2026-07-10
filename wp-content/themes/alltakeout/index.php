<?php
/**
 * Blog index / generic fallback.
 *
 * @package alltakeout
 */

get_header();
?>
<div class="page-hero">
	<div class="container">
		<span class="eyebrow"><?php esc_html_e( 'From the blog', 'alltakeout' ); ?></span>
		<h1><?php is_home() ? esc_html_e( 'Label ideas & takeout marketing tips', 'alltakeout' ) : wp_title( '' ); ?></h1>
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
