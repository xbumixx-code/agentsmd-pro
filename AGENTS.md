# AGENTS.md — AgentsMD.pro

> Ты — AI-агент, работающий над **AgentsMD.pro**.
> Прочитай этот файл полностью перед любым действием.
> Это не рекомендации — это правила. Отступление требует явного разрешения.

---

## 1. Agent Identity & Mission

Ты работаешь над веб-сервисом, который генерирует `AGENTS.md` файлы для AI-агентов.
Твоя **основная задача** — реализовывать фичи чисто, без сайд-эффектов, не ломая v1.

**Перед каждой задачей:**
1. Прочитай `TASKS_V2.md` — найди текущий активный таск
2. Прочитай `PROGRESS.md` — пойми что уже сделано
3. Оцени задачу: < 3 файлов и < 20 мин → делай сам. Сложнее → декомпозируй на подзадачи

**Протокол неопределённости:**
- Непонятно что делать → задай ОДИН уточняющий вопрос, не угадывай
- Нужна новая зависимость → проверь можно ли обойтись Web API / тем что есть
- Ломает существующее → предупреди и жди подтверждения
- Касается security/crypto → делай минимальное изменение, флагуй

---

## 2. Project Overview

**AgentsMD.pro** — генератор `AGENTS.md` файлов для AI coding agents (Claude Code, Cursor, GitHub Copilot).
Пользователь описывает проект → получает готовый файл инструкций за 30 секунд.

**v1 (продакшн, ветка `main`):** Одностадийная генерация, 7 секций, BYOK.
**v2 (в разработке, ветка `v2`):** Многостадийная генерация, 12 секций, multi-agent mode, бриф пользователя.

**Бизнес-модель:** Бесплатно (BYOK), добровольный донат через Lemon Squeezy каждые 3 генерации.

---

## 3. Tech Stack

| Слой | Инструмент | Почему |
|------|-----------|--------|
| Frontend | Vanilla JS + HTML/CSS | Нет сборщика, CF Pages/Vercel CDN, мгновенный деплой |
| Backend | Vercel Edge Functions (JS) | Web API only, нет node_modules в проде |
| AI (Claude) | `claude-sonnet-4-20250514` | Лучшее качество текста для AGENTS.md |
| AI (OpenAI) | `gpt-5.4-mini` | Альтернатива, использует `max_completion_tokens` (не `max_tokens`) |
| Монетизация | Lemon Squeezy | Pay-what-you-want донат |
| Deploy | Vercel (GitHub auto-deploy) | Push в `main` → деплой автоматически |
| i18n | Самописный (`public/js/i18n.js`) | EN по умолчанию, RU переключением |
| Crypto | Web Crypto API (AES-GCM) | Шифрование API ключей в localStorage |

---

## 4. Project Structure

```
agentsmd-pro/
├── AGENTS.md              ← этот файл, читать первым
├── TASKS_V2.md            ← чеклист задач v2
├── PROGRESS.md            ← лог выполненной работы
│
├── api/                   ← Vercel Edge Functions
│   ├── generate.js        ← v1: POST /api/generate (одностадийный)
│   ├── generate-v2.js     ← v2: POST /api/generate-v2 (многостадийный) [в разработке]
│   └── health.js          ← GET /api/health
│
├── lib/                   ← Shared логика (Edge-совместимая, только Web API)
│   ├── prompts.js         ← v1 промпты
│   ├── prompts-v2.js      ← v2 промпты (Analyzer + 6 секционных + Orchestrated) [в разработке]
│   ├── assembler.js       ← склейка секций в финальный markdown [в разработке]
│   ├── zipper.js          ← генерация ZIP для orchestrated mode [в разработке]
│   ├── openai.js          ← callOpenAI()
│   └── errors.js          ← withRetry(), handleClaudeError()
│
├── public/                ← Статика (Vercel outputDirectory)
│   ├── index.html         ← главная страница (форма генерации)
│   ├── result.html        ← страница результата
│   ├── landing.html       ← лендинг
│   ├── css/
│   │   ├── main.css       ← стили приложения (CSS переменные, dark mode)
│   │   └── landing.css    ← стили лендинга
│   └── js/
│       ├── config.js      ← window._config (API_BASE_URL, LS_CHECKOUT_URL)
│       ├── i18n.js        ← переводы EN/RU, t(), applyTranslations(), switchLang()
│       ├── crypto.js      ← saveApiKeySecure(), loadApiKeySecure() — AES-GCM
│       ├── app.js         ← логика формы, вызов API, обработка ответа
│       ├── result.js      ← рендер результата, copy, download
│       ├── paywall.js     ← donate modal (каждые 3 генерации, 20 вариантов)
│       └── templates.js   ← 6 быстрых шаблонов ввода
│
└── vercel.json            ← { "outputDirectory": "public" }
```

---

## 5. Environment Setup

```bash
# Локальный запуск через Vercel CLI
npm install -g vercel
vercel dev       # поднимает и Edge Functions и статику на localhost:3000

# Деплой (автоматический через GitHub)
git push origin main    # → Vercel деплоит автоматически

# Локальный dev без Vercel CLI (только фронт)
cd public && python3 -m http.server 8080
# API не работает — только для верстки
```

**Переменные окружения (не нужны — BYOK):**
Нет серверных секретов. Пользователь передаёт свой API ключ в каждом запросе.
`public/js/config.js` — единственный конфиг, содержит только публичные URL.

---

## 6. Code Quality Rules

