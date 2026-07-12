import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../../lib/config.js';
import { TryOnProvider } from './provider.js';
import { tryonPreviewSVG, accentFrom } from '../../lib/svg.js';

/**
 * Offline mock provider. Produces an illustrative composited preview so the full
 * pipeline (queue -> process -> result -> display) works with zero API keys.
 * Swap AI_PROVIDER=fashn|replicate for photorealistic output.
 */
export class MockProvider extends TryOnProvider {
  get name() { return 'mock'; }

  async generate(input) {
    // simulate provider latency
    await new Promise((r) => setTimeout(r, 600));
    const model = {
      name: input.modelName || 'الموديل',
      skin_tone: input.skinTone || 'متوسط',
      hijab: input.hijab ? 1 : 0,
    };
    const accent = accentFrom((input.title || '') + (input.category || ''));
    const svg = tryonPreviewSVG(model, {
      title: input.title,
      category: input.category,
      accent,
      pose: input.pose || 'بورتريه',
    });
    const name = `tryon_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.svg`;
    fs.mkdirSync(config.uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(config.uploadsDir, name), svg);
    return { resultUrl: `/uploads/${name}`, meta: { provider: 'mock', accent } };
  }
}
