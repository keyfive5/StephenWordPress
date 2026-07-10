<?php
/**
 * Inline SVG icon set (stroke style, 24px grid — consistent with Lucide).
 *
 * @package alltakeout
 */

defined( 'ABSPATH' ) || exit;

/**
 * Return an inline SVG icon.
 *
 * @param string $name Icon name.
 * @param int    $size Pixel size (width/height attr).
 * @return string SVG markup.
 */
function ato_icon( $name, $size = 24 ) {
	$paths = array(
		'sticker'   => '<path d="M9 3h6a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6V9a6 6 0 0 1 6-6Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/>',
		'megaphone' => '<path d="m3 11 18-7-4 14-6-3.5L3 11Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
		'qr'        => '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v.01M14 21v.01M21 21v.01M17.5 17.5H21M17.5 17.5V21"/>',
		'tag'       => '<path d="M12 2H2v10l9.3 9.3a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8L12 2Z"/><circle cx="7" cy="7" r="1.5"/>',
		'badge'     => '<path d="M12 2 14.4 4.5 17.8 4.2 18.5 7.5 21.5 9 20 12 21.5 15 18.5 16.5 17.8 19.8 14.4 19.5 12 22 9.6 19.5 6.2 19.8 5.5 16.5 2.5 15 4 12 2.5 9 5.5 7.5 6.2 4.2 9.6 4.5 12 2Z"/><path d="m9 12 2 2 4-4"/>',
		'shield'    => '<path d="M12 2 20 5v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3Z"/><path d="m9 12 2 2 4-4"/>',
		'heart'     => '<path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6.3a5 5 0 1 1 7.5 6.3Z"/>',
		'utensils'  => '<path d="M7 2v20M4 2v5a3 3 0 0 0 6 0V2"/><path d="M17 2c-2 2-3 4.5-3 8 0 2 1 3 3 3s3-1 3-3c0-3.5-1-6-3-8Zm0 11v9"/>',
		'arrow'     => '<path d="M5 12h14M13 6l6 6-6 6"/>',
		'check'     => '<path d="M20 6 9 17l-5-5"/>',
		'star'      => '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/>',
		'cart'      => '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2.5l2.6 12.4a1.5 1.5 0 0 0 1.5 1.1h8.6a1.5 1.5 0 0 0 1.4-1.1L21.5 7H6"/>',
		'menu'      => '<path d="M4 7h16M4 12h16M4 17h16"/>',
		'close'     => '<path d="M6 6l12 12M18 6 6 18"/>',
		'truck'     => '<path d="M1 4h14v12H1zM15 9h4l4 4v3h-8z"/><circle cx="6" cy="18.5" r="2"/><circle cx="18" cy="18.5" r="2"/>',
		'eye'       => '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
		'palette'   => '<path d="M12 22a10 10 0 1 1 10-10c0 2.2-1.8 3-3.5 3H16a2 2 0 0 0-1.5 3.3c.6.7.2 1.7-.7 1.7H12Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="11" cy="7.5" r="1"/><circle cx="16" cy="9" r="1"/>',
		'gift'      => '<rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8c-2 0-5-.5-5-3a2 2 0 0 1 4-.9c.4.8 1 2.9 1 3.9Zm0 0c2 0 5-.5 5-3a2 2 0 0 0-4-.9c-.4.8-1 2.9-1 3.9Z"/>',
		'layers'    => '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
		'type'      => '<path d="M4 7V4h16v3M12 4v16m-3 0h6"/>',
		'upload'    => '<path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
	);

	if ( ! isset( $paths[ $name ] ) ) {
		$name = 'sticker';
	}

	return sprintf(
		'<svg width="%1$d" height="%1$d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">%2$s</svg>',
		(int) $size,
		$paths[ $name ]
	);
}

/**
 * Echo an icon.
 *
 * @param string $name Icon name.
 * @param int    $size Pixel size.
 */
function ato_the_icon( $name, $size = 24 ) {
	echo ato_icon( $name, $size ); // phpcs:ignore WordPress.Security.EscapeOutput -- static trusted SVG.
}
