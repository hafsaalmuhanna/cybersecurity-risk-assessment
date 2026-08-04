'use strict';

const express = require('express');
const path = require('node:path');
const crypto = require('node:crypto');
const ExcelJS = require('exceljs');
const { db } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// كلمة مرور لوحة الإدارة (يمكن تغييرها عبر متغيّر البيئة ADMIN_PASSWORD)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'hafsa2026';
// الرمز السري لتوقيع جلسة الدخول
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ————————————————————————————————————————————————
// أدوات المصادقة (توكن بسيط موقّع)
// ————————————————————————————————————————————————
function makeToken() {
  const payload = `admin.${Date.now()}`;
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const idx = token.lastIndexOf('.');
  if (idx === -1) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : req.query.token;
  if (!verifyToken(token)) {
    return res.status(401).json({ ok: false, error: 'غير مصرّح. يرجى تسجيل الدخول.' });
  }
  next();
}

// ————————————————————————————————————————————————
// التسجيل العام
// ————————————————————————————————————————————————
app.post('/api/register', (req, res) => {
  const b = req.body || {};
  const fullName = (b.full_name || '').trim();
  const phone = (b.phone || '').trim();

  if (!fullName) {
    return res.status(400).json({ ok: false, error: 'الاسم الكامل مطلوب.' });
  }
  if (!phone) {
    return res.status(400).json({ ok: false, error: 'رقم الهاتف مطلوب.' });
  }

  const ageNum = b.age ? parseInt(b.age, 10) : null;
  const countNum = b.memorized_count !== '' && b.memorized_count != null
    ? parseInt(b.memorized_count, 10)
    : null;

  const stmt = db.prepare(`
    INSERT INTO registrations
      (full_name, age, civil_id, phone, address, memorized_count,
       memorized_surahs, target_parts, previous_circle, recitation_level,
       suitable_times, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    fullName,
    Number.isFinite(ageNum) ? ageNum : null,
    (b.civil_id || '').trim() || null,
    phone,
    (b.address || '').trim() || null,
    Number.isFinite(countNum) ? countNum : null,
    (b.memorized_surahs || '').trim() || null,
    (b.target_parts || '').trim() || null,
    (b.previous_circle || '').trim() || null,
    (b.recitation_level || '').trim() || null,
    (b.suitable_times || '').trim() || null,
    (b.notes || '').trim() || null,
    new Date().toISOString()
  );

  res.json({ ok: true, id: Number(result.lastInsertRowid) });
});

// ————————————————————————————————————————————————
// تسجيل دخول الإدارة
// ————————————————————————————————————————————————
app.post('/api/login', (req, res) => {
  const password = (req.body && req.body.password) || '';
  const a = Buffer.from(String(password));
  const bpw = Buffer.from(ADMIN_PASSWORD);
  const match = a.length === bpw.length && crypto.timingSafeEqual(a, bpw);
  if (!match) {
    return res.status(401).json({ ok: false, error: 'كلمة المرور غير صحيحة.' });
  }
  res.json({ ok: true, token: makeToken() });
});

// ————————————————————————————————————————————————
// قائمة المشتركات (إدارة)
// ————————————————————————————————————————————————
app.get('/api/registrations', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM registrations ORDER BY id DESC').all();
  res.json({ ok: true, count: rows.length, registrations: rows });
});

// تحديث حالة مشتركة (جديدة / مقبولة / بانتظار)
app.patch('/api/registrations/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const status = (req.body && req.body.status) || null;
  if (!status) return res.status(400).json({ ok: false, error: 'الحالة مطلوبة.' });
  db.prepare('UPDATE registrations SET status = ? WHERE id = ?').run(status, id);
  res.json({ ok: true });
});

// حذف مشتركة
app.delete('/api/registrations/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM registrations WHERE id = ?').run(id);
  res.json({ ok: true });
});

// ————————————————————————————————————————————————
// تصدير Excel
// ————————————————————————————————————————————————
app.get('/api/export', requireAdmin, async (req, res) => {
  const rows = db.prepare('SELECT * FROM registrations ORDER BY id ASC').all();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'حلقة تحفيظ القرآن الكريم';
  wb.created = new Date();
  const ws = wb.addWorksheet('المشتركات', {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: '#', key: 'id', width: 6 },
    { header: 'الاسم الكامل', key: 'full_name', width: 26 },
    { header: 'العمر', key: 'age', width: 8 },
    { header: 'الرقم المدني', key: 'civil_id', width: 18 },
    { header: 'رقم الهاتف', key: 'phone', width: 16 },
    { header: 'عنوان السكن', key: 'address', width: 24 },
    { header: 'الأجزاء المحفوظة', key: 'memorized_count', width: 14 },
    { header: 'السور/الأجزاء المحفوظة', key: 'memorized_surahs', width: 26 },
    { header: 'الأجزاء المراد الاشتراك بها', key: 'target_parts', width: 24 },
    { header: 'سبق الالتحاق بحلقة', key: 'previous_circle', width: 16 },
    { header: 'مستوى التلاوة', key: 'recitation_level', width: 14 },
    { header: 'الأوقات المناسبة', key: 'suitable_times', width: 22 },
    { header: 'ملاحظات', key: 'notes', width: 30 },
    { header: 'الحالة', key: 'status', width: 12 },
    { header: 'تاريخ التسجيل', key: 'created_at', width: 22 },
  ];

  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  header.alignment = { vertical: 'middle', horizontal: 'center' };
  header.height = 26;
  header.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F7A4D' } };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
  });

  for (const r of rows) {
    ws.addRow({
      ...r,
      created_at: new Date(r.created_at).toLocaleString('ar-EG'),
    });
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="registrations-${Date.now()}.xlsx"`
  );
  await wb.xlsx.write(res);
  res.end();
});

// ————————————————————————————————————————————————
// الرسائل
// ————————————————————————————————————————————————
app.get('/api/messages', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM messages ORDER BY id DESC').all();
  res.json({ ok: true, messages: rows });
});

app.post('/api/messages', requireAdmin, (req, res) => {
  const b = req.body || {};
  const body = (b.body || '').trim();
  if (!body) return res.status(400).json({ ok: false, error: 'نص الرسالة مطلوب.' });
  const stmt = db.prepare(`
    INSERT INTO messages (title, body, days, time, audience, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    (b.title || '').trim() || null,
    body,
    (b.days || '').trim() || null,
    (b.time || '').trim() || null,
    (b.audience || 'الكل').trim(),
    new Date().toISOString()
  );
  res.json({ ok: true, id: Number(result.lastInsertRowid) });
});

app.delete('/api/messages/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM messages WHERE id = ?').run(id);
  res.json({ ok: true });
});

// إحصائيات سريعة
app.get('/api/stats', requireAdmin, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS c FROM registrations').get().c;
  const byLevel = db.prepare(
    'SELECT recitation_level AS level, COUNT(*) AS c FROM registrations GROUP BY recitation_level'
  ).all();
  res.json({ ok: true, total, byLevel });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`\n  حلقة تحفيظ القرآن الكريم — الخادم يعمل`);
  console.log(`  التسجيل:      http://localhost:${PORT}/`);
  console.log(`  لوحة الإدارة: http://localhost:${PORT}/admin`);
  console.log(`  كلمة مرور الإدارة الافتراضية: ${ADMIN_PASSWORD}\n`);
});
