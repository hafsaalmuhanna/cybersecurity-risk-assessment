"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { useT } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabaseClient";
import { arenas } from "@/lib/data";

export default function Account() {
  const { t, lang } = useT();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const [name, setName] = useState("سالم");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) { setEmail(u.email ?? null); setName((u.user_metadata?.full_name as string) || u.email?.split("@")[0] || "Faris"); }
    });
  }, []);

  async function signOut() {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    window.location.href = "/";
  }

  const nav = [
    { k: "overview", label: L("لوحتي", "Dashboard"), icon: "◈" },
    { k: "arenas", label: t("my_arenas"), icon: "🏇" },
    { k: "sub", label: t("my_subscription"), icon: "💳" },
    { k: "posts", label: t("my_posts"), icon: "✍️" },
    { k: "hack", label: t("my_hackathons"), icon: "🚩" },
    { k: "profile", label: t("profile"), icon: "⚙️" },
  ];

  return (
    <>
      <SiteHeader />
      <div className="dash">
        <aside className="side">
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--dim)", letterSpacing: ".6px", margin: "6px 10px 10px" }}>
            {L("ساحة الفارس", "KNIGHT'S ARENA")}
          </div>
          {nav.map((n, i) => <a key={n.k} className={i === 0 ? "active" : ""}><span>{n.icon}</span>{n.label}</a>)}
          <button className="btn ghost sm" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} onClick={signOut}>{t("logout")}</button>
        </aside>
        <main className="dmain">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 26 }}>{t("welcome")}, {name} ♞</h1>
              <p className="muted" style={{ marginTop: 6 }}>{email ?? L("عرض تجريبي — سجّل الدخول لرؤية بياناتك الحقيقية", "Demo view — log in to see your real data")}</p>
            </div>
            <Link className="btn" href="/pricing">{L("ترقية الاشتراك", "Upgrade plan")}</Link>
          </div>

          <div className="grid g4" style={{ marginTop: 20 }}>
            <div className="card kpi"><div className="stripe" style={{ background: "var(--acc)" }} /><div className="lbl">🎖️ {t("my_rank")}</div><div className="val">{L("فارس", "Knight")}</div></div>
            <div className="card kpi"><div className="stripe" style={{ background: "var(--blue)" }} /><div className="lbl">🔥 {L("أيام متتالية", "Day streak")}</div><div className="val num">18</div></div>
            <div className="card kpi"><div className="stripe" style={{ background: "var(--red)" }} /><div className="lbl">⚔️ {L("نِزالات", "Challenges")}</div><div className="val num">42</div></div>
            <div className="card kpi"><div className="stripe" style={{ background: "var(--good)" }} /><div className="lbl">💳 {t("my_subscription")}</div><div className="val" style={{ fontSize: 20 }}>{L("فارس", "Knight")}</div></div>
          </div>

          <div className="grid g2" style={{ marginTop: 16 }}>
            <div className="card">
              <h3>{t("my_arenas")}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                {[["🚧", L("قفز الحواجز", "Show Jumping"), 74, "var(--red)"], ["⚡", L("السباق", "Racing"), 45, "var(--blue)"], ["🎯", L("الترويض", "Dressage"), 30, "var(--purple)"]].map((a: any) => (
                  <div key={a[1]} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 130, fontSize: 13 }}>{a[0]} {a[1]}</span>
                    <span className="bar"><i style={{ width: `${a[2]}%`, background: a[3] }} /></span>
                    <span className="num muted" style={{ width: 40, textAlign: "end", fontSize: 12.5 }}>{a[2]}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3>{t("my_posts")}</h3>
              <p className="muted" style={{ fontSize: 13.5, marginTop: 8 }}>{L("اكتب مقالاً لمدونة فارس وشارك معرفتك مع الفرسان.", "Write a Faris Blog article and share your knowledge with the knights.")}</p>
              <button className="btn sm" style={{ marginTop: 12 }}>✍️ {L("مقال جديد", "New post")}</button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
