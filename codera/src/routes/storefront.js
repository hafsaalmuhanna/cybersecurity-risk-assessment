import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { run, get, all } from '../db/index.js';
import { sendJson, readJson } from '../lib/http.js';
import { config } from '../lib/config.js';
import { getProvider } from '../services/ai/index.js';
import { quotaStatus, recordUsage } from '../services/billing/plans.js';

function productOut(p) {
  return {
    id: p.id, title: p.title, description: p.description, category: p.category,
    price: p.price_cents / 100, currency: p.currency,
    images: JSON.parse(p.images_json || '[]'), garment_url: p.garment_url,
  };
}

function saveShopperPhoto(dataUrl) {
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/is.exec(dataUrl || '');
  if (!m) return null;
  const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[m[1]] || 'png';
  const name = `shopper_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(config.uploadsDir, name), Buffer.from(m[2], 'base64'));
  return `/uploads/${name}`;
}

// Process one try-on job in the background (in-process worker).
async function processJob(jobId, tenant) {
  const job = get('SELECT * FROM tryon_jobs WHERE id = ?', jobId);
  if (!job) return;
  run("UPDATE tryon_jobs SET status='processing', updated_at=datetime('now') WHERE id=?", jobId);
  try {
    const product = job.product_id ? get('SELECT * FROM products WHERE id = ?', job.product_id) : null;
    const model = job.model_id ? get('SELECT * FROM house_models WHERE id = ?', job.model_id) : null;
    const provider = getProvider();
    const origin = tenant?._origin || '';
    const result = await provider.generate({
      title: product?.title,
      category: product?.category || 'top',
      garmentUrl: product?.garment_url,
      publicGarmentUrl: product?.garment_url ? origin + product.garment_url : undefined,
      publicModelUrl: model?.image_url ? origin + model.image_url : undefined,
      modelName: model?.name,
      skinTone: model?.skin_tone,
      hijab: !!job.hijab,
      pose: job.pose,
      shopperPhoto: job.shopper_photo ? origin + job.shopper_photo : undefined,
    });
    run("UPDATE tryon_jobs SET status='done', result_url=?, provider=?, updated_at=datetime('now') WHERE id=?",
      result.resultUrl, provider.name, jobId);
    recordUsage(job.tenant_id, 'tryon');
  } catch (e) {
    run("UPDATE tryon_jobs SET status='failed', error=?, updated_at=datetime('now') WHERE id=?", String(e.message), jobId);
  }
}

export function register(router) {
  // Public storefront data (tenant resolved by host or ?tenant=slug)
  router.get('/api/store', ({ res, tenant }) => {
    if (!tenant) return sendJson(res, 404, { error: 'المتجر غير موجود' });
    const models = all(
      `SELECT hm.* FROM house_models hm JOIN tenant_models tm ON tm.model_id = hm.id
       WHERE tm.tenant_id = ? AND tm.enabled = 1 AND hm.active = 1 ORDER BY hm.id`, tenant.id
    ).map((m) => ({ id: m.id, name: m.name, ethnicity: m.ethnicity, skin_tone: m.skin_tone, hair: m.hair, hijab: !!m.hijab, poses: JSON.parse(m.poses_json || '[]'), image_url: m.image_url }));
    const products = all("SELECT * FROM products WHERE tenant_id = ? AND status='active' ORDER BY created_at DESC LIMIT 60", tenant.id).map(productOut);
    sendJson(res, 200, {
      store: { name: tenant.name, slug: tenant.slug, brand: tenant.brand },
      models, products,
    });
  });

  router.get('/api/store/products/:id', ({ res, tenant, params }) => {
    if (!tenant) return sendJson(res, 404, { error: 'المتجر غير موجود' });
    const p = get('SELECT * FROM products WHERE id = ? AND tenant_id = ?', params.id, tenant.id);
    if (!p) return sendJson(res, 404, { error: 'غير موجود' });
    sendJson(res, 200, { product: productOut(p) });
  });

  // Create a try-on job
  router.post('/api/tryon', async ({ req, res, tenant, origin }) => {
    if (!tenant) return sendJson(res, 404, { error: 'المتجر غير موجود' });
    if (tenant) tenant._origin = origin;
    const q = quotaStatus(tenant);
    if (q.exceeded) return sendJson(res, 402, { error: 'انتهت حصة التجارب لهذا الشهر لهذا المتجر.' });
    const b = await readJson(req);
    if (!b.productId) return sendJson(res, 400, { error: 'المنتج مطلوب' });
    const product = get('SELECT * FROM products WHERE id = ? AND tenant_id = ?', b.productId, tenant.id);
    if (!product) return sendJson(res, 404, { error: 'المنتج غير موجود' });

    let shopperPhoto = null;
    if (b.shopperPhoto) shopperPhoto = saveShopperPhoto(b.shopperPhoto);
    // must have either a house model or a shopper photo
    if (!b.modelId && !shopperPhoto) return sendJson(res, 400, { error: 'اختر موديل أو ارفع صورتك' });

    const r = run(`INSERT INTO tryon_jobs (tenant_id,product_id,model_id,shopper_photo,hijab,pose,status)
                   VALUES (?,?,?,?,?,?, 'queued')`,
      tenant.id, product.id, b.modelId || null, shopperPhoto, b.hijab ? 1 : 0, b.pose || 'بورتريه');
    const jobId = r.lastInsertRowid;
    // kick off async processing (do not block the response)
    setImmediate(() => processJob(jobId, tenant));
    sendJson(res, 200, { jobId, status: 'queued' });
  });

  router.get('/api/tryon/:id', ({ res, tenant, params }) => {
    if (!tenant) return sendJson(res, 404, { error: 'المتجر غير موجود' });
    const job = get('SELECT id,status,result_url,error,pose FROM tryon_jobs WHERE id = ? AND tenant_id = ?', params.id, tenant.id);
    if (!job) return sendJson(res, 404, { error: 'غير موجود' });
    sendJson(res, 200, { job });
  });
}
