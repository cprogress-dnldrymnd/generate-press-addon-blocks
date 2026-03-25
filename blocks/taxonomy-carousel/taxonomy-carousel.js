/**
 * Registers the 'dd/taxonomy-carousel' block.
 * Provides a dynamic interface to query taxonomies and configure Swiper.js slide parameters.
 */
( function( wp ) {
    const { registerBlockType } = wp.blocks;
    const { InspectorControls, useBlockProps } = wp.blockEditor;
    const { PanelBody, SelectControl, ToggleControl, TextControl, RangeControl, Spinner } = wp.components;
    const { useSelect } = wp.data;
    const { createElement: el } = wp.element;

    registerBlockType( 'dd/taxonomy-carousel', {
        title: 'Taxonomy Carousel',
        icon: 'columns',
        category: 'design',
        description: 'Display taxonomy terms in an interactive Swiper slider.',
        attributes: {
            taxonomy: { type: 'string', default: 'category' },
            displayName: { type: 'boolean', default: true },
            displayDescription: { type: 'boolean', default: false },
            metaKey: { type: 'string', default: '' },
            slidesPerView: { type: 'number', default: 3 },
            spaceBetween: { type: 'number', default: 20 },
            autoplay: { type: 'boolean', default: false },
            loop: { type: 'boolean', default: true },
            pagination: { type: 'boolean', default: true },
            navigation: { type: 'boolean', default: false },
        },
        
        /**
         * Renders the editor interface.
         * Fetches taxonomies dynamically and outputs InspectorControls for Swiper routing.
         *
         * @param {Object} props Block properties and attributes.
         * @return {Object} The rendered React element.
         */
        edit: function( props ) {
            const { attributes, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'dd-taxonomy-carousel-editor' } );

            // Fetch available taxonomies from the WordPress REST API
            const taxonomies = useSelect( ( select ) => {
                const { getTaxonomies } = select( 'core' );
                return getTaxonomies( { per_page: -1 } );
            }, [] );

            const taxonomyOptions = taxonomies ? taxonomies.map( tax => ( { label: tax.name, value: tax.slug } ) ) : [];

            return el( wp.element.Fragment, null,
                el( InspectorControls, null,
                    el( PanelBody, { title: 'Data Source', initialOpen: true },
                        ! taxonomies ? el( Spinner ) : el( SelectControl, {
                            label: 'Select Taxonomy',
                            value: attributes.taxonomy,
                            options: taxonomyOptions,
                            onChange: ( val ) => setAttributes( { taxonomy: val } )
                        } ),
                        el( ToggleControl, {
                            label: 'Display Term Name',
                            checked: attributes.displayName,
                            onChange: ( val ) => setAttributes( { displayName: val } )
                        } ),
                        el( ToggleControl, {
                            label: 'Display Term Description',
                            checked: attributes.displayDescription,
                            onChange: ( val ) => setAttributes( { displayDescription: val } )
                        } ),
                        el( TextControl, {
                            label: 'Image Term Meta Key (Optional)',
                            value: attributes.metaKey,
                            onChange: ( val ) => setAttributes( { metaKey: val } ),
                            help: 'Key of the custom field to retrieve the image URL or Attachment ID.'
                        } )
                    ),
                    el( PanelBody, { title: 'Swiper Settings', initialOpen: false },
                        el( RangeControl, {
                            label: 'Slides Per View',
                            value: attributes.slidesPerView,
                            onChange: ( val ) => setAttributes( { slidesPerView: val } ),
                            min: 1, max: 6
                        } ),
                        el( RangeControl, {
                            label: 'Space Between (px)',
                            value: attributes.spaceBetween,
                            onChange: ( val ) => setAttributes( { spaceBetween: val } ),
                            min: 0, max: 100
                        } ),
                        el( ToggleControl, {
                            label: 'Enable Autoplay',
                            checked: attributes.autoplay,
                            onChange: ( val ) => setAttributes( { autoplay: val } )
                        } ),
                        el( ToggleControl, {
                            label: 'Enable Infinite Loop',
                            checked: attributes.loop,
                            onChange: ( val ) => setAttributes( { loop: val } )
                        } ),
                        el( ToggleControl, {
                            label: 'Show Pagination Dots',
                            checked: attributes.pagination,
                            onChange: ( val ) => setAttributes( { pagination: val } )
                        } ),
                        el( ToggleControl, {
                            label: 'Show Navigation Arrows',
                            checked: attributes.navigation,
                            onChange: ( val ) => setAttributes( { navigation: val } )
                        } )
                    )
                ),
                el( 'div', blockProps,
                    el( 'div', { className: 'dd-editor-placeholder' },
                        el( 'span', { className: 'dashicons dashicons-columns' } ),
                        ` Taxonomy Carousel: [${attributes.taxonomy}]`
                    )
                )
            );
        },

        /**
         * Server-rendered dynamic block requires a null save function.
         */
        save: function() {
            return null;
        }
    } );
}( window.wp ) );