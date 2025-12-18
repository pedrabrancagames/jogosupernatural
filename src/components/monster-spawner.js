/**
 * Monster Spawner Component
 * Hunters Web AR
 * Spawna monstros no modo AR
 */

import { getSpawnableMonsters, getMonster } from '../data/monsters.js';

AFRAME.registerComponent('monster-spawner', {
    schema: {
        interval: { type: 'number', default: 3000 }, // Reduzido para 3 segundos
        range: { type: 'number', default: 8 },
        maxMonsters: { type: 'number', default: 3 },
        enabled: { type: 'boolean', default: true }
    },

    init: function () {
        this.timer = 0;
        this.spawnableIds = getSpawnableMonsters();
        this.hasSpawnedInitial = false;
        console.log('👹 Monster Spawner inicializado com', this.spawnableIds.length, 'monstros disponíveis');
    },

    tick: function (time, timeDelta) {
        if (!this.data.enabled) return;

        // Verificar se a cena AR está ativa (verificar vários indicadores)
        const scene = this.el.sceneEl;
        const isActive = scene && (
            scene.is('ar-mode') ||
            scene.is('vr-mode') ||
            window.gameState?.isInAR ||
            scene.style.display !== 'none'
        );

        if (!isActive) return;

        // Spawn inicial imediato
        if (!this.hasSpawnedInitial) {
            console.log('👹 Spawning monstro inicial...');
            this.spawn();
            this.hasSpawnedInitial = true;
            return;
        }

        this.timer += timeDelta;
        if (this.timer >= this.data.interval) {
            this.trySpawn();
            this.timer = 0;
        }
    },

    trySpawn: function () {
        const monsterCount = document.querySelectorAll('.monster').length;
        console.log('👹 Monstros ativos:', monsterCount, '/', this.data.maxMonsters);

        if (monsterCount < this.data.maxMonsters) {
            this.spawn();
        }
    },

    spawn: function () {
        // Para teste, forçar lobisomem que é sempre visível
        // Depois pode voltar para aleatório
        const visibleMonsters = ['werewolf', 'ghost'];
        const monsterId = visibleMonsters[Math.floor(Math.random() * visibleMonsters.length)];
        const monsterData = getMonster(monsterId);

        if (!monsterData) {
            console.error('👹 Monstro não encontrado:', monsterId);
            return;
        }

        console.log('👹 Criando monstro:', monsterData.name);

        const el = document.createElement('a-entity');
        el.classList.add('monster');
        el.dataset.monsterId = monsterId;
        el.dataset.hp = monsterData.hp;
        el.dataset.maxHp = monsterData.hp;

        // Modelo GLB
        const modelPath = `/models/${monsterData.model}`;
        console.log('👹 Carregando modelo:', modelPath);

        el.setAttribute('gltf-model', modelPath);
        el.setAttribute('animation-mixer', '');

        // Escala reduzida para caber na tela
        const scale = (monsterData.scale || 1) * 0.5; // Reduzir para metade
        el.setAttribute('scale', `${scale} ${scale} ${scale}`);

        // Posição à frente do jogador (mais perto)
        const angle = Math.random() * Math.PI * 2;
        const radius = 2 + Math.random() * 3; // Entre 2 e 5 metros
        const x = Math.cos(angle) * radius;
        const z = -Math.abs(Math.sin(angle) * radius); // Sempre à frente (z negativo)
        const y = 0;

        el.setAttribute('position', { x, y, z });

        // Rotação para olhar para o jogador
        const rotationY = (Math.atan2(x, z) * 180 / Math.PI) + 180;
        el.setAttribute('rotation', `0 ${rotationY} 0`);

        // Evento de modelo carregado
        el.addEventListener('model-loaded', () => {
            console.log('👹 Modelo carregado com sucesso:', monsterData.name);
        });

        el.addEventListener('model-error', (e) => {
            console.error('👹 Erro ao carregar modelo:', monsterData.name, e);
        });

        // Para fantasmas, torná-los visíveis para teste
        // Remover a invisibilidade por enquanto
        el.setAttribute('visible', true);

        this.el.sceneEl.appendChild(el);
        console.log(`👹 Spawned: ${monsterData.name} em (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);

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
