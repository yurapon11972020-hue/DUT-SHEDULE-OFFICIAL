const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'local_dev_secret_change_me';
const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, 'data');
const DB_PATH = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(DATA_DIR, 'db.json');
const TOKEN_TTL = 1000 * 60 * 60 * 24 * 7;
const ADMIN_TOKEN_TTL = 1000 * 60 * 60 * 8;
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || 'yurapon11972020@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '1488675242');

const defaultDb = { users: [], boards: [], columns: [], tasks: [], contactRequests: [], adminLogs: [] };
const defaultDesignSettings = {
  theme: 'pastel',
  accent: '#2563eb',
  background: 'soft',
  font: 'system',
  textSize: 'normal',
  density: 'comfortable',
  radius: 'rounded',
  shadows: 'soft',
  surface: 'glass',
  borders: 'soft',
  buttonStyle: 'solid',
  inputStyle: 'default',
  taskStyle: 'clean',
  taskSize: 'medium',
  columnStyle: 'glass',
  columnHeader: 'classic',
  boardWidth: 'wide',
  boardGap: 'normal',
  columnHeight: 'normal',
  hoverEffect: 'lift',
  animations: 'normal',
  dragAnimation: 'lift',
  headerStyle: 'glass',
  controlSize: 'normal',
  cardTone: 'standard',
  contrast: 'normal',
  glassPower: 'medium',
  accentMode: 'normal',
  columnColorMode: 'soft'
};
const defaultSystemSettings = {
  language: 'ru',
  dateFormat: 'ru',
  timeFormat: '24h',
  firstDay: 'monday',
  autosave: 'on',
  notifications: 'off',
  deadlineReminder: 'day',
  confirmDelete: 'on',
  startPage: 'dashboard',
  sound: 'off',
  reducedMotion: 'off'
};
const designOptions = {
  theme: ['pastel', 'light', 'dark'],
  background: ['soft', 'plain', 'gradient', 'grid', 'mesh', 'noise'],
  font: ['system', 'modern', 'strict', 'serif', 'mono'],
  textSize: ['small', 'normal', 'large'],
  density: ['compact', 'comfortable', 'spacious'],
  radius: ['sharp', 'rounded', 'pill'],
  shadows: ['none', 'soft', 'strong'],
  surface: ['glass', 'liquid', 'solid', 'clean'],
  borders: ['none', 'soft', 'strong'],
  buttonStyle: ['solid', 'soft', 'outline', 'pill'],
  inputStyle: ['default', 'soft', 'underline'],
  taskStyle: ['clean', 'outlined', 'filled', 'minimal'],
  taskSize: ['small', 'medium', 'large'],
  columnStyle: ['glass', 'solid', 'minimal', 'bordered'],
  columnHeader: ['classic', 'badge', 'underline'],
  boardWidth: ['normal', 'wide', 'full'],
  boardGap: ['tight', 'normal', 'wide'],
  columnHeight: ['compact', 'normal', 'tall'],
  hoverEffect: ['none', 'lift', 'glow'],
  animations: ['none', 'normal', 'smooth'],
  dragAnimation: ['lift', 'ghost', 'snap'],
  headerStyle: ['glass', 'solid', 'minimal'],
  controlSize: ['compact', 'normal', 'large'],
  cardTone: ['standard', 'contrast', 'deep'],
  contrast: ['soft', 'normal', 'high'],
  glassPower: ['low', 'medium', 'high'],
  accentMode: ['calm', 'normal', 'bright'],
  columnColorMode: ['soft', 'visible', 'off']
};
const systemOptions = {
  language: ['ru', 'en', 'nl', 'ar', 'es', 'zh', 'fr'],
  dateFormat: ['ru', 'iso', 'us'],
  timeFormat: ['24h', '12h'],
  firstDay: ['monday', 'sunday'],
  autosave: ['on', 'off'],
  notifications: ['off', 'browser'],
  deadlineReminder: ['none', 'hour', 'day', 'week'],
  confirmDelete: ['on', 'off'],
  startPage: ['dashboard', 'profile'],
  sound: ['off', 'soft'],
  reducedMotion: ['off', 'on']
};

