/**
 * Registers the 'dd/breadcrumbs' block.
 * A server-side dynamic block that renders a breadcrumb trail using the
 * current post type's plural label as the middle crumb.
 * All output is generated via the PHP render_callback.
 */
( function( wp ) {
    const { registerBlockType } = wp.blocks;
    const { InspectorControls, useBlockProps } = wp.blockEditor;
    const { PanelBody, ToggleControl } = wp.components;
    const { createElement: el } = wp.element;

    registerBlockType( 'dd/breadcrumbs', {
        title: 'Dynamic Breadcrumbs',
        icon: 'admin-links',
        category: 'design',
        description: 'Renders a breadcrumb trail with Home > Post Type > Current Page. The post type label is fetched dynamically.',
        attributes: {
            showHome: {
                type: 'boolean',
                default: true,
            },
            showPostType: {
                type: 'boolean',
                default: true,
            },
            linkPostType: {
                type: 'boolean',
                default: true,
            },
        },

        /**
         * Renders the editor preview.
         * This is a fully server-rendered block — the editor shows a labelled placeholder.
         *
         * @param {Object} props Block properties and attributes.
         * @return {Object} The rendered React element.
         */
        edit: function( props ) {
            const { attributes, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'dd-breadcrumbs-editor' } );

            return el( wp.element.Fragment, null,
                el( InspectorControls, null,
                    el( PanelBody, { title: 'Breadcrumb Settings', initialOpen: true },
                        el( ToggleControl, {
                            label: 'Show Home Crumb',
                            checked: attributes.showHome,
                            onChange: ( val ) => setAttributes( { showHome: val } ),
                            help: 'Display "Home" as the first item in the trail.'
                        } ),
                        el( ToggleControl, {
                            label: 'Show Post Type Crumb',
                            checked: attributes.showPostType,
                            onChange: ( val ) => setAttributes( { showPostType: val } ),
                            help: 'Display the post type archive as the middle crumb (e.g. "Laser Systems").'
                        } ),
                        el( ToggleControl, {
                            label: 'Link Post Type Crumb',
                            checked: attributes.linkPostType,
                            onChange: ( val ) => setAttributes( { linkPostType: val } ),
                            help: 'Make the post type crumb a clickable link to its archive page.'
                        } )
                    )
                ),
                el( 'div', blockProps,
                    el( 'div', { className: 'dd-editor-placeholder' },
                        el( 'span', { className: 'dashicons dashicons-admin-links' } ),
                        ' Dynamic Breadcrumbs — Home > [Post Type] > [Current Page]'
                    )
                )
            );
        },

        /**
         * Server-rendered dynamic block — save returns null.
         */
        save: function() {
            return null;
        }
    } );
}( window.wp ) );