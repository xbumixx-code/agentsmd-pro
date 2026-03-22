# CLAUDE.md — AgentsMD.pro
## Инструкция для AI-агента (Claude Code / Cursor / любой LLM)

> Этот файл — главный источник правил. Читать **первым** перед любым действием.
> После каждого выполненного шага — обновлять `PROGRESS.md`.

---

## Что мы строим

**AgentsMD.pro** — веб-сервис, который генерирует файл `AGENTS.md` (инструкции для AI-агентов)
по краткому описанию проекта. Пользователь вводит описание → получает готовый `AGENTS.md` за 30 секунд.

**Ценность:** разработчики тратят часы на написание AGENTS.md / CLAUDE.md вручную.
Этот сервис делает это за 30 секунд с правильной структурой.

---

## Стек (не менять без явного разрешения)

| Слой | Инструмент | Зачем |
|------|-----------|-------|
| Frontend | Vanilla JS + HTML/CSS | CF Pages, без сборщика |
| Backend | Cloudflare Workers (JS) | Serverless, дёшево, быстро |
| БД | Supabase (PostgreSQL) | Auth + хранение истории |
| AI | Claude API (`claude-sonnet-4-20250514`) | Генерация AGENTS.md |
| Монетизация | Lemon Squeezy | One-time $19, webhooks |
| Deploy Frontend | Cloudflare Pages | CDN, бесплатно |
| Deploy Worker | Cloudflare Workers | Edge compute |

---

## Структура проекта (итоговая)

```
agentsmd-pro/
├── CLAUDE.md              ← этот файл, главные правила
├── TASKS.md               ← чеклист задач по дням
├── PROGRESS.md            ← лог выполненной работы (обновлять после каждого шага)
├── README.md              ← документация проекта
│
├── frontend/              ← CF Pages (статика)
│   ├── index.html         ← главная страница с формой
│   ├── result.html        ← страница результата
│   ├── landing.html       ← лендинг (маркетинг)
│   ├── css/
│   │   ├── main.css
│   │   └── landing.css
│   └── js/
│       ├── app.js         ← логика формы + вызов API
│       ├── result.js      ← рендер результата + действия
│       ├── auth.js        ← Supabase auth (magic link)
│       ├── paywall.js     ← проверка лимитов + upgrade modal
│       └── templates.js   ← 6 готовых шаблонов ввода
│
├── worker/                ← CF Worker (backend)
│   ├── index.js           ← роутер запросов
│   ├── generate.js        ← POST /generate → Claude API
│   ├── prompts.js         ← системный промпт для Claude
│   ├── webhook.js         ← POST /webhook/ls → обновить план
│   ├── paywall.js         ← проверка usage_count + plan
│   ├── db.js              ← Supabase клиент (REST API)
│   └── errors.js          ← обработка ошибок Claude API
│
├── supabase/
│   └── schema.sql         ← SQL для создания таблиц
│
└── wrangler.toml          ← конфиг Cloudflare Workers
```

---

## Правила работы агента

### 1. Порядок выполнения
- Всегда читать `TASKS.md` — там текущий активный шаг
- Выполнять задачи **строго по дням**, не перескакивать
- После каждой выполненной задачи: отметить в `TASKS.md` ✅ и записать в `PROGRESS.md`

### 2. Код
- Писать **только** те файлы, которые указаны в задаче дня
- Комментировать каждую функцию (одна строка — что делает)
- Использовать `console.log` с префиксом `[AgentsMD]` для дебага
- Все переменные окружения — через `wrangler.toml` или `.env`, никогда хардкодом

### 3. Суpabase
- Всегда использовать REST API (fetch), не SDK (Worker ограничен)
- RLS (Row Level Security) включать на всех таблицах
- Структуру таблиц менять только через `supabase/schema.sql`

### 4. Claude API
- Модель: всегда `claude-sonnet-4-20250514`
- max_tokens: 2000 (AGENTS.md обычно 800–1500 токенов)
- Temperature: не указывать (default)
- Промпт: хранить в `worker/prompts.js`, не инлайнить

### 5. Lemon Squeezy
- Webhook secret верифицировать через HMAC-SHA256
- При `order_created` → обновить `users.plan = 'pro'`
- При ошибке webhook → return 200 (иначе LS будет ретраить)

### 6. Что НЕ делать
- Не использовать npm/node_modules в Worker (только Web APIs)
- Не хранить API-ключи в коде
- Не добавлять React/Vue/фреймворки
- Не менять стек без явного запроса

---

## Переменные окружения

