<?php
/**
 * Default page template.
 *
 * @package alltakeout
 */

get_header();

while ( have_posts() ) :
	the_post();
	?>
	<div class="page-hero">
		<div class="container">
			<h1><?php the_title(); ?></h1>
		</div>
	</div>
	<main id="primary" class="site-main">
		<div class="container">
			<div class="entry-content">
				<?php the_content(); ?>
			</div>
		</div>
	</main>
	<?php
endwhile;

get_footer();
