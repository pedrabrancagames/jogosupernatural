-- =====================================================
-- Hunters Web AR - Database Schema
-- Supabase PostgreSQL
-- =====================================================

-- Tabela de Perfis de Jogadores
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    hunter_name TEXT NOT NULL DEFAULT 'Caçador',
    email TEXT,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    max_hp INTEGER DEFAULT 100,
    current_hp INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Inventário
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    item_key TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    equipped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida de inventário por usuário
CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory(user_id);

-- Tabela de Diário (Logs de Eventos)
CREATE TABLE IF NOT EXISTS diary_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    event_description TEXT NOT NULL,
    monster_type TEXT,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    damage_taken INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca de logs por usuário e data
CREATE INDEX IF NOT EXISTS idx_diary_user_date ON diary_logs(user_id, created_at DESC);

-- Tabela de Monstros Ativos no Mapa (Spawns)
CREATE TABLE IF NOT EXISTS monster_spawns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    monster_type TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    hp INTEGER NOT NULL,
    spawned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour',
    defeated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Índice geoespacial para busca de monstros próximos
CREATE INDEX IF NOT EXISTS idx_monster_location ON monster_spawns(latitude, longitude);

-- Tabela de Loots no Mapa
CREATE TABLE IF NOT EXISTS loot_spawns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_key TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    spawned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 minutes',
    collected_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Índice geoespacial para busca de loots próximos
CREATE INDEX IF NOT EXISTS idx_loot_location ON loot_spawns(latitude, longitude);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monster_spawns ENABLE ROW LEVEL SECURITY;
ALTER TABLE loot_spawns ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para inventory
CREATE POLICY "Users can view own inventory" ON inventory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own inventory" ON inventory
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para diary_logs
CREATE POLICY "Users can view own diary" ON diary_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries" ON diary_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para monster_spawns (todos podem ver, só sistema modifica)
CREATE POLICY "Anyone can view active monsters" ON monster_spawns
    FOR SELECT USING (expires_at > NOW() AND defeated_by IS NULL);

-- Políticas para loot_spawns (todos podem ver, só sistema modifica)
CREATE POLICY "Anyone can view active loots" ON loot_spawns
    FOR SELECT USING (expires_at > NOW() AND collected_by IS NULL);

-- =====================================================
-- Funções e Triggers
-- =====================================================

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, hunter_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'hunter_name', 'Caçador'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil após signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
