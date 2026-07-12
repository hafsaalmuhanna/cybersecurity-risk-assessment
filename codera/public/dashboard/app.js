// Codera merchant dashboard
const $ = (id) => document.getElementById(id);
const esc = (s) => (s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
function toast(m, err) { const t = $('toast'); t.textContent = m; t.className = 'toast show' + (err ? ' err' : ''); setTimeout(() => (t.className = 'toast'), 2800); }
async function jfetch(url, opts) {
  const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'خطأ');
  return data;
}
const money = (v, c) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: c || 'SAR', maximumFractionDigits: 0 }).format(v);
const fileToDataUrl = (f) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });

let ME = null;

const Auth = {
  tab(which) {
    $('tabLogin').classList.toggle('on', which === 'login');
    $('tabReg').classList.toggle('on', which === 'register');
    $('loginForm').style.display = which === 'login' ? 'block' : 'none';
    $('regForm').style.display = which === 'register' ? 'block' : 'none';
  },
  async login() {
    try { await jfetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: $('li_email').value, password: $('li_pass').value }) }); location.reload(); }
    catch (e) { toast(e.message, true); }
  },
  async register() {
    try {
      await jfetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ storeName: $('r_store').value, slug: $('r_slug').value, email: $('r_email').value, password: $('r_pass').value, plan: 'starter' }) });
      location.reload();
    } catch (e) { toast(e.message, true); }
  },
  async logout() { await fetch('/api/auth/logout', { method: 'POST' }); location.reload(); },
};
window.Auth = Auth;

const Nav = {
  go(v) {
    document.querySelectorAll('.navlink').forEach((n) => n.classList.toggle('on', n.dataset.v === v));
    document.querySelectorAll('.view').forEach((s) => s.classList.remove('on'));
    $('v_' + v).classList.add('on');
    location.hash = '#/' + v;
    if (v === 'products') Products.load();
    if (v === 'models') Models.load();
    if (v === 'import') Import.loadJobs();
    if (v === 'billing') Billing.load();
    if (v === 'overview') Overview.load();
    if (v === 'settings') Settings.fill();
  },
};
window.Nav = Nav;

const Overview = {
  async load() {
    const s = await jfetch('/api/stats');
    $('stats').innerHTML = `
      ${stat(s.products, 'منتجات')}${stat(s.models, 'موديلات مفعّلة')}
      ${stat(s.tryonsDone, 'تجارب ناجحة')}
      ${statQuota(s.quota)}`;
    $('planChip').textContent = 'باقة: ' + (ME.plan ? ME.plan.name : '—');
    $('recentTryons').innerHTML = (s.recent || []).filter((j) => j.result_url).map((j) =>
      `<div class="card pitem"><div class="img"><img src="${j.result_url}"></div><div class="b muted" style="font-size:12px">${esc(j.pose || '')}</div></div>`).join('') || '<p class="muted">لا توجد تجارب بعد.</p>';
  },
};
function stat(n, l) { return `<div class="card stat"><div class="n">${n}</div><div class="l">${l}</div></div>`; }
function statQuota(q) {
  const pct = q.quota ? Math.min(100, Math.round((q.used / q.quota) * 100)) : 0;
  return `<div class="card stat"><div class="n">${q.used}<span style="font-size:15px;color:var(--muted)">/${q.quota}</span></div><div class="l">توليد هذا الشهر</div><div class="bar"><i style="width:${pct}%"></i></div></div>`;
}

