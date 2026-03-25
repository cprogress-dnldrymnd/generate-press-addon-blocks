/**
 * Handles the frontend initialization for the Taxonomy Carousel.
 * Detects the block markup and instantiates the Splide.js engine.
 */
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.dd-taxonomy-carousel.splide');
    
    // Abort if no carousels exist or if the Splide library failed to load
    if ( carousels.length === 0 || typeof Splide === 'undefined' ) {
        return;
    }

    carousels.forEach( carousel => {
        // Splide automatically reads the JSON configuration off the data-splide HTML attribute
        new Splide( carousel ).mount();
    });
});