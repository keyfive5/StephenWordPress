<?php
/**
 * Production-spec email to the admin when an order is paid.
 *
 * Per the client scope, the notification includes: customer name and order
 * number, selected template / material / dimensions / shape, font names used,
 * uploaded image & QR details, and a link to the layered design data.
 *
 * @package ato-customizer
 */

defined( 'ABSPATH' ) || exit;

class ATO_Emails {

	public static function init() {
		add_action( 'woocommerce_order_status_processing', array( __CLASS__, 'send_production_email' ), 10, 1 );
	}

	public static function send_production_email( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order || $order->get_meta( '_ato_production_email_sent' ) ) {
			return;
		}

		$rows     = '';
		$has_ato  = false;

		foreach ( $order->get_items() as $item ) {
			$design_id = (int) $item->get_meta( '_ato_design_id' );
			if ( ! $design_id ) {
				continue;
			}
			$summary = ATO_Designs::get_design_summary( $design_id );
			if ( ! $summary ) {
				continue;
			}
			$has_ato = true;

			$config = is_array( $summary['config'] ) ? $summary['config'] : array();
			$json   = json_decode( $summary['json'], true );

			$uploads = 0;
			$qr      = 0;
			if ( isset( $json['objects'] ) && is_array( $json['objects'] ) ) {
				foreach ( $json['objects'] as $obj ) {
					if ( isset( $obj['atoType'] ) && 'qr' === $obj['atoType'] ) {
						$qr++;
					} elseif ( isset( $obj['type'] ) && 'image' === strtolower( $obj['type'] ) ) {
						$uploads++;
					}
				}
			}

			$edit_link = admin_url( 'admin.php?page=ato-designs&design=' . $design_id );

			$rows .= sprintf(
				'<tr>
					<td style="padding:10px;border:1px solid #e0e0e0;">%1$s<br><small>%2$s</small></td>
					<td style="padding:10px;border:1px solid #e0e0e0;">%3$s</td>
					<td style="padding:10px;border:1px solid #e0e0e0;">%4$s</td>
					<td style="padding:10px;border:1px solid #e0e0e0;">%5$s</td>
					<td style="padding:10px;border:1px solid #e0e0e0;">%6$s</td>
				</tr>',
				esc_html( $item->get_name() ),
				esc_html( $summary['ref'] ),
				esc_html( implode( ' / ', array_filter( array(
					isset( $config['template'] ) ? $config['template'] : '',
					isset( $config['material'] ) ? $config['material'] : '',
					isset( $config['size'] ) ? $config['size'] : '',
					isset( $config['shape'] ) ? $config['shape'] : '',
					isset( $config['quantity'] ) ? $config['quantity'] . ' pcs' : '',
				) ) ) ),
				esc_html( $summary['fonts'] ? $summary['fonts'] : '—' ),
				sprintf(
					/* translators: 1: uploaded image count, 2: QR code count. */
					esc_html__( '%1$d image(s), %2$d QR code(s)', 'ato-customizer' ),
					$uploads,
					$qr
				),
				'<a href="' . esc_url( $edit_link ) . '">' . esc_html__( 'Open design', 'ato-customizer' ) . '</a>'
			);

			if ( $summary['preview'] ) {
				$rows .= sprintf(
					'<tr><td colspan="5" style="padding:10px;border:1px solid #e0e0e0;background:#fafafa;"><img src="%s" alt="" style="max-width:220px;height:auto;border:1px dashed #ccc;"></td></tr>',
					esc_url( $summary['preview'] )
				);
			}
		}

		if ( ! $has_ato ) {
			return;
		}

		$subject = sprintf(
			/* translators: 1: order number, 2: customer name. */
			__( '[Production] Order #%1$s — %2$s', 'ato-customizer' ),
			$order->get_order_number(),
			$order->get_formatted_billing_full_name()
		);

		$body = sprintf(
			'<div style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:720px;">
				<h2 style="color:#2E639E;">%1$s</h2>
				<p><strong>%2$s:</strong> #%3$s<br>
				<strong>%4$s:</strong> %5$s<br>
				<strong>%6$s:</strong> %7$s</p>
				<table style="border-collapse:collapse;width:100%%;font-size:13px;">
					<tr style="background:#2E639E;color:#fff;">
						<th style="padding:10px;text-align:left;">%8$s</th>
						<th style="padding:10px;text-align:left;">%9$s</th>
						<th style="padding:10px;text-align:left;">%10$s</th>
						<th style="padding:10px;text-align:left;">%11$s</th>
						<th style="padding:10px;text-align:left;">%12$s</th>
					</tr>
					%13$s
				</table>
				<p style="margin-top:16px;">%14$s: <a href="%15$s">%15$s</a></p>
			</div>',
			esc_html__( 'New order ready for production review', 'ato-customizer' ),
			esc_html__( 'Order', 'ato-customizer' ),
			esc_html( $order->get_order_number() ),
			esc_html__( 'Customer', 'ato-customizer' ),
			esc_html( $order->get_formatted_billing_full_name() ),
			esc_html__( 'VIP member', 'ato-customizer' ),
			'yes' === $order->get_meta( '_ato_vip_order' ) ? esc_html__( 'Yes — include complimentary stickers if noted on the order', 'ato-customizer' ) : esc_html__( 'No', 'ato-customizer' ),
			esc_html__( 'Item / Ref', 'ato-customizer' ),
			esc_html__( 'Configuration', 'ato-customizer' ),
			esc_html__( 'Fonts used', 'ato-customizer' ),
			esc_html__( 'Assets', 'ato-customizer' ),
			esc_html__( 'Design', 'ato-customizer' ),
			$rows,
			esc_html__( 'Manage this order', 'ato-customizer' ),
			esc_url( $order->get_edit_order_url() )
		);

		$to = get_option( 'admin_email' );
		wc_mail( $to, $subject, $body );

		$order->update_meta_data( '_ato_production_email_sent', 'yes' );
		$order->save();
	}
}
