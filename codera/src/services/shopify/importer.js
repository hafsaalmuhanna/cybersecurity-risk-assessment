import { config } from '../../lib/config.js';
import { run, get } from '../../db/index.js';

// Map a Shopify product type / tag to Codera garment category
function guessCategory(text = '') {
  const t = text.toLowerCase();
  if (/(عباية|abaya)/.test(t)) return 'abaya';
  if (/(فستان|dress|gown)/.test(t)) return 'dress';
  if (/(بنطال|pant|trouser|jean|skirt|تنورة)/.test(t)) return 'bottom';
  if (/(شال|scarf|bag|حقيبة|حزام|belt|accessor|إكسسوار)/.test(t)) return 'accessory';
  return 'top';
}

function insertProduct(tenantId, p) {
  const existing = get('SELECT id FROM products WHERE tenant_id = ? AND external_id = ?', tenantId, String(p.external_id));
  if (existing) {
    run(`UPDATE products SET title=?,description=?,price_cents=?,currency=?,category=?,images_json=?,garment_url=?,source='shopify' WHERE id=?`,
      p.title, p.description, p.price_cents, p.currency, p.category, JSON.stringify(p.images), p.images[0] || null, existing.id);
    return { updated: true };
  }
  run(`INSERT INTO products (tenant_id,external_id,title,description,price_cents,currency,category,images_json,garment_url,source,status)
       VALUES (?,?,?,?,?,?,?,?,?,'shopify','active')`,
    tenantId, String(p.external_id), p.title, p.description, p.price_cents, p.currency, p.category,
    JSON.stringify(p.images), p.images[0] || null);
  return { updated: false };
}

/**
 * Import via Shopify Admin REST API using a private/custom app access token.
 * shop = 'store.myshopify.com', token = 'shpat_...'
 */
export async function importFromShopifyApi({ tenantId, shop, token, importJobId, limit = 250 }) {
  const url = `https://${shop}/admin/api/${config.shopify.apiVersion}/products.json?limit=${limit}`;
  const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`Shopify API ${res.status}: ${await res.text()}`);
  const { products = [] } = await res.json();

  let imported = 0;
  for (const sp of products) {
    const variant = sp.variants?.[0] || {};
    const price = Math.round(parseFloat(variant.price || '0') * 100);
    const images = (sp.images || []).map((i) => i.src);
    insertProduct(tenantId, {
      external_id: sp.id,
      title: sp.title,
      description: (sp.body_html || '').replace(/<[^>]+>/g, '').trim().slice(0, 500),
      price_cents: price,
      currency: 'SAR',
      category: guessCategory(`${sp.product_type} ${sp.tags} ${sp.title}`),
      images,
    });
    imported++;
  }
  if (importJobId) {
    run("UPDATE import_jobs SET status='done', total=?, imported=?, log=? WHERE id=?",
      products.length, imported, `Imported ${imported} products from ${shop}`, importJobId);
  }
  return { total: products.length, imported };
}

// --- CSV import (Shopify "Export products" file) ---
export function parseCsv(text) {
  const rows = [];
  let cur = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { cur.push(field); field = ''; }
    else if (c === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
    else if (c === '\r') { /* skip */ }
    else field += c;
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  return rows;
}

export function importFromShopifyCsv({ tenantId, csvText, importJobId }) {
  const rows = parseCsv(csvText).filter((r) => r.length > 1);
  if (!rows.length) return { total: 0, imported: 0 };
  const header = rows[0].map((h) => h.trim());
  const idx = (name) => header.indexOf(name);
  const H = {
    handle: idx('Handle'), title: idx('Title'), body: idx('Body (HTML)'),
    type: idx('Type'), tags: idx('Tags'), price: idx('Variant Price'), image: idx('Image Src'),
  };

  // group rows by Handle (Shopify repeats handle for extra images/variants)
  const byHandle = new Map();
  for (const r of rows.slice(1)) {
    const handle = r[H.handle];
    if (!handle) continue;
    if (!byHandle.has(handle)) {
      byHandle.set(handle, {
        external_id: handle,
        title: r[H.title] || handle,
        description: (r[H.body] || '').replace(/<[^>]+>/g, '').trim().slice(0, 500),
        price_cents: Math.round(parseFloat(r[H.price] || '0') * 100),
        currency: 'SAR',
        category: guessCategory(`${r[H.type] || ''} ${r[H.tags] || ''} ${r[H.title] || ''}`),
        images: [],
      });
    }
    const prod = byHandle.get(handle);
    if (H.image >= 0 && r[H.image]) prod.images.push(r[H.image]);
    if (!prod.title && r[H.title]) prod.title = r[H.title];
  }

  let imported = 0;
  for (const prod of byHandle.values()) { insertProduct(tenantId, prod); imported++; }
  if (importJobId) {
    run("UPDATE import_jobs SET status='done', total=?, imported=?, log=? WHERE id=?",
      byHandle.size, imported, `Imported ${imported} products from CSV`, importJobId);
  }
  return { total: byHandle.size, imported };
}
