# TASKS.md — AgentsMD.pro
## Чеклист задач по дням

> Агент: перед стартом читай `CLAUDE.md`. После каждой задачи — ставь ✅ и пиши в `PROGRESS.md`.
> Не переходи к следующему дню, пока не выполнена проверка текущего.

---

## Блок 0 — Подготовка (до старта, 30 мин)

- [ ] **0.1** Создать репозиторий `agentsmd-pro` на GitHub
- [ ] **0.2** Создать аккаунт Cloudflare, установить Wrangler CLI (`npm install -g wrangler`)
- [ ] **0.3** Создать проект в Supabase, скопировать `SUPABASE_URL` и `SUPABASE_ANON_KEY`
- [ ] **0.4** Создать аккаунт Lemon Squeezy, создать продукт «AgentsMD Pro» one-time $19
- [ ] **0.5** Получить `CLAUDE_API_KEY` на console.anthropic.com
- [ ] **0.6** Заполнить `wrangler.toml` секретами (через `wrangler secret put`)
- [ ] **0.7** Создать структуру папок согласно `CLAUDE.md → Структура проекта`

**Проверка блока 0:** `wrangler dev` запускается без ошибок, Supabase dashboard открывается.

---

## День 1 — Scaffold + базовый UI

### Задачи
- [ ] **1.1** Создать `wrangler.toml` с роутингом и переменными
- [ ] **1.2** Создать `worker/index.js` — роутер: GET /health, POST /generate (заглушка)
- [ ] **1.3** Создать `frontend/index.html` — форма с полями:
  - Textarea «Опиши свой проект» (placeholder с примером)
  - Select «Тип агента»: code / research / ops / data
  - Input «Технологии» (через запятую)
  - Select «Размер команды»: solo / small (2-5) / team (5+)
  - Кнопка «Сгенерировать AGENTS.md»
- [ ] **1.4** Создать `frontend/css/main.css` — базовые стили (чистый, минималистичный UI)
- [ ] **1.5** Создать `frontend/js/app.js` — перехват submit формы, fetch к `/generate`, показ лоадера

### Файлы дня
```
wrangler.toml
worker/index.js
frontend/index.html
frontend/css/main.css
frontend/js/app.js
```

### Проверка
```bash
wrangler dev
# Открыть http://localhost:8787
# Форма отображается корректно
# Кнопка отправляет запрос (в консоли виден fetch)
# GET /health возвращает { "status": "ok" }
```

---

## День 2 — Core логика: промпт → AGENTS.md

### Задачи
- [ ] **2.1** Создать `worker/prompts.js` — системный промпт (из `CLAUDE.md → Системный промпт`)
- [ ] **2.2** Создать `worker/generate.js`:
  - Принять POST тело: `{ description, type, technologies, team_size }`
  - Валидация: description обязателен, минимум 20 символов
  - Сформировать user message из полей формы
  - Вызвать Claude API (`claude-sonnet-4-20250514`, max_tokens: 2000)
  - Вернуть `{ content, tokens_used, generation_id: crypto.randomUUID() }`
- [ ] **2.3** Подключить `generate.js` в `worker/index.js`
- [ ] **2.4** Обновить `frontend/js/app.js` — после ответа API перейти на `result.html?id=...` или показать результат инлайн
- [ ] **2.5** Создать `frontend/result.html` — минимальная страница: показать сырой текст ответа

### Файлы дня
```
worker/prompts.js
worker/generate.js
worker/index.js  (обновить)
frontend/js/app.js  (обновить)
frontend/result.html
```

### Проверка
```bash
wrangler dev
# Заполнить форму: "Python FastAPI backend, 1 разработчик, PostgreSQL"
# Нажать кнопать — через 5-10 сек появляется текст AGENTS.md
# В логах воркера виден вызов Claude API
# Ответ содержит секции: Tech Stack, Project Structure, Rules
```

---

## День 3 — Supabase: Auth + сохранение истории

### Задачи
- [ ] **3.1** Создать `supabase/schema.sql` — SQL из `CLAUDE.md → Supabase схема`, выполнить в Supabase SQL Editor
- [ ] **3.2** Создать `worker/db.js` — функции для работы с Supabase REST API:
  - `getUser(email)` — найти пользователя
  - `createUser(email)` — создать с plan='free', usage_count=0
  - `updateUserPlan(email, plan, orderId)` — обновить план
  - `incrementUsage(userId)` — +1 к usage_count
  - `saveGeneration(userId, input, output, tokens)` — сохранить генерацию
