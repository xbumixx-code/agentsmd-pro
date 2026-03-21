// frontend/js/templates.js — AgentsMD.pro
// 6 quick-fill templates with EN/RU descriptions

const TEMPLATES = [
  {
    label: 'Python SaaS',
    icon: '🐍',
    description: {
      en: 'Python FastAPI backend for a SaaS service. PostgreSQL for storage, Redis for caching. Deployed on Railway. Solo developer.',
      ru: 'Python FastAPI backend для SaaS-сервиса. PostgreSQL для хранения, Redis для кеша. Деплой на Railway. Один разработчик.',
    },
    type: 'code',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
    team_size: 'solo',
  },
  {
    label: 'Node.js API',
    icon: '🟢',
    description: {
      en: 'Node.js REST API with Express. MongoDB Atlas as database. JWT authentication. Deployed on Heroku. Team of 2 developers.',
      ru: 'Node.js REST API с Express. MongoDB Atlas как база данных. JWT авторизация. Деплой на Heroku. Команда 2 разработчика.',
    },
    type: 'code',
    technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
    team_size: 'small',
  },
  {
    label: 'Chrome Extension',
    icon: '🔌',
    description: {
      en: 'Chrome Extension MV3 for productivity. Cloudflare Worker as backend API. Lemon Squeezy for monetization. Solo developer.',
      ru: 'Chrome Extension MV3 для продуктивности. Cloudflare Worker как backend API. Lemon Squeezy для монетизации. Один разработчик.',
    },
    type: 'code',
    technologies: ['JavaScript', 'Chrome MV3', 'Cloudflare Workers'],
    team_size: 'solo',
  },
  {
    label: 'Telegram Bot',
    icon: '🤖',
    description: {
      en: 'Telegram bot in Python using python-telegram-bot v20. Supabase as database. Deployed on Railway. Monetization via Stars.',
      ru: 'Telegram бот на Python с помощью python-telegram-bot v20. Supabase как база данных. Деплой на Railway. Монетизация через Stars.',
    },
    type: 'code',
    technologies: ['Python', 'python-telegram-bot', 'Supabase', 'Railway'],
    team_size: 'solo',
  },
  {
    label: 'Data Pipeline',
    icon: '📊',
    description: {
      en: 'ETL pipeline for data processing. Apache Airflow for orchestration. S3 for storage. dbt for transformations. Team of 3 data engineers.',
      ru: 'ETL pipeline для обработки данных. Apache Airflow для оркестрации. S3 для хранения. dbt для трансформаций. Команда 3 дата-инженера.',
    },
    type: 'data',
    technologies: ['Python', 'Apache Airflow', 'AWS S3', 'dbt', 'PostgreSQL'],
    team_size: 'small',
  },
  {
    label: 'React Web App',
    icon: '⚛️',
    description: {
      en: 'React SaaS application. Vite as bundler. Supabase for auth and database. Tailwind CSS. Deployed on Vercel. Team of 3.',
      ru: 'React SaaS приложение. Vite как сборщик. Supabase для auth и базы данных. Tailwind CSS. Деплой на Vercel. Команда 3 человека.',
    },
    type: 'code',
    technologies: ['React', 'TypeScript', 'Vite', 'Supabase', 'Tailwind CSS'],
    team_size: 'small',
  },
];

// Render templates into grid
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('templates-grid');
  if (!grid) return;

  TEMPLATES.forEach(tmpl => {
    const btn = document.createElement('button');
    btn.className = 'template-chip';
    btn.innerHTML = `${tmpl.icon} ${tmpl.label}`;
    btn.addEventListener('click', () => applyTemplate(tmpl));
    grid.appendChild(btn);
  });
});

// Fill form with template data, using current language for description
function applyTemplate(tmpl) {
  const desc = document.getElementById('description');
  const type = document.getElementById('agent-type');
  const tech = document.getElementById('technologies');
  const team = document.getElementById('team-size');

  const lang = (typeof currentLang !== 'undefined' ? currentLang : null)
    || localStorage.getItem('agentsmd_lang')
    || 'en';
  const description = (typeof tmpl.description === 'object')
    ? (tmpl.description[lang] || tmpl.description.en)
    : tmpl.description;

  if (desc) { desc.value = description; desc.dispatchEvent(new Event('input')); }
  if (type) type.value = tmpl.type;
  if (tech) tech.value = tmpl.technologies.join(', ');
  if (team) team.value = tmpl.team_size;

  // Scroll to form
  document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
