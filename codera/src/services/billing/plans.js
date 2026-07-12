import { get, all, run } from '../../db/index.js';

export function listPlans() {
  return all('SELECT * FROM plans ORDER BY sort').map((p) => ({
    ...p,
    features: JSON.parse(p.features_json || '[]'),
    price: p.price_cents / 100,
  }));
}

export function getPlan(id) {
  const p = get('SELECT * FROM plans WHERE id = ?', id);
  if (!p) return null;
  return { ...p, features: JSON.parse(p.features_json || '[]'), price: p.price_cents / 100 };
}

export function currentPeriod() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// Usage in the current calendar month
export function usageThisMonth(tenantId) {
  const row = get(
    "SELECT COUNT(*) AS c FROM usage_events WHERE tenant_id = ? AND type = 'tryon' AND period = ?",
    tenantId, currentPeriod()
  );
  return row ? row.c : 0;
}

export function quotaStatus(tenant) {
  const plan = getPlan(tenant.plan_id) || { quota_month: 0 };
  const used = usageThisMonth(tenant.id);
  return {
    plan: plan.id,
    quota: plan.quota_month,
    used,
    remaining: Math.max(0, plan.quota_month - used),
    exceeded: used >= plan.quota_month,
  };
}

export function recordUsage(tenantId, type = 'tryon') {
  run('INSERT INTO usage_events (tenant_id, type, period) VALUES (?,?,?)', tenantId, type, currentPeriod());
}
