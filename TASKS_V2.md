# TASKS V2 — AgentsMD.pro

> Выполнять строго по порядку. Деплой только после завершения всех задач.
> Ветка: `v2`. В `main` не мержим пока всё не готово.

---

## MILESTONE 1 — Новые промпты и логика генерации

### Task 1.1 — Analyzer prompt
- [ ] Создать `lib/prompts-v2.js`
- [ ] Написать ANALYZER_PROMPT: принимает описание + ответы на бриф → возвращает `project_dna` (JSON)
  - constraints, risks, tech_rules, team_behavior, anti_patterns
- [ ] Протестировать на 3 типах проектов (code / data / ops)

### Task 1.2 — Section generator prompts (6 штук)
- [ ] `IDENTITY_PROMPT` → секция "Agent Identity & Mission"
- [ ] `RULES_PROMPT` → секция "Code Quality Rules" (с цифрами, под стек)
- [ ] `WORKFLOW_PROMPT` → секция "Development Workflow" (TDD если нужен)
- [ ] `GIT_PROMPT` → секция "Git Protocol" (адаптивно под team_size)
- [ ] `SECURITY_PROMPT` → секция "Security Rules"
- [ ] `CHECKLIST_PROMPT` → секция "Pre-Completion Checklist"
- [ ] Каждый промпт принимает `project_dna` как контекст

### Task 1.3 — Orchestrated mode prompts (если mode=orchestrated)
- [ ] `ORCHESTRATOR_PROMPT` → главный AGENTS.md (легкий, только дирижёр)
- [ ] `CODER_AGENT_PROMPT` → agents/coder.md
- [ ] `REVIEWER_AGENT_PROMPT` → agents/reviewer.md
- [ ] `TESTER_AGENT_PROMPT` → agents/tester.md
- [ ] `PLANNER_AGENT_PROMPT` → agents/planner.md
- [ ] `MEMORY_TEMPLATES` → memory/WORK_LOG.md, DECISIONS.md, CONTEXT.md (шаблоны)

### Task 1.4 — Consistency checker + assembler
- [ ] `CONSISTENCY_PROMPT` → проверяет противоречия между секциями
- [ ] Написать `lib/assembler.js` → склеивает секции в финальный markdown
- [ ] Написать `lib/zipper.js` → генерирует ZIP для orchestrated mode (Web API: JSZip-compatible)

---

## MILESTONE 2 — Backend: оркестрация генерации

### Task 2.1 — Новый API endpoint
- [ ] Создать `api/generate-v2.js` (Vercel Edge Function)
- [ ] Stage 1: вызов Analyzer → получить `project_dna`
- [ ] Stage 2: параллельный запуск section generators (Promise.all)
- [ ] Stage 3: вызов Consistency checker
- [ ] Stage 4: Assembler → финальный файл
- [ ] Если `mode=orchestrated` → дополнительные вызовы + Zipper

### Task 2.2 — Streaming прогресса (SSE)
- [ ] Переключить endpoint на Server-Sent Events
- [ ] Отправлять события: `{ stage: 'analyzing' | 'identity' | 'rules' | ... | 'done' }`
- [ ] Фронт подписывается через `EventSource` и показывает прогресс

### Task 2.3 — ZIP endpoint
- [ ] Создать `api/download-zip.js` (или inline в generate-v2)
- [ ] Принимает набор файлов → отдаёт `application/zip`
- [ ] Поддерживает структуру: `AGENTS.md` + `agents/` + `memory/`

---

## MILESTONE 3 — Frontend: новый UX

### Task 3.1 — Step 2: Бриф (умные вопросы)
- [ ] После заполнения Step 1 → появляется Step 2 с вопросами
- [ ] Универсальные вопросы (3): главная ошибка агента, критерий готовности, нестандартное
- [ ] Динамические вопросы по типу проекта:
  - code: монорепо, тесты, CI/CD, legacy, перформанс
  - data: batch/stream, PII, оркестрация, источники данных
  - ops: cloud, IaC, compliance, инциденты
- [ ] Кнопка "Back" → вернуться на Step 1
- [ ] Все вопросы опциональны — можно пропустить

### Task 3.2 — Mode selector
- [ ] Добавить выбор режима: Simple / Orchestrated
- [ ] Tooltip/описание что входит в каждый режим
- [ ] Simple → 1 файл AGENTS.md
- [ ] Orchestrated → ZIP со всей системой

### Task 3.3 — Live progress indicator
- [ ] Заменить спиннер на секционный прогресс
- [ ] Список этапов с чекбоксами, анимация текущего
- [ ] Примерное время: "~20 seconds"
- [ ] i18n для всех новых строк (EN/RU)

### Task 3.4 — Result page v2
- [ ] Simple mode → как сейчас (copy + download)
- [ ] Orchestrated mode → показать дерево файлов + кнопка "Download ZIP"
- [ ] Preview каждого файла из ZIP (tabs)
- [ ] Все строки переведены (EN/RU)

---

## MILESTONE 4 — i18n и полировка

### Task 4.1 — Новые строки i18n
- [ ] Добавить в `i18n.js` все новые ключи:
  - Step 2 вопросы (EN/RU)
  - Mode selector
  - Progress stages
  - Result page v2
  - ZIP download

### Task 4.2 — Обновить landing.html
- [ ] Обновить описание сервиса (упомянуть multi-agent + bespoke brief)
- [ ] Обновить FAQ
- [ ] Обновить секцию "What's inside"

### Task 4.3 — QA чеклист
- [ ] Simple mode: Python FastAPI solo → корректный AGENTS.md
- [ ] Simple mode: React TypeScript team → корректный AGENTS.md
- [ ] Orchestrated mode: Node.js API small team → корректный ZIP
- [ ] Orchestrated mode: Data pipeline → корректный ZIP
- [ ] Проверить EN и RU интерфейс
- [ ] Проверить mobile (375px)
- [ ] Проверить dark mode
- [ ] Проверить что v1 (main) не тронут

---

## MILESTONE 5 — Деплой v2

### Task 5.1 — Pre-deploy
- [ ] Обновить `vercel.json` если нужно
- [ ] Проверить что все env variables на месте
- [ ] Финальный QA прогон

### Task 5.2 — Deploy
- [ ] Merge `v2` → `main`
- [ ] Push → Vercel деплоит автоматически
- [ ] Проверить на проде все 4 тест-кейса из Task 4.3
- [ ] Обновить `PROGRESS.md`

---

## Порядок выполнения

```
M1 (промпты) → M2 (backend) → M3 (frontend) → M4 (i18n+QA) → M5 (деплой)
```

M1 и M2 можно частично параллелить (промпты пишутся, backend строится под них).
M3 начинается когда M2.1 готов (есть endpoint для подключения).
M4 и M5 — только когда все предыдущие ✅.

---

## Определение "готово" для v2

- [ ] Simple mode выдаёт 12-секционный AGENTS.md за < 30 сек
- [ ] Orchestrated mode выдаёт ZIP за < 60 сек
- [ ] Бриф задаёт релевантные вопросы под каждый тип проекта
- [ ] Live прогресс работает без зависаний
- [ ] EN/RU переключение работает на всех новых экранах
- [ ] v1 на `main` жив и не тронут
