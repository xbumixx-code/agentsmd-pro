// AgentsMD counter worker — reads/increments generation count in KV
// GET  / → { count: N }
// POST /increment → { count: N+1 }  (requires X-Secret header)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Secret',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    // GET / — return current count (public)
    if (request.method === 'GET' && url.pathname === '/') {
      const val = await env.COUNTER_KV.get('count');
      const count = parseInt(val || '0');
      return Response.json({ count }, { headers: CORS });
    }

    // POST /increment — increment count (protected by secret)
    if (request.method === 'POST' && url.pathname === '/increment') {
      const secret = request.headers.get('X-Secret');
      if (secret !== env.COUNTER_SECRET) {
        return Response.json({ error: 'unauthorized' }, { status: 401, headers: CORS });
      }
      const val = await env.COUNTER_KV.get('count');
      const newCount = parseInt(val || '0') + 1;
      await env.COUNTER_KV.put('count', String(newCount));
      return Response.json({ count: newCount }, { headers: CORS });
    }

    return Response.json({ error: 'not found' }, { status: 404, headers: CORS });
  }
};
