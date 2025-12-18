/**
 * Hunters Web AR - Main Entry Point
 * Project Winchester
 */

import 'aframe';
import 'aframe-extras';

// Lib
import { router } from './src/lib/router.js';
import { authService, profileService, inventoryService, diaryService } from './src/lib/supabase.js';

// Data
import { getAllMonsters } from './src/data/monsters.js';
import { getItem } from './src/data/items.js';

// Screens
import './src/screens/splash.js';
import './src/screens/home.js';
import './src/screens/map.js';
import './src/screens/inventory.js';
import './src/screens/bestiary.js';
import './src/screens/diary.js';
import './src/screens/profile.js';

// Components AR
import './src/components/monster-spawner.js';
import './src/components/weapon.js';

// Systems
import './src/systems/game-manager.js';
import './src/systems/combat.js';
import './src/systems/geolocation.js';

console.log('🔫 Hunters Web AR - Iniciando...');

// Verificar contexto seguro (HTTPS)
if (!window.isSecureContext) {
    console.warn('⚠️ WebXR requer HTTPS. Algumas funcionalidades podem não funcionar.');
}

// Estado global do jogo
window.gameState = {
    user: null,
    profile: null,
    inventory: [],
    isAuthenticated: false,
    isInAR: false,
    selectedItem: null,
    playerHP: 100,
    maxPlayerHP: 100
};

/**
 * Inicialização do App
 */
async function initApp() {
    console.log('📱 Inicializando aplicação...');

    // Registrar telas no router
    registerScreens();

    // Configurar event listeners globais
    setupGlobalListeners();

    // Verificar autenticação existente
    const user = await authService.getCurrentUser();
    if (user) {
        console.log('✅ Usuário autenticado:', user.id);
        await onUserAuthenticated(user);
    } else {
        console.log('👤 Usuário não autenticado');
        router.init('splash-screen');
    }

    // Listener de mudanças de autenticação
    authService.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        if (event === 'SIGNED_IN' && session?.user) {
            await onUserAuthenticated(session.user);
        } else if (event === 'SIGNED_OUT') {
            window.gameState.user = null;
            window.gameState.profile = null;
            window.gameState.isAuthenticated = false;
            router.navigateTo('splash-screen');
        }
    });
}

/**
 * Registrar telas no router
 */
function registerScreens() {
    router.register('splash-screen', {
        onEnter: () => console.log('📺 Splash Screen'),
    });

    router.register('home-screen', {
        onEnter: () => {
            updateHomeGreeting();
            console.log('🏠 Home Screen');
        },
    });

    router.register('map-screen', {
        onEnter: () => {
            window.dispatchEvent(new CustomEvent('map:init'));
            console.log('🗺️ Map Screen');
        },
        onLeave: () => {
            window.dispatchEvent(new CustomEvent('map:cleanup'));
        }
    });

    router.register('inventory-screen', {
        onEnter: () => {
            window.dispatchEvent(new CustomEvent('inventory:refresh'));
            console.log('🎒 Inventory Screen');
        },
    });

    router.register('bestiary-screen', {
        onEnter: () => {
            window.dispatchEvent(new CustomEvent('bestiary:refresh'));
            console.log('📖 Bestiary Screen');
        },
    });

    router.register('diary-screen', {
        onEnter: () => {
            window.dispatchEvent(new CustomEvent('diary:refresh'));
            console.log('📓 Diary Screen');
        },
    });

    router.register('profile-screen', {
        onEnter: () => {
            window.dispatchEvent(new CustomEvent('profile:refresh'));
            console.log('👤 Profile Screen');
        },
    });

    router.register('ar-screen', {
        onEnter: () => {
            enterARMode();
            console.log('🔫 AR Screen');
        },
        onLeave: () => {
            exitARMode();
        }
    });
}

/**
 * Setup de listeners globais
 */
