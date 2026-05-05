/**
 * File: blocks/title-block/title-block.js
 * Author: Digitally Disruptive - Donald Raymundo
 * Author URI: https://digitallydisruptive.co.uk/
 */

( function( wp ) {
    const { registerBlockType } = wp.blocks;
    const { useBlockProps, BlockControls, AlignmentToolbar, InspectorControls } = wp.blockEditor;
    const { PanelBody, SelectControl } = wp.components;
    const { createElement: el, Fragment } = wp.element;
    const ServerSideRender = wp.serverSideRender;

    /**
     * Registers the DD Dynamic Title Block natively without JSX.
     * 
     * Replaces the core Post Title and Archive Title blocks with a unified,
     * context-aware block powered by a PHP render_callback.
     */
    registerBlockType( 'dd/title-block', {
        title: 'Dynamic Title',
        icon: 'heading',
        category: 'theme',
        description: 'Dynamically displays the current post, page, or archive title based on routing context.',
        attributes: {
            alignment: {
                type: 'string',
                default: 'left',
            },
            tagName: {
                type: 'string',
                default: 'h1',
            }
        },

        /**
         * Editor interface utilizing ServerSideRender for live accurate previews.
         * Constructed using vanilla JS wp.element.createElement.
         *
         * @param {Object} props Block properties and state dispatchers.
         * @return {Object} The rendered React element.
         */
        edit: function( props ) {
            const { attributes, setAttributes } = props;
            const blockProps = useBlockProps();

            /**
             * Updates the block's text alignment attribute.
             *
             * @param {string} newAlignment The selected alignment value.
             * @return {void}
             */
            const onChangeAlignment = function( newAlignment ) {
                setAttributes( { alignment: newAlignment === undefined ? 'left' : newAlignment } );
            };

            return el( Fragment, null,
                el( BlockControls, null,
                    el( AlignmentToolbar, {
                        value: attributes.alignment,
                        onChange: onChangeAlignment
                    } )
                ),
                
                el( InspectorControls, null,
                    el( PanelBody, { title: 'Title Settings', initialOpen: true },
                        el( SelectControl, {
                            label: 'HTML Tag',
                            value: attributes.tagName,
                            options: [
                                { label: 'H1', value: 'h1' },
                                { label: 'H2', value: 'h2' },
                                { label: 'H3', value: 'h3' },
                                { label: 'H4', value: 'h4' },
                                { label: 'H5', value: 'h5' },
                                { label: 'H6', value: 'h6' },
                            ],
                            onChange: function( value ) { 
                                setAttributes( { tagName: value } ); 
                            },
                            help: 'Select the heading level for SEO and structural hierarchy.'
                        } )
                    )
                ),

                el( 'div', blockProps,
                    /* Issues an asynchronous REST API call to fetch the PHP output */
                    el( ServerSideRender, {
                        block: 'dd/title-block',
                        attributes: attributes
                    } )
                )
            );
        },

        /**
         * Since this is a server-rendered dynamic block, the save function 
         * must explicitly return null to bypass frontend React serialization.
         *
         * @return {null} 
         */
        save: function() {
            return null; 
        },
    } );
}( window.wp ) );