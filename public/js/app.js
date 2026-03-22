// public/js/app.js — AgentsMD.pro v2
// Многошаговый флоу: Step1 → Step2 (бриф) → Progress (SSE) → result.html
// [AgentsMD] префикс для всех console.log

let _cachedApiKey = null;

// ── API Key управление ──────────────────────────────────────────────────────

async function saveApiKey() {
  const key      = document.getElementById('user-api-key').value.trim();
  const provider = document.getElementById('tab-openai').classList.contains('active') ? 'openai' : 'claude';
  if (!key) return;
  await saveApiKeySecure(key, provider);
  _cachedApiKey = { key, provider };
  updateApiKeyUI({ key, provider });
  const msg = document.getElementById('api-key-message');
  msg.textContent = t('apikey.saved');
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
  const body    = document.getElementById('api-key-body');
  const chevron = document.getElementById('api-key-chevron');
  const open    = body.style.display === 'none';
  body.style.display = open ? '' : 'none';
  chevron.classList.toggle('open', open);
}

function updateApiKeyUI(data) {
  const dot     = document.getElementById('api-key-status-dot');
  const summary = document.getElementById('api-key-summary');
  if (data?.key) {
    dot.className    = 'status-dot status-dot--ok';
    summary.textContent = `${data.provider === 'openai' ? 'OpenAI' : 'Claude'} · ${data.key.slice(0, 6)}••••••`;
    document.getElementById('user-api-key').value = data.key;
    selectProvider(data.provider || 'claude');
  } else {
    dot.className    = 'status-dot status-dot--empty';
    summary.textContent = t('apikey.not_set');
  }
}

// ── Step navigation ─────────────────────────────────────────────────────────

function showStep(n) {
  document.getElementById('step-1').style.display        = n === 1 ? '' : 'none';
  document.getElementById('step-2').style.display        = n === 2 ? '' : 'none';
  document.getElementById('progress-panel').style.display = n === 3 ? '' : 'none';
}

function goToStep1() { showStep(1); }

// Brief questions: показываем секцию под тип проекта
function updateBriefSections(type) {
  document.getElementById('brief-code').style.display = type === 'code' ? '' : 'none';
  document.getElementById('brief-data').style.display = type === 'data' ? '' : 'none';
  document.getElementById('brief-ops').style.display  = type === 'ops'  ? '' : 'none';
}

// Пропустить Step 2 — идём сразу к генерации
function skipBrief() { startGeneration({}); }

// Собрать brief_answers из Step 2
function collectBriefAnswers() {
  const type = document.getElementById('agent-type').value;
  const answers = {
    biggest_mistake: document.getElementById('brief-mistake').value.trim() || null,
    done_criteria:   document.getElementById('brief-done').value.trim()    || null,
    non_standard:    document.getElementById('brief-nonstandard').value.trim() || null,
  };
  if (type === 'code') {
    answers.monorepo  = document.getElementById('brief-monorepo').value  || null;
    answers.has_tests = document.getElementById('brief-tests').value     || null;
    answers.ci_cd     = document.getElementById('brief-cicd').value.trim()   || null;
    answers.legacy    = document.getElementById('brief-legacy').value.trim()  || null;
  }
  if (type === 'data') {
    answers.batch_stream      = document.getElementById('brief-batch').value      || null;
    answers.data_sensitivity  = document.getElementById('brief-sensitivity').value || null;
    answers.orchestration     = document.getElementById('brief-orchestration').value.trim() || null;
  }
  if (type === 'ops') {
    answers.cloud_provider = document.getElementById('brief-cloud').value.trim()      || null;
    answers.iac_tool       = document.getElementById('brief-iac').value.trim()        || null;
    answers.compliance     = document.getElementById('brief-compliance').value.trim() || null;
  }
  return answers;
}

// ── Progress panel ──────────────────────────────────────────────────────────

const STAGES = [
  { id: 'analyzing',  label: () => t('progress.analyzing')  },
  { id: 'identity',   label: () => t('progress.identity')   },
  { id: 'rules',      label: () => t('progress.rules')      },
  { id: 'workflow',   label: () => t('progress.workflow')   },
  { id: 'git',        label: () => t('progress.git')        },
  { id: 'security',   label: () => t('progress.security')   },
  { id: 'checklist',  label: () => t('progress.checklist')  },
  { id: 'agents',     label: () => t('progress.agents')     },
  { id: 'assembling', label: () => t('progress.assembling') },
];

function renderProgressStages() {
  const container = document.getElementById('progress-stages');
  container.innerHTML = STAGES.map(s => `
    <div class="progress-stage" id="ps-${s.id}">
      <span class="ps-icon">○</span>
      <span class="ps-label">${s.label()}</span>
    </div>`).join('');
}

function setStageStatus(stageId, status) {
  // status: 'active' | 'done' | 'error'
  const el   = document.getElementById(`ps-${stageId}`);
  if (!el) return;
  const icon = el.querySelector('.ps-icon');
  el.className = `progress-stage ps-${status}`;
  if (status === 'active') icon.textContent = '⟳';
  if (status === 'done')   icon.textContent = '✓';
  if (status === 'error')  icon.textContent = '✗';
}

