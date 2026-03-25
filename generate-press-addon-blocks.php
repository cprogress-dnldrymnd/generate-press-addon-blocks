<?php

/**
 * Plugin Name: GeneratePress Add-on Blocks
 * Description: A scalable collection of custom, performance-optimized Gutenberg blocks and extensions for GeneratePress.
 * Version: 2.0.1
 * Author: Digitally Disruptive - Donald Raymundo
 * Author URI: https://digitallydisruptive.co.uk/
 * Text Domain: dd-gp-addon-blocks
 */

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}
define('GeneratePress_Addon_Version', '2.0.1');
/**
 * Centralized block registry for Generate Press Add-on Blocks.
 * Iterates through a configuration array to dynamically register block scripts, styles, and behaviors.
 * Integrates external dependencies like Swiper.js for advanced interactive blocks.
 *
 * @return void
 */
function dd_gp_register_addon_blocks()
{
    // Register Swiper.js globally for blocks that require it
    wp_register_script('swiper-js', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', array(), '11.0.0', true);
    wp_register_style('swiper-css', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css', array(), '11.0.0');

    $blocks = array(
        'marquee' => array(
            'script_file'       => 'blocks/marquee-block-v2/marquee-block.js',
            'style_file'        => 'blocks/marquee-block-v2/marquee-block.css',
            'editor_style_file' => 'blocks/marquee-block-v2/marquee-block-editor.css',
            'render_callback'   => 'dd_render_marquee_block',
        ),
        'lightbox-container' => array(
            'script_file'       => 'blocks/lightbox-container-block/lightbox-container.js',
            'style_file'        => 'blocks/lightbox-container-block/lightbox-container.css',
            'view_script_file'  => 'blocks/lightbox-container-block/lightbox-frontend.js',
            'render_callback'   => 'dd_render_lightbox_container_block',
        ),
        'taxonomy-carousel' => array(
            'script_file'       => 'blocks/taxonomy-carousel/taxonomy-carousel.js',
            'style_file'        => 'blocks/taxonomy-carousel/taxonomy-carousel.css',
            'editor_style_file' => 'blocks/taxonomy-carousel/taxonomy-carousel-editor.css',
            'view_script_file'  => 'blocks/taxonomy-carousel/taxonomy-carousel-frontend.js',
            'render_callback'   => 'dd_render_taxonomy_carousel_block',
            'style_deps'        => array('swiper-css'),
            'view_script_deps'  => array('swiper-js'),
        ),
    );

    foreach ($blocks as $slug => $config) {
        $script_handle       = "dd-{$slug}-script";
        $style_handle        = "dd-{$slug}-style";
        $editor_style_handle = "dd-{$slug}-editor-style";
        $view_script_handle  = "dd-{$slug}-view-script";

        $block_args = array(
            'api_version'   => 2,
        );

        // Register and assign the Editor Script
        wp_register_script($script_handle, plugins_url($config['script_file'], __FILE__), array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-data'), GeneratePress_Addon_Version, true);
        $block_args['editor_script'] = $script_handle;

        // Register and assign the Frontend/Shared Style
        if (! empty($config['style_file'])) {
            $style_deps = isset($config['style_deps']) ? $config['style_deps'] : array();
            wp_register_style($style_handle, plugins_url($config['style_file'], __FILE__), $style_deps, GeneratePress_Addon_Version);
            $block_args['style'] = $style_handle;
        }

        // Register and assign the Editor-Specific Style
        if (! empty($config['editor_style_file'])) {
            wp_register_style($editor_style_handle, plugins_url($config['editor_style_file'], __FILE__), array(), GeneratePress_Addon_Version);
            $block_args['editor_style'] = $editor_style_handle;
        }

        // Register and assign the Frontend View Script
        if (! empty($config['view_script_file'])) {
            $view_script_deps = isset($config['view_script_deps']) ? $config['view_script_deps'] : array();
            wp_register_script($view_script_handle, plugins_url($config['view_script_file'], __FILE__), $view_script_deps, GeneratePress_Addon_Version, true);
            $block_args['view_script'] = $view_script_handle;
        }

        // Assign PHP Render Callback if defined
        if (! empty($config['render_callback'])) {
            $block_args['render_callback'] = $config['render_callback'];
        }

        register_block_type("dd/{$slug}", $block_args);
    }
}
add_action('init', 'dd_gp_register_addon_blocks');

/**
 * Renders the frontend output for the Taxonomy Terms Carousel block.
 * Dynamically queries taxonomy terms, resolves associated meta fields strictly as images,
 * and constructs the DOM structure required by Swiper.js.
 * * Applies default attributes fallback since Gutenberg JS defaults are not automatically 
 * injected into server-side callbacks unless explicitly saved in the editor.
 *
 * @param array  $attributes Block attributes configured in the editor.
 * @param string $content    The saved InnerBlocks HTML content (empty for this dynamic block).
 * @return string HTML output for the Swiper carousel.
 */
function dd_render_taxonomy_carousel_block($attributes, $content)
{
    $defaults = array(
        'taxonomy'           => 'category',
        'showEmpty'          => false,
        'excludeTerms'       => '',
        'displayName'        => true,
        'displayDescription' => false,
        'metaKey'            => '',
        'slidesPerView'      => 3,
        'spaceBetween'       => 20,
        'autoplay'           => false,
        'loop'               => true,
        'pagination'         => true,
        'navigation'         => false,
    );
    $attributes = wp_parse_args($attributes, $defaults);

    $taxonomy = $attributes['taxonomy'];

    // Process comma-separated exclusion IDs securely into an array of integers
    $exclude_ids = array();
    if (! empty($attributes['excludeTerms'])) {
        $exclude_ids = array_map('intval', array_map('trim', explode(',', $attributes['excludeTerms'])));
    }

    $terms = get_terms(array(
        'taxonomy'   => $taxonomy,
        'hide_empty' => ! $attributes['showEmpty'], // Inverts logic: if showEmpty is true, hide_empty becomes false
        'exclude'    => $exclude_ids,
    ));

    if (is_wp_error($terms) || empty($terms)) {
        return '<p>No terms found for taxonomy: ' . esc_html($taxonomy) . '</p>';
    }

    $wrapper_attributes = get_block_wrapper_attributes(array(
        'class'                => 'dd-taxonomy-carousel swiper',
        'data-slides-per-view' => esc_attr($attributes['slidesPerView']),
        'data-space-between'   => esc_attr($attributes['spaceBetween']),
        'data-autoplay'        => esc_attr($attributes['autoplay'] ? 'true' : 'false'),
        'data-loop'            => esc_attr($attributes['loop'] ? 'true' : 'false'),
        'data-pagination'      => esc_attr($attributes['pagination'] ? 'true' : 'false'),
        'data-navigation'      => esc_attr($attributes['navigation'] ? 'true' : 'false'),
    ));

    ob_start();
?>
    <div class="swiper-holder">
        <div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped 
                ?>>
            <div class="swiper-wrapper">
                <?php foreach ($terms as $term) : ?>
                    <div class="swiper-slide dd-term-slide">
                        <div class="dd-term-content">

                            <?php
                            // Process and render term meta strictly as an image
                            if (! empty($attributes['metaKey'])) {
                                $meta_value = get_term_meta($term->term_id, $attributes['metaKey'], true);

                                if ($meta_value) {
                                    // Resolves numeric attachment IDs to URLs or accepts direct URLs
                                    $img_src = is_numeric($meta_value) ? wp_get_attachment_url((int) $meta_value) : $meta_value;

                                    if ($img_src) {
                                        echo '<div class="dd-term-meta-image"><img src="' . esc_url($img_src) . '" alt="' . esc_attr($term->name) . '" /></div>';
                                    }
                                }
                            }
                            ?>

                            <?php if ($attributes['displayName']) : ?>
                                <h3 class="dd-term-name"><a href="<?php echo esc_url(get_term_link($term)); ?>"><?php echo esc_html($term->name); ?></a></h3>
                            <?php endif; ?>

                            <?php if ($attributes['displayDescription'] && ! empty($term->description)) : ?>
                                <div class="dd-term-description"><?php echo wp_kses_post(wpautop($term->description)); ?></div>
                            <?php endif; ?>

                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <?php if ($attributes['pagination']) : ?>
                <div class="swiper-pagination"></div>
            <?php endif; ?>
        </div>

        <?php if ($attributes['navigation']) : ?>
            <button class="gb-carousel-control gbp-carousel-controls gbp-carousel-controls__button gbp-carousel--control__previous gb-carousel-control--previous">
                <span class="gb-carousel-control-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
                        <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                    </svg>
                </span>
            </button>
            <button aria-label="Next slide" class="gb-carousel-control gbp-carousel-controls gbp-carousel-controls__button gbp-carousel--control__next gb-carousel-control--next">
                <span class="gb-carousel-control-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
                        <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                    </svg>
                </span>
            </button>
        <?php endif; ?>
    </div>
<?php
    return ob_get_clean();
}

/**
 * Renders the frontend output for the Lightbox Container dynamic Gutenberg block.
 * Resolves dynamic data (Post Meta) or executes shortcodes to generate the media URL,
 * and conditionally injects an inline SVG play button overlay based on block attributes.
 *
 * @param array  $attributes Block attributes from the editor.
 * @param string $content    The saved InnerBlocks HTML content.
 * @return string HTML output for the block wrapper and its inner content.
 */
function dd_render_lightbox_container_block($attributes, $content)
{
    if (empty(trim($content))) {
        return '';
    }

    $url = '';

    // 1. If Dynamic Data is enabled, fetch directly from the WordPress post meta.
    if (! empty($attributes['isDynamic']) && ! empty($attributes['metaKey'])) {
        $post_id = get_the_ID();
        if ($post_id) {
            $url = get_post_meta($post_id, $attributes['metaKey'], true);
        }
    }
    // 2. Otherwise, fall back to the standard URL field, executing any GenerateBlocks/custom shortcodes placed inside.
    else if (! empty($attributes['mediaUrl'])) {
        $url = do_shortcode($attributes['mediaUrl']);
    }

    // Build the container attributes securely
    $wrapper_attributes = get_block_wrapper_attributes(array(
        'class'             => 'dd-lightbox-trigger-container',
        'data-lightbox-url' => esc_url($url), // Ensure output is a safely escaped URL
        'style'             => 'cursor: pointer;',
    ));

    ob_start();
?>
    <div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped 
            ?>>
        <?php
        // Inject the inline SVG play button overlay if enabled
        if (! empty($attributes['showPlayButton'])) {
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
 * Renders the frontend output for the Marquee dynamic Gutenberg block.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    The saved InnerBlocks HTML content.
 * @return string HTML output for the block.
 */
function dd_render_marquee_block($attributes, $content)
{
    if (empty(trim($content))) return '';
    $track_content = $content . $content;
    ob_start();
?>
    <div class="dd-marquee-container">
        <div class="dd-marquee-track">
            <?php echo $track_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped 
            ?>
        </div>
    </div>
<?php
    return ob_get_clean();
}
