// worker/paywall.js — AgentsMD.pro
// Логика проверки доступа: free tier vs pro

export function checkAccess(user, env) {
  const FREE_LIMIT = parseInt(env.FREE_TIER_LIMIT || '3');

  // Pro пользователь — всегда пропускаем
  if (user.plan === 'pro') {
    return { allowed: true, plan: 'pro' };
  }

  // Free пользователь — проверяем счётчик
  if (user.usage_count >= FREE_LIMIT) {
    return {
      allowed: false,
      reason: 'limit_reached',
      used: user.usage_count,
      limit: FREE_LIMIT
    };
  }

  // Free пользователь в лимите
  return {
    allowed: true,
    plan: 'free',
    remaining: FREE_LIMIT - user.usage_count - 1
  };
}

export async function incrementUsage(userId, env) {
  // Используем атомарное обновление через RPC чтобы избежать race condition
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/increment_usage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ user_id: userId })
  });
  if (!res.ok) {
    console.error('[AgentsMD] Failed to increment usage for', userId);
  }
}
