import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { get, all, run } from '../db/index.js';
import { verifyPassword } from '../lib/crypto.js';
import { createSession, destroySession, currentAdmin } from '../lib/auth.js';
import { sendJson, readJson } from '../lib/http.js';
import { config } from '../lib/config.js';
import { currentPeriod } from '../services/billing/plans.js';

const modelsDir = path.join(config.publicDir, 'assets', 'models');
function saveModelImage(dataUrl) {
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/is.exec(dataUrl || '');
  if (!m) return null;
  const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg' }[m[1]] || 'png';
  fs.mkdirSync(modelsDir, { recursive: true });
  const name = `custom_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(modelsDir, name), Buffer.from(m[2], 'base64'));
  return `/assets/models/${name}`;
}
function modelOut(m) {
  return { ...m, poses: JSON.parse(m.poses_json || '[]'), hijab: !!m.hijab };
}

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

  // ---- house models management (العارضات) ----
  router.get('/api/admin/models', ({ req, res }) => {
    if (!guard(req, res)) return;
    sendJson(res, 200, { models: all('SELECT * FROM house_models ORDER BY id').map(modelOut) });
  });

  router.post('/api/admin/models', async ({ req, res }) => {
    if (!guard(req, res)) return;
    const b = await readJson(req);
    if (!b.name) return sendJson(res, 400, { error: 'الاسم مطلوب' });
    const poses = Array.isArray(b.poses) && b.poses.length ? b.poses : ['بورتريه'];
    const r = run('INSERT INTO house_models (name,ethnicity,skin_tone,hair,hijab,poses_json,active) VALUES (?,?,?,?,?,?,1)',
      b.name, b.ethnicity || '', b.skin_tone || '', b.hair || '', b.hijab ? 1 : 0, JSON.stringify(poses));
    const id = r.lastInsertRowid;
    const base = b.baseImage ? saveModelImage(b.baseImage) : null;
    const hijab = b.hijabImage ? saveModelImage(b.hijabImage) : null;
    run('UPDATE house_models SET image_url=?, image_hijab_url=? WHERE id=?', base, hijab, id);
    sendJson(res, 200, { model: modelOut(get('SELECT * FROM house_models WHERE id=?', id)) });
  });

  router.patch('/api/admin/models/:id', async ({ req, res, params }) => {
    if (!guard(req, res)) return;
    const m = get('SELECT * FROM house_models WHERE id=?', params.id);
    if (!m) return sendJson(res, 404, { error: 'غير موجود' });
    const b = await readJson(req);
    const base = b.baseImage ? saveModelImage(b.baseImage) : m.image_url;
    const hijab = b.hijabImage ? saveModelImage(b.hijabImage) : m.image_hijab_url;
    run('UPDATE house_models SET name=?,ethnicity=?,skin_tone=?,hair=?,hijab=?,poses_json=?,active=?,image_url=?,image_hijab_url=? WHERE id=?',
      b.name ?? m.name, b.ethnicity ?? m.ethnicity, b.skin_tone ?? m.skin_tone, b.hair ?? m.hair,
      b.hijab != null ? (b.hijab ? 1 : 0) : m.hijab,
      b.poses ? JSON.stringify(b.poses) : m.poses_json,
      b.active != null ? (b.active ? 1 : 0) : m.active,
      base, hijab, m.id);
    sendJson(res, 200, { model: modelOut(get('SELECT * FROM house_models WHERE id=?', m.id)) });
  });

  router.delete('/api/admin/models/:id', ({ req, res, params }) => {
    if (!guard(req, res)) return;
    run('DELETE FROM house_models WHERE id=?', params.id);
    sendJson(res, 200, { ok: true });
  });
}
