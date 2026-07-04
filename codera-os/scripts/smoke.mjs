// Headless smoke test — loads index.html in Chromium and checks each route renders.
// Loads Playwright from wherever it's available (local install or global).
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  ({ default: { chromium } } = await import("/opt/node22/lib/node_modules/playwright/index.js"));
}
const exe = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const url = "file://" + join(ROOT, "index.html");

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(url, { waitUntil: "networkidle" });

const routes = [
  "#/overview", "#/dashboard/executive", "#/dashboard/sales",
  "#/dashboard/finance", "#/dashboard/operations", "#/service/cybersecurity",
  "#/service/seo/workflow", "#/service/ai-solutions/agent",
  "#/service/website-development/pricing", "#/service/seo/knowledge",
  "#/clients", "#/projects", "#/knowledge", "#/agents", "#/automations", "#/reports",
];

for (const r of routes) {
  await page.evaluate((h) => (location.hash = h), r);
  await page.waitForTimeout(120);
  const len = await page.evaluate(() => document.getElementById("view").innerHTML.length);
  const title = await page.evaluate(() => document.getElementById("page-title").textContent);
  console.log(`${r.padEnd(42)} → ${String(len).padStart(6)} chars · "${title}"`);
  if (len < 200) errors.push(`EMPTY VIEW at ${r}`);
}

// nav count + a KPI value sanity check
await page.evaluate(() => (location.hash = "#/overview"));
await page.waitForTimeout(120);
const navCount = await page.evaluate(() => document.querySelectorAll("#nav .nav-item").length);
const kpiText = await page.evaluate(() => document.querySelector(".kpi .value")?.textContent);
console.log(`\nnav items: ${navCount} · first KPI: ${kpiText}`);

// Arabic / RTL toggle
await page.click("#lang");
await page.waitForTimeout(150);
const dir = await page.evaluate(() => document.documentElement.getAttribute("dir"));
const arTitle = await page.evaluate(() => document.getElementById("page-title").textContent);
console.log(`AR toggle → dir=${dir} · title="${arTitle}"`);
if (dir !== "rtl") errors.push("RTL not applied");

// verify raw i18n keys are not leaking into the UI
await page.evaluate(() => (location.hash = "#/service/cybersecurity"));
await page.waitForTimeout(120);
const leak = await page.evaluate(() => /Tab<|>overview<|workflowTab/.test(document.getElementById("view").innerHTML));
if (leak) errors.push("raw i18n key leaked into tabs");

await browser.close();
if (errors.length) { console.error("\nERRORS:\n" + errors.join("\n")); process.exit(1); }
console.log("\n✅ smoke test passed — no console errors, all routes render.");