function setupGlobalListeners() {
    // Menu items na home
    document.querySelectorAll('.menu-item[data-screen]').forEach(item => {
        item.addEventListener('click', () => {
            const screen = item.dataset.screen;
            router.navigateTo(screen);
        });
    });

    // Botões de voltar
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            router.goBack();
        });
    });

    // Login anônimo
    document.getElementById('btn-login-anonymous')?.addEventListener('click', async () => {
        try {
            console.log('🔐 Tentando login anônimo...');
            await authService.signInAnonymously();
        } catch (error) {
            console.error('❌ Erro no login:', error);
            alert('Erro ao entrar. Tente novamente.');
        }
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
        try {
            await authService.signOut();
        } catch (error) {
            console.error('❌ Erro no logout:', error);
        }
    });

    // Fechar modais
    document.querySelectorAll('.modal-close, #modal-cancel, #monster-modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });

    // Botão de inventário no modo AR
    document.getElementById('ar-inventory-btn')?.addEventListener('click', () => {
        console.log('🎒 Abrindo inventário rápido no AR...');
        showARInventoryModal();
    });

    // Mini-mapa no modo AR (clicar para abrir mapa completo)
    document.getElementById('ar-minimap')?.addEventListener('click', () => {
        console.log('🗺️ Abrindo mapa do AR...');
        // Sair do AR e ir para o mapa
        router.navigateTo('map-screen');
    });
}

/**
 * Callback quando usuário autentica
 */
async function onUserAuthenticated(user) {
    window.gameState.user = user;
    window.gameState.isAuthenticated = true;

    try {
        // Carregar perfil
        const profile = await profileService.getProfile();
        window.gameState.profile = profile;

        if (profile) {
            window.gameState.playerHP = profile.current_hp;
            window.gameState.maxPlayerHP = profile.max_hp;
        }

        // Carregar inventário
        let inventory = await inventoryService.getInventory();

        // Se inventário vazio, adicionar itens de teste
        if (inventory.length === 0) {
            console.log('📦 Adicionando itens de teste ao inventário...');
            // Adicionar itens localmente para teste (sem precisar de banco)
            inventory = [
                { id: '1', item_key: 'iron_bar', quantity: 3 },
                { id: '2', item_key: 'silver_bullet', quantity: 12 },
                { id: '3', item_key: 'old_camera', quantity: 1 },
                { id: '4', item_key: 'salt_bag', quantity: 5 },
                { id: '5', item_key: 'first_aid', quantity: 2 },
                { id: '6', item_key: 'knife', quantity: 1 },
                { id: '7', item_key: 'holy_water', quantity: 3 },
                { id: '8', item_key: 'lighter', quantity: 1 }
            ];
        }

        window.gameState.inventory = inventory;

        console.log('📦 Dados carregados:', { profile, inventory: inventory.length });
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        // Mesmo com erro, adicionar itens de teste
        window.gameState.inventory = [
            { id: '1', item_key: 'iron_bar', quantity: 3 },
            { id: '2', item_key: 'silver_bullet', quantity: 12 },
            { id: '3', item_key: 'old_camera', quantity: 1 },
            { id: '4', item_key: 'salt_bag', quantity: 5 },
            { id: '5', item_key: 'first_aid', quantity: 2 },
            { id: '6', item_key: 'knife', quantity: 1 }
        ];
    }

    // Navegar para home
    router.navigateTo('home-screen');
}

/**
 * Atualizar saudação na home
 */
function updateHomeGreeting() {
    const greeting = document.getElementById('hunter-greeting');
    const profile = window.gameState.profile;

    if (greeting && profile) {
        greeting.textContent = `Olá, ${profile.hunter_name}!`;
    }
}

/**
 * Entrar no modo AR
 */
function enterARMode() {
    console.log('🎯 Entrando no modo AR...');

    const arScene = document.getElementById('ar-scene');
    const arHud = document.getElementById('ar-hud');
    const crosshair = document.getElementById('crosshair');

    if (arScene) {
        arScene.style.display = 'block';
    }

    if (arHud) {
        arHud.classList.add('active');
    }

    if (crosshair) {
        crosshair.classList.add('active');
    }

    window.gameState.isInAR = true;

    // Tentar entrar em AR nativo se disponível
    if (arScene && arScene.enterAR) {
        try {
            arScene.enterAR();
        } catch (e) {
            console.log('AR nativo não disponível, usando fallback');
        }
    }

    // Atualizar HUD
    updateARHud();
}

