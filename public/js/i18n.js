// public/js/i18n.js — AgentsMD.pro
// Internationalization: EN (default) / RU

const TRANSLATIONS = {
  en: {
    // Header
    'header.about': 'About',

    // API Key block
    'apikey.label': 'API Key',
    'apikey.not_set': 'not set',
    'apikey.hint_claude': 'Claude key: <a href="https://console.anthropic.com/settings/keys" target="_blank">console.anthropic.com</a>. Starts with <code>sk-ant-</code>',
    'apikey.hint_openai': 'OpenAI key (<code>gpt-5.4-mini</code>): <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>. Starts with <code>sk-</code>',
    'apikey.placeholder': 'sk-...',
    'apikey.save': 'Save',
    'apikey.saved': '✓ Key saved and encrypted',

    // Templates
    'templates.label': 'Quick start:',

    // Form
    'form.description_label': 'Describe your project',
    'form.description_placeholder': 'Example: Python FastAPI backend for a SaaS. PostgreSQL, Redis for caching. Deployed on Railway. Solo developer.',
    'form.type_label': 'Agent type',
    'form.type_code': 'Code — development',
    'form.type_data': 'Data — analytics',
    'form.type_ops': 'Ops — infrastructure / DevOps',
    'form.type_research': 'Research — analysis',
    'form.team_label': 'Team size',
    'form.team_solo': 'Solo (1 person)',
    'form.team_small': 'Small (2–5)',
    'form.team_team': 'Team (5+)',
    'form.lang_label': 'Output language',
    'form.lang_auto': 'Auto (match input)',
    'form.lang_ru': 'Russian',
    'form.lang_en': 'English',
    'form.tech_label': 'Technologies (comma-separated)',
    'form.tech_placeholder': 'Python, FastAPI, PostgreSQL, Redis, Docker',
    'form.submit': 'Generate AGENTS.md',
    'form.generating': 'Generating...',
    'form.error_apikey': 'Enter your API key in the block above',
    'form.error_network': 'No connection. Check your internet and try again.',
    'form.error_generic': 'Generation error, please try again',

    // Form step 2
    'form.next': 'Next →',
    'form.back': 'Back',
    'form.brief_title': 'A few more details',
    'form.brief_optional': 'optional',
    'form.brief_skip': 'Skip →',
    'form.mode_label': 'Output format',
    'form.mode_simple_title': 'Simple',
    'form.mode_simple_desc': 'One AGENTS.md file · ~15 sec',
    'form.mode_orch_title': 'Orchestrated',
    'form.mode_orch_desc': 'Full agent system (ZIP) · ~30 sec',

    // Brief questions
    'brief.mistake_label': 'Biggest mistake an AI agent could make here?',
    'brief.mistake_ph': 'e.g. Push to main without review, delete migrations...',
    'brief.done_label': 'What does "task done" look like?',
    'brief.done_ph': 'e.g. Tests pass, PR reviewed, deployed to staging',
    'brief.nonstandard_label': 'Anything non-standard to know?',
    'brief.nonstandard_ph': 'e.g. Legacy API contract, strict perf budget...',
    'brief.code_title': 'Code project details',
    'brief.monorepo_label': 'Repository structure',
    'brief.monorepo_yes': 'Monorepo',
    'brief.monorepo_no': 'Single repo',
    'brief.select': 'Select...',
    'brief.tests_label': 'Tests',
    'brief.tests_none': 'No tests',
    'brief.tests_some': 'Some tests',
    'brief.tests_full': 'Full coverage',
    'brief.cicd_label': 'CI/CD',
    'brief.cicd_ph': 'GitHub Actions, GitLab CI, Jenkins, none...',
    'brief.legacy_label': 'Legacy constraints',
    'brief.legacy_ph': 'API v1 compat, old DB schema...',
    'brief.data_title': 'Data project details',
    'brief.batch_label': 'Processing type',
    'brief.batch_batch': 'Batch',
    'brief.batch_stream': 'Streaming',
    'brief.batch_both': 'Both',
    'brief.sensitivity_label': 'Data sensitivity',
    'brief.sensitivity_none': 'No PII',
    'brief.sensitivity_pii': 'PII',
    'brief.orchestration_label': 'Orchestration tool',
    'brief.orchestration_ph': 'Airflow, Prefect, dbt, Dagster, none...',
    'brief.ops_title': 'Ops project details',
    'brief.cloud_label': 'Cloud provider',
    'brief.cloud_ph': 'AWS, GCP, Azure, Hetzner...',
    'brief.iac_label': 'IaC tool',
    'brief.iac_ph': 'Terraform, Pulumi, Ansible, none...',
    'brief.compliance_label': 'Compliance requirements',
    'brief.compliance_ph': 'SOC2, ISO 27001, PCI DSS, none...',

    // Progress stages
    'progress.title': 'Generating your AGENTS.md...',
    'progress.note': '~15–30 seconds · powered by your API key',
    'progress.analyzing': 'Analyzing project...',
    'progress.identity': 'Writing Agent Identity...',
    'progress.rules': 'Writing Code Rules...',
    'progress.workflow': 'Writing Workflow...',
    'progress.git': 'Writing Git Protocol...',
    'progress.security': 'Writing Security Rules...',
    'progress.checklist': 'Writing Checklist...',
    'progress.agents': 'Building agent system...',
    'progress.assembling': 'Assembling final file...',

    // Result v2
    'result.download_zip': 'Download ZIP',
    'result.files_count': 'files',

    // Modal upgrade/donate
    'modal.continue': 'No thanks, continue for free',

    // Result page
    'result.copy': 'Copy',
    'result.copied': '✓ Copied to clipboard',
    'result.download': 'Download AGENTS.md',
    'result.regen': 'Regenerate',
    'result.new': '+ New file',
    'result.loading': 'Loading result...',
    'result.tokens': 'tokens',

    // Footer
    'footer.about': 'About',
    'footer.pricing': 'Pricing',

    // Landing
    'landing.nav_how': 'How it works',
    'landing.nav_donate': 'Donate ☕',
    'landing.nav_try': 'Try it →',
    'landing.badge': 'For Claude Code · Cursor · GitHub Copilot',
    'landing.h1': 'Ready <code>AGENTS.md</code><br>in 30 seconds',
    'landing.sub': 'Write a project description — get a complete instruction file for AI agents.<br>Stack, rules, commands — all ready to paste.',
    'landing.cta': 'Generate for free →',
    'landing.cta_note': '3 free generations · No signup required',
    'landing.pain_label': 'Now',
    'landing.pain_h2': 'Hours of agent setup',
    'landing.pain_1': 'Reading Claude Code / Cursor docs',
    'landing.pain_2': 'Writing rules from scratch — guessing what\'s needed',
    'landing.pain_3': 'Forgetting sections, re-reading examples',
    'landing.pain_4': 'The agent still does what it wants — rules are vague',
    'landing.good_label': 'With AgentsMD',
    'landing.good_h2': '30 seconds and done',
    'landing.good_1': 'Describe the project in one paragraph',
    'landing.good_2': 'Get a structured AGENTS.md',
    'landing.good_3': 'All sections included: stack, rules, commands',
    'landing.good_4': 'The agent understands context from the first request',
    'landing.features_title': 'What\'s inside every file',
    'landing.f1_title': 'Agent Identity',
    'landing.f1_desc': 'Who the agent is, its mission, and decision protocol for uncertainty',
    'landing.f2_title': 'Tech Stack',
    'landing.f2_desc': 'Table with your actual stack: layer, tool, reason for choice',
    'landing.f3_title': 'Code Quality Rules',
    'landing.f3_desc': 'Quantified rules: file limits, naming, error handling — specific to your stack',
    'landing.f4_title': 'Git Protocol',
    'landing.f4_desc': 'Branch naming, commit format, PR rules — adapted to your team size',
    'landing.f5_title': 'Security Rules',
    'landing.f5_desc': 'Stack-specific security rules — not generic, referencing real files and patterns',
    'landing.f6_title': 'Pre-Completion Checklist',
    'landing.f6_desc': 'Checkbox list the agent must verify before marking any task as done',
    'landing.pricing_title': 'How much does it cost?',
    'landing.free_badge': 'Free',
    'landing.free_title': 'Unlimited generations · Forever',
    'landing.free_sub': 'No subscriptions or limits. Bring your own API key (Claude or OpenAI) and generate as much as you want.',
    'landing.free_f1': '✓ Unlimited generations',
    'landing.free_f2': '✓ Claude and OpenAI to choose from',
    'landing.free_f3': '✓ Simple mode: one AGENTS.md (12 sections)',
    'landing.free_f4': '✓ Orchestrated mode: full agent system (ZIP)',
    'landing.free_f5': '✓ Your key — your data',
    'landing.free_cta': 'Try for free →',
    'landing.donate_note': 'Every few generations we\'ll humbly ask you to support the project ☕<br>No pressure, no obligation — only if you liked it.',
    'landing.faq_title': 'Questions',
    'landing.faq1_q': 'What is AGENTS.md and why do I need it?',
    'landing.faq1_a': 'AGENTS.md is an instruction file in the project root that explains to an AI agent (Claude Code, Cursor, Copilot) how to work with the codebase. Without it the agent guesses the stack, patterns, and rules. With it — it works like an experienced team member.',
    'landing.faq2_q': 'Can I use it without signing up?',
    'landing.faq2_a': 'Yes. Bring your own API key (Claude or OpenAI) and generate unlimited files. No login required.',
    'landing.faq3_q': 'What\'s the difference between Simple and Orchestrated?',
    'landing.faq3_a': 'Simple mode generates one AGENTS.md file with 12 sections (~15 sec). Orchestrated mode generates a full multi-agent system: main AGENTS.md + sub-agent files (planner, coder, reviewer, tester) + shared memory files — all in a ZIP archive (~30 sec).',
    'landing.faq4_q': 'What languages and frameworks does it support?',
    'landing.faq4_a': 'Any. The generator understands descriptions in Russian and English and adapts to any stack: Python, JavaScript, Go, Rust, mobile, data, DevOps.',
    'landing.cta_bottom_h2': 'Try it right now',
    'landing.cta_bottom_sub': 'Unlimited generations. No credit card.',
    'landing.cta_bottom_btn': 'Generate AGENTS.md →',
    'landing.footer_copy': '© 2026 · Made with Claude Code',
  },

  ru: {
    // Header
    'header.about': 'О сервисе',

    // API Key block
    'apikey.label': 'API ключ',
    'apikey.not_set': 'не задан',
    'apikey.hint_claude': 'Ключ Claude: <a href="https://console.anthropic.com/settings/keys" target="_blank">console.anthropic.com</a>. Начинается на <code>sk-ant-</code>',
    'apikey.hint_openai': 'Ключ OpenAI (<code>gpt-5.4-mini</code>): <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>. Начинается на <code>sk-</code>',
    'apikey.placeholder': 'sk-...',
    'apikey.save': 'Сохранить',
    'apikey.saved': '✓ Ключ сохранён и зашифрован',

    // Templates
    'templates.label': 'Быстрый старт:',

    // Form
    'form.description_label': 'Опиши свой проект',
    'form.description_placeholder': 'Например: Python FastAPI backend для SaaS-сервиса. PostgreSQL, Redis для кеша. Деплой на Railway. Один разработчик.',
    'form.type_label': 'Тип агента',
    'form.type_code': 'Code — разработка',
    'form.type_data': 'Data — данные/аналитика',
    'form.type_ops': 'Ops — инфраструктура/DevOps',
    'form.type_research': 'Research — ресёрч/анализ',
    'form.team_label': 'Размер команды',
    'form.team_solo': 'Solo (1 чел)',
    'form.team_small': 'Small (2–5 чел)',
    'form.team_team': 'Team (5+ чел)',
    'form.lang_label': 'Язык файла',
    'form.lang_auto': 'Авто (как ввод)',
    'form.lang_ru': 'Русский',
    'form.lang_en': 'English',
    'form.tech_label': 'Технологии (через запятую)',
    'form.tech_placeholder': 'Python, FastAPI, PostgreSQL, Redis, Docker',
    'form.submit': 'Сгенерировать AGENTS.md',
    'form.generating': 'Генерирую...',
    'form.error_apikey': 'Введите ваш API ключ в блоке выше',
    'form.error_network': 'Нет соединения, проверьте интернет и попробуйте ещё раз',
    'form.error_generic': 'Ошибка генерации, попробуйте ещё раз',

    // Form step 2
    'form.next': 'Далее →',
    'form.back': 'Назад',
    'form.brief_title': 'Немного подробностей',
    'form.brief_optional': 'необязательно',
    'form.brief_skip': 'Пропустить →',
    'form.mode_label': 'Формат выхода',
    'form.mode_simple_title': 'Простой',
    'form.mode_simple_desc': 'Один файл AGENTS.md · ~15 сек',
    'form.mode_orch_title': 'Оркестрованный',
    'form.mode_orch_desc': 'Система агентов (ZIP) · ~30 сек',

    // Brief questions
    'brief.mistake_label': 'Главная ошибка AI-агента в вашем проекте?',
    'brief.mistake_ph': 'напр. Пуш в main без ревью, удалить миграции...',
    'brief.done_label': 'Как выглядит «задача выполнена»?',
    'brief.done_ph': 'напр. Тесты прошли, PR проверен, задеплоено',
    'brief.nonstandard_label': 'Что нестандартного нужно знать?',
    'brief.nonstandard_ph': 'напр. Legacy API контракт, строгий бюджет перформанса...',
    'brief.code_title': 'Детали проекта',
    'brief.monorepo_label': 'Структура репозитория',
    'brief.monorepo_yes': 'Монорепо',
    'brief.monorepo_no': 'Один репо',
    'brief.select': 'Выбрать...',
    'brief.tests_label': 'Тесты',
    'brief.tests_none': 'Нет тестов',
    'brief.tests_some': 'Частичное покрытие',
    'brief.tests_full': 'Полное покрытие',
    'brief.cicd_label': 'CI/CD',
    'brief.cicd_ph': 'GitHub Actions, GitLab CI, Jenkins, нет...',
    'brief.legacy_label': 'Legacy ограничения',
    'brief.legacy_ph': 'Совместимость с API v1, старая схема БД...',
    'brief.data_title': 'Детали дата-проекта',
    'brief.batch_label': 'Тип обработки',
    'brief.batch_batch': 'Batch',
    'brief.batch_stream': 'Streaming',
    'brief.batch_both': 'Оба',
    'brief.sensitivity_label': 'Чувствительность данных',
    'brief.sensitivity_none': 'Нет PII',
    'brief.sensitivity_pii': 'PII данные',
    'brief.orchestration_label': 'Инструмент оркестрации',
    'brief.orchestration_ph': 'Airflow, Prefect, dbt, Dagster, нет...',
    'brief.ops_title': 'Детали Ops-проекта',
    'brief.cloud_label': 'Cloud провайдер',
    'brief.cloud_ph': 'AWS, GCP, Azure, Hetzner...',
    'brief.iac_label': 'IaC инструмент',
    'brief.iac_ph': 'Terraform, Pulumi, Ansible, нет...',
    'brief.compliance_label': 'Compliance требования',
    'brief.compliance_ph': 'SOC2, ISO 27001, PCI DSS, нет...',

    // Progress stages
    'progress.title': 'Генерируем ваш AGENTS.md...',
    'progress.note': '~15–30 секунд · работает через ваш API ключ',
    'progress.analyzing': 'Анализируем проект...',
    'progress.identity': 'Пишем Agent Identity...',
    'progress.rules': 'Пишем Code Rules...',
    'progress.workflow': 'Пишем Workflow...',
    'progress.git': 'Пишем Git Protocol...',
    'progress.security': 'Пишем Security Rules...',
    'progress.checklist': 'Пишем Checklist...',
    'progress.agents': 'Собираем систему агентов...',
    'progress.assembling': 'Собираем финальный файл...',

    // Result v2
    'result.download_zip': 'Скачать ZIP',
    'result.files_count': 'файлов',

    // Modal
    'modal.continue': 'Нет, продолжу бесплатно',

    // Result page
    'result.copy': 'Копировать',
    'result.copied': '✓ Скопировано в буфер обмена',
    'result.download': 'Скачать AGENTS.md',
    'result.regen': 'Регенерировать',
    'result.new': '+ Новый файл',
    'result.loading': 'Загружаем результат...',
    'result.tokens': 'токенов',

    // Footer
    'footer.about': 'О сервисе',
    'footer.pricing': 'Цены',

    // Landing
    'landing.nav_how': 'Как это работает',
    'landing.nav_donate': 'Поддержать ☕',
    'landing.nav_try': 'Попробовать →',
    'landing.badge': 'Для Claude Code · Cursor · GitHub Copilot',
    'landing.h1': 'Готовый <code>AGENTS.md</code><br>за 30 секунд',
    'landing.sub': 'Напишите описание проекта — получите полный файл инструкций для AI-агентов.<br>Структура, правила, стек, команды — всё готово к вставке.',
    'landing.cta': 'Сгенерировать бесплатно →',
    'landing.cta_note': '3 генерации бесплатно · Без регистрации',
    'landing.pain_label': 'Сейчас',
    'landing.pain_h2': 'Часы на настройку агента',
    'landing.pain_1': 'Изучаешь документацию Claude Code / Cursor',
    'landing.pain_2': 'Пишешь правила с нуля — и угадываешь что нужно',
    'landing.pain_3': 'Забываешь секции, перечитываешь примеры',
    'landing.pain_4': 'Агент всё равно делает что хочет — правила неточные',
    'landing.good_label': 'С AgentsMD',
    'landing.good_h2': '30 секунд и готово',
    'landing.good_1': 'Описываешь проект одним абзацем',
    'landing.good_2': 'Получаешь структурированный AGENTS.md',
    'landing.good_3': 'Все секции на месте: стек, правила, команды',
    'landing.good_4': 'Агент понимает контекст с первого запроса',
    'landing.features_title': 'Что входит в каждый файл',
    'landing.f1_title': 'Agent Identity',
    'landing.f1_desc': 'Кто такой агент, его миссия и протокол принятия решений в неопределённости',
    'landing.f2_title': 'Tech Stack',
    'landing.f2_desc': 'Таблица с вашим реальным стеком: слой, инструмент, причина выбора',
    'landing.f3_title': 'Code Quality Rules',
    'landing.f3_desc': 'Правила с числами: лимиты файлов, нейминг, обработка ошибок — под ваш стек',
    'landing.f4_title': 'Git Protocol',
    'landing.f4_desc': 'Именование веток, формат коммитов, PR-правила — адаптированы под размер команды',
    'landing.f5_title': 'Security Rules',
    'landing.f5_desc': 'Правила безопасности под конкретный стек — не общие, а с реальными файлами',
    'landing.f6_title': 'Pre-Completion Checklist',
    'landing.f6_desc': 'Чеклист который агент обязан пройти перед завершением любой задачи',
    'landing.pricing_title': 'Сколько стоит?',
    'landing.free_badge': 'Бесплатно',
    'landing.free_title': 'Безлимитные генерации · Навсегда',
    'landing.free_sub': 'Никаких подписок и лимитов. Приноси свой API ключ (Claude или OpenAI) и генерируй сколько угодно.',
    'landing.free_f1': '✓ Безлимитные генерации',
    'landing.free_f2': '✓ Claude и OpenAI на выбор',
    'landing.free_f3': '✓ Простой режим: один файл AGENTS.md (12 секций)',
    'landing.free_f4': '✓ Оркестрованный режим: система агентов (ZIP)',
    'landing.free_f5': '✓ Ваш ключ — ваши данные',
    'landing.free_cta': 'Попробовать бесплатно →',
    'landing.donate_note': 'Каждые несколько генераций мы скромно попросим поддержать проект ☕<br>Без давления, без обязательств — только если понравилось.',
    'landing.faq_title': 'Вопросы',
    'landing.faq1_q': 'Что такое AGENTS.md и зачем он нужен?',
    'landing.faq1_a': 'AGENTS.md — файл инструкций в корне проекта, который объясняет AI-агенту (Claude Code, Cursor, Copilot) как работать с кодовой базой. Без него агент угадывает стек, паттерны и правила. С ним — работает как опытный член команды.',
    'landing.faq2_q': 'Можно ли использовать без регистрации?',
    'landing.faq2_a': 'Да. Принеси свой API ключ (Claude или OpenAI) и генерируй без ограничений. Вход не нужен.',
    'landing.faq3_q': 'В чём разница между Simple и Orchestrated?',
    'landing.faq3_a': 'Simple генерирует один файл AGENTS.md с 12 секциями (~15 сек). Orchestrated генерирует полную мультиагентную систему: главный AGENTS.md + файлы агентов (planner, coder, reviewer, tester) + файлы общей памяти — всё в ZIP-архиве (~30 сек).',
    'landing.faq4_q': 'Для каких языков и фреймворков работает?',
    'landing.faq4_a': 'Для любых. Генератор понимает описание на русском и английском и адаптируется под любой стек: Python, JavaScript, Go, Rust, мобильная разработка, данные, DevOps.',
    'landing.cta_bottom_h2': 'Попробуйте прямо сейчас',
    'landing.cta_bottom_sub': 'Безлимитные генерации. Без кредитной карты.',
    'landing.cta_bottom_btn': 'Сгенерировать AGENTS.md →',
    'landing.footer_copy': '© 2026 · Сделано с Claude Code',
  }
};

