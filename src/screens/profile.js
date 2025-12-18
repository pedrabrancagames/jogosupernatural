/**
 * Profile Screen
 * Hunters Web AR
 */

import { profileService, inventoryService, diaryService } from '../lib/supabase.js';

/**
 * Atualizar tela de perfil
 */
async function refreshProfile() {
    const profile = window.gameState.profile;

    // Nome
    const nameEl = document.getElementById('profile-name');
    if (nameEl && profile) {
        nameEl.textContent = profile.hunter_name;
    }

    // Nível
    const levelEl = document.getElementById('profile-level');
    if (levelEl && profile) {
        levelEl.textContent = `Nível ${profile.level}`;
    }

    // Estatísticas
    try {
        const logs = await diaryService.getLogs(1000);
        const inventory = window.gameState.inventory || [];

        const hunts = logs.filter(l => l.event_type === 'hunt_start').length;
        const kills = logs.filter(l => l.event_type === 'monster_killed').length;

        const statHunts = document.getElementById('stat-hunts');
        const statKills = document.getElementById('stat-kills');
        const statItems = document.getElementById('stat-items');

        if (statHunts) statHunts.textContent = hunts;
        if (statKills) statKills.textContent = kills;
        if (statItems) statItems.textContent = inventory.length;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Event listeners
window.addEventListener('profile:refresh', refreshProfile);

console.log('👤 Profile screen module loaded');
