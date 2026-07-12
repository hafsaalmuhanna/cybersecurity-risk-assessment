import { get, all } from '../db/index.js';
import { verifyPassword } from '../lib/crypto.js';
import { createSession, destroySession, currentAdmin } from '../lib/auth.js';
import { sendJson, readJson } from '../lib/http.js';
import { currentPeriod } from '../services/billing/plans.js';

function guard(req, res) {
  const a = currentAdmin(req);
  if (!a) { sendJson(res, 401, { error: 'غير مصرّح' }); return null; }
  return a;
}

export function register(router) {
  router.post('/api/admin/login', async ({ req, res }) => {
    const { email, password } = await readJson(req);
    const admin = get('SELECT * FROM platform_admins WHERE email = ?', email);
    if (!admin || !verifyPassword(password, admin.password)) return sendJson(res, 401, { error: 'بيانات خاطئة' });
    createSession(res, { kind: 'admin', subjectId: admin.id });
    sendJson(res, 200, { ok: true });
  });

  router.post('/api/admin/logout', ({ req, res }) => {
    destroySession(req, res, 'admin');
    sendJson(res, 200, { ok: true });
  });

  router.get('/api/admin/me', ({ req, res }) => {
    const a = currentAdmin(req);
    if (!a) return sendJson(res, 401, { error: 'غير مصرّح' });
    sendJson(res, 200, { admin: a });
  });

  router.get('/api/admin/overview', ({ req, res }) => {
    if (!guard(req, res)) return;
    const period = currentPeriod();
    const tenants = all(`
      SELECT t.id,t.name,t.slug,t.custom_domain,t.plan_id,t.status,t.created_at,
        (SELECT COUNT(*) FROM products p WHERE p.tenant_id=t.id) AS products,
        (SELECT COUNT(*) FROM usage_events u WHERE u.tenant_id=t.id AND u.period=?) AS usage
      FROM tenants t ORDER BY t.id DESC`, period);
    const plans = all('SELECT id,name,price_cents FROM plans');
    const mrr = tenants.filter((t) => t.status === 'active')
      .reduce((sum, t) => sum + ((plans.find((p) => p.id === t.plan_id)?.price_cents || 0) / 100), 0);
    sendJson(res, 200, {
      totals: {
        tenants: tenants.length,
        active: tenants.filter((t) => t.status === 'active').length,
        tryons: get('SELECT COUNT(*) c FROM tryon_jobs').c,
        mrr,
      },
      tenants,
    });
  });
}
