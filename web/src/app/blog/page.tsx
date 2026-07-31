"use client";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useT } from "@/lib/i18n";
import { posts } from "@/lib/data";

export default function BlogList() {
  const { t, lang } = useT();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  return (
    <>
      <SiteHeader />
      <div className="wrap section">
        <span className="eyebrow">Blog</span>
        <h2>{t("blog")}</h2>
        <p className="muted">{L("مقالات يكتبها فرسان المجتمع — اختراق، دفاع، حوكمة، ومسيرة مهنية.", "Articles written by community knights — offense, defense, governance, and careers.")}</p>
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
      </div>
      <SiteFooter />
    </>
  );
}
