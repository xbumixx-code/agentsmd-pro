// api/generate-v2.js — AgentsMD.pro v2
// Оркестратор многостадийной генерации AGENTS.md
// Stage 1: Analyzer → project_dna
// Stage 2: Section generators (параллельно)
// Stage 3: Assemble → финальный файл или массив файлов для ZIP

export const config = { runtime: 'edge' };

import {
  ANALYZER_PROMPT,
  IDENTITY_PROMPT, RULES_PROMPT, WORKFLOW_PROMPT,
  GIT_PROMPT, SECURITY_PROMPT, CHECKLIST_PROMPT,
  ORCHESTRATOR_PROMPT, CODER_AGENT_PROMPT, REVIEWER_AGENT_PROMPT,
  TESTER_AGENT_PROMPT, PLANNER_AGENT_PROMPT, MEMORY_TEMPLATES_PROMPT,
  buildAnalyzerMessage, buildSectionMessage,
} from '../lib/prompts-v2.js';

import { assembleSimple, assembleOrchestrated } from '../lib/assembler.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const CLAUDE_MODEL   = 'claude-sonnet-4-20250514';
const OPENAI_MODEL   = 'gpt-5.4-mini';
const ANALYZER_TOKENS  = 1500;  // DNA — структурированный JSON
const SECTION_TOKENS   = 1000;  // Каждая секция — 150-350 слов
const AGENT_FILE_TOKENS = 1200; // Sub-agent файлы

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed' }, { status: 405, headers: CORS });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers: CORS });
  }

  const {
    description, type, technologies, team_size, language,
    provider, user_api_key, mode = 'simple', brief_answers = {},
  } = body;

  // Валидация
  if (!description || description.trim().length < 20) {
    return Response.json({ error: 'validation_error', message: 'Description must be at least 20 characters' }, { status: 400, headers: CORS });
  }
  if (!user_api_key?.trim()) {
    return Response.json({ error: 'api_key_required', message: 'API key is required' }, { status: 400, headers: CORS });
  }

  const apiKey      = user_api_key.trim();
  const useOpenAI   = provider === 'openai';
  const encoder     = new TextEncoder();

  // SSE стрим
  const stream = new ReadableStream({
    async start(controller) {
      // Хелпер: отправить SSE событие
      const send = (data) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch { /* stream closed */ }
      };

      // Хелпер: вызов Claude или OpenAI, возвращает текст
      const callAI = async (systemPrompt, userMessage, maxTokens = SECTION_TOKENS) => {
        if (useOpenAI) {
          return callOpenAI(systemPrompt, userMessage, apiKey, maxTokens);
        }
        return callClaude(systemPrompt, userMessage, apiKey, maxTokens);
      };

      try {
        // ── STAGE 1: ANALYZER ──────────────────────────────────────────
        send({ type: 'progress', stage: 'analyzing', label: 'Analyzing project...' });

        const analyzerMessage = buildAnalyzerMessage({
          description, type, technologies, team_size, language, mode, brief_answers,
        });

        const analyzerRaw = await callAI(ANALYZER_PROMPT, analyzerMessage, ANALYZER_TOKENS);

        // Парсим JSON из ответа анализатора
        let dna;
        try {
          // Claude иногда оборачивает в ```json ... ```
          const cleaned = analyzerRaw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
          dna = JSON.parse(cleaned);
        } catch {
          send({ type: 'error', message: 'Failed to parse project analysis. Please try again.' });
          controller.close();
          return;
        }

        // ── STAGE 2: SECTION GENERATORS (параллельно) ──────────────────
        const dnaMessage = buildSectionMessage(dna);
        const isOrchestrated = mode === 'orchestrated';

        // Прогресс-сообщения при старте параллельных задач
        send({ type: 'progress', stage: 'identity',  label: 'Writing Agent Identity...' });
        send({ type: 'progress', stage: 'rules',     label: 'Writing Code Rules...' });
        send({ type: 'progress', stage: 'workflow',  label: 'Writing Workflow...' });
        send({ type: 'progress', stage: 'git',       label: 'Writing Git Protocol...' });
        send({ type: 'progress', stage: 'security',  label: 'Writing Security Rules...' });
        send({ type: 'progress', stage: 'checklist', label: 'Writing Checklist...' });

        // Запускаем все секции параллельно
        const simpleSectionPromises = [
          callAI(IDENTITY_PROMPT,  dnaMessage, SECTION_TOKENS),
          callAI(RULES_PROMPT,     dnaMessage, SECTION_TOKENS),
          callAI(WORKFLOW_PROMPT,  dnaMessage, SECTION_TOKENS),
          callAI(GIT_PROMPT,       dnaMessage, SECTION_TOKENS),
          callAI(SECURITY_PROMPT,  dnaMessage, SECTION_TOKENS),
          callAI(CHECKLIST_PROMPT, dnaMessage, SECTION_TOKENS),
        ];

        // Для orchestrated — добавляем агентов параллельно
        const orchestratedPromises = isOrchestrated ? [
          callAI(ORCHESTRATOR_PROMPT,   dnaMessage, AGENT_FILE_TOKENS),
          callAI(PLANNER_AGENT_PROMPT,  dnaMessage, AGENT_FILE_TOKENS),
          callAI(CODER_AGENT_PROMPT,    dnaMessage, AGENT_FILE_TOKENS),
          callAI(REVIEWER_AGENT_PROMPT, dnaMessage, AGENT_FILE_TOKENS),
          dna.workflow?.has_tests
            ? callAI(TESTER_AGENT_PROMPT,  dnaMessage, AGENT_FILE_TOKENS)
            : Promise.resolve(''),
          callAI(MEMORY_TEMPLATES_PROMPT, dnaMessage, AGENT_FILE_TOKENS),
        ] : [];

        if (isOrchestrated) {
          send({ type: 'progress', stage: 'agents', label: 'Building agent system...' });
        }

        // Ждём все параллельные вызовы
        const allResults = await Promise.all([
          ...simpleSectionPromises,
          ...orchestratedPromises,
        ]);

        const [identity, rules, workflow, git, security, checklist] = allResults;
        const sections = { identity, rules, workflow, git, security, checklist };

        // ── STAGE 3: ASSEMBLE ──────────────────────────────────────────
        send({ type: 'progress', stage: 'assembling', label: 'Assembling final file...' });

        let result;
        if (!isOrchestrated) {
          // Simple mode — один AGENTS.md
          result = {
            mode: 'simple',
            content: assembleSimple(dna, sections),
            tokens_used: estimateTokens(allResults),
            generation_id: crypto.randomUUID(),
          };
        } else {
          // Orchestrated mode — массив файлов
          const [orchestrator, planner, coder, reviewer, tester, memoryContent] = allResults.slice(6);
          const agentFiles = { orchestrator, planner, coder, reviewer, tester };
          sections.orchestrator = orchestrator;

          result = {
            mode: 'orchestrated',
            files: assembleOrchestrated(dna, sections, agentFiles, memoryContent),
            tokens_used: estimateTokens(allResults),
            generation_id: crypto.randomUUID(),
          };
        }

        send({ type: 'done', ...result });
        controller.close();

      } catch (err) {
        send({ type: 'error', message: err.message || 'Generation failed. Please try again.' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...CORS,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}

// ── Claude API call ─────────────────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage, apiKey, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Claude API ${res.status}: ${err.error?.message || 'Unknown error'}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

// ── OpenAI API call ─────────────────────────────────────────────────────────
async function callOpenAI(systemPrompt, userMessage, apiKey, maxTokens) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_completion_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI API ${res.status}: ${err.error?.message || 'Unknown error'}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ── Простая оценка токенов по длине текста ─────────────────────────────────
function estimateTokens(texts) {
  const totalChars = texts.reduce((sum, t) => sum + (t?.length || 0), 0);
  return Math.round(totalChars / 4);
}
