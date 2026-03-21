// frontend/js/paywall.js — AgentsMD.pro
// Donate modal: shown every 3 generations, random message from i18n

// Increment generation counter and show donate modal if needed
function trackGenerationAndMaybeShowDonate() {
  const count = parseInt(localStorage.getItem('agentsmd_gen_count') || '0') + 1;
  localStorage.setItem('agentsmd_gen_count', String(count));

  if (count % 3 === 0) {
    showDonateModal();
  }
}

function showDonateModal() {
  // Use i18n messages if available, otherwise fall back to hardcoded EN
  const messages = (typeof getDonateMessages === 'function')
    ? getDonateMessages()
    : [{ title: 'Support the project ☕', sub: 'Every few generations we humbly ask for support.', btn: 'Donate' }];

  const msg = messages[Math.floor(Math.random() * messages.length)];
  const checkoutUrl = window._config?.LS_CHECKOUT_URL || '#';

  const overlay = document.getElementById('upgrade-overlay');
  if (!overlay) return;

  // Extract emoji from title
  const emojiMatch = msg.title.match(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{26FF}]/u);
  const emoji = emojiMatch ? emojiMatch[0] : '💛';
  const titleText = msg.title.replace(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{26FF}]/gu, '').trim();

  const continueText = (typeof t === 'function') ? t('modal.continue') : 'No thanks, continue for free';

  // Overwrite modal content
  overlay.querySelector('.modal').innerHTML = `
    <div class="modal-icon">${emoji}</div>
    <h2 class="modal-title">${titleText}</h2>
    <p class="modal-sub">${msg.sub}</p>
    <a href="${checkoutUrl}" target="_blank" class="btn-primary modal-cta" style="display:block;margin-bottom:0.75rem;text-decoration:none;text-align:center;">${msg.btn} →</a>
    <button onclick="document.getElementById('upgrade-overlay').style.display='none'" class="btn-link">${continueText}</button>
  `;

  overlay.style.display = 'flex';

  // Close on background click
  overlay.onclick = (e) => { if (e.target === overlay) overlay.style.display = 'none'; };
}

// Kept for backwards compatibility with app.js (402 no longer comes, but just in case)
function showUpgradeModal(checkoutUrl) {
  showDonateModal();
}
