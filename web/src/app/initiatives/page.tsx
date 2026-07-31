"use client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useT } from "@/lib/i18n";
import { initiatives } from "@/lib/data";

export default function Initiatives() {
  const { t, lang } = useT();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  return (
    <>
      <SiteHeader />
      <div className="wrap section">
        <span className="eyebrow">Initiatives</span>
        <h2>{t("initiatives")}</h2>
        <p className="muted">{L("رسالتنا الاجتماعية: الأمن السيبراني للجميع — بمن فيهم ذوو الاحتياجات الخاصة والنشء والنساء.", "Our social mission: cybersecurity for everyone — including people with disabilities, youth, and women.")}</p>
        <div className="grid g3" style={{ marginTop: 22 }}>
          {initiatives.map((i) => (
            <div className="card" key={i.slug}>
              <div style={{ fontSize: 30 }}>{i.icon}</div>
              <h3 style={{ marginTop: 8 }}>{L(i.title_ar, i.title_en)}</h3>
              <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>{L(i.desc_ar, i.desc_en)}</p>
              <button className="btn ghost sm" style={{ marginTop: 14 }}>{t("join_initiative")}</button>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
