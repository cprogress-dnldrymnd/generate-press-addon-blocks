<?php

/**
 * GenerateBlocks Dynamic Content Integration
 * 
 * Registers custom dynamic tags directly into the GenerateBlocks editor UI.
 * 
 * Author: Digitally Disruptive - Donald Raymundo
 * Author URI: https://digitallydisruptive.co.uk/
 */

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Registers the custom dynamic tag directly into the GenerateBlocks UI.
 */
function dd_register_gb_dynamic_tags()
{
    // Ensure the GenerateBlocks dynamic tag class exists before executing
    if (! class_exists('GenerateBlocks_Register_Dynamic_Tag')) {
        return;
    }

    // Register the new dynamic tag
    new GenerateBlocks_Register_Dynamic_Tag([
        'title'    => __('Archive/Post Title', 'dd-gp-addon-blocks'), // The human-readable name shown in the selector UI.
        'tag'      => 'dd_archive_post_title',                          // The internal tag identifier.
        'type'     => 'elements',
        'supports' => [],            // Groups the tag in the interface.
        'return'   => 'dd_gb_dynamic_archive_post_title_callback',      // The PHP callback that generates the output.
    ]);
}
add_action('init', 'dd_register_gb_dynamic_tags');

/**
 * Generates the frontend output for the Archive/Post Title tag.
 * 
 * @param array  $options  Parsed tag parameters.
 * @param object $block    The block data array.
 * @param object $instance Block instance object with context.
 * @return string          The finalized, contextual title string.
 */
function dd_gb_dynamic_archive_post_title_callback($options, $block, $instance)
{
    $title = '';

    // Contextual Title Resolution
    if (is_home()) {
        $title = esc_html__('News', 'dd-gp-addon-blocks');
    } elseif (is_archive()) {
        $title = get_the_archive_title();
    } elseif (is_search()) {
        $title = sprintf(esc_html__('Search Results for: %s', 'dd-gp-addon-blocks'), get_search_query());
    } elseif (is_404()) {
        $title = esc_html__('Page Not Found', 'dd-gp-addon-blocks');
    } elseif (is_singular()) {
        $title = get_the_title();
    }

    // Process the title through GenerateBlocks' built-in helper function to support
    // native UI transformations like truncation, text cases, and link wrappers.
    if (class_exists('GenerateBlocks_Dynamic_Tag_Callbacks') && method_exists('GenerateBlocks_Dynamic_Tag_Callbacks', 'output')) {
        return GenerateBlocks_Dynamic_Tag_Callbacks::output($title, $options, $instance);
    }

    return wp_kses_post($title);
}
