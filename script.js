document.addEventListener('DOMContentLoaded', () => {
    const programListContainer = document.querySelector('.program-list');
    const bottomPlayer = document.getElementById('bottomPlayer');
    const currentProgramTitleDisplay = document.getElementById('currentProgramTitle');
    const playLiveButton = document.getElementById('playLiveButton');
    const liveStreamUrl = 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio045/playlist.m3u8'; // Your live stream URL

    // Function to play audio in the bottom player
    function playAudio(audioUrl, title) {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
        const match = audioUrl.match(youtubeRegex);

        const playerContainer = document.querySelector('.player-container');
        const bottomPlayer = document.getElementById('bottomPlayer');
        const currentProgramTitleDisplay = document.getElementById('currentProgramTitle');

        if (match) {
            // If it's a YouTube URL, embed the YouTube player
            const videoId = match[1];
            playerContainer.innerHTML = ''; // Clear existing content

            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.width = '100%';
            iframe.height = '315';
            iframe.allow = 'autoplay; encrypted-media';
            iframe.frameBorder = '0';

            playerContainer.appendChild(iframe);
            currentProgramTitleDisplay.textContent = title; // Update the title
        } else {
            // Default behavior for audio files
            playerContainer.innerHTML = ''; // Clear existing content
            playerContainer.appendChild(bottomPlayer); // Re-add the audio player

            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(audioUrl);
                hls.attachMedia(bottomPlayer);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log('HLS manifest parsed.');
                    bottomPlayer.play();
                });
                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS error occurred:', event, data);
                    bottomPlayer.src = audioUrl;
                    bottomPlayer.play().catch(error => console.error("Error playing audio:", error));
                });
            } else if (bottomPlayer.canPlayType('audio/mpeg') || bottomPlayer.canPlayType('audio/aac')) {
                bottomPlayer.src = audioUrl;
                bottomPlayer.play().catch(error => console.error("Error playing audio:", error));
            } else {
                console.error('Audio format not supported.');
            }
            currentProgramTitleDisplay.textContent = title; // Update the title
        }
    }

    // Event listener for the "Play Live Broadcast" button
    playLiveButton.addEventListener('click', () => {
        playAudio(liveStreamUrl, 'തത്സമയ സംപ്രേക്ഷണം');
    });

    // Function to load and display program tiles
    function loadPrograms() {
        fetch('data/programs.yaml')
            .then(response => response.text())
            .then(yamlData => {
                const programs = jsyaml.load(yamlData);
                programs.forEach(program => {
                    const tile = document.createElement('div');
                    tile.classList.add('program-tile');
                    tile.innerHTML = `
                        <img src="${program.thumbnail}" alt="${program.title}">
                        <h3>${program.title}</h3>
                    `;
                    tile.addEventListener('click', () => {
                        window.location.href = `pages/program_details.html?id=${program.id}`;
                    });
                    programListContainer.appendChild(tile);
                });
            })
            .catch(error => console.error('Error loading programs:', error));
    }

    // Load the program tiles
    loadPrograms();

    // Service Worker registration (keep this at the end)
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
});