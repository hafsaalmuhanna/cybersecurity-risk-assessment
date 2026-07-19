import { config } from '../../lib/config.js';

/**
 * UPayments adapter (Gulf gateway: KNET/mada/Visa/Apple Pay).
 * Creates a hosted checkout link for a subscription's first charge.
 * Recurring billing on UPayments is typically handled by re-charging a saved
 * token or issuing a new invoice each cycle via a scheduled job (see docs/PRICING.md).
 *
 * If no API key is configured we return a local mock checkout URL so the flow
 * is testable end-to-end offline.
 */
export async function createCheckout({ tenant, plan, returnUrl }) {
  const amount = (plan.price_cents / 100).toFixed(3);

  if (!config.billing.upaymentKey) {
    const sep = returnUrl.includes('?') ? '&' : '?';
    return {
      mock: true,
      checkoutUrl: `${returnUrl}${sep}mock=1&status=paid`,
      reference: `mock_${Date.now()}`,
    };
  }

  const res = await fetch(`${config.billing.upaymentUrl}/charge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.billing.upaymentKey}` },
    body: JSON.stringify({
      products: [{ name: `اشتراك ${plan.name} - Codera`, price: Number(amount), quantity: 1 }],
      order: { id: `sub_${tenant.id}_${Date.now()}`, reference: `tenant_${tenant.id}`, description: `Codera ${plan.id}`, currency: config.billing.currency, amount: Number(amount) },
      reference: { id: `tenant_${tenant.id}` },
      customer: { uniqueId: `tenant_${tenant.id}`, name: tenant.name },
      returnUrl,
      cancelUrl: returnUrl,
      notificationUrl: `${returnUrl.split('/dashboard')[0]}/api/billing/webhook`,
    }),
  });
  if (!res.ok) throw new Error(`UPayments error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const link = data?.data?.link || data?.link;
  return { mock: false, checkoutUrl: link, reference: data?.data?.trackId || data?.trackId };
}

// Verify a webhook / redirect. Real integration should validate a signature.
export function verifyPayment(payload) {
  return { paid: payload?.status === 'paid' || payload?.result === 'CAPTURED', reference: payload?.reference };
}
