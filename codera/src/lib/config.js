// Lightweight .env loader (no external deps) + typed config accessor.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..', '..');

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

// Real .env wins; otherwise fall back to .env.example so the app runs out-of-the-box.
loadEnvFile(path.join(ROOT, '.env'));
loadEnvFile(path.join(ROOT, '.env.example'));

export const config = {
  port: Number(process.env.PORT || 3000),
  baseDomain: process.env.BASE_DOMAIN || 'lvh.me',
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret',
  ai: {
    provider: process.env.AI_PROVIDER || 'mock',
    fashnKey: process.env.FASHN_API_KEY || '',
    replicateToken: process.env.REPLICATE_API_TOKEN || '',
    replicateVersion: process.env.REPLICATE_TRYON_VERSION || '',
  },
  image: {
    provider: process.env.IMAGE_PROVIDER || 'mock',
    replicateToken: process.env.REPLICATE_API_TOKEN || '',
    replicateVersion: process.env.IMAGE_MODEL_VERSION || '',
    openaiKey: process.env.OPENAI_API_KEY || '',
    falKey: process.env.FAL_KEY || '',
  },
  shopify: {
    apiVersion: process.env.SHOPIFY_API_VERSION || '2024-10',
  },
  billing: {
    upaymentUrl: process.env.UPAYMENT_API_URL || '',
    upaymentKey: process.env.UPAYMENT_API_KEY || '',
    upaymentMerchant: process.env.UPAYMENT_MERCHANT_ID || '',
    currency: process.env.BILLING_CURRENCY || 'SAR',
  },
  dataDir: path.join(ROOT, 'data'),
  uploadsDir: path.join(ROOT, 'data', 'uploads'),
  publicDir: path.join(ROOT, 'public'),
};

fs.mkdirSync(config.uploadsDir, { recursive: true });
