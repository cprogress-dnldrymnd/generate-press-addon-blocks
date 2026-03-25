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
         * Renders the editor interface. 
         * Styling is now handled via the registered editor_style block attribute.
         */
        edit: function (props) {
            // Retrieve default block properties without inline inline layout styles
            const blockProps = useBlockProps();

            return el('div', blockProps,
                el(InnerBlocks, {
                    // Added generateblocks/image and generateblocks/headline
                    allowedBlocks: [
                        'generateblocks/image',
                        'generateblocks/text',
                        'generateblocks/headline',
                    ],
                    orientation: 'horizontal',
                    renderAppender: InnerBlocks.ButtonBlockAppender
                })
            );
        },

        /**
         * Saves the structural layout of the InnerBlocks.
         * The dynamic duplication and wrapper classes are handled via the PHP render_callback.
         */
        save: function () {
            return el(InnerBlocks.Content, null);
        }
    });
}(window.wp));