<?php
/**
 * Admin review panel: browse customer designs, open them in the same editor
 * the customer used, adjust, and keep a visible edit history.
 *
 * @package ato-customizer
 */

defined( 'ABSPATH' ) || exit;

class ATO_Admin {

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		add_action( 'woocommerce_after_order_itemmeta', array( __CLASS__, 'order_item_design_link' ), 10, 2 );
	}

	public static function menu() {
		add_menu_page(
			__( 'Customer Designs', 'ato-customizer' ),
			__( 'ATO Designs', 'ato-customizer' ),
			'edit_others_posts',
			'ato-designs',
			array( __CLASS__, 'render_page' ),
			'dashicons-art',
			56
		);
		add_submenu_page(
			'ato-designs',
			__( 'One Question results', 'ato-customizer' ),
			__( 'One Question', 'ato-customizer' ),
			'edit_others_posts',
			'ato-one-question',
			array( __CLASS__, 'render_poll_page' )
		);
	}

	/**
	 * Results for the current One Question and every archived one.
	 * When a new question replaces the old, the old key stays stored —
	 * so past results remain readable here, per the client spec.
	 */
	public static function render_poll_page() {
		global $wpdb;
		$rows = $wpdb->get_results( "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE 'ato_poll_meta_%'" );
		echo '<div class="wrap"><h1>' . esc_html__( 'One Question — results', 'ato-customizer' ) . '</h1>';
		if ( empty( $rows ) ) {
			echo '<p>' . esc_html__( 'No poll has collected responses yet. Add the [ato_poll] shortcode to a page to start.', 'ato-customizer' ) . '</p></div>';
			return;
		}
		foreach ( $rows as $row ) {
			$key   = str_replace( 'ato_poll_meta_', '', $row->option_name );
			$meta  = maybe_unserialize( $row->option_value );
			$votes = get_option( 'ato_poll_votes_' . $key, array() );
			$counts = array();
			foreach ( array_values( (array) $meta['options'] ) as $i => $label ) {
				$counts[ $i ] = isset( $votes[ $i ] ) ? (int) $votes[ $i ] : 0;
			}
			$total = array_sum( $counts );
			$pcts  = ATO_Poll::lr_percentages( $counts );
			echo '<h2>' . esc_html( $meta['question'] ) . '</h2>';
			echo '<table class="widefat striped" style="max-width:640px;"><thead><tr><th>' . esc_html__( 'Answer', 'ato-customizer' ) . '</th><th>' . esc_html__( 'Responses', 'ato-customizer' ) . '</th><th>' . esc_html__( 'Share', 'ato-customizer' ) . '</th></tr></thead><tbody>';
			foreach ( (array) $meta['options'] as $i => $label ) {
				echo '<tr><td>' . esc_html( $label ) . '</td><td>' . esc_html( $counts[ $i ] ) . '</td><td><strong>' . esc_html( $pcts[ $i ] ) . '%</strong></td></tr>';
			}
			echo '</tbody></table>';
			/* translators: %s: number of responses. */
			echo '<p><strong>' . sprintf( esc_html__( 'Based on %s responses.', 'ato-customizer' ), esc_html( number_format_i18n( $total ) ) ) . '</strong> <span class="description">' . esc_html__( 'since', 'ato-customizer' ) . ' ' . esc_html( isset( $meta['since'] ) ? $meta['since'] : '' ) . '</span></p>';
		}
		echo '</div>';
	}

	public static function enqueue( $hook ) {
		if ( 'toplevel_page_ato-designs' !== $hook ) {
			return;
		}
		ATO_Frontend::enqueue_editor_assets();
		wp_enqueue_script( 'ag-psd', ATO_CUSTOMIZER_URL . 'assets/vendor/ag-psd.js', array(), '25.0', true );
		wp_enqueue_script( 'ato-psd-export', ATO_CUSTOMIZER_URL . 'assets/js/psd-export.js', array( 'fabric-js', 'ag-psd' ), ATO_CUSTOMIZER_VERSION, true );

		$design_id = isset( $_GET['design'] ) ? absint( $_GET['design'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		wp_localize_script( 'ato-editor', 'atoEditorData', array(
			'ajaxUrl'    => admin_url( 'admin-ajax.php' ),
			'nonce'      => wp_create_nonce( 'ato-editor' ),
			'mode'       => 'admin',
			'designId'   => $design_id,
			'clipartUrl' => ATO_CUSTOMIZER_URL . 'assets/clipart/',
			'clipart'    => ATO_Frontend::clipart_list(),
			'fonts'      => ATO_Frontend::editor_fonts(),
			'i18n'       => ATO_Frontend::i18n(),
		) );
	}

	/**
	 * Router: list view or single design (editor + history).
	 */
	public static function render_page() {
		$design_id = isset( $_GET['design'] ) ? absint( $_GET['design'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( $design_id ) {
			self::render_editor_screen( $design_id );
		} else {
			self::render_list_screen();
		}
	}

	protected static function render_list_screen() {
		$paged   = isset( $_GET['paged'] ) ? max( 1, absint( $_GET['paged'] ) ) : 1; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$query   = new WP_Query( array(
			'post_type'      => ATO_Designs::CPT,
			'post_status'    => 'private',
			'posts_per_page' => 20,
			'paged'          => $paged,
			'orderby'        => 'date',
			'order'          => 'DESC',
		) );
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Customer Designs', 'ato-customizer' ); ?></h1>
			<p><?php esc_html_e( 'Every design saved in the label editor, newest first. Open a design to review or adjust it before production — all edits are logged.', 'ato-customizer' ); ?></p>

			<table class="widefat striped">
				<thead>
					<tr>
						<th style="width:90px;"><?php esc_html_e( 'Preview', 'ato-customizer' ); ?></th>
						<th><?php esc_html_e( 'Reference', 'ato-customizer' ); ?></th>
						<th><?php esc_html_e( 'Product', 'ato-customizer' ); ?></th>
						<th><?php esc_html_e( 'Configuration', 'ato-customizer' ); ?></th>
						<th><?php esc_html_e( 'Created', 'ato-customizer' ); ?></th>
						<th><?php esc_html_e( 'Actions', 'ato-customizer' ); ?></th>
					</tr>
				</thead>
				<tbody>
				<?php if ( $query->have_posts() ) : ?>
					<?php
					while ( $query->have_posts() ) :
						$query->the_post();
						$id      = get_the_ID();
						$summary = ATO_Designs::get_design_summary( $id );
						$config  = is_array( $summary['config'] ) ? $summary['config'] : array();
						$product = get_post_meta( $id, '_ato_product_id', true );
						?>
						<tr>
							<td>
								<?php if ( $summary['preview'] ) : ?>
									<img src="<?php echo esc_url( $summary['preview'] ); ?>" alt="" style="width:70px;height:70px;object-fit:contain;border:1px dashed #ccc;border-radius:6px;background:#fff;">
								<?php else : ?>
									&mdash;
								<?php endif; ?>
							</td>
							<td><strong><?php echo esc_html( $summary['ref'] ); ?></strong></td>
							<td><?php echo $product ? esc_html( get_the_title( $product ) ) : '&mdash;'; ?></td>
							<td>
								<?php
								echo esc_html( implode( ' / ', array_filter( array(
									isset( $config['template'] ) ? $config['template'] : '',
									isset( $config['material'] ) ? $config['material'] : '',
									isset( $config['size'] ) ? $config['size'] : '',
									isset( $config['shape'] ) ? $config['shape'] : '',
									isset( $config['quantity'] ) ? $config['quantity'] . ' pcs' : '',
								) ) ) );
								?>
							</td>
							<td><?php echo esc_html( get_the_date( '', $id ) . ' ' . get_the_time( '', $id ) ); ?></td>
							<td>
								<a class="button button-primary" href="<?php echo esc_url( admin_url( 'admin.php?page=ato-designs&design=' . $id ) ); ?>">
									<?php esc_html_e( 'Review / edit', 'ato-customizer' ); ?>
								</a>
							</td>
						</tr>
					<?php endwhile; wp_reset_postdata(); ?>
				<?php else : ?>
					<tr><td colspan="6"><?php esc_html_e( 'No designs yet. As soon as a customer saves a design in the editor it will appear here.', 'ato-customizer' ); ?></td></tr>
				<?php endif; ?>
				</tbody>
			</table>

			<?php
			$total_pages = (int) $query->max_num_pages;
			if ( $total_pages > 1 ) {
				echo '<p>';
				echo wp_kses_post( paginate_links( array(
					'base'    => add_query_arg( 'paged', '%#%' ),
					'total'   => $total_pages,
					'current' => $paged,
				) ) );
				echo '</p>';
			}
			?>
		</div>
		<?php
	}

	protected static function render_editor_screen( $design_id ) {
		$summary = ATO_Designs::get_design_summary( $design_id );
		if ( ! $summary ) {
			echo '<div class="wrap"><h1>' . esc_html__( 'Design not found', 'ato-customizer' ) . '</h1></div>';
			return;
		}
		$log = is_array( $summary['log'] ) ? array_reverse( $summary['log'] ) : array();
		?>
		<div class="wrap">
			<h1>
				<?php
				printf(
					/* translators: %s: design reference. */
					esc_html__( 'Design %s', 'ato-customizer' ),
					esc_html( $summary['ref'] )
				);
				?>
				<a class="page-title-action" href="<?php echo esc_url( admin_url( 'admin.php?page=ato-designs' ) ); ?>"><?php esc_html_e( 'Back to all designs', 'ato-customizer' ); ?></a>
			</h1>

			<p>
				<button type="button" class="button button-primary button-hero" id="ato-open-editor">
					<?php esc_html_e( 'Open in editor', 'ato-customizer' ); ?>
				</button>
				<button type="button" class="button button-hero" id="ato-psd-btn">
					<?php esc_html_e( 'Layered PSD', 'ato-customizer' ); ?>
				</button>
				<button type="button" class="button button-hero" id="ato-svg-btn">
					<?php esc_html_e( 'Layered SVG (Illustrator)', 'ato-customizer' ); ?>
				</button>
				<span class="description" style="margin-left:8px;"><?php esc_html_e( 'Adjust alignment, fix typos, refine colours — then save. The customer’s original stays in the history below. The PSD keeps one layer per element for pre-print review.', 'ato-customizer' ); ?></span>
			</p>
			<script>
			document.addEventListener('DOMContentLoaded', function () {
				var btn = document.getElementById('ato-psd-btn');
				if (!btn) return;
				var cfg = <?php echo wp_json_encode( is_array( $summary['config'] ) ? $summary['config'] : array() ); ?>;
				var designJson = <?php echo wp_json_encode( $summary['json'] ); ?>;
				var args = {
					json: designJson,
					width: parseInt(cfg.canvas_w, 10) || 500,
					height: parseInt(cfg.canvas_h, 10) || 500,
					name: <?php echo wp_json_encode( $summary['ref'] ); ?>
				};
				btn.addEventListener('click', function () {
					btn.disabled = true;
					window.atoExportPsd(args).then(function () { btn.disabled = false; });
				});
				var svgBtn = document.getElementById('ato-svg-btn');
				svgBtn.addEventListener('click', function () {
					svgBtn.disabled = true;
					window.atoExportSvg(args).then(function () { svgBtn.disabled = false; });
				});
			});
			</script>

			<?php if ( $summary['preview'] ) : ?>
				<p><img src="<?php echo esc_url( $summary['preview'] ); ?>" alt="<?php esc_attr_e( 'Design preview', 'ato-customizer' ); ?>" style="max-width:320px;border:1px dashed #ccc;border-radius:8px;background:#fff;padding:8px;"></p>
			<?php endif; ?>

			<h2><?php esc_html_e( 'Edit history', 'ato-customizer' ); ?></h2>
			<table class="widefat striped" style="max-width:720px;">
				<thead>
					<tr>
						<th><?php esc_html_e( 'When', 'ato-customizer' ); ?></th>
						<th><?php esc_html_e( 'Who', 'ato-customizer' ); ?></th>
						<th><?php esc_html_e( 'What', 'ato-customizer' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php if ( $log ) : ?>
						<?php foreach ( $log as $entry ) : ?>
							<tr>
								<td><?php echo esc_html( $entry['time'] ); ?></td>
								<td><?php echo esc_html( $entry['user'] ); ?></td>
								<td><?php echo esc_html( $entry['note'] ); ?></td>
							</tr>
						<?php endforeach; ?>
					<?php else : ?>
						<tr><td colspan="3"><?php esc_html_e( 'No edits recorded yet.', 'ato-customizer' ); ?></td></tr>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
		include ATO_CUSTOMIZER_PATH . 'templates/editor.php';
	}

	/**
	 * "Open design" link on order line items in the order edit screen.
	 */
	public static function order_item_design_link( $item_id, $item ) {
		if ( ! is_object( $item ) || ! method_exists( $item, 'get_meta' ) ) {
			return;
		}
		$design_id = (int) $item->get_meta( '_ato_design_id' );
		if ( ! $design_id ) {
			return;
		}
		printf(
			'<p><a class="button" href="%s">%s</a></p>',
			esc_url( admin_url( 'admin.php?page=ato-designs&design=' . $design_id ) ),
			esc_html__( 'Review customer design', 'ato-customizer' )
		);
	}
}
