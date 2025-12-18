/**
 * Combat System
 * Hunters Web AR
 */

AFRAME.registerSystem('combat', {
    init: function () {
        this.playerHP = 100;
        this.maxPlayerHP = 100;

        console.log('⚔️ Combat system initialized');
    },

    /**
     * Aplicar dano ao jogador
     */
    damagePlayer: function (amount) {
        this.playerHP = Math.max(0, this.playerHP - amount);
        window.gameState.playerHP = this.playerHP;

        // Atualizar HUD
        this.updatePlayerHUD();

        // Feedback visual de dano
        this.showDamageEffect();

        // Vibrar
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }

        // Game over se HP = 0
        if (this.playerHP <= 0) {
            this.playerDeath();
        }
    },

    /**
     * Curar jogador
     */
    healPlayer: function (amount) {
        this.playerHP = Math.min(this.maxPlayerHP, this.playerHP + amount);
        window.gameState.playerHP = this.playerHP;
        this.updatePlayerHUD();
    },

    /**
     * Atualizar HUD do jogador
     */
    updatePlayerHUD: function () {
        const hpBar = document.getElementById('player-hp-bar');
        const hpText = document.getElementById('player-hp-text');

        if (hpBar) {
            const percentage = (this.playerHP / this.maxPlayerHP) * 100;
            hpBar.style.width = `${percentage}%`;

            hpBar.classList.remove('high', 'medium', 'low');
            if (percentage > 60) hpBar.classList.add('high');
            else if (percentage > 30) hpBar.classList.add('medium');
            else hpBar.classList.add('low');
        }

        if (hpText) {
            hpText.textContent = `${this.playerHP}/${this.maxPlayerHP}`;
        }
    },

    /**
     * Efeito visual de dano
     */
    showDamageEffect: function () {
        const overlay = document.getElementById('damage-overlay');
        if (overlay) {
            overlay.style.opacity = '0.6';
            overlay.classList.add('active');

            setTimeout(() => {
                overlay.style.opacity = '0';
                overlay.classList.remove('active');
            }, 300);
        }
    },

    /**
     * Morte do jogador
     */
    playerDeath: function () {
        console.log('💀 Jogador morreu');
        // TODO: Implementar tela de game over
        alert('Você foi derrotado! Seus ferimentos foram graves.');

        // Resetar HP
        this.playerHP = this.maxPlayerHP;
        window.gameState.playerHP = this.playerHP;
        this.updatePlayerHUD();
    }
});

console.log('⚔️ Combat system registered');
