<?php 
/*
 * Plugin Name: Easy Twitter Feeds – Embed Social Media Posts with Live Updates
 * Plugin URI:  https://twitter-feed.bplugins.com/
 * Description: You can Embed your Twitter timeline feed, Follow widget anywhere in WordPress using Shortcode.  
 * Version: 1.2.14
 * Author: bPlugins LLC
 * Author URI: https://bplugins.com/
 * Text Domain: easy-twitter-feeds
 * Domain Path:  /languages
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */

// ABS PATH
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
    // Constants
    if (defined('WP_DEBUG') && WP_DEBUG === true) {
        define('EASY_TF_VERSION', time());
    } else {
        define('EASY_TF_VERSION', '1.2.14');
    }
    define( 'EASY_TF_DIR_URL', plugin_dir_url( __FILE__ ) );
    define( 'EASY_TF_DIR_PATH', plugin_dir_path( __FILE__ ) );
     
     
    if ( ! function_exists( 'easy_tf_fs' ) ) {
        // Create a helper function for easy SDK access.
        function easy_tf_fs()
        {
            global $easy_tf_fs;

            if (!isset($easy_tf_fs)) {
                 // Include Freemius SDK.
                require_once dirname(__FILE__) . '/vendor/freemius-lite/start.php';
                

                $etfConfig = array(
                'id'                  => '14839', 
                'slug'                => 'easy-twitter-feeds',
                'type'                => 'plugin',
                'public_key'          => 'pk_ba9a28a91e7b8f97d024123dad59c',
                'is_premium'          => false,
                'menu'                =>  array(
                    'slug'        => 'edit.php?post_type=easy-twitter-feeds',
                    'first-path'  =>  'edit.php?post_type=easy-twitter-feeds&page=easy-twitter-feeds#/pricing',
                    'support'     => false,
                )                 
            );
            $easy_tf_fs = fs_lite_dynamic_init( $etfConfig );
            }
            return $easy_tf_fs;
        }
        // // Init Freemius.
        easy_tf_fs();
        // Signal that SDK was initiated.
        do_action('easy_tf_fs_loaded');
    }
    
    require_once EASY_TF_DIR_PATH . 'inc/CustomPost.php';
    require_once EASY_TF_DIR_PATH . 'inc/ShortCode.php';
    
    class EASY_TF_EASY_TWITTER_FEEDS
    {
        public function __construct(){
            $this->load_classes();
            add_action( 'init', [$this, 'onInit'] );
            add_action('admin_enqueue_scripts', [$this, 'adminEnqueueScripts']);
        }

        function onInit(){
            register_block_type( __DIR__ . '/build' );
        }

        public function load_classes(){
            require_once plugin_dir_path(__FILE__) . '/inc/admin-menu.php';
        }
 
        public function adminEnqueueScripts($hook)
        {
            global $post_type;

            if ( $post_type === 'easy-twitter-feeds' ) {
                wp_enqueue_style( 'easy-tf-admin', EASY_TF_DIR_URL . 'assets/css/admin.css', [], EASY_TF_VERSION );
                wp_enqueue_script( 'easy-tf-admin', EASY_TF_DIR_URL . 'assets/js/admin.js', ['wp-i18n'], EASY_TF_VERSION, true );
            }
        }
    }
    new EASY_TF_EASY_TWITTER_FEEDS();