// frontend/js/templates.js — AgentsMD.pro
// 6 готовых шаблонов для быстрого заполнения формы

const TEMPLATES = [
  {
    label: 'Python SaaS',
    icon: '🐍',
    description: 'Python FastAPI backend для SaaS-сервиса. PostgreSQL для хранения, Redis для кеша. Деплой на Railway. Один разработчик.',
    type: 'code',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
    team_size: 'solo',
  },
  {
    label: 'Node.js API',
    icon: '🟢',
    description: 'Node.js REST API с Express. MongoDB Atlas как база данных. JWT авторизация. Деплой на Heroku. Команда 2 разработчика.',
    type: 'code',
    technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
    team_size: 'small',
  },
  {
    label: 'Chrome Extension',
    icon: '🔌',
    description: 'Chrome Extension MV3 для продуктивности. Cloudflare Worker как backend API. Lemon Squeezy для монетизации. Один разработчик.',
    type: 'code',
    technologies: ['JavaScript', 'Chrome MV3', 'Cloudflare Workers'],
    team_size: 'solo',
  },
  {
    label: 'Telegram Bot',
    icon: '🤖',
    description: 'Telegram бот на Python с помощью python-telegram-bot v20. Supabase как база данных. Деплой на Railway. Монетизация через Stars.',
    type: 'code',
    technologies: ['Python', 'python-telegram-bot', 'Supabase', 'Railway'],
    team_size: 'solo',
  },
  {
    label: 'Data Pipeline',
    icon: '📊',
    description: 'ETL pipeline для обработки данных. Apache Airflow для оркестрации. S3 для хранения. dbt для трансформаций. Команда 3 дата-инженера.',
    type: 'data',
    technologies: ['Python', 'Apache Airflow', 'AWS S3', 'dbt', 'PostgreSQL'],
    team_size: 'small',
  },
  {
    label: 'React Web App',
    icon: '⚛️',
    description: 'React SaaS приложение. Vite как сборщик. Supabase для auth и базы данных. Tailwind CSS. Деплой на Vercel. Команда 3 человека.',
    type: 'code',
    technologies: ['React', 'TypeScript', 'Vite', 'Supabase', 'Tailwind CSS'],
    team_size: 'small',
  },
];

// Рендер шаблонов в грид
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

// Заполнить форму данными шаблона
function applyTemplate(tmpl) {
  const desc = document.getElementById('description');
  const type = document.getElementById('agent-type');
  const tech = document.getElementById('technologies');
  const team = document.getElementById('team-size');

  if (desc) { desc.value = tmpl.description; desc.dispatchEvent(new Event('input')); }
  if (type) type.value = tmpl.type;
  if (tech) tech.value = tmpl.technologies.join(', ');
  if (team) team.value = tmpl.team_size;

  // Скролл к форме
  document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
