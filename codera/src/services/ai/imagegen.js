import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../../lib/config.js';
import { modelPortraitSVG } from '../../lib/svg.js';

/**
 * Pluggable text-to-image layer for GENERATING house models (عارضات).
 * Separate from the try-on layer. Switch via IMAGE_PROVIDER = mock|replicate|openai|fal.
 * Without a key it returns a stylized SVG portrait so the flow works offline.
 *
 * generateModelImage(attrs) -> { url }  (a path under /assets/models served statically)
 */
const modelsDir = path.join(config.publicDir, 'assets', 'models');

function saveBuffer(buf, ext) {
  fs.mkdirSync(modelsDir, { recursive: true });
  const name = `gen_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(modelsDir, name), buf);
  return `/assets/models/${name}`;
}

// Build a consistent, high-quality fashion-model prompt from attributes.
export function buildModelPrompt({ ethnicity = '', skinTone = '', hijab = false, pose = 'بورتريه' } = {}) {
  const skinEn = { فاتح: 'fair', متوسط: 'medium', حنطي: 'warm wheatish', داكن: 'deep' }[skinTone] || 'medium';
  const poseEn = { بورتريه: 'half-body portrait', وقوف: 'full-body standing pose', جانبي: 'three-quarter side profile' }[pose] || 'half-body portrait';
  const head = hijab
    ? 'wearing an elegant modest hijab headscarf neatly framing the face'
    : 'long styled hair, head uncovered';
  return [
    `Elegant fashion e-commerce studio ${poseEn} of a ${ethnicity || 'Middle Eastern'} woman in her mid-20s`,
    `${skinEn} skin, ${head}, natural glam makeup, calm confident expression, looking at camera`,
    'wearing a plain simple fitted neutral top',
    'clean warm beige studio background with soft golden bokeh, professional beauty lighting',
    'high-end editorial fashion photography, photorealistic, sharp focus, full head and shoulders visible',
  ].join(', ');
}

async function viaReplicate(prompt) {
  const token = config.image.replicateToken;
  const version = config.image.replicateVersion;
  if (!token || !version) throw new Error('missing REPLICATE token/version');
  const create = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
    body: JSON.stringify({ version, input: { prompt, aspect_ratio: '3:4', output_format: 'png', num_outputs: 1 } }),
  });
  if (!create.ok) throw new Error(`Replicate ${create.status}: ${await create.text()}`);
  let pred = await create.json();
  for (let i = 0; i < 60; i++) {
    if (pred.status === 'succeeded') {
      const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
      const img = await fetch(out); return saveBuffer(Buffer.from(await img.arrayBuffer()), 'png');
    }
    if (pred.status === 'failed' || pred.status === 'canceled') throw new Error('Replicate failed');
    await new Promise((r) => setTimeout(r, 2000));
    pred = await (await fetch(pred.urls.get, { headers: { Authorization: `Token ${token}` } })).json();
  }
  throw new Error('Replicate timed out');
}

async function viaOpenAI(prompt) {
  const key = config.image.openaiKey;
  if (!key) throw new Error('missing OPENAI_API_KEY');
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1024x1536', n: 1 }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const b64 = data.data[0].b64_json;
  return saveBuffer(Buffer.from(b64, 'base64'), 'png');
}

async function viaFal(prompt) {
  const key = config.image.falKey;
  if (!key) throw new Error('missing FAL_KEY');
  const res = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Key ${key}` },
    body: JSON.stringify({ prompt, image_size: 'portrait_4_3', num_images: 1 }),
  });
  if (!res.ok) throw new Error(`Fal ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const url = data.images?.[0]?.url;
  const img = await fetch(url);
  return saveBuffer(Buffer.from(await img.arrayBuffer()), 'png');
}

export async function generateModelImage(attrs = {}) {
  const prompt = buildModelPrompt(attrs);
  const provider = (config.image.provider || 'mock').toLowerCase();
  try {
    if (provider === 'replicate') return { url: await viaReplicate(prompt), prompt, provider };
    if (provider === 'openai') return { url: await viaOpenAI(prompt), prompt, provider };
    if (provider === 'fal') return { url: await viaFal(prompt), prompt, provider };
  } catch (e) {
    // fall through to placeholder but surface the reason
    console.error('[imagegen] provider failed, using placeholder:', e.message);
  }
  // mock / offline fallback: stylized SVG portrait
  const svg = modelPortraitSVG({ name: attrs.name || '', ethnicity: attrs.ethnicity, skin_tone: attrs.skinTone, hijab: attrs.hijab ? 1 : 0 });
  fs.mkdirSync(modelsDir, { recursive: true });
  const name = `gen_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.svg`;
  fs.writeFileSync(path.join(modelsDir, name), svg);
  return { url: `/assets/models/${name}`, prompt, provider: 'mock' };
}