- [ ] **3.3** Создать `frontend/js/auth.js` — Supabase magic link через REST API:
  - `signIn(email)` — отправить magic link
  - `getSession()` — получить текущую сессию из localStorage
  - `signOut()` — очистить сессию
- [ ] **3.4** Добавить в `frontend/index.html` блок авторизации:
  - Если не авторизован: поле email + кнопка «Войти / Получить доступ»
  - Если авторизован: показать email + счётчик «Использовано X из 3»
- [ ] **3.5** Обновить `worker/generate.js` — если есть auth_token в запросе:
  - Декодировать JWT (проверить exp)
  - Получить email из payload
  - Найти/создать пользователя в Supabase
  - Сохранить генерацию

### Файлы дня
```
supabase/schema.sql
worker/db.js
frontend/js/auth.js
frontend/index.html  (обновить)
worker/generate.js  (обновить)
```

### Проверка
```bash
# В Supabase Dashboard: таблицы users и generations созданы
# Magic link приходит на email
# После генерации: в таблице generations появляется запись
# Счётчик на странице показывает корректное число
```

---

## День 4 — Превью + UX: подсветка кода, шаблоны, кнопки действий

### Задачи
- [ ] **4.1** Обновить `frontend/result.html` — добавить:
  - Рендер markdown с подсветкой (подключить `highlight.js` с CDN cdnjs.cloudflare.com)
  - Кнопка «Копировать» — copy to clipboard, показать «Скопировано!»
  - Кнопка «Скачать AGENTS.md» — создать blob, скачать файл
  - Кнопка «Регенерировать» — вернуться на форму с теми же данными
- [ ] **4.2** Создать `frontend/js/templates.js` — 6 готовых шаблонов:
  1. Solo Python dev (FastAPI + PostgreSQL)
  2. Node.js SaaS (Express + MongoDB)
  3. Chrome Extension (MV3 + CF Worker)
  4. Telegram Bot (Python + Railway)
  5. Data pipeline (Python + Airflow + S3)
  6. React Web App (Vite + Supabase)
- [ ] **4.3** Добавить в `frontend/index.html` — блок «Быстрый старт: выбери шаблон» (6 карточек)
- [ ] **4.4** Создать `worker/errors.js` — обработчики ошибок:
  - Claude API timeout (> 30 сек) → retry 1 раз
  - Claude API rate limit → вернуть 429 с retry-after
  - Supabase недоступен → продолжить без сохранения (не ломать генерацию)
- [ ] **4.5** Подключить `errors.js` в `worker/generate.js`

### Файлы дня
```
frontend/result.html  (обновить)
frontend/result.js  (новый)
frontend/js/templates.js
frontend/index.html  (обновить)
worker/errors.js
worker/generate.js  (обновить)
```

### Проверка
```bash
# Результат рендерится как красиво отформатированный markdown
# Кнопка «Копировать» работает (появляется уведомление)
# «Скачать» создаёт файл AGENTS.md на диске
# Шаблоны заполняют форму одним кликом
# При симуляции таймаута — показывается понятная ошибка (не 500)
```

---

## День 5 — Тест на реальных данных + полировка промпта

### Задачи
- [ ] **5.1** Прогнать 10 разных описаний проектов, оценить качество вывода:

| # | Описание | Качество (1-5) | Проблема |
|---|----------|---------------|---------|
| 1 | Python FastAPI + PostgreSQL, соло | | |
| 2 | React SaaS, команда 3 чел, Stripe | | |
| 3 | Telegram бот, Railway, Redis | | |
| 4 | Chrome extension, MV3, no backend | | |
| 5 | Data pipeline, Airflow + S3 | | |
| 6 | iOS приложение, Swift | | |
| 7 | Монолит на PHP + MySQL | | |
| 8 | Go микросервисы + Kubernetes | | |
| 9 | Jupyter notebook data science проект | | |
| 10 | WordPress плагин | | |

