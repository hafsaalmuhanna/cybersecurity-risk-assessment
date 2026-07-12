import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { run, get, all } from '../db/index.js';
import { currentUser } from '../lib/auth.js';
import { sendJson, readJson } from '../lib/http.js';
import { config } from '../lib/config.js';
import { getPlan, quotaStatus } from '../services/billing/plans.js';
import { importFromShopifyApi, importFromShopifyCsv } from '../services/shopify/importer.js';

// Guard: return {user,tenant} or send 401 and return null
function auth(req, res) {
  const ctx = currentUser(req);
  if (!ctx) { sendJson(res, 401, { error: 'غير مصرّح' }); return null; }
  return ctx;
}

function saveDataUrlImage(dataUrl, prefix = 'g') {
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/is.exec(dataUrl || '');
  if (!m) return null;
  const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg' }[m[1]] || 'png';
  const name = `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.mkdirSync(config.uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(config.uploadsDir, name), Buffer.from(m[2], 'base64'));
  return `/uploads/${name}`;
}

function productOut(p) {
  return { ...p, images: JSON.parse(p.images_json || '[]'), price: p.price_cents / 100 };
}

export function register(router) {
  // ---- products ----
  router.get('/api/products', ({ req, res }) => {
    const ctx = auth(req, res); if (!ctx) return;
    const rows = all('SELECT * FROM products WHERE tenant_id = ? ORDER BY created_at DESC', ctx.tenant.id);
    sendJson(res, 200, { products: rows.map(productOut) });
  });

  router.post('/api/products', async ({ req, res }) => {
    const ctx = auth(req, res); if (!ctx) return;
    const b = await readJson(req);
    const plan = getPlan(ctx.tenant.plan_id);
    const count = get('SELECT COUNT(*) c FROM products WHERE tenant_id = ?', ctx.tenant.id).c;
    if (plan && count >= plan.max_products) return sendJson(res, 402, { error: `تجاوزت حد المنتجات لباقتك (${plan.max_products}). قم بالترقية.` });
    if (!b.title) return sendJson(res, 400, { error: 'العنوان مطلوب' });
    let garmentUrl = b.garment_url || null;
    if (b.garmentImage) garmentUrl = saveDataUrlImage(b.garmentImage, 'g');
    const images = garmentUrl ? [garmentUrl] : [];
    const r = run(`INSERT INTO products (tenant_id,title,description,price_cents,currency,category,images_json,garment_url,source,status)
                   VALUES (?,?,?,?,?,?,?,?,'manual','active')`,
      ctx.tenant.id, b.title, b.description || '', Math.round((b.price || 0) * 100), ctx.tenant.brand?.currency || 'SAR',
      b.category || 'top', JSON.stringify(images), garmentUrl);
    sendJson(res, 200, { product: productOut(get('SELECT * FROM products WHERE id = ?', r.lastInsertRowid)) });
  });

  router.patch('/api/products/:id', async ({ req, res, params }) => {
    const ctx = auth(req, res); if (!ctx) return;
    const p = get('SELECT * FROM products WHERE id = ? AND tenant_id = ?', params.id, ctx.tenant.id);
    if (!p) return sendJson(res, 404, { error: 'غير موجود' });
    const b = await readJson(req);
    let garmentUrl = p.garment_url;
    if (b.garmentImage) garmentUrl = saveDataUrlImage(b.garmentImage, 'g') || garmentUrl;
    run('UPDATE products SET title=?,description=?,price_cents=?,category=?,garment_url=?,images_json=?,status=? WHERE id=?',
      b.title ?? p.title, b.description ?? p.description,
      b.price != null ? Math.round(b.price * 100) : p.price_cents,
      b.category ?? p.category, garmentUrl,
      JSON.stringify(garmentUrl ? [garmentUrl] : JSON.parse(p.images_json || '[]')),
      b.status ?? p.status, p.id);
    sendJson(res, 200, { product: productOut(get('SELECT * FROM products WHERE id = ?', p.id)) });
  });

  router.delete('/api/products/:id', ({ req, res, params }) => {
    const ctx = auth(req, res); if (!ctx) return;
    run('DELETE FROM products WHERE id = ? AND tenant_id = ?', params.id, ctx.tenant.id);
    sendJson(res, 200, { ok: true });
  });

  // ---- house models ----
  router.get('/api/models', ({ req, res }) => {
    const ctx = auth(req, res); if (!ctx) return;
    const models = all('SELECT * FROM house_models WHERE active = 1 ORDER BY id');
    const enabled = new Set(all('SELECT model_id FROM tenant_models WHERE tenant_id = ? AND enabled = 1', ctx.tenant.id).map((r) => r.model_id));
    sendJson(res, 200, {
      models: models.map((m) => ({ ...m, poses: JSON.parse(m.poses_json || '[]'), hijab: !!m.hijab, enabled: enabled.has(m.id) })),
    });
  });

  router.post('/api/models/:id/toggle', async ({ req, res, params }) => {
    const ctx = auth(req, res); if (!ctx) return;
    const model = get('SELECT * FROM house_models WHERE id = ?', params.id);
    if (!model) return sendJson(res, 404, { error: 'غير موجود' });
    const existing = get('SELECT enabled FROM tenant_models WHERE tenant_id = ? AND model_id = ?', ctx.tenant.id, params.id);
    const plan = getPlan(ctx.tenant.plan_id);
    const enabledCount = get('SELECT COUNT(*) c FROM tenant_models WHERE tenant_id = ? AND enabled = 1', ctx.tenant.id).c;
    const next = existing ? (existing.enabled ? 0 : 1) : 1;
    if (next === 1 && plan && enabledCount >= plan.max_models) {
      return sendJson(res, 402, { error: `باقتك تسمح بـ ${plan.max_models} موديلات فقط.` });
    }
    if (existing) run('UPDATE tenant_models SET enabled = ? WHERE tenant_id = ? AND model_id = ?', next, ctx.tenant.id, params.id);
    else run('INSERT INTO tenant_models (tenant_id, model_id, enabled) VALUES (?,?,1)', ctx.tenant.id, params.id);
    sendJson(res, 200, { ok: true, enabled: !!next });
  });

  // ---- brand & custom domain ----
  router.patch('/api/brand', async ({ req, res }) => {
    const ctx = auth(req, res); if (!ctx) return;
    const b = await readJson(req);
    const brand = { ...ctx.tenant.brand, ...(b.brand || {}) };
    if (b.logo) { const url = saveDataUrlImage(b.logo, 'logo'); if (url) brand.logo = url; }
    run('UPDATE tenants SET name = ?, brand_json = ? WHERE id = ?', brand.name || ctx.tenant.name, JSON.stringify(brand), ctx.tenant.id);
    // custom domain (plan-gated)
    if (b.custom_domain !== undefined) {
      const plan = getPlan(ctx.tenant.plan_id);
      if (b.custom_domain && plan && !plan.custom_domain) return sendJson(res, 402, { error: 'الدومين الخاص متاح في باقة النمو فأعلى.' });
      const domain = (b.custom_domain || '').trim().toLowerCase() || null;
      if (domain && get('SELECT id FROM tenants WHERE custom_domain = ? AND id != ?', domain, ctx.tenant.id)) {
        return sendJson(res, 409, { error: 'هذا الدومين مستخدم.' });
      }
      run('UPDATE tenants SET custom_domain = ? WHERE id = ?', domain, ctx.tenant.id);
    }
    sendJson(res, 200, { ok: true });
  });

  // ---- stats ----
  router.get('/api/stats', ({ req, res }) => {
    const ctx = auth(req, res); if (!ctx) return;
    const tId = ctx.tenant.id;
    sendJson(res, 200, {
      products: get('SELECT COUNT(*) c FROM products WHERE tenant_id = ?', tId).c,
      models: get('SELECT COUNT(*) c FROM tenant_models WHERE tenant_id = ? AND enabled = 1', tId).c,
      tryons: get('SELECT COUNT(*) c FROM tryon_jobs WHERE tenant_id = ?', tId).c,
      tryonsDone: get("SELECT COUNT(*) c FROM tryon_jobs WHERE tenant_id = ? AND status='done'", tId).c,
      quota: quotaStatus(ctx.tenant),
      recent: all('SELECT id,status,result_url,pose,created_at FROM tryon_jobs WHERE tenant_id = ? ORDER BY id DESC LIMIT 8', tId),
    });
  });

  // ---- Shopify / CSV import ----
  router.post('/api/import/shopify', async ({ req, res }) => {
    const ctx = auth(req, res); if (!ctx) return;
    const { shop, token } = await readJson(req);
    if (!shop || !token) return sendJson(res, 400, { error: 'shop و token مطلوبان' });
    const job = run("INSERT INTO import_jobs (tenant_id,source,status) VALUES (?,?,'running')", ctx.tenant.id, 'shopify_api');
    try {
      const result = await importFromShopifyApi({ tenantId: ctx.tenant.id, shop: shop.replace(/^https?:\/\//, ''), token, importJobId: job.lastInsertRowid });
      run('INSERT OR REPLACE INTO shopify_connections (tenant_id,shop_domain,access_token) VALUES (?,?,?)', ctx.tenant.id, shop, token);
      sendJson(res, 200, { ok: true, ...result });
    } catch (e) {
      run("UPDATE import_jobs SET status='failed', log=? WHERE id=?", String(e.message), job.lastInsertRowid);
      sendJson(res, 502, { error: 'فشل الاستيراد: ' + e.message });
    }
  });

  router.post('/api/import/csv', async ({ req, res }) => {
    const ctx = auth(req, res); if (!ctx) return;
    const { csv } = await readJson(req);
    if (!csv) return sendJson(res, 400, { error: 'ملف CSV مطلوب' });
    const job = run("INSERT INTO import_jobs (tenant_id,source,status) VALUES (?,?,'running')", ctx.tenant.id, 'shopify_csv');
    try {
      const result = importFromShopifyCsv({ tenantId: ctx.tenant.id, csvText: csv, importJobId: job.lastInsertRowid });
      sendJson(res, 200, { ok: true, ...result });
    } catch (e) {
      run("UPDATE import_jobs SET status='failed', log=? WHERE id=?", String(e.message), job.lastInsertRowid);
      sendJson(res, 400, { error: 'فشل قراءة الملف: ' + e.message });
    }
  });

  router.get('/api/import/jobs', ({ req, res }) => {
    const ctx = auth(req, res); if (!ctx) return;
    sendJson(res, 200, { jobs: all('SELECT * FROM import_jobs WHERE tenant_id = ? ORDER BY id DESC LIMIT 10', ctx.tenant.id) });
  });
}
