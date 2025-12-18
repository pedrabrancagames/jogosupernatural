/**
 * Game Manager System (Updated)
 * Hunters Web AR
 */

AFRAME.registerComponent('game-manager', {
    init: function () {
        console.log('🎮 Game Manager initialized');

        // Listener para entrada no modo AR
        this.el.sceneEl.addEventListener('enter-vr', () => {
            console.log('🎯 Entrou no modo AR');
            window.gameState.isInAR = true;
        });

        this.el.sceneEl.addEventListener('exit-vr', () => {
            console.log('👋 Saiu do modo AR');
            window.gameState.isInAR = false;
        });
    }
});

console.log('🎮 Game Manager registered');
