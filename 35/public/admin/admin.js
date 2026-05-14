const root = document.getElementById('adminApp');

const state = {
  admin: null,
  stats: null,
  users: [],
  requests: [],
  actions: [],
  selectedUser: null,
  tab: 'users',
  query: '',
  plan: 'all',
  status: 'all',
  message: '',
  error: '',
  exportText: ''
};

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const formatDate = (value) => {
  if (!value) return '—';
  try { return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
  catch { return value; }
};

const planLabel = (plan) => ({ free: 'Free', pro: 'Pro', max: 'Max' }[plan] || 'Free');
const statusLabel = (isActive) => isActive ? 'Активен' : 'Деактивирован';

async function api(url, options = {}) {
  const opts = {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  };
  if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  const response = await fetch(url, opts);
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

function setMessage(message = '', error = '') {
  state.message = message;
  state.error = error;
}

async function init() {
  try {
    const data = await api('/api/admin/me');
    state.admin = data.admin || null;
    state.stats = data.stats || null;
    if (state.admin) await refreshAll();
  } catch {
    state.admin = null;
  }
  render();
}

async function refreshStats() {
  const data = await api('/api/admin/stats');
  state.stats = data.stats;
  state.actions = data.logs || [];
}

async function refreshUsers() {
  const params = new URLSearchParams({ query: state.query, plan: state.plan, status: state.status });
  const data = await api(`/api/admin/users?${params.toString()}`);
  state.users = data.users || [];
  if (data.stats) state.stats = data.stats;
}

async function refreshRequests() {
  const data = await api('/api/admin/contacts');
  state.requests = data.requests || [];
}

async function refreshAll() {
  await Promise.all([refreshStats(), refreshUsers(), refreshRequests()]);
}

function renderLogin() {
  root.innerHTML = `
    <section class="login-wrap">
      <form class="login-card" id="loginForm">
        <span class="eyebrow">Скрытый вход /admin/</span>
        <h1>DUT Admin</h1>
        <p class="muted">Админка не отображается в меню сайта. Попасть сюда можно только вручную через адрес <b>/admin/</b>.</p>
        ${state.error ? `<div class="alert error">${escapeHtml(state.error)}</div>` : ''}
        ${state.message ? `<div class="alert ok">${escapeHtml(state.message)}</div>` : ''}
        <div class="form-grid">
          <label class="field"><span>Админ email</span><input class="input" name="email" type="email" autocomplete="username" value="yurapon11972020@gmail.com" required></label>
          <label class="field"><span>Пароль</span><input class="input" name="password" type="password" autocomplete="current-password" placeholder="Введите пароль администратора" required></label>
          <button class="btn" type="submit">Войти в админку</button>
        </div>
      </form>
    </section>`;

  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await api('/api/admin/login', { method: 'POST', body: { email: form.get('email'), password: form.get('password') } });
      state.admin = data.admin;
      state.stats = data.stats;
      setMessage('Вход выполнен.');
      await refreshAll();
      render();
    } catch (error) {
      setMessage('', error.message);
      renderLogin();
    }
  });
}

