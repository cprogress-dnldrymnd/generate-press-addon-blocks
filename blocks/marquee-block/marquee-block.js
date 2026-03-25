/**
 * Registers the 'dd/marquee' block for the Gutenberg Editor.
 * Enforces an InnerBlocks structure that accepts specific GenerateBlocks elements.
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

        edit: function (props) {
            const blockProps = useBlockProps();

            return el('div', blockProps,
                el(InnerBlocks, {
                    allowedBlocks: [
                        'generateblocks/image',
                        'generateblocks/headline'
                    ],
                    template: [
                        ['generateblocks/image', {}]
                    ],
                    // Explicitly prevent WordPress from locking the template after the first block
                    templateLock: false, 
                    orientation: 'horizontal',
                    // Safely render the physical button appender so it survives the flex layout
                    renderAppender: function() {
                        return el( InnerBlocks.ButtonBlockAppender, null );
                    }
                })
            );
        },

        save: function () {
            return el(InnerBlocks.Content, null);
        }
    });
}(window.wp));