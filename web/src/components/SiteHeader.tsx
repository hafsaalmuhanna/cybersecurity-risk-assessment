"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabaseClient";

export default function SiteHeader() {
  const { t, lang, setLang, theme, toggleTheme } = useT();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setEmail(s?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link href="/" className="brand">
          <span className="hex" aria-hidden>♞</span>
          Cyber<span>Faris</span>
        </Link>
        <nav className="nav-links">
          <Link href="/blog">{t("blog")}</Link>
          <Link href="/hackathons">{t("hackathons")}</Link>
          <Link href="/initiatives">{t("initiatives")}</Link>
          <Link href="/membership">{t("membership")}</Link>
          <Link href="/pricing">{t("pricing")}</Link>
        </nav>
        <div className="nav-tools">
          <button className="icon-btn" onClick={() => setLang(lang === "ar" ? "en" : "ar")} aria-label="language">
            {lang === "ar" ? "EN" : "ع"}
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="theme">
            {theme === "dark" ? "☀" : "☾"}
          </button>
          {email ? (
            <Link className="btn sm" href="/account">{t("account")}</Link>
          ) : (
            <>
              <Link className="btn ghost sm" href="/login">{t("login")}</Link>
              <Link className="btn sm" href="/register">{t("register")}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