function renderShell(content) {
  root.innerHTML = `
    <header class="topbar liquid-panel">
      <div class="brand">
        <div class="logo-box"><img src="/dut-logo.svg" alt="DUT"></div>
        <div class="brand-title"><strong>DUT Admin</strong><span>Управление пользователями и тарифами</span></div>
      </div>
      <div class="header-actions">
        <a class="btn secondary" href="/" target="_blank" rel="noopener">Открыть сайт</a>
        <button class="btn ghost" id="refreshBtn">Обновить</button>
        <button class="btn secondary" id="logoutBtn">Выйти</button>
      </div>
    </header>
    <section>
      <span class="eyebrow">Admin control panel</span>
      <h1>Панель управления</h1>
      <p class="muted">Поиск пользователей, выдача тарифов, деактивация, удаление, обращения, экспорт и журнал действий.</p>
    </section>
    ${state.error ? `<div class="alert error">${escapeHtml(state.error)}</div>` : ''}
    ${state.message ? `<div class="alert ok">${escapeHtml(state.message)}</div>` : ''}
    ${renderStats()}
    <nav class="tabs" aria-label="Разделы админки">
      ${tabButton('users', 'Пользователи')}
      ${tabButton('requests', 'Обращения')}
      ${tabButton('audit', 'Журнал')}
      ${tabButton('export', 'Экспорт')}
    </nav>
    ${content}
    ${state.selectedUser ? renderUserModal(state.selectedUser) : ''}`;

  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', async () => {
    state.tab = button.dataset.tab;
    setMessage();
    if (state.tab === 'requests') await refreshRequests();
    if (state.tab === 'audit') await refreshStats();
    render();
  }));
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('refreshBtn').addEventListener('click', async () => { await refreshAll(); setMessage('Данные обновлены.'); render(); });
  attachCommonHandlers();
}

function tabButton(id, label) {
  return `<button class="tab ${state.tab === id ? 'active' : ''}" data-tab="${id}" type="button">${label}</button>`;
}

function renderStats() {
  const s = state.stats || {};
  const monthlyRevenue = (s.proUsers || 0) * 129 + (s.maxUsers || 0) * 219;
  const cards = [
    ['Пользователей', s.users ?? 0, `Активных: ${s.activeUsers ?? 0}`],
    ['Деактивированы', s.inactiveUsers ?? 0, 'Доступ заблокирован'],
    ['Free / Pro / Max', `${s.freeUsers ?? 0} / ${s.proUsers ?? 0} / ${s.maxUsers ?? 0}`, 'Распределение тарифов'],
    ['Задач', s.tasks ?? 0, `Досок: ${s.boards ?? 0}`],
    ['Обращения', s.openContactRequests ?? 0, `Всего: ${s.contactRequests ?? 0}`],
    ['Выручка / мес', `${monthlyRevenue} ₽`, '129 ₽ и 219 ₽']
  ];
  return `<section class="stats-grid">${cards.map(([label, value, hint]) => `<article class="stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(hint)}</small></article>`).join('')}</section>`;
}

function renderUsers() {
  return `
    <section class="data-panel">
      <h2>Контроль пользователей</h2>
      <p class="muted">Найди пользователя, выдай тариф, заблокируй доступ или полностью удали аккаунт с его доской.</p>
      <div class="toolbar">
        <label class="field"><span>Поиск по имени или email</span><input class="input" id="userSearch" value="${escapeHtml(state.query)}" placeholder="Например: test@mail.com"></label>
        <label class="field"><span>Тариф</span><select id="planFilter"><option value="all">Все</option>${option('free','Free',state.plan)}${option('pro','Pro',state.plan)}${option('max','Max',state.plan)}</select></label>
        <label class="field"><span>Статус</span><select id="statusFilter"><option value="all">Все</option>${option('active','Активные',state.status)}${option('inactive','Деактивированные',state.status)}</select></label>
        <div class="field"><span>Быстро</span><button class="btn secondary" id="clearFilters">Сбросить фильтры</button></div>
      </div>
      ${state.users.length ? `<div class="users-grid">${state.users.map(renderUserCard).join('')}</div>` : '<div class="empty">Пользователи не найдены.</div>'}
    </section>`;
}

function option(value, label, selected) {
  return `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(label)}</option>`;
}

