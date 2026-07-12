import { run, get } from '../db/index.js';
import { randomToken } from './crypto.js';
import { parseCookies, setCookie } from './http.js';

const DAY = 24 * 60 * 60;

export function createSession(res, { kind, subjectId, tenantId }) {
  const token = randomToken(24);
  const expires = new Date(Date.now() + 7 * DAY * 1000).toISOString();
  run('INSERT INTO sessions (token,kind,subject_id,tenant_id,expires_at) VALUES (?,?,?,?,?)',
    token, kind, subjectId, tenantId ?? null, expires);
  setCookie(res, kind === 'admin' ? 'cba_admin' : 'cba_session', token, { maxAge: 7 * DAY });
  return token;
}

export function getSession(req, kind = 'user') {
  const cookies = parseCookies(req);
  const token = cookies[kind === 'admin' ? 'cba_admin' : 'cba_session'];
  if (!token) return null;
  const s = get('SELECT * FROM sessions WHERE token = ? AND kind = ?', token, kind);
  if (!s) return null;
  if (new Date(s.expires_at).getTime() < Date.now()) {
    run('DELETE FROM sessions WHERE token = ?', token);
    return null;
  }
  return s;
}

export function destroySession(req, res, kind = 'user') {
  const cookies = parseCookies(req);
  const token = cookies[kind === 'admin' ? 'cba_admin' : 'cba_session'];
  if (token) run('DELETE FROM sessions WHERE token = ?', token);
  setCookie(res, kind === 'admin' ? 'cba_admin' : 'cba_session', '', { maxAge: 0 });
}

// Returns the authenticated merchant user + tenant, or null.
export function currentUser(req) {
  const s = getSession(req, 'user');
  if (!s) return null;
  const user = get('SELECT id,tenant_id,email,name,role FROM users WHERE id = ?', s.subject_id);
  if (!user) return null;
  const tenant = get('SELECT * FROM tenants WHERE id = ?', user.tenant_id);
  return { user, tenant: tenant ? { ...tenant, brand: safeParse(tenant.brand_json) } : null };
}

export function currentAdmin(req) {
  const s = getSession(req, 'admin');
  if (!s) return null;
  return get('SELECT id,email,name FROM platform_admins WHERE id = ?', s.subject_id);
}

function safeParse(s) { try { return JSON.parse(s || '{}'); } catch { return {}; } }
