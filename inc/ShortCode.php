<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
class EASY_TF_ShortCode{
	public function __construct(){
		add_action( 'admin_enqueue_scripts', [$this, 'enqueueScripts'] );
		add_action( 'wp_enqueue_scripts', [$this, 'enqueueScripts'] );
		add_shortcode( 'timeline', [$this, 'timelineShortCode'] );
		add_shortcode( 'follow_button', [$this, 'followButtonShortCode'] );
	}

    function enqueueScripts(){
        wp_enqueue_script( 'widget-js',EASY_TF_DIR_URL . 'assets/js/widget.js' , array(), EASY_TF_VERSION , false );
    }

    function timelineShortCode( $atts ){
        $a = shortcode_atts( array(
            'username' => null,
            'width' => null,
            'height' => null,				
            'theme' => 'dark',
            'title' => null,
            'lang' => null,		
            'chrome' => null,
        ), $atts );
        $username = $a['username'];
        $width = $a['width'];
        $height = $a['height'];
        $theme = $a['theme'];
        $title = $a['title'];
        $lang = $a['lang'];
        $chrome = $a['chrome'];
        
        ob_start();
        if (!empty($username)){  ?>
        <div>
            <a class="twitter-timeline" data-width="<?php echo esc_attr($width); ?>" data-lang="<?php echo esc_attr($lang);  ?>"
                data-chrome="<?php echo esc_attr($chrome);  ?>" data-height="<?php echo esc_attr($height); ?>"
                data-theme="<?php echo esc_attr($theme); ?>" href="https://twitter.com/<?php echo esc_attr($username); ?>"
                rel=”nofollow”>
                <?php echo esc_html($title); ?> <?php echo esc_html($username); ?>
            </a>

            <?php }else{ echo '<h2>You must enter your Twitter handle in the username attribute of the shortcode.  </h2>';}
        ?></div> 
        <?php return ob_get_clean();
    }

    function followButtonShortCode( $atts ){
        $a = shortcode_atts( array(
            'username' => null,
            'size' => null,
            'count' => null,
        ), $atts );
        $username = $a['username'];
        $size = $a['size'];
        $count = $a['count'];
    
        ob_start();
        if (!empty($username)){ ?>
        <div>
            <a href="https://twitter.com/<?php echo esc_attr($username); ?>" class="twitter-follow-button"
                data-size="<?php echo esc_attr($size); ?>" data-show-count="<?php echo esc_attr($count); ?>">
                Follow @<?php echo esc_html($username); ?>
            </a>
            <?php }else{ echo '<h2>You must enter your Twitter handle in the username attribute of the shortcode.  </h2>';}
        ?>
        </div>
        <?php return ob_get_clean();
    }
}
new EASY_TF_ShortCode;