function renderUserCard(user) {
  const active = user.isActive !== false;
  return `
    <article class="user-card" data-user-id="${escapeHtml(user.id)}">
      <div class="user-head">
        <div class="user-name"><strong>${escapeHtml(user.name || 'Без имени')}</strong><span>${escapeHtml(user.email)}</span></div>
        <div class="badges"><span class="badge ${user.plan === 'max' ? 'orange' : user.plan === 'pro' ? '' : 'green'}">${planLabel(user.plan)}</span><span class="badge ${active ? 'green' : 'red'}">${statusLabel(active)}</span></div>
      </div>
      <div class="user-metrics"><div><strong>${user.boards}</strong><span>досок</span></div><div><strong>${user.columns}</strong><span>колонок</span></div><div><strong>${user.tasks}</strong><span>задач</span></div></div>
      <div class="badges"><span class="badge">Создан: ${formatDate(user.createdAt)}</span>${user.lastLoginAt ? `<span class="badge">Вход: ${formatDate(user.lastLoginAt)}</span>` : ''}</div>
      <div class="action-row">
        <button class="btn small ghost" data-action="plan" data-plan="free">Free</button>
        <button class="btn small ghost" data-action="plan" data-plan="pro">Pro</button>
        <button class="btn small ghost" data-action="plan" data-plan="max">Max</button>
        <button class="btn small ${active ? 'danger' : 'ok'}" data-action="active" data-active="${active ? 'false' : 'true'}">${active ? 'Деактивировать' : 'Активировать'}</button>
        <button class="btn small secondary" data-action="details">Детали</button>
        <button class="btn small secondary" data-action="reset">Сбросить доску</button>
        <button class="btn small danger" data-action="delete">Удалить</button>
      </div>
    </article>`;
}

function renderRequests() {
  return `
    <section class="data-panel">
      <h2>Обращения с сайта</h2>
      <p class="muted">Здесь собираются заявки из формы контактов. Их можно закрывать после обработки.</p>
      <div class="list">${state.requests.length ? state.requests.map(renderRequest).join('') : '<div class="empty">Пока обращений нет.</div>'}</div>
    </section>`;
}

function renderRequest(item) {
  const closed = item.status === 'closed';
  const answered = item.status === 'answered';
  const statusLabel = closed ? 'Закрыто' : answered ? 'Есть ответ' : 'Новое';
  const statusClass = closed ? 'green' : answered ? '' : 'orange';
  const messages = Array.isArray(item.messages) ? item.messages : [];
  return `<article class="list-item request-card" data-request-id="${escapeHtml(item.id)}">
    <div class="list-item-head"><div><strong>${escapeHtml(item.topic || 'Без темы')}</strong><div class="muted">От: ${escapeHtml(item.userName || item.name || 'Пользователь')} · ${escapeHtml(item.userEmail || item.email || '')} · ${formatDate(item.createdAt)}</div></div><span class="badge ${statusClass}">${statusLabel}</span></div>
    <div class="request-thread">
      ${messages.length ? messages.map((message) => `<div class="thread-message ${message.from === 'admin' ? 'admin' : 'user'}"><b>${escapeHtml(message.from === 'admin' ? 'Администратор' : (item.userName || item.name || 'Пользователь'))}</b><p>${escapeHtml(message.text || '')}</p><small>${formatDate(message.createdAt)}</small></div>`).join('') : `<p>${escapeHtml(item.message || '')}</p>`}
    </div>
    <label class="field admin-reply"><span>Ответ пользователю</span><textarea class="input" rows="3" placeholder="Напишите ответ — пользователь увидит его в мини-чате"></textarea></label>
    <div class="action-row"><button class="btn small" data-action="request-reply">Отправить ответ</button><button class="btn small ${closed ? 'ghost' : 'ok'}" data-action="request-status" data-status="${closed ? 'open' : 'closed'}">${closed ? 'Вернуть в новые' : 'Закрыть'}</button><button class="btn small danger" data-action="request-delete">Удалить</button></div>
  </article>`;
}

