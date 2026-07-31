"use client";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useT } from "@/lib/i18n";
import { arenas } from "@/lib/data";

export default function Membership() {
  const { t, lang } = useT();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const perks = [
    L("وصول لكل الميادين والمختبرات العملية", "Access to all arenas and hands-on labs"),
    L("مدرّب شيخ الفروسية الذكي (AI) يتكيّف معك", "The adaptive Al-Faris AI mentor"),
    L("مشاهد الواقع الافتراضي مع بديل ثنائي الأبعاد", "VR scenes with a 2D fallback"),
    L("تحضير الشهادات العالمية (Security+, CEH…)", "Global certification prep (Security+, CEH…)"),
    L("حقيبة أعمال وأوسمة للتوظيف", "A job-ready portfolio and badges"),
    L("مجتمع الفرسان والهكاثونات", "The knights' community and hackathons"),
  ];
  return (
    <>
      <SiteHeader />
      <div className="wrap section">
        <span className="eyebrow">Membership</span>
        <h2>{t("membership_h")}</h2>
        <p className="muted" style={{ maxWidth: "60ch" }}>{t("membership_p")}</p>

        <div className="grid g2" style={{ marginTop: 24 }}>
          <div className="card">
            <h3>{L("ماذا تحصل عليه كفارس؟", "What you get as a knight")}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
              {perks.map((p) => (
                <li key={p} style={{ display: "flex", gap: 9 }}><span style={{ color: "var(--acc-text)", fontWeight: 900 }}>✓</span>{p}</li>
              ))}
            </ul>
            <Link className="btn" href="/pricing" style={{ marginTop: 18 }}>{t("choose_plan")}</Link>
          </div>
          <div className="card">
            <h3>{L("ابدأ من ميدانك", "Start in your arena")}</h3>
            <div className="grid g2" style={{ marginTop: 14 }}>
              {arenas.slice(0, 6).map((a) => (
                <div key={a.title_en} style={{ display: "flex", gap: 10, alignItems: "center", padding: 8, border: "1px solid var(--line)", borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <span style={{ fontSize: 13 }}>{L(a.title_ar, a.title_en)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
