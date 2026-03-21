// frontend/js/app.js — AgentsMD.pro
// Логика главной формы: валидация, отправка запроса, обработка ответа

// ---- API Key управление (с AES-GCM шифрованием) ----

// Кэш расшифрованного ключа на время сессии (не покидает память)
let _cachedApiKey = null;

async function saveApiKey() {
  const key = document.getElementById('user-api-key').value.trim();
  const provider = document.getElementById('tab-openai').classList.contains('active') ? 'openai' : 'claude';
  if (!key) return;
  await saveApiKeySecure(key, provider);
  _cachedApiKey = { key, provider };
  updateApiKeyUI({ key, provider });
  const msg = document.getElementById('api-key-message');
  msg.textContent = '✓ Ключ сохранён и зашифрован';
  setTimeout(() => { msg.textContent = ''; }, 2000);
}

async function getApiKeyData() {
  if (_cachedApiKey) return _cachedApiKey;
  const data = await loadApiKeySecure();
  if (data) _cachedApiKey = data;
  return data;
}

function selectProvider(p) {
  document.getElementById('tab-claude').classList.toggle('active', p === 'claude');
  document.getElementById('tab-openai').classList.toggle('active', p === 'openai');
  document.getElementById('api-key-hint-claude').style.display = p === 'claude' ? '' : 'none';
  document.getElementById('api-key-hint-openai').style.display = p === 'openai' ? '' : 'none';
}

function toggleApiBlock() {
  const body = document.getElementById('api-key-body');
  const chevron = document.getElementById('api-key-chevron');
  const open = body.style.display === 'none';
  body.style.display = open ? '' : 'none';
  chevron.classList.toggle('open', open);
}

function updateApiKeyUI(data) {
  const dot = document.getElementById('api-key-status-dot');
  const summary = document.getElementById('api-key-summary');
  if (data?.key) {
    dot.className = 'status-dot status-dot--ok';
    const masked = data.key.slice(0, 6) + '••••••••••••';
    summary.textContent = `${data.provider === 'openai' ? 'OpenAI' : 'Claude'} · ${masked}`;
    document.getElementById('user-api-key').value = data.key;
    selectProvider(data.provider || 'claude');
  } else {
    dot.className = 'status-dot status-dot--empty';
    summary.textContent = 'не задан';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Загружаем и расшифровываем ключ при старте
  const savedKey = await loadApiKeySecure();
  updateApiKeyUI(savedKey);
  if (savedKey) _cachedApiKey = savedKey;

  const descriptionEl = document.getElementById('description');
  const generateBtn = document.getElementById('generate-btn');
  const btnText = document.getElementById('btn-text');
  const btnLoader = document.getElementById('btn-loader');
  const charCount = document.getElementById('char-count');

  // Восстановить форму после «Регенерировать»
  const prefill = sessionStorage.getItem('agentsmd_prefill');
  if (prefill) {
    try {
      const p = JSON.parse(prefill);
      if (p.description) { descriptionEl.value = p.description; descriptionEl.dispatchEvent(new Event('input')); }
      if (p.type) document.getElementById('agent-type').value = p.type;
      if (p.team_size) document.getElementById('team-size').value = p.team_size;
      if (p.language) document.getElementById('language').value = p.language;
      if (p.technologies?.length) document.getElementById('technologies').value = p.technologies.join(', ');
    } catch {}
    sessionStorage.removeItem('agentsmd_prefill');
  }

  // Включить кнопку когда введено достаточно текста
  descriptionEl.addEventListener('input', () => {
    const len = descriptionEl.value.trim().length;
    charCount.textContent = len;
    generateBtn.disabled = len < 20;
  });

  // Обработка отправки формы
  generateBtn.addEventListener('click', async () => {
    const description = descriptionEl.value.trim();
    if (description.length < 20) return;

    const apiKeyData = await getApiKeyData();
    if (!apiKeyData?.key) {
      // Открыть блок с ключом если не задан
      const body = document.getElementById('api-key-body');
      const chevron = document.getElementById('api-key-chevron');
      body.style.display = '';
      chevron.classList.add('open');
      showError('Введите ваш API ключ в блоке выше');
      return;
    }

    // Показать лоадер
    setLoading(true);

    const payload = {
      description,
      type: document.getElementById('agent-type').value,
      team_size: document.getElementById('team-size').value,
      language: document.getElementById('language').value,
      technologies: document.getElementById('technologies').value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      provider: apiKeyData.provider || 'claude',
      user_api_key: apiKeyData.key,
    };

    try {
      const response = await fetch(`${window._config.API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        showError(data.message || 'Ошибка генерации, попробуйте ещё раз');
        return;
      }

      const data = await response.json();

      // Сохранить результат в sessionStorage
      sessionStorage.setItem('agentsmd_result', JSON.stringify({
        content: data.content,
        generation_id: data.generation_id,
        tokens_used: data.tokens_used,
        input: payload,
      }));

      // Показать донат-модал каждые 3 генерации, потом перейти на результат
      const shouldDonate = (parseInt(localStorage.getItem('agentsmd_gen_count') || '0') + 1) % 3 === 0;
      trackGenerationAndMaybeShowDonate();

      if (shouldDonate) {
        // Модал показан — кнопка «Продолжить» сама перенаправит
        const overlay = document.getElementById('upgrade-overlay');
        const continueBtn = overlay?.querySelector('.btn-link');
        if (continueBtn) {
          continueBtn.onclick = () => { window.location.href = 'result.html'; };
        }
        // Также по клику на Buy — переходим после открытия новой вкладки
        const buyBtn = overlay?.querySelector('.modal-cta');
        if (buyBtn) {
          buyBtn.addEventListener('click', () => {
            setTimeout(() => { window.location.href = 'result.html'; }, 300);
          });
        }
      } else {
        window.location.href = 'result.html';
      }

    } catch (err) {
      console.error('[AgentsMD] Generate error:', err);
      showError('Нет соединения, проверьте интернет и попробуйте ещё раз');
    } finally {
      setLoading(false);
    }
  });

  // Показать/скрыть лоадер
  function setLoading(loading) {
    generateBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline';
    btnLoader.style.display = loading ? 'inline-block' : 'none';
    if (loading) btnText.textContent = 'Генерирую...';
    else btnText.textContent = 'Сгенерировать AGENTS.md';
  }

  // Показать ошибку под кнопкой
  function showError(message) {
    let el = document.getElementById('generate-error');
    if (!el) {
      el = document.createElement('div');
      el.id = 'generate-error';
      el.className = 'error-message';
      generateBtn.parentNode.insertBefore(el, generateBtn.nextSibling);
    }
    el.textContent = message;
    setTimeout(() => el.remove(), 5000);
  }

});
