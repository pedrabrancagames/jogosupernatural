/**
 * Monster Spawner Component
 * Hunters Web AR
 * Spawna monstros baseado em GPS
 */

import { getSpawnableMonsters, getMonster } from '../data/monsters.js';

AFRAME.registerComponent('monster-spawner', {
    schema: {
        interval: { type: 'number', default: 5000 },
        range: { type: 'number', default: 10 },
        maxMonsters: { type: 'number', default: 3 },
        enabled: { type: 'boolean', default: true }
    },

    init: function () {
        this.timer = 0;
        this.spawnableIds = getSpawnableMonsters();
        console.log('👹 Monster Spawner inicializado');
    },

    tick: function (time, timeDelta) {
        if (!this.data.enabled) return;
        if (!window.gameState.isInAR) return;

        this.timer += timeDelta;
        if (this.timer >= this.data.interval) {
            this.trySpawn();
            this.timer = 0;
        }
    },

    trySpawn: function () {
        const monsterCount = document.querySelectorAll('.monster').length;

        if (monsterCount < this.data.maxMonsters) {
            this.spawn();
        }
    },

    spawn: function () {
        // Escolher monstro aleatório (ponderado)
        const randomIndex = Math.floor(Math.random() * this.spawnableIds.length);
        const monsterId = this.spawnableIds[randomIndex];
        const monsterData = getMonster(monsterId);

        if (!monsterData) return;

        const el = document.createElement('a-entity');
        el.classList.add('monster');
        el.dataset.monsterId = monsterId;
        el.dataset.hp = monsterData.hp;
        el.dataset.maxHp = monsterData.hp;

        // Verificar se modelo existe
        const modelPath = `/models/${monsterData.model}`;

        el.setAttribute('gltf-model', `url(${modelPath})`);
        el.setAttribute('animation-mixer', '');

        // Escala
        const scale = monsterData.scale || 1;
        el.setAttribute('scale', `${scale} ${scale} ${scale}`);

        // Posição aleatória ao redor do jogador
        const angle = Math.random() * Math.PI * 2;
        const radius = 3 + Math.random() * (this.data.range - 3);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 0;

        el.setAttribute('position', { x, y, z });

        // Rotação aleatória
        el.setAttribute('rotation', `0 ${Math.random() * 360} 0`);

        // Animação de entrada
        el.setAttribute('animation__spawn', {
            property: 'scale',
            from: '0 0 0',
            to: `${scale} ${scale} ${scale}`,
            dur: 500,
            easing: 'easeOutElastic'
        });

        // Invisibilidade (para fantasmas e cães do inferno)
        if (monsterData.invisible) {
            el.setAttribute('visible', !monsterData.invisible);
            el.dataset.invisible = 'true';
            el.dataset.visibleWith = monsterData.visibleWith || '';
        }

        this.el.sceneEl.appendChild(el);
        console.log(`👹 Spawned: ${monsterData.name} at (${x.toFixed(2)}, ${z.toFixed(2)})`);

        // Atualizar HUD do monstro
        this.updateMonsterHUD(monsterData);
    },

    updateMonsterHUD: function (monsterData) {
        const container = document.getElementById('monster-hp-container');
        const hpBar = document.getElementById('monster-hp-bar');
        const hpText = document.getElementById('monster-hp-text');

        if (container) {
            container.style.opacity = '1';
        }
        if (hpBar) {
            hpBar.style.width = '100%';
            hpBar.className = 'hp-bar high';
        }
        if (hpText) {
            hpText.textContent = `${monsterData.hp}/${monsterData.hp}`;
        }
    }
});

console.log('👹 Monster Spawner component registered');
