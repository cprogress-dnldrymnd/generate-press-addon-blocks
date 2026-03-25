/**
 * Registers the 'dd/taxonomy-carousel' block for the Gutenberg Editor.
 * Exposes a purely dynamic block that queries taxonomies and relies on server-side rendering.
 */
( function( wp ) {
    const { registerBlockType } = wp.blocks;
    const { InspectorControls, useBlockProps } = wp.blockEditor;
    const { PanelBody, SelectControl, Spinner } = wp.components;
    const { createElement: el } = wp.element;
    const { useSelect } = wp.data;

    registerBlockType( 'dd/taxonomy-carousel', {
        title: 'Taxonomy Carousel',
        icon: 'networking',
        category: 'design',
        description: 'Displays a dynamic Splide.js carousel of terms from a selected taxonomy.',
        attributes: {
            taxonomy: {
                type: 'string',
                default: 'category'
            }
        },
        
        /**
         * Renders the editor interface. 
         * Fetches available taxonomies asynchronously and populates a SelectControl.
         *
         * @param {Object} props Block properties and attributes.
         * @return {Object} The rendered React element.
         */
        edit: function( props ) {
            const { attributes, setAttributes } = props;
            
            const blockProps = useBlockProps( {
                className: 'dd-taxonomy-carousel-editor',
                style: { border: '2px dashed #007cba', padding: '20px', backgroundColor: '#f9f9f9' }
            } );

            // Fetch public taxonomies using Core Data
            const taxonomies = useSelect( function( select ) {
                return select( 'core' ).getTaxonomies( { per_page: -1 } );
            }, [] );

            // Map the API response to SelectControl options
            let options = [];
            if ( taxonomies ) {
                options = taxonomies
                    .filter( tax => tax.visibility.show_ui ) // Only show UI-facing taxonomies
                    .map( function( tax ) {
                        return { label: tax.name, value: tax.slug };
                    } );
            }

            return el( wp.element.Fragment, null,
                el( InspectorControls, null,
                    el( PanelBody, { title: 'Carousel Source Settings', initialOpen: true },
                        ! taxonomies ? el( Spinner, null ) :
                        el( SelectControl, {
                            label: 'Select Taxonomy Source',
                            value: attributes.taxonomy,
                            options: options,
                            onChange: function( val ) { setAttributes( { taxonomy: val } ); },
                            help: 'The terms belonging to this taxonomy will dynamically populate the frontend carousel.'
                        } )
                    )
                ),
                el( 'div', blockProps,
                    el( 'div', { style: { fontWeight: 'bold', marginBottom: '8px' } }, 'Dynamic Taxonomy Carousel' ),
                    el( 'div', null, 'Currently targeting: ', el('code', null, attributes.taxonomy) ),
                    el( 'div', { style: { marginTop: '10px', fontSize: '12px', color: '#666' } }, 'Terms will be queried and rendered via Splide.js on the frontend, inheriting GB layout parity.' )
                )
            );
        },

        /**
         * Server-side rendered block. No HTML is saved to the post_content.
         */
        save: function() {
            return null;
        }
    } );
}( window.wp ) );