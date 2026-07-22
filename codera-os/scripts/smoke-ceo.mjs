// Headless test for the CEO dashboard: routes render, and interactivity persists.
let chromium;
try { ({ chromium } = await import("playwright")); }
catch { ({ default: { chromium } } = await import("/opt/node22/lib/node_modules/playwright/index.js")); }
const exe = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const url = "file://" + join(ROOT, "ceo.html");

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: "networkidle" });

const routes = ["#/cockpit", "#/capture", "#/followups", "#/goals", "#/habits", "#/area/finance", "#/area/business", "#/area/health"];
for (const r of routes) {
  await page.evaluate((h) => (location.hash = h), r);
  await page.waitForTimeout(120);
  const len = await page.evaluate(() => document.getElementById("view").innerHTML.length);
  console.log(`${r.padEnd(22)} → ${String(len).padStart(6)} chars`);
  if (len < 200) errors.push(`EMPTY at ${r}`);
}

// Interactivity: add a capture, confirm it appears and persists to localStorage
await page.evaluate(() => (location.hash = "#/capture"));
await page.waitForTimeout(120);
await page.fill("#qc", "Test: call the accountant about VAT");
await page.click("button.btn");
await page.waitForTimeout(120);
const hasCapture = await page.evaluate(() => document.getElementById("view").innerHTML.includes("call the accountant"));
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("codera-ceo:v2:captures") || "[]").some((c) => c.text.includes("accountant")));
console.log(`\nadd capture → visible: ${hasCapture} · persisted: ${stored}`);
if (!hasCapture || !stored) errors.push("capture add/persist failed");

// Toggle a follow-up done and confirm it persists
await page.evaluate(() => (location.hash = "#/followups"));
await page.waitForTimeout(120);
await page.click(".todo .check");
await page.waitForTimeout(120);
const anyDone = await page.evaluate(() => JSON.parse(localStorage.getItem("codera-ceo:v2:actions") || "[]").some((a) => a.status === "done"));
console.log(`toggle follow-up → persisted done: ${anyDone}`);
if (!anyDone) errors.push("action toggle persist failed");

// Reload and confirm the capture is still there (persistence across sessions)
await page.reload({ waitUntil: "networkidle" });
await page.evaluate(() => (location.hash = "#/capture"));
await page.waitForTimeout(150);
const persists = await page.evaluate(() => document.getElementById("view").innerHTML.includes("call the accountant"));
console.log(`after reload → still there: ${persists}`);
if (!persists) errors.push("persistence across reload failed");

// Arabic toggle
await page.click("#lang");
await page.waitForTimeout(150);
const dir = await page.evaluate(() => document.documentElement.getAttribute("dir"));
console.log(`AR toggle → dir=${dir}`);
if (dir !== "rtl") errors.push("RTL failed");

await browser.close();
if (errors.length) { console.error("\nERRORS:\n" + errors.join("\n")); process.exit(1); }
console.log("\n✅ CEO dashboard: all routes render, interactivity persists, no console errors.");
