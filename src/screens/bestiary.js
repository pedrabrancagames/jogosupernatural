/**
 * Bestiary Screen
 * Hunters Web AR
 */

import { getAllMonsters } from '../data/monsters.js';

/**
 * Renderizar lista de monstros
 */
function refreshBestiary() {
    const list = document.getElementById('bestiary-list');
    if (!list) return;

    const monsters = getAllMonsters();

    list.innerHTML = monsters.map(monster => `
        <div class="monster-card" data-monster-id="${monster.id}">
            <span class="monster-icon">${monster.icon}</span>
            <div class="monster-info">
                <h3 class="monster-name">${monster.name}</h3>
                <p class="monster-hint">Clique para ver detalhes</p>
            </div>
        </div>
    `).join('');

    // Adicionar event listeners
    list.querySelectorAll('.monster-card').forEach(card => {
        card.addEventListener('click', () => {
            const monsterId = card.dataset.monsterId;
            openMonsterModal(monsterId);
        });
    });
}

/**
 * Abrir modal de detalhes do monstro
 */
function openMonsterModal(monsterId) {
    const monsters = getAllMonsters();
    const monster = monsters.find(m => m.id === monsterId);
    if (!monster) return;

    const modal = document.getElementById('monster-modal');
    const nameEl = document.getElementById('modal-monster-name');
    const iconEl = document.getElementById('modal-monster-icon');
    const loreEl = document.getElementById('modal-monster-lore');
    const hintEl = document.getElementById('modal-monster-hint');

    if (!modal) return;

    if (nameEl) nameEl.textContent = monster.name;
    if (iconEl) iconEl.textContent = monster.icon;
    if (loreEl) loreEl.textContent = monster.lore;
    if (hintEl) hintEl.textContent = monster.hint;

    modal.classList.add('active');
}

// Event listeners
window.addEventListener('bestiary:refresh', refreshBestiary);

console.log('📖 Bestiary screen module loaded');