function sanitizeHexColor(value, fallback) {
  const color = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

function sanitizeDesignSettings(input = {}, current = {}) {
  const source = { ...(current || {}), ...(input || {}) };
  const next = { ...defaultDesignSettings };
  Object.keys(designOptions).forEach((key) => {
    if (source[key] !== undefined && designOptions[key].includes(String(source[key]))) {
      next[key] = String(source[key]);
    }
  });
  next.accent = sanitizeHexColor(source.accent, defaultDesignSettings.accent);
  return next;
}

function sanitizeSystemSettings(input = {}, current = {}) {
  const source = { ...(current || {}), ...(input || {}) };
  const next = { ...defaultSystemSettings };
  Object.keys(systemOptions).forEach((key) => {
    if (source[key] !== undefined && systemOptions[key].includes(String(source[key]))) {
      next[key] = String(source[key]);
    }
  });
  return next;
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
}

function readDb() {
  ensureDb();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const data = JSON.parse(raw || '{}');
    return {
      users: Array.isArray(data.users) ? data.users : [],
      boards: Array.isArray(data.boards) ? data.boards : [],
      columns: Array.isArray(data.columns) ? data.columns : [],
      tasks: Array.isArray(data.tasks) ? data.tasks : [],
      contactRequests: Array.isArray(data.contactRequests) ? data.contactRequests : [],
      adminLogs: Array.isArray(data.adminLogs) ? data.adminLogs : []
    };
  } catch (error) {
    console.error('DB read error:', error);
    return { ...defaultDb };
  }
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function json(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders
  });
  res.end(JSON.stringify(body));
}

function publicUser(user) {
  if (!user) return null;
  const designSettings = sanitizeDesignSettings(user.designSettings || { theme: user.theme || 'pastel' });
  const systemSettings = sanitizeSystemSettings(user.systemSettings || {});
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan || 'free',
    theme: designSettings.theme,
    designSettings,
    systemSettings,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt || null,
    isActive: user.isActive !== false
  };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  try {
    const [salt, hash] = String(passwordHash || '').split(':');
    if (!salt || !hash) return false;
    const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'));
  } catch {
    return false;
  }
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(value) {
  return crypto.createHmac('sha256', COOKIE_SECRET).update(value).digest('base64url');
}

