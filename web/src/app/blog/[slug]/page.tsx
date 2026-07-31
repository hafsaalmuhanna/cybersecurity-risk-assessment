"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useT } from "@/lib/i18n";
import { posts } from "@/lib/data";

export default function BlogPost() {
  const { t, lang } = useT();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find((p) => p.slug === slug);

  return (
    <>
      <SiteHeader />
      <div className="wrap section" style={{ maxWidth: 760 }}>
        <Link className="muted" href="/blog">← {t("blog")}</Link>
        {post ? (
          <article style={{ marginTop: 16 }}>
            <span className={`chip ${post.team}`}>{post.team.toUpperCase()}</span>
            <h1 style={{ fontSize: 34, marginTop: 14 }}>{L(post.title_ar, post.title_en)}</h1>
            <div className="postmeta"><span className="avatar">{post.author[0]}</span>{post.author} · {post.date}</div>
            <p style={{ marginTop: 22, fontSize: 17 }}>{L(post.excerpt_ar, post.excerpt_en)}</p>
            <p className="muted" style={{ marginTop: 16 }}>
              {L(
                "المحتوى الكامل للمقال سيُدار من لوحة تحكم العضو ويُخزَّن في قاعدة بيانات Supabase بعد ربطها. هذه نسخة تجريبية توضّح شكل الصفحة.",
                "The full article body will be authored from the member dashboard and stored in Supabase once connected. This is a sample rendering of the layout."
              )}
            </p>
          </article>
        ) : (
          <p className="muted" style={{ marginTop: 20 }}>{L("المقال غير موجود.", "Post not found.")}</p>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
