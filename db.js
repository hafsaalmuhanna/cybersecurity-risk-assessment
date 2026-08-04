'use strict';

// قاعدة البيانات — تعتمد على SQLite المدمجة في Node.js (node:sqlite)
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(path.join(DATA_DIR, 'registrations.db'));

// تفعيل المفاتيح الخارجية والكتابة المتقدمة
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// جدول المشتركات
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name         TEXT    NOT NULL,
    age               INTEGER,
    civil_id          TEXT,
    phone             TEXT    NOT NULL,
    address           TEXT,
    memorized_count   INTEGER,
    memorized_surahs  TEXT,
    target_parts      TEXT,
    previous_circle   TEXT,
    recitation_level  TEXT,
    suitable_times    TEXT,
    notes             TEXT,
    status            TEXT    NOT NULL DEFAULT 'جديدة',
    created_at        TEXT    NOT NULL
  );
`);

// جدول الرسائل المُرسَلة/المجدولة
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT,
    body        TEXT    NOT NULL,
    days        TEXT,
    time        TEXT,
    audience    TEXT    NOT NULL DEFAULT 'الكل',
    created_at  TEXT    NOT NULL
  );
`);

module.exports = { db };
