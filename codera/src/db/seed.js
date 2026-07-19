import fs from 'node:fs';
import path from 'node:path';
import { config } from '../lib/config.js';
import { db, initSchema, run, get } from './index.js';
import { hashPassword } from '../lib/crypto.js';
import { modelPortraitSVG, garmentSVG } from '../lib/svg.js';

initSchema();

const modelsDir = path.join(config.publicDir, 'assets', 'models');
const garmentsDir = path.join(config.publicDir, 'assets', 'garments');
fs.mkdirSync(modelsDir, { recursive: true });
fs.mkdirSync(garmentsDir, { recursive: true });

// ---------------- Plans ----------------
const plans = [
  { id: 'starter', name: 'المبتدئ', price_cents: 9900, currency: 'SAR', quota_month: 150, max_products: 50, max_models: 3, custom_domain: 0, features: ['تجربة لبس افتراضية', '٣ موديلات', 'دومين فرعي', 'دعم أساسي'], sort: 1 },
  { id: 'growth', name: 'النمو', price_cents: 29900, currency: 'SAR', quota_month: 800, max_products: 500, max_models: 8, custom_domain: 1, features: ['كل مزايا المبتدئ', '٨ موديلات + حجاب', 'دومين خاص', 'استيراد شوبيفاي', 'إحصائيات'], sort: 2 },
  { id: 'business', name: 'الأعمال', price_cents: 79900, currency: 'SAR', quota_month: 3000, max_products: 5000, max_models: 99, custom_domain: 1, features: ['كل مزايا النمو', 'موديلات غير محدودة', 'أولوية معالجة', 'API', 'دعم مخصص'], sort: 3 },
];
for (const p of plans) {
  run(`INSERT INTO plans (id,name,price_cents,currency,quota_month,max_products,max_models,custom_domain,features_json,sort)
       VALUES (?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, price_cents=excluded.price_cents,
       quota_month=excluded.quota_month, max_products=excluded.max_products, max_models=excluded.max_models,
       custom_domain=excluded.custom_domain, features_json=excluded.features_json, sort=excluded.sort`,
    p.id, p.name, p.price_cents, p.currency, p.quota_month, p.max_products, p.max_models, p.custom_domain,
    JSON.stringify(p.features), p.sort);
}

// ---------------- House models (Codera-owned) ----------------
const houseModels = [
  { name: 'ليلى', ethnicity: 'خليجي', skin_tone: 'حنطي', hair: 'شعر مموج', hijab: 0, poses: ['بورتريه', 'وقوف', 'جانبي'] },
  { name: 'نورة', ethnicity: 'خليجي', skin_tone: 'متوسط', hair: 'شعر أسود', hijab: 1, poses: ['بورتريه', 'وقوف'] },
  { name: 'سارة', ethnicity: 'خليجي', skin_tone: 'فاتح', hair: 'حجاب أنيق', hijab: 1, poses: ['بورتريه', 'وقوف', 'جانبي'] },
  { name: 'مايا', ethnicity: 'بشرة داكنة', skin_tone: 'داكن', hair: 'لفائف قصيرة', hijab: 0, poses: ['بورتريه', 'وقوف'] },
  { name: 'صوفيا', ethnicity: 'متوسطي', skin_tone: 'فاتح', hair: 'بني', hijab: 0, poses: ['بورتريه', 'جانبي'] },
  { name: 'مي', ethnicity: 'شرق آسيوي', skin_tone: 'فاتح', hair: 'أسود قصير', hijab: 0, poses: ['بورتريه'] },
];
const modelIds = [];
for (const m of houseModels) {
  const existing = get('SELECT id FROM house_models WHERE name = ?', m.name);
  let id;
  if (existing) {
    id = existing.id;
    run('UPDATE house_models SET ethnicity=?,skin_tone=?,hair=?,hijab=?,poses_json=? WHERE id=?',
      m.ethnicity, m.skin_tone, m.hair, m.hijab, JSON.stringify(m.poses), id);
  } else {
    const r = run('INSERT INTO house_models (name,ethnicity,skin_tone,hair,hijab,poses_json,active) VALUES (?,?,?,?,?,?,1)',
      m.name, m.ethnicity, m.skin_tone, m.hair, m.hijab, JSON.stringify(m.poses));
    id = r.lastInsertRowid;
  }
  // two variants per model: base (no hijab) and hijab
  fs.writeFileSync(path.join(modelsDir, `${id}.svg`), modelPortraitSVG({ ...m, hijab: 0 }));
  fs.writeFileSync(path.join(modelsDir, `${id}_hijab.svg`), modelPortraitSVG({ ...m, hijab: 1 }));
  run('UPDATE house_models SET image_url=?, image_hijab_url=? WHERE id=?',
    `/assets/models/${id}.svg`, `/assets/models/${id}_hijab.svg`, id);
  modelIds.push(id);
}

