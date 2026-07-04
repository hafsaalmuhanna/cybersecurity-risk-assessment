#!/usr/bin/env node
/*
 * CODERA AI OS — service scaffolder.
 *
 * Each service in Codera is a self-contained folder. This script generates the
 * folder structure from the catalog below so the shape is reproducible:
 *
 *   services/<id>/
 *     service.json     definition (id, name, pricing model, kpis, meta)
 *     workflow.json    the automation / agent pipeline for the service
 *     dashboard.json   which KPIs + panels this service's dashboard shows
 *     pricing.md       human-readable pricing sheet
 *     agent.md         the service agent's role + system prompt
 *     knowledge/       reference material the agent draws on
 *     prompts/         reusable prompt templates
 *
 * Add a new object to CATALOG (or drop a hand-written folder into services/)
 * and re-run `npm run build` — it auto-appears in the OS with its own
 * dashboard, agent, and workflow. No code changes required.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SERVICES = join(ROOT, "services");

const wf = (steps) => steps.map((s, i) => ({ step: i + 1, ...s }));

const CATALOG = [
  {
    id: "website-development",
    name: "Website Development",
    nameAr: "تطوير المواقع",
    icon: "🌐",
    color: "#3b82f6",
    tagline: "Corporate sites, e-commerce, and web platforms.",
    unit: "project",
    workflow: wf([
      { title: "Client intake", agent: "Capture brief, industry, goals, budget band." },
      { title: "Requirements analysis", agent: "Turn brief into a scoped feature list + sitemap." },
      { title: "Proposal", agent: "Draft a proposal with scope, timeline, and deliverables." },
      { title: "Pricing", agent: "Compute price from scope, pages, and integrations." },
      { title: "Contract", agent: "Generate contract + milestones from the accepted proposal." },
      { title: "Project setup", agent: "Create the project, repo, and staging environment." },
      { title: "Task breakdown", agent: "Split into design, front-end, back-end, and QA tasks." },
      { title: "Execution tracking", agent: "Monitor progress and flag blocked or overdue tasks." },
      { title: "Quality assurance", agent: "Run the QA checklist: responsive, a11y, performance." },
      { title: "Delivery", agent: "Handover, training, and warranty window." },
    ]),
    pricing: [
      ["Landing page", "KD 250 – 450", "1 – 2 weeks"],
      ["Corporate website (up to 8 pages)", "KD 600 – 1,200", "3 – 5 weeks"],
      ["E-commerce store", "KD 1,500 – 4,000", "6 – 10 weeks"],
      ["Custom web platform", "From KD 4,000", "8+ weeks"],
    ],
    agentRole:
      "You are the Website Development agent for Codera. You take a client from first contact to a delivered, tested website. You are precise about scope, protective of margins, and always confirm assumptions before committing timelines.",
  },
  {
    id: "mobile-apps",
    name: "Mobile Apps",
    nameAr: "تطبيقات الجوال",
    icon: "📱",
    color: "#8b5cf6",
    tagline: "iOS, Android, and cross-platform applications.",
    unit: "project",
    workflow: wf([
      { title: "Discovery", agent: "Clarify platforms, core flows, and target users." },
      { title: "Scope & wireframes", agent: "Define MVP screens and acceptance criteria." },
      { title: "Proposal & pricing", agent: "Estimate by screens, integrations, and platforms." },
      { title: "Contract & kickoff", agent: "Contract, milestones, and store accounts." },
      { title: "Build sprints", agent: "Track two-week sprints and demo checkpoints." },
      { title: "QA & store review", agent: "Device testing and App Store / Play submission." },
      { title: "Launch & support", agent: "Release, monitor crashes, and hand over." },
    ]),
    pricing: [
      ["MVP (single platform)", "KD 2,500 – 5,000", "6 – 10 weeks"],
      ["Cross-platform app", "KD 4,000 – 9,000", "8 – 14 weeks"],
      ["Enterprise app + backend", "From KD 9,000", "12+ weeks"],
    ],
    agentRole:
      "You are the Mobile Apps agent for Codera. You scope apps by screens and integrations, keep MVPs lean, and guard against store-review surprises.",
  },
  {
    id: "ai-solutions",
    name: "AI Solutions",
    nameAr: "حلول الذكاء الاصطناعي",
    icon: "🤖",
    color: "#06b6d4",
    tagline: "Chatbots, RAG systems, agents, and automation.",
    unit: "project",
    workflow: wf([
      { title: "Use-case discovery", agent: "Identify the highest-ROI AI use case for the client." },
      { title: "Data & feasibility", agent: "Assess data readiness, privacy, and model fit." },
      { title: "Solution design", agent: "Pick architecture: RAG, fine-tune, agent, or workflow." },
      { title: "Proposal & pricing", agent: "Price by build effort plus monthly run cost." },
      { title: "Prototype", agent: "Ship a working proof-of-concept to validate value." },
      { title: "Productionize", agent: "Harden, add guardrails, and connect data sources." },
      { title: "Evaluation", agent: "Measure accuracy, latency, and cost per request." },
      { title: "Handover & retainer", agent: "Deploy, document, and set up a support retainer." },
    ]),
    pricing: [
      ["AI chatbot / assistant", "KD 1,200 – 3,500", "3 – 6 weeks"],
      ["RAG knowledge system", "KD 3,000 – 7,000", "5 – 9 weeks"],
      ["Custom AI agent / automation", "From KD 5,000", "6+ weeks"],
      ["Monthly run + support", "From KD 200 / mo", "ongoing"],
    ],
    agentRole:
      "You are the AI Solutions agent for Codera. You match business problems to the simplest AI architecture that solves them, always account for monthly run cost, and never over-engineer.",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    nameAr: "الأمن السيبراني",
    icon: "🔒",
    color: "#ef4444",
    tagline: "Risk assessments, pen testing, and compliance.",
    unit: "engagement",
    workflow: wf([
      { title: "Scoping", agent: "Define assets, environments, and rules of engagement." },
      { title: "Asset & threat mapping", agent: "Inventory assets and map threats (NIST CSF Identify)." },
      { title: "Assessment / testing", agent: "Run the assessment or authorized penetration test." },
      { title: "Risk scoring", agent: "Score findings by likelihood × impact." },
      { title: "Report", agent: "Produce an executive + technical remediation report." },
      { title: "Remediation support", agent: "Advise fixes and track closure of findings." },
      { title: "Re-test", agent: "Verify remediation and issue a clearance summary." },
    ]),
    pricing: [
      ["Security risk assessment", "KD 800 – 2,000", "1 – 3 weeks"],
      ["Penetration test (web/app)", "KD 1,500 – 4,000", "2 – 4 weeks"],
      ["Compliance readiness (ISO/NIST)", "From KD 3,000", "4+ weeks"],
      ["vCISO / monthly monitoring", "From KD 400 / mo", "ongoing"],
    ],
    agentRole:
      "You are the Cybersecurity agent for Codera. You scope engagements safely, map risk to the NIST CSF functions (Identify, Protect, Detect, Respond, Recover), and score findings by likelihood and impact. You never provide offensive detail outside an authorized, scoped engagement.",
    knowledge: {
      "nist-csf.md":
        "# NIST CSF quick reference\n\n- **Identify** — asset inventory, risk assessment, governance.\n- **Protect** — access control, awareness training, data security.\n- **Detect** — monitoring, logging, anomaly detection.\n- **Respond** — incident response plan, communications.\n- **Recover** — backups, recovery planning, lessons learned.\n\nThis maps directly to the parent repo's `nist-mapping.md`.",
    },
  },
  {
    id: "seo",
    name: "SEO",
    nameAr: "تحسين محركات البحث",
    icon: "📈",
    color: "#22c55e",
    tagline: "Search visibility, content, and technical SEO.",
    unit: "retainer",
    workflow: wf([
      { title: "Keyword research", agent: "Find high-intent keywords and cluster by topic." },
      { title: "Competitor analysis", agent: "Benchmark competitors' rankings and gaps." },
      { title: "Content plan", agent: "Build a monthly content calendar from clusters." },
      { title: "Article production", agent: "Write and optimize articles for target keywords." },
      { title: "Measurement", agent: "Track rankings, traffic, and conversions." },
      { title: "Monthly report", agent: "Deliver a monthly performance + next-steps report." },
    ]),
    pricing: [
      ["SEO audit", "KD 300 – 700", "1 – 2 weeks"],
      ["Monthly SEO retainer", "KD 400 – 1,200 / mo", "ongoing"],
      ["Content package (8 articles)", "KD 500 / mo", "ongoing"],
    ],
    agentRole:
      "You are the SEO agent for Codera. You run keyword research, analyze competitors, plan and produce content, and report measurable ranking and traffic gains every month.",
  },
  {
    id: "branding",
    name: "Branding",
    nameAr: "الهوية التجارية",
    icon: "✨",
    color: "#f59e0b",
    tagline: "Brand strategy, identity, and guidelines.",
    unit: "project",
    workflow: wf([
      { title: "Brand discovery", agent: "Interview client on values, audience, and positioning." },
      { title: "Strategy", agent: "Define positioning, voice, and personality." },
      { title: "Identity design", agent: "Logo, color, and typography concepts." },
      { title: "Guidelines", agent: "Produce a brand guidelines document." },
      { title: "Handover", agent: "Deliver assets and usage rules." },
    ]),
    pricing: [
      ["Logo + basic identity", "KD 350 – 700", "1 – 3 weeks"],
      ["Full brand identity", "KD 900 – 2,500", "3 – 6 weeks"],
    ],
    agentRole:
      "You are the Branding agent for Codera. You translate a client's values and market position into a coherent visual and verbal identity.",
  },
  {
    id: "graphic-design",
    name: "Graphic Design",
    nameAr: "التصميم الجرافيكي",
    icon: "🎨",
    color: "#ec4899",
    tagline: "Social, print, and marketing creative.",
    unit: "retainer",
    workflow: wf([
      { title: "Brief", agent: "Capture the creative brief and brand assets." },
      { title: "Concepts", agent: "Produce concept directions for review." },
      { title: "Design", agent: "Execute approved concept across deliverables." },
      { title: "Revisions", agent: "Apply feedback within the agreed rounds." },
      { title: "Delivery", agent: "Export final files in required formats." },
    ]),
    pricing: [
      ["Per-design", "KD 15 – 60", "1 – 3 days"],
      ["Social media package (20/mo)", "KD 250 / mo", "ongoing"],
    ],
    agentRole:
      "You are the Graphic Design agent for Codera. You turn briefs into on-brand creative fast, and manage revision rounds to protect throughput.",
  },
  {
    id: "ui-ux",
    name: "UI/UX",
    nameAr: "تصميم واجهات وتجربة المستخدم",
    icon: "🧩",
    color: "#14b8a6",
    tagline: "Product design, wireframes, and prototypes.",
    unit: "project",
    workflow: wf([
      { title: "Research", agent: "Understand users, tasks, and pain points." },
      { title: "Information architecture", agent: "Structure flows and navigation." },
      { title: "Wireframes", agent: "Low-fidelity layouts for validation." },
      { title: "UI design", agent: "High-fidelity screens and design system." },
      { title: "Prototype & handoff", agent: "Interactive prototype and dev handoff." },
    ]),
    pricing: [
      ["UX audit", "KD 300 – 600", "1 – 2 weeks"],
      ["Product design (app/web)", "KD 1,000 – 3,500", "3 – 7 weeks"],
    ],
    agentRole:
      "You are the UI/UX agent for Codera. You design usable, accessible product experiences and hand off clean, buildable specs.",
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    nameAr: "التسويق الرقمي",
    icon: "📣",
    color: "#f97316",
    tagline: "Paid ads, social, and campaign management.",
    unit: "retainer",
    workflow: wf([
      { title: "Goals & audience", agent: "Define objectives, KPIs, and target segments." },
      { title: "Channel plan", agent: "Choose channels and budget allocation." },
      { title: "Creative & copy", agent: "Produce ad creative and messaging." },
      { title: "Launch & optimize", agent: "Run campaigns and optimize on performance." },
      { title: "Report", agent: "Monthly performance and ROAS report." },
    ]),
    pricing: [
      ["Campaign setup", "KD 300 – 800", "1 – 2 weeks"],
      ["Monthly management", "KD 400 – 1,500 / mo", "ongoing"],
    ],
    agentRole:
      "You are the Digital Marketing agent for Codera. You plan, launch, and optimize campaigns against clear KPIs and report ROAS honestly.",
  },
  {
    id: "automation",
    name: "Automation",
    nameAr: "الأتمتة",
    icon: "⚙️",
    color: "#64748b",
    tagline: "Workflow automation and system integration.",
    unit: "project",
    workflow: wf([
      { title: "Process mapping", agent: "Map the manual process to be automated." },
      { title: "Opportunity analysis", agent: "Quantify time saved and error reduction." },
      { title: "Build", agent: "Implement the automation and integrations." },
      { title: "Test", agent: "Validate edge cases and failure handling." },
      { title: "Deploy & monitor", agent: "Roll out and monitor reliability." },
    ]),
    pricing: [
      ["Single workflow automation", "KD 400 – 1,200", "1 – 3 weeks"],
      ["Multi-system integration", "From KD 2,000", "4+ weeks"],
    ],
    agentRole:
      "You are the Automation agent for Codera. You find repetitive processes, quantify the savings, and automate them reliably with proper error handling.",
  },
  {
    id: "training",
    name: "Training",
    nameAr: "التدريب",
    icon: "🎓",
    color: "#a855f7",
    tagline: "Technical workshops and team upskilling.",
    unit: "session",
    workflow: wf([
      { title: "Needs assessment", agent: "Identify skill gaps and audience level." },
      { title: "Curriculum design", agent: "Build a tailored curriculum and materials." },
      { title: "Delivery", agent: "Run the workshop or course." },
      { title: "Assessment", agent: "Evaluate outcomes and issue certificates." },
    ]),
    pricing: [
      ["Half-day workshop", "KD 200 – 500", "1 day"],
      ["Multi-week program", "From KD 1,500", "2+ weeks"],
    ],
    agentRole:
      "You are the Training agent for Codera. You assess skill gaps, design targeted curricula, and measure learning outcomes.",
  },
  {
    id: "consulting",
    name: "Consulting",
    nameAr: "الاستشارات",
    icon: "💼",
    color: "#0ea5e9",
    tagline: "Technology strategy and advisory.",
    unit: "retainer",
    workflow: wf([
      { title: "Engagement scoping", agent: "Define the question and success criteria." },
      { title: "Assessment", agent: "Analyze current state and constraints." },
      { title: "Recommendations", agent: "Deliver a prioritized roadmap." },
      { title: "Advisory", agent: "Ongoing advisory and check-ins." },
    ]),
    pricing: [
      ["Advisory session", "KD 100 / hr", "hourly"],
      ["Strategy engagement", "From KD 2,000", "2+ weeks"],
    ],
    agentRole:
      "You are the Consulting agent for Codera. You give clear, prioritized technology advice grounded in the client's real constraints.",
  },
];

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

for (const s of CATALOG) {
  const dir = join(SERVICES, s.id);

  const service = {
    id: s.id,
    name: s.name,
    nameAr: s.nameAr,
    icon: s.icon,
    color: s.color,
    tagline: s.tagline,
    unit: s.unit,
    pricingRef: "pricing.md",
    workflowRef: "workflow.json",
    dashboardRef: "dashboard.json",
    agentRef: "agent.md",
  };
  write(join(dir, "service.json"), JSON.stringify(service, null, 2) + "\n");

  write(
    join(dir, "workflow.json"),
    JSON.stringify(
      { service: s.id, agent: `${s.name} Agent`, steps: s.workflow },
      null,
      2
    ) + "\n"
  );

  const dashboard = {
    service: s.id,
    kpis: ["active_projects", "completion", "revenue", "clients", "open_tasks"],
    panels: ["projects", "workflow", "recent_activity"],
  };
  write(join(dir, "dashboard.json"), JSON.stringify(dashboard, null, 2) + "\n");

  const rows = s.pricing
    .map(([item, price, time]) => `| ${item} | ${price} | ${time} |`)
    .join("\n");
  write(
    join(dir, "pricing.md"),
    `# ${s.name} — Pricing\n\n> ${s.tagline}\n\n| Package | Price (KWD) | Timeline |\n|---|---|---|\n${rows}\n\n_Prices are indicative starting points; the ${s.name} agent computes a firm quote from scope._\n`
  );

  write(
    join(dir, "agent.md"),
    `# ${s.name} Agent\n\n**Role**\n\n${s.agentRole}\n\n**Workflow**\n\n${s.workflow
      .map((w) => `${w.step}. ${w.title} — ${w.agent}`)
      .join("\n")}\n\n**System prompt (starter)**\n\n\`\`\`\n${s.agentRole}\n\nFollow the ${s.name} workflow step by step. At each step, confirm the\nprevious step's output before proceeding. Keep the client informed, protect\nmargins, and escalate anything outside the agreed scope.\n\`\`\`\n`
  );

  write(
    join(dir, "prompts", "intake.md"),
    `# ${s.name} — intake prompt\n\nAsk the client for: goal, timeline, budget band, and any must-have\nrequirements. Summarize back what you heard before moving to the next step.\n`
  );

  const knowledge = s.knowledge || {
    "README.md": `# ${s.name} knowledge base\n\nDrop reference docs, past proposals, and playbooks here. The ${s.name} agent\nuses everything in this folder as context.\n`,
  };
  for (const [file, content] of Object.entries(knowledge)) {
    write(join(dir, "knowledge", file), content);
  }
}

console.log(`Seeded ${CATALOG.length} services into services/`);