// Донат-сообщения по языкам
const DONATE_MESSAGES_I18N = {
  en: [
    { title: 'Buy the developer a coffee ☕', sub: 'This AGENTS.md was generated by a real human... well, almost. Claude worked hard, servers hummed. Support with a coin — or at least kind words.', btn: 'Buy a coffee' },
    { title: 'Fund a Claude Code subscription 🤖', sub: 'The irony: a service for AI agents was built with an AI agent that costs money. Help close the loop.', btn: 'Support' },
    { title: 'Send the dev on vacation 🌴', sub: 'The developer hasn\'t left the house in three weeks. He deserves to see the sun. Help him reach the beach.', btn: 'Book the flight' },
    { title: 'New mechanical keyboard ⌨️', sub: 'Good AGENTS.md files are written on good keyboards. The current one creaks on the letter "e". Help fix that.', btn: 'Buy the keyboard' },
    { title: 'Keep the dev out of an office job 🏠', sub: 'Without support, it\'s back to working for The Man. The service dies. No more AGENTS.md. You don\'t want that, right?', btn: 'Save the service' },
    { title: 'Energy drinks for late-night fixes 🔴', sub: 'Bugs happen at 2am. Fixes too. Impossible without energy drinks. You\'ve generated 3 times — time to share.', btn: 'Fuel the developer' },
    { title: 'Competitor research fund 👀', sub: 'The developer wants to buy ChatGPT Plus and five other subscriptions to know who he\'s up against. It\'s expensive. Help.', btn: 'Fund the intel' },
    { title: 'Domain renewal time 💡', sub: 'The domain costs $15/year. It\'s almost nothing — but someone has to pay it. The developer already spent that on coffee. Twice.', btn: 'Keep the domain alive' },
    { title: 'Just because, from the heart 🙏', sub: 'No drama. You use it, you like it — throw in whatever you can spare. The developer will be genuinely grateful for any amount.', btn: 'Toss a coin' },
    { title: 'Flowers for the developer\'s girlfriend 💐', sub: 'While the developer was building this, his girlfriend was waiting for a quiet evening together. Now he owes her flowers. Help him fix that — she\'s been very patient.', btn: 'Buy the flowers' },
    { title: 'The cat knocked over the coffee ☕🐱', sub: 'The laptop survived. Barely. The coffee did not. The developer is currently running on spite and willpower. A replacement coffee would help a lot.', btn: 'Replace the coffee' },
    { title: 'Mom is asking when he gets a real job 👩', sub: 'Every week she sends the same link: "Software developer, full-time, good benefits." Support the project so the developer can finally show her it\'s working.', btn: 'Prove mom wrong' },
    { title: 'The pizza got cold while debugging 🍕', sub: 'There was a bug. The pizza arrived. The bug won. The developer ate it cold. This is the life. A small donation helps maintain motivation for round two.', btn: 'Reheat the pizza' },
    { title: 'New monitor to see more code at once 🖥️', sub: 'One screen is not enough. The developer\'s neck hurts from switching windows. A second monitor would double productivity. Help make it happen.', btn: 'Fund the monitor' },
    { title: 'The plant died 🪴', sub: 'The developer had a plant. He was coding. The plant was thirsty. Nobody noticed for two weeks. In its memory — support the project.', btn: 'Honor the plant' },
    { title: 'Noise-cancelling headphones 🎧', sub: 'The neighbor renovates. Every day. At 9am. The developer codes through it. Good headphones cost money. Bad headphones cost sanity.', btn: 'Restore the silence' },
    { title: 'Dark circles need eye cream 👁️', sub: 'Three weeks of late nights have left marks. The developer looks like a senior engineer — not by age, just by eye bags. Help fund recovery.', btn: 'Support recovery' },
    { title: 'The rubber duck needs replacement 🦆', sub: 'Rubber duck debugging is real and it works. But the duck has heard too many bugs and is starting to look judgemental. Time for a new one.', btn: 'Buy the duck' },
    { title: 'Celebrate that it actually works 🎉', sub: 'Seriously — it works. The API responds, the markdown renders, you got your file. In the startup world that\'s basically an IPO. Throw something in.', btn: 'Celebrate with us' },
    { title: 'The developer\'s search history 🔍', sub: '"How to find users." "Why nobody is sharing my product." "Is introversion curable." Help cover the therapy costs.', btn: 'Fund the therapy' },
  ],
  ru: [
    { title: 'На кофе разработчику ☕', sub: 'Этот AGENTS.md сгенерировал живой человек... ну почти. Claude старался, сервер гудел. Поддержи монетой — или хотя бы добрым словом.', btn: 'Угостить кофе' },
    { title: 'На подписку Claude Code 🤖', sub: 'Ирония в том, что сервис для AI-агентов сделан с помощью AI-агента, за которого надо платить. Помоги замкнуть круг.', btn: 'Поддержать' },
    { title: 'На отпуск в тёплые страны 🌴', sub: 'Разработчик три недели не выходил из дома. Он заслуживает увидеть солнце. Помоги ему добраться до пляжа.', btn: 'Отправить в отпуск' },
    { title: 'На новую механическую клавиатуру ⌨️', sub: 'Хорошие AGENTS.md пишутся на хороших клавиатурах. Текущая трещит на букве "е". Помоги исправить это.', btn: 'Купить клавиатуру' },
    { title: 'Чтобы разработчик не пошёл в офис 🏠', sub: 'Если не поддержать проект — придётся идти работать на дядю. Сервис умрёт. AGENTS.md больше не будет. Ты же не хочешь этого?', btn: 'Спасти сервис' },
    { title: 'На энергетики для ночных фиксов 🔴', sub: 'Баги случаются в 2 ночи. Фиксы тоже. Без энергетиков это невозможно. Ты уже 3 раза сгенерировал — время делиться.', btn: 'Зарядить разработчика' },
    { title: 'Чтобы проверить конкурентов 👀', sub: 'Разработчик хочет купить ChatGPT Plus и ещё пять подписок чтобы знать с кем конкурирует. Это дорого. Помоги.', btn: 'Поддержать разведку' },
    { title: 'На продление домена 💡', sub: 'Домен стоит $15 в год. Это почти ничего — но кто-то должен заплатить. Разработчик уже потратил эту сумму на кофе. Дважды.', btn: 'Спасти домен' },
    { title: 'Просто так, от души 🙏', sub: 'Без драмы. Ты пользуешься, тебе нравится — кинь сколько не жалко. Разработчик будет рад любой сумме, честно.', btn: 'Кинуть монетку' },
    { title: 'На цветы для девушки разработчика 💐', sub: 'Пока разработчик делал этот проект, его девушка ждала провести вечер вместе. Теперь он должен ей букет. Она была очень терпелива. Помоги исправить ситуацию.', btn: 'Купить букет' },
    { title: 'Кот опрокинул кофе ☕🐱', sub: 'Ноутбук выжил. Чудом. Кофе — нет. Разработчик сейчас работает на силе воли и обиде. Замена кофе очень помогла бы.', btn: 'Заменить кофе' },
    { title: 'Мама спрашивает про нормальную работу 👩', sub: 'Каждую неделю она присылает одну и ту же ссылку: "Разработчик, офис, соцпакет". Поддержи проект — и разработчик наконец сможет ей что-то показать.', btn: 'Доказать маме' },
    { title: 'Пицца остыла пока дебажил 🍕', sub: 'Был баг. Привезли пиццу. Баг победил. Разработчик съел её холодной. Это жизнь. Небольшой донат помогает сохранить мотивацию на второй круг.', btn: 'Разогреть пиццу' },
    { title: 'На монитор чтобы видеть больше кода 🖥️', sub: 'Одного экрана мало. У разработчика болит шея от переключения окон. Второй монитор удвоит продуктивность. Помоги это осуществить.', btn: 'Профинансировать монитор' },
    { title: 'Цветок погиб 🪴', sub: 'У разработчика был цветок. Он кодил. Цветок хотел пить. Никто не заметил две недели. В его память — поддержи проект.', btn: 'Почтить память цветка' },
    { title: 'Наушники с шумодавом 🎧', sub: 'Сосед делает ремонт. Каждый день. В 9 утра. Разработчик кодит сквозь это. Хорошие наушники стоят денег. Плохие наушники стоят рассудка.', btn: 'Вернуть тишину' },
    { title: 'Синяки под глазами 👁️', sub: 'Три недели поздних ночей оставили следы. Разработчик выглядит как сеньор — не по возрасту, а по мешкам под глазами. Помоги с восстановлением.', btn: 'Поддержать восстановление' },
    { title: 'Резиновая утка требует замены 🦆', sub: 'Rubber duck debugging — это реально и работает. Но утка выслушала слишком много багов и начинает смотреть с осуждением. Пора за новой.', btn: 'Купить утку' },
    { title: 'Отпраздновать что оно работает 🎉', sub: 'Серьёзно — работает. API отвечает, markdown рендерится, файл получен. В мире стартапов это считается как IPO. Кинь что-нибудь.', btn: 'Отпраздновать вместе' },
    { title: 'История поиска разработчика 🔍', sub: '"Как найти пользователей." "Почему никто не шерит мой продукт." "Лечится ли интровертность." Помоги покрыть расходы на терапию.', btn: 'Оплатить терапию' },
  ]
};

// ---- Core i18n engine ----

let currentLang = localStorage.getItem('agentsmd_lang') || 'en';

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] ?? TRANSLATIONS['en']?.[key] ?? key;
}

function getDonateMessages() {
  return DONATE_MESSAGES_I18N[currentLang] || DONATE_MESSAGES_I18N['en'];
}

function applyTranslations() {
  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // innerHTML (for links/code tags inside)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  // Update lang switcher button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.textContent = currentLang === 'en' ? 'RU' : 'EN';
    btn.title = currentLang === 'en' ? 'Switch to Russian' : 'Switch to English';
  });
}

function switchLang() {
  currentLang = currentLang === 'en' ? 'ru' : 'en';
  localStorage.setItem('agentsmd_lang', currentLang);
  applyTranslations();
}

// Apply on load
document.addEventListener('DOMContentLoaded', applyTranslations);
