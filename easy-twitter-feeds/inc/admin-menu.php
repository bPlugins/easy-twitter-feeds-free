<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
if(!class_exists('EASY_TF_AdminMenu')) {

    class EASY_TF_AdminMenu
    {
        public function __construct()
        {
            add_action('admin_enqueue_scripts', [$this, 'adminEnqueueScripts']);
            add_action('admin_menu', [$this, 'adminMenu']);
        }

        public function adminEnqueueScripts($hook)
        {
            if( strpos( $hook, 'easy-twitter-feeds_page_easy-twitter-feeds' ) !== false ){
                wp_enqueue_style( 'etf-admin-dashboard',EASY_TF_DIR_URL . 'build/admin-dashboard.css', [], EASY_TF_VERSION );
                wp_enqueue_script( 'etf-admin-dashboard', EASY_TF_DIR_URL . 'build/admin-dashboard.js', [ 'wp-element', 'wp-data', 'wp-api', 'wp-util', 'wp-i18n' ], EASY_TF_VERSION, true );
                wp_set_script_translations( 'etf-admin-dashboard', 'easy-twitter-feeds', EASY_TF_DIR_PATH . 'languages' );
            }
        }

        public function adminMenu(){
            add_submenu_page(
                'edit.php?post_type=easy-twitter-feeds',
                __('Demo and Help', 'easy-twitter-feeds'),
                __('Demo and Help', 'easy-twitter-feeds'),
                'manage_options',
                'easy-twitter-feeds',
                [$this, 'helpPage'],
            );
        }

        public function helpPage()
        {?>
            <div id='etfDashboard'
            data-info='<?php echo esc_attr( wp_json_encode( [
                    'version' => EASY_TF_VERSION
                ] ) ); ?>'
            ></div>
        <?php }
    }
    new EASY_TF_AdminMenu();
}