/**
 * Sair do modo AR
 */
function exitARMode() {
    console.log('👋 Saindo do modo AR...');

    const arScene = document.getElementById('ar-scene');
    const arHud = document.getElementById('ar-hud');
    const crosshair = document.getElementById('crosshair');

    if (arScene) {
        arScene.style.display = 'none';
        if (arScene.exitAR) {
            try {
                arScene.exitAR();
            } catch (e) { }
        }
    }

    if (arHud) {
        arHud.classList.remove('active');
    }

    if (crosshair) {
        crosshair.classList.remove('active');
    }

    window.gameState.isInAR = false;
}

/**
 * Atualizar HUD do AR
 */
function updateARHud() {
    const hpBar = document.getElementById('player-hp-bar');
    const hpText = document.getElementById('player-hp-text');

    if (hpBar && hpText) {
        const hp = window.gameState.playerHP;
        const maxHp = window.gameState.maxPlayerHP;
        const percentage = (hp / maxHp) * 100;

        hpBar.style.width = `${percentage}%`;
        hpText.textContent = `${hp}/${maxHp}`;

        // Mudar cor baseado no HP
        hpBar.classList.remove('high', 'medium', 'low');
        if (percentage > 60) {
            hpBar.classList.add('high');
        } else if (percentage > 30) {
            hpBar.classList.add('medium');
        } else {
            hpBar.classList.add('low');
        }
    }

    // Iniciar radar
    initRadar();
}

/**
 * Modal de inventário rápido no AR
 */
function showARInventoryModal() {
    const inventory = window.gameState.inventory || [];

    if (inventory.length === 0) {
        alert('Inventário vazio!');
        return;
    }

    // Criar lista de itens para seleção
    const itemNames = inventory.map((inv, index) => {
        const itemData = window.hunters.getItemData ? window.hunters.getItemData(inv.item_key) : null;
        const name = itemData ? itemData.name : inv.item_key;
        const icon = itemData ? itemData.icon : '📦';
        return `${index + 1}. ${icon} ${name} (${inv.quantity}x)`;
    }).join('\n');

    const selection = prompt(`Selecione um item (digite o número):\n\n${itemNames}`);

    if (selection) {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < inventory.length) {
            const selectedInv = inventory[index];
            window.gameState.selectedItem = {
                inventoryItem: selectedInv,
                data: { id: selectedInv.item_key }
            };
            console.log('🎯 Item selecionado:', selectedInv.item_key);
            alert(`Item selecionado: ${selectedInv.item_key}`);
        }
    }
}

/**
 * Inicializar radar/minimap
 */
function initRadar() {
    const canvas = document.getElementById('radar-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 45;

    // Desenhar radar
    function drawRadar() {
        // Limpar
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fundo
        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Círculos de distância
        ctx.strokeStyle = 'rgba(201, 162, 39, 0.3)';
        ctx.lineWidth = 1;
        [15, 30, 45].forEach(r => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Cruz central
        ctx.strokeStyle = 'rgba(201, 162, 39, 0.5)';
        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX, centerY + radius);
        ctx.stroke();

        // Jogador (centro)
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Monstros (pontos vermelhos) - posições simuladas
        const monsters = document.querySelectorAll('.monster');
        monsters.forEach(monster => {
            const pos = monster.getAttribute('position');
            if (pos) {
                // Converter posição 3D para 2D no radar (escala)
                const scale = radius / 10; // 10 metros = radius pixels
                const radarX = centerX + (pos.x * scale);
                const radarY = centerY + (pos.z * scale);

                // Verificar se está dentro do radar
                const dist = Math.sqrt(Math.pow(radarX - centerX, 2) + Math.pow(radarY - centerY, 2));
                if (dist < radius) {
                    ctx.fillStyle = '#8B0000';
                    ctx.beginPath();
                    ctx.arc(radarX, radarY, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        // Borda
        ctx.strokeStyle = '#C9A227';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Atualizar radar a cada 500ms
    setInterval(drawRadar, 500);
    drawRadar(); // Desenhar imediatamente
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Expor funções globais para debug
window.hunters = {
    router,
    gameState: window.gameState,
    updateARHud,
    showARInventoryModal
};

