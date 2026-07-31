"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useT } from "@/lib/i18n";
import { getSupabase, supabaseConfigured } from "@/lib/supabaseClient";

export default function Register() {
  const { t, lang } = useT();
  const router = useRouter();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setOk(null);
    const sb = getSupabase();
    if (!sb) { setMsg(L("قاعدة البيانات غير مربوطة بعد — أضف مفاتيح Supabase في .env.local.", "Database not connected yet — add Supabase keys to .env.local.")); return; }
    setBusy(true);
    const { error } = await sb.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setBusy(false);
    if (error) setMsg(error.message);
    else { setOk(L("تم إنشاء الحساب! تحقّق من بريدك للتفعيل.", "Account created! Check your email to confirm.")); setTimeout(() => router.push("/account"), 1200); }
  }

  return (
    <>
      <SiteHeader />
      <div className="wrap">
        <div className="card authbox">
          <span className="chip acc">♞ {L("انضم كفارس", "Join as a Knight")}</span>
          <h2 style={{ fontSize: 22, marginTop: 10 }}>{t("create_account")}</h2>
          {!supabaseConfigured() && <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>{L("عرض توضيحي — التسجيل الحقيقي يعمل بعد ربط Supabase.", "Demo — real signup works once Supabase is connected.")}</p>}
          <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
            <div className="field"><label>{t("full_name")}</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="field"><label>{t("email")}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="field"><label>{t("password")}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required /></div>
            {msg && <p className="err">{msg}</p>}
            {ok && <p className="ok">{ok}</p>}
            <button className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 6 }} disabled={busy}>{busy ? "…" : t("create_account")}</button>
          </form>
          <p className="muted" style={{ marginTop: 14, fontSize: 14 }}><Link href="/login">{t("have_account")}</Link></p>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
