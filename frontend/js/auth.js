// frontend/js/auth.js — AgentsMD.pro
// Supabase magic link авторизация через REST API (без SDK)

const SUPABASE_AUTH_URL = () => `${window._config.SUPABASE_URL}/auth/v1`;

// Отправить magic link на email
async function signIn(email) {
  const res = await fetch(`${SUPABASE_AUTH_URL()}/otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': window._config.SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, create_user: true }),
  });
  return res.ok;
}

// Получить текущую сессию из localStorage
function getSession() {
  try {
    return JSON.parse(localStorage.getItem('agentsmd_session') || 'null');
  } catch {
    return null;
  }
}

// Получить email текущего пользователя
function getCurrentEmail() {
  const session = getSession();
  if (!session) return null;
  try {
    const payload = JSON.parse(atob(session.access_token.split('.')[1]));
    return payload.email || null;
  } catch {
    return null;
  }
}

// Выйти из аккаунта
function signOut() {
  localStorage.removeItem('agentsmd_session');
  location.reload();
}

// Инициализация: проверить URL на наличие токена (после клика по magic link)
document.addEventListener('DOMContentLoaded', async () => {
  // Supabase возвращает токен в URL hash после клика по magic link
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');

  if (accessToken) {
    // Сохранить сессию и убрать хеш из URL
    localStorage.setItem('agentsmd_session', JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }));
    window.history.replaceState({}, '', window.location.pathname);
  }

  // Обновить UI
  updateAuthUI();

  // Привязать кнопку входа
  const authBtn = document.getElementById('auth-btn');
  const authEmail = document.getElementById('auth-email');
  const authMessage = document.getElementById('auth-message');

  if (authBtn) {
    authBtn.addEventListener('click', async () => {
      const email = authEmail.value.trim();
      if (!email) return;
      authBtn.disabled = true;
      authBtn.textContent = 'Отправляю...';
      const ok = await signIn(email);
      authMessage.textContent = ok
        ? '✓ Ссылка отправлена, проверьте почту'
        : '✗ Ошибка, попробуйте ещё раз';
      authBtn.disabled = false;
      authBtn.textContent = 'Войти';
    });
  }
});

function updateAuthUI() {
  const session = getSession();
  const email = getCurrentEmail();
  const authBlock = document.getElementById('auth-block');
  const authStatus = document.getElementById('auth-status');

  if (session && email) {
    // Авторизован
    if (authBlock) authBlock.style.display = 'none';
    if (authStatus) authStatus.innerHTML = `
      <span class="auth-email">${email}</span>
      <button onclick="signOut()" class="btn-link">Выйти</button>
    `;
  } else {
    // Не авторизован
    if (authBlock) authBlock.style.display = 'block';
    if (authStatus) authStatus.innerHTML = '';
  }
}
