// frontend/js/crypto.js — AgentsMD.pro
// AES-GCM шифрование API ключей через Web Crypto API (нативный браузер, без зависимостей)
// Ключ шифрования живёт только в sessionStorage — не переживает закрытие вкладки

const PBKDF2_SALT = 'agentsmd-pro-2026';
const PBKDF2_ITERATIONS = 120000;

// Получить или создать мастер-ключ сессии (AES-GCM 256 бит)
async function getSessionKey() {
  let seed = sessionStorage.getItem('_sk');
  if (!seed) {
    // Генерируем случайный seed при первом визите на вкладку
    const rand = crypto.getRandomValues(new Uint8Array(32));
    seed = Array.from(rand).map(b => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('_sk', seed);
  }

  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw', enc.encode(seed), 'PBKDF2', false, ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(PBKDF2_SALT), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Зашифровать строку → base64
async function encrypt(plaintext) {
  const key = await getSessionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
  const combined = new Uint8Array(12 + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), 12);
  return btoa(String.fromCharCode(...combined));
}

// Расшифровать base64 → строку (null если не получилось)
async function decrypt(ciphertext) {
  try {
    const key = await getSessionKey();
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return new TextDecoder().decode(plainBuf);
  } catch {
    return null; // Сессия истекла или данные повреждены
  }
}

// Сохранить API ключ зашифрованным
async function saveApiKeySecure(apiKey, provider) {
  const encryptedKey = await encrypt(apiKey);
  localStorage.setItem('agentsmd_apikey', JSON.stringify({ enc: encryptedKey, provider, v: 2 }));
}

// Загрузить и расшифровать API ключ
async function loadApiKeySecure() {
  try {
    const stored = JSON.parse(localStorage.getItem('agentsmd_apikey') || 'null');
    if (!stored) return null;

    // Поддержка старого формата (plaintext, v1 или без версии)
    if (stored.key && !stored.enc) {
      // Мигрируем: шифруем и пересохраняем
      await saveApiKeySecure(stored.key, stored.provider || 'claude');
      return { key: stored.key, provider: stored.provider || 'claude' };
    }

    if (!stored.enc) return null;
    const key = await decrypt(stored.enc);
    if (!key) return null; // Сессия истекла
    return { key, provider: stored.provider || 'claude' };
  } catch {
    return null;
  }
}

// Удалить сохранённый ключ
function clearApiKey() {
  localStorage.removeItem('agentsmd_apikey');
  sessionStorage.removeItem('_sk');
}
