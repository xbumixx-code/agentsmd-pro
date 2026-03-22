// public/js/result.js — AgentsMD.pro v2
// Рендер результата: simple (один файл) и orchestrated (файловые вкладки + ZIP)

document.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('agentsmd_result');
  if (!raw) { window.location.href = 'index.html'; return; }

  let result;
  try { result = JSON.parse(raw); } catch { window.location.href = 'index.html'; return; }

  // Configure marked + highlight.js
  marked.setOptions({
    highlight: (code, lang) => {
      if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value;
      return hljs.highlightAuto(code).value;
    },
    breaks: true, gfm: true,
  });

  // Show token count
  const tokensEl = document.getElementById('tokens-info');
  if (tokensEl && result.tokens_used) {
    tokensEl.textContent = `${result.tokens_used} ${t('result.tokens')}`;
  }

  if (result.mode === 'orchestrated' && result.files?.length) {
    renderOrchestrated(result);
  } else {
    renderSimple(result);
  }

  // Regenerate
  document.getElementById('regen-btn')?.addEventListener('click', () => {
    if (result.input) sessionStorage.setItem('agentsmd_prefill', JSON.stringify(result.input));
    window.location.href = 'index.html';
  });
});

// ── Simple mode ─────────────────────────────────────────────────────────────

function renderSimple(result) {
  document.getElementById('actions-simple').style.display    = '';
  document.getElementById('actions-orchestrated').style.display = 'none';
  document.getElementById('view-simple').style.display       = '';
  document.getElementById('view-orchestrated').style.display = 'none';

  const contentEl = document.getElementById('result-content');
  const rawEl     = document.getElementById('raw-content');

  if (result.content) {
    contentEl.innerHTML = marked.parse(result.content);
    contentEl.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
    rawEl.value = result.content;
  }

  // Copy
  document.getElementById('copy-btn')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(rawEl.value); }
    catch { rawEl.select(); document.execCommand('copy'); }
    showToast();
  });

  // Download single file
  document.getElementById('download-btn')?.addEventListener('click', () => {
    downloadFile('AGENTS.md', rawEl.value, 'text/markdown');
  });
}

// ── Orchestrated mode ───────────────────────────────────────────────────────

function renderOrchestrated(result) {
  document.getElementById('actions-simple').style.display       = 'none';
  document.getElementById('actions-orchestrated').style.display = '';
  document.getElementById('view-simple').style.display          = 'none';
  document.getElementById('view-orchestrated').style.display    = '';

  const files       = result.files;
  const filesCount  = document.getElementById('files-count');
  if (filesCount) filesCount.textContent = `${files.length} ${t('result.files_count')}`;

  // Build tabs
  const tabsEl   = document.getElementById('file-tabs');
  const contentEl = document.getElementById('file-content');
  let activeIdx   = 0;

  tabsEl.innerHTML = files.map((f, i) => `
    <button class="file-tab ${i === 0 ? 'active' : ''}" data-idx="${i}">
      ${fileIcon(f.path)} ${f.path}
    </button>`).join('');

  function showFile(idx) {
    activeIdx = idx;
    tabsEl.querySelectorAll('.file-tab').forEach((btn, i) => btn.classList.toggle('active', i === idx));
    const md = files[idx].content;
    contentEl.innerHTML = marked.parse(md);
    contentEl.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
    document.getElementById('raw-content').value = md;
  }

  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.file-tab');
    if (btn) showFile(parseInt(btn.dataset.idx));
  });

  showFile(0);

  // Download ZIP
  document.getElementById('download-zip-btn')?.addEventListener('click', async () => {
    await downloadZip(files);
  });
}

// ── ZIP download ────────────────────────────────────────────────────────────

async function downloadZip(files) {
  const zip = new JSZip();
  files.forEach(f => zip.file(f.path, f.content));
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'agents-system.zip';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function showToast() {
  const toast = document.getElementById('copy-toast');
  if (!toast) return;
  if (typeof t === 'function') toast.textContent = t('result.copied');
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

function fileIcon(path) {
  if (path.startsWith('agents/')) return '🤖';
  if (path.startsWith('memory/')) return '🧠';
  return '📄';
}