- [ ] **5.2** Обновить промпт в `worker/prompts.js` на основе слабых результатов (особенно для нетипичных стеков)
- [ ] **5.3** Добавить поле «Язык вывода» (auto / русский / english) в форму и промпт
- [ ] **5.4** Проверить mobile-view: форма, результат, шаблоны (CSS media queries)
- [ ] **5.5** Замерить среднее время генерации на 10 тестах (должно быть < 10 сек)

### Файлы дня
```
worker/prompts.js  (обновить по результатам тестов)
frontend/index.html  (добавить поле языка)
frontend/css/main.css  (media queries)
```

### Проверка
```
[ ] Минимум 8 из 10 тестов оценены на 4/5
[ ] Среднее время < 10 секунд
[ ] Мобильная верстка не сломана
[ ] Промпт обновлён с учётом слабых результатов
```

---

## День 6 — Lemon Squeezy: продукт + webhook + таблица users

### Задачи
- [ ] **6.1** В Lemon Squeezy создать One-time продукт «AgentsMD Pro» за $19, скопировать checkout URL
- [ ] **6.2** В Lemon Squeezy настроить webhook на `https://api.agentsmd.pro/webhook/ls`:
  - События: `order_created`
  - Скопировать webhook secret
- [ ] **6.3** Создать `worker/webhook.js`:
  - Верифицировать подпись HMAC-SHA256 (`X-Signature` заголовок)
  - При `order_created`: извлечь email из `data.attributes.user_email`
  - Обновить `users.plan = 'pro'`, сохранить `ls_order_id`, `ls_customer_id`
  - Всегда возвращать 200 (ретраи LS не нужны)
- [ ] **6.4** Подключить `webhook.js` в `worker/index.js`
- [ ] **6.5** Протестировать через LS Test Mode: сделать тестовый заказ, проверить обновление в Supabase

### Файлы дня
```
worker/webhook.js
worker/index.js  (обновить)
```

### Проверка
```bash
# LS Test Mode: сделать тестовый заказ
# В Supabase: users.plan изменился на 'pro'
# В логах Worker: видно входящий webhook, успешная обработка
# Повторный webhook не ломает данные (идемпотентность)
```

---

## День 7 — Paywall: free vs pro + upgrade modal

### Задачи
- [ ] **7.1** Создать `worker/paywall.js` — функция `checkAccess(userId, supabaseData)`:
  - plan === 'pro' → `{ allowed: true }`
  - usage_count >= 3 → `{ allowed: false, reason: 'limit_reached', checkout_url: LS_URL }`
  - иначе → инкрементировать, `{ allowed: true, remaining: 2 - usage_count }`
- [ ] **7.2** Обновить `worker/generate.js` — вызывать `checkAccess` перед генерацией, при `allowed: false` → return 402
- [ ] **7.3** Создать `frontend/js/paywall.js` — функция `showUpgradeModal(checkoutUrl)`:
  - Создать modal overlay динамически
  - Заголовок: «Вы использовали все 3 бесплатных генерации»
  - Подзаголовок: «Pro открывает безлимит + историю»
  - CTA кнопка: «Получить Pro — $19» (ссылка на LS checkout)
  - Мелкая ссылка: «Продолжить с Free» (закрыть modal)
- [ ] **7.4** Обновить `frontend/js/app.js` — обработать 402 ответ → вызвать `showUpgradeModal`
- [ ] **7.5** Добавить в `frontend/index.html` счётчик оставшихся генераций для free пользователей

### Файлы дня
```
worker/paywall.js
worker/generate.js  (обновить)
frontend/js/paywall.js
frontend/js/app.js  (обновить)
frontend/index.html  (обновить)
```

### Проверка
```bash
# Free user: 4-я генерация → modal появляется
# Кнопка «Получить Pro» ведёт на LS checkout
# Pro user: генерирует без ограничений
# Счётчик «Осталось 2 из 3» корректно обновляется
```

---

## День 8 — Лендинг: боль → решение → цена → CTA

### Задачи
- [ ] **8.1** Создать `frontend/landing.html` — структура:
  1. **Header**: логотип + nav (Pricing, Sign in)
  2. **Hero**: заголовок + подзаголовок + CTA + демо-скриншот
  3. **Pain**: «Сколько часов вы тратите на AGENTS.md?»
  4. **Solution**: 3 карточки — Fast / Accurate / Ready to use
  5. **Demo**: анимированный пример (было → стало)
  6. **Pricing**: 2 плана (Free / Pro $19)
  7. **FAQ**: 4 вопроса
  8. **Footer**: copyright + links
