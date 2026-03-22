// worker/index.js — AgentsMD.pro
// Главный роутер CF Worker

import { handleGenerate } from './generate.js';

// CORS — разрешить localhost и продовый домен
function getCorsHeaders(request) {
  const origin = request?.headers?.get('Origin') || '';
  const allowed = origin === 'https://agentsmd.pro' || origin.startsWith('http://localhost');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://agentsmd.pro',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function withCors(response, request) {
  const headers = new Headers(response.headers);
  Object.entries(getCorsHeaders(request)).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    console.log(`[AgentsMD] ${request.method} ${path}`);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: getCorsHeaders(request) });
    }

    try {
      if (path === '/health' && request.method === 'GET') {
        return withCors(new Response(
          JSON.stringify({ status: 'ok', version: env.APP_VERSION || '1.0.0' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ), request);
      }

      if (path === '/generate' && request.method === 'POST') {
        return withCors(await handleGenerate(request, env), request);
      }

      return withCors(new Response(
        JSON.stringify({ error: 'not_found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      ), request);

    } catch (err) {
      console.error('[AgentsMD] Unhandled error:', err.message);
      return withCors(new Response(
        JSON.stringify({ error: 'internal_error', message: 'Something went wrong' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      ), request);
    }
  }
};
