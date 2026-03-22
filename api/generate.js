export const config = { runtime: 'edge' };

import { SYSTEM_PROMPT, buildUserMessage } from '../lib/prompts.js';
import { withRetry, handleClaudeError } from '../lib/errors.js';
import { callOpenAI } from '../lib/openai.js';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const CLAUDE_MAX_TOKENS = 4000;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

  const { description, type, technologies, team_size, language, provider, user_api_key } = body;

  if (!description || description.trim().length < 20) {
    return Response.json({ error: 'validation_error', message: 'description must be at least 20 characters' }, { status: 400, headers: CORS });
  }

  if (!user_api_key?.trim()) {
    return Response.json({ error: 'api_key_required', message: 'Введите ваш API ключ в настройках выше' }, { status: 400, headers: CORS });
  }

  const selectedProvider = provider === 'openai' ? 'openai' : 'claude';
  const userMessage = buildUserMessage({ description, type, technologies, team_size, language });

  let generatedContent, tokensUsed;
  try {
    if (selectedProvider === 'openai') {
      const result = await withRetry(() => callOpenAI(SYSTEM_PROMPT, userMessage, user_api_key.trim()), 1);
      generatedContent = result.content;
      tokensUsed = result.tokens_used;
    } else {
      const res = await withRetry(() => callClaudeAPI(userMessage, user_api_key.trim()), 1);
      generatedContent = res.content[0]?.text || '';
      tokensUsed = res.usage?.output_tokens || 0;
    }
  } catch (err) {
    const errResponse = handleClaudeError(err);
    const errBody = await errResponse.json();
    return Response.json(errBody, { status: errResponse.status, headers: CORS });
  }

  // Increment public counter (fire-and-forget, never blocks the response)
  incrementCounter(process.env.COUNTER_SECRET).catch(() => {});

  return Response.json({
    content: generatedContent,
    tokens_used: tokensUsed,
    generation_id: crypto.randomUUID(),
  }, { headers: CORS });
}

// Increment the public generation counter in Cloudflare Worker
async function incrementCounter(secret) {
  const s = secret || (typeof COUNTER_SECRET !== 'undefined' ? COUNTER_SECRET : '');
  if (!s) return;
  await fetch('https://agentsmd-counter.threadshelper.workers.dev/increment', {
    method: 'POST',
    headers: { 'X-Secret': s },
  });
}

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
