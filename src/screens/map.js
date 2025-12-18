/**
 * Map Screen
 * Hunters Web AR
 * Integração com Leaflet.js
 */

import L from 'leaflet';

let map = null;
let playerMarker = null;
let watchId = null;

/**
 * Inicializar o mapa
 */
function initMap() {
    const container = document.getElementById('map-container');
    if (!container || map) return;

    // Posição padrão (será atualizada com geolocalização)
    const defaultPosition = [-23.5505, -46.6333]; // São Paulo

    map = L.map('map-container', {
        zoomControl: false,
        attributionControl: false
    }).setView(defaultPosition, 15);

    // Tile layer escuro (tema Supernatural)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    // Marcador do jogador
    const playerIcon = L.divIcon({
        className: 'player-marker',
        html: '<div style="width: 20px; height: 20px; background: #4169E1; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(65, 105, 225, 0.8);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    playerMarker = L.marker(defaultPosition, { icon: playerIcon }).addTo(map);

    // Iniciar geolocalização
    startGeolocation();

    // Adicionar monstros de exemplo (serão carregados do Supabase)
    addExampleMarkers();
}

/**
 * Iniciar rastreamento de geolocalização
 */
function startGeolocation() {
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
        },
        (error) => {
            console.error('Erro de geolocalização:', error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000
        }
    );
}

/**
 * Adicionar marcadores de exemplo
 */
function addExampleMarkers() {
    if (!map) return;

    // Ícone de monstro
    const monsterIcon = L.divIcon({
        className: 'monster-marker',
        html: '<div style="width: 24px; height: 24px; background: #8B0000; border: 2px solid #C9A227; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">👻</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    // Ícone de loot
    const lootIcon = L.divIcon({
        className: 'loot-marker',
        html: '<div style="width: 20px; height: 20px; background: #C9A227; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">🎒</div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    // Monstros de exemplo (posições relativas ao player)
    // Serão substituídos por dados reais do Supabase
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
