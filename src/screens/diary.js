/**
 * Diary Screen
 * Hunters Web AR
 */

import { diaryService } from '../lib/supabase.js';

/**
 * Formatar data para exibição
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Atualizar lista do diário
 */
async function refreshDiary() {
    const list = document.getElementById('diary-list');
    const emptyState = document.getElementById('diary-empty');

    if (!list) return;

    try {
        const logs = await diaryService.getLogs(50);

        if (logs.length === 0) {
            list.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        list.style.display = 'flex';
        if (emptyState) emptyState.style.display = 'none';

        list.innerHTML = logs.map(log => `
            <div class="diary-entry">
                <div class="diary-date">${formatDate(log.created_at)}</div>
                <div class="diary-event">${log.event_description}</div>
                ${log.location_name ? `<div class="diary-location">📍 ${log.location_name}</div>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar diário:', error);
        list.innerHTML = '<div class="empty-state"><p>Erro ao carregar diário</p></div>';
    }
}

// Event listeners
window.addEventListener('diary:refresh', refreshDiary);

console.log('📓 Diary screen module loaded');
