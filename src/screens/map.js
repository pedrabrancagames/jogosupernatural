/**
 * Map Screen
 * Hunters Web AR
 * Integração com Leaflet.js
 */

let map = null;
let playerMarker = null;
let watchId = null;

/**
 * Inicializar o mapa
 */
function initMap() {
    const container = document.getElementById('map-container');
    if (!container) {
        console.error('🗺️ Container do mapa não encontrado');
        return;
    }

    // Se já existe mapa, limpar
    if (map) {
        map.remove();
        map = null;
    }

    // Forçar altura do container
    container.style.height = 'calc(100vh - 120px)';
    container.style.width = '100%';
    container.style.minHeight = '400px';

    // Posição padrão (São Paulo)
    const defaultPosition = [-23.5505, -46.6333];

    try {
        // Importar Leaflet dinamicamente
        import('leaflet').then((L) => {
            map = L.map('map-container', {
                zoomControl: true,
                attributionControl: false
            }).setView(defaultPosition, 15);

            // Tile layer estilo escuro
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                subdomains: 'abcd'
            }).addTo(map);

            // Marcador do jogador
            const playerIcon = L.divIcon({
                className: 'player-marker',
                html: '<div style="width: 20px; height: 20px; background: #4169E1; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(65, 105, 225, 0.8);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            playerMarker = L.marker(defaultPosition, { icon: playerIcon }).addTo(map);

            // Forçar redimensionamento
            setTimeout(() => {
                map.invalidateSize();
            }, 100);

            // Iniciar geolocalização
            startGeolocation(L);

            console.log('🗺️ Mapa inicializado com sucesso');
        }).catch(err => {
            console.error('🗺️ Erro ao carregar Leaflet:', err);
        });
    } catch (error) {
        console.error('🗺️ Erro ao criar mapa:', error);
    }
}

/**
 * Iniciar rastreamento de geolocalização
 */
function startGeolocation(L) {
    if (!navigator.geolocation) {
        console.warn('Geolocalização não suportada');
        return;
    }

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const latlng = [latitude, longitude];

            if (map && playerMarker) {
                playerMarker.setLatLng(latlng);
                map.setView(latlng, map.getZoom());
            }

            // Atualizar estado global
            window.gameState.playerPosition = { latitude, longitude };
            console.log('📍 Posição atualizada:', latitude, longitude);
        },
        (error) => {
            console.error('Erro de geolocalização:', error.message);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000
        }
    );
}

/**
 * Limpar mapa
 */
function cleanupMap() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (map) {
        map.remove();
        map = null;
        playerMarker = null;
    }
}

// Event listeners
window.addEventListener('map:init', initMap);
window.addEventListener('map:cleanup', cleanupMap);

console.log('🗺️ Map screen module loaded');
