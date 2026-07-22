# CODERA AI OS

A **service-based** operating system for Codera (Kuwait Coder, `coderkw.com`) — not
organized around departments, but around the services the agency actually sells:
Website Development, Mobile Apps, AI Solutions, Cybersecurity, SEO, Branding,
Graphic Design, UI/UX, Digital Marketing, Automation, Training, and Consulting.

The whole point of the architecture is that **a service is just a folder**. Add a
folder, rebuild, and the OS grows a new dashboard, agent, workflow, and pricing
sheet for it — no code changes. Grow from 12 to 50 services without re-engineering.

## The idea in one screen

- **Smart dashboard, not a static one.** The Overview shows live KPIs (revenue,
  active clients, open projects, pending quotes, invoices due, leads today) plus a
  card per service. Click a service and the whole dashboard becomes *that service's*
  dashboard — its projects, completion, revenue, clients, open tasks, workflow, and
  agent.
- **One agent per service.** Each service defines its own autonomous pipeline
  (e.g. Website Development: intake → requirements → proposal → pricing → contract →
  setup → tasks → tracking → QA → delivery; SEO: keyword research → competitors →
  content plan → articles → measurement → monthly report).
- **Bilingual.** English/Arabic toggle (top-right `ع` / `EN`) with full RTL.

## CEO Dashboard (Life OS)

`ceo.html` is a companion command center for running your whole life like a
company — reachable from the Business OS via the **🎛️ CEO** button (and back
via **🏢 Business OS**). It captures what's in your head, tells you what to do
next, and records/analyzes/gives insight across every life area.

- **Capture** — a quick-add inbox for any thought; triage each into a follow-up.
- **Follow-ups** — what to do *and what to provide/deliver*, by area and priority.
- **Goals & Habits** — progress steppers and a weekly habit tracker.
- **Life areas** — Business, Finance, Health, Growth, Relationships, Faith, Personal;
  each with a score, goals, actions, habits, and insights. Add an area in
  `data/life/areas.json` and it appears automatically.
- **Insights** — rule-based observations that pull from your real Codera
  financials (break-even, capital recovery) plus your inbox, due dates, and habits.

Everything you add or tick is **saved in your browser** (localStorage), seeded
from `data/life/*.json`. Use *Reset to sample data* to start over.

## Run it

No build tooling required to view — everything compiles into a single embedded
bundle so it runs straight from disk.

```bash
cd codera-os
npm run build      # compile services/ + data/ → assets/js/registry.js
open index.html    # or: npm run serve  → http://localhost:8080
```

Then open `index.html` directly in a browser, or serve it with `npm run serve`.

## Adding a service (the extensibility contract)

```
services/<your-service>/
  service.json     # id, name, nameAr, icon, color, tagline, unit
  workflow.json    # the agent pipeline (ordered steps)
  dashboard.json   # which KPIs + panels this service shows
  pricing.md       # pricing sheet (rendered as a table)
  agent.md         # the service agent's role + system prompt
  knowledge/       # reference docs the agent uses as context
  prompts/         # reusable prompt templates
```

```bash
npm run build      # the new service auto-appears — dashboard, agent, workflow, pricing
```

`scripts/seed.mjs` shows the pattern: it scaffolds all 12 services from a catalog.
`scripts/build.mjs` scans `services/*/` + `data/*.json` and compiles the
`window.CODERA` bundle the app reads.

## Structure

```
codera-os/
├── index.html              # app shell
├── assets/
│   ├── css/styles.css      # theme
│   └── js/
│       ├── registry.js     # AUTO-GENERATED bundle (services + data)
│       └── app.js          # router, KPI engine, dashboards, i18n
├── services/<id>/          # one self-contained folder per service
├── data/                   # clients, projects, leads, finance (sample data)
└── scripts/
    ├── seed.mjs            # scaffold service folders from the catalog
    ├── build.mjs           # compile services + data → registry.js
    └── smoke.mjs           # headless render test of every route
```

## Notes

- The **sample business data** in `data/` (clients, projects, leads, finance) is
  illustrative so the dashboards show real numbers. Replace it with a live source
  (API, database, or a generated `registry.js`) when wiring to production.
- `assets/js/registry.js` is generated — edit the source folders, not the bundle.
- The Cybersecurity service maps its workflow to the NIST CSF functions used in the
  parent `cybersecurity-risk-assessment` repo.
