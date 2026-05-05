/**
 * File: blocks/title-block/title-block.js
 * Author: Digitally Disruptive - Donald Raymundo
 * Author URI: https://digitallydisruptive.co.uk/
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, BlockControls, AlignmentToolbar, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Registers the DD Dynamic Title Block.
 * 
 * Replaces the core Post Title and Archive Title blocks with a unified,
 * context-aware block powered by a PHP render_callback.
 */
registerBlockType( 'dd/title-block', {
    title: 'DD Dynamic Title',
    icon: 'heading',
    category: 'theme', // Assigned to 'theme' for template building semantics
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
     *
     * @param {Object} props Block properties and state dispatchers.
     * @return {JSX.Element} The Editor UI component.
     */
    edit: ( props ) => {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps();

        /**
         * Updates the block's text alignment attribute.
         *
         * @param {string} newAlignment The selected alignment value.
         * @return {void}
         */
        const onChangeAlignment = ( newAlignment ) => {
            setAttributes( { alignment: newAlignment === undefined ? 'left' : newAlignment } );
        };

        return (
            <>
                <BlockControls>
                    <AlignmentToolbar
                        value={ attributes.alignment }
                        onChange={ onChangeAlignment }
                    />
                </BlockControls>
                
                <InspectorControls>
                    <PanelBody title="Title Settings" initialOpen={ true }>
                        <SelectControl
                            label="HTML Tag"
                            value={ attributes.tagName }
                            options={ [
                                { label: 'H1', value: 'h1' },
                                { label: 'H2', value: 'h2' },
                                { label: 'H3', value: 'h3' },
                                { label: 'H4', value: 'h4' },
                                { label: 'H5', value: 'h5' },
                                { label: 'H6', value: 'h6' },
                            ] }
                            onChange={ ( value ) => setAttributes( { tagName: value } ) }
                            help="Select the heading level for SEO and structural hierarchy."
                        />
                    </PanelBody>
                </InspectorControls>

                <div { ...blockProps }>
                    {/* Issues an asynchronous REST API call to fetch the PHP output */}
                    <ServerSideRender
                        block="dd/title-block"
                        attributes={ attributes }
                    />
                </div>
            </>
        );
    },

    /**
     * Since this is a server-rendered dynamic block, the save function 
     * must explicitly return null to bypass frontend React serialization.
     *
     * @return {null} 
     */
    save: () => {
        return null; 
    },
} );