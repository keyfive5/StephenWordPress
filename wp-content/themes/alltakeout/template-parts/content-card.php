<?php
/**
 * Blog post card.
 *
 * @package alltakeout
 */
?>
<article <?php post_class( 'post-card reveal' ); ?>>
	<?php if ( has_post_thumbnail() ) : ?>
		<a class="post-card-thumb" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
			<?php the_post_thumbnail( 'medium_large', array( 'loading' => 'lazy' ) ); ?>
		</a>
	<?php endif; ?>
	<div class="post-card-body">
		<div class="post-meta">
			<span><?php echo esc_html( get_the_date() ); ?></span>
			<?php
			$ato_cats = get_the_category();
			if ( ! empty( $ato_cats ) ) {
				echo '<span>' . esc_html( $ato_cats[0]->name ) . '</span>';
			}
			?>
		</div>
		<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
		<p><?php echo esc_html( get_the_excerpt() ); ?></p>
	</div>
</article>
