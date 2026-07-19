import { TryOnProvider } from './provider.js';
import { config } from '../../lib/config.js';

/**
 * FASHN.ai virtual try-on adapter.
 * Docs: https://docs.fashn.ai  (endpoints/params may evolve — verify against
 * your account). Requires FASHN_API_KEY. Expects publicly reachable image URLs.
 */
export class FashnProvider extends TryOnProvider {
  get name() { return 'fashn'; }

  async generate(input) {
    const key = config.ai.fashnKey;
    if (!key) throw new Error('FASHN_API_KEY is not set');

    const modelImage = input.shopperPhoto || input.publicModelUrl;
    if (!modelImage) throw new Error('missing model/shopper image URL');
    if (!input.publicGarmentUrl) throw new Error('missing public garment URL');

    const catMap = { top: 'tops', bottom: 'bottoms', dress: 'one-pieces', abaya: 'one-pieces', accessory: 'tops' };

    const runRes = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model_name: 'tryon-v1.6',
        inputs: {
          model_image: modelImage,
          garment_image: input.publicGarmentUrl,
          category: catMap[input.category] || 'auto',
        },
      }),
    });
    if (!runRes.ok) throw new Error(`FASHN run failed: ${runRes.status} ${await runRes.text()}`);
    const { id } = await runRes.json();

    // poll for completion
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const st = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const data = await st.json();
      if (data.status === 'completed') {
        const url = Array.isArray(data.output) ? data.output[0] : data.output;
        return { resultUrl: url, meta: { provider: 'fashn', id } };
      }
      if (data.status === 'failed') throw new Error(`FASHN failed: ${data.error || 'unknown'}`);
    }
    throw new Error('FASHN timed out');
  }
}
