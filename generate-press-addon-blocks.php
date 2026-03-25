<?php
/**
 * Plugin Name: Generate Press Add-on Blocks
 * Description: A scalable collection of custom, performance-optimized Gutenberg blocks and extensions for GeneratePress.
 * Version: 1.7.0
 * Author: Digitally Disruptive - Donald Raymundo
 * Author URI: https://digitallydisruptive.co.uk/
 * Text Domain: dd-gp-addon-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Enqueues global frontend extensions, such as the native HTML5 Lightbox.
 * Loading is separated from block-specific assets to ensure availability on generic Core/GP blocks.
 *
 * @return void
 */
function dd_gp_enqueue_global_extensions() {
    // Only enqueue if we are on the frontend to keep the admin lean.
    if ( ! is_admin() ) {
        wp_enqueue_script( 'dd-lightbox-script', plugins_url( 'extensions/lightbox/lightbox.js', __FILE__ ), array(), '1.7.0', true );
        wp_enqueue_style( 'dd-lightbox-style', plugins_url( 'extensions/lightbox/lightbox.css', __FILE__ ), array(), '1.7.0' );
    }
}
add_action( 'wp_enqueue_scripts', 'dd_gp_enqueue_global_extensions' );

/**
 * Centralized block registry for Generate Press Add-on Blocks.
 * Iterates through a configuration array to dynamically register block scripts, styles, and behaviors.
 *
 * @return void
 */
function dd_gp_register_addon_blocks() {
    $blocks = array(
        'logo-marquee' => array(
            'script_file'       => 'blocks/marquee-block/marquee-block.js',
            'style_file'        => 'blocks/marquee-block/marquee-block.css',
            'editor_style_file' => 'blocks/marquee-block/marquee-block-editor.css',
            'render_callback'   => 'dd_render_marquee_block',
        ),
        'lightbox-container' => array(
            'script_file'       => 'blocks/lightbox-container-block/lightbox-container.js',
            'style_file'        => 'blocks/lightbox-container-block/lightbox-container.css',
            'view_script_file'  => 'blocks/lightbox-container-block/lightbox-frontend.js', 
            // Now utilizing a PHP callback to process dynamic data before rendering
            'render_callback'   => 'dd_render_lightbox_container_block', 
        ),
    );

    foreach ( $blocks as $slug => $config ) {
        $script_handle       = "dd-{$slug}-script";
        $style_handle        = "dd-{$slug}-style";
        $editor_style_handle = "dd-{$slug}-editor-style";
        $view_script_handle  = "dd-{$slug}-view-script";

        $block_args = array(
            'api_version'   => 2,
        );

        // Register and assign the Editor Script
        wp_register_script( $script_handle, plugins_url( $config['script_file'], __FILE__ ), array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components' ), '1.7.0', true );
        $block_args['editor_script'] = $script_handle;

        // Register and assign the Frontend/Shared Style
        if ( ! empty( $config['style_file'] ) ) {
            wp_register_style( $style_handle, plugins_url( $config['style_file'], __FILE__ ), array(), '1.7.0' );
            $block_args['style'] = $style_handle;
        }

        // Register and assign the Editor-Specific Style
        if ( ! empty( $config['editor_style_file'] ) ) {
            wp_register_style( $editor_style_handle, plugins_url( $config['editor_style_file'], __FILE__ ), array(), '1.7.0' );
            $block_args['editor_style'] = $editor_style_handle;
        }

        // Register and assign the Frontend View Script
        if ( ! empty( $config['view_script_file'] ) ) {
            wp_register_script( $view_script_handle, plugins_url( $config['view_script_file'], __FILE__ ), array(), '1.7.0', true );
            $block_args['view_script'] = $view_script_handle;
        }

        // Assign PHP Render Callback if defined
        if ( ! empty( $config['render_callback'] ) ) {
            $block_args['render_callback'] = $config['render_callback'];
        }

        register_block_type( "dd/{$slug}", $block_args );
    }
}
add_action( 'init', 'dd_gp_register_addon_blocks' );

/**
 * Renders the frontend output for the Lightbox Container dynamic Gutenberg block.
 * Resolves dynamic data (Post Meta) or executes shortcodes to generate the media URL,
 * and conditionally injects an inline SVG play button overlay based on block attributes.
 *
 * @param array  $attributes Block attributes from the editor.
 * @param string $content    The saved InnerBlocks HTML content.
 * @return string HTML output for the block wrapper and its inner content.
 */
function dd_render_lightbox_container_block( $attributes, $content ) {
    if ( empty( trim( $content ) ) ) {
        return '';
    }

    $url = '';

    // 1. If Dynamic Data is enabled, fetch directly from the WordPress post meta.
    if ( ! empty( $attributes['isDynamic'] ) && ! empty( $attributes['metaKey'] ) ) {
        $post_id = get_the_ID();
        if ( $post_id ) {
            $url = get_post_meta( $post_id, $attributes['metaKey'], true );
        }
    } 
    // 2. Otherwise, fall back to the standard URL field, executing any GenerateBlocks/custom shortcodes placed inside.
    else if ( ! empty( $attributes['mediaUrl'] ) ) {
        $url = do_shortcode( $attributes['mediaUrl'] );
    }

    // Build the container attributes securely
    $wrapper_attributes = get_block_wrapper_attributes( array(
        'class'             => 'dd-lightbox-trigger-container',
        'data-lightbox-url' => esc_url( $url ), // Ensure output is a safely escaped URL
        'style'             => 'cursor: pointer;',
    ) );

    ob_start();
    ?>
    <div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
        <?php 
        // Inject the inline SVG play button overlay if enabled
        if ( ! empty( $attributes['showPlayButton'] ) ) {
            echo '<div class="dd-lightbox-play-button">';
            echo '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
            echo '</div>';
        }
        
        echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped 
        ?>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Renders the frontend output for the Logo Marquee dynamic Gutenberg block.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    The saved InnerBlocks HTML content.
 * @return string HTML output for the block.
 */
function dd_render_marquee_block( $attributes, $content ) {
    if ( empty( trim( $content ) ) ) return '';
    $track_content = $content . $content;
    ob_start();
    ?>
    <div class="dd-marquee-container">
        <div class="dd-marquee-track">
            <?php echo $track_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

function test() {
    return 'https://thinklaser.theprogressteam.com/wp-content/uploads/2026/03/stock-photo-laser-cutting-machine-in-industrial-factory-producing-precision-metal-parts-2643491785@2x-600x410.png';
}   
add_shortcode('test', 'test');

/**
 * Processes shortcodes within GenerateBlocks image URLs.
 * * @param string $url The original URL.
 * @param array $attributes The block attributes.
 * @return string The filtered URL.
 * @author Digitally Disruptive - Donald Raymundo
 */
add_filter( 'generateblocks_dynamic_url_output', function( $url, $attributes ) {
    // Check if the URL contains a shortcode bracket
    if ( strpos( $url, '[' ) !== false ) {
        return do_shortcode( $url );
    }
    return $url;
}, 10, 2 );