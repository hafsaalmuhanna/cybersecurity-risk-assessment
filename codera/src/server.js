import http from 'node:http';
import path from 'node:path';
import { config } from './lib/config.js';
import { initSchema } from './db/index.js';
import { sendJson, sendText, serveStatic, paths } from './lib/http.js';
import { resolveTenant } from './lib/tenant.js';

import * as authRoutes from './routes/auth.js';
import * as dashboardRoutes from './routes/dashboard.js';
import * as storefrontRoutes from './routes/storefront.js';
import * as billingRoutes from './routes/billing.js';
import * as adminRoutes from './routes/admin.js';

initSchema();

// ---------------- tiny router ----------------
class Router {
  constructor() { this.routes = []; }
  add(method, pattern, handler) {
    const keys = [];
    const rx = new RegExp('^' + pattern.replace(/:[^/]+/g, (m) => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$');
    this.routes.push({ method, rx, keys, handler });
  }
  get(p, h) { this.add('GET', p, h); }
  post(p, h) { this.add('POST', p, h); }
  patch(p, h) { this.add('PATCH', p, h); }
  delete(p, h) { this.add('DELETE', p, h); }
  match(method, pathname) {
    for (const r of this.routes) {
      if (r.method !== method) continue;
      const m = r.rx.exec(pathname);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
        return { handler: r.handler, params };
      }
    }
    return null;
  }
}

const router = new Router();
authRoutes.register(router);
dashboardRoutes.register(router);
storefrontRoutes.register(router);
billingRoutes.register(router);
adminRoutes.register(router);

// ---------------- page routing ----------------
function servePage(res, dir, file = 'index.html') {
  if (!serveStatic(res, config.publicDir, path.join(dir, file))) sendText(res, 404, 'Not found');
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http://${host}`);
    const pathname = decodeURIComponent(url.pathname);
    const proto = (req.headers['x-forwarded-proto'] || 'http').split(',')[0];
    const origin = `${proto}://${host}`;
    const tenant = resolveTenant(req, url);
    if (tenant) tenant._origin = origin;

    // --- static assets ---
    if (pathname.startsWith('/assets/')) {
      if (serveStatic(res, config.publicDir, pathname)) return;
    }
    if (pathname.startsWith('/uploads/')) {
      if (serveStatic(res, paths.uploads, pathname.replace('/uploads/', ''))) return;
      return sendText(res, 404, 'not found');
    }
    if (pathname === '/widget.js') return servePage(res, 'widget', 'widget.js');
    if (pathname === '/favicon.ico') return sendText(res, 204, '');

    // --- API ---
    if (pathname.startsWith('/api/')) {
      const found = router.match(req.method, pathname);
      if (!found) return sendJson(res, 404, { error: 'not found' });
      return await found.handler({ req, res, params: found.params, url, tenant, origin });
    }

    // --- app pages ---
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      const rel = pathname.replace(/^\/dashboard\/?/, '') || 'index.html';
      if (rel !== 'index.html' && serveStatic(res, path.join(config.publicDir, 'dashboard'), rel)) return;
      return servePage(res, 'dashboard');
    }
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      const rel = pathname.replace(/^\/admin\/?/, '') || 'index.html';
      if (rel !== 'index.html' && serveStatic(res, path.join(config.publicDir, 'admin'), rel)) return;
      return servePage(res, 'admin');
    }
    if (pathname === '/store' || pathname.startsWith('/store/')) {
      const rel = pathname.replace(/^\/store\/?/, '') || 'index.html';
      if (rel !== 'index.html' && serveStatic(res, path.join(config.publicDir, 'storefront'), rel)) return;
      return servePage(res, 'storefront');
    }

    // --- root ---
    if (pathname === '/') {
      // A tenant host (custom domain / subdomain) shows the storefront directly.
      if (tenant) return servePage(res, 'storefront');
      return servePage(res, 'landing'); // platform marketing page
    }

    // storefront SPA asset fallback for tenant hosts
    if (tenant && serveStatic(res, path.join(config.publicDir, 'storefront'), pathname)) return;

    sendText(res, 404, 'Not found');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) sendJson(res, 500, { error: 'server error' });
  }
});

server.listen(config.port, () => {
  console.log(`\n  Codera running → http://localhost:${config.port}`);
  console.log(`  Landing      : http://localhost:${config.port}/`);
  console.log(`  Merchant     : http://localhost:${config.port}/dashboard`);
  console.log(`  Storefront   : http://localhost:${config.port}/store?tenant=noor`);
  console.log(`  Admin        : http://localhost:${config.port}/admin`);
  console.log(`  AI provider  : ${config.ai.provider}\n`);
});
