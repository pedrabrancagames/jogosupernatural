/**
 * Supabase Client Configuration
 * Hunters Web AR - Project Winchester
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = 'https://fjfenjzcbyfpinerdmlt.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // TODO: Substituir pela chave real

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Serviço de Autenticação
 */
export const authService = {
    /**
     * Login anônimo (para jogar sem cadastro)
     */
    async signInAnonymously() {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        return data;
    },

    /**
     * Login com email e senha
     */
    async signInWithEmail(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    /**
     * Cadastro com email e senha
     */
    async signUpWithEmail(email, password, hunterName) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    hunter_name: hunterName
                }
            }
        });
        if (error) throw error;
        return data;
    },

    /**
     * Logout
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Obter usuário atual
     */
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    /**
     * Listener de mudanças de autenticação
     */
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

/**
 * Serviço de Perfil do Jogador
 */
export const profileService = {
    /**
     * Obter perfil do jogador atual
     */
    async getProfile() {
        const user = await authService.getCurrentUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Atualizar perfil
     */
    async updateProfile(updates) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Não autenticado');

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Atualizar HP do jogador
     */
    async updateHP(newHP) {
        return this.updateProfile({ current_hp: Math.max(0, newHP) });
    }
};

/**
 * Serviço de Inventário
 */
export const inventoryService = {
    /**
     * Obter inventário do jogador
     */
    async getInventory() {
        const user = await authService.getCurrentUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .eq('user_id', user.id);

        if (error) throw error;
        return data || [];
    },

    /**
     * Adicionar item ao inventário
     */
    async addItem(itemKey, quantity = 1) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Não autenticado');

        // Verificar se já tem o item
        const { data: existing } = await supabase
            .from('inventory')
            .select('*')
            .eq('user_id', user.id)
            .eq('item_key', itemKey)
            .single();

        if (existing) {
            // Atualizar quantidade
            const { data, error } = await supabase
                .from('inventory')
                .update({ quantity: existing.quantity + quantity })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            // Criar novo
            const { data, error } = await supabase
                .from('inventory')
                .insert({
                    user_id: user.id,
                    item_key: itemKey,
                    quantity
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    /**
     * Remover item do inventário
     */
    async removeItem(itemKey, quantity = 1) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Não autenticado');

        const { data: existing } = await supabase
            .from('inventory')
            .select('*')
            .eq('user_id', user.id)
            .eq('item_key', itemKey)
            .single();

        if (!existing || existing.quantity < quantity) {
            throw new Error('Item insuficiente');
        }

        if (existing.quantity === quantity) {
            // Deletar
            await supabase.from('inventory').delete().eq('id', existing.id);
            return null;
        } else {
            // Atualizar quantidade
            const { data, error } = await supabase
                .from('inventory')
                .update({ quantity: existing.quantity - quantity })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    /**
     * Equipar item
     */
    async equipItem(itemId) {
        const { data, error } = await supabase
            .from('inventory')
            .update({ equipped: true })
            .eq('id', itemId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

/**
 * Serviço de Diário
 */
export const diaryService = {
    /**
     * Obter logs do diário
     */
    async getLogs(limit = 50) {
        const user = await authService.getCurrentUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('diary_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    /**
     * Adicionar entrada no diário
     */
    async addLog(entry) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Não autenticado');

        const { data, error } = await supabase
            .from('diary_logs')
            .insert({
                user_id: user.id,
                ...entry
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

export default supabase;
