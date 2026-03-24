/**
 * Handles the frontend interaction and media routing for the Lightbox Container.
 * Detects the URL type, generates the media node inside the modal, and manages
 * the lifecycle of the HTML5 dialog, including entrance/exit animations.
 */
document.addEventListener('DOMContentLoaded', () => {

    /**
     * Determines the type of media based on the URL string.
     * * @param {string} url The media URL.
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
     * * @param {string} url The raw YouTube URL.
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
     * * @return {HTMLDialogElement} The dialog node.
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
                // Apply the CSS class that triggers the exit animation keyframes
                dialog.classList.add('dd-lightbox-closing');
                
                // Wait for the animation to finish before destroying content and closing native dialog
                dialog.addEventListener('animationend', function handleAnimationEnd() {
                    dialog.classList.remove('dd-lightbox-closing');
                    contentWrapper.innerHTML = ''; // Clear media to stop video playback
                    dialog.close();
                    dialog.removeEventListener('animationend', handleAnimationEnd); // Cleanup listener
                }, { once: true });
            };

            closeBtn.addEventListener('click', closeLightbox);
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) closeLightbox();
            });
        }
        return dialog;
    };

    // Initialize all lightbox triggers on the page
    const triggers = document.querySelectorAll('.dd-lightbox-trigger-container');

    triggers.forEach(container => {
        container.addEventListener('click', (e) => {
            // Prevent click if user is clicking an internal anchor link
            if (e.target.tagName.toLowerCase() === 'a') return; 

            const url = container.getAttribute('data-lightbox-url');
            if (!url) return;

            const dialog = getOrCreateDialog();
            const wrapper = dialog.querySelector('.dd-lightbox-content-wrapper');
            const mediaType = getMediaType(url);
            
            wrapper.innerHTML = ''; // Reset

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
                
                // Add a responsive wrapper for the 16:9 aspect ratio
                const ratioWrapper = document.createElement('div');
                ratioWrapper.className = 'dd-responsive-iframe-wrapper';
                ratioWrapper.appendChild(iframe);
                wrapper.appendChild(ratioWrapper);
            }

            // Native HTML5 dialog method to open with backdrop
            dialog.showModal();
        });
    });
});