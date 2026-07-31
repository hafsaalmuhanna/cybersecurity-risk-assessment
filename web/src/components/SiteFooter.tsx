"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n";

export default function SiteFooter() {
  const { t } = useT();
  return (
    <footer className="footer">
      <div className="wrap">
        <div>
          <div className="brand" style={{ fontSize: 16 }}>
            <span className="hex" aria-hidden>♞</span> Cyber<span>Faris</span>
          </div>
          <p style={{ marginTop: 8, maxWidth: "42ch" }}>{t("tagline")}</p>
          <p style={{ marginTop: 8, fontSize: 12 }}>{t("demo_note")}</p>
        </div>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/blog">{t("blog")}</Link>
            <Link href="/hackathons">{t("hackathons")}</Link>
            <Link href="/initiatives">{t("initiatives")}</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/membership">{t("membership")}</Link>
            <Link href="/pricing">{t("pricing")}</Link>
            <Link href="/register">{t("register")}</Link>
          </div>
        </div>
        <div>© 2026 CyberFaris — سايبر فارس</div>
      </div>
    </footer>
  );
}
