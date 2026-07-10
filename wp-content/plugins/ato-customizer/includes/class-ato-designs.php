<?php
/**
 * Design storage: custom post type + AJAX save/load.
 *
 * Every saved customization becomes an `ato_design` post:
 * - post_content : the layered Fabric.js JSON (full production data)
 * - _ato_ref     : unique human-friendly reference (e.g. ATO-8F3K2A)
 * - _ato_config  : template / material / size / shape / quantity chosen
 * - _ato_fonts   : font families used in the design
 * - _ato_preview : URL of the rendered PNG preview in uploads
 * - _ato_edit_log: chronological edit history (who, when, note)
 *
 * @package ato-customizer
 */

defined( 'ABSPATH' ) || exit;

class ATO_Designs {

	const CPT = 'ato_design';

	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_cpt' ) );
		add_action( 'wp_ajax_ato_save_design', array( __CLASS__, 'ajax_save_design' ) );
		add_action( 'wp_ajax_nopriv_ato_save_design', array( __CLASS__, 'ajax_save_design' ) );
		add_action( 'wp_ajax_ato_load_design', array( __CLASS__, 'ajax_load_design' ) );
	}

	/**
	 * Private CPT — designs are only surfaced through the plugin's own screens.
	 */
	public static function register_cpt() {
		register_post_type( self::CPT, array(
			'labels'          => array(
				'name'          => __( 'Customer Designs', 'ato-customizer' ),
				'singular_name' => __( 'Customer Design', 'ato-customizer' ),
			),
			'public'          => false,
			'show_ui'         => false,
			'supports'        => array( 'title' ),
			'capability_type' => 'post',
		) );
	}

	/**
	 * Save (or update) a design from the editor.
	 *
	 * Guests may create designs (that's the guest checkout flow); only users
	 * with `edit_others_posts` (shop admins) may update an existing one.
	 */
	public static function ajax_save_design() {
		check_ajax_referer( 'ato-editor', 'nonce' );

		$design_id = isset( $_POST['design_id'] ) ? absint( $_POST['design_id'] ) : 0;
		$json_raw  = isset( $_POST['design_json'] ) ? wp_unslash( $_POST['design_json'] ) : '';
		$preview   = isset( $_POST['preview'] ) ? wp_unslash( $_POST['preview'] ) : '';
		$config    = isset( $_POST['config'] ) ? wp_unslash( $_POST['config'] ) : '';
		$fonts     = isset( $_POST['fonts'] ) ? sanitize_text_field( wp_unslash( $_POST['fonts'] ) ) : '';
		$product   = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		$note      = isset( $_POST['note'] ) ? sanitize_text_field( wp_unslash( $_POST['note'] ) ) : '';

		$decoded = json_decode( $json_raw, true );
		if ( null === $decoded || ! is_array( $decoded ) ) {
			wp_send_json_error( array( 'message' => __( 'The design data was invalid. Please try saving again.', 'ato-customizer' ) ), 400 );
		}

		$config_arr = json_decode( $config, true );
		$config_arr = is_array( $config_arr ) ? array_map( 'sanitize_text_field', $config_arr ) : array();

		$is_update = $design_id > 0;
		if ( $is_update && ! current_user_can( 'edit_others_posts' ) ) {
			wp_send_json_error( array( 'message' => __( 'You are not allowed to edit this design.', 'ato-customizer' ) ), 403 );
		}
		if ( $is_update && get_post_type( $design_id ) !== self::CPT ) {
			wp_send_json_error( array( 'message' => __( 'Design not found.', 'ato-customizer' ) ), 404 );
		}

		if ( $is_update ) {
			wp_update_post( array(
				'ID'           => $design_id,
				'post_content' => wp_slash( wp_json_encode( $decoded ) ),
			) );
			$ref = get_post_meta( $design_id, '_ato_ref', true );
		} else {
			$ref       = self::generate_ref();
			$design_id = wp_insert_post( array(
				'post_type'    => self::CPT,
				'post_status'  => 'private',
				'post_title'   => $ref,
				'post_content' => wp_slash( wp_json_encode( $decoded ) ),
			) );
			if ( is_wp_error( $design_id ) || ! $design_id ) {
				wp_send_json_error( array( 'message' => __( 'Could not save the design. Please try again.', 'ato-customizer' ) ), 500 );
			}
			update_post_meta( $design_id, '_ato_ref', $ref );
		}

		if ( $product ) {
			update_post_meta( $design_id, '_ato_product_id', $product );
		}
		if ( ! empty( $config_arr ) ) {
			update_post_meta( $design_id, '_ato_config', $config_arr );
		}
		if ( $fonts ) {
			update_post_meta( $design_id, '_ato_fonts', $fonts );
		}

		$preview_url = self::save_preview_png( $design_id, $preview );
		if ( $preview_url ) {
			update_post_meta( $design_id, '_ato_preview', $preview_url );
		}

		self::append_log(
			$design_id,
			$is_update
				? ( $note ? $note : __( 'Design updated by admin.', 'ato-customizer' ) )
				: __( 'Design created by customer.', 'ato-customizer' )
		);

		wp_send_json_success( array(
			'design_id' => $design_id,
			'ref'       => $ref,
			'preview'   => $preview_url,
		) );
	}

	/**
	 * Load a design's JSON for the admin editor.
	 */
	public static function ajax_load_design() {
		check_ajax_referer( 'ato-editor', 'nonce' );

		if ( ! current_user_can( 'edit_others_posts' ) ) {
			wp_send_json_error( array( 'message' => __( 'Not allowed.', 'ato-customizer' ) ), 403 );
		}

		$design_id = isset( $_GET['design_id'] ) ? absint( $_GET['design_id'] ) : 0;
		$post      = $design_id ? get_post( $design_id ) : null;

		if ( ! $post || self::CPT !== $post->post_type ) {
			wp_send_json_error( array( 'message' => __( 'Design not found.', 'ato-customizer' ) ), 404 );
		}

		wp_send_json_success( array(
			'design_json' => json_decode( $post->post_content, true ),
			'config'      => get_post_meta( $design_id, '_ato_config', true ),
			'fonts'       => get_post_meta( $design_id, '_ato_fonts', true ),
			'ref'         => get_post_meta( $design_id, '_ato_ref', true ),
		) );
	}

	/**
	 * Decode and store the PNG preview in the uploads folder.
	 *
	 * @param int    $design_id Design post ID.
	 * @param string $data_url  data:image/png;base64,... from the canvas.
	 * @return string|false Public URL on success.
	 */
	protected static function save_preview_png( $design_id, $data_url ) {
		if ( ! preg_match( '#^data:image/png;base64,#', $data_url ) ) {
			return false;
		}
		$binary = base64_decode( substr( $data_url, strlen( 'data:image/png;base64,' ) ), true );
		if ( false === $binary || strlen( $binary ) > 8 * MB_IN_BYTES ) {
			return false;
		}
		// Confirm it's a real PNG.
		if ( "\x89PNG" !== substr( $binary, 0, 4 ) ) {
			return false;
		}
		$upload = wp_upload_bits( 'ato-design-' . $design_id . '-' . time() . '.png', null, $binary );
		if ( ! empty( $upload['error'] ) ) {
			return false;
		}
		return $upload['url'];
	}

	/**
	 * Append an entry to the design's edit history.
	 *
	 * @param int    $design_id Design post ID.
	 * @param string $note      What happened.
	 */
	public static function append_log( $design_id, $note ) {
		$log   = get_post_meta( $design_id, '_ato_edit_log', true );
		$log   = is_array( $log ) ? $log : array();
		$user  = wp_get_current_user();
		$log[] = array(
			'time' => current_time( 'mysql' ),
			'user' => $user->exists() ? $user->display_name : __( 'Guest customer', 'ato-customizer' ),
			'note' => $note,
		);
		update_post_meta( $design_id, '_ato_edit_log', $log );
	}

	/**
	 * Unique short reference like ATO-8F3K2A.
	 */
	protected static function generate_ref() {
		return 'ATO-' . strtoupper( substr( str_replace( array( '+', '/', '=' ), '', base64_encode( wp_generate_password( 12, false ) ) ), 0, 6 ) );
	}

	/**
	 * Convenience: everything the order/emails/admin screens need about a design.
	 *
	 * @param int $design_id Design post ID.
	 * @return array|null
	 */
	public static function get_design_summary( $design_id ) {
		$post = get_post( $design_id );
		if ( ! $post || self::CPT !== $post->post_type ) {
			return null;
		}
		return array(
			'id'      => $design_id,
			'ref'     => get_post_meta( $design_id, '_ato_ref', true ),
			'config'  => get_post_meta( $design_id, '_ato_config', true ),
			'fonts'   => get_post_meta( $design_id, '_ato_fonts', true ),
			'preview' => get_post_meta( $design_id, '_ato_preview', true ),
			'log'     => get_post_meta( $design_id, '_ato_edit_log', true ),
			'json'    => $post->post_content,
		);
	}
}
