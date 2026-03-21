# AgentsMD.pro

> Генератор `AGENTS.md` файлов для AI-агентов. Описание проекта → готовый файл за 30 секунд.

[![Deploy Status](https://img.shields.io/badge/deploy-cloudflare-orange)](https://agentsmd.pro)
[![Stack](https://img.shields.io/badge/stack-CF_Workers_+_Supabase-blue)](https://agentsmd.pro)

---

## Что это

`AGENTS.md` — файл инструкций для AI-агентов (Claude Code, Cursor, GitHub Copilot).
Правильно написанный AGENTS.md в разы улучшает качество работы AI с вашим кодом.

**Проблема:** написать хороший AGENTS.md вручную — 1-2 часа и нужна экспертиза.
**Решение:** описать проект в одном поле → получить готовый файл за 30 секунд.

---

## Быстрый старт (для разработчика)

### Требования
- Cloudflare аккаунт (Workers + Pages)
- Supabase аккаунт
- Lemon Squeezy аккаунт
- Anthropic API key
- Node.js 18+ (для Wrangler)

### 1. Клонировать репо
```bash
git clone https://github.com/yourusername/agentsmd-pro
cd agentsmd-pro
```

### 2. Установить Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 3. Настроить Supabase
Открыть `supabase/schema.sql`, выполнить в Supabase SQL Editor.

### 4. Добавить секреты в CF Worker
```bash
wrangler secret put CLAUDE_API_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put LS_WEBHOOK_SECRET
wrangler secret put LS_CHECKOUT_URL
```

### 5. Добавить публичные переменные в frontend
Создать `frontend/js/config.js`:
```javascript
window._config = {
  SUPABASE_URL: 'https://xxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJ...',
  API_BASE_URL: 'https://api.agentsmd.pro'
};
```

### 6. Деплой Worker
```bash
cd worker
wrangler deploy
```

### 7. Деплой Frontend (CF Pages)
```bash
wrangler pages deploy frontend/ --project-name agentsmd-pro
```

### 8. Настроить домен
В CF Dashboard: Pages → Custom domains → `agentsmd.pro`
В CF Dashboard: Workers → Triggers → Route `api.agentsmd.pro/*`

---

## Архитектура

```
User browser
    │
    ├─ agentsmd.pro ──────────────── CF Pages (static)
    │                                  ├── index.html (форма)
    │                                  ├── result.html (результат)
    │                                  └── landing.html (лендинг)
    │
    └─ api.agentsmd.pro ──────────── CF Worker (backend)
                                       ├── POST /generate ──► Claude API
                                       ├── POST /webhook/ls ──► Supabase
                                       └── GET /health

Claude API ◄──── worker/generate.js ◄──── форма пользователя
Supabase ◄────── worker/db.js ◄────────── каждый запрос
Lemon Squeezy ──► worker/webhook.js ────► Supabase (план)
```

---

## API Reference

### POST /generate

Генерирует AGENTS.md на основе описания проекта.

**Request:**
```json
{
  "description": "Python FastAPI backend, 1 разработчик, PostgreSQL, деплой Railway",
  "type": "code",
  "technologies": ["Python", "FastAPI", "PostgreSQL"],
  "team_size": "solo",
  "language": "auto",
  "auth_token": "supabase_jwt (опционально)"
}
```

**Response 200:**
```json
{
  "content": "# AGENTS.md\n\n## Project Overview\n...",
  "tokens_used": 1240,
  "generation_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 402 (free limit reached):**
```json
{
  "error": "limit_reached",
  "used": 3,
  "limit": 3,
  "checkout_url": "https://agentsmd.lemonsqueezy.com/checkout/..."
}
```

**Response 400 (validation error):**
```json
{
  "error": "validation_error",
  "message": "description is required and must be at least 20 characters"
}
```

---

### GET /health

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-01-15T10:30:00Z"
}
```

---

### POST /webhook/ls

Lemon Squeezy webhook. Верифицирует HMAC-SHA256 подпись.

**Headers:**
```
X-Signature: sha256=abc123...
Content-Type: application/json
```

Всегда возвращает 200 (даже при ошибке — для предотвращения ретраев LS).

---

## База данных

### Таблица `users`

| Колонка | Тип | Описание |
|---------|-----|---------|
| id | UUID | Primary key |
| email | TEXT | Уникальный email |
| plan | TEXT | 'free' или 'pro' |
| usage_count | INTEGER | Счётчик генераций (free tier) |
| ls_order_id | TEXT | ID заказа Lemon Squeezy |
| ls_customer_id | TEXT | ID покупателя LS |
| created_at | TIMESTAMPTZ | Дата регистрации |
| updated_at | TIMESTAMPTZ | Дата обновления |

### Таблица `generations`

| Колонка | Тип | Описание |
|---------|-----|---------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id (nullable для анонимов) |
| input_description | TEXT | Описание проекта от пользователя |
| input_type | TEXT | Тип агента (code/research/ops) |
| input_technologies | TEXT[] | Массив технологий |
| output_content | TEXT | Сгенерированный AGENTS.md |
| tokens_used | INTEGER | Токены Claude API |
| created_at | TIMESTAMPTZ | Дата генерации |

---

## Монетизация

### Free tier
- 3 генерации (lifetime, не сбрасываются)
- Все шаблоны доступны
- Копирование и скачивание работает
- Без истории

### Pro — $19 one-time
- Безлимитные генерации
- История всех файлов
- 6 кастомных шаблонов
- (планируется) API доступ

### Как работает оплата
1. Free user нажимает «Получить Pro»
2. Редирект на Lemon Squeezy checkout
3. После оплаты: LS отправляет webhook на `/webhook/ls`
4. Worker верифицирует подпись, обновляет `users.plan = 'pro'`
5. При следующей генерации — paywall не срабатывает

---

## Переменные окружения

### Worker (CF Worker secrets)

| Переменная | Описание | Где взять |
|-----------|---------|----------|
| `CLAUDE_API_KEY` | Anthropic API key | console.anthropic.com |
| `SUPABASE_URL` | URL Supabase проекта | Supabase Dashboard → Settings |
| `SUPABASE_SERVICE_KEY` | Service role key (полный доступ) | Supabase → API → service_role |
| `LS_WEBHOOK_SECRET` | Webhook signing secret | LS Dashboard → Webhooks |
| `LS_CHECKOUT_URL` | URL Checkout страницы продукта | LS Dashboard → Products |

### Frontend (window._config)

| Переменная | Описание |
|-----------|---------|
| `SUPABASE_URL` | URL Supabase (тот же) |
| `SUPABASE_ANON_KEY` | Anon key (публичный) |
| `API_BASE_URL` | URL CF Worker |

---

## Локальная разработка

```bash
# Запустить Worker локально
cd worker
wrangler dev --local

# Worker будет доступен на http://localhost:8787
# Frontend открывать напрямую: frontend/index.html в браузере

# Проверить health
curl http://localhost:8787/health

# Тест генерации (нужен Claude API key)
curl -X POST http://localhost:8787/generate \
  -H "Content-Type: application/json" \
  -d '{"description":"Python FastAPI backend для SaaS, 1 разработчик","type":"code"}'
```

---

## Деплой

```bash
# Worker
wrangler deploy

# Frontend (CF Pages)
wrangler pages deploy frontend/ --project-name agentsmd-pro

# Проверить деплой
curl https://api.agentsmd.pro/health
```

---

## Мониторинг

- **CF Worker Logs:** CF Dashboard → Workers → Logs
- **Supabase Logs:** Supabase Dashboard → Logs
- **Lemon Squeezy:** LS Dashboard → Webhooks → Delivery Logs

### Ключевые метрики для отслеживания
- Среднее время генерации (< 10 сек норма)
- Конверсия Free → Pro (цель: > 5%)
- Ошибки Claude API (rate limits, timeouts)
- Webhook failures в LS

---

## FAQ

**Q: Почему Vanilla JS, а не React?**
A: CF Pages + без сборщика = деплой за 10 секунд. Проект простой, фреймворк лишний.

**Q: Почему $19 one-time, а не подписка?**
A: Целевой пользователь настраивает проект 1-2 раза. Подписка снижает конверсию. One-time — низкий friction.

**Q: Что будет с free лимитом после оплаты?**
A: `usage_count` не сбрасывается, но paywall проверяет `plan` первым — pro всегда проходит.

**Q: Можно ли использовать без авторизации?**
A: Да, 1 генерация доступна анонимно (без сохранения в историю). При попытке второй — просят войти.

---

## Структура файлов (полная)

```
agentsmd-pro/
├── CLAUDE.md              ← правила для AI-агентов
├── TASKS.md               ← чеклист задач
├── PROGRESS.md            ← лог работы
├── README.md              ← этот файл
├── wrangler.toml          ← конфиг CF Workers
│
├── frontend/
│   ├── index.html
│   ├── result.html
│   ├── landing.html
│   ├── css/
│   │   ├── main.css
│   │   └── landing.css
│   └── js/
│       ├── config.js      ← публичные env vars
│       ├── app.js
│       ├── result.js
│       ├── auth.js
│       ├── paywall.js
│       └── templates.js
│
├── worker/
│   ├── index.js
│   ├── generate.js
│   ├── prompts.js
│   ├── webhook.js
│   ├── paywall.js
│   ├── db.js
│   └── errors.js
│
└── supabase/
    └── schema.sql
```

---

## Лицензия

MIT — используй как хочешь, атрибуция приветствуется.

---

*Построено за 10 дней. Pavel × Claude Code.*
