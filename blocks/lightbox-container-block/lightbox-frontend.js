/**
 * Handles the frontend interaction and media routing for the Lightbox Container.
 * Detects the URL type, generates the media node inside the modal, manages
 * the lifecycle of the HTML5 dialog, and handles aggressive Intersection Observer preloading.
 */
document.addEventListener('DOMContentLoaded', () => {

    /**
     * Determines the type of media based on the URL string.
     * @param {string} url The media URL.
     * @return {string} The media type ('image', 'video', 'youtube', 'vimeo', or 'iframe').
     */
    const getMediaType = (url) => {
        if (!url) return 'unknown';
        if (url.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i)) return 'image';
        if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) return 'video';
        if (url.match(/(youtube\.com|youtu\.be)/i)) return 'youtube';
        if (url.match(/vimeo\.com/i)) return 'vimeo';
        return 'iframe';
    };

    /**
     * Converts a standard YouTube URL into an embeddable iframe URL.
     * @param {string} url The raw YouTube URL.
     * @return {string} The embeddable YouTube URL.
     */
    const getYouTubeEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0` : url;
    };

    /**
     * Creates or retrieves the singleton <dialog> element for the lightbox.
     * Hooks into CSS animations to ensure smooth transitions before unmounting content.
     * @return {HTMLDialogElement} The dialog node.
     */
    const getOrCreateDialog = () => {
        let dialog = document.getElementById('dd-global-media-lightbox');
        
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.id = 'dd-global-media-lightbox';
            dialog.className = 'dd-media-lightbox-modal';
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'dd-lightbox-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.setAttribute('aria-label', 'Close media');
            
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'dd-lightbox-content-wrapper';

            dialog.appendChild(closeBtn);
            dialog.appendChild(contentWrapper);
            document.body.appendChild(dialog);

            /**
             * Triggers the exit animation, waits for completion, then removes the dialog.
             */
            const closeLightbox = () => {
                dialog.classList.add('dd-lightbox-closing');
                dialog.addEventListener('animationend', function handleAnimationEnd() {
                    dialog.classList.remove('dd-lightbox-closing');
                    contentWrapper.innerHTML = ''; // Clear media to stop video playback
                    dialog.close();
                    dialog.removeEventListener('animationend', handleAnimationEnd);
                }, { once: true });
            };

            closeBtn.addEventListener('click', closeLightbox);
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) closeLightbox();
            });
        }
        return dialog;
    };

    // --- Preload Observer Logic ---
    const preloadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                const url = container.getAttribute('data-lightbox-url');
                const mediaType = getMediaType(url);

                if (url) {
                    if (mediaType === 'image') {
                        const link = document.createElement('link');
                        link.rel = 'preload';
                        link.as = 'image';
                        link.href = url;
                        document.head.appendChild(link);
                    } 
                    else if (mediaType === 'video') {
                        // Create an invisible video node to reliably force Chromium to cache the file
                        const hiddenVideo = document.createElement('video');
                        hiddenVideo.preload = 'auto';
                        hiddenVideo.src = url;
                        hiddenVideo.style.position = 'absolute';
                        hiddenVideo.style.width = '0';
                        hiddenVideo.style.height = '0';
                        hiddenVideo.style.opacity = '0';
                        document.body.appendChild(hiddenVideo);
                    } 
                    else if (mediaType === 'youtube') {
                        ['https://www.youtube.com', 'https://i.ytimg.com'].forEach(domain => {
                            const link = document.createElement('link');
                            link.rel = 'preconnect';
                            link.href = domain;
                            document.head.appendChild(link);
                        });
                    } 
                    else if (mediaType === 'vimeo') {
                        ['https://player.vimeo.com', 'https://vimeo.com'].forEach(domain => {
                            const link = document.createElement('link');
                            link.rel = 'preconnect';
                            link.href = domain;
                            document.head.appendChild(link);
                        });
                    }
                }
                // Unobserve after firing once to save resources
                observer.unobserve(container);
            }
        });
    }, {
        rootMargin: '200px 0px', // Trigger when within 200px of scrolling into view
        threshold: 0.1
    });

    // --- Click Event Logic ---
    const triggers = document.querySelectorAll('.dd-lightbox-trigger-container');

    triggers.forEach(container => {
        // Attach observer if preloading is enabled for this specific block
        if (container.getAttribute('data-preload') === 'true') {
            preloadObserver.observe(container);
        }

        container.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'a') return; 

            const url = container.getAttribute('data-lightbox-url');
            if (!url) return;

            const dialog = getOrCreateDialog();
            const wrapper = dialog.querySelector('.dd-lightbox-content-wrapper');
            const mediaType = getMediaType(url);
            
            wrapper.innerHTML = ''; 

            if (mediaType === 'image') {
                const img = document.createElement('img');
                img.src = url;
                wrapper.appendChild(img);
            } 
            else if (mediaType === 'video') {
                const video = document.createElement('video');
                video.src = url;
                video.controls = true;
                video.autoplay = true;
                wrapper.appendChild(video);
            } 
            else if (mediaType === 'youtube' || mediaType === 'vimeo') {
                const iframe = document.createElement('iframe');
                iframe.src = mediaType === 'youtube' ? getYouTubeEmbedUrl(url) : url;
                iframe.frameBorder = '0';
                iframe.allow = 'autoplay; fullscreen; picture-in-picture';
                iframe.setAttribute('allowfullscreen', '');
                
                const ratioWrapper = document.createElement('div');
                ratioWrapper.className = 'dd-responsive-iframe-wrapper';
                ratioWrapper.appendChild(iframe);
                wrapper.appendChild(ratioWrapper);
            }

            dialog.showModal();
        });
    });
});