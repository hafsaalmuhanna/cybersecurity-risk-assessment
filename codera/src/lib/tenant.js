import { get } from '../db/index.js';
import { config } from './config.js';

/**
 * Resolve which tenant (merchant store) a request belongs to, from the Host header.
 *
 *  - Custom domain:      shop.client.com          -> tenants.custom_domain
 *  - Subdomain:          {slug}.codera.app        -> tenants.slug
 *  - Local dev:          {slug}.lvh.me:3000       -> tenants.slug
 *  - ?tenant={slug}      explicit override (handy for local testing on localhost)
 *
 * The platform host (app.codera.app / localhost) resolves to no tenant — that is
 * where the merchant dashboard and platform admin live.
 */
export function resolveTenant(req, url) {
  const host = (req.headers.host || '').split(':')[0].toLowerCase();

  // explicit override for local testing
  const override = url.searchParams.get('tenant');
  if (override) {
    const t = get('SELECT * FROM tenants WHERE slug = ?', override);
    if (t) return hydrate(t);
  }

  // custom domain exact match
  const byDomain = get('SELECT * FROM tenants WHERE custom_domain = ?', host);
  if (byDomain) return hydrate(byDomain);

  // subdomain of the base domain
  const base = config.baseDomain.toLowerCase();
  if (host.endsWith('.' + base)) {
    const slug = host.slice(0, host.length - base.length - 1);
    if (slug && slug !== 'app' && slug !== 'www') {
      const t = get('SELECT * FROM tenants WHERE slug = ?', slug);
      if (t) return hydrate(t);
    }
  }
  return null;
}

export function tenantBySlug(slug) {
  const t = get('SELECT * FROM tenants WHERE slug = ?', slug);
  return t ? hydrate(t) : null;
}

export function tenantById(id) {
  const t = get('SELECT * FROM tenants WHERE id = ?', id);
  return t ? hydrate(t) : null;
}

function hydrate(t) {
  return { ...t, brand: safeParse(t.brand_json) };
}
function safeParse(s) { try { return JSON.parse(s || '{}'); } catch { return {}; } }
