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
        const inventory = await inventoryService.getInventory();
        window.gameState.inventory = inventory;

        console.log('📦 Dados carregados:', { profile, inventory: inventory.length });
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
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
    updateARHud
};
