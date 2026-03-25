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

        if ( hasNavigation ) {
            swiperConfig.navigation = {
                nextEl: carouselEl.querySelector('.gb-carousel-control--next'),
                prevEl: carouselEl.querySelector('.gb-carousel-control--previous'),
            };
        }

        /**
         * Initialize Swiper instance.
         * The Swiper library is guaranteed to be available due to PHP view_script_deps.
         */
        new Swiper( carouselEl, swiperConfig );
    });
});