// ── Core: generation with SSE ───────────────────────────────────────────────

async function startGeneration(briefAnswers) {
  const apiKeyData = await getApiKeyData();
  if (!apiKeyData?.key) {
    showStep(1);
    const body = document.getElementById('api-key-body');
    body.style.display = '';
    document.getElementById('api-key-chevron').classList.add('open');
    showError('step1-error', t('form.error_apikey'));
    return;
  }

  const mode = document.querySelector('input[name="gen-mode"]:checked')?.value || 'simple';

  const payload = {
    description:  document.getElementById('description').value.trim(),
    type:         document.getElementById('agent-type').value,
    team_size:    document.getElementById('team-size').value,
    language:     document.getElementById('language').value,
    technologies: document.getElementById('technologies').value
      .split(',').map(s => s.trim()).filter(Boolean),
    provider:     apiKeyData.provider || 'claude',
    user_api_key: apiKeyData.key,
    mode,
    brief_answers: briefAnswers,
  };

  // Show progress panel
  renderProgressStages();
  showStep(3);
  console.log('[AgentsMD] Starting v2 generation, mode:', mode);

  try {
    const response = await fetch(`${window._config.API_BASE_URL}/generate-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || t('form.error_generic'));
    }

    // Read SSE stream
    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          handleSSEEvent(event, payload);
        } catch { /* malformed line */ }
      }
    }
  } catch (err) {
    console.error('[AgentsMD] Generation error:', err);
    showStep(2);
    showError('step2-error', err.message || t('form.error_network'));
  }
}

function handleSSEEvent(event, payload) {
  if (event.type === 'progress') {
    setStageStatus(event.stage, 'active');
  }

  if (event.type === 'error') {
    console.error('[AgentsMD] SSE error:', event.message);
    showStep(2);
    showError('step2-error', event.message || t('form.error_generic'));
  }

  if (event.type === 'done') {
    // Mark all completed stages as done
    STAGES.forEach(s => {
      const el = document.getElementById(`ps-${s.id}`);
      if (el && el.className.includes('ps-active')) setStageStatus(s.id, 'done');
    });
    setStageStatus('assembling', 'done');

    // Save result and navigate
    sessionStorage.setItem('agentsmd_result', JSON.stringify({
      mode:          event.mode,
      content:       event.content   || null,
      files:         event.files     || null,
      tokens_used:   event.tokens_used,
      generation_id: event.generation_id,
      input:         payload,
    }));

    trackGenerationAndMaybeShowDonate();
    const shouldDonate = parseInt(localStorage.getItem('agentsmd_gen_count') || '0') % 3 === 0;

    if (shouldDonate) {
      const overlay     = document.getElementById('upgrade-overlay');
      const continueBtn = overlay?.querySelector('.btn-link');
      if (continueBtn) continueBtn.onclick = () => { window.location.href = 'result.html'; };
    } else {
      window.location.href = 'result.html';
    }
  }
}

// ── Error helpers ───────────────────────────────────────────────────────────

function showError(elId, message) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

// ── DOMContentLoaded ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved API key
  const savedKey = await loadApiKeySecure();
  updateApiKeyUI(savedKey);
  if (savedKey) _cachedApiKey = savedKey;

  const descriptionEl = document.getElementById('description');
  const nextBtn       = document.getElementById('next-btn');
  const charCount     = document.getElementById('char-count');

  // Restore prefill from Regenerate
  const prefill = sessionStorage.getItem('agentsmd_prefill');
  if (prefill) {
    try {
      const p = JSON.parse(prefill);
      if (p.description)    { descriptionEl.value = p.description; descriptionEl.dispatchEvent(new Event('input')); }
      if (p.type)           document.getElementById('agent-type').value  = p.type;
      if (p.team_size)      document.getElementById('team-size').value   = p.team_size;
      if (p.language)       document.getElementById('language').value    = p.language;
      if (p.technologies?.length) document.getElementById('technologies').value = p.technologies.join(', ');
    } catch {}
    sessionStorage.removeItem('agentsmd_prefill');
  }

  // Enable Next button when enough text
  descriptionEl.addEventListener('input', () => {
    const len = descriptionEl.value.trim().length;
    charCount.textContent  = len;
    nextBtn.disabled       = len < 20;
  });

  // Update brief sections when type changes
  document.getElementById('agent-type').addEventListener('change', (e) => {
    updateBriefSections(e.target.value);
  });
  updateBriefSections(document.getElementById('agent-type').value);

  // Step 1 → Step 2
  nextBtn.addEventListener('click', () => {
    if (descriptionEl.value.trim().length < 20) return;
    showStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Step 2 → Generate
  document.getElementById('generate-btn').addEventListener('click', () => {
    const briefAnswers = collectBriefAnswers();
    startGeneration(briefAnswers);
  });
});
