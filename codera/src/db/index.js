import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../lib/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

fs.mkdirSync(config.dataDir, { recursive: true });
const dbPath = path.join(config.dataDir, 'codera.db');

export const db = new DatabaseSync(dbPath);

export function initSchema() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  runMigrations();
}

// Idempotent, additive migrations (safe to run on every boot).
function runMigrations() {
  const cols = (table) => db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  const addColumn = (table, col, def) => {
    if (!cols(table).includes(col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${def}`);
  };
  // hijab variant image per model (base image + a hijab version)
  addColumn('house_models', 'image_hijab_url', 'image_hijab_url TEXT');
}

// --- tiny query helpers ---
export function run(sql, ...params) {
  return db.prepare(sql).run(...params);
}
export function get(sql, ...params) {
  return db.prepare(sql).get(...params);
}
export function all(sql, ...params) {
  return db.prepare(sql).all(...params);
}
