<?php
/**
 * "One Question" poll — a single-question survey with a live,
 * animated percentage counter (client requirement).
 *
 * Usage: create a page and add the shortcode:
 *   [ato_poll question="Would you like custom labels for your restaurant?" options="Yes, absolutely|Maybe later|Not for me"]
 *
 * Votes are stored per-question in an option; one vote per visitor
 * (cookie). Results render as animated percentage bars.
 *
 * @package ato-customizer
 */

defined( 'ABSPATH' ) || exit;

class ATO_Poll {

	public static function init() {
		add_shortcode( 'ato_poll', array( __CLASS__, 'render' ) );
		add_action( 'wp_ajax_ato_poll_vote', array( __CLASS__, 'ajax_vote' ) );
		add_action( 'wp_ajax_nopriv_ato_poll_vote', array( __CLASS__, 'ajax_vote' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register_assets' ) );
	}

	public static function register_assets() {
		wp_register_style( 'ato-poll', ATO_CUSTOMIZER_URL . 'assets/css/poll.css', array(), ATO_CUSTOMIZER_VERSION );
		wp_register_script( 'ato-poll', ATO_CUSTOMIZER_URL . 'assets/js/poll.js', array(), ATO_CUSTOMIZER_VERSION, true );
	}

	/**
	 * Stable key for a poll based on its question text.
	 */
	protected static function poll_key( $question ) {
		return substr( md5( wp_strip_all_tags( $question ) ), 0, 12 );
	}

	/**
	 * Current vote counts for a poll.
	 *
	 * @return int[] option index => votes
	 */
	protected static function get_votes( $key, $option_count ) {
		$votes = get_option( 'ato_poll_votes_' . $key, array() );
		$out   = array();
		for ( $i = 0; $i < $option_count; $i++ ) {
			$out[ $i ] = isset( $votes[ $i ] ) ? (int) $votes[ $i ] : 0;
		}
		return $out;
	}

	public static function render( $atts ) {
		$atts = shortcode_atts( array(
			'question' => __( 'Did you find what you were looking for today?', 'ato-customizer' ),
			'options'  => __( 'Yes|Not yet', 'ato-customizer' ),
		), $atts, 'ato_poll' );

		$options = array_values( array_filter( array_map( 'trim', explode( '|', $atts['options'] ) ) ) );
		if ( count( $options ) < 2 ) {
			return '';
		}

		$key   = self::poll_key( $atts['question'] );
		$votes = self::get_votes( $key, count( $options ) );
		$total = array_sum( $votes );
		$voted = isset( $_COOKIE[ 'ato_poll_' . $key ] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- display state only.

		wp_enqueue_style( 'ato-poll' );
		wp_enqueue_script( 'ato-poll' );
		wp_localize_script( 'ato-poll', 'atoPollData', array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'ato-poll' ),
		) );

		ob_start();
		?>
		<div class="ato-poll" data-poll="<?php echo esc_attr( $key ); ?>" data-voted="<?php echo $voted ? '1' : '0'; ?>">
			<h3 class="ato-poll-question"><?php echo esc_html( $atts['question'] ); ?></h3>

			<div class="ato-poll-options" <?php echo $voted ? 'hidden' : ''; ?>>
				<?php foreach ( $options as $i => $label ) : ?>
					<button type="button" class="ato-poll-option" data-choice="<?php echo esc_attr( $i ); ?>">
						<?php echo esc_html( $label ); ?>
					</button>
				<?php endforeach; ?>
			</div>

			<div class="ato-poll-results" <?php echo $voted ? '' : 'hidden'; ?> aria-live="polite">
				<?php foreach ( $options as $i => $label ) : ?>
					<?php $pct = $total > 0 ? round( $votes[ $i ] * 100 / $total ) : 0; ?>
					<div class="ato-poll-row" data-choice="<?php echo esc_attr( $i ); ?>">
						<div class="ato-poll-row-head">
							<span class="ato-poll-label"><?php echo esc_html( $label ); ?></span>
							<span class="ato-poll-pct" data-pct="<?php echo esc_attr( $pct ); ?>"><?php echo esc_html( $pct ); ?>%</span>
						</div>
						<div class="ato-poll-bar"><i style="width:<?php echo esc_attr( $voted ? $pct : 0 ); ?>%"></i></div>
					</div>
				<?php endforeach; ?>
				<p class="ato-poll-total">
					<?php
					printf(
						/* translators: %s: number of votes. */
						esc_html( _n( '%s vote so far', '%s votes so far', max( 1, $total ), 'ato-customizer' ) ),
						esc_html( number_format_i18n( $total ) )
					);
					?>
				</p>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	public static function ajax_vote() {
		check_ajax_referer( 'ato-poll', 'nonce' );

		$key    = isset( $_POST['poll'] ) ? preg_replace( '/[^a-f0-9]/', '', wp_unslash( $_POST['poll'] ) ) : '';
		$choice = isset( $_POST['choice'] ) ? absint( $_POST['choice'] ) : -1;

		if ( '' === $key || $choice < 0 || $choice > 20 ) {
			wp_send_json_error( array( 'message' => __( 'Invalid vote.', 'ato-customizer' ) ), 400 );
		}

		$option_name = 'ato_poll_votes_' . $key;
		$votes       = get_option( $option_name, array() );
		$votes[ $choice ] = isset( $votes[ $choice ] ) ? (int) $votes[ $choice ] + 1 : 1;
		update_option( $option_name, $votes, false );

		$total = array_sum( array_map( 'intval', $votes ) );
		$pcts  = array();
		foreach ( $votes as $i => $count ) {
			$pcts[ $i ] = $total > 0 ? round( (int) $count * 100 / $total ) : 0;
		}

		wp_send_json_success( array(
			'percentages' => $pcts,
			'total'       => $total,
		) );
	}
}
