/**
 * Registers the 'dd/marquee' block for the Gutenberg Editor.
 * Enforces an InnerBlocks structure that accepts core image/typography and GenerateBlocks image/headline blocks.
 */
(function (wp) {
    const { registerBlockType } = wp.blocks;
    const { InnerBlocks, useBlockProps } = wp.blockEditor;
    const { createElement: el } = wp.element;

    registerBlockType('dd/marquee', {
        title: 'Marquee (Infinite)',
        icon: 'images-alt2',
        category: 'design',
        description: 'Add an infinitely scrolling row of logos or text.',

        /**
         * Renders the editor interface for the marquee block.
         * Sets up the InnerBlocks component with restricted block types to enforce design consistency.
         * Styling is now handled via the registered editor_style block attribute.
         * * @param {Object} props The block properties passed by the Gutenberg editor.
         * @returns {Object} The rendered WordPress element for the editor.
         */
        edit: function (props) {
            // Retrieve default block properties without inline layout styles
            const blockProps = useBlockProps();

            return el('div', blockProps,
                el(InnerBlocks, {
                    allowedBlocks: [
                        'generateblocks/text',
                    ],
                    orientation: 'horizontal',
                    renderAppender: InnerBlocks.ButtonBlockAppender
                })
            );
        },

        /**
         * Saves the structural layout of the InnerBlocks to the database.
         * The dynamic duplication and wrapper classes are handled via the PHP render_callback.
         * * @returns {Object} The serialized InnerBlocks content for the frontend.
         */
        save: function () {
            return el(InnerBlocks.Content, null);
        }
    });
}(window.wp));