### JavaScript (Frontend — Vanilla)
- Файл: ≤ 300 строк. Функция: ≤ 40 строк. Вложенность: ≤ 3 уровня
- Каждая функция — один комментарий что делает (одна строка над функцией)
- `console.log` только с префиксом `[AgentsMD]`
- Никаких глобальных переменных кроме `window._config` и функций из `i18n.js`
- `async/await` везде где fetch. Никаких `.then().catch()` цепочек
- DOM запросы — кешировать в переменные, не делать повторно в loop

### JavaScript (Backend — Edge Functions)
- Только Web API: `fetch`, `crypto`, `Response`, `Request`, `URL`
- Никаких `import` node-специфичных модулей (path, fs, buffer и т.д.)
- Каждый Edge Function экспортирует `export const config = { runtime: 'edge' }`
- CORS заголовки — в каждом ответе включая ошибки
- Timeout у внешних fetch: явно указывать через `AbortController` если > 30 сек

### CSS
- Все цвета — через CSS переменные из `main.css` (`:root`)
- Dark mode — через `@media (prefers-color-scheme: dark)`, не JS
- Новые компоненты — добавлять в существующие файлы, не создавать новые `.css`
- Мобильная верстка: проверять при 375px минимум

### Промпты (lib/prompts*.js)
- Промпт = экспортируемая константа, никогда не инлайнить в handler
- Изменение промпта → тест на 3 разных типах проектов перед коммитом
- `max_tokens` Claude: 4000. OpenAI: `max_completion_tokens`: 4000

---

## 7. Development Workflow

### Для каждой задачи из TASKS_V2.md:
1. **Читай** PROGRESS.md — не делай уже сделанное
2. **Планируй** — если задача затрагивает > 3 файлов, напиши план шагов
3. **Делай** — маленькими атомарными изменениями
4. **Проверяй** — `vercel dev` и руками тестируй флоу
5. **Записывай** — обнови PROGRESS.md после каждой выполненной задачи

### Ветки:
- `main` — v1 продакшн. **Не трогать** пока v2 не готов
- `v2` — вся разработка v2 здесь

### Тестирование (нет автотестов → ручное QA):
Перед каждым коммитом в v2 проверить:
- [ ] Генерация работает (Claude и OpenAI)
- [ ] Нет консольных ошибок
- [ ] EN и RU отображаются корректно
- [ ] Dark mode неломает верстку

---

## 8. Git Protocol

```bash
# Формат коммитов
feat: добавить Step 2 бриф с умными вопросами
fix: исправить SSE стриминг на Safari
refactor: вынести CORS headers в отдельную функцию
chore: обновить LS checkout URL

# Всегда коммитить конкретные файлы, не git add .
git add api/generate-v2.js lib/prompts-v2.js
git commit -m "feat: ..."
git push origin v2

# Co-author (обязательно)
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Никогда:**
- Не пушить в `main` напрямую пока v2 не завершён
- Не делать `git add .` — можно случайно добавить `.env.local`
- Не форс-пушить без явной просьбы

---

## 9. Security Rules

- **API ключи пользователя** — только в теле запроса (POST body), никогда в URL/headers видимых в логах
- **localStorage** — API ключи хранить только зашифрованными через `crypto.js` (AES-GCM)
- **sessionStorage** — ключ шифрования живёт только в сессии, умирает при закрытии вкладки
- **Серверные секреты** — их нет (BYOK архитектура). Если появится нужда — только через Vercel Environment Variables, никогда в коде
- **XSS** — не использовать `innerHTML` с пользовательским контентом. `textContent` для данных, `innerHTML` только для статических i18n строк
- **Промпт инъекции** — description пользователя передавать как `user` message, не вставлять в `system` prompt

---

## 10. Decision Protocol

Когда есть выбор — используй этот алгоритм:

```
Задача < 3 файлов И < 20 мин?
  → Делай сам, не декомпозируй

Нужна новая npm зависимость?
  → Сначала проверь: есть ли Web API эквивалент?
  → Если нет: обсуди с пользователем

Изменение ломает существующий флоу?
  → Предупреди → жди подтверждения → делай

Непонятно как реализовать?
  → Задай ОДИН конкретный вопрос
  → Не начинай писать код пока нет ответа

Изменение касается crypto.js или ключей?
  → Делай минимально необходимое
  → Явно описывай что изменил в комментарии к PR
```

---

## 11. Key Commands

```bash
# Разработка
vercel dev                          # localhost:3000 (фронт + API)

# Деплой
git push origin v2                  # деплой preview на Vercel
git push origin main                # деплой продакшн

# Откат на v1 (если всё плохо)
git checkout main
git reset --hard v1.0.0
git push origin main --force

# Проверка что edge functions работают
curl -X POST localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"description":"test project","user_api_key":"sk-ant-..."}'

curl localhost:3000/api/health
```

---

## 12. Pre-Completion Checklist

Перед тем как считать задачу выполненной:

- [ ] Код работает локально (`vercel dev`)
- [ ] Нет `console.error` / необработанных Promise rejection в браузере
- [ ] Новые строки добавлены в `i18n.js` (EN и RU)
- [ ] CSS проверен в dark mode
- [ ] Верстка не сломана на 375px
- [ ] PROGRESS.md обновлён
- [ ] Коммит сделан с правильным форматом и Co-author
- [ ] `main` ветка не тронута

**Если хоть один пункт не выполнен — задача не считается завершённой.**
