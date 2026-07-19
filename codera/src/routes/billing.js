import { run, get } from '../db/index.js';
import { currentUser } from '../lib/auth.js';
import { sendJson, readJson, redirect } from '../lib/http.js';
import { listPlans, getPlan, quotaStatus } from '../services/billing/plans.js';
import { createCheckout, verifyPayment } from '../services/billing/upayment.js';

function auth(req, res) {
  const ctx = currentUser(req);
  if (!ctx) { sendJson(res, 401, { error: 'غير مصرّح' }); return null; }
  return ctx;
}

export function register(router) {
  // public: plans for the marketing/landing page
  router.get('/api/plans', ({ res }) => sendJson(res, 200, { plans: listPlans() }));

  router.get('/api/billing', ({ req, res }) => {
    const ctx = auth(req, res); if (!ctx) return;
    const sub = get('SELECT * FROM subscriptions WHERE tenant_id = ? ORDER BY id DESC LIMIT 1', ctx.tenant.id);
    sendJson(res, 200, {
      plans: listPlans(),
      current: getPlan(ctx.tenant.plan_id),
      subscription: sub,
      quota: quotaStatus(ctx.tenant),
      status: ctx.tenant.status,
    });
  });

  // Start a subscription -> returns a checkout URL (UPayments or mock)
  router.post('/api/billing/subscribe', async ({ req, res, origin }) => {
    const ctx = auth(req, res); if (!ctx) return;
    const { plan: planId } = await readJson(req);
    const plan = getPlan(planId);
    if (!plan) return sendJson(res, 400, { error: 'باقة غير معروفة' });
    const returnUrl = `${origin}/api/billing/return?tenant=${ctx.tenant.id}&plan=${plan.id}`;
    try {
      const checkout = await createCheckout({ tenant: ctx.tenant, plan, returnUrl });
      // remember intended plan
      run("INSERT INTO subscriptions (tenant_id,plan_id,status,provider,provider_ref) VALUES (?,?,?,?,?)",
        ctx.tenant.id, plan.id, 'pending', checkout.mock ? 'manual' : 'upayment', checkout.reference || null);
      sendJson(res, 200, { checkoutUrl: checkout.checkoutUrl, mock: !!checkout.mock });
    } catch (e) {
      sendJson(res, 502, { error: 'تعذّر إنشاء الدفع: ' + e.message });
    }
  });

  // Payment gateway redirects back here
  router.get('/api/billing/return', ({ res, url }) => {
    const tenantId = url.searchParams.get('tenant');
    const planId = url.searchParams.get('plan');
    const status = url.searchParams.get('status');
    if ((status === 'paid' || url.searchParams.get('mock')) && tenantId && planId) {
      run("UPDATE tenants SET plan_id = ?, status = 'active' WHERE id = ?", planId, tenantId);
      run(`UPDATE subscriptions SET status='active', period_start=date('now'), period_end=date('now','+30 day')
           WHERE tenant_id = ? AND plan_id = ? AND status='pending'`, tenantId, planId);
    }
    redirect(res, '/dashboard/#/billing?paid=1');
  });

  // Server-to-server webhook (recurring charges / async confirmation)
  router.post('/api/billing/webhook', async ({ req, res }) => {
    const payload = await readJson(req);
    const v = verifyPayment(payload);
    if (v.paid && v.reference) {
      const tenantId = String(v.reference).replace('tenant_', '');
      run("UPDATE tenants SET status='active' WHERE id = ?", tenantId);
    }
    sendJson(res, 200, { received: true });
  });
}
