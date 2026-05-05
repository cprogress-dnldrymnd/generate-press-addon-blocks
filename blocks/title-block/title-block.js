/**
 * File: blocks/title-block/title-block.js
 * Author: Digitally Disruptive - Donald Raymundo
 * Author URI: https://digitallydisruptive.co.uk/
 */

import { registerBlockType } from '@wordpress/blocks';
import { RichText, useBlockProps, BlockControls, AlignmentToolbar } from '@wordpress/block-editor';

/**
 * Registers the DD Title Block.
 * 
 * Provides a highly customizable heading block independent of standard core headings,
 * allowing for specific addon styling and alignment controls.
 */
registerBlockType( 'dd/title-block', {
    title: 'DD Title Block',
    icon: 'heading',
    category: 'design',
    attributes: {
        content: {
            type: 'string',
            source: 'html',
            selector: 'h2',
            default: '',
        },
        alignment: {
            type: 'string',
            default: 'left',
        },
    },

    /**
     * Defines the block's behavior within the Gutenberg editor.
     *
     * @param {Object} props The block properties including attributes and setAttributes function.
     * @return {JSX.Element} The rendered editor interface for the block.
     */
    edit: ( props ) => {
        const { attributes, setAttributes } = props;
        const blockProps = useBlockProps( {
            className: `has-text-align-${ attributes.alignment } dd-custom-title-block`,
        } );

        /**
         * Updates the block's text content attribute.
         *
         * @param {string} newContent The updated HTML string from the RichText component.
         * @return {void}
         */
        const onChangeContent = ( newContent ) => {
            setAttributes( { content: newContent } );
        };

        /**
         * Updates the block's text alignment attribute.
         *
         * @param {string} newAlignment The selected alignment value (left, center, right).
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
                <RichText
                    { ...blockProps }
                    tagName="h2"
                    value={ attributes.content }
                    onChange={ onChangeContent }
                    placeholder="Enter Title..."
                />
            </>
        );
    },

    /**
     * Defines the sanitized HTML output for the frontend.
     *
     * @param {Object} props The block properties containing the final attributes.
     * @return {JSX.Element} The immutable HTML structure saved to the post content.
     */
    save: ( props ) => {
        const { attributes } = props;
        const blockProps = useBlockProps.save( {
            className: `has-text-align-${ attributes.alignment } dd-custom-title-block`,
        } );

        return (
            <RichText.Content
                { ...blockProps }
                tagName="h2"
                value={ attributes.content }
            />
        );
    },
} );