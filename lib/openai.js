// worker/openai.js — AgentsMD.pro
// Вызов OpenAI API (gpt-5.4-mini) для генерации AGENTS.md

const OPENAI_MODEL = 'gpt-5.4-mini';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MAX_TOKENS = 4000;

// Вызвать OpenAI chat completions API с ключом пользователя
export async function callOpenAI(systemPrompt, userMessage, apiKey) {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_completion_tokens: OPENAI_MAX_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg = error.error?.message || 'Unknown error';
    throw new Error(`OpenAI API ${response.status}: ${msg}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    tokens_used: data.usage?.total_tokens || 0,
  };
}
