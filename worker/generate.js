// worker/generate.js — AgentsMD.pro
// POST /generate — принимает описание проекта, возвращает AGENTS.md

import { SYSTEM_PROMPT, buildUserMessage } from './prompts.js';
import { withRetry, handleClaudeError } from './errors.js';
import { callOpenAI } from './openai.js';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const CLAUDE_MAX_TOKENS = 4000;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function handleGenerate(request, env) {
  // 1. Распарсить тело запроса
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_json', message: 'Request body must be valid JSON' }, 400);
  }

  const { description, type, technologies, team_size, language, provider, user_api_key } = body;

  // 2. Валидация
  if (!description || typeof description !== 'string' || description.trim().length < 20) {
    return jsonResponse({ error: 'validation_error', message: 'description must be at least 20 characters' }, 400);
  }

  if (!user_api_key?.trim()) {
    return jsonResponse({ error: 'api_key_required', message: 'Введите ваш API ключ в настройках выше' }, 400);
  }

  const selectedProvider = provider === 'openai' ? 'openai' : 'claude';
  const userMessage = buildUserMessage({ description, type, technologies, team_size, language });

  // 3. Вызвать API провайдера с ключом пользователя
  let generatedContent, tokensUsed;
  try {
    if (selectedProvider === 'openai') {
      console.log('[AgentsMD] Using OpenAI gpt-5.4-mini');
      const result = await withRetry(() => callOpenAI(SYSTEM_PROMPT, userMessage, user_api_key.trim()), 1);
      generatedContent = result.content;
      tokensUsed = result.tokens_used;
    } else {
      console.log(`[AgentsMD] Using Claude ${CLAUDE_MODEL}`);
      const res = await withRetry(() => callClaudeAPI(userMessage, user_api_key.trim()), 1);
      generatedContent = res.content[0]?.text || '';
      tokensUsed = res.usage?.output_tokens || 0;
    }
  } catch (err) {
    console.error(`[AgentsMD] ${selectedProvider} API error:`, err.message);
    return handleClaudeError(err);
  }

  console.log(`[AgentsMD] Generated OK, tokens: ${tokensUsed}`);

  return jsonResponse({
    content: generatedContent,
    tokens_used: tokensUsed,
    generation_id: crypto.randomUUID(),
  });
}

// Вызов Claude API с ключом пользователя
async function callClaudeAPI(userMessage, apiKey) {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Claude API ${response.status}: ${error.error?.message || 'Unknown error'}`);
  }

  return response.json();
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