function renderAudit() {
  return `
    <section class="data-panel">
      <h2>Журнал действий</h2>
      <p class="muted">Админка фиксирует входы, изменение тарифов, деактивации, удаления, сброс доски, экспорт и обработку обращений.</p>
      <div class="list">${state.actions.length ? state.actions.map((item) => `<article class="list-item"><div class="list-item-head"><strong>${escapeHtml(item.action)}</strong><span class="badge">${formatDate(item.createdAt)}</span></div><pre>${escapeHtml(JSON.stringify(item.details || {}, null, 2))}</pre></article>`).join('') : '<div class="empty">Действий пока нет.</div>'}</div>
    </section>`;
}

function renderExport() {
  return `
    <section class="data-panel">
      <h2>Экспорт базы</h2>
      <p class="muted">Выгрузка без passwordHash. Удобно для проверки, бэкапа и демонстрации backend-логики.</p>
      <div class="action-row"><button class="btn" id="exportBtn">Скачать JSON</button><button class="btn secondary" id="copyReportBtn">Скопировать короткий отчёт</button></div>
      ${state.exportText ? `<textarea class="input codebox" readonly>${escapeHtml(state.exportText)}</textarea>` : ''}
    </section>`;
}

function renderUserModal(data) {
  const user = data.user;
  return `<div class="modal-backdrop" id="modalBackdrop"><article class="modal-card">
    <div class="list-item-head"><div><span class="eyebrow">Пользователь</span><h2>${escapeHtml(user.name)}</h2><p class="muted">${escapeHtml(user.email)}</p></div><button class="btn secondary" id="closeModal">Закрыть</button></div>
    <div class="detail-grid"><div><strong>${planLabel(user.plan)}</strong><span class="muted">тариф</span></div><div><strong>${statusLabel(user.isActive)}</strong><span class="muted">статус</span></div><div><strong>${user.tasks}</strong><span class="muted">задач</span></div><div><strong>${user.columns}</strong><span class="muted">колонок</span></div></div>
    <h3>Последние задачи</h3>
    <div class="list">${data.tasks?.length ? data.tasks.map((task) => `<div class="list-item"><strong>${escapeHtml(task.title)}</strong><span class="muted">${escapeHtml(task.description || 'Без описания')} · ${formatDate(task.updatedAt || task.createdAt)}</span></div>`).join('') : '<div class="empty">Задач нет.</div>'}</div>
  </article></div>`;
}

function render() {
  if (!state.admin) return renderLogin();
  const content = state.tab === 'requests' ? renderRequests() : state.tab === 'audit' ? renderAudit() : state.tab === 'export' ? renderExport() : renderUsers();
  renderShell(content);
}

function attachCommonHandlers() {
  const search = document.getElementById('userSearch');
  if (search) {
    let timer = null;
    search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => { state.query = search.value; await refreshUsers(); render(); }, 260);
    });
  }
  const planFilter = document.getElementById('planFilter');
  if (planFilter) planFilter.addEventListener('change', async () => { state.plan = planFilter.value; await refreshUsers(); render(); });
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) statusFilter.addEventListener('change', async () => { state.status = statusFilter.value; await refreshUsers(); render(); });
  const clearFilters = document.getElementById('clearFilters');
  if (clearFilters) clearFilters.addEventListener('click', async () => { state.query = ''; state.plan = 'all'; state.status = 'all'; await refreshUsers(); render(); });

  document.querySelectorAll('[data-user-id] [data-action]').forEach((button) => button.addEventListener('click', () => handleUserAction(button.closest('[data-user-id]').dataset.userId, button)));
  document.querySelectorAll('[data-request-id] [data-action]').forEach((button) => button.addEventListener('click', () => handleRequestAction(button.closest('[data-request-id]').dataset.requestId, button)));
  const closeModal = document.getElementById('closeModal');
  if (closeModal) closeModal.addEventListener('click', () => { state.selectedUser = null; render(); });
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.addEventListener('click', (event) => { if (event.target === backdrop) { state.selectedUser = null; render(); } });
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) exportBtn.addEventListener('click', exportDb);
  const copyReportBtn = document.getElementById('copyReportBtn');
  if (copyReportBtn) copyReportBtn.addEventListener('click', copyReport);
}

