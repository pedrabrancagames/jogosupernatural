/**
 * Dados dos Monstros
 * Hunters Web AR - Project Winchester
 * Baseado na série Supernatural
 */

export const monsters = {
    ghost: {
        id: 'ghost',
        name: 'Fantasma',
        nameEn: 'Ghost',
        model: 'ghost.glb',
        scale: 1.5,
        hp: 80,
        damage: 15,
        weakness: ['iron_bar'],
        visibleWith: 'old_camera',
        invisible: true,
        lore: 'Espíritos de pessoas que morreram de forma violenta ou com assuntos pendentes. Podem mover objetos e causar danos físicos aos vivos.',
        hint: 'Use a filmadora antiga para visualizá-los. Ataque com uma barra de ferro. Para eliminá-los permanentemente, você precisa encontrar e queimar seus ossos.',
        spawnWeight: 20,
        icon: '👻'
    },

    demon: {
        id: 'demon',
        name: 'Demônio',
        nameEn: 'Demon',
        model: 'demon.glb',
        scale: 1.8,
        hp: 200,
        damage: 30,
        weakness: ['devils_trap', 'bible'],
        defeatSequence: ['devils_trap', 'bible'],
        lore: 'Espíritos malignos do Inferno que possuem corpos humanos. Extremamente poderosos e manipuladores.',
        hint: 'Primeiro prenda-o com o Selo da Armadilha do Diabo. Depois use a Bíblia para exorcizá-lo com uma oração em latim.',
        spawnWeight: 10,
        icon: '😈'
    },

    werewolf: {
        id: 'werewolf',
        name: 'Lobisomem',
        nameEn: 'Werewolf',
        model: 'werewolf.glb',
        scale: 2.0,
        hp: 150,
        damage: 35,
        weakness: ['silver_bullet'],
        lore: 'Humanos amaldiçoados que se transformam em feras sob a lua cheia. Possuem força sobre-humana e garras mortais.',
        hint: 'Apenas balas de prata podem matá-los. Mire no coração para um tiro certeiro.',
        spawnWeight: 15,
        icon: '🐺'
    },

    vampire: {
        id: 'vampire',
        name: 'Vampiro',
        nameEn: 'Vampire',
        model: 'vampire.glb',
        scale: 1.7,
        hp: 180,
        damage: 25,
        weakness: ['dead_blood_blade', 'wooden_stake'],
        defeatSequence: ['dead_blood_blade', 'wooden_stake'],
        lore: 'Criaturas que sobrevivem bebendo sangue humano. Vivem em ninhos e são extremamente rápidos.',
        hint: 'Ataque com uma lâmina banhada em sangue de morto. Quando estiver fraco, finalize com uma estaca de madeira no coração.',
        spawnWeight: 12,
        icon: '🧛'
    },

    witch: {
        id: 'witch',
        name: 'Bruxa',
        nameEn: 'Witch',
        model: 'witch.glb',
        scale: 1.6,
        hp: 100,
        damage: 20,
        weakness: ['knife', 'revolver'],
        requiresPreparation: 'hex_bag',
        lore: 'Humanos que fizeram pactos com demônios em troca de poderes mágicos. Usam sacos de maldição para lançar feitiços.',
        hint: 'Primeiro encontre e destrua os sacos de maldição espalhados pela área. Só então a bruxa ficará vulnerável a armas comuns.',
        spawnWeight: 12,
        icon: '🧙‍♀️'
    },

    hellhound: {
        id: 'hellhound',
        name: 'Cão do Inferno',
        nameEn: 'Hellhound',
        model: 'hellhound.glb',
        scale: 1.8,
        hp: 160,
        damage: 40,
        weakness: ['angel_blade'],
        invisible: true,
        visibleWith: 'old_camera',
        protection: 'salt_circle',
        lore: 'Cães demoníacos invisíveis que caçam almas de pessoas que fizeram pactos. Extremamente ferozes.',
        hint: 'Use a filmadora para vê-lo. Crie um círculo de sal para se proteger. Depois ataque com a Lâmina de Anjo.',
        spawnWeight: 8,
        icon: '🐕‍🦺'
    },

    crossroads_demon: {
        id: 'crossroads_demon',
        name: 'Demônio da Encruzilhada',
        nameEn: 'Crossroads Demon',
        model: 'crossroads_demon.glb',
        scale: 1.7,
        hp: 180,
        damage: 25,
        weakness: ['devils_trap', 'bible'],
        defeatSequence: ['photo_box', 'devils_trap', 'bible'],
        spawnLocation: 'crossroads',
        lore: 'Demônios especiais que fazem pactos com humanos em encruzilhadas. Concedem desejos em troca de almas.',
        hint: 'Vá até uma encruzilhada, enterre a Caixa com Foto para invocá-lo. Prenda com o Selo e exorcize com a Bíblia.',
        spawnWeight: 5,
        icon: '🔴'
    },

    wendigo: {
        id: 'wendigo',
        name: 'Wendigo',
        nameEn: 'Wendigo',
        model: 'wendigo.glb',
        scale: 2.2,
        hp: 200,
        damage: 45,
        weakness: ['fire'],
        lore: 'Humanos que recorreram ao canibalismo e se transformaram em monstros. Extremamente rápidos e famintos eternamente.',
        hint: 'Wendigos só podem ser mortos com fogo. Use a garrafa com líquido inflamável e o isqueiro.',
        spawnWeight: 8,
        icon: '👹'
    }
};

/**
 * Obter monstro por ID
 */
export function getMonster(id) {
    return monsters[id] || null;
}

/**
 * Obter lista de monstros para spawn
 * Retorna array ponderado pelos spawnWeights
 */
export function getSpawnableMonsters() {
    const spawnable = [];
    Object.values(monsters).forEach(monster => {
        for (let i = 0; i < monster.spawnWeight; i++) {
            spawnable.push(monster.id);
        }
    });
    return spawnable;
}

/**
 * Obter todos os monstros visíveis no jogo
 */
export function getAllMonsters() {
    return Object.values(monsters);
}

/**
 * Verificar se item é fraqueza do monstro
 */
export function isWeakness(monsterId, itemKey) {
    const monster = monsters[monsterId];
    if (!monster) return false;
    return monster.weakness.includes(itemKey);
}

export default monsters;
