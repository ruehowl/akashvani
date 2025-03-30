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

        if (!currentProgramTitleDisplay) {
            console.warn('Element with ID "currentProgramTitle" not found in the DOM. Skipping title update.');
            return; // Safely exit the function if the element is not found
        }

        currentProgramTitleDisplay.textContent = title; // Update the title

        if (match) {
            // If it's a YouTube URL, embed the YouTube player
            const videoId = match[1];
            const detailsContainer = document.querySelector('.details-container');
            detailsContainer.innerHTML = `
                <h2>${title}</h2>
                <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                        width="100%" height="315" allow="autoplay; encrypted-media" 
                        frameborder="0" style="display: block; margin: 0 auto;"></iframe>
                <p>Program description goes here.</p>
            `;
        } else {
            const detailsContainer = document.querySelector('.details-container');
            detailsContainer.innerHTML = `
                <h2>${title}</h2>
                <img src="../path/to/thumbnail.jpg" alt="${title}" 
                     style="width: 100%; max-width: 400px; margin-bottom: 1em;">
                <p>Program description goes here.</p>
            `;
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