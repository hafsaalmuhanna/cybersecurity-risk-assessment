import { run, get, all } from '../db/index.js';
import { hashPassword, verifyPassword } from '../lib/crypto.js';
import { createSession, destroySession, currentUser } from '../lib/auth.js';
import { sendJson, readJson } from '../lib/http.js';
import { getPlan, quotaStatus, listPlans } from '../services/billing/plans.js';

const slugify = (s) => (s || '').toString().trim().toLowerCase()
  .replace(/[^a-z0-9؀-ۿ]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'store';

export function register(router) {
  // Merchant sign up -> creates tenant + owner user + trial subscription
  router.post('/api/auth/register', async ({ req, res }) => {
    const body = await readJson(req);
    const { storeName, email, password } = body;
    let slug = slugify(body.slug || storeName);
    const planId = getPlan(body.plan) ? body.plan : 'starter';
    if (!storeName || !email || !password) return sendJson(res, 400, { error: 'الحقول المطلوبة ناقصة' });
    if (password.length < 6) return sendJson(res, 400, { error: 'كلمة المرور قصيرة' });

    // ensure unique slug
    let base = slug, n = 1;
    while (get('SELECT id FROM tenants WHERE slug = ?', slug)) slug = `${base}-${++n}`;

    const brand = { name: storeName, color: '#c9a24a', currency: 'SAR', lang: 'ar', rtl: true, tagline: '' };
    const t = run('INSERT INTO tenants (name,slug,plan_id,status,brand_json) VALUES (?,?,?,?,?)',
      storeName, slug, planId, 'trialing', JSON.stringify(brand));
    const tenantId = t.lastInsertRowid;
    run(`INSERT INTO subscriptions (tenant_id,plan_id,status,provider,period_start,period_end)
         VALUES (?,?,?,?,date('now'),date('now','+14 day'))`, tenantId, planId, 'trialing', 'manual');
    const u = run('INSERT INTO users (tenant_id,email,password,name,role) VALUES (?,?,?,?,?)',
      tenantId, email, hashPassword(password), storeName, 'owner');
    // enable first 3 house models by default
    for (const m of all('SELECT id FROM house_models WHERE active=1 ORDER BY id LIMIT 3')) {
      run('INSERT OR IGNORE INTO tenant_models (tenant_id,model_id,enabled) VALUES (?,?,1)', tenantId, m.id);
    }
    createSession(res, { kind: 'user', subjectId: u.lastInsertRowid, tenantId });
    sendJson(res, 200, { ok: true, slug });
  });

  router.post('/api/auth/login', async ({ req, res }) => {
    const { email, password } = await readJson(req);
    const user = get('SELECT * FROM users WHERE email = ?', email);
    if (!user || !verifyPassword(password, user.password)) {
      return sendJson(res, 401, { error: 'البريد أو كلمة المرور غير صحيحة' });
    }
    createSession(res, { kind: 'user', subjectId: user.id, tenantId: user.tenant_id });
    sendJson(res, 200, { ok: true });
  });

  router.post('/api/auth/logout', async ({ req, res }) => {
    destroySession(req, res, 'user');
    sendJson(res, 200, { ok: true });
  });

  router.get('/api/me', async ({ req, res }) => {
    const ctx = currentUser(req);
    if (!ctx) return sendJson(res, 401, { error: 'غير مسجل الدخول' });
    const plan = getPlan(ctx.tenant.plan_id);
    sendJson(res, 200, {
      user: ctx.user,
      tenant: { id: ctx.tenant.id, name: ctx.tenant.name, slug: ctx.tenant.slug, status: ctx.tenant.status, custom_domain: ctx.tenant.custom_domain, brand: ctx.tenant.brand },
      plan,
      quota: quotaStatus(ctx.tenant),
      plans: listPlans(),
    });
  });
}
