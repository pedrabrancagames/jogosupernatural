/**
 * Weapon Component (Updated)
 * Hunters Web AR
 * Sistema de combate com fraquezas
 */

import { isWeakness, getMonster } from '../data/monsters.js';
import { getItem, isEffectiveAgainst } from '../data/items.js';
import { diaryService, profileService, inventoryService } from '../lib/supabase.js';

AFRAME.registerComponent('weapon', {
    init: function () {
        this.actionBtn = document.getElementById('ar-action-btn');
        if (this.actionBtn) {
            this.actionBtn.addEventListener('click', this.attack.bind(this));
        }
        console.log('⚔️ Weapon component initialized');
    },

    attack: function () {
        const selectedItem = window.gameState.selectedItem;

        if (!selectedItem) {
            console.log('❌ Nenhum item selecionado');
            this.showMessage('Selecione um item no inventário');
            return;
        }

        const raycaster = this.el.components.raycaster;
        if (!raycaster) return;

        raycaster.refreshObjects();
        const intersections = raycaster.intersections;

        // Posição da câmera
        const startPos = new THREE.Vector3();
        this.el.object3D.getWorldPosition(startPos);

        if (intersections.length > 0) {
            const hit = intersections[0];
            const targetEl = hit.object.el;

            if (targetEl && targetEl.classList.contains('monster')) {
                this.processMonsterHit(targetEl, selectedItem, hit.point);
            } else {
                this.fireMiss(startPos);
            }
        } else {
            this.fireMiss(startPos);
        }

        // Feedback tátil
        if (navigator.vibrate && window.gameState.settings?.vibration !== false) {
            navigator.vibrate(50);
        }
    },

    processMonsterHit: function (monsterEl, selectedItem, hitPoint) {
        const monsterId = monsterEl.dataset.monsterId;
        const monsterData = getMonster(monsterId);
        const itemData = selectedItem.data;

        if (!monsterData || !itemData) return;

        // Verificar se monstro é invisível
        if (monsterEl.dataset.invisible === 'true') {
            // Verificar se jogador tem item de revelação
            if (!this.playerHasRevealItem(monsterData.visibleWith)) {
                this.showMessage(`${monsterData.name} é invisível! Use o item correto.`);
                return;
            }
        }

        // Calcular dano
        let damage = 0;
        let effective = false;

        if (isEffectiveAgainst(itemData.id, monsterId)) {
            damage = itemData.damage || 25;
            effective = true;
            this.showMessage(`Eficaz! -${damage} HP`);
        } else {
            damage = Math.floor((itemData.damage || 10) * 0.2); // 20% do dano se não for fraqueza
            this.showMessage(`Ineficaz! -${damage} HP`);
        }

        // Aplicar dano
        const currentHp = parseInt(monsterEl.dataset.hp) || 100;
        const newHp = Math.max(0, currentHp - damage);
        monsterEl.dataset.hp = newHp;

        // Atualizar HUD
        this.updateMonsterHUD(monsterData, newHp);

        // Efeito visual de hit
        this.createHitEffect(hitPoint, effective);

        // Consumir item se for consumível
        if (itemData.consumable) {
            this.consumeItem(selectedItem);
        }

        // Verificar morte
        if (newHp <= 0) {
            this.killMonster(monsterEl, monsterData, hitPoint);
        }
    },

    killMonster: function (monsterEl, monsterData, position) {
        console.log(`💀 ${monsterData.name} derrotado!`);

        // Animação de morte
        monsterEl.setAttribute('animation__death', {
            property: 'scale',
            to: '0 0 0',
            dur: 500,
            easing: 'easeInBack'
        });

        // Remover após animação
        setTimeout(() => {
            if (monsterEl.parentNode) {
                monsterEl.parentNode.removeChild(monsterEl);
            }
        }, 600);

        // Esconder HP do monstro
        const hpContainer = document.getElementById('monster-hp-container');
        if (hpContainer) {
            hpContainer.style.opacity = '0';
        }

        // Registrar no diário
        this.logKill(monsterData);

        // Mostrar mensagem
        this.showMessage(`${monsterData.name} eliminado!`);

        // Vibrar
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    },

    updateMonsterHUD: function (monsterData, currentHp) {
        const hpBar = document.getElementById('monster-hp-bar');
        const hpText = document.getElementById('monster-hp-text');
        const maxHp = monsterData.hp;

        if (hpBar) {
            const percentage = (currentHp / maxHp) * 100;
            hpBar.style.width = `${percentage}%`;

            hpBar.classList.remove('high', 'medium', 'low');
            if (percentage > 60) hpBar.classList.add('high');
            else if (percentage > 30) hpBar.classList.add('medium');
            else hpBar.classList.add('low');
        }

        if (hpText) {
            hpText.textContent = `${currentHp}/${maxHp}`;
        }
    },

    createHitEffect: function (position, effective) {
        const effect = document.createElement('a-entity');
        effect.setAttribute('position', position);
        effect.setAttribute('geometry', { primitive: 'sphere', radius: 0.1 });
        effect.setAttribute('material', {
            color: effective ? '#00FF00' : '#FF6600',
            shader: 'flat',
            opacity: 0.8
        });
        effect.setAttribute('animation', {
            property: 'scale',
            from: '1 1 1',
            to: '3 3 3',
            dur: 300,
            easing: 'easeOutQuad'
        });
        effect.setAttribute('animation__fade', {
            property: 'material.opacity',
            from: 0.8,
            to: 0,
            dur: 300
        });

        this.el.sceneEl.appendChild(effect);

        setTimeout(() => {
            if (effect.parentNode) effect.parentNode.removeChild(effect);
        }, 400);
    },

    fireMiss: function (startPos) {
        // Mostrar que errou
        console.log('💨 Tiro errou');
    },

    showMessage: function (text) {
        // TODO: Implementar sistema de mensagens in-game
        console.log(`💬 ${text}`);
    },

    playerHasRevealItem: function (itemKey) {
        const inventory = window.gameState.inventory || [];
        return inventory.some(item => item.item_key === itemKey);
    },

    async consumeItem(selectedItem) {
        try {
            await inventoryService.removeItem(selectedItem.data.id, 1);
            // Atualizar inventário local
            const inventory = await inventoryService.getInventory();
            window.gameState.inventory = inventory;
        } catch (error) {
            console.error('Erro ao consumir item:', error);
        }
    },

    async logKill(monsterData) {
        try {
            await diaryService.addLog({
                event_type: 'monster_killed',
                event_description: `Derrotou um ${monsterData.name}`,
                monster_type: monsterData.id,
                location_name: 'Local desconhecido'
            });
        } catch (error) {
            console.error('Erro ao registrar kill:', error);
        }
    }
});

console.log('⚔️ Weapon component registered');
