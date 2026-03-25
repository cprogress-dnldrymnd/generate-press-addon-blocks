/**
 * Registers the 'dd/marquee' block for the Gutenberg Editor.
 * Enforces an InnerBlocks structure that accepts specific GenerateBlocks elements.
 *
 * @param {Object} wp - The global WordPress object containing block APIs.
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
         * Utilizes InnerBlocks to manage nested child blocks (Image and Headline).
         * * @param {Object} props - Block properties passed by the Gutenberg editor.
         * @returns {Object} React element representing the block editor interface.
         */
        edit: function (props) {
            // Retrieve default block properties without inline layout styles
            const blockProps = useBlockProps();

            return el('div', blockProps,
                el(InnerBlocks, {
                    // Restrict inner blocks to GenerateBlocks Image and Headline
                    allowedBlocks: [
                        'generateblocks/image',
                        'generateblocks/headline'
                    ],
                    // Auto-insert a GenerateBlocks Image when the Marquee is first added
                    template: [
                        ['generateblocks/image', {}]
                    ],
                    orientation: 'horizontal',
                    // Revert to default appender to fix the standalone button issue
                    renderAppender: InnerBlocks.DefaultBlockAppender
                })
            );
        },

        /**
         * Saves the structural layout of the InnerBlocks.
         * The dynamic duplication and wrapper classes are handled via the PHP render_callback.
         * * @returns {Object} React element containing the saved block content.
         */
        save: function () {
            return el(InnerBlocks.Content, null);
        }
    });
}(window.wp));