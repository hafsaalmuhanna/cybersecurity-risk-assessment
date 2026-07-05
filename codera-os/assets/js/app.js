/* CODERA AI OS — application shell (vanilla JS, no dependencies). */
(function () {
  "use strict";

  const DB = window.CODERA;
  if (!DB) {
    document.getElementById("view").innerHTML =
      '<div class="empty">registry.js not loaded. Run <code>npm run build</code>.</div>';
    return;
  }

  const TODAY = "2026-07-04";
  const CUR = DB.brand.currency === "KWD" ? "KD" : DB.brand.currency;

  /* ---------------- i18n ---------------- */
  let lang = localStorage.getItem("codera-lang") || "en";
  const T = {
    en: {
      overview: "Overview", executive: "Executive Dashboard", sales: "Sales Dashboard",
      finance: "Finance Dashboard", operations: "Operations Dashboard", dashboards: "Dashboards",
      services: "Services", clients: "Clients", projects: "Projects", knowledge: "Knowledge Base",
      agents: "Agents", automations: "Automations", reports: "Reports", workspace: "Workspace",
      revenue: "Revenue (MTD)", activeClients: "Active Clients", openProjects: "Open Projects",
      pendingQuotes: "Pending Quotes", invoicesDue: "Invoices Due", leadsToday: "Leads Today",
      byService: "Services", clickHint: "Click a service to open its dedicated dashboard, agent & workflow",
      revenueTrend: "Revenue trend", last6: "Last 6 months", pipeline: "Pipeline & follow-ups",
      openInvoices: "Invoices due", client: "Client", amount: "Amount", due: "Due", stage: "Stage",
      lead: "Lead", value: "Value", service: "Service", project: "Project", status: "Status",
      progress: "Progress", activeProjects: "Active Projects", completion: "Avg Completion",
      openTasks: "Open Tasks", workflow: "Workflow", agent: "Agent", pricing: "Pricing",
      knowledgeTab: "Knowledge", overviewTab: "Overview", back: "All services",
      recentActivity: "Active projects", noProjects: "No active projects yet.",
      sector: "Sector", since: "Since", totalPipeline: "Open pipeline value",
      wonThisMonth: "Revenue this month", avgDeal: "Avg project value", conversion: "Leads → quotes",
      teamLoad: "Delivery load", overdue: "Due within 10 days", agentPipeline: "Service agents",
      runbook: "Automation runbook", steps: "steps", addServiceTitle: "Adding a service",
      addService: "Every service is a folder under services/. Add one (or run the seeder) and rebuild — it appears here automatically with its own dashboard, agent, workflow and pricing.",
      expenses: "Expenses", ownerInvestment: "Owner Investment", startupCosts: "Startup costs (one-time)",
      monthlyRecurring: "Monthly recurring", category: "Category", item: "Item", type: "Type",
      investedSoFar: "Invested so far", oneTime: "one-time", monthly: "monthly", byCategory: "By category",
      expensesNote: "Paid by the owner from a personal account. Recurring rent counts",
    },
    ar: {
      overview: "نظرة عامة", executive: "لوحة الإدارة", sales: "لوحة المبيعات",
      finance: "لوحة المالية", operations: "لوحة العمليات", dashboards: "لوحات التحكم",
      services: "الخدمات", clients: "العملاء", projects: "المشاريع", knowledge: "قاعدة المعرفة",
      agents: "الوكلاء", automations: "الأتمتة", reports: "التقارير", workspace: "مساحة العمل",
      revenue: "الإيرادات (الشهر)", activeClients: "العملاء النشطون", openProjects: "المشاريع المفتوحة",
      pendingQuotes: "عروض معلقة", invoicesDue: "فواتير مستحقة", leadsToday: "عملاء محتملون اليوم",
      byService: "الخدمات", clickHint: "اضغط على خدمة لفتح لوحتها ووكيلها وسير عملها",
      revenueTrend: "اتجاه الإيرادات", last6: "آخر ٦ أشهر", pipeline: "العملاء والمتابعات",
      openInvoices: "فواتير مستحقة", client: "العميل", amount: "المبلغ", due: "الاستحقاق", stage: "المرحلة",
      lead: "عميل محتمل", value: "القيمة", service: "الخدمة", project: "المشروع", status: "الحالة",
      progress: "التقدم", activeProjects: "المشاريع النشطة", completion: "متوسط الإنجاز",
      openTasks: "المهام المفتوحة", workflow: "سير العمل", agent: "الوكيل", pricing: "التسعير",
      knowledgeTab: "المعرفة", overviewTab: "نظرة عامة", back: "كل الخدمات",
      recentActivity: "المشاريع النشطة", noProjects: "لا توجد مشاريع نشطة بعد.",
      sector: "القطاع", since: "منذ", totalPipeline: "قيمة الفرص المفتوحة",
      wonThisMonth: "إيرادات هذا الشهر", avgDeal: "متوسط قيمة المشروع", conversion: "المحتملون ← العروض",
      teamLoad: "حِمل التنفيذ", overdue: "مستحق خلال ١٠ أيام", agentPipeline: "وكلاء الخدمات",
      runbook: "دليل الأتمتة", steps: "خطوات", addServiceTitle: "إضافة خدمة",
      addService: "كل خدمة هي مجلد داخل services/. أضِف مجلداً (أو شغّل السكربت) ثم أعد البناء — تظهر هنا تلقائياً بلوحتها ووكيلها وسير عملها وتسعيرها.",
      expenses: "المصاريف", ownerInvestment: "استثمار المالك", startupCosts: "مصاريف تأسيسية (مرة واحدة)",
      monthlyRecurring: "مصاريف شهرية متكررة", category: "الفئة", item: "البند", type: "النوع",
      investedSoFar: "المدفوع حتى الآن", oneTime: "مرة واحدة", monthly: "شهري", byCategory: "حسب الفئة",
      expensesNote: "مدفوعة من المالك من الحساب الشخصي. الإيجار المتكرر محسوب لـ",
    },
  };
  const t = (k) => (T[lang] && T[lang][k]) || T.en[k] || k;

  /* ---------------- helpers ---------------- */
  const $ = (sel) => document.querySelector(sel);
  const money = (n) => CUR + " " + Math.round(n).toLocaleString("en-US");
  const svc = (id) => DB.services.find((s) => s.id === id);
  const clientName = (id) => (DB.clients.find((c) => c.id === id) || {}).name || id;
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svcName = (s) => (lang === "ar" && s.nameAr ? s.nameAr : s.name);

  function activeProjects() {
    return DB.projects.filter((p) => p.status !== "done");
  }

  function serviceStats(id) {
    const ps = DB.projects.filter((p) => p.service === id);
    const active = ps.filter((p) => p.status !== "done");
    const clients = new Set(ps.map((p) => p.client)).size;
    const revenue = ps.reduce((a, p) => a + p.value, 0);
    const avg = active.length
      ? Math.round(active.reduce((a, p) => a + p.completion, 0) / active.length)
      : 0;
    const s = svc(id);
    const totalSteps = s ? (s.workflow.steps || []).length : 0;
    const openTasks = active.reduce((a, p) => a + Math.max(0, totalSteps - (p.step || 0)), 0);
    return { projects: ps, active, clients, revenue, avg, openTasks, totalSteps };
  }

  function globalKPIs() {
    const mr = DB.finance.monthly_revenue;
    const thisMonth = mr[mr.length - 1].revenue;
    const prev = mr[mr.length - 2].revenue;
    const delta = Math.round(((thisMonth - prev) / prev) * 100);
    return {
      revenue: thisMonth,
      revenueDelta: delta,
      activeClients: DB.clients.filter((c) => c.status === "active").length,
      openProjects: activeProjects().length,
      pendingQuotes: DB.leads.filter((l) => l.stage === "quote_sent").length,
      invoicesDue: DB.finance.invoices.filter((i) => i.status === "due").length,
      leadsToday: DB.leads.filter((l) => l.date === TODAY).length,
    };
  }

  /* ---------------- tiny markdown ---------------- */
  function md(src) {
    const lines = src.split("\n");
    let html = "", inTable = false, tbl = [];
    const flush = () => {
      if (!tbl.length) return;
      const rows = tbl.filter((r) => !/^\s*\|[\s:|-]+\|\s*$/.test(r));
      html += '<table><thead>';
      rows.forEach((r, i) => {
        const cells = r.split("|").slice(1, -1).map((c) => c.trim());
        const tag = i === 0 ? "th" : "td";
        if (i === 1) html += "</thead><tbody>";
        html += "<tr>" + cells.map((c) => `<${tag}>${inline(c)}</${tag}>`).join("") + "</tr>";
      });
      html += "</tbody></table>";
      tbl = []; inTable = false;
    };
    const inline = (s) =>
      esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    for (const raw of lines) {
      const line = raw.replace(/\r$/, "");
      if (/^\s*\|.*\|\s*$/.test(line)) { inTable = true; tbl.push(line); continue; }
      if (inTable) flush();
      if (/^### /.test(line)) html += `<h3>${inline(line.slice(4))}</h3>`;
      else if (/^## /.test(line)) html += `<h2>${inline(line.slice(3))}</h2>`;
      else if (/^# /.test(line)) html += `<h1>${inline(line.slice(2))}</h1>`;
      else if (/^> /.test(line)) html += `<blockquote>${inline(line.slice(2))}</blockquote>`;
      else if (/^\d+\. /.test(line)) html += `<div>${inline(line)}</div>`;
      else if (/^```/.test(line)) html += "";
      else if (line.trim() === "") html += "";
      else html += `<p>${inline(line)}</p>`;
    }
    flush();
    return html;
  }

  /* ---------------- charts ---------------- */
  function barChart(series, color) {
    const w = 520, h = 160, pad = 24;
    const max = Math.max(...series.map((s) => s.revenue)) * 1.1;
    const bw = (w - pad * 2) / series.length;
    let bars = "", labels = "";
    series.forEach((s, i) => {
      const bh = ((h - pad * 2) * s.revenue) / max;
      const x = pad + i * bw + bw * 0.2;
      const y = h - pad - bh;
      bars += `<rect x="${x}" y="${y}" width="${bw * 0.6}" height="${bh}" rx="5" fill="url(#g)"></rect>`;
      bars += `<text x="${x + bw * 0.3}" y="${y - 6}" fill="#93a0c4" font-size="10" text-anchor="middle">${Math.round(s.revenue / 1000)}k</text>`;
      labels += `<text x="${x + bw * 0.3}" y="${h - 6}" fill="#6b78a0" font-size="10" text-anchor="middle">${s.month.slice(5)}</text>`;
    });
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="${color}66"/>
      </linearGradient></defs>${bars}${labels}</svg>`;
  }

  /* ---------------- components ---------------- */
  function kpi(label, value, opts = {}) {
    const glow = opts.glow ? ` style="--glow:${opts.glow}"` : "";
    const delta = opts.delta != null
      ? `<div class="delta ${opts.delta >= 0 ? "up" : "down"}">${opts.delta >= 0 ? "▲" : "▼"} ${Math.abs(opts.delta)}% ${opts.deltaNote || ""}</div>`
      : "";
    return `<div class="kpi"${glow}><div class="label">${label}</div><div class="value">${value}</div>${delta}</div>`;
  }

  function projectRow(p) {
    const s = svc(p.service) || {};
    return `<tr>
      <td><strong>${esc(p.name)}</strong><div style="color:var(--muted-2);font-size:11px">${s.icon || ""} ${esc(svcName(s) || p.service)}</div></td>
      <td>${esc(clientName(p.client))}</td>
      <td><span class="pill ${p.status}">${p.status.replace("_", " ")}</span></td>
      <td><span class="mini-bar"><span style="width:${p.completion}%"></span></span> ${p.completion}%</td>
      <td>${money(p.value)}</td>
      <td style="color:var(--muted-2)">${p.due}</td>
    </tr>`;
  }

  function projectsTable(list) {
    if (!list.length) return `<div class="empty">${t("noProjects")}</div>`;
    return `<div class="table-wrap"><table><thead><tr>
      <th>${t("project")}</th><th>${t("client")}</th><th>${t("status")}</th>
      <th>${t("progress")}</th><th>${t("value")}</th><th>${t("due")}</th>
    </tr></thead><tbody>${list.map(projectRow).join("")}</tbody></table></div>`;
  }

  /* ---------------- views ---------------- */
  function viewOverview() {
    const k = globalKPIs();
    const services = DB.services
      .map((s) => {
        const st = serviceStats(s.id);
        return `<div class="service-card" style="--svc:${s.color}" onclick="location.hash='#/service/${s.id}'">
          <div class="top">
            <div class="emoji">${s.icon}</div>
            <div class="name">${esc(svcName(s))}<span class="ar">${esc(lang === "ar" ? s.name : s.nameAr)}</span></div>
          </div>
          <div class="stats">
            <div class="stat"><div class="n">${st.active.length}</div><div class="l">${t("activeProjects")}</div></div>
            <div class="stat"><div class="n">${money(st.revenue)}</div><div class="l">${t("value")}</div></div>
          </div>
          <div class="bar"><span style="width:${st.avg}%"></span></div>
        </div>`;
      })
      .join("");

    const invoices = DB.finance.invoices
      .filter((i) => i.status === "due")
      .map((i) => `<tr><td>${esc(clientName(i.client))}</td><td>${money(i.amount)}</td><td style="color:var(--muted-2)">${i.due}</td></tr>`)
      .join("");

    const leads = DB.leads
      .map((l) => {
        const s = svc(l.service) || {};
        return `<tr><td>${esc(l.name)}</td><td>${s.icon || ""} ${esc(svcName(s) || l.service)}</td><td>${money(l.value)}</td><td><span class="pill ${l.stage === "quote_sent" ? "review" : l.stage === "qualified" ? "in_progress" : "planning"}">${l.stage.replace("_", " ")}</span></td></tr>`;
      })
      .join("");

    return `
      <div class="kpi-row">
        ${kpi(t("revenue"), money(k.revenue), { glow: "rgba(34,211,238,0.3)", delta: k.revenueDelta, deltaNote: "vs last mo" })}
        ${kpi(t("activeClients"), k.activeClients, { glow: "rgba(79,140,255,0.3)" })}
        ${kpi(t("openProjects"), k.openProjects, { glow: "rgba(139,92,246,0.3)" })}
        ${kpi(t("pendingQuotes"), k.pendingQuotes, { glow: "rgba(245,158,11,0.3)" })}
        ${kpi(t("invoicesDue"), k.invoicesDue, { glow: "rgba(239,68,68,0.3)" })}
        ${kpi(t("leadsToday"), k.leadsToday, { glow: "rgba(34,197,94,0.3)" })}
      </div>

      <div class="grid cols-2">
        <div class="panel">
          <h3>${t("revenueTrend")} <span style="color:var(--muted-2);font-weight:400;font-size:12px">· ${t("last6")}</span></h3>
          ${barChart(DB.finance.monthly_revenue, "#4f8cff")}
        </div>
        <div class="panel">
          <h3>${t("openInvoices")}</h3>
          <div class="table-wrap"><table><thead><tr><th>${t("client")}</th><th>${t("amount")}</th><th>${t("due")}</th></tr></thead><tbody>${invoices}</tbody></table></div>
        </div>
      </div>

      <div class="section-title">${t("byService")} <span class="hint">— ${t("clickHint")}</span></div>
      <div class="service-grid">${services}</div>

      <div class="section-title">${t("pipeline")}</div>
      <div class="panel"><div class="table-wrap"><table><thead><tr>
        <th>${t("lead")}</th><th>${t("service")}</th><th>${t("value")}</th><th>${t("stage")}</th>
      </tr></thead><tbody>${leads}</tbody></table></div></div>

      <div class="gen-note">${DB.brand.company} · built ${DB.generatedAt.slice(0, 10)} · ${DB.services.length} services registered</div>
    `;
  }

  function viewService(id) {
    const s = svc(id);
    if (!s) return `<div class="empty">Unknown service.</div>`;
    const st = serviceStats(id);
    const tab = (location.hash.split("/")[3] || "overview");

    const tabLabel = { overview: t("overviewTab"), workflow: t("workflow"), agent: t("agent"), pricing: t("pricing"), knowledge: t("knowledgeTab") };
    const tabs = ["overview", "workflow", "agent", "pricing", "knowledge"]
      .map((x) => `<div class="tab ${x === tab ? "active" : ""}" onclick="location.hash='#/service/${id}/${x}'">${tabLabel[x]}</div>`)
      .join("");

    let body = "";
    if (tab === "workflow") {
      const maxStep = Math.max(0, ...st.active.map((p) => p.step || 0));
      const items = (s.workflow.steps || [])
        .map((w) => {
          const cls = w.step < maxStep ? "done" : w.step === maxStep ? "active" : "";
          return `<li class="${cls}"><span class="node"></span>
            <div class="t-step">STEP ${w.step}</div>
            <div class="t-title">${esc(w.title)}</div>
            <div class="t-desc">${esc(w.agent)}</div></li>`;
        })
        .join("");
      body = `<div class="panel"><h3>${esc(s.workflow.agent || s.name)} · ${t("workflow")}</h3><ul class="timeline">${items}</ul></div>`;
    } else if (tab === "agent") {
      body = `<div class="agent-card">
        <div class="who"><div class="av">${s.icon}</div><div><strong>${esc(s.name)} Agent</strong><div style="color:var(--muted-2);font-size:12px">${(s.workflow.steps || []).length} ${t("steps")} · autonomous pipeline</div></div></div>
        <div class="md-body">${md(s.agent || "")}</div>
      </div>`;
    } else if (tab === "pricing") {
      body = `<div class="panel md-body">${md(s.pricing || "")}</div>`;
    } else if (tab === "knowledge") {
      const files = Object.keys(s.knowledge || {});
      const prompts = Object.keys(s.prompts || {});
      body = `<div class="panel">
        <h3>knowledge/ <span style="color:var(--muted-2);font-weight:400">— agent context</span></h3>
        <div class="md-body">${md(Object.values(s.knowledge || {})[0] || "_empty_")}</div>
        <div style="margin-top:14px">${files.map((f) => `<span class="chip">📄 ${esc(f)}</span>`).join("")}</div>
        <h3 style="margin-top:20px">prompts/</h3>
        <div>${prompts.map((f) => `<span class="chip">💬 ${esc(f)}</span>`).join("")}</div>
      </div>`;
    } else {
      body = `
        <div class="kpi-row">
          ${kpi(t("activeProjects"), st.active.length, { glow: s.color + "55" })}
          ${kpi(t("completion"), st.avg + "%", { glow: s.color + "55" })}
          ${kpi(t("revenue"), money(st.revenue), { glow: s.color + "55" })}
          ${kpi(t("clients"), st.clients, { glow: s.color + "55" })}
          ${kpi(t("openTasks"), st.openTasks, { glow: s.color + "55" })}
        </div>
        <div class="section-title">${t("recentActivity")}</div>
        <div class="panel">${projectsTable(st.active)}</div>`;
    }

    return `
      <div class="svc-hero" style="--svc:${s.color}">
        <div class="emoji">${s.icon}</div>
        <div style="flex:1">
          <h2>${esc(svcName(s))} <span style="color:var(--muted-2);font-size:14px;font-weight:400">${esc(lang === "ar" ? s.name : s.nameAr)}</span></h2>
          <div class="tagline">${esc(s.tagline)}</div>
        </div>
        <button class="btn ghost" onclick="location.hash='#/overview'">← ${t("back")}</button>
      </div>
      <div class="tabs">${tabs}</div>
      ${body}`;
  }

  function viewExecutive() {
    const k = globalKPIs();
    const totalPipeline = DB.leads.reduce((a, l) => a + l.value, 0);
    const active = activeProjects();
    const avgDeal = Math.round(DB.projects.reduce((a, p) => a + p.value, 0) / DB.projects.length);
    const conv = Math.round((DB.leads.filter((l) => l.stage === "quote_sent").length / DB.leads.length) * 100);
    const byRevenue = DB.services
      .map((s) => ({ s, r: serviceStats(s.id).revenue }))
      .sort((a, b) => b.r - a.r)
      .slice(0, 6)
      .map(({ s, r }) => `<tr><td>${s.icon} ${esc(svcName(s))}</td><td>${money(r)}</td><td><span class="mini-bar"><span style="width:${(r / serviceStats(byRevenueTop()).revenue) * 100 || 100}%"></span></span></td></tr>`)
      .join("");
    function byRevenueTop() {
      return DB.services.map((s) => s.id).sort((a, b) => serviceStats(b).revenue - serviceStats(a).revenue)[0];
    }
    return `
      <div class="kpi-row">
        ${kpi(t("wonThisMonth"), money(k.revenue), { glow: "rgba(34,211,238,0.3)", delta: k.revenueDelta })}
        ${kpi(t("totalPipeline"), money(totalPipeline), { glow: "rgba(245,158,11,0.3)" })}
        ${kpi(t("openProjects"), active.length, { glow: "rgba(139,92,246,0.3)" })}
        ${kpi(t("avgDeal"), money(avgDeal), { glow: "rgba(79,140,255,0.3)" })}
        ${kpi(t("conversion"), conv + "%", { glow: "rgba(34,197,94,0.3)" })}
      </div>
      <div class="grid cols-2">
        <div class="panel"><h3>${t("revenueTrend")}</h3>${barChart(DB.finance.monthly_revenue, "#22d3ee")}</div>
        <div class="panel"><h3>Top services by booked value</h3><div class="table-wrap"><table><tbody>${byRevenue}</tbody></table></div></div>
      </div>`;
  }

  function viewSales() {
    const leads = DB.leads.slice().sort((a, b) => b.value - a.value);
    const rows = leads
      .map((l) => {
        const s = svc(l.service) || {};
        return `<tr><td><strong>${esc(l.name)}</strong></td><td>${s.icon || ""} ${esc(svcName(s) || l.service)}</td><td>${money(l.value)}</td><td><span class="pill ${l.stage === "quote_sent" ? "review" : l.stage === "qualified" ? "in_progress" : "planning"}">${l.stage.replace("_", " ")}</span></td><td style="color:var(--muted-2)">${l.date}</td></tr>`;
      })
      .join("");
    const total = leads.reduce((a, l) => a + l.value, 0);
    const byStage = ["new", "qualified", "quote_sent"].map((st) => ({
      st, n: leads.filter((l) => l.stage === st).length,
    }));
    return `
      <div class="kpi-row">
        ${kpi(t("totalPipeline"), money(total), { glow: "rgba(245,158,11,0.3)" })}
        ${byStage.map((b) => kpi(b.st.replace("_", " "), b.n, { glow: "rgba(79,140,255,0.25)" })).join("")}
        ${kpi(t("leadsToday"), globalKPIs().leadsToday, { glow: "rgba(34,197,94,0.3)" })}
      </div>
      <div class="panel"><h3>${t("pipeline")}</h3><div class="table-wrap"><table><thead><tr>
        <th>${t("lead")}</th><th>${t("service")}</th><th>${t("value")}</th><th>${t("stage")}</th><th>${t("due")}</th>
      </tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }

  function viewFinance() {
    const k = globalKPIs();
    const inv = DB.finance.invoices;
    const due = inv.filter((i) => i.status === "due").reduce((a, i) => a + i.amount, 0);
    const paid = inv.filter((i) => i.status === "paid").reduce((a, i) => a + i.amount, 0);
    const rows = inv
      .map((i) => `<tr><td>${esc(clientName(i.client))}</td><td>${money(i.amount)}</td><td><span class="pill ${i.status}">${i.status}</span></td><td style="color:var(--muted-2)">${i.due}</td></tr>`)
      .join("");
    return `
      <div class="kpi-row">
        ${kpi(t("revenue"), money(k.revenue), { glow: "rgba(34,211,238,0.3)", delta: k.revenueDelta })}
        ${kpi(t("invoicesDue"), money(due), { glow: "rgba(239,68,68,0.3)" })}
        ${kpi("Collected", money(paid), { glow: "rgba(34,197,94,0.3)" })}
        ${kpi(t("ownerInvestment"), money(DB.expenses.totals.investedSoFar), { glow: "rgba(139,92,246,0.3)" })}
      </div>
      <div style="margin:-8px 0 18px"><button class="btn ghost" onclick="location.hash='#/expenses'">${DB.expenses.totals ? "→ " + t("expenses") : ""}</button></div>
      <div class="grid cols-2">
        <div class="panel"><h3>${t("revenueTrend")}</h3>${barChart(DB.finance.monthly_revenue, "#22c55e")}</div>
        <div class="panel"><h3>Invoices</h3><div class="table-wrap"><table><thead><tr><th>${t("client")}</th><th>${t("amount")}</th><th>${t("status")}</th><th>${t("due")}</th></tr></thead><tbody>${rows}</tbody></table></div></div>
      </div>`;
  }

  function viewOperations() {
    const active = activeProjects();
    const overdue = active.filter((p) => p.due <= "2026-07-14").length;
    const load = DB.services
      .map((s) => ({ s, n: serviceStats(s.id).active.length }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);
    const maxLoad = Math.max(...load.map((l) => l.n));
    const loadRows = load
      .map(({ s, n }) => `<tr><td>${s.icon} ${esc(svcName(s))}</td><td>${n}</td><td><span class="mini-bar"><span style="width:${(n / maxLoad) * 100}%"></span></span></td></tr>`)
      .join("");
    return `
      <div class="kpi-row">
        ${kpi(t("openProjects"), active.length, { glow: "rgba(139,92,246,0.3)" })}
        ${kpi(t("overdue"), overdue, { glow: "rgba(239,68,68,0.3)" })}
        ${kpi("In review", active.filter((p) => p.status === "review").length, { glow: "rgba(245,158,11,0.3)" })}
        ${kpi("Avg completion", Math.round(active.reduce((a, p) => a + p.completion, 0) / active.length) + "%", { glow: "rgba(34,211,238,0.3)" })}
      </div>
      <div class="grid cols-2">
        <div class="panel"><h3>${t("teamLoad")}</h3><div class="table-wrap"><table><tbody>${loadRows}</tbody></table></div></div>
        <div class="panel"><h3>${t("recentActivity")}</h3>${projectsTable(active.slice().sort((a, b) => a.due.localeCompare(b.due)).slice(0, 8))}</div>
      </div>`;
  }

  function viewClients() {
    const rows = DB.clients
      .map((c) => {
        const ps = DB.projects.filter((p) => p.client === c.id);
        const val = ps.reduce((a, p) => a + p.value, 0);
        return `<tr><td><strong>${esc(c.name)}</strong></td><td>${esc(c.sector)}</td><td>${ps.length}</td><td>${money(val)}</td><td><span class="pill ${c.status === "active" ? "done" : "planning"}">${c.status}</span></td><td style="color:var(--muted-2)">${c.since}</td></tr>`;
      })
      .join("");
    return `<div class="panel"><h3>${t("clients")} · ${DB.clients.length}</h3><div class="table-wrap"><table><thead><tr>
      <th>${t("client")}</th><th>${t("sector")}</th><th>${t("projects")}</th><th>${t("value")}</th><th>${t("status")}</th><th>${t("since")}</th>
    </tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }

  function viewProjects() {
    return `<div class="panel"><h3>${t("projects")} · ${DB.projects.length}</h3>${projectsTable(DB.projects.slice().sort((a, b) => a.due.localeCompare(b.due)))}</div>`;
  }

  function viewAgents() {
    const cards = DB.services
      .map((s) => `<div class="service-card" style="--svc:${s.color}" onclick="location.hash='#/service/${s.id}/agent'">
        <div class="top"><div class="emoji">${s.icon}</div><div class="name">${esc(svcName(s))} Agent<span class="ar">${(s.workflow.steps || []).length} ${t("steps")}</span></div></div>
        <div style="color:var(--muted);font-size:12px;margin-top:12px;line-height:1.5">${esc((s.tagline))}</div>
      </div>`)
      .join("");
    return `<div class="section-title">${t("agentPipeline")} <span class="hint">— one autonomous agent per service</span></div><div class="service-grid">${cards}</div>`;
  }

  function viewAutomations() {
    const cards = DB.services
      .map((s) => {
        const steps = (s.workflow.steps || [])
          .map((w) => `<span class="chip">${w.step}. ${esc(w.title)}</span>`)
          .join(" ");
        return `<div class="panel" style="border-left:3px solid ${s.color}"><h3>${s.icon} ${esc(svcName(s))} <span style="color:var(--muted-2);font-weight:400;font-size:12px">— ${(s.workflow.steps || []).length} ${t("steps")}</span></h3><div>${steps}</div></div>`;
      })
      .join("");
    return `<div class="section-title">${t("runbook")}</div><div class="grid" style="gap:14px">${cards}</div>`;
  }

  function viewExpenses() {
    const e = DB.expenses;
    const label = (i) => (lang === "ar" && i.labelAr ? i.labelAr : i.label);
    const months = e.months_rent_paid || 0;
    const catColors = { Software: "#06b6d4", Office: "#8b5cf6", Rent: "#f59e0b", Legal: "#ec4899", Government: "#ef4444", Banking: "#22c55e" };

    // Category rollup (one-time only, for the mix chart)
    const byCat = {};
    e.items.filter((i) => i.type === "one_time").forEach((i) => { byCat[i.category] = (byCat[i.category] || 0) + i.amount; });
    const catRows = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .map(([c, v]) => `<tr><td><span class="dot" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${catColors[c] || "#4f8cff"};margin-right:7px"></span>${esc(c)}</td><td>${money(v)}</td><td style="color:var(--muted-2)">${Math.round((v / e.totals.oneTime) * 100)}%</td><td><span class="mini-bar"><span style="width:${(v / e.totals.oneTime) * 100}%"></span></span></td></tr>`)
      .join("");

    const rows = e.items
      .map((i) => `<tr>
        <td><strong>${esc(label(i))}</strong></td>
        <td><span class="dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${catColors[i.category] || "#4f8cff"};margin-right:6px"></span>${esc(i.category)}</td>
        <td><span class="pill ${i.type === "monthly" ? "review" : "planning"}">${i.type === "monthly" ? t("monthly") : t("oneTime")}</span></td>
        <td style="text-align:right;font-weight:600">${money(i.amount)}${i.type === "monthly" ? ` <span style="color:var(--muted-2);font-weight:400">/mo</span>` : ""}</td>
      </tr>`)
      .join("");

    return `
      <div class="kpi-row">
        ${kpi(t("investedSoFar"), money(e.totals.investedSoFar), { glow: "rgba(34,211,238,0.35)" })}
        ${kpi(t("startupCosts"), money(e.totals.oneTime), { glow: "rgba(139,92,246,0.3)" })}
        ${kpi(t("monthlyRecurring"), money(e.totals.monthly), { glow: "rgba(245,158,11,0.3)" })}
        ${kpi("Rent paid (" + months + " mo)", money(e.totals.recurringPaid), { glow: "rgba(34,197,94,0.3)" })}
      </div>

      <div class="grid cols-2">
        <div class="panel">
          <h3>${t("ownerInvestment")} <span style="color:var(--muted-2);font-weight:400;font-size:12px">— ${t("expensesNote")} ${months} ${lang === "ar" ? "شهر" : "mo"}</span></h3>
          <div class="table-wrap"><table><thead><tr>
            <th>${t("item")}</th><th>${t("category")}</th><th>${t("type")}</th><th style="text-align:right">${t("amount")}</th>
          </tr></thead><tbody>${rows}</tbody>
          <tfoot><tr><td colspan="3"><strong>${t("investedSoFar")}</strong></td><td style="text-align:right"><strong>${money(e.totals.investedSoFar)}</strong></td></tr></tfoot>
          </table></div>
        </div>
        <div class="panel">
          <h3>${t("byCategory")}</h3>
          <div class="table-wrap"><table><tbody>${catRows}</tbody></table></div>
        </div>
      </div>`;
  }

  function viewKnowledge() {
    const cards = DB.services
      .map((s) => {
        const kfiles = Object.keys(s.knowledge || {});
        const pfiles = Object.keys(s.prompts || {});
        return `<div class="panel" style="border-left:3px solid ${s.color}">
          <h3>${s.icon} ${esc(svcName(s))}</h3>
          <div style="color:var(--muted-2);font-size:11px;margin-bottom:8px">knowledge/</div>
          <div>${kfiles.map((f) => `<span class="chip" style="cursor:pointer" onclick="location.hash='#/service/${s.id}/knowledge'">📄 ${esc(f)}</span>`).join("") || '<span class="chip">—</span>'}</div>
          <div style="color:var(--muted-2);font-size:11px;margin:10px 0 8px">prompts/</div>
          <div>${pfiles.map((f) => `<span class="chip">💬 ${esc(f)}</span>`).join("") || '<span class="chip">—</span>'}</div>
        </div>`;
      })
      .join("");
    return `<div class="section-title">${t("knowledge")} <span class="hint">— per-service agent context (knowledge/ + prompts/)</span></div><div class="grid" style="gap:14px">${cards}</div>`;
  }

  function viewReports() {
    const rows = DB.services
      .map((s) => {
        const st = serviceStats(s.id);
        return `<tr><td>${s.icon} ${esc(svcName(s))}</td><td>${st.active.length}</td><td>${st.avg}%</td><td>${st.clients}</td><td>${money(st.revenue)}</td><td>${st.openTasks}</td></tr>`;
      })
      .join("");
    const total = DB.services.reduce((a, s) => a + serviceStats(s.id).revenue, 0);
    return `<div class="panel"><h3>${t("reports")} — service performance</h3><div class="table-wrap"><table><thead><tr>
      <th>${t("service")}</th><th>${t("activeProjects")}</th><th>${t("completion")}</th><th>${t("clients")}</th><th>${t("value")}</th><th>${t("openTasks")}</th>
    </tr></thead><tbody>${rows}</tbody><tfoot><tr><td><strong>Total</strong></td><td>${activeProjects().length}</td><td>—</td><td>${DB.clients.length}</td><td><strong>${money(total)}</strong></td><td>—</td></tr></tfoot></table></div></div>
    <div class="panel" style="margin-top:16px"><h3>${t("addServiceTitle")}</h3><p class="md-body" style="color:var(--muted)">${t("addService")}</p><pre style="white-space:pre-wrap;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--muted);font-size:12px">services/&lt;new-service&gt;/
  service.json · workflow.json · dashboard.json
  pricing.md · agent.md · knowledge/ · prompts/

$ npm run build   →  registered automatically</pre></div>`;
  }

  /* ---------------- routing ---------------- */
  const ROUTES = {
    overview: { title: () => t("overview"), crumb: () => t("executive"), render: viewOverview },
    "dashboard/executive": { title: () => t("executive"), crumb: () => t("dashboards"), render: viewExecutive },
    "dashboard/sales": { title: () => t("sales"), crumb: () => t("dashboards"), render: viewSales },
    "dashboard/finance": { title: () => t("finance"), crumb: () => t("dashboards"), render: viewFinance },
    expenses: { title: () => t("expenses"), crumb: () => t("finance"), render: viewExpenses },
    "dashboard/operations": { title: () => t("operations"), crumb: () => t("dashboards"), render: viewOperations },
    clients: { title: () => t("clients"), crumb: () => t("workspace"), render: viewClients },
    projects: { title: () => t("projects"), crumb: () => t("workspace"), render: viewProjects },
    agents: { title: () => t("agents"), crumb: () => t("workspace"), render: viewAgents },
    automations: { title: () => t("automations"), crumb: () => t("workspace"), render: viewAutomations },
    knowledge: { title: () => t("knowledge"), crumb: () => t("workspace"), render: viewKnowledge },
    reports: { title: () => t("reports"), crumb: () => t("workspace"), render: viewReports },
  };

  function router() {
    const hash = location.hash.replace(/^#\//, "") || "overview";
    const parts = hash.split("/");
    let title, crumb, htmlOut;

    if (parts[0] === "service" && parts[1]) {
      const s = svc(parts[1]);
      title = s ? svcName(s) : "Service";
      crumb = t("services");
      htmlOut = viewService(parts[1]);
    } else {
      const key = parts.slice(0, 2).join("/");
      const r = ROUTES[key] || ROUTES[parts[0]] || ROUTES.overview;
      title = r.title();
      crumb = r.crumb();
      htmlOut = r.render();
    }
    $("#page-title").textContent = title;
    $("#page-crumb").textContent = crumb;
    $("#view").innerHTML = htmlOut;
    $("#view").scrollTop = 0;
    renderNav(hash);
  }

  /* ---------------- sidebar ---------------- */
  function renderNav(hash) {
    const active = (h) => (hash === h || (h !== "overview" && hash.startsWith(h)) ? "active" : "");
    const item = (h, ico, label, count) =>
      `<div class="nav-item ${active(h)}" onclick="location.hash='#/${h}'"><span class="ico">${ico}</span>${label}${count != null ? `<span class="count">${count}</span>` : ""}</div>`;

    const servicesOpen = hash.startsWith("service") ? "open" : "";
    const serviceItems = DB.services
      .map((s) => {
        const st = serviceStats(s.id);
        return `<div class="nav-item ${hash === "service/" + s.id || hash.startsWith("service/" + s.id + "/") ? "active" : ""}" onclick="location.hash='#/service/${s.id}'">
          <span class="dot" style="background:${s.color}"></span>${esc(svcName(s))}<span class="count">${st.active.length}</span></div>`;
      })
      .join("");

    $("#nav").innerHTML = `
      ${item("overview", "🏠", t("overview"))}
      <div class="nav-group-label">${t("dashboards")}</div>
      ${item("dashboard/executive", "📊", t("executive"))}
      ${item("dashboard/sales", "💰", t("sales"))}
      ${item("dashboard/finance", "🧾", t("finance"))}
      ${item("expenses", "🧮", t("expenses"))}
      ${item("dashboard/operations", "🛠️", t("operations"))}
      <div class="nav-group-label">${t("services")}</div>
      <div class="nav-item ${servicesOpen ? "active" : ""}" onclick="this.nextElementSibling.classList.toggle('open')"><span class="ico">🧱</span>${t("services")}<span class="count">${DB.services.length}</span></div>
      <div class="nav-sub ${servicesOpen}">${serviceItems}</div>
      <div class="nav-group-label">${t("workspace")}</div>
      ${item("clients", "👥", t("clients"), DB.clients.length)}
      ${item("projects", "📁", t("projects"), DB.projects.length)}
      ${item("knowledge", "📚", t("knowledge"))}
      ${item("agents", "🤖", t("agents"), DB.services.length)}
      ${item("automations", "⚡", t("automations"))}
      ${item("reports", "📈", t("reports"))}
    `;
  }

  /* ---------------- lang + search ---------------- */
  function applyLang() {
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
    $("#lang").textContent = lang === "ar" ? "EN" : "ع";
    $("#search").placeholder = lang === "ar" ? "ابحث في العملاء والمشاريع والخدمات…" : "Search clients, projects, services…";
    router();
  }
  $("#lang").addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("codera-lang", lang);
    applyLang();
  });

  $("#search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return router();
    const hits = [];
    DB.services.forEach((s) => {
      if ((s.name + s.nameAr + s.tagline).toLowerCase().includes(q)) hits.push({ type: "Service", label: `${s.icon} ${svcName(s)}`, hash: `service/${s.id}` });
    });
    DB.clients.forEach((c) => { if (c.name.toLowerCase().includes(q)) hits.push({ type: t("client"), label: c.name, hash: "clients" }); });
    DB.projects.forEach((p) => { if (p.name.toLowerCase().includes(q)) hits.push({ type: t("project"), label: p.name, hash: `service/${p.service}` }); });
    $("#view").innerHTML = `<div class="section-title">Search · ${hits.length}</div>` +
      (hits.length ? `<div class="panel"><div class="table-wrap"><table><tbody>${hits.slice(0, 30).map((h) => `<tr onclick="location.hash='#/${h.hash}'" style="cursor:pointer"><td style="color:var(--muted-2);width:100px">${h.type}</td><td>${esc(h.label)}</td></tr>`).join("")}</tbody></table></div></div>` : `<div class="empty">No matches.</div>`);
  });

  window.addEventListener("hashchange", () => { $("#search").value = ""; router(); });
  applyLang();
})();
