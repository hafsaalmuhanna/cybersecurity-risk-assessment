"use client";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useT } from "@/lib/i18n";
import { arenas, posts, hackathons, initiatives } from "@/lib/data";

export default function Home() {
  const { t, lang } = useT();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);

  return (
    <>
      <SiteHeader />

      <section className="hero">
        <span className="shape s1" /><span className="shape s2" /><span className="shape s3" />
        <div className="wrap">
          <span className="eyebrow">♞ {t("hero_kick")}</span>
          <h1 style={{ marginTop: 14 }}>
            {t("hero_h1a")} <span>{t("hero_h1b")}</span> — {t("hero_h1c")}
          </h1>
          <p>{t("hero_p")}</p>
          <div className="cta">
            <Link className="btn" href="/register">{t("start_free")}</Link>
            <Link className="btn ghost" href="/membership">{t("browse_arenas")}</Link>
          </div>
          <div className="stats">
            <div className="stat"><b>6,400+</b><span>{t("stat_knights")}</span></div>
            <div className="stat"><b>6</b><span>{t("stat_arenas")}</span></div>
            <div className="stat"><b>120+</b><span>{t("stat_labs")}</span></div>
          </div>
        </div>
      </section>

      <div className="wrap">
        {/* Arenas */}
        <section className="section">
          <span className="eyebrow">Arenas</span>
          <h2>{t("arenas_title")}</h2>
          <p className="muted">{t("arenas_sub")}</p>
          <div className="grid g3" style={{ marginTop: 22 }}>
            {arenas.map((a) => (
              <div className="card hover" key={a.title_en}>
                <div style={{ fontSize: 30 }}>{a.icon}</div>
                <h3 style={{ marginTop: 8 }}>{L(a.title_ar, a.title_en)}</h3>
                <span className={`chip ${a.team}`} style={{ marginTop: 10 }}>{L(a.tag_ar, a.tag_en)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Blog */}
        <section className="section" style={{ borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
            <div><span className="eyebrow">Blog</span><h2>{t("latest_blog")}</h2></div>
            <Link className="btn ghost sm" href="/blog">{t("view_all")}</Link>
          </div>
          <div className="grid g3" style={{ marginTop: 22 }}>
            {posts.map((p) => (
              <Link className="card hover" href={`/blog/${p.slug}`} key={p.slug}>
                <span className={`chip ${p.team}`}>{p.team.toUpperCase()}</span>
                <h3 style={{ marginTop: 12 }}>{L(p.title_ar, p.title_en)}</h3>
                <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>{L(p.excerpt_ar, p.excerpt_en)}</p>
                <div className="postmeta"><span className="avatar">{p.author[0]}</span>{p.author} · {p.date}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Hackathons */}
        <section className="section" style={{ borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
            <div><span className="eyebrow">Hackathons</span><h2>{t("upcoming_hack")}</h2></div>
            <Link className="btn ghost sm" href="/hackathons">{t("view_all")}</Link>
          </div>
          <div className="grid g3" style={{ marginTop: 22 }}>
            {hackathons.map((h) => (
              <div className="card" key={h.slug}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className={`chip ${h.status === "open" ? "good" : "acc"}`}>{h.status === "open" ? L("مفتوح", "Open") : L("قريباً", "Soon")}</span>
                  <b style={{ color: "var(--acc-text)" }}>{h.prize}</b>
                </div>
                <h3 style={{ marginTop: 12 }}>{L(h.title_ar, h.title_en)}</h3>
                <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>{h.date} · {L(h.mode_ar, h.mode_en)}</p>
                <Link className="btn sm" href="/hackathons" style={{ marginTop: 14 }}>{t("register_now")}</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Initiatives */}
        <section className="section" style={{ borderTop: "1px solid var(--line)" }}>
          <span className="eyebrow">Initiatives</span>
          <h2>{t("our_initiatives")}</h2>
          <div className="grid g3" style={{ marginTop: 22 }}>
            {initiatives.map((i) => (
              <div className="card" key={i.slug}>
                <div style={{ fontSize: 28 }}>{i.icon}</div>
                <h3 style={{ marginTop: 8 }}>{L(i.title_ar, i.title_en)}</h3>
                <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>{L(i.desc_ar, i.desc_en)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