async function handleUserAction(userId, button) {
  const action = button.dataset.action;
  try {
    if (action === 'plan') {
      await api(`/api/admin/users/${encodeURIComponent(userId)}`, { method: 'PATCH', body: { plan: button.dataset.plan } });
      setMessage(`Тариф изменён на ${planLabel(button.dataset.plan)}.`);
    }
    if (action === 'active') {
      const isActive = button.dataset.active === 'true';
      await api(`/api/admin/users/${encodeURIComponent(userId)}`, { method: 'PATCH', body: { isActive } });
      setMessage(isActive ? 'Аккаунт активирован.' : 'Аккаунт деактивирован.');
    }
    if (action === 'delete') {
      if (!confirm('Удалить пользователя вместе с досками, колонками и задачами?')) return;
      await api(`/api/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
      setMessage('Пользователь удалён.');
    }
    if (action === 'reset') {
      if (!confirm('Сбросить доску пользователя до трёх базовых колонок и удалить его задачи?')) return;
      await api(`/api/admin/users/${encodeURIComponent(userId)}/reset-board`, { method: 'POST' });
      setMessage('Доска пользователя сброшена.');
    }
    if (action === 'details') {
      const data = await api(`/api/admin/users/${encodeURIComponent(userId)}`);
      state.selectedUser = data;
      setMessage();
      render();
      return;
    }
    await refreshAll();
    render();
  } catch (error) {
    setMessage('', error.message);
    render();
  }
}

async function handleRequestAction(requestId, button) {
  try {
    if (button.dataset.action === 'request-reply') {
      const card = button.closest('[data-request-id]');
      const textarea = card?.querySelector('.admin-reply textarea');
      const reply = String(textarea?.value || '').trim();
      if (!reply) { setMessage('', 'Введите ответ пользователю.'); render(); return; }
      await api(`/api/admin/contacts/${encodeURIComponent(requestId)}`, { method: 'PATCH', body: { reply } });
      setMessage('Ответ отправлен пользователю в мини-чат.');
    }
    if (button.dataset.action === 'request-status') {
      await api(`/api/admin/contacts/${encodeURIComponent(requestId)}`, { method: 'PATCH', body: { status: button.dataset.status } });
      setMessage('Статус обращения обновлён.');
    }
    if (button.dataset.action === 'request-delete') {
      if (!confirm('Удалить обращение?')) return;
      await api(`/api/admin/contacts/${encodeURIComponent(requestId)}`, { method: 'DELETE' });
      setMessage('Обращение удалено.');
    }
    await refreshAll();
    render();
  } catch (error) {
    setMessage('', error.message);
    render();
  }
}

async function exportDb() {
  try {
    const data = await api('/api/admin/export');
    const text = JSON.stringify(data, null, 2);
    state.exportText = text;
    const blob = new Blob([text], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dut-admin-export-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    await refreshStats();
    setMessage('Экспорт подготовлен.');
    render();
  } catch (error) { setMessage('', error.message); render(); }
}

async function copyReport() {
  const s = state.stats || {};
  const report = `DUT Admin: пользователей ${s.users ?? 0}, активных ${s.activeUsers ?? 0}, деактивированных ${s.inactiveUsers ?? 0}, Free ${s.freeUsers ?? 0}, Pro ${s.proUsers ?? 0}, Max ${s.maxUsers ?? 0}, задач ${s.tasks ?? 0}.`;
  try { await navigator.clipboard.writeText(report); setMessage('Короткий отчёт скопирован.'); }
  catch { state.exportText = report; setMessage('Отчёт выведен в поле ниже.'); }
  render();
}

async function logout() {
  try { await api('/api/admin/logout', { method: 'POST' }); } catch {}
  state.admin = null;
  state.users = [];
  state.requests = [];
  state.actions = [];
  setMessage('Вы вышли из админки.');
  renderLogin();
}

init();
