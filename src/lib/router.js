/**
 * Simple SPA Router
 * Hunters Web AR - Project Winchester
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentScreen = null;
        this.history = [];

        // Bind do botão voltar do navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.screen) {
                this.navigateTo(e.state.screen, false);
            }
        });
    }

    /**
     * Registrar uma rota/tela
     */
    register(screenId, { onEnter, onLeave } = {}) {
        this.routes[screenId] = {
            element: document.getElementById(screenId),
            onEnter,
            onLeave
        };
    }

    /**
     * Navegar para uma tela
     */
    navigateTo(screenId, pushState = true) {
        const route = this.routes[screenId];
        if (!route) {
            console.error(`Tela não encontrada: ${screenId}`);
            return;
        }

        // Esconder tela atual
        if (this.currentScreen && this.routes[this.currentScreen]) {
            const currentRoute = this.routes[this.currentScreen];
            if (currentRoute.element) {
                currentRoute.element.style.display = 'none';
                currentRoute.element.classList.remove('active');
            }
            if (currentRoute.onLeave) {
                currentRoute.onLeave();
            }
        }

        // Mostrar nova tela
        if (route.element) {
            route.element.style.display = 'flex';
            route.element.classList.add('active');
        }

        // Callback de entrada
        if (route.onEnter) {
            route.onEnter();
        }

        // Atualizar histórico
        if (pushState && this.currentScreen) {
            this.history.push(this.currentScreen);
            window.history.pushState({ screen: screenId }, '', `#${screenId}`);
        }

        this.currentScreen = screenId;

        // Emitir evento de navegação
        window.dispatchEvent(new CustomEvent('screenchange', {
            detail: { screen: screenId }
        }));
    }

    /**
     * Voltar para tela anterior
     */
    goBack() {
        if (this.history.length > 0) {
            const previousScreen = this.history.pop();
            this.navigateTo(previousScreen, false);
            window.history.back();
        } else {
            // Se não há histórico, vai para home
            this.navigateTo('home-screen', false);
        }
    }

    /**
     * Obter tela atual
     */
    getCurrentScreen() {
        return this.currentScreen;
    }

    /**
     * Verificar se pode voltar
     */
    canGoBack() {
        return this.history.length > 0;
    }

    /**
     * Inicializar router com tela inicial
     */
    init(initialScreen = 'splash-screen') {
        // Esconder todas as telas
        Object.values(this.routes).forEach(route => {
            if (route.element) {
                route.element.style.display = 'none';
                route.element.classList.remove('active');
            }
        });

        // Verificar hash na URL
        const hash = window.location.hash.replace('#', '');
        const startScreen = hash && this.routes[hash] ? hash : initialScreen;

        this.navigateTo(startScreen, false);
    }
}

// Instância global do router
export const router = new Router();

export default router;