const Products = {
  editing: null, pendingImg: null,
  async load() {
    const { products } = await jfetch('/api/products');
    $('products').innerHTML = products.map((p) => `
      <div class="card pitem">
        <div class="img">${p.images[0] ? `<img src="${p.images[0]}">` : ''}</div>
        <div class="b"><div style="font-weight:700;font-size:14px">${esc(p.title)}</div>
          <div class="gold" style="font-weight:800;font-size:13px">${money(p.price, p.currency)}</div>
          <div class="row" style="margin-top:8px;gap:6px">
            <button class="btn ghost sm" onclick='Products.edit(${JSON.stringify(p).replace(/'/g, "&#39;")})'>تعديل</button>
            <button class="btn ghost sm" onclick="Products.del(${p.id})">حذف</button>
          </div></div></div>`).join('') || '<p class="muted">لا توجد منتجات. أضيفي منتج أو استوردي من شوبيفاي.</p>';
  },
  openNew() { this.editing = null; this.pendingImg = null; $('pm_title').textContent = 'منتج جديد'; $('pm_name').value = ''; $('pm_desc').value = ''; $('pm_price').value = ''; $('pm_cat').value = 'top'; $('pm_preview').style.display = 'none'; $('prodModal').classList.add('show'); },
  edit(p) { this.editing = p.id; this.pendingImg = null; $('pm_title').textContent = 'تعديل منتج'; $('pm_name').value = p.title; $('pm_desc').value = p.description || ''; $('pm_price').value = p.price; $('pm_cat').value = p.category || 'top'; const pv = $('pm_preview'); if (p.images[0]) { pv.src = p.images[0]; pv.style.display = 'block'; } else pv.style.display = 'none'; $('prodModal').classList.add('show'); },
  close() { $('prodModal').classList.remove('show'); },
  async save() {
    const body = { title: $('pm_name').value, description: $('pm_desc').value, price: Number($('pm_price').value || 0), category: $('pm_cat').value };
    if (this.pendingImg) body.garmentImage = this.pendingImg;
    try {
      if (this.editing) await jfetch('/api/products/' + this.editing, { method: 'PATCH', body: JSON.stringify(body) });
      else await jfetch('/api/products', { method: 'POST', body: JSON.stringify(body) });
      this.close(); toast('تم الحفظ'); this.load();
    } catch (e) { toast(e.message, true); }
  },
  async del(id) { if (!confirm('حذف المنتج؟')) return; await jfetch('/api/products/' + id, { method: 'DELETE' }); this.load(); },
};
window.Products = Products;
$('pm_img').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; Products.pendingImg = await fileToDataUrl(f); const pv = $('pm_preview'); pv.src = Products.pendingImg; pv.style.display = 'block'; });

const Models = {
  async load() {
    const { models } = await jfetch('/api/models');
    const on = models.filter((m) => m.enabled).length;
    $('modelsHint').textContent = `${on} مفعّلة من ${models.length} · الحد ${ME.plan ? ME.plan.max_models : '-'}`;
    $('models').innerHTML = models.map((m) => `
      <div class="card mitem">
        <div class="img"><img src="${m.image_url}"></div>
        <div style="padding:10px 8px 0"><b>${esc(m.name)}</b><div class="muted" style="font-size:12px">${esc(m.ethnicity || '')}${m.hijab ? ' · محجّبة' : ''}</div></div>
        <button class="btn ${m.enabled ? 'ghost' : ''} sm" style="margin-top:10px" onclick="Models.toggle(${m.id})">${m.enabled ? 'إيقاف' : 'تفعيل'}</button>
      </div>`).join('');
  },
  async toggle(id) { try { await jfetch('/api/models/' + id + '/toggle', { method: 'POST' }); this.load(); } catch (e) { toast(e.message, true); } },
};
window.Models = Models;

