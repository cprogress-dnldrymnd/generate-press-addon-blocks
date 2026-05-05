<?php
/**
 * Archive Pages Settings Interface
 * 
 * Registers a dynamic options page to manage custom archive descriptions 
 * for all public post types.
 * 
 * Author: Digitally Disruptive - Donald Raymundo
 * Author URI: https://digitallydisruptive.co.uk/
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Registers the Archive Descriptions settings page under the standard Settings menu.
 *
 * @return void
 */
function dd_register_archive_settings_page() {
    add_options_page(
        __( 'Archive Descriptions', 'dd-gp-addon-blocks' ),
        __( 'Archive Descriptions', 'dd-gp-addon-blocks' ),
        'manage_options',
        'dd-archive-descriptions',
        'dd_render_archive_settings_page'
    );
}
add_action( 'admin_menu', 'dd_register_archive_settings_page' );

/**
 * Registers the settings group and dynamically creates a setting field 
 * for every public post type available in the WordPress instance.
 *
 * @return void
 */
function dd_register_archive_settings() {
    $post_types = get_post_types( [ 'public' => true ], 'objects' );
    
    foreach ( $post_types as $post_type ) {
        register_setting( 
            'dd_archive_descriptions_group', 
            'dd_archive_desc_' . $post_type->name 
        );
    }
}
add_action( 'admin_init', 'dd_register_archive_settings' );

/**
 * Renders the HTML for the Archive Descriptions settings page.
 * Iterates through public post types to construct a settings table.
 *
 * @return void
 */
function dd_render_archive_settings_page() {
    // Check user capabilities
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Archive Pages Descriptions', 'dd-gp-addon-blocks' ); ?></h1>
        <form method="post" action="options.php">
            <?php
            settings_fields( 'dd_archive_descriptions_group' );
            $post_types = get_post_types( [ 'public' => true ], 'objects' );
            
            echo '<table class="form-table" role="presentation">';
            foreach ( $post_types as $post_type ) {
                $option_name = 'dd_archive_desc_' . $post_type->name;
                $value       = get_option( $option_name );
                
                echo '<tr>';
                echo '<th scope="row"><label for="' . esc_attr( $option_name ) . '">' . esc_html( $post_type->label ) . ' ' . esc_html__( 'Archive', 'dd-gp-addon-blocks' ) . '</label></th>';
                echo '<td><textarea id="' . esc_attr( $option_name ) . '" name="' . esc_attr( $option_name ) . '" rows="4" class="large-text">' . esc_textarea( $value ) . '</textarea></td>';
                echo '</tr>';
            }
            echo '</table>';
            
            submit_button();
            ?>
        </form>
    </div>
    <?php
}