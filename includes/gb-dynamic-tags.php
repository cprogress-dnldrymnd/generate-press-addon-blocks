<?php
/**
 * GenerateBlocks Dynamic Content Integration
 * 
 * Handles custom dynamic data tag routing for GenerateBlocks Pro elements.
 * 
 * Author: Digitally Disruptive - Donald Raymundo
 * Author URI: https://digitallydisruptive.co.uk/
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Intercepts GenerateBlocks dynamic content to output a custom contextual title.
 * 
 * This function hooks into the 'generateblocks_dynamic_content_output' filter. 
 * It hijacks the 'post-meta' dynamic content type when the specific 'dd_archive_post_title'
 * key is invoked. It then evaluates the WordPress routing context to inject the correct
 * singular, archive, search, or 404 title, mapping the blog index explicitly to "News".
 *
 * @param string $content    The original generated HTML content from GenerateBlocks.
 * @param array  $attributes The parsed attributes of the current GenerateBlocks block.
 * @param array  $block      The full parsed block array payload.
 * @return string The contextually modified dynamic content string, or the original content if conditions are unmet.
 */
function dd_gb_dynamic_archive_post_title( $content, $attributes, $block ) {
    
    // Target only blocks configured to pull 'post-meta' with our specific custom key
    if ( 
        ! empty( $attributes['dynamicContentType'] ) && 
        'post-meta' === $attributes['dynamicContentType'] &&
        ! empty( $attributes['metaFieldName'] ) && 
        'dd_archive_post_title' === $attributes['metaFieldName']
    ) {
        $title = '';

        // Contextual Title Resolution
        if ( is_home() ) {
            $title = esc_html__( 'News', 'dd-gp-addon-blocks' );
        } elseif ( is_archive() ) {
            $title = get_the_archive_title();
        } elseif ( is_search() ) {
            $title = sprintf( esc_html__( 'Search Results for: %s', 'dd-gp-addon-blocks' ), get_search_query() );
        } elseif ( is_404() ) {
            $title = esc_html__( 'Page Not Found', 'dd-gp-addon-blocks' );
        } elseif ( is_singular() ) {
            $title = get_the_title();
        }

        // Return the generated title, overriding the default empty meta fetch
        if ( ! empty( $title ) ) {
            return wp_kses_post( $title );
        }
    }

    // Return unmodified content for all other blocks
    return $content;
}
add_filter( 'generateblocks_dynamic_content_output', 'dd_gb_dynamic_archive_post_title', 10, 3 );