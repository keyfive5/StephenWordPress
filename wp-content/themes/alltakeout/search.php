<?php
/**
 * Search results.
 *
 * @package alltakeout
 */

get_header();
?>
<div class="page-hero">
	<div class="container">
		<span class="eyebrow"><?php esc_html_e( 'Search', 'alltakeout' ); ?></span>
		<h1>
			<?php
			/* translators: %s: search query. */
			printf( esc_html__( 'Results for “%s”', 'alltakeout' ), esc_html( get_search_query() ) );
			?>
		</h1>
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
