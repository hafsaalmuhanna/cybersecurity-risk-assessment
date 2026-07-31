"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useT } from "@/lib/i18n";
import { getSupabase, supabaseConfigured } from "@/lib/supabaseClient";

export default function Login() {
  const { t, lang } = useT();
  const router = useRouter();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const sb = getSupabase();
    if (!sb) { setMsg(L("قاعدة البيانات غير مربوطة بعد — أضف مفاتيح Supabase في .env.local.", "Database not connected yet — add Supabase keys to .env.local.")); return; }
    setBusy(true);
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMsg(error.message);
    else router.push("/account");
  }

  return (
    <>
      <SiteHeader />
      <div className="wrap">
        <div className="card authbox">
          <h2 style={{ fontSize: 22 }}>{t("login")}</h2>
          {!supabaseConfigured() && <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>{L("عرض توضيحي — التسجيل الحقيقي يعمل بعد ربط Supabase.", "Demo — real auth works once Supabase is connected.")}</p>}
          <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
            <div className="field"><label>{t("email")}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="field"><label>{t("password")}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {msg && <p className="err">{msg}</p>}
            <button className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 6 }} disabled={busy}>{busy ? "…" : t("login")}</button>
          </form>
          <p className="muted" style={{ marginTop: 14, fontSize: 14 }}><Link href="/register">{t("no_account")}</Link></p>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
