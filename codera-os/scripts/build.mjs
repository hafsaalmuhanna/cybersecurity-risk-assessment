#!/usr/bin/env node
/*
 * CODERA AI OS — registry compiler.
 *
 * Scans every folder under services/ plus the shared data/ files and compiles
 * them into assets/js/registry.js as `window.CODERA`. The web app reads only
 * that bundle, so:
 *   - it runs with no server and no dependencies (works from file://), and
 *   - adding a service is just: create services/<id>/ (or run seed) then
 *     `npm run build`. The new service auto-appears with its dashboard,
 *     agent, workflow, and pricing. No app code changes.
 */
import {
  readdirSync,
  readFileSync,
  statSync,
  existsSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SERVICES = join(ROOT, "services");
const DATA = join(ROOT, "data");

const readJSON = (p) => JSON.parse(readFileSync(p, "utf8"));
const readText = (p) => readFileSync(p, "utf8");
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();

function readTree(dir) {
  // Return { filename: contents } for a flat folder (knowledge/, prompts/).
  if (!isDir(dir)) return {};
  const out = {};
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isFile()) out[f] = readText(p);
  }
  return out;
}

const services = [];
for (const id of readdirSync(SERVICES)) {
  const dir = join(SERVICES, id);
  if (!isDir(dir)) continue;
  const svcFile = join(dir, "service.json");
  if (!existsSync(svcFile)) continue; // not a service folder — skip

  const service = readJSON(svcFile);
  const workflow = existsSync(join(dir, "workflow.json"))
    ? readJSON(join(dir, "workflow.json"))
    : { steps: [] };
  const dashboard = existsSync(join(dir, "dashboard.json"))
    ? readJSON(join(dir, "dashboard.json"))
    : {};
  const pricing = existsSync(join(dir, "pricing.md"))
    ? readText(join(dir, "pricing.md"))
    : "";
  const agent = existsSync(join(dir, "agent.md"))
    ? readText(join(dir, "agent.md"))
    : "";

  services.push({
    ...service,
    id: service.id || id,
    workflow,
    dashboard,
    pricing,
    agent,
    knowledge: readTree(join(dir, "knowledge")),
    prompts: readTree(join(dir, "prompts")),
  });
}

services.sort((a, b) => a.name.localeCompare(b.name));

const data = {
  clients: readJSON(join(DATA, "clients.json")),
  projects: readJSON(join(DATA, "projects.json")),
  leads: readJSON(join(DATA, "leads.json")),
  finance: readJSON(join(DATA, "finance.json")),
  expenses: existsSync(join(DATA, "expenses.json"))
    ? readJSON(join(DATA, "expenses.json"))
    : { currency: "KWD", months_rent_paid: 0, items: [] },
  financials: existsSync(join(DATA, "financials.json"))
    ? readJSON(join(DATA, "financials.json"))
    : null,
  life: (() => {
    const L = join(DATA, "life");
    if (!isDir(L)) return null;
    const read = (f) => (existsSync(join(L, f)) ? readJSON(join(L, f)) : []);
    return {
      areas: read("areas.json"),
      goals: read("goals.json"),
      actions: read("actions.json"),
      captures: read("captures.json"),
      habits: read("habits.json"),
    };
  })(),
};

// Pre-compute the owner's total personal outlay so the UI stays simple.
{
  const e = data.expenses;
  const oneTime = e.items.filter((i) => i.type === "one_time").reduce((a, i) => a + i.amount, 0);
  const monthly = e.items.filter((i) => i.type === "monthly").reduce((a, i) => a + i.amount, 0);
  const months = e.months_rent_paid || 0;
  const rentOneTime = e.items
    .filter((i) => i.type === "one_time" && i.category === "Rent")
    .reduce((a, i) => a + i.amount, 0);
  const recurringPaid = monthly * months;
  e.totals = {
    oneTime,
    monthly,
    months,
    recurringPaid,
    rentOneTime,
    rentTotalPaid: rentOneTime + recurringPaid, // first month + all monthly payments
    investedSoFar: oneTime + recurringPaid,
  };
}

// Year-1 income statement from real figures (owner-funded, no external capital).
if (data.financials) {
  const f = data.financials;
  const et = data.expenses.totals;
  const revenue = f.revenue.reduce((a, r) => a + r.amount, 0);
  const sal = f.founder_salary || { monthly: 0, months_elapsed: 0, months_paid: 0 };
  const salaryOwed = sal.monthly * (sal.months_elapsed - sal.months_paid);
  const opexRecurring = et.rentTotalPaid; // rent for the year (only recurring opex so far)
  const startupCapital = et.oneTime - et.rentOneTime; // non-rent one-time outlay
  const cashInvested = et.investedSoFar; // total cash the owner put in
  f.report = {
    currency: f.currency,
    revenue,
    opexRecurring,
    startupCapital,
    cashInvested,
    salaryMonthly: sal.monthly,
    salaryOwed,
    cashResult: revenue - cashInvested, // pure out-of-pocket position
    operatingResult: revenue - opexRecurring, // ignoring one-time capital
    economicResult: revenue - cashInvested - salaryOwed, // incl. unpaid labour
    monthlyBurn: et.monthly + sal.monthly, // rent + intended salary, per month
    breakEvenMonthly: et.monthly + sal.monthly,
    breakEvenNoSalary: et.monthly,
    owedToOwner: cashInvested + salaryOwed, // capital + deferred salary
  };
}

const bundle = {
  generatedAt: new Date().toISOString(),
  brand: {
    name: "CODERA AI OS",
    company: "Codera — Kuwait Coder",
    site: "coderkw.com",
    currency: data.finance.currency || "KWD",
  },
  services,
  ...data,
};

const banner =
  "/* AUTO-GENERATED by scripts/build.mjs — do not edit by hand. */\n" +
  "/* Source of truth: services/<id>/ and data/*.json. Re-run `npm run build`. */\n";

writeFileSync(
  join(ROOT, "assets", "js", "registry.js"),
  banner + "window.CODERA = " + JSON.stringify(bundle, null, 2) + ";\n"
);

console.log(
  `Built registry.js — ${services.length} services, ${data.projects.length} projects, ${data.clients.length} clients.`
);
