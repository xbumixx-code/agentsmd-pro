// frontend/js/result.js — AgentsMD.pro
// Result page logic: markdown render, copy, download

document.addEventListener('DOMContentLoaded', () => {
  // Load result from sessionStorage
  const raw = sessionStorage.getItem('agentsmd_result');
  if (!raw) {
    // No data — go back to main page
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

  // Render markdown with syntax highlighting
  const contentEl = document.getElementById('result-content');
  const rawEl = document.getElementById('raw-content');

  if (contentEl && content) {
    // Configure marked with highlight.js
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

    // Highlight all code blocks
    contentEl.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
  }

  // Save raw text for copying
  if (rawEl) rawEl.value = content || '';

  // Show token count
  const tokensEl = document.getElementById('tokens-info');
  if (tokensEl && tokens_used) {
    const tokensLabel = (typeof t === 'function') ? t('result.tokens') : 'tokens';
    tokensEl.textContent = `${tokens_used} ${tokensLabel}`;
  }

  // ---- Copy button ----
  document.getElementById('copy-btn')?.addEventListener('click', async () => {
    const text = rawEl.value;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      rawEl.select();
      document.execCommand('copy');
    }
    showToast();
  });

  // ---- Download button ----
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

  // ---- Regenerate button ----
  document.getElementById('regen-btn')?.addEventListener('click', () => {
    // Restore form data and go back
    if (result.input) {
      sessionStorage.setItem('agentsmd_prefill', JSON.stringify(result.input));
    }
    window.location.href = 'index.html';
  });

  // Show toast notification
  function showToast() {
    const toast = document.getElementById('copy-toast');
    if (!toast) return;
    // Update text from i18n if available
    if (typeof t === 'function') toast.textContent = t('result.copied');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
  }
});
