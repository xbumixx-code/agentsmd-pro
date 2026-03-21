// frontend/js/result.js — AgentsMD.pro
// Логика страницы результата: рендер markdown, копирование, скачивание

document.addEventListener('DOMContentLoaded', () => {
  // Загрузить результат из sessionStorage
  const raw = sessionStorage.getItem('agentsmd_result');
  if (!raw) {
    // Нет данных — вернуться на главную
    window.location.href = 'index.html';
    return;
  }

  let result;
  try {
    result = JSON.parse(raw);
  } catch {
    window.location.href = 'index.html';
    return;
  }

  const { content, tokens_used, generation_id, remaining } = result;

  // Отрендерить markdown с подсветкой кода
  const contentEl = document.getElementById('result-content');
  const rawEl = document.getElementById('raw-content');

  if (contentEl && content) {
    // Настроить marked с highlight.js
    marked.setOptions({
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true,
    });

    contentEl.innerHTML = marked.parse(content);

    // Подсветить все блоки кода
    contentEl.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
  }

  // Сохранить сырой текст для копирования
  if (rawEl) rawEl.value = content || '';

  // Показать метаданные
  const tokensEl = document.getElementById('tokens-info');
  if (tokensEl && tokens_used) {
    tokensEl.textContent = `${tokens_used} токенов`;
  }

  // Показать счётчик оставшихся генераций (если free)
  if (remaining !== null && remaining !== undefined) {
    const badge = document.createElement('span');
    badge.className = 'remaining-badge';
    badge.textContent = remaining > 0
      ? `Осталось ${remaining} из 3 бесплатных`
      : 'Бесплатные генерации закончились';
    document.querySelector('.result-actions')?.prepend(badge);
  }

  // ---- Кнопка Копировать ----
  document.getElementById('copy-btn')?.addEventListener('click', async () => {
    const text = rawEl.value;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback для старых браузеров
      rawEl.select();
      document.execCommand('copy');
    }
    showToast();
  });

  // ---- Кнопка Скачать ----
  document.getElementById('download-btn')?.addEventListener('click', () => {
    const text = rawEl.value;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AGENTS.md';
    a.click();
    URL.revokeObjectURL(url);
  });

  // ---- Кнопка Регенерировать ----
  document.getElementById('regen-btn')?.addEventListener('click', () => {
    // Восстановить данные формы и перейти обратно
    if (result.input) {
      sessionStorage.setItem('agentsmd_prefill', JSON.stringify(result.input));
    }
    window.location.href = 'index.html';
  });

  // Показать toast уведомление
  function showToast() {
    const toast = document.getElementById('copy-toast');
    if (!toast) return;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
  }
});
