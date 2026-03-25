/**
 * Registers the 'dd/lightbox-container' block.
 * Provides a structural wrapper with InnerBlocks for layout design.
 * Acts as a Dynamic Block, passing attributes to PHP for server-side dynamic URL resolution,
 * optional play button rendering, and media preloading optimization.
 */
( function( wp ) {
    const { registerBlockType } = wp.blocks;
    const { InnerBlocks, InspectorControls, useBlockProps } = wp.blockEditor;
    const { PanelBody, TextControl, ToggleControl, Notice } = wp.components;
    const { createElement: el } = wp.element;

    registerBlockType( 'dd/lightbox-container', {
        title: 'Lightbox Container',
        icon: 'slides',
        category: 'design',
        description: 'A clickable container that opens dynamic media in a lightbox.',
        attributes: {
            mediaUrl: {
                type: 'string',
                default: ''
            },
            isDynamic: {
                type: 'boolean',
                default: false
            },
            metaKey: {
                type: 'string',
                default: ''
            },
            showPlayButton: {
                type: 'boolean',
                default: false
            },
            preloadMedia: {
                type: 'boolean',
                default: false
            }
        },
        
        /**
         * Renders the editor interface.
         * Outputs InspectorControls for dynamic routing, visual toggles, performance settings,
         * and InnerBlocks for the structural design.
         *
         * @param {Object} props Block properties and attributes.
         * @return {Object} The rendered React element.
         */
        edit: function( props ) {
            const { attributes, setAttributes } = props;
            
            const blockProps = useBlockProps( {
                className: 'dd-lightbox-container-editor',
                style: { border: '2px dashed #007cba', padding: '15px', position: 'relative' }
            } );

            return el( wp.element.Fragment, null,
                el( InspectorControls, null,
                    el( PanelBody, { title: 'Lightbox Settings', initialOpen: true },
                        el( ToggleControl, {
                            label: 'Show Play Button Overlay',
                            checked: attributes.showPlayButton,
                            onChange: ( val ) => setAttributes( { showPlayButton: val } ),
                            help: 'Displays a centered play icon over the container.'
                        } ),
                        el( ToggleControl, {
                            label: 'Use Dynamic Data (Post Meta)',
                            checked: attributes.isDynamic,
                            onChange: ( val ) => setAttributes( { isDynamic: val } ),
                            help: 'Enable to fetch the URL dynamically from a custom field.'
                        } ),
                        
                        // Conditionally render the input fields based on the toggle state
                        attributes.isDynamic ? 
                            el( TextControl, {
                                label: 'Post Meta Key',
                                value: attributes.metaKey,
                                onChange: ( val ) => setAttributes( { metaKey: val } ),
                                help: 'Enter the custom field key containing the media URL (e.g., acf_video_url).'
                            } ) 
                        : 
                            el( TextControl, {
                                label: 'Media URL or Shortcode',
                                value: attributes.mediaUrl,
                                onChange: ( val ) => setAttributes( { mediaUrl: val } ),
                                help: 'Paste an image link, YouTube URL, or a dynamic shortcode.'
                            } )
                    ),
                    el( PanelBody, { title: 'Performance', initialOpen: false },
                        el( ToggleControl, {
                            label: 'Preload Media',
                            checked: attributes.preloadMedia,
                            onChange: ( val ) => setAttributes( { preloadMedia: val } ),
                            help: 'Instructs the browser to fetch media or establish server connections early for instant loading.'
                        } ),
                        attributes.preloadMedia ? 
                            el( Notice, { isDismissible: false, status: 'warning' }, 
                                'Use sparingly. Preloading multiple large videos on a single page can degrade initial load speed.' 
                            ) 
                        : null
                    )
                ),
                el( 'div', blockProps,
                    // Editor visual indicator
                    el( 'div', { style: { position: 'absolute', top: '-10px', left: '10px', background: '#007cba', color: '#fff', padding: '2px 8px', fontSize: '11px', borderRadius: '3px', zIndex: 10 } }, 'Lightbox Container (Dynamic)' ),
                    
                    // Render a visual SVG placeholder for the play button in the editor if enabled
                    attributes.showPlayButton ? 
                        el( 'div', { className: 'dd-lightbox-play-button', style: { pointerEvents: 'none' } },
                            el( 'svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg', fill: 'currentColor', width: '28', height: '28' },
                                el( 'path', { d: 'M8 5v14l11-7z' } )
                            )
                        ) 
                    : null,

                    el( InnerBlocks, {
                        renderAppender: InnerBlocks.ButtonBlockAppender
                    } )
                )
            );
        },

        /**
         * Saves the structural layout of the InnerBlocks.
         * All dynamic wrappers, resource hints, and SVG elements are handled via the PHP render_callback.
         *
         * @param {Object} props Block properties and attributes.
         * @return {Object} The rendered React element for the database.
         */
        save: function() {
            return el( InnerBlocks.Content, null );
        }
    } );
}( window.wp ) );