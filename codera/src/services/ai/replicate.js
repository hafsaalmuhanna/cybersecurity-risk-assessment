import { TryOnProvider } from './provider.js';
import { config } from '../../lib/config.js';

/**
 * Replicate adapter (e.g. IDM-VTON / CatVTON style models).
 * Requires REPLICATE_API_TOKEN and REPLICATE_TRYON_VERSION (the model version hash).
 * Input names below match cuuupid/idm-vton; adjust `input` for your chosen model.
 */
export class ReplicateProvider extends TryOnProvider {
  get name() { return 'replicate'; }

  async generate(input) {
    const token = config.ai.replicateToken;
    const version = config.ai.replicateVersion;
    if (!token) throw new Error('REPLICATE_API_TOKEN is not set');
    if (!version) throw new Error('REPLICATE_TRYON_VERSION is not set');

    const human = input.shopperPhoto || input.publicModelUrl;
    if (!human || !input.publicGarmentUrl) throw new Error('missing human/garment image URL');

    const create = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify({
        version,
        input: {
          human_img: human,
          garm_img: input.publicGarmentUrl,
          garment_des: input.title || input.category || 'garment',
        },
      }),
    });
    if (!create.ok) throw new Error(`Replicate create failed: ${create.status} ${await create.text()}`);
    let pred = await create.json();

    for (let i = 0; i < 60; i++) {
      if (pred.status === 'succeeded') {
        const out = Array.isArray(pred.output) ? pred.output[pred.output.length - 1] : pred.output;
        return { resultUrl: out, meta: { provider: 'replicate', id: pred.id } };
      }
      if (pred.status === 'failed' || pred.status === 'canceled') {
        throw new Error(`Replicate ${pred.status}: ${pred.error || ''}`);
      }
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(pred.urls.get, { headers: { Authorization: `Token ${token}` } });
      pred = await poll.json();
    }
    throw new Error('Replicate timed out');
  }
}
