/**
 * Inventory Screen
 * Hunters Web AR
 */

import { getItem } from '../data/items.js';

/**
 * Atualizar grid do inventário
 */
function refreshInventory() {
    const grid = document.getElementById('inventory-grid');
    const emptyState = document.getElementById('inventory-empty');
    const inventory = window.gameState.inventory || [];

    if (!grid) return;

    // Limpar grid
    grid.innerHTML = '';

    if (inventory.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    grid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    // Criar slots
    inventory.forEach((invItem, index) => {
        const itemData = getItem(invItem.item_key);
        if (!itemData) return;

        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.dataset.itemId = invItem.id;
        slot.dataset.itemKey = invItem.item_key;

        slot.innerHTML = `
            <span class="item-icon">${itemData.icon}</span>
            ${invItem.quantity > 1 ? `<span class="item-quantity">${invItem.quantity}</span>` : ''}
        `;

        slot.addEventListener('click', () => openItemModal(invItem, itemData));

        grid.appendChild(slot);
    });

    // Adicionar slots vazios para completar o grid
    const totalSlots = 16;
    const emptySlots = totalSlots - inventory.length;
    for (let i = 0; i < emptySlots; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.className = 'inventory-slot empty';
        grid.appendChild(emptySlot);
    }
}

/**
 * Abrir modal de item
 */
function openItemModal(invItem, itemData) {
    const modal = document.getElementById('item-modal');
    const nameEl = document.getElementById('modal-item-name');
    const descEl = document.getElementById('modal-item-description');

    if (!modal || !nameEl || !descEl) return;

    nameEl.textContent = `${itemData.icon} ${itemData.name}`;
    descEl.textContent = itemData.description;

    // Configurar botão usar
    const useBtn = document.getElementById('modal-use');
    if (useBtn) {
        useBtn.onclick = () => {
            selectItem(invItem, itemData);
            modal.classList.remove('active');
        };
    }

    modal.classList.add('active');
}

/**
 * Selecionar item
 */
function selectItem(invItem, itemData) {
    window.gameState.selectedItem = {
        inventoryItem: invItem,
        data: itemData
    };
    console.log('🎯 Item selecionado:', itemData.name);
}

// Event listeners
window.addEventListener('inventory:refresh', refreshInventory);

console.log('🎒 Inventory screen module loaded');
