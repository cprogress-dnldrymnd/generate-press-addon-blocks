/**
 * Frontend execution script for the Taxonomy Carousel.
 * Extracts Swiper configuration parameters compiled by PHP and initializes the sliders.
 */
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.dd-taxonomy-carousel');

    carousels.forEach( ( carouselEl ) => {
        // Parse configurations compiled from Gutenberg block attributes
        const slidesPerView = parseInt( carouselEl.dataset.slidesPerView, 10 ) || 3;
        const spaceBetween = parseInt( carouselEl.dataset.spaceBetween, 10 ) || 20;
        const isAutoplay = carouselEl.dataset.autoplay === 'true';
        const isLoop = carouselEl.dataset.loop === 'true';
        const hasPagination = carouselEl.dataset.pagination === 'true';
        const hasNavigation = carouselEl.dataset.navigation === 'true';

        // Traverse up the DOM to find the custom parent wrapper enclosing the navigation buttons
        const parentHolder = carouselEl.closest('.swiper-holder');

        // Construct Swiper configuration payload
        const swiperConfig = {
            slidesPerView: slidesPerView,
            spaceBetween: spaceBetween,
            loop: isLoop,
            
            // Responsive breakpoints (Graceful degradation for mobile)
            breakpoints: {
                320: { slidesPerView: 1, spaceBetween: 10 },
                768: { slidesPerView: Math.min(2, slidesPerView), spaceBetween: 15 },
                1024: { slidesPerView: slidesPerView, spaceBetween: spaceBetween }
            }
        };

        if ( isAutoplay ) {
            swiperConfig.autoplay = {
                delay: 3000,
                disableOnInteraction: false,
            };
        }

        if ( hasPagination ) {
            swiperConfig.pagination = {
                el: carouselEl.querySelector('.swiper-pagination'),
                clickable: true,
            };
        }

        // Only bind navigation if enabled and the parent wrapper is successfully located
        if ( hasNavigation && parentHolder ) {
            /**
             * Target the newly integrated custom DOM classes for navigation.
             * We query from `parentHolder` instead of `carouselEl` because the buttons 
             * are now external siblings to the main swiper track.
             */
            swiperConfig.navigation = {
                nextEl: parentHolder.querySelector('.gb-carousel-control--next'),
                prevEl: parentHolder.querySelector('.gb-carousel-control--previous'),
            };
        }

        /**
         * Initialize Swiper instance.
         * The Swiper library is guaranteed to be available due to PHP view_script_deps.
         */
        new Swiper( carouselEl, swiperConfig );
    });
});