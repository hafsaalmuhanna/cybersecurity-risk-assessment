"use client";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useT } from "@/lib/i18n";
import { plans } from "@/lib/data";

export default function Pricing() {
  const { t, lang } = useT();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  return (
    <>
      <SiteHeader />
      <div className="wrap section">
        <div className="center">
          <span className="eyebrow">Subscriptions</span>
          <h2>{L("اشتراكات فارس", "Faris Subscriptions")}</h2>
          <p className="muted" style={{ maxWidth: "52ch", margin: "6px auto 0" }}>
            {L("ابدأ مجاناً وارتقِ عندما تصبح فارساً. ألغِ في أي وقت.", "Start free and level up when you're ready. Cancel anytime.")}
          </p>
        </div>
        <div className="pricegrid" style={{ marginTop: 28 }}>
          {plans.map((p) => (
            <div className={`card plan ${p.popular ? "pop" : ""}`} key={p.id}>
              {p.popular && <span className="chip acc" style={{ position: "absolute", insetInlineEnd: 16, top: 16 }}>{L("الأكثر شيوعاً", "Popular")}</span>}
              <h3>{L(p.name_ar, p.name_en)}</h3>
              <div className="price">{p.price} <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600 }}>{L(p.period_ar, p.period_en)}</span></div>
              <ul>
                {(lang === "ar" ? p.features_ar : p.features_en).map((f) => <li key={f}>{f}</li>)}
              </ul>
              <Link className={`btn ${p.popular ? "" : "ghost"}`} href="/register" style={{ marginTop: 18, width: "100%", justifyContent: "center" }}>
                {p.price === "مجاني" || p.price.toLowerCase?.() === "free" ? t("start_free") : t("register")}
              </Link>
            </div>
          ))}
        </div>
        <p className="muted center" style={{ marginTop: 20, fontSize: 13 }}>
          {L("الدفع والتفعيل يُربطان عبر Supabase + مزوّد دفع (Stripe/Moyasar) في المرحلة القادمة.", "Payment & activation are wired via Supabase + a payment provider (Stripe/Moyasar) in the next phase.")}
        </p>
      </div>
      <SiteFooter />
    </>
  );
}
