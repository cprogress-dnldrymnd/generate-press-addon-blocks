<?php
/**
 * GenerateBlocks Dynamic Content Integration
 * 
 * Registers custom dynamic tags directly into the GenerateBlocks editor UI.
 * 
 * Author: Digitally Disruptive - Donald Raymundo
 * Author URI: https://digitallydisruptive.co.uk/
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Registers custom dynamic tags directly into the GenerateBlocks UI.
 *
 * @return void
 */
function dd_register_gb_dynamic_tags() {
    if ( ! class_exists( 'GenerateBlocks_Register_Dynamic_Tag' ) ) {
        return;
    }

    // 1. Register Archive/Post Title Tag
    new GenerateBlocks_Register_Dynamic_Tag( [
        'title'    => __( 'Archive/Post Title', 'dd-gp-addon-blocks' ),
        'tag'      => 'dd_archive_post_title',
        'type'     => 'post',
        'supports' => [ 'source', 'link' ],
        'return'   => 'dd_gb_dynamic_archive_post_title_callback',
    ] );

    // 2. Register Archive/Posts Excerpt Tag
    new GenerateBlocks_Register_Dynamic_Tag( [
        'title'    => __( 'Archive/Posts Excerpt', 'dd-gp-addon-blocks' ),
        'tag'      => 'dd_archive_post_excerpt',
        'type'     => 'post',
        'supports' => [ 'source' ], // Removed 'link' as excerpts generally shouldn't be fully wrapped in anchor tags
        'return'   => 'dd_gb_dynamic_archive_post_excerpt_callback',
    ] );
}
add_action( 'init', 'dd_register_gb_dynamic_tags' );

/**
 * Generates the frontend output for the Archive/Post Title tag.
 * 
 * @param array  $options  Parsed tag parameters.
 * @param object $block    The block data array.
 * @param object $instance Block instance object with context.
 * @return string          The finalized, contextual title string.
 */
function dd_gb_dynamic_archive_post_title_callback( $options, $block, $instance ) {
    $title = '';

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

    if ( class_exists( 'GenerateBlocks_Dynamic_Tag_Callbacks' ) && method_exists( 'GenerateBlocks_Dynamic_Tag_Callbacks', 'output' ) ) {
        return GenerateBlocks_Dynamic_Tag_Callbacks::output( $title, $options, $instance );
    }

    return wp_kses_post( $title );
}

/**
 * Generates the frontend output for the Archive/Posts Excerpt tag.
 * 
 * Pulls data from the custom Archive Settings options page for post type archives,
 * term descriptions for taxonomies, or standard excerpts for singular posts.
 *
 * @param array  $options  Parsed tag parameters.
 * @param object $block    The block data array.
 * @param object $instance Block instance object with context.
 * @return string          The finalized, contextual excerpt string.
 */
function dd_gb_dynamic_archive_post_excerpt_callback( $options, $block, $instance ) {
    $excerpt = '';

    if ( is_home() ) {
        // Fetch the custom setting mapped to the standard 'post' type
        $excerpt = get_option( 'dd_archive_desc_post' );
    } elseif ( is_post_type_archive() ) {
        // Fetch the custom setting for the active Custom Post Type
        $post_type = get_query_var( 'post_type' );
        if ( is_array( $post_type ) ) {
            $post_type = reset( $post_type ); // Handle array payloads safely
        }
        $excerpt = get_option( 'dd_archive_desc_' . $post_type );
    } elseif ( is_category() || is_tag() || is_tax() ) {
        // Fallback to native term description for taxonomy archives
        $excerpt = term_description();
    } elseif ( is_singular() ) {
        // Handle singular post excerpts natively
        $excerpt = has_excerpt() ? get_the_excerpt() : wp_trim_words( get_the_content(), 20 );
    }

    // Process through GenerateBlocks core formatting
    if ( class_exists( 'GenerateBlocks_Dynamic_Tag_Callbacks' ) && method_exists( 'GenerateBlocks_Dynamic_Tag_Callbacks', 'output' ) ) {
        return GenerateBlocks_Dynamic_Tag_Callbacks::output( wpautop( $excerpt ), $options, $instance );
    }

    return wp_kses_post( wpautop( $excerpt ) );
}