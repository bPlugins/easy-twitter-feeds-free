<?php
if ( ! defined( 'ABSPATH' ) ) exit;
class EASY_TF_CustomPost{
	public $post_type = 'easy-twitter-feeds';

	public function __construct(){
		 
		add_action( 'init', [$this, 'onInit'] );
		add_shortcode( 'etf', [$this, 'onAddShortcode'] );
		add_filter( 'manage_easy-twitter-feeds_posts_columns', [$this, 'manageETFPostsColumns'], 10 );
		add_action( 'manage_easy-twitter-feeds_posts_custom_column', [$this, 'manageETFPostsCustomColumns'], 10, 2 );
		add_action( 'use_block_editor_for_post', [$this, 'useBlockEditorForPost'], 999, 2 );
		add_action('post_row_actions', array($this, 'etf_add_duplicate_link'), 10, 2);
		add_action('admin_action_duplicate_post', array($this, 'etf_duplicate_post'));
	}

	function onInit(){
		$menuIcon = "<svg xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='48' height='48' viewBox='0 0 48 48'>
        <path fill='#03A9F4' d='M42,12.429c-1.323,0.586-2.746,0.977-4.247,1.162c1.526-0.906,2.7-2.351,3.251-4.058c-1.428,0.837-3.01,1.452-4.693,1.776C34.967,9.884,33.05,9,30.926,9c-4.08,0-7.387,3.278-7.387,7.32c0,0.572,0.067,1.129,0.193,1.67c-6.138-0.308-11.582-3.226-15.224-7.654c-0.64,1.082-1,2.349-1,3.686c0,2.541,1.301,4.778,3.285,6.096c-1.211-0.037-2.351-0.374-3.349-0.914c0,0.022,0,0.055,0,0.086c0,3.551,2.547,6.508,5.923,7.181c-0.617,0.169-1.269,0.263-1.941,0.263c-0.477,0-0.942-0.054-1.392-0.135c0.94,2.902,3.667,5.023,6.898,5.086c-2.528,1.96-5.712,3.134-9.174,3.134c-0.598,0-1.183-0.034-1.761-0.104C9.268,36.786,13.152,38,17.321,38c13.585,0,21.017-11.156,21.017-20.834c0-0.317-0.01-0.633-0.025-0.945C39.763,15.197,41.013,13.905,42,12.429'></path></svg>";

		register_post_type( 'easy-twitter-feeds', [
			'labels'				=> [
				'name'			=> __( 'Easy Twitter', 'easy-twitter-feeds'),
				'singular_name'	=> __( 'Easy Twitter', 'easy-twitter-feeds' ),
				'menu_name'     => __( 'Easy Twitter', 'easy-twitter-feeds' ),
				'all_items'     => __( 'All Easy Twitter', 'easy-twitter-feeds' ),
				'add_new'		=> __( 'Add New', 'easy-twitter-feeds' ),
				'add_new_item'	=> __( '&#8627; Add New', 'easy-twitter-feeds' ),
				'edit_item'		=> __( 'Edit', 'easy-twitter-feeds' ),
				'new_item'		=> __( 'New', 'easy-twitter-feeds' ),
				'view_item'		=> __( 'View', 'easy-twitter-feeds' ),
				'search_items'	=> __( 'Search', 'easy-twitter-feeds'),
				'not_found'		=> __( 'Sorry, we couldn\'t find the post that you are looking for.', 'easy-twitter-feeds' )
			],
			'public'				=> false,
			'show_ui'				=> true, 		
			'show_in_rest'			=> true,							
			'publicly_queryable'	=> false,
			'exclude_from_search'	=> true,
			'menu_position'			=> 14,
			'menu_icon'				=> 'data:image/svg+xml;base64,' . base64_encode($menuIcon),		
			'has_archive'			=> false,
			'hierarchical'			=> false,
			'capability_type'		=> 'page',
			'rewrite'				=> [ 'slug' => 'etf' ],
			'supports'				=> [ 'title', 'editor' ],
			'template'				=> [ ['etf/twitter-feed'] ],
			'template_lock'			=> 'all',
		]); // Register Post Type
	}

	function onAddShortcode( $atts ) {
		if ( empty( $atts['id'] ) ) {
			return '';
		}
		$post_id = (int) $atts['id'];

		$post = get_post( $post_id );
		$blocks = parse_blocks( $post->post_content );

		ob_start();
		echo render_block($blocks[0]); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		return ob_get_clean();
	}

	function manageETFPostsColumns( $defaults ) {
		unset( $defaults['date'] );
		$defaults['shortcode'] = 'ShortCode';
		$defaults['date'] = 'Date';
		return $defaults;
	}

	function manageETFPostsCustomColumns( $column_name, $post_ID ) {
		if ( $column_name == 'shortcode' ) {
			printf(
				/* phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped */
				'<div class="etfAdminShortcode" id="etfAdminShortcode-%1$s">
					<input value="[etf id=%1$s]" onclick="eftHandleShortcode(%1$s)">
					<span class="tooltip">%2$s</span>
				</div>',
				esc_attr( $post_ID ),
				esc_html__( 'Copy To Clipboard', 'easy-twitter-feeds' )
			);
		}
	}

	function useBlockEditorForPost($use, $post){
		if ( $this->post_type === $post->post_type ) {
			return true;
		}
		return $use;
	}

	 function etf_add_duplicate_link($actions, $post)
	{
	   if ($post->post_type == 'easy-twitter-feeds') {
		  $url = admin_url("admin.php?action=duplicate_post&post={$post->ID}");
		  $nonce_url = wp_nonce_url($url, 'etf_duplicate_post_' . $post->ID);
		  $actions['duplicate'] = '<a href="' . esc_url($nonce_url) . '">Duplicate</a>';
	   }
	   return $actions;
	}

	public function etf_duplicate_post()
    {
        if ( ! isset( $_GET['post'] ) || ! isset( $_GET['_wpnonce'] ) || ! current_user_can( 'edit_posts' ) ) {
            wp_die( 'Permission denied' );
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        $post_id = absint( wp_unslash( $_GET['post'] ) );
        check_admin_referer( 'etf_duplicate_post_' . $post_id );

        $post = get_post( $post_id );

        if (!$post) {
            wp_die('Invalid post ID');
        }

        $new_post = array(
            'post_title' => $post->post_title . '(copy)',
            'post_content' => $post->post_content,
            'post_status' => $post->post_status,
            'post_type' => $post->post_type,
        );

        $new_post_id = wp_insert_post($new_post);
        wp_safe_redirect(admin_url("post.php?action=edit&post={$new_post_id}"));
        exit;
    }
}
new EASY_TF_CustomPost();