function createToken(user) {
  const payload = base64url(JSON.stringify({ sub: user.id, email: user.email, role: user.role || 'user', exp: Date.now() + TOKEN_TTL }));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function createAdminToken(user) {
  const payload = base64url(JSON.stringify({ sub: user.id, email: user.email, role: 'admin', exp: Date.now() + ADMIN_TOKEN_TTL }));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return raw.split(';').reduce((cookies, part) => {
    const [key, ...valueParts] = part.trim().split('=');
    if (!key) return cookies;
    try {
      cookies[decodeURIComponent(key)] = decodeURIComponent(valueParts.join('='));
    } catch {
      // Ignore malformed cookie fragments instead of breaking the whole API request.
    }
    return cookies;
  }, {});
}

function getCurrentUser(req, db = readDb()) {
  const cookies = parseCookies(req);
  const payload = verifyToken(cookies.taskboard_token);
  if (!payload) return null;
  return db.users.find((user) => user.id === payload.sub) || null;
}

function authCookie(token) {
  const parts = [
    `taskboard_token=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 24 * 7}`
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

function logoutCookie() {
  return 'taskboard_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}

function adminCookie(token) {
  const parts = [
    `dut_admin_token=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 8}`
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

function adminLogoutCookie() {
  return 'dut_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function getOrCreateBoard(db, userId) {
  let board = db.boards.find((item) => item.userId === userId);
  if (!board) {
    board = { id: id('board'), userId, title: 'Моя доска', createdAt: new Date().toISOString() };
    db.boards.push(board);
  }

  const existing = db.columns.filter((column) => column.boardId === board.id);
  if (existing.length === 0) {
    const defaults = [
      ['ЗАДАЧИ', '#eef2ff'],
      ['В процессе', '#fff7ed'],
      ['Выполнено', '#ecfdf5']
    ];
    defaults.forEach(([title, color], position) => {
      db.columns.push({
        id: id('column'),
        boardId: board.id,
        title,
        color,
        position,
        isDefault: true,
        createdAt: new Date().toISOString()
      });
    });
  }

  return board;
}

function boardPayload(db, user) {
  const board = getOrCreateBoard(db, user.id);
  return {
    user: publicUser(user),
    board,
    columns: db.columns.filter((column) => column.boardId === board.id).sort((a, b) => a.position - b.position),
    tasks: db.tasks.filter((task) => task.boardId === board.id).sort((a, b) => a.position - b.position)
  };
}

function normalizePlan(plan) {
  return plan === 'pro' || plan === 'max' ? plan : 'free';
}

function canUseDeadlines(plan) {
  return plan === 'pro' || plan === 'max';
}

function canUseCustomColors(plan) {
  return plan === 'max';
}

function canCreateColumn(plan, customColumnsCount) {
  if (plan === 'max') return true;
  if (plan === 'pro') return customColumnsCount < 2;
  return false;
}

function isAdminUser(user) {
  return Boolean(user && user.role === 'admin' && String(user.email || '').toLowerCase() === ADMIN_EMAIL);
}

function ensureAdminUser(db) {
  if (!Array.isArray(db.users)) db.users = [];
  let admin = db.users.find((user) => String(user.email || '').toLowerCase() === ADMIN_EMAIL);
  let changed = false;

  if (!admin) {
    admin = {
      id: id('admin'),
      name: 'Yura Admin',
      email: ADMIN_EMAIL,
      passwordHash: hashPassword(ADMIN_PASSWORD),
      role: 'admin',
      plan: 'max',
      isActive: true,
      theme: 'pastel',
      designSettings: { ...defaultDesignSettings, surface: 'liquid', glassPower: 'high' },
      systemSettings: { ...defaultSystemSettings },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(admin);
    changed = true;
  }

  if (admin.role !== 'admin') { admin.role = 'admin'; changed = true; }
  if (admin.plan !== 'max') { admin.plan = 'max'; changed = true; }
  if (admin.isActive === false) { admin.isActive = true; changed = true; }
  if (!admin.passwordHash || !verifyPassword(ADMIN_PASSWORD, admin.passwordHash)) { admin.passwordHash = hashPassword(ADMIN_PASSWORD); changed = true; }
  if (!admin.designSettings) { admin.designSettings = { ...defaultDesignSettings, surface: 'liquid', glassPower: 'high' }; changed = true; }
  if (!admin.systemSettings) { admin.systemSettings = { ...defaultSystemSettings }; changed = true; }
  if (changed) admin.updatedAt = new Date().toISOString();
  return { admin, changed };
}

function getCurrentAdmin(req, db) {
  const cookies = parseCookies(req);
  const payload = verifyToken(cookies.dut_admin_token);
  if (!payload || payload.role !== 'admin') return null;
  const admin = db.users.find((user) => user.id === payload.sub);
  if (!isAdminUser(admin) || admin.isActive === false) return null;
  return admin;
}

function userBoard(db, userId) {
  return db.boards.find((board) => board.userId === userId) || null;
}

function adminUserSummary(user, db) {
  const board = userBoard(db, user.id);
  const boardId = board?.id || null;
  return {
    id: user.id,
    name: user.name || 'Без имени',
    email: user.email,
    role: user.role || 'user',
    plan: normalizePlan(user.plan),
    isActive: user.isActive !== false,
    adminNote: user.adminNote || '',
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
    lastLoginAt: user.lastLoginAt || null,
    boardId,
    boards: db.boards.filter((item) => item.userId === user.id).length,
    columns: boardId ? db.columns.filter((item) => item.boardId === boardId).length : 0,
    tasks: boardId ? db.tasks.filter((item) => item.boardId === boardId).length : 0
  };
}

function adminStats(db) {
  const normalUsers = db.users.filter((user) => !isAdminUser(user));
  const activeUsers = normalUsers.filter((user) => user.isActive !== false);
  const inactiveUsers = normalUsers.filter((user) => user.isActive === false);
  return {
    users: normalUsers.length,
    activeUsers: activeUsers.length,
    inactiveUsers: inactiveUsers.length,
    freeUsers: normalUsers.filter((user) => normalizePlan(user.plan) === 'free').length,
    proUsers: normalUsers.filter((user) => normalizePlan(user.plan) === 'pro').length,
    maxUsers: normalUsers.filter((user) => normalizePlan(user.plan) === 'max').length,
    boards: db.boards.length,
    columns: db.columns.length,
    tasks: db.tasks.length,
    contactRequests: db.contactRequests.length,
    openContactRequests: db.contactRequests.filter((item) => item.status !== 'closed').length,
    logs: db.adminLogs.length
  };
}


function ensureContactMessages(request) {
  if (!request) return [];
  if (!Array.isArray(request.messages)) {
    request.messages = [];
    if (request.message) {
      request.messages.push({
        id: id('msg'),
        from: 'user',
        authorName: request.name || 'Пользователь',
        authorEmail: request.email || '',
        text: String(request.message || ''),
        createdAt: request.createdAt || new Date().toISOString()
      });
    }
    if (request.adminComment) {
      request.messages.push({
        id: id('msg'),
        from: 'admin',
        authorName: 'DUT Admin',
        authorEmail: ADMIN_EMAIL,
        text: String(request.adminComment || ''),
        createdAt: request.updatedAt || request.createdAt || new Date().toISOString()
      });
    }
  }
  return request.messages;
}

function publicContactRequest(request, db) {
  if (!request) return null;
  const user = request.userId ? db.users.find((item) => item.id === request.userId) : null;
  const messages = ensureContactMessages(request).map((message) => ({
    id: message.id,
    from: message.from === 'admin' ? 'admin' : 'user',
    authorName: message.authorName || (message.from === 'admin' ? 'DUT Admin' : request.name || user?.name || 'Пользователь'),
    authorEmail: message.authorEmail || (message.from === 'admin' ? ADMIN_EMAIL : request.email || user?.email || ''),
    text: String(message.text || ''),
    createdAt: message.createdAt || request.createdAt
  }));
  return {
    id: request.id,
    userId: request.userId || null,
    userName: user?.name || request.name || 'Пользователь',
    userEmail: user?.email || request.email || '',
    name: request.name || user?.name || 'Пользователь',
    email: request.email || user?.email || '',
    topic: request.topic || 'Обращение в поддержку',
    message: request.message || '',
    status: request.status || 'open',
    adminComment: request.adminComment || '',
    messages,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt || request.createdAt
  };
}

function latestUserSupportThread(db, user, includeClosed = true) {
  const list = db.contactRequests
    .filter((item) => item.userId === user.id)
    .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
  if (includeClosed) return list[0] || null;
  return list.find((item) => (item.status || 'open') !== 'closed') || null;
}

function addAdminLog(db, admin, action, details = {}) {
  if (!Array.isArray(db.adminLogs)) db.adminLogs = [];
  db.adminLogs.unshift({
    id: id('log'),
    adminId: admin?.id || null,
    adminEmail: admin?.email || ADMIN_EMAIL,
    action,
    details,
    createdAt: new Date().toISOString()
  });
  db.adminLogs = db.adminLogs.slice(0, 200);
}

function resetUserBoard(db, user) {
  const board = getOrCreateBoard(db, user.id);
  db.tasks = db.tasks.filter((task) => task.boardId !== board.id);
  db.columns = db.columns.filter((column) => column.boardId !== board.id);
  const defaults = [
    ['ЗАДАЧИ', '#eef2ff'],
    ['В процессе', '#fff7ed'],
    ['Выполнено', '#ecfdf5']
  ];
  defaults.forEach(([title, color], position) => {
    db.columns.push({
      id: id('column'),
      boardId: board.id,
      title,
      color,
      position,
      isDefault: true,
      createdAt: new Date().toISOString()
    });
  });
  board.updatedAt = new Date().toISOString();
  return board;
}

async function handleAdminApi(req, res, url, db) {
  const { admin: seededAdmin, changed } = ensureAdminUser(db);
  if (changed) writeDb(db);

  if (req.method === 'POST' && url.pathname === '/api/admin/login') {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const admin = db.users.find((user) => String(user.email || '').toLowerCase() === ADMIN_EMAIL) || seededAdmin;
    if (email !== ADMIN_EMAIL || !verifyPassword(password, admin.passwordHash)) {
      return json(res, 401, { error: 'Неверный email или пароль администратора' });
    }
    admin.lastLoginAt = new Date().toISOString();
    addAdminLog(db, admin, 'admin-login', { email });
    writeDb(db);
    return json(res, 200, { admin: adminUserSummary(admin, db), stats: adminStats(db) }, { 'Set-Cookie': adminCookie(createAdminToken(admin)) });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/logout') {
    return json(res, 200, { ok: true }, { 'Set-Cookie': adminLogoutCookie() });
  }

  const admin = getCurrentAdmin(req, db);
  if (!admin) return json(res, 401, { error: 'Нужно войти в админку' }, { 'Set-Cookie': adminLogoutCookie() });

  if (req.method === 'GET' && url.pathname === '/api/admin/me') {
    return json(res, 200, { admin: adminUserSummary(admin, db), stats: adminStats(db) });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/stats') {
    return json(res, 200, { stats: adminStats(db), logs: db.adminLogs.slice(0, 20) });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/users') {
    const query = String(url.searchParams.get('query') || '').trim().toLowerCase();
    const plan = String(url.searchParams.get('plan') || 'all');
    const status = String(url.searchParams.get('status') || 'all');
    let users = db.users.filter((user) => !isAdminUser(user));
    if (query) users = users.filter((user) => String(user.name || '').toLowerCase().includes(query) || String(user.email || '').toLowerCase().includes(query));
    if (['free', 'pro', 'max'].includes(plan)) users = users.filter((user) => normalizePlan(user.plan) === plan);
    if (status === 'active') users = users.filter((user) => user.isActive !== false);
    if (status === 'inactive') users = users.filter((user) => user.isActive === false);
    users = users.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return json(res, 200, { users: users.map((user) => adminUserSummary(user, db)), stats: adminStats(db) });
  }

  const userMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (userMatch && req.method === 'GET') {
    const targetId = decodeURIComponent(userMatch[1]);
    const target = db.users.find((user) => user.id === targetId && !isAdminUser(user));
    if (!target) return json(res, 404, { error: 'Пользователь не найден' });
    const board = userBoard(db, target.id);
    const boardId = board?.id || null;
    const columns = boardId ? db.columns.filter((column) => column.boardId === boardId).sort((a, b) => a.position - b.position) : [];
    const tasks = boardId ? db.tasks.filter((task) => task.boardId === boardId).sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''))).slice(0, 25) : [];
    return json(res, 200, { user: adminUserSummary(target, db), board, columns, tasks });
  }

  if (userMatch && req.method === 'PATCH') {
    const targetId = decodeURIComponent(userMatch[1]);
    const target = db.users.find((user) => user.id === targetId && !isAdminUser(user));
    if (!target) return json(res, 404, { error: 'Пользователь не найден' });
    const body = await readBody(req);
    const changes = {};

    if (body.plan !== undefined) {
      const nextPlan = normalizePlan(body.plan);
      target.plan = nextPlan;
      changes.plan = nextPlan;
    }
    if (body.isActive !== undefined) {
      target.isActive = Boolean(body.isActive);
      changes.isActive = target.isActive;
    }
    if (body.adminNote !== undefined) {
      target.adminNote = String(body.adminNote || '').slice(0, 500);
      changes.adminNote = target.adminNote;
    }
    if (body.name !== undefined) {
      const name = String(body.name || '').trim();
      if (!name) return json(res, 400, { error: 'Имя не может быть пустым' });
      target.name = name;
      changes.name = name;
    }
    if (body.email !== undefined) {
      const email = String(body.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) return json(res, 400, { error: 'Введите корректный email' });
      if (db.users.some((user) => user.id !== target.id && String(user.email || '').toLowerCase() === email)) {
        return json(res, 409, { error: 'Пользователь с таким email уже существует' });
      }
      target.email = email;
      changes.email = email;
    }

    target.updatedAt = new Date().toISOString();
    addAdminLog(db, admin, 'user-update', { userId: target.id, email: target.email, changes });
    writeDb(db);
    return json(res, 200, { user: adminUserSummary(target, db), stats: adminStats(db), logs: db.adminLogs.slice(0, 20) });
  }

  if (userMatch && req.method === 'DELETE') {
    const targetId = decodeURIComponent(userMatch[1]);
    const target = db.users.find((user) => user.id === targetId && !isAdminUser(user));
    if (!target) return json(res, 404, { error: 'Пользователь не найден' });
    const targetBoards = db.boards.filter((board) => board.userId === target.id);
    const targetBoardIds = new Set(targetBoards.map((board) => board.id));
    db.users = db.users.filter((user) => user.id !== target.id);
    db.boards = db.boards.filter((board) => board.userId !== target.id);
    db.columns = db.columns.filter((column) => !targetBoardIds.has(column.boardId));
    db.tasks = db.tasks.filter((task) => !targetBoardIds.has(task.boardId));
    db.contactRequests.forEach((request) => { if (request.userId === target.id) request.userId = null; });
    addAdminLog(db, admin, 'user-delete', { userId: target.id, email: target.email });
    writeDb(db);
    return json(res, 200, { ok: true, stats: adminStats(db), logs: db.adminLogs.slice(0, 20) });
  }

  const resetMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/reset-board$/);
  if (resetMatch && req.method === 'POST') {
    const targetId = decodeURIComponent(resetMatch[1]);
    const target = db.users.find((user) => user.id === targetId && !isAdminUser(user));
    if (!target) return json(res, 404, { error: 'Пользователь не найден' });
    resetUserBoard(db, target);
    addAdminLog(db, admin, 'board-reset', { userId: target.id, email: target.email });
    writeDb(db);
    return json(res, 200, { user: adminUserSummary(target, db), stats: adminStats(db), logs: db.adminLogs.slice(0, 20) });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/contacts') {
    const requests = db.contactRequests
      .slice()
      .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')))
      .map((item) => publicContactRequest(item, db));
    return json(res, 200, { requests });
  }

  const contactMatch = url.pathname.match(/^\/api\/admin\/contacts\/([^/]+)$/);
  if (contactMatch && req.method === 'PATCH') {
    const contactId = decodeURIComponent(contactMatch[1]);
    const request = db.contactRequests.find((item) => item.id === contactId);
    if (!request) return json(res, 404, { error: 'Обращение не найдено' });
    const body = await readBody(req);
    const reply = String(body.reply || '').trim();
    if (reply) {
      const messages = ensureContactMessages(request);
      messages.push({
        id: id('msg'),
        from: 'admin',
        authorName: admin.name || 'DUT Admin',
        authorEmail: admin.email || ADMIN_EMAIL,
        text: reply.slice(0, 2000),
        createdAt: new Date().toISOString()
      });
      request.adminComment = reply.slice(0, 500);
      request.status = 'answered';
    } else if (body.status !== undefined) {
      request.status = body.status === 'closed' ? 'closed' : 'open';
      request.adminComment = String(body.adminComment || request.adminComment || '').slice(0, 500);
    }
    request.updatedAt = new Date().toISOString();
    addAdminLog(db, admin, 'contact-update', { contactId, status: request.status || 'open', replied: Boolean(reply) });
    writeDb(db);
    return json(res, 200, { request: publicContactRequest(request, db) });
  }

  if (contactMatch && req.method === 'DELETE') {
    const contactId = decodeURIComponent(contactMatch[1]);
    const exists = db.contactRequests.some((item) => item.id === contactId);
    if (!exists) return json(res, 404, { error: 'Обращение не найдено' });
    db.contactRequests = db.contactRequests.filter((item) => item.id !== contactId);
    addAdminLog(db, admin, 'contact-delete', { contactId });
    writeDb(db);
    return json(res, 200, { ok: true });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/export') {
    const users = db.users.filter((user) => !isAdminUser(user)).map((user) => adminUserSummary(user, db));
    addAdminLog(db, admin, 'export', { users: users.length });
    writeDb(db);
    return json(res, 200, { exportedAt: new Date().toISOString(), stats: adminStats(db), users, boards: db.boards, columns: db.columns, tasks: db.tasks, contactRequests: db.contactRequests });
  }

  return json(res, 404, { error: 'Admin API route not found' });
}

async function handleApi(req, res, url) {
  try {
    const db = readDb();

    if (url.pathname.startsWith('/api/admin/')) {
      return handleAdminApi(req, res, url, db);
    }

    if (req.method === 'POST' && url.pathname === '/api/register') {
      const body = await readBody(req);
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!name) return json(res, 400, { error: 'Введите имя' });
      if (!email || !email.includes('@')) return json(res, 400, { error: 'Введите корректный email' });
      if (password.length < 6) return json(res, 400, { error: 'Пароль должен быть минимум 6 символов' });
      if (!body.termsAccepted) return json(res, 400, { error: 'Нужно принять условия использования и политику конфиденциальности' });
      if (db.users.some((user) => user.email === email)) return json(res, 409, { error: 'Пользователь с таким email уже существует' });

      const user = { id: id('user'), name, email, passwordHash: hashPassword(password), role: 'user', plan: 'free', isActive: true, theme: 'pastel', designSettings: { ...defaultDesignSettings }, systemSettings: { ...defaultSystemSettings }, createdAt: new Date().toISOString() };
      db.users.push(user);
      getOrCreateBoard(db, user.id);
      writeDb(db);
      return json(res, 201, { user: publicUser(user) }, { 'Set-Cookie': authCookie(createToken(user)) });
    }

    if (req.method === 'POST' && url.pathname === '/api/login') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const user = db.users.find((item) => item.email === email);
      if (!user || !verifyPassword(password, user.passwordHash)) return json(res, 401, { error: 'Неверный email или пароль' });
      if (user.isActive === false) return json(res, 403, { error: 'Аккаунт деактивирован администратором' }, { 'Set-Cookie': logoutCookie() });
      user.lastLoginAt = new Date().toISOString();
      writeDb(db);
      return json(res, 200, { user: publicUser(user) }, { 'Set-Cookie': authCookie(createToken(user)) });
    }

    if (req.method === 'POST' && url.pathname === '/api/logout') {
      return json(res, 200, { ok: true }, { 'Set-Cookie': logoutCookie() });
    }

    if (req.method === 'GET' && url.pathname === '/api/me') {
      const user = getCurrentUser(req, db);
      return json(res, 200, { user: publicUser(user) });
    }

    if (req.method === 'POST' && url.pathname === '/api/contact') {
      const body = await readBody(req);
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const topic = String(body.topic || body.subject || '').trim();
      const message = String(body.message || '').trim();
      if (!name) return json(res, 400, { error: 'Введите имя' });
      if (!email || !email.includes('@')) return json(res, 400, { error: 'Введите корректный email' });
      if (!topic) return json(res, 400, { error: 'Введите тему обращения' });
      if (message.length < 10) return json(res, 400, { error: 'Сообщение должно быть минимум 10 символов' });
      if (!body.consent) return json(res, 400, { error: 'Нужно согласие на обработку обращения' });
      const currentUser = getCurrentUser(req, db);
      const createdAt = new Date().toISOString();
      const request = {
        id: id('contact'),
        name,
        email,
        topic,
        message,
        status: 'open',
        userId: currentUser?.id || null,
        messages: [{
          id: id('msg'),
          from: 'user',
          authorName: name,
          authorEmail: email,
          text: message,
          createdAt
        }],
        createdAt,
        updatedAt: createdAt
      };
      db.contactRequests.push(request);
      writeDb(db);
      return json(res, 201, { ok: true, request: { id: request.id, createdAt: request.createdAt } });
    }

    const user = getCurrentUser(req, db);
    if (!user) return json(res, 401, { error: 'Нужно войти в аккаунт' });
    if (user.isActive === false) return json(res, 403, { error: 'Аккаунт деактивирован администратором' }, { 'Set-Cookie': logoutCookie() });

    if (req.method === 'GET' && url.pathname === '/api/support/thread') {
      const thread = latestUserSupportThread(db, user, true);
      if (thread) ensureContactMessages(thread);
      writeDb(db);
      return json(res, 200, { thread: publicContactRequest(thread, db) });
    }

    if (req.method === 'POST' && url.pathname === '/api/support/thread') {
      const body = await readBody(req);
      const topic = String(body.topic || 'Вопрос администратору').trim().slice(0, 120) || 'Вопрос администратору';
      const message = String(body.message || '').trim();
      if (message.length < 2) return json(res, 400, { error: 'Введите сообщение' });
      const createdAt = new Date().toISOString();
      let thread = latestUserSupportThread(db, user, false);
      if (!thread) {
        thread = {
          id: id('contact'),
          name: user.name,
          email: user.email,
          topic,
          message,
          status: 'open',
          userId: user.id,
          messages: [],
          createdAt,
          updatedAt: createdAt
        };
        db.contactRequests.push(thread);
      }
      const messages = ensureContactMessages(thread);
      messages.push({
        id: id('msg'),
        from: 'user',
        authorName: user.name,
        authorEmail: user.email,
        text: message.slice(0, 2000),
        createdAt
      });
      thread.name = user.name;
      thread.email = user.email;
      thread.topic = topic || thread.topic || 'Вопрос администратору';
      thread.message = thread.message || message;
      thread.status = 'open';
      thread.updatedAt = createdAt;
      writeDb(db);
      return json(res, 201, { thread: publicContactRequest(thread, db) });
    }

    const payload = boardPayload(db, user);

    if (req.method === 'GET' && url.pathname === '/api/board') {
      writeDb(db);
      return json(res, 200, payload);
    }

    if (req.method === 'POST' && url.pathname === '/api/change-plan') {
      const body = await readBody(req);
      user.plan = normalizePlan(body.plan);
      writeDb(db);
      return json(res, 200, { user: publicUser(user) });
    }

    if (req.method === 'PATCH' && url.pathname === '/api/profile') {
      const body = await readBody(req);
      let changed = false;

      if (body.name !== undefined || body.email !== undefined) {
        const name = body.name !== undefined ? String(body.name || '').trim() : user.name;
        const email = body.email !== undefined ? String(body.email || '').trim().toLowerCase() : user.email;

        if (!name) return json(res, 400, { error: 'Введите имя' });
        if (!email || !email.includes('@')) return json(res, 400, { error: 'Введите корректный email' });
        if (db.users.some((item) => item.id !== user.id && item.email === email)) {
          return json(res, 409, { error: 'Пользователь с таким email уже существует' });
        }

        user.name = name;
        user.email = email;
        changed = true;
      }

      if (body.theme !== undefined) {
        user.designSettings = sanitizeDesignSettings({ theme: body.theme }, user.designSettings || { theme: user.theme || 'pastel' });
        user.theme = user.designSettings.theme;
        changed = true;
      }

      if (body.designSettings !== undefined) {
        user.designSettings = sanitizeDesignSettings(body.designSettings, user.designSettings || { theme: user.theme || 'pastel' });
        user.theme = user.designSettings.theme;
        changed = true;
      }

      if (body.systemSettings !== undefined) {
        user.systemSettings = sanitizeSystemSettings(body.systemSettings, user.systemSettings || {});
        changed = true;
      }

      if (changed) user.updatedAt = new Date().toISOString();
      writeDb(db);
      return json(res, 200, { user: publicUser(user) });
    }

    if (req.method === 'POST' && url.pathname === '/api/tasks') {
      const body = await readBody(req);
      const title = String(body.title || '').trim();
      const description = String(body.description || '').trim();
      const columnId = String(body.columnId || '');
      if (!title) return json(res, 400, { error: 'Введите название задачи' });
      const column = payload.columns.find((item) => item.id === columnId);
      if (!column) return json(res, 404, { error: 'Колонка не найдена' });

      const plan = normalizePlan(user.plan);
      const sameColumn = payload.tasks.filter((task) => task.columnId === columnId);
      const task = {
        id: id('task'),
        boardId: payload.board.id,
        columnId,
        title,
        description,
        startAt: canUseDeadlines(plan) && body.startAt ? String(body.startAt) : null,
        dueAt: canUseDeadlines(plan) && body.dueAt ? String(body.dueAt) : null,
        manualColor: canUseCustomColors(plan) && body.manualColor ? sanitizeHexColor(body.manualColor, '#6366f1') : null,
        position: sameColumn.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.tasks.push(task);
      writeDb(db);
      return json(res, 201, { task });
    }

    const taskMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)$/);
    if (taskMatch && (req.method === 'PATCH' || req.method === 'DELETE')) {
      const taskId = decodeURIComponent(taskMatch[1]);
      const task = db.tasks.find((item) => item.id === taskId && item.boardId === payload.board.id);
      if (!task) return json(res, 404, { error: 'Задача не найдена' });

      if (req.method === 'DELETE') {
        db.tasks = db.tasks.filter((item) => item.id !== task.id);
        writeDb(db);
        return json(res, 200, { ok: true });
      }

      const body = await readBody(req);
      if (body.title !== undefined) {
        const title = String(body.title || '').trim();
        if (!title) return json(res, 400, { error: 'Введите название задачи' });
        task.title = title;
      }
      if (body.description !== undefined) task.description = String(body.description || '').trim();
      if (body.columnId !== undefined) {
        const columnId = String(body.columnId || '');
        const column = payload.columns.find((item) => item.id === columnId);
        if (!column) return json(res, 404, { error: 'Колонка не найдена' });
        task.columnId = columnId;
        task.position = db.tasks.filter((item) => item.boardId === payload.board.id && item.columnId === columnId && item.id !== task.id).length;
      }
      const plan = normalizePlan(user.plan);
      if (canUseDeadlines(plan)) {
        if (body.startAt !== undefined) task.startAt = body.startAt ? String(body.startAt) : null;
        if (body.dueAt !== undefined) task.dueAt = body.dueAt ? String(body.dueAt) : null;
      } else {
        task.startAt = null;
        task.dueAt = null;
      }
      if (canUseCustomColors(plan)) {
        if (body.manualColor !== undefined) task.manualColor = body.manualColor ? sanitizeHexColor(body.manualColor, task.manualColor || '#6366f1') : null;
      } else {
        task.manualColor = null;
      }
      task.updatedAt = new Date().toISOString();
      writeDb(db);
      return json(res, 200, { task });
    }

    if (req.method === 'POST' && url.pathname === '/api/columns') {
      const body = await readBody(req);
      const title = String(body.title || '').trim();
      if (!title) return json(res, 400, { error: 'Введите название колонки' });
      const customColumns = payload.columns.filter((column) => !column.isDefault).length;
      const plan = normalizePlan(user.plan);
      if (!canCreateColumn(plan, customColumns)) {
        return json(res, 403, { error: plan === 'free' ? 'Создание колонок доступно с тарифа Pro' : 'На тарифе Pro можно создать только 2 дополнительные колонки' });
      }
      const column = {
        id: id('column'),
        boardId: payload.board.id,
        title,
        color: canUseCustomColors(plan) && body.color ? sanitizeHexColor(body.color, '#ffffff') : '#ffffff',
        position: payload.columns.length,
        isDefault: false,
        createdAt: new Date().toISOString()
      };
      db.columns.push(column);
      writeDb(db);
      return json(res, 201, { column });
    }

    const columnMatch = url.pathname.match(/^\/api\/columns\/([^/]+)$/);
    if (columnMatch && (req.method === 'PATCH' || req.method === 'DELETE')) {
      const columnId = decodeURIComponent(columnMatch[1]);
      const column = db.columns.find((item) => item.id === columnId && item.boardId === payload.board.id);
      if (!column) return json(res, 404, { error: 'Колонка не найдена' });

      if (req.method === 'DELETE') {
        if (column.isDefault) return json(res, 403, { error: 'Базовые колонки удалять нельзя' });
        db.columns = db.columns.filter((item) => item.id !== column.id);
        db.tasks = db.tasks.filter((task) => task.columnId !== column.id);
        writeDb(db);
        return json(res, 200, { ok: true });
      }

      const body = await readBody(req);
      if (body.title !== undefined) {
        const title = String(body.title || '').trim();
        if (!title) return json(res, 400, { error: 'Введите название колонки' });
        column.title = title;
      }
      if (body.color !== undefined && canUseCustomColors(normalizePlan(user.plan))) {
        column.color = sanitizeHexColor(body.color, column.color || '#ffffff');
      }
      writeDb(db);
      return json(res, 200, { column });
    }

    return json(res, 404, { error: 'API route not found' });
  } catch (error) {
    console.error('API error:', error);
    return json(res, 500, { error: 'Внутренняя ошибка сервера' });
  }
}

function serveStatic(req, res, url) {
  let requestedPath = decodeURIComponent(url.pathname);
  if (requestedPath === '/') requestedPath = '/index.html';

  const safePath = path.normalize(requestedPath).replace(/^\.\.(\/|\\|$)/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const directoryIndex = path.join(filePath, 'index.html');
    filePath = fs.existsSync(directoryIndex) ? directoryIndex : path.join(PUBLIC_DIR, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
  }[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/healthz') {
    return json(res, 200, { ok: true, service: 'dut-saas', time: new Date().toISOString() });
  }
  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url);
    return;
  }
  serveStatic(req, res, url);
});

ensureDb();
{
  const db = readDb();
  const { changed } = ensureAdminUser(db);
  if (changed) writeDb(db);
}
server.listen(PORT, () => {
  console.log(`DUT SaaS data file: ${DB_PATH}`);
  console.log(`DUT SaaS is running: http://localhost:${PORT}`);
});
