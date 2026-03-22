// worker/db.js — AgentsMD.pro
// Все операции с Supabase через REST API (не SDK — Workers ограничены)

// Найти пользователя по email или создать нового
export async function getOrCreateUser(email, env) {
  const existing = await supabaseGet(`users?email=eq.${encodeURIComponent(email)}&limit=1`, env);
  if (existing?.length > 0) return existing[0];

  // Создать нового пользователя
  const created = await supabasePost('users', { email, plan: 'free', usage_count: 0 }, env);
  console.log(`[AgentsMD] Created new user: ${email}`);
  return created?.[0] || null;
}

// Обновить план пользователя после оплаты
export async function updateUserPlan(email, plan, lsOrderId, lsCustomerId, env) {
  return supabasePatch(
    `users?email=eq.${encodeURIComponent(email)}`,
    { plan, ls_order_id: lsOrderId, ls_customer_id: lsCustomerId },
    env
  );
}

// Инкрементировать счётчик использования
export async function incrementUsage(userId, env) {
  return supabaseRPC('increment_usage', { user_id: userId }, env);
}

// Сохранить генерацию в историю
export async function saveGeneration({ userId, inputDescription, inputType, inputTechnologies, inputTeamSize, outputContent, tokensUsed }, env) {
  return supabasePost('generations', {
    user_id: userId,
    input_description: inputDescription,
    input_type: inputType,
    input_technologies: inputTechnologies,
    input_team_size: inputTeamSize,
    output_content: outputContent,
    tokens_used: tokensUsed,
  }, env);
}

// ---- Supabase REST helpers ----

async function supabaseGet(path, env) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: supabaseHeaders(env)
  });
  if (!res.ok) {
    console.error(`[AgentsMD] Supabase GET error: ${res.status} ${path}`);
    return null;
  }
  return res.json();
}

async function supabasePost(table, data, env) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...supabaseHeaders(env), 'Prefer': 'return=representation' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    console.error(`[AgentsMD] Supabase POST error: ${res.status} ${table}`);
    return null;
  }
  return res.json();
}

async function supabasePatch(path, data, env) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: { ...supabaseHeaders(env), 'Prefer': 'return=representation' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    console.error(`[AgentsMD] Supabase PATCH error: ${res.status} ${path}`);
    return null;
  }
  return res.json();
}

async function supabaseRPC(fn, params, env) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    console.error(`[AgentsMD] Supabase RPC error: ${res.status} ${fn}`);
    return null;
  }
  return res.json();
}

function supabaseHeaders(env) {
  return {
    'Content-Type': 'application/json',
    'apikey': env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
  };
}
