/**
 * Geolocation System
 * Hunters Web AR
 */

AFRAME.registerSystem('geolocation', {
    init: function () {
        this.position = null;
        this.watchId = null;
        this.accuracy = null;

        console.log('📍 Geolocation system initialized');
    },

    /**
     * Iniciar rastreamento
     */
    startTracking: function () {
        if (!navigator.geolocation) {
            console.error('Geolocalização não suportada');
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.onPositionUpdate(position),
            (error) => this.onPositionError(error),
            {
                enableHighAccuracy: true,
                maximumAge: 3000,
                timeout: 10000
            }
        );
    },

    /**
     * Parar rastreamento
     */
    stopTracking: function () {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    },

    /**
     * Callback de atualização de posição
     */
    onPositionUpdate: function (position) {
        this.position = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude
        };
        this.accuracy = position.coords.accuracy;

        window.gameState.playerPosition = this.position;

        // Emitir evento
        this.el.emit('geolocation-updated', {
            position: this.position,
            accuracy: this.accuracy
        });
    },

    /**
     * Callback de erro
     */
    onPositionError: function (error) {
        console.error('Erro de geolocalização:', error.message);
    },

    /**
     * Calcular distância entre duas coordenadas (Haversine)
     */
    calculateDistance: function (lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Raio da Terra em metros
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distância em metros
    },

    /**
     * Verificar se está em uma encruzilhada (para demônios)
     */
    isAtCrossroads: function () {
        // TODO: Integrar com OpenStreetMap para detectar encruzilhadas
        return false;
    }
});

console.log('📍 Geolocation system registered');
