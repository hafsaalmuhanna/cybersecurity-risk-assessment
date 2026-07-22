/* CODERA · CEO Dashboard — your life, run like a company.
   Interactive: everything you add/tick is saved in your browser (localStorage),
   seeded from data/life/*.json. No server, no dependencies. */
(function () {
  "use strict";

  const DB = window.CODERA || {};
  const SEED = DB.life || { areas: [], goals: [], actions: [], captures: [], habits: [] };
  const FIN = DB.financials ? DB.financials.report : null;
  const CUR = (DB.brand && DB.brand.currency) === "KWD" ? "KD" : (DB.brand && DB.brand.currency) || "KD";
  const TODAY = "2026-07-22";

  /* ---------- store (localStorage, seeded once) ---------- */
  const LSK = "codera-ceo:v2:";
  const S = {};
  function load(coll) {
    try {
      const raw = localStorage.getItem(LSK + coll);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const copy = JSON.parse(JSON.stringify(SEED[coll] || []));
    try { localStorage.setItem(LSK + coll, JSON.stringify(copy)); } catch (e) {}
    return copy;
  }
  function save(coll) {
    try { localStorage.setItem(LSK + coll, JSON.stringify(S[coll])); } catch (e) {}
  }
  ["areas", "goals", "actions", "captures", "habits"].forEach((c) => (S[c] = load(c)));
  const uid = () => "x" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);

  /* ---------- i18n ---------- */
  let lang = localStorage.getItem("codera-lang") || "en";
  const T = {
    en: {
      cockpit: "Cockpit", capture: "Capture", followups: "Follow-ups", goals: "Goals",
      habits: "Habits", areas: "Life areas", ceo: "CEO Dashboard", overview: "Overview",
      weeklyFocus: "This week's focus", openFollowups: "Open follow-ups", dueThisWeek: "Due / overdue",
      goalsOnTrack: "Goals moving", lifeBalance: "Life balance", inbox: "Inbox",
      quickPlaceholder: "What's on your mind? Type it and press Enter to capture…",
      topFollowups: "Top follow-ups", insights: "Insights", recentCaptures: "Recent captures",
      whatToDo: "What to do", whatToProvide: "What to provide / deliver", provide: "Provide",
      addAction: "Add a follow-up…", addGoal: "Add a goal…", triage: "Make it an action",
      done: "done", todo: "to do", high: "high", med: "med", low: "low", priority: "Priority",
      due: "Due", noItems: "Nothing here yet — add the first one above.",
      thisWeek: "this week", ofWeek: "of", score: "Score", nextGoal: "Next goal", openTasks: "open",
      backBiz: "Business OS", resetDefaults: "Reset to sample data", areaFocus: "Focus",
      progress: "Progress", habitWeek: "This week", greet: "Your day, CEO",
      greetSub: "Capture what's in your head. Decide what to do. Track every area.",
      convert: "→ follow-up", del: "Delete", noInbox: "Inbox is clear. Nicely done.",
      inWeek: "In your week", integrate: "Numbers pulled from your Codera financials.",
    },
    ar: {
      cockpit: "قمرة القيادة", capture: "التقاط الأفكار", followups: "المتابعات", goals: "الأهداف",
      habits: "العادات", areas: "مجالات الحياة", ceo: "لوحة القيادة", overview: "نظرة عامة",
      weeklyFocus: "تركيز هذا الأسبوع", openFollowups: "متابعات مفتوحة", dueThisWeek: "مستحقة / متأخرة",
      goalsOnTrack: "أهداف تتحرك", lifeBalance: "توازن الحياة", inbox: "الوارد",
      quickPlaceholder: "شنو في بالك؟ اكتبيه واضغطي Enter لالتقاطه…",
      topFollowups: "أهم المتابعات", insights: "رؤى وتحليلات", recentCaptures: "أحدث الأفكار",
      whatToDo: "ماذا أفعل", whatToProvide: "ماذا أقدّم / أُسلّم", provide: "تقديم",
      addAction: "أضيفي متابعة…", addGoal: "أضيفي هدف…", triage: "حوّليها لمهمة",
      done: "منجز", todo: "قيد التنفيذ", high: "عالٍ", med: "متوسط", low: "منخفض", priority: "الأولوية",
      due: "الاستحقاق", noItems: "لا شيء بعد — أضيفي أول عنصر بالأعلى.",
      thisWeek: "هذا الأسبوع", ofWeek: "من", score: "التقييم", nextGoal: "الهدف التالي", openTasks: "مفتوحة",
      backBiz: "نظام العمل", resetDefaults: "إعادة للبيانات النموذجية", areaFocus: "التركيز",
      progress: "التقدم", habitWeek: "هذا الأسبوع", greet: "يومك يا قائدة",
      greetSub: "التقطي ما في رأسك. قرّري ماذا تفعلين. تابعي كل مجال.",
      convert: "→ متابعة", del: "حذف", noInbox: "الوارد فاضي. أحسنتِ.",
      inWeek: "في أسبوعك", integrate: "الأرقام مسحوبة من ماليّة كوديرا.",
    },
  };
  const t = (k) => (T[lang] && T[lang][k]) || T.en[k] || k;

  /* ---------- helpers ---------- */
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const money = (n) => CUR + " " + Math.round(n).toLocaleString("en-US");
  const area = (id) => S.areas.find((a) => a.id === id) || { name: id, icon: "•", color: "#4f8cff" };
  const aName = (a) => (lang === "ar" && a.nameAr ? a.nameAr : a.name);
  const iTitle = (o) => (lang === "ar" && o.titleAr ? o.titleAr : o.title);
  const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const openActions = () => S.actions.filter((a) => a.status !== "done");
  const dueSoon = () => openActions().filter((a) => a.due && a.due <= addDays(TODAY, 7));

  /* ---------- insights engine ---------- */
  function insights() {
    const out = [];
    const inbox = S.captures.filter((c) => c.status === "inbox").length;
    const soon = dueSoon().length;
    const highOpen = openActions().filter((a) => a.priority === "high").length;

    if (FIN) {
      const perWorkshop = 150; // assumed paid-workshop price
      const n = Math.ceil(FIN.breakEvenNoSalary / perWorkshop);
      out.push({ ic: "💡", html: lang === "ar"
        ? `تحتاجين فقط <b>${money(FIN.breakEvenNoSalary)}/شهر</b> لوقف الخسارة النقدية — أي حوالي <b>${n} ورشة مدفوعة</b> (بسعر ${money(perWorkshop)}). تسعير شغلك المجاني هو أكبر أداة عندك.`
        : `You need only <b>${money(FIN.breakEvenNoSalary)}/mo</b> to stop losing cash — about <b>${n} paid workshops</b> at ${money(perWorkshop)} each. Pricing your free work is your biggest lever.` });
      const months = Math.ceil(FIN.cashInvested / 500);
      out.push({ ic: "📈", html: lang === "ar"
        ? `عند ربح <b>${money(500)}/شهر</b>، استرجاع رأس مالك <b>${money(FIN.cashInvested)}</b> يأخذ ~<b>${months} شهر</b>.`
        : `At <b>${money(500)}/mo</b> profit, recovering your <b>${money(FIN.cashInvested)}</b> capital takes ~<b>${months} months</b>.` });
    }
    if (inbox) out.push({ ic: "🧠", html: lang === "ar" ? `عندك <b>${inbox}</b> فكرة في الوارد تنتظر أن تصبح مهمة.` : `You have <b>${inbox}</b> thought${inbox > 1 ? "s" : ""} in Capture waiting to become actions.` });
    if (soon) out.push({ ic: "⏰", html: lang === "ar" ? `<b>${soon}</b> متابعة مستحقة أو متأخرة هذا الأسبوع${highOpen ? ` (منها ${highOpen} عالية الأولوية)` : ""}.` : `<b>${soon}</b> follow-up${soon > 1 ? "s" : ""} due or overdue this week${highOpen ? ` (${highOpen} high-priority)` : ""}.` });

    const habTotal = S.habits.reduce((a, h) => a + h.perWeek, 0);
    const habDone = S.habits.reduce((a, h) => a + Math.min(h.done, h.perWeek), 0);
    if (habTotal) out.push({ ic: "🔁", html: lang === "ar" ? `أنجزتِ <b>${habDone}/${habTotal}</b> من عادات هذا الأسبوع.` : `You've hit <b>${habDone}/${habTotal}</b> habit check-ins this week.` });

    const low = S.areas.slice().sort((a, b) => (a.score || 0) - (b.score || 0))[0];
    if (low) out.push({ ic: low.icon, html: lang === "ar" ? `<b>${esc(aName(low))}</b> هو أقل مجال عندك الآن (${low.score}٪) — خطوة صغيرة هنا تحرّك توازنك أكثر.` : `<b>${esc(aName(low))}</b> is your lowest area right now (${low.score}%) — a small step here moves your balance most.` });
    return out;
  }

  /* ---------- reusable bits ---------- */
  function kpi(label, value, glow) {
    return `<div class="kpi" style="--glow:${glow}"><div class="label">${label}</div><div class="value">${value}</div></div>`;
  }
  function quickCapture() {
    return `<div class="quick-capture">
      <input id="qc" placeholder="${t("quickPlaceholder")}" autocomplete="off" />
      <button class="btn" onclick="CEO.addCapture()">＋ ${t("capture")}</button>
    </div>`;
  }
  function actionItem(a) {
    const ar = area(a.area);
    const done = a.status === "done";
    return `<div class="todo ${done ? "done" : ""}">
      <div class="check ${done ? "on" : ""}" onclick="CEO.toggleAction('${a.id}')">✓</div>
      <div style="flex:1;min-width:0">
        <div class="t-main">${esc(iTitle(a))}</div>
        <div class="t-sub">${ar.icon} ${esc(aName(ar))}${a.provide ? ` · <span class="lead">${t("provide")}:</span> ${esc(a.provide)}` : ""}</div>
      </div>
      <div class="t-right">
        <span class="prio ${a.priority || "low"}">${t(a.priority || "low")}</span>
        ${a.due ? `<span style="font-size:11px;color:${a.due < TODAY && !done ? "var(--bad)" : "var(--muted-2)"}">${a.due}</span>` : ""}
      </div>
    </div>`;
  }

  /* ---------- views ---------- */
  function vCockpit() {
    const ins = insights();
    const balance = Math.round(S.areas.reduce((a, x) => a + (x.score || 0), 0) / (S.areas.length || 1));
    const goalsMoving = S.goals.filter((g) => g.progress > 0 && g.progress < g.target).length;
    const focuses = S.areas.filter((a) => (a.score || 0) < 60).slice(0, 3)
      .map((a) => `<span class="chip">${a.icon} ${esc(lang === "ar" ? a.focusAr : a.focus)}</span>`).join(" ");

    const areaCards = S.areas.map((a) => {
      const acts = openActions().filter((x) => x.area === a.id).length;
      const g = S.goals.find((x) => x.area === a.id && x.progress < x.target);
      return `<div class="area-card" style="--area:${a.color}" onclick="CEO.go('area/${a.id}')">
        <div class="head">
          <div class="em">${a.icon}</div>
          <div style="flex:1;min-width:0"><div class="nm">${esc(aName(a))}</div><div class="fc">${esc(lang === "ar" ? a.focusAr : a.focus)}</div></div>
          <div class="ring" style="--p:${a.score || 0}"><span>${a.score || 0}</span></div>
        </div>
        <div class="meta"><span><b>${acts}</b> ${t("openTasks")}</span>${g ? `<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🎯 ${esc(iTitle(g))}</span>` : ""}</div>
      </div>`;
    }).join("");

    const top = openActions().slice().sort((a, b) => {
      const p = { high: 0, med: 1, low: 2 };
      return (p[a.priority] - p[b.priority]) || String(a.due || "9999").localeCompare(String(b.due || "9999"));
    }).slice(0, 6).map(actionItem).join("") || `<div class="empty">${t("noInbox")}</div>`;

    const caps = S.captures.filter((c) => c.status === "inbox").slice(-4).reverse()
      .map((c) => `<div class="todo"><div style="flex:1"><div class="t-main" style="font-weight:500">${esc(c.text)}</div><div class="t-sub">${area(c.area).icon} ${esc(aName(area(c.area)))} · ${c.date}</div></div><button class="link-pill" style="padding:5px 10px;font-size:11px" onclick="CEO.triage('${c.id}')">${t("convert")}</button></div>`).join("") || `<div class="empty">${t("noInbox")}</div>`;

    return `
      <div class="greet">${t("greet")} <span style="font-size:15px">👋</span><div class="sub">${t("greetSub")}</div></div>
      <div style="margin:14px 0 20px">${quickCapture()}</div>
      <div class="kpi-row">
        ${kpi(t("openFollowups"), openActions().length, "rgba(79,140,255,0.3)")}
        ${kpi(t("dueThisWeek"), dueSoon().length, "rgba(239,68,68,0.3)")}
        ${kpi(t("goalsOnTrack"), goalsMoving, "rgba(34,197,94,0.3)")}
        ${kpi(t("lifeBalance"), balance + "%", "rgba(139,92,246,0.3)")}
        ${kpi(t("inbox"), S.captures.filter((c) => c.status === "inbox").length, "rgba(245,158,11,0.3)")}
      </div>
      ${focuses ? `<div class="section-title">${t("weeklyFocus")}</div><div style="margin-bottom:8px">${focuses}</div>` : ""}
      <div class="section-title">${t("areas")}</div>
      <div class="service-grid">${areaCards}</div>
      <div class="grid cols-2" style="margin-top:8px">
        <div class="panel"><h3>${t("topFollowups")}</h3>${top}</div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel"><h3>${t("insights")} <span style="color:var(--muted-2);font-weight:400;font-size:11px">· ${t("integrate")}</span></h3>${ins.map((i) => `<div class="insight"><div class="ic">${i.ic}</div><div class="tx">${i.html}</div></div>`).join("")}</div>
          <div class="panel"><h3>${t("recentCaptures")}</h3>${caps}</div>
        </div>
      </div>`;
  }

  function vCapture() {
    const inbox = S.captures.filter((c) => c.status === "inbox");
    const rows = inbox.slice().reverse().map((c) => `<div class="todo">
      <div style="flex:1"><div class="t-main" style="font-weight:500">${esc(c.text)}</div><div class="t-sub">${area(c.area).icon} ${esc(aName(area(c.area)))} · ${c.date}</div></div>
      <div class="t-right" style="flex-direction:row;align-items:center;gap:8px">
        <button class="link-pill" style="padding:6px 11px;font-size:12px" onclick="CEO.triage('${c.id}')">${t("triage")}</button>
        <button class="check" onclick="CEO.delCapture('${c.id}')" title="${t("del")}" style="color:var(--muted-2)">✕</button>
      </div>
    </div>`).join("") || `<div class="empty">${t("noInbox")}</div>`;
    return `
      ${quickCapture()}
      <div class="panel"><h3>${t("inbox")} · ${inbox.length}</h3>${rows}</div>`;
  }

  function vActions() {
    const areasBar = `<div class="tabs"><div class="tab ${!state.filter ? "active" : ""}" onclick="CEO.filter('')">${t("overview")}</div>` +
      S.areas.map((a) => `<div class="tab ${state.filter === a.id ? "active" : ""}" onclick="CEO.filter('${a.id}')">${a.icon} ${esc(aName(a))}</div>`).join("") + `</div>`;
    let list = openActions().concat(S.actions.filter((a) => a.status === "done"));
    if (state.filter) list = list.filter((a) => a.area === state.filter);
    const rows = list.map(actionItem).join("") || `<div class="empty">${t("noItems")}</div>`;
    return `
      <div class="quick-capture">
        <input id="qa" placeholder="${t("addAction")}" autocomplete="off" />
        <button class="btn" onclick="CEO.addAction()">＋</button>
      </div>
      ${areasBar}
      <div class="panel">${rows}</div>`;
  }

  function vGoals() {
    const byArea = {};
    S.goals.forEach((g) => (byArea[g.area] = byArea[g.area] || []).push(g));
    const blocks = Object.keys(byArea).map((aid) => {
      const a = area(aid);
      const rows = byArea[aid].map((g) => {
        const pct = Math.round((g.progress / g.target) * 100);
        return `<div class="todo">
          <div style="flex:1"><div class="t-main" style="font-weight:600">${esc(iTitle(g))}</div>
            <div class="t-sub">${g.progress}/${g.target} ${g.unit || ""} · ${pct}%${g.due ? " · " + t("due") + " " + g.due : ""}</div>
            <div class="mini-bar" style="width:100%;max-width:280px;margin-top:7px"><span style="width:${pct}%"></span></div>
          </div>
          <div class="stepper"><button onclick="CEO.goalStep('${g.id}',-1)">−</button><button onclick="CEO.goalStep('${g.id}',1)">＋</button></div>
        </div>`;
      }).join("");
      return `<div class="panel" style="border-left:3px solid ${a.color};margin-bottom:14px"><h3>${a.icon} ${esc(aName(a))}</h3>${rows}</div>`;
    }).join("");
    return `<div class="quick-capture"><input id="qg" placeholder="${t("addGoal")}" autocomplete="off" /><button class="btn" onclick="CEO.addGoal()">＋</button></div>${blocks}`;
  }

  function vHabits() {
    const rows = S.habits.map((h) => {
      const a = area(h.area);
      const dots = Array.from({ length: h.perWeek }, (_, i) => `<span class="hdot ${i < h.done ? "on" : ""}" style="--area:${a.color}" onclick="CEO.habitSet('${h.id}',${i + 1})"></span>`).join("");
      return `<div class="todo">
        <div style="flex:1"><div class="t-main">${esc(iTitle(h))}</div><div class="t-sub">${a.icon} ${esc(aName(a))} · ${h.done}/${h.perWeek} ${t("thisWeek")}</div></div>
        <div class="hdots">${dots}</div>
      </div>`;
    }).join("");
    return `<div class="panel"><h3>${t("habits")} · ${t("habitWeek")}</h3>${rows}</div>`;
  }

  function vArea(id) {
    const a = area(id);
    const acts = S.actions.filter((x) => x.area === id);
    const goals = S.goals.filter((x) => x.area === id);
    const habs = S.habits.filter((x) => x.area === id);
    const caps = S.captures.filter((x) => x.area === id && x.status === "inbox");
    const ins = insights().filter((i) => true).slice(0, 3);
    return `
      <div class="svc-hero" style="--svc:${a.color}">
        <div class="emoji">${a.icon}</div>
        <div style="flex:1"><h2>${esc(aName(a))}</h2><div class="tagline">${esc(lang === "ar" ? a.focusAr : a.focus)}</div></div>
        <a class="btn ghost" onclick="CEO.go('cockpit')">← ${t("cockpit")}</a>
      </div>
      <div class="panel" style="margin-bottom:16px"><h3>${t("score")}: ${a.score || 0}%</h3>
        <input class="slider" type="range" min="0" max="100" value="${a.score || 0}" style="--area:${a.color}" oninput="CEO.setScore('${id}',this.value)" />
      </div>
      <div class="grid cols-2">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel"><h3>${t("followups")}</h3>${acts.map(actionItem).join("") || `<div class="empty">${t("noItems")}</div>`}</div>
          <div class="panel"><h3>${t("goals")}</h3>${goals.map((g) => { const pct = Math.round((g.progress / g.target) * 100); return `<div class="todo"><div style="flex:1"><div class="t-main" style="font-weight:600">${esc(iTitle(g))}</div><div class="mini-bar" style="width:100%;max-width:260px;margin-top:7px"><span style="width:${pct}%"></span></div></div><div class="stepper"><button onclick="CEO.goalStep('${g.id}',-1)">−</button><button onclick="CEO.goalStep('${g.id}',1)">＋</button></div></div>`; }).join("") || `<div class="empty">${t("noItems")}</div>`}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="panel"><h3>${t("insights")}</h3>${ins.map((i) => `<div class="insight"><div class="ic">${i.ic}</div><div class="tx">${i.html}</div></div>`).join("")}</div>
          <div class="panel"><h3>${t("habits")}</h3>${habs.map((h) => `<div class="todo"><div style="flex:1"><div class="t-main">${esc(iTitle(h))}</div><div class="t-sub">${h.done}/${h.perWeek} ${t("thisWeek")}</div></div><div class="hdots">${Array.from({ length: h.perWeek }, (_, i) => `<span class="hdot ${i < h.done ? "on" : ""}" style="--area:${a.color}" onclick="CEO.habitSet('${h.id}',${i + 1})"></span>`).join("")}</div></div>`).join("") || `<div class="empty">${t("noItems")}</div>`}</div>
          <div class="panel"><h3>${t("inbox")}</h3>${caps.map((c) => `<div class="todo"><div style="flex:1"><div class="t-main" style="font-weight:500">${esc(c.text)}</div></div><button class="link-pill" style="padding:5px 10px;font-size:11px" onclick="CEO.triage('${c.id}')">${t("convert")}</button></div>`).join("") || `<div class="empty">${t("noInbox")}</div>`}</div>
        </div>
      </div>`;
  }

  /* ---------- mutations (exposed as window.CEO) ---------- */
  const state = { filter: "" };
  window.CEO = {
    go(h) { location.hash = "#/" + h; },
    filter(f) { state.filter = f; render(); },
    addCapture() {
      const el = $("#qc"); if (!el || !el.value.trim()) return;
      S.captures.push({ id: uid(), text: el.value.trim(), area: "personal", date: TODAY, status: "inbox" });
      save("captures"); render(); const n = $("#qc"); if (n) n.focus();
    },
    delCapture(id) { S.captures = S.captures.filter((c) => c.id !== id); save("captures"); render(); },
    triage(id) {
      const c = S.captures.find((x) => x.id === id); if (!c) return;
      S.actions.push({ id: uid(), area: c.area || "personal", title: c.text, provide: "", priority: "med", status: "todo", due: addDays(TODAY, 7) });
      c.status = "done"; save("captures"); save("actions"); location.hash = "#/followups";
    },
    addAction() {
      const el = $("#qa"); if (!el || !el.value.trim()) return;
      S.actions.push({ id: uid(), area: state.filter || "personal", title: el.value.trim(), provide: "", priority: "med", status: "todo", due: addDays(TODAY, 7) });
      save("actions"); render(); const n = $("#qa"); if (n) n.focus();
    },
    toggleAction(id) { const a = S.actions.find((x) => x.id === id); if (!a) return; a.status = a.status === "done" ? "todo" : "done"; save("actions"); render(); },
    addGoal() {
      const el = $("#qg"); if (!el || !el.value.trim()) return;
      S.goals.push({ id: uid(), area: "personal", title: el.value.trim(), progress: 0, target: 100, unit: "%", due: "" });
      save("goals"); render(); const n = $("#qg"); if (n) n.focus();
    },
    goalStep(id, dir) {
      const g = S.goals.find((x) => x.id === id); if (!g) return;
      const step = g.unit === "%" ? 10 : 1;
      g.progress = Math.max(0, Math.min(g.target, g.progress + dir * step));
      save("goals"); render();
    },
    habitSet(id, val) {
      const h = S.habits.find((x) => x.id === id); if (!h) return;
      h.done = h.done === val ? val - 1 : val; // click same dot to un-set
      save("habits"); render();
    },
    setScore(id, v) {
      const a = S.areas.find((x) => x.id === id); if (!a) return;
      a.score = parseInt(v, 10); save("areas");
      const box = document.querySelector(".svc-hero + .panel h3"); if (box) box.textContent = t("score") + ": " + a.score + "%";
    },
    reset() {
      if (!confirm(lang === "ar" ? "إعادة كل شيء للبيانات النموذجية؟" : "Reset everything to sample data?")) return;
      ["areas", "goals", "actions", "captures", "habits"].forEach((c) => { localStorage.removeItem(LSK + c); S[c] = load(c); });
      render();
    },
  };

  /* ---------- routing + nav ---------- */
  const ROUTES = { cockpit: vCockpit, capture: vCapture, followups: vActions, goals: vGoals, habits: vHabits };
  function render() {
    const hash = (location.hash.replace(/^#\//, "") || "cockpit");
    const parts = hash.split("/");
    let title, out;
    if (parts[0] === "area" && parts[1]) { const a = area(parts[1]); title = aName(a); out = vArea(parts[1]); }
    else { const fn = ROUTES[parts[0]] || vCockpit; title = t(parts[0]) || t("cockpit"); out = fn(); }
    $("#page-title").textContent = title;
    $("#page-crumb").textContent = t("ceo");
    $("#view").innerHTML = out;
    renderNav(parts[0] === "area" ? "area/" + parts[1] : parts[0]);
    const qc = $("#qc") || $("#qa") || $("#qg");
    if (qc) qc.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); if (qc.id === "qc") CEO.addCapture(); else if (qc.id === "qa") CEO.addAction(); else CEO.addGoal(); } });
  }
  function renderNav(active) {
    const it = (h, ico, label, count) => `<div class="nav-item ${active === h ? "active" : ""}" onclick="location.hash='#/${h}'"><span class="ico">${ico}</span>${label}${count != null ? `<span class="count">${count}</span>` : ""}</div>`;
    const areaItems = S.areas.map((a) => `<div class="nav-item ${active === "area/" + a.id ? "active" : ""}" onclick="location.hash='#/area/${a.id}'"><span class="dot" style="background:${a.color}"></span>${esc(aName(a))}<span class="count">${openActions().filter((x) => x.area === a.id).length}</span></div>`).join("");
    $("#nav").innerHTML = `
      ${it("cockpit", "🎛️", t("cockpit"))}
      <div class="nav-group-label">${t("overview")}</div>
      ${it("capture", "🧠", t("capture"), S.captures.filter((c) => c.status === "inbox").length)}
      ${it("followups", "✅", t("followups"), openActions().length)}
      ${it("goals", "🎯", t("goals"), S.goals.length)}
      ${it("habits", "🔁", t("habits"))}
      <div class="nav-group-label">${t("areas")}</div>
      ${areaItems}
      <div style="margin-top:18px;padding:0 4px"><button class="link-pill" style="width:100%;font-size:12px" onclick="CEO.reset()">↺ ${t("resetDefaults")}</button></div>`;
  }

  /* ---------- lang ---------- */
  function applyLang() {
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
    $("#lang").textContent = lang === "ar" ? "EN" : "ع";
    render();
  }
  $("#lang").addEventListener("click", () => { lang = lang === "ar" ? "en" : "ar"; localStorage.setItem("codera-lang", lang); applyLang(); });
  window.addEventListener("hashchange", render);
  applyLang();
})();
