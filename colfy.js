const clientId = ''; 
const redirectUri = 'http://localhost:3000/callback'; 
let accessToken = '';
let refreshToken = '';
let deviceId = '';
let currentTrackIndex = 0;
let tracks = [];
const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById('pause-button');
const nextButton = document.getElementById('next-button');
// const guitar = document.getElementById('guitar');
const currentSong = document.getElementById('current-song');

// Función para obtener el código de autorización de spotify
function getAuthorizationCode() {
    const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=user-top-read user-read-playback-state user-modify-playback-state`;
    window.location.href = url;
}

// Función para obtener las canciones más escuchadas de mi cuenta
async function getTopTracks() {
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10', {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    const data = await response.json();
    tracks = data.items.map((item, index) => ({
        ...item,
        priority: 10 - index // Asignar prioridad inversa al índice
    }));
    return tracks;
}

// Función para que muestre las canciones en la página
function displaySongs(songs) {
    const songList = document.getElementById('song-list');
    songList.innerHTML = songs.map((song, index) => `
        <p>${index + 1}. ${song.name} - ${song.artists[0].name} (Prioridad: ${song.priority})</p>
    `).join('');
}

// Función para inicializar el reproductor
async function initializePlayer() {
    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    const data = await response.json();
    if (data.devices.length > 0) {
        deviceId = data.devices[0].id;
    } else {
        console.error('No active devices found');
    }
}

// Función para reproducir una canción
async function playTrack(trackUri) {
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [trackUri] }),
    });
}

// Función principal
async function main() {
    const urlParams = new URLSearchParams(window.location.search);
    accessToken = urlParams.get('access_token');
    refreshToken = urlParams.get('refresh_token');

    if (!accessToken) {
        getAuthorizationCode();
    } else {
        const songs = await getTopTracks();
        displaySongs(songs);
        await initializePlayer();
    }
}

main();

// Control de reproducción y animación
playButton.addEventListener('click', () => {
    if (tracks.length > 0) {
        playTrack(tracks[currentTrackIndex].uri);
        // guitar.classList.add('playing');
        currentSong.textContent = `${tracks[currentTrackIndex].name} - ${tracks[currentTrackIndex].artists[0].name}`;
    }
});

pauseButton.addEventListener('click', () => {
    fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    // guitar.classList.remove('playing');
});

nextButton.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(tracks[currentTrackIndex].uri);
    currentSong.textContent = `${tracks[currentTrackIndex].name} - ${tracks[currentTrackIndex].artists[0].name}`;
});