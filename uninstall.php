<?php
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Remove Freemius Lite SDK options written by this plugin.
delete_option( 'easy-twitter-feeds-opt_in' );
delete_option( 'easy-twitter-feeds-marketing-allowed' );
delete_option( 'easy-twitter-feeds-redirect' );
delete_option( 'fs_lite_accounts' );
delete_option( 'fs_lite_unique_id' );
