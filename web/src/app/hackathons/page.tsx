"use client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useT } from "@/lib/i18n";
import { hackathons } from "@/lib/data";

export default function Hackathons() {
  const { t, lang } = useT();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  return (
    <>
      <SiteHeader />
      <div className="wrap section">
        <span className="eyebrow">Hackathons</span>
        <h2>{t("hackathons")}</h2>
        <p className="muted">{L("نزالات جماعية بجوائز — شكّل فريق فرسانك (أحمر/أزرق/بنفسجي) وتنافس عالمياً.", "Team competitions with prizes — form your knights' team (red/blue/purple) and compete globally.")}</p>
        <div className="grid g3" style={{ marginTop: 22 }}>
          {hackathons.map((h) => (
            <div className="card" key={h.slug}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={`chip ${h.status === "open" ? "good" : "acc"}`}>{h.status === "open" ? L("التسجيل مفتوح", "Open") : L("قريباً", "Soon")}</span>
                <b style={{ color: "var(--acc-text)" }}>{h.prize}</b>
              </div>
              <h3 style={{ marginTop: 12 }}>{L(h.title_ar, h.title_en)}</h3>
              <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>📅 {h.date} · {L(h.mode_ar, h.mode_en)}</p>
              <button className="btn sm" style={{ marginTop: 14 }} disabled={h.status !== "open"}>
                {h.status === "open" ? t("register_now") : L("قريباً", "Soon")}
              </button>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
