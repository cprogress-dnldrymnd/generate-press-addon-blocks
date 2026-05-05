<?php
/**
 * Archive Pages Settings Interface
 * 
 * Registers a dynamic options page to manage custom archive descriptions.
 * Distributes the settings menu under each respective post type's admin menu.
 * 
 * Author: Digitally Disruptive - Donald Raymundo
 * Author URI: https://digitallydisruptive.co.uk/
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Retrieves all public post types that support archives (plus the default 'post' type).
 *
 * @return array Array of WP_Post_Type objects.
 */
function dd_get_archive_supported_post_types() {
    $post_types = get_post_types( [ 'public' => true ], 'objects' );
    $supported  = [];

    foreach ( $post_types as $post_type ) {
        // Include default 'post' (blog index) and any custom post types with archive support enabled.
        if ( 'post' === $post_type->name || $post_type->has_archive ) {
            $supported[] = $post_type;
        }
    }

    return $supported;
}

/**
 * Registers a submenu page for Archive Settings under each supported post type.
 *
 * @return void
 */
function dd_register_distributed_archive_settings_pages() {
    $post_types = dd_get_archive_supported_post_types();

    foreach ( $post_types as $post_type ) {
        // Determine the correct parent menu slug. 'post' uses edit.php, others use edit.php?post_type={slug}
        $parent_slug = ( 'post' === $post_type->name ) ? 'edit.php' : 'edit.php?post_type=' . $post_type->name;

        add_submenu_page(
            $parent_slug,
            $post_type->label . ' ' . __( 'Archive Settings', 'dd-gp-addon-blocks' ),
            __( 'Archive Settings', 'dd-gp-addon-blocks' ),
            'manage_options',
            'dd-archive-settings-' . $post_type->name,
            function() use ( $post_type ) {
                dd_render_individual_archive_settings_page( $post_type );
            }
        );
    }
}
add_action( 'admin_menu', 'dd_register_distributed_archive_settings_pages' );

/**
 * Registers the individual settings fields for each supported post type.
 *
 * @return void
 */
function dd_register_distributed_archive_settings() {
    $post_types = dd_get_archive_supported_post_types();
    
    foreach ( $post_types as $post_type ) {
        $option_name   = 'dd_archive_desc_' . $post_type->name;
        $setting_group = 'dd_archive_settings_group_' . $post_type->name;

        // Register the setting specific to this post type's page instance
        register_setting( $setting_group, $option_name );
    }
}
add_action( 'admin_init', 'dd_register_distributed_archive_settings' );

/**
 * Renders the HTML for an individual post type's Archive Settings page.
 *
 * @param WP_Post_Type $post_type The post type object being rendered.
 * @return void
 */
function dd_render_individual_archive_settings_page( $post_type ) {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    $option_name   = 'dd_archive_desc_' . $post_type->name;
    $setting_group = 'dd_archive_settings_group_' . $post_type->name;
    $value         = get_option( $option_name );
    ?>
    <div class="wrap">
        <h1><?php echo esc_html( $post_type->label . ' ' . __( 'Archive Settings', 'dd-gp-addon-blocks' ) ); ?></h1>
        <form method="post" action="options.php">
            <?php
            // Output the security fields and map them to the specific group
            settings_fields( $setting_group );
            ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="<?php echo esc_attr( $option_name ); ?>"><?php esc_html_e( 'Archive Description', 'dd-gp-addon-blocks' ); ?></label></th>
                    <td>
                        <textarea id="<?php echo esc_attr( $option_name ); ?>" name="<?php echo esc_attr( $option_name ); ?>" rows="5" class="large-text"><?php echo esc_textarea( $value ); ?></textarea>
                        <p class="description"><?php esc_html_e( 'Enter the description to display on the archive index for this specific post type.', 'dd-gp-addon-blocks' ); ?></p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
/**
 * Completely remove the default GeneratePress loop from the DOM on archives.
 * Ideal when replacing the entire content area with a custom block hook.
 */
add_filter( 'generate_has_default_loop', 'dd_remove_default_archive_loop' );
function dd_remove_default_archive_loop( $has_loop ) {
    if ( is_archive() || is_home() ) {
        return false; // Tells GP to skip rendering the primary content loop
    }
    return $has_loop;
}