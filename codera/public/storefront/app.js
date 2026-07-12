// Codera storefront (visitor try-on)
const qs = new URLSearchParams(location.search);
const TENANT = qs.get('tenant'); // when testing on localhost; on a real domain it's implicit
const api = (p) => p + (p.includes('?') ? '&' : '?') + (TENANT ? 'tenant=' + encodeURIComponent(TENANT) : '');

function toast(msg, err) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast show' + (err ? ' err' : '');
  setTimeout(() => (t.className = 'toast'), 2600);
}
const money = (v, c) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: c || 'SAR', maximumFractionDigits: 0 }).format(v);

const State = { store: null, models: [], products: [], sel: { product: null, model: null, pose: 'بورتريه', hijab: false, shopper: null } };

async function boot() {
  let data;
  try {
    const r = await fetch(api('/api/store'));
    if (!r.ok) throw new Error('store');
    data = await r.json();
  } catch {
    document.getElementById('products').innerHTML = '<p class="muted">تعذّر تحميل المتجر. تأكدي من الرابط (?tenant=slug).</p>';
    return;
  }
  State.store = data.store; State.models = data.models; State.products = data.products;
  const b = data.store.brand || {};
  document.getElementById('brandName').textContent = data.store.name;
  document.getElementById('brandLogo').textContent = (data.store.name || 'C').trim().charAt(0);
  if (b.color) document.documentElement.style.setProperty('--gold', b.color);
  if (b.tagline) document.getElementById('heroTag').textContent = b.tagline;
  document.title = data.store.name + ' · Codera';
  renderProducts();
  // widget deep-link: auto-open a specific product's try-on
  const pid = Number(qs.get('product'));
  if (pid && State.products.some((p) => p.id === pid)) setTimeout(() => TryOn.open(pid), 200);
}

function renderProducts() {
  const el = document.getElementById('products');
  if (!State.products.length) { el.innerHTML = '<p class="muted">لا توجد منتجات بعد.</p>'; return; }
  el.innerHTML = State.products.map((p) => `
    <div class="card pcard" onclick="TryOn.open(${p.id})">
      <div class="img">${p.images[0] ? `<img src="${p.images[0]}" alt="">` : ''}</div>
      <div class="body"><div class="title">${esc(p.title)}</div><div class="price">${money(p.price, p.currency)}</div></div>
    </div>`).join('');
}

const esc = (s) => (s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

const TryOn = {
  open(id) {
    const p = State.products.find((x) => x.id === id); if (!p) return;
    State.sel = { product: p, model: State.models[0] || null, pose: 'بورتريه', hijab: false, shopper: null };
    document.getElementById('prodTitle').textContent = p.title;
    document.getElementById('prodPrice').textContent = money(p.price, p.currency);
    document.getElementById('garmentThumb').src = p.images[0] || '';
    document.getElementById('stagePh').textContent = 'اختاري موديل ثم اضغطي «جرّبيها الآن»';
    document.getElementById('stage').innerHTML = '<div class="placeholder" id="stagePh">اضغطي «جرّبيها الآن» لرؤية النتيجة</div>';
    document.getElementById('hijab').checked = false;
    this.renderModels(); this.renderPoses();
    document.getElementById('overlay').classList.add('show');
  },
  close() { document.getElementById('overlay').classList.remove('show'); },
  renderModels() {
    const el = document.getElementById('models');
    el.innerHTML = State.models.map((m) => `
      <div class="mcard ${State.sel.model && State.sel.model.id === m.id ? 'sel' : ''}" onclick="TryOn.pickModel(${m.id})">
        <div class="ph"><img src="${m.image_url}" alt=""></div>
        <div class="nm">${esc(m.name)}</div><div class="tag">${esc(m.ethnicity || '')}${m.hijab ? ' · محجّبة' : ''}</div>
      </div>`).join('');
  },
  renderPoses() {
    const poses = (State.sel.model && State.sel.model.poses) || ['بورتريه'];
    document.getElementById('poses').innerHTML = poses.map((p) =>
      `<span class="chip ${State.sel.pose === p ? 'on' : ''}" onclick="TryOn.pickPose('${p}')">${esc(p)}</span>`).join('');
  },
  pickModel(id) {
    State.sel.model = State.models.find((m) => m.id === id);
    State.sel.shopper = null;
    if (!State.sel.model.poses.includes(State.sel.pose)) State.sel.pose = State.sel.model.poses[0] || 'بورتريه';
    if (State.sel.model.hijab) document.getElementById('hijab').checked = true;
    this.renderModels(); this.renderPoses();
  },
  pickPose(p) { State.sel.pose = p; this.renderPoses(); },
  async generate() {
    const s = State.sel;
    if (!s.model && !s.shopper) return toast('اختاري موديل أو ارفعي صورتك', true);
    const stage = document.getElementById('stage');
    stage.innerHTML = '<div class="loading"><div class="spinner"></div><div class="muted">جاري توليد الصورة…</div></div>';
    document.getElementById('goBtn').disabled = true;
    try {
      const body = { productId: s.product.id, modelId: s.shopper ? null : (s.model && s.model.id), pose: s.pose, hijab: document.getElementById('hijab').checked, shopperPhoto: s.shopper };
      const r = await fetch(api('/api/tryon'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'فشل');
      await this.poll(data.jobId, stage);
    } catch (e) {
      stage.innerHTML = `<div class="placeholder">${esc(e.message)}</div>`;
      toast(e.message, true);
    } finally { document.getElementById('goBtn').disabled = false; }
  },
  async poll(jobId, stage) {
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 900));
      const r = await fetch(api('/api/tryon/' + jobId));
      const { job } = await r.json();
      if (job.status === 'done') { stage.innerHTML = `<img src="${job.result_url}" alt="">`; return; }
      if (job.status === 'failed') { stage.innerHTML = `<div class="placeholder">تعذّر التوليد: ${esc(job.error || '')}</div>`; return; }
    }
    stage.innerHTML = '<div class="placeholder">استغرق وقتاً أطول من المتوقع.</div>';
  },
};
window.TryOn = TryOn;

document.getElementById('shopper').addEventListener('change', (e) => {
  const f = e.target.files[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = () => { State.sel.shopper = reader.result; State.sel.model = null; TryOn.renderModels(); toast('تم اختيار صورتك — اضغطي «جرّبيها الآن»'); };
  reader.readAsDataURL(f);
});

boot();
