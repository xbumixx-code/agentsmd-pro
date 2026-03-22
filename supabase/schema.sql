-- AgentsMD.pro — Supabase Schema
-- Выполнить в: Supabase Dashboard → SQL Editor → New Query

-- ========================
-- ТАБЛИЦА: users
-- ========================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  usage_count INTEGER NOT NULL DEFAULT 0,
  ls_order_id TEXT,
  ls_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_plan_idx ON users(plan);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================
-- ТАБЛИЦА: generations
-- ========================
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  input_description TEXT NOT NULL,
  input_type TEXT CHECK (input_type IN ('code', 'research', 'ops', 'data')),
  input_technologies TEXT[],
  input_team_size TEXT CHECK (input_team_size IN ('solo', 'small', 'team')),
  output_content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS generations_user_id_idx ON generations(user_id);
CREATE INDEX IF NOT EXISTS generations_created_at_idx ON generations(created_at DESC);

-- ========================
-- RLS (Row Level Security)
-- ========================

-- Включить RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Политики для users
-- Сервисный ключ имеет полный доступ (service_role bypasses RLS)
-- Anon пользователи не имеют доступа к users напрямую (только через Worker с service key)

CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Политики для generations
CREATE POLICY "Service role full access on generations"
  ON generations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ========================
-- RPC ФУНКЦИИ
-- ========================

-- Атомарный инкремент usage_count (вызывается из Worker)
CREATE OR REPLACE FUNCTION increment_usage(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users SET usage_count = usage_count + 1 WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================
-- ПРОВЕРОЧНЫЕ ЗАПРОСЫ
-- ========================
-- После выполнения, убедиться что таблицы созданы:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- Ожидаемый результат: users, generations