// ---------------- Demo tenant ----------------
let tenant = get("SELECT * FROM tenants WHERE slug = 'noor'");
if (!tenant) {
  const brand = { name: 'نور بوتيك', color: '#c9a24a', currency: 'SAR', lang: 'ar', rtl: true, tagline: 'أناقة معاصرة' };
  const r = run(`INSERT INTO tenants (name,slug,custom_domain,plan_id,status,brand_json)
                 VALUES (?,?,?,?,?,?)`,
    'نور بوتيك', 'noor', null, 'growth', 'active', JSON.stringify(brand));
  const tenantId = r.lastInsertRowid;
  run(`INSERT INTO subscriptions (tenant_id,plan_id,status,provider,period_start,period_end)
       VALUES (?,?,?,?,date('now'),date('now','+30 day'))`, tenantId, 'growth', 'active', 'manual');
  run('INSERT INTO users (tenant_id,email,password,name,role) VALUES (?,?,?,?,?)',
    tenantId, 'demo@noor.sa', hashPassword('demo1234'), 'صاحبة المتجر', 'owner');
  // enable first 4 models for this tenant
  for (const mid of modelIds.slice(0, 4)) {
    run('INSERT OR IGNORE INTO tenant_models (tenant_id,model_id,enabled) VALUES (?,?,1)', tenantId, mid);
  }
  // sample clothing products
  const products = [
    { title: 'عباية كلاسيك أسود', category: 'abaya', price: 39900, color: '#22242a', desc: 'عباية كلاسيكية بقصّة انسيابية.' },
    { title: 'فستان سهرة زمردي', category: 'dress', price: 54900, color: '#1f6f5c', desc: 'فستان سهرة بلون زمردي فاخر.' },
    { title: 'بلوزة حرير وردية', category: 'top', price: 18900, color: '#d98ca6', desc: 'بلوزة حرير ناعمة بلمسة راقية.' },
    { title: 'بنطال واسع بيج', category: 'bottom', price: 21900, color: '#cbb48f', desc: 'بنطال واسع مريح بخامة فاخرة.' },
    { title: 'شال كشمير ذهبي', category: 'accessory', price: 12900, color: '#c9a24a', desc: 'شال كشمير بلمسة ذهبية دافئة.' },
    { title: 'فستان ميدي كحلي', category: 'dress', price: 32900, color: '#2b3a67', desc: 'فستان ميدي عملي وأنيق.' },
  ];
  products.forEach((p, i) => {
    const pr = run(`INSERT INTO products (tenant_id,title,description,price_cents,currency,category,images_json,garment_url,source,status)
                    VALUES (?,?,?,?,?,?,?,?,?,'active')`,
      tenantId, p.title, p.desc, p.price, 'SAR', p.category, '[]', `/assets/garments/${tenantId}_${i}.svg`, 'seed');
    const file = path.join(garmentsDir, `${tenantId}_${i}.svg`);
    fs.writeFileSync(file, garmentSVG(p.title, p.category, p.color));
    const imgs = JSON.stringify([`/assets/garments/${tenantId}_${i}.svg`]);
    run('UPDATE products SET images_json=? WHERE id=?', imgs, pr.lastInsertRowid);
  });
  console.log(`Seeded demo tenant 'noor' (id=${tenantId}) with ${products.length} products.`);
}

// ---------------- Platform admin ----------------
if (!get("SELECT id FROM platform_admins WHERE email = 'admin@codera.app'")) {
  run('INSERT INTO platform_admins (email,password,name) VALUES (?,?,?)',
    'admin@codera.app', hashPassword('admin1234'), 'Codera Admin');
}

console.log('Seed complete.');
console.log('  Merchant login : demo@noor.sa / demo1234   (dashboard)');
console.log('  Platform admin : admin@codera.app / admin1234');
db.close();
