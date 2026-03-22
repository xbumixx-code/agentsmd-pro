// worker/webhook.js — AgentsMD.pro
// POST /webhook/ls — обработка вебхуков от Lemon Squeezy

import { updateUserPlan } from './db.js';

export async function handleWebhook(request, env) {
  // 1. Верифицировать подпись HMAC-SHA256
  const signature = request.headers.get('X-Signature');
  const rawBody = await request.text();

  if (!await verifySignature(rawBody, signature, env.LS_WEBHOOK_SECRET)) {
    console.error('[AgentsMD] Webhook signature verification failed');
    // Возвращаем 200 чтобы LS не ретраил — но ничего не делаем
    return new Response('ok', { status: 200 });
  }

  // 2. Распарсить payload
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error('[AgentsMD] Webhook: invalid JSON body');
    return new Response('ok', { status: 200 });
  }

  const eventName = payload.meta?.event_name;
  console.log(`[AgentsMD] Webhook received: ${eventName}`);

  // 3. Обработать нужные события
  if (eventName === 'order_created') {
    await handleOrderCreated(payload, env);
  }
  // Другие события игнорируем (subscription_cancelled и т.д. — не нужны для one-time)

  // 4. Всегда возвращаем 200 — LS не должен ретраить
  return new Response('ok', { status: 200 });
}

// Обработать создание заказа → обновить план пользователя
async function handleOrderCreated(payload, env) {
  const attrs = payload.data?.attributes;
  if (!attrs) {
    console.error('[AgentsMD] order_created: missing data.attributes');
    return;
  }

  const email = attrs.user_email;
  const orderId = String(payload.data?.id || '');
  const customerId = String(attrs.customer_id || '');

  if (!email) {
    console.error('[AgentsMD] order_created: missing user_email');
    return;
  }

  console.log(`[AgentsMD] Upgrading to pro: ${email}, order: ${orderId}`);

  await updateUserPlan(email, 'pro', orderId, customerId, env);

  console.log(`[AgentsMD] Successfully upgraded: ${email}`);
}

// Верификация HMAC-SHA256 подписи Lemon Squeezy
async function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;

  try {
    // Убрать префикс "sha256=" если есть
    const sigHex = signature.startsWith('sha256=') ? signature.slice(7) : signature;

    // Импортировать ключ
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Конвертировать hex подпись в Uint8Array
    const sigBytes = hexToBytes(sigHex);

    // Верифицировать
    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(rawBody));
  } catch (err) {
    console.error('[AgentsMD] Signature verification error:', err.message);
    return false;
  }
}

// Конвертировать hex строку в Uint8Array
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}
