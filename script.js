document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('radioPlayer');
    const streamUrl = 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio045/playlist.m3u8';

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest parsed, ready to play.');
            // Optionally, you can start playing here if autoplay is desired
            // audio.play();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error occurred:', event, data);
        });
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (e.g., Safari)
        audio.src = streamUrl;
        audio.addEventListener('loadedmetadata', () => {
            console.log('Native HLS loaded metadata, ready to play.');
            // Optionally, you can start playing here if autoplay is desired
            // audio.play();
        });
        audio.addEventListener('error', (error) => {
            console.error('Native HLS error:', error);
        });
    } else {
        console.error('HLS is not supported in this browser.');
        // Optionally, display a message to the user
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}