const Import = {
  async shopify() {
    const shop = $('sh_shop').value.trim(), token = $('sh_token').value.trim();
    if (!shop || !token) return toast('أدخلي النطاق والتوكن', true);
    toast('جاري الاستيراد…');
    try { const r = await jfetch('/api/import/shopify', { method: 'POST', body: JSON.stringify({ shop, token }) }); toast(`تم استيراد ${r.imported} منتج`); this.loadJobs(); } catch (e) { toast(e.message, true); }
  },
  async csv() {
    const f = $('sh_csv').files[0]; if (!f) return toast('اختاري ملف CSV', true);
    const text = await f.text();
    try { const r = await jfetch('/api/import/csv', { method: 'POST', body: JSON.stringify({ csv: text }) }); toast(`تم استيراد ${r.imported} منتج`); this.loadJobs(); } catch (e) { toast(e.message, true); }
  },
  async loadJobs() {
    const { jobs } = await jfetch('/api/import/jobs');
    $('importJobs').innerHTML = jobs.length ? `<table><tr><th>المصدر</th><th>الحالة</th><th>مستورد</th><th>التاريخ</th></tr>${jobs.map((j) => `<tr><td>${j.source}</td><td>${j.status}</td><td>${j.imported}/${j.total}</td><td class="muted">${j.created_at}</td></tr>`).join('')}</table>` : '<p class="muted">لا يوجد استيراد بعد.</p>';
  },
};
window.Import = Import;

const Billing = {
  async load() {
    const b = await jfetch('/api/billing');
    $('billStatus').textContent = 'الحالة: ' + b.status;
    $('billing').innerHTML = `<div class="pricing" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px">
      ${b.plans.map((p) => `
        <div class="card" style="padding:22px;${b.current && b.current.id === p.id ? 'border-color:var(--gold)' : ''}">
          <b style="font-size:18px">${p.name}</b>
          <div style="font-size:30px;font-weight:900;color:var(--gold-2);margin:6px 0">${p.price} <span style="font-size:13px;color:var(--muted)">${p.currency}/شهر</span></div>
          <ul style="list-style:none;padding:0;margin:12px 0;font-size:13px">${p.features.map((f) => `<li style="padding:5px 0;border-bottom:1px dashed var(--line)">✦ ${esc(f)}</li>`).join('')}<li style="padding:5px 0">${p.quota_month} توليد/شهر</li></ul>
          ${b.current && b.current.id === p.id ? '<div class="chip on block" style="justify-content:center">باقتك الحالية</div>' : `<button class="btn block" onclick="Billing.subscribe('${p.id}')">اشتراك</button>`}
        </div>`).join('')}</div>`;
  },
  async subscribe(plan) {
    try { const r = await jfetch('/api/billing/subscribe', { method: 'POST', body: JSON.stringify({ plan }) }); location.href = r.checkoutUrl; } catch (e) { toast(e.message, true); }
  },
};
window.Billing = Billing;

const Settings = {
  fill() { const b = ME.tenant.brand || {}; $('set_name').value = ME.tenant.name || ''; $('set_color').value = b.color || '#c9a24a'; $('set_tag').value = b.tagline || ''; $('set_domain').value = ME.tenant.custom_domain || ''; },
  async save() {
    const brand = Object.assign({}, ME.tenant.brand, { name: $('set_name').value, color: $('set_color').value, tagline: $('set_tag').value });
    try { await jfetch('/api/brand', { method: 'PATCH', body: JSON.stringify({ brand, custom_domain: $('set_domain').value }) }); toast('تم الحفظ'); await refreshMe(); } catch (e) { toast(e.message, true); }
  },
};
window.Settings = Settings;

async function refreshMe() {
  ME = await jfetch('/api/me');
  $('storeName').textContent = ME.tenant.name;
  const url = '/store?tenant=' + ME.tenant.slug;
  $('viewStore').href = url;
}

async function boot() {
  try { await refreshMe(); } catch { $('authWrap').style.display = 'grid'; if (location.hash.includes('register')) Auth.tab('register'); return; }
  $('authWrap').style.display = 'none';
  $('app').classList.add('show');
  const v = (location.hash.replace('#/', '') || 'overview').split('?')[0];
  Nav.go(['overview', 'products', 'models', 'import', 'billing', 'settings'].includes(v) ? v : 'overview');
  if (location.search.includes('paid=1') || location.hash.includes('paid=1')) toast('تم تفعيل الاشتراك ✓');
}
boot();
