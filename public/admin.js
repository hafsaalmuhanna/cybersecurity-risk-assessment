'use strict';

const TOKEN_KEY = 'quran_admin_token';
let token = localStorage.getItem(TOKEN_KEY) || null;
let allRegistrations = [];

// ————— أدوات مساعدة —————
function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${token}`, ...extra };
}

async function api(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: authHeaders(opts.headers || {}) });
  if (res.status === 401) {
    logout();
    throw new Error('انتهت الجلسة، يرجى تسجيل الدخول من جديد.');
  }
  return res;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function levelBadge(level) {
  const cls = ['مبتدئ', 'متوسط', 'متقدم'].includes(level) ? `lvl-${level}` : 'lvl-none';
  return `<span class="badge-level ${cls}">${esc(level || '—')}</span>`;
}

// تنظيف رقم الهاتف لرابط واتساب
function waNumber(phone) {
  let d = String(phone || '').replace(/[^\d]/g, '');
  d = d.replace(/^0+/, '');
  return d;
}

// ————— تسجيل الدخول —————
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');
  const password = document.getElementById('password').value;
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const out = await res.json();
    if (!res.ok || !out.ok) throw new Error(out.error || 'فشل الدخول.');
    token = out.token;
    localStorage.setItem(TOKEN_KEY, token);
    showDashboard();
  } catch (err) {
    loginError.textContent = err.message;
    loginError.classList.remove('hidden');
  }
});

function logout() {
  token = null;
  localStorage.removeItem(TOKEN_KEY);
  document.getElementById('dashView').classList.add('hidden');
  document.getElementById('loginView').classList.remove('hidden');
}

document.getElementById('logoutBtn').addEventListener('click', logout);

// ————— اللوحة —————
function showDashboard() {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('dashView').classList.remove('hidden');
  loadRegistrations();
  loadStats();
  loadMessages();
}

// التبويبات
document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    const tab = t.dataset.tab;
    document.getElementById('tab-regs').classList.toggle('hidden', tab !== 'regs');
    document.getElementById('tab-messages').classList.toggle('hidden', tab !== 'messages');
  });
});

// ————— المشتركات —————
async function loadRegistrations() {
  try {
    const res = await api('/api/registrations');
    const out = await res.json();
    allRegistrations = out.registrations || [];
    renderRegistrations(allRegistrations);
  } catch (err) {
    alert(err.message);
  }
}

function renderRegistrations(list) {
  const body = document.getElementById('regsBody');
  const empty = document.getElementById('emptyRegs');
  body.innerHTML = '';
  empty.classList.toggle('hidden', list.length > 0);

  const statuses = ['جديدة', 'مقبولة', 'بانتظار', 'معتذرة'];

  for (const r of list) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id}</td>
      <td class="name-cell" data-id="${r.id}">${esc(r.full_name)}</td>
      <td>${esc(r.age ?? '—')}</td>
      <td>${esc(r.phone)}</td>
      <td>${esc(r.memorized_count ?? '—')}</td>
      <td>${levelBadge(r.recitation_level)}</td>
      <td>${esc(r.suitable_times || '—')}</td>
      <td>
        <select class="status-select" data-id="${r.id}">
          ${statuses.map((s) => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>
        <div class="row-actions">
          <a class="icon-btn wa" href="https://wa.me/${waNumber(r.phone)}" target="_blank" rel="noopener">واتساب</a>
          <button class="icon-btn del" data-id="${r.id}">حذف</button>
        </div>
      </td>
    `;
    body.appendChild(tr);
  }

  // فتح التفاصيل
  body.querySelectorAll('.name-cell').forEach((el) => {
    el.addEventListener('click', () => openDetail(Number(el.dataset.id)));
  });
  // تغيير الحالة
  body.querySelectorAll('.status-select').forEach((sel) => {
    sel.addEventListener('change', async () => {
      await api(`/api/registrations/${sel.dataset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: sel.value }),
      });
      const r = allRegistrations.find((x) => x.id === Number(sel.dataset.id));
      if (r) r.status = sel.value;
    });
  });
  // حذف
  body.querySelectorAll('.icon-btn.del').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('هل تريدين حذف هذه المشتركة نهائيًا؟')) return;
      await api(`/api/registrations/${btn.dataset.id}`, { method: 'DELETE' });
      loadRegistrations();
      loadStats();
    });
  });
}

// البحث
document.getElementById('searchBox').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = allRegistrations.filter((r) =>
    (r.full_name || '').toLowerCase().includes(q) ||
    (r.phone || '').toLowerCase().includes(q));
  renderRegistrations(filtered);
});

document.getElementById('refreshBtn').addEventListener('click', () => {
  loadRegistrations();
  loadStats();
});

// التصدير
document.getElementById('exportBtn').addEventListener('click', () => {
  window.open(`/api/export?token=${encodeURIComponent(token)}`, '_blank');
});

// ————— الإحصائيات —————
async function loadStats() {
  try {
    const res = await api('/api/stats');
    const out = await res.json();
    const levels = {};
    (out.byLevel || []).forEach((x) => { levels[x.level || 'غير محدد'] = x.c; });
    const el = document.getElementById('stats');
    el.innerHTML = `
      <div class="stat-card"><div class="num">${out.total}</div><div class="lbl">إجمالي المشتركات</div></div>
      <div class="stat-card"><div class="num">${levels['مبتدئ'] || 0}</div><div class="lbl">مبتدئ</div></div>
      <div class="stat-card"><div class="num">${levels['متوسط'] || 0}</div><div class="lbl">متوسط</div></div>
      <div class="stat-card"><div class="num">${levels['متقدم'] || 0}</div><div class="lbl">متقدم</div></div>
    `;
  } catch (err) { /* تجاهل */ }
}

// ————— نافذة التفاصيل —————
function openDetail(id) {
  const r = allRegistrations.find((x) => x.id === id);
  if (!r) return;
  document.getElementById('detailName').textContent = r.full_name;
  const rows = [
    ['العمر', r.age],
    ['الرقم المدني', r.civil_id],
    ['رقم الهاتف', r.phone],
    ['عنوان السكن', r.address],
    ['عدد الأجزاء المحفوظة', r.memorized_count],
    ['السور/الأجزاء المحفوظة', r.memorized_surahs],
    ['الأجزاء المراد الاشتراك بها', r.target_parts],
    ['سبق الالتحاق بحلقة', r.previous_circle],
    ['مستوى التلاوة', r.recitation_level],
    ['الأوقات المناسبة', r.suitable_times],
    ['ملاحظات', r.notes],
    ['الحالة', r.status],
    ['تاريخ التسجيل', r.created_at ? new Date(r.created_at).toLocaleString('ar-EG') : ''],
  ];
  document.getElementById('detailBody').innerHTML = rows.map(([k, v]) =>
    `<div class="detail-item"><div class="k">${k}</div><div class="v">${esc(v || '—')}</div></div>`).join('');
  document.getElementById('detailModal').classList.remove('hidden');
}

document.getElementById('modalClose').addEventListener('click', () =>
  document.getElementById('detailModal').classList.add('hidden'));
document.getElementById('detailModal').addEventListener('click', (e) => {
  if (e.target.id === 'detailModal') e.target.classList.add('hidden');
});

// ————— الرسائل —————
function composeText() {
  const title = document.getElementById('msgTitle').value.trim();
  const body = document.getElementById('msgBody').value.trim();
  const days = document.getElementById('msgDays').value.trim();
  const time = document.getElementById('msgTime').value.trim();
  let text = '';
  if (title) text += `*${title}*\n\n`;
  text += body;
  if (days || time) {
    text += '\n\n📅 مواعيد الحلقة:';
    if (days) text += `\nالأيام: ${days}`;
    if (time) text += `\nالوقت: ${time}`;
  }
  return text;
}

document.getElementById('insertTemplateBtn').addEventListener('click', () => {
  document.getElementById('msgTitle').value = 'تذكير بموعد الحلقة';
  document.getElementById('msgBody').value =
    'السلام عليكم ورحمة الله وبركاته،\nنذكّركنّ بموعد حلقة تحفيظ القرآن الكريم. نسأل الله لكنّ التوفيق والسداد.';
  document.getElementById('msgDays').value = 'السبت والاثنين والأربعاء';
  document.getElementById('msgTime').value = 'بعد صلاة العصر';
});

document.getElementById('prepareMsgBtn').addEventListener('click', async () => {
  const body = document.getElementById('msgBody').value.trim();
  if (!body) { alert('يرجى كتابة نص الرسالة.'); return; }

  const audience = document.getElementById('msgAudience').value;
  const days = document.getElementById('msgDays').value.trim();
  const time = document.getElementById('msgTime').value.trim();
  const title = document.getElementById('msgTitle').value.trim();
  const text = composeText();

  // حفظ الرسالة في السجل
  try {
    await api('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, days, time, audience }),
    });
  } catch (err) { alert(err.message); return; }

  // تحديد المستهدفات
  let recipients = allRegistrations;
  if (audience !== 'الكل') {
    recipients = allRegistrations.filter((r) => r.recitation_level === audience);
  }

  const sendList = document.getElementById('sendList');
  const linksEl = document.getElementById('recipientLinks');
  document.getElementById('sendListCount').textContent =
    `عدد المستهدفات: ${recipients.length} — اضغطي "إرسال" أمام كل اسم لفتح واتساب.`;

  if (recipients.length === 0) {
    linksEl.innerHTML = '<p class="empty">لا توجد مشتركات مطابقات لهذه الفئة.</p>';
  } else {
    linksEl.innerHTML = recipients.map((r) => `
      <div class="recipient-chip">
        <div>
          <div class="r-name">${esc(r.full_name)}</div>
          <div class="r-phone">${esc(r.phone)}</div>
        </div>
        <a class="wa-link" target="_blank" rel="noopener"
           href="https://wa.me/${waNumber(r.phone)}?text=${encodeURIComponent(text)}">إرسال</a>
      </div>
    `).join('');
  }

  sendList.classList.remove('hidden');
  sendList.scrollIntoView({ behavior: 'smooth' });
  loadMessages();
});

async function loadMessages() {
  try {
    const res = await api('/api/messages');
    const out = await res.json();
    const el = document.getElementById('messagesLog');
    const msgs = out.messages || [];
    if (msgs.length === 0) {
      el.innerHTML = '<p class="empty">لا توجد رسائل محفوظة بعد.</p>';
      return;
    }
    el.innerHTML = msgs.map((m) => {
      const sched = [];
      if (m.days) sched.push(`الأيام: ${esc(m.days)}`);
      if (m.time) sched.push(`الوقت: ${esc(m.time)}`);
      return `
        <div class="log-item">
          <div class="log-head">
            <span class="log-title">${esc(m.title || 'رسالة')}</span>
            <span class="log-meta">${new Date(m.created_at).toLocaleString('ar-EG')} · ${esc(m.audience)}</span>
          </div>
          <div class="log-body">${esc(m.body)}</div>
          ${sched.length ? `<div class="log-schedule">📅 ${sched.join(' · ')}</div>` : ''}
          <button class="icon-btn del" style="margin-top:8px;" data-msg="${m.id}">حذف</button>
        </div>`;
    }).join('');
    el.querySelectorAll('.icon-btn.del').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('حذف هذه الرسالة من السجل؟')) return;
        await api(`/api/messages/${btn.dataset.msg}`, { method: 'DELETE' });
        loadMessages();
      });
    });
  } catch (err) { /* تجاهل */ }
}

// ————— بدء التشغيل —————
if (token) {
  showDashboard();
}
