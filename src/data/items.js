/**
 * Dados dos Itens
 * Hunters Web AR - Project Winchester
 * Baseado na série Supernatural
 */

export const items = {
    // ==========================================
    // ARMAS
    // ==========================================

    iron_bar: {
        id: 'iron_bar',
        name: 'Barra de Ferro',
        description: 'Uma barra de ferro puro. Eficaz contra fantasmas.',
        type: 'weapon',
        icon: '🔩',
        damage: 25,
        effectiveAgainst: ['ghost'],
        consumable: false,
        arImage: '/assets/weapons/iron_bar.png'
    },

    silver_bullet: {
        id: 'silver_bullet',
        name: 'Bala de Prata',
        description: 'Munição especial de prata pura. Letal para lobisomens.',
        type: 'ammo',
        icon: '🔫',
        damage: 50,
        effectiveAgainst: ['werewolf'],
        consumable: true,
        stackable: true,
        maxStack: 12
    },

    revolver: {
        id: 'revolver',
        name: 'Revólver',
        description: 'Revólver para balas especiais.',
        type: 'weapon',
        icon: '🔫',
        damage: 20,
        requiresAmmo: 'silver_bullet',
        effectiveAgainst: ['witch'],
        consumable: false,
        arImage: '/assets/weapons/revolver.png'
    },

    knife: {
        id: 'knife',
        name: 'Faca de Caça',
        description: 'Faca afiada. Útil contra humanos e bruxas.',
        type: 'weapon',
        icon: '🔪',
        damage: 15,
        effectiveAgainst: ['witch'],
        consumable: false,
        arImage: '/assets/weapons/knife.png'
    },

    angel_blade: {
        id: 'angel_blade',
        name: 'Lâmina de Anjo',
        description: 'Lâmina celestial capaz de matar quase qualquer criatura sobrenatural.',
        type: 'weapon',
        icon: '⚔️',
        damage: 60,
        effectiveAgainst: ['hellhound', 'demon', 'angel'],
        consumable: false,
        rare: true,
        arImage: '/assets/weapons/angel_blade.png'
    },

    dead_blood_blade: {
        id: 'dead_blood_blade',
        name: 'Lâmina com Sangue do Morto',
        description: 'Lâmina banhada em sangue de morto. Enfraquece vampiros.',
        type: 'weapon',
        icon: '🗡️',
        damage: 35,
        effectiveAgainst: ['vampire'],
        consumable: false,
        arImage: '/assets/weapons/blood_blade.png'
    },

    wooden_stake: {
        id: 'wooden_stake',
        name: 'Estaca de Madeira',
        description: 'Estaca de madeira afiada. Finaliza vampiros enfraquecidos.',
        type: 'weapon',
        icon: '🪵',
        damage: 100,
        effectiveAgainst: ['vampire'],
        finisher: true,
        consumable: true
    },

    // ==========================================
    // ITENS DE APOIO
    // ==========================================

    old_camera: {
        id: 'old_camera',
        name: 'Filmadora Antiga',
        description: 'Uma filmadora antiga. Revela criaturas invisíveis.',
        type: 'support',
        icon: '📹',
        effect: 'reveal_invisible',
        reveals: ['ghost', 'hellhound'],
        consumable: false
    },

    devils_trap: {
        id: 'devils_trap',
        name: 'Selo da Armadilha do Diabo',
        description: 'Um selo místico que imobiliza demônios.',
        type: 'support',
        icon: '⭐',
        effect: 'immobilize',
        effectiveAgainst: ['demon', 'crossroads_demon'],
        consumable: true,
        stackable: true,
        maxStack: 5
    },

    bible: {
        id: 'bible',
        name: 'Bíblia',
        description: 'Texto sagrado. Usada para exorcismos.',
        type: 'support',
        icon: '📖',
        effect: 'exorcism',
        effectiveAgainst: ['demon', 'crossroads_demon'],
        consumable: false,
        audioOnUse: '/sounds/exorcism.mp3'
    },

    salt_bag: {
        id: 'salt_bag',
        name: 'Saco de Sal',
        description: 'Sal grosso. Cria barreiras protetoras.',
        type: 'support',
        icon: '🧂',
        effect: 'protection_circle',
        consumable: true,
        stackable: true,
        maxStack: 10
    },

    photo_box: {
        id: 'photo_box',
        name: 'Caixa com Foto',
        description: 'Caixa para invocar demônios da encruzilhada.',
        type: 'support',
        icon: '📦',
        effect: 'summon',
        effectiveAgainst: ['crossroads_demon'],
        consumable: true,
        stackable: true,
        maxStack: 3
    },

    // ==========================================
    // ITENS DE FOGO
    // ==========================================

    flammable_bottle: {
        id: 'flammable_bottle',
        name: 'Garrafa Inflamável',
        description: 'Líquido altamente inflamável.',
        type: 'weapon',
        icon: '🍾',
        requiresItem: 'lighter',
        damage: 40,
        effectiveAgainst: ['wendigo'],
        consumable: true,
        stackable: true,
        maxStack: 5
    },

    lighter: {
        id: 'lighter',
        name: 'Isqueiro',
        description: 'Isqueiro Zippo. Essencial para criar fogo.',
        type: 'support',
        icon: '🔥',
        effect: 'ignite',
        consumable: false
    },

    // ==========================================
    // ITENS DE CURA
    // ==========================================

    first_aid: {
        id: 'first_aid',
        name: 'Kit de Primeiros Socorros',
        description: 'Restaura 50 pontos de vida.',
        type: 'healing',
        icon: '🩹',
        healAmount: 50,
        consumable: true,
        stackable: true,
        maxStack: 5
    },

    holy_water: {
        id: 'holy_water',
        name: 'Água Benta',
        description: 'Água benzida. Causa dano a demônios e cura maldições.',
        type: 'healing',
        icon: '💧',
        healAmount: 20,
        damage: 30,
        effectiveAgainst: ['demon'],
        consumable: true,
        stackable: true,
        maxStack: 10
    },

    // ==========================================
    // ITENS ESPECIAIS
    // ==========================================

    hex_bag: {
        id: 'hex_bag',
        name: 'Saco de Maldição',
        description: 'Saco usado por bruxas. Destrua para enfraquecê-las.',
        type: 'special',
        icon: '👜',
        effect: 'weaken_witch',
        droppedBy: 'witch',
        consumable: true
    },

    bones: {
        id: 'bones',
        name: 'Ossos',
        description: 'Ossos do fantasma. Queime para eliminá-lo permanentemente.',
        type: 'special',
        icon: '🦴',
        effect: 'destroy_ghost',
        consumable: true
    }
};

/**
 * Obter item por ID
 */
export function getItem(id) {
    return items[id] || null;
}

/**
 * Obter itens por tipo
 */
export function getItemsByType(type) {
    return Object.values(items).filter(item => item.type === type);
}

/**
 * Obter armas
 */
export function getWeapons() {
    return getItemsByType('weapon');
}

/**
 * Obter itens de apoio
 */
export function getSupportItems() {
    return getItemsByType('support');
}

/**
 * Obter itens de cura
 */
export function getHealingItems() {
    return getItemsByType('healing');
}

/**
 * Verificar se item é eficaz contra monstro
 */
export function isEffectiveAgainst(itemId, monsterId) {
    const item = items[itemId];
    if (!item || !item.effectiveAgainst) return false;
    return item.effectiveAgainst.includes(monsterId);
}

export default items;