### CF Worker (wrangler.toml → secrets)
```
CLAUDE_API_KEY          = sk-ant-...
SUPABASE_URL            = https://xxx.supabase.co
SUPABASE_SERVICE_KEY    = eyJ...
LS_WEBHOOK_SECRET       = whsec_...
LS_CHECKOUT_URL         = https://agentsmd.lemonsqueezy.com/checkout/...
```

### Frontend (window._config или CF Pages env)
```
SUPABASE_URL            = https://xxx.supabase.co
SUPABASE_ANON_KEY       = eyJ...
API_BASE_URL            = https://api.agentsmd.pro
```

---

## API контракт

### POST /generate
**Request:**
```json
{
  "description": "Python FastAPI backend для SaaS, 2 разработчика, PostgreSQL",
  "type": "code",
  "technologies": ["Python", "FastAPI", "PostgreSQL"],
  "team_size": "solo | small | team",
  "auth_token": "supabase_jwt_or_null"
}
```
**Response 200:**
```json
{
  "content": "# AGENTS.md\n...",
  "tokens_used": 1240,
  "generation_id": "uuid"
}
```
**Response 402:**
```json
{
  "error": "limit_reached",
  "used": 3,
  "limit": 3,
  "checkout_url": "https://..."
}
```

### POST /webhook/ls
**Headers:** `X-Signature: sha256=...`
**Body:** Lemon Squeezy standard webhook payload

### GET /health
**Response:** `{ "status": "ok", "version": "1.0.0" }`

---

## Supabase схема

```sql
-- users: один ряд на пользователя
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  usage_count INTEGER NOT NULL DEFAULT 0,
  ls_order_id TEXT,
  ls_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- generations: история генераций
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  input_description TEXT NOT NULL,
  input_type TEXT,
  input_technologies TEXT[],
  output_content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS политики
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
```

---

## Системный промпт для Claude API

> Хранить в `worker/prompts.js` как экспортируемая константа.

```
You are an expert at writing AGENTS.md files — instruction files for AI coding agents
(Claude Code, Cursor, GitHub Copilot, etc.).

Given a project description, generate a complete, production-ready AGENTS.md file.

The file MUST include:
1. # Project Overview — what the project does (2-3 sentences)
2. ## Tech Stack — table with layer, tool, reason
3. ## Project Structure — directory tree with comments
4. ## Development Rules — numbered list of rules the agent must follow
5. ## Key Commands — bash commands to run, test, deploy
6. ## Architecture Decisions — 3-5 important decisions with rationale
7. ## What NOT to do — 5-10 explicit prohibitions

Rules for generation:
- Be specific, not generic. Use the actual tech from the description.
- Rules section should have 8-15 actionable rules, not vague statements.
- Include real file paths, not placeholders.
- Use markdown formatting consistently.
- Total length: 600-1500 words.
- Language: match the input language (Russian input → Russian output, English → English).

Output ONLY the markdown content of AGENTS.md, nothing else.
No preamble, no explanation, no code blocks wrapping.
```

---

## Free Tier логика

```javascript
// В worker/paywall.js
const FREE_LIMIT = 3;

async function checkAccess(userId, supabaseUrl, supabaseKey) {
  // 1. Получить пользователя из Supabase
  // 2. Если plan === 'pro' → разрешить
  // 3. Если usage_count >= FREE_LIMIT → вернуть { allowed: false, reason: 'limit_reached' }
  // 4. Иначе → инкрементировать usage_count, вернуть { allowed: true, remaining: FREE_LIMIT - count - 1 }
}
```

---

## Upgrade Modal (HTML)

```html
<!-- В frontend/js/paywall.js создавать динамически -->
<div class="upgrade-modal">
  <h2>Вы использовали все 3 бесплатных генерации</h2>
  <p>Pro открывает безлимитные генерации + историю всех файлов</p>
  <a href="{LS_CHECKOUT_URL}" class="btn-primary">Получить Pro — $19</a>
  <a href="#" class="btn-secondary" onclick="closeModal()">Продолжить с Free</a>
</div>
```

---

## Критерий "MVP готов"

- [ ] `POST /generate` возвращает корректный AGENTS.md за < 10 сек
- [ ] Free tier блокирует после 3 генераций, показывает modal
- [ ] Оплата $19 в LS → `plan` меняется на `pro` автоматически
- [ ] Лендинг опубликован на домене с кнопкой Buy
- [ ] Весь флоу работает без участия разработчика
- [ ] `PROGRESS.md` заполнен по всем 10 дням
- [ ] `README.md` содержит инструкцию по деплою
