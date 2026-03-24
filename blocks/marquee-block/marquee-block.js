/**
 * Registers the 'dd/logo-marquee' block for the Gutenberg Editor.
 * Enforces an InnerBlocks structure that only accepts 'core/image' blocks.
 */
( function( wp ) {
    const { registerBlockType } = wp.blocks;
    const { InnerBlocks, useBlockProps } = wp.blockEditor;
    const { createElement: el } = wp.element;

    registerBlockType( 'dd/logo-marquee', {
        title: 'Logo Marquee (Infinite)',
        icon: 'images-alt2',
        category: 'design',
        description: 'Add an infinitely scrolling row of logos.',
        
        /**
         * Renders the editor interface. 
         * Styling is now handled via the registered editor_style block attribute.
         */
        edit: function( props ) {
            // Retrieve default block properties without inline inline layout styles
            const blockProps = useBlockProps();

            return el( 'div', blockProps,
                el( InnerBlocks, {
                    allowedBlocks: [ 'core/image' ],
                    orientation: 'horizontal',
                    renderAppender: InnerBlocks.ButtonBlockAppender
                } )
            );
        },

        /**
         * Saves the structural layout of the InnerBlocks.
         * The dynamic duplication and wrapper classes are handled via the PHP render_callback.
         */
        save: function() {
            return el( InnerBlocks.Content, null );
        }
    } );
}( window.wp ) );