- [ ] **8.2** Создать `frontend/css/landing.css` — отдельные стили для лендинга
- [ ] **8.3** Hero секция: заголовок «Готовый AGENTS.md за 30 секунд», подзаголовок «Описание проекта → полный файл инструкций для Claude Code, Cursor и любых AI-агентов», CTA «Попробовать бесплатно →»
- [ ] **8.4** Pricing секция: явно указать что включено в Free (3 генерации) и Pro ($19 one-time, безлимит)
- [ ] **8.5** Деплой CF Pages: `wrangler pages deploy frontend/`

### Файлы дня
```
frontend/landing.html
frontend/css/landing.css
```

### Проверка
```bash
wrangler pages deploy frontend/
# Лендинг открывается на CF Pages URL
# CTA «Попробовать» ведёт на index.html (форма)
# Pricing: кнопка «Купить Pro» ведёт на LS checkout
# Мобильная верстка корректна
```

---

## День 9 — Деплой: продовый домен + end-to-end проверка

### Задачи
- [ ] **9.1** Зарегистрировать домен `agentsmd.pro` (или `.app`), подключить к CF
- [ ] **9.2** Настроить CF Worker на `api.agentsmd.pro`
- [ ] **9.3** Настроить CF Pages на `agentsmd.pro` (www → non-www редирект)
- [ ] **9.4** Обновить Supabase — добавить `agentsmd.pro` в список разрешённых origin (CORS)
- [ ] **9.5** Обновить LS webhook URL на продовый: `https://api.agentsmd.pro/webhook/ls`
- [ ] **9.6** Полный end-to-end тест на продовом URL:
  - Заходим на agentsmd.pro
  - Вводим email → получаем magic link → авторизуемся
  - Генерируем AGENTS.md (1 раз)
  - Видим счётчик «Осталось 2 из 3»
  - Генерируем ещё 2 раза → на 4-й видим modal
  - Делаем тестовую оплату в LS Test Mode
  - После оплаты — генерируем без ограничений

### Файлы дня
```
wrangler.toml  (обновить с продовыми значениями)
PROGRESS.md   (записать результаты теста)
```

### Проверка
```
[ ] agentsmd.pro открывается
[ ] api.agentsmd.pro/health возвращает 200
[ ] Генерация работает end-to-end
[ ] Оплата меняет план автоматически
[ ] Нет ни одного ручного шага после деплоя
```

---

## День 10 — Первые юзеры

### Задачи
- [ ] **10.1** Пост #1: **r/ClaudeAI** — «Устал писать AGENTS.md руками — сделал генератор»
  - Показать до/после (скриншот)
  - Ссылка на сервис
  - Искренний тон, без спама
- [ ] **10.2** Пост #2: **r/cursor** — «Made a tool that generates AGENTS.md for your project in 30s»
  - GIF-демо (30 сек от ввода до результата)
  - Акцент на Cursor-специфичные Use Cases
- [ ] **10.3** Пост #3: **X/Twitter** — Short demo thread
  - Tweet 1: боль + решение + ссылка
  - Reply с GIF демо
  - Reply с примером сгенерированного файла
- [ ] **10.4** Создать черновик на **ProductHunt** (scheduled на следующий вторник)
- [ ] **10.5** Обновить `PROGRESS.md` — итоговый отчёт: что сделано, что не сделано, метрики

### Проверка
```
[ ] 3 поста опубликованы (ссылки в PROGRESS.md)
[ ] ProductHunt черновик готов
[ ] PROGRESS.md заполнен финальным отчётом
[ ] Первый платящий юзер (цель)
```

---

## Итоговый чеклист готовности

```
[ ] POST /generate работает < 10 сек
[ ] Free tier: 3 генерации → upgrade modal
[ ] Оплата $19 → plan: pro (автоматически, без ручного участия)
[ ] Лендинг на домене с working CTA
[ ] Вся система работает без участия разработчика
[ ] README.md заполнен (инструкция деплоя)
[ ] PROGRESS.md заполнен по всем 10 дням
```
