// worker/errors.js — AgentsMD.pro
// Обработка ошибок Claude API: retry, rate limit, timeout

// Обёртка с ретраем (maxRetries раз с exponential backoff)
export async function withRetry(fn, maxRetries = 1) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Не ретраить при валидационных ошибках (4xx кроме 429)
      if (err.message.includes('400') || err.message.includes('401') || err.message.includes('403')) {
        throw err;
      }
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s...
        console.log(`[AgentsMD] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// Преобразовать ошибку Claude API в HTTP ответ для клиента
export function handleClaudeError(err) {
  const message = err.message || '';

  if (message.includes('429')) {
    return new Response(JSON.stringify({
      error: 'rate_limited',
      message: 'AI service is busy, please try again in a minute',
      retry_after: 60
    }), { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } });
  }

  if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
    return new Response(JSON.stringify({
      error: 'timeout',
      message: 'Generation took too long, please try again'
    }), { status: 504, headers: { 'Content-Type': 'application/json' } });
  }

  if (message.includes('401')) {
    console.error('[AgentsMD] Invalid Claude API key!');
    return new Response(JSON.stringify({
      error: 'service_error',
      message: 'Service configuration error'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // Общая ошибка
  return new Response(JSON.stringify({
    error: 'generation_failed',
    message: 'Failed to generate AGENTS.md, please try again'
  }), { status: 500, headers: { 'Content-Type': 'application/json' } });
}
