document.addEventListener('DOMContentLoaded', () => {
    const programListContainer = document.querySelector('.program-list');
    const bottomPlayer = document.getElementById('bottomPlayer');
    const currentProgramTitleDisplay = document.getElementById('currentProgramTitle');
    const playLiveButton = document.getElementById('playLiveButton');
    const liveStreamUrl = 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio045/playlist.m3u8'; // Your live stream URL

    // Function to play audio in the bottom player
    function playAudio(audioUrl, title) {
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
        currentProgramTitleDisplay.textContent = title;
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