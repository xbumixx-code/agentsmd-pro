// frontend/js/paywall.js — AgentsMD.pro
// Донат-модал: показывается каждые 3 генерации, текст случайный

const DONATE_MESSAGES = [
  {
    title: 'На кофе разработчику ☕',
    sub: 'Этот AGENTS.md сгенерировал живой человек... ну почти. Claude старался, сервер гудел. Поддержи рублём — или хотя бы добрым словом.',
    btn: 'Угостить кофе',
  },
  {
    title: 'На подписку Claude Code 🤖',
    sub: 'Ирония в том, что сервис для AI-агентов сделан с помощью AI-агента, за которого надо платить. Помоги замкнуть круг.',
    btn: 'Поддержать',
  },
  {
    title: 'На отпуск в тёплые страны 🌴',
    sub: 'Разработчик три недели не выходил из дома. Он заслуживает увидеть солнце. Помоги ему добраться до пляжа.',
    btn: 'Отправить в отпуск',
  },
  {
    title: 'На новую механическую клавиатуру ⌨️',
    sub: 'Хорошие AGENTS.md пишутся на хороших клавиатурах. Текущая трещит на букве "е". Помоги исправить это.',
    btn: 'Купить клавиатуру',
  },
  {
    title: 'Чтобы разработчик не пошёл в офис 🏠',
    sub: 'Если не поддержать проект — придётся идти работать на дядю. Сервис умрёт. AGENTS.md больше не будет. Ты же не хочешь этого?',
    btn: 'Спасти сервис',
  },
  {
    title: 'На энергетики для ночных фиксов 🔴',
    sub: 'Баги случаются в 2 ночи. Фиксы тоже. Без энергетиков это невозможно. Ты уже 3 раза сгенерировал — время делиться.',
    btn: 'Зарядить разработчика',
  },
  {
    title: 'Чтобы проверить конкурентов 👀',
    sub: 'Разработчик хочет купить ChatGPT Plus, GPT-4 и ещё пять подписок чтобы знать с кем конкурирует. Это дорого. Помоги.',
    btn: 'Поддержать разведку',
  },
  {
    title: 'На оплату серверов 💡',
    sub: 'Cloudflare бесплатный, Supabase почти бесплатный, а вот Claude API — нет. Каждый AGENTS.md стоит денег. Сделай вид что не знал.',
    btn: 'Заплатить за свет',
  },
  {
    title: 'Просто так, от души 🙏',
    sub: 'Без драмы. Ты пользуешься, тебе нравится — кинь сколько не жалко. Разработчик будет рад любой сумме, честно.',
    btn: 'Кинуть монетку',
  },
  {
    title: 'На курс по маркетингу 📈',
    sub: 'Продукт готов, осталось научиться его продавать. Курсы стоят денег. Помоги разработчику стать немного менее интровертом.',
    btn: 'Инвестировать в рост',
  },
];

// Увеличить счётчик генераций и показать модал если нужно
function trackGenerationAndMaybeShowDonate() {
  const count = parseInt(localStorage.getItem('agentsmd_gen_count') || '0') + 1;
  localStorage.setItem('agentsmd_gen_count', String(count));

  if (count % 3 === 0) {
    showDonateModal();
  }
}

function showDonateModal() {
  const msg = DONATE_MESSAGES[Math.floor(Math.random() * DONATE_MESSAGES.length)];
  const checkoutUrl = window._config?.LS_CHECKOUT_URL || '#';

  const overlay = document.getElementById('upgrade-overlay');
  if (!overlay) return;

  // Перезаписать содержимое модала
  overlay.querySelector('.modal').innerHTML = `
    <div class="modal-icon">${msg.title.match(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{26FF}]/u)?.[0] || '💛'}</div>
    <h2 class="modal-title">${msg.title.replace(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{26FF}]/gu, '').trim()}</h2>
    <p class="modal-sub">${msg.sub}</p>
    <a href="${checkoutUrl}" target="_blank" class="btn-primary modal-cta" style="display:block;margin-bottom:0.75rem;text-decoration:none;text-align:center;">${msg.btn} →</a>
    <button onclick="document.getElementById('upgrade-overlay').style.display='none'" class="btn-link">Нет, продолжу бесплатно</button>
  `;

  overlay.style.display = 'flex';

  // Закрыть по клику на фон
  overlay.onclick = (e) => { if (e.target === overlay) overlay.style.display = 'none'; };
}

// Оставляем для обратной совместимости с app.js (402 больше не приходит, но пусть будет)
function showUpgradeModal(checkoutUrl) {
  showDonateModal();
}
