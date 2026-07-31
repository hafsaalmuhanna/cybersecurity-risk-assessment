"use client";
import SiteHeader from "@/components/SiteHeader";
import { useT } from "@/lib/i18n";

export default function Admin() {
  const { t, lang } = useT();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const nav = [
    { label: t("overview"), icon: "◈" },
    { label: t("members"), icon: "👥" },
    { label: t("content"), icon: "📚" },
    { label: t("subscriptions_m"), icon: "💳" },
    { label: t("approvals"), icon: "✅" },
  ];
  const pending = [
    { who: L("نورة", "Noura"), item: L("حوكمة المخاطر GRC", "Risk Governance (GRC)"), team: "purple" },
    { who: L("فهد", "Fahad"), item: L("استغلال ثغرات API", "API Exploitation"), team: "red" },
    { who: L("مريم", "Maryam"), item: L("صيد التهديدات المتقدّم", "Advanced Threat Hunting"), team: "blue" },
  ];

  return (
    <>
      <SiteHeader />
      <div className="dash">
        <aside className="side">
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--dim)", letterSpacing: ".6px", margin: "6px 10px 10px" }}>
            {L("مركز القيادة", "COMMAND CENTER")}
          </div>
          {nav.map((n, i) => <a key={n.label} className={i === 0 ? "active" : ""}><span>{n.icon}</span>{n.label}</a>)}
        </aside>
        <main className="dmain">
          <h1 style={{ fontSize: 26 }}>{t("admin")}</h1>
          <p className="muted" style={{ marginTop: 6 }}>{L("نبض المنصة — الأعضاء، المحتوى، الإيرادات، والاعتمادات.", "The platform's pulse — members, content, revenue, and approvals.")}</p>

          <div className="grid g4" style={{ marginTop: 20 }}>
            <div className="card kpi"><div className="stripe" style={{ background: "var(--acc)" }} /><div className="lbl">♞ {L("فرسان نشطون", "Active knights")}</div><div className="val num">6,412</div></div>
            <div className="card kpi"><div className="stripe" style={{ background: "var(--blue)" }} /><div className="lbl">🏇 {L("مدرّبون", "Trainers")}</div><div className="val num">128</div></div>
            <div className="card kpi"><div className="stripe" style={{ background: "var(--good)" }} /><div className="lbl">💳 {L("إيراد شهري", "MRR")}</div><div className="val num">$84.2k</div></div>
            <div className="card kpi"><div className="stripe" style={{ background: "var(--warn)" }} /><div className="lbl">⏳ {L("بانتظار الاعتماد", "Pending")}</div><div className="val num">9</div></div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3>✅ {L("محتوى بانتظار الاعتماد", "Content awaiting approval")}</h3>
            <div style={{ marginTop: 8 }}>
              {pending.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <span className="avatar">{p.who[0]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.item}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{p.who}</div>
                  </div>
                  <span className={`chip ${p.team}`}>{p.team}</span>
                  <button className="btn sm">{L("راجع", "Review")}</button>
                </div>
              ))}
            </div>
          </div>
          <p className="muted" style={{ marginTop: 14, fontSize: 13 }}>
            {L("الوصول للأدمن سيُقيَّد بدور «admin» عبر Supabase RLS بعد الربط.", "Admin access will be restricted to the 'admin' role via Supabase RLS once connected.")}
          </p>
        </main>
      </div>
    </>
  );
}
