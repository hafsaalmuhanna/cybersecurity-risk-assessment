"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "ar" | "en";
type Theme = "dark" | "light";

const DICT: Record<string, { ar: string; en: string }> = {
  // nav
  blog: { ar: "مدونة فارس", en: "Faris Blog" },
  hackathons: { ar: "هكاثونات فارس", en: "Faris Hackathons" },
  initiatives: { ar: "مبادرات فارس", en: "Faris Initiatives" },
  membership: { ar: "العضوية", en: "Membership" },
  pricing: { ar: "الاشتراكات", en: "Subscriptions" },
  login: { ar: "دخول", en: "Log in" },
  register: { ar: "انضم كفارس", en: "Join as a Knight" },
  account: { ar: "حسابي", en: "My account" },
  admin: { ar: "لوحة القيادة", en: "Command Center" },
  logout: { ar: "خروج", en: "Log out" },
  // hero
  hero_kick: { ar: "من الكويت إلى العالم — فروسية سيبرانية للجميع", en: "From Kuwait to the world — cyber-furusiyya for all" },
  hero_h1a: { ar: "كن", en: "Become a" },
  hero_h1b: { ar: "فارس", en: "Cyber Knight" },
  hero_h1c: { ar: "خط الدفاع الأول", en: "on the first line of defense" },
  hero_p: {
    ar: "أول مدرسة افتراضية عالمية تُخرِّج فرسان الأمن السيبراني — مختبرات عملية، مدرّب ذكاء اصطناعي، واقع افتراضي، وشمول لذوي الاحتياجات الخاصة.",
    en: "The first global virtual school forging cyber knights — hands-on labs, an AI trainer, VR, and inclusive by design.",
  },
  start_free: { ar: "ابدأ مجاناً", en: "Start free" },
  browse_arenas: { ar: "تصفّح الميادين", en: "Browse arenas" },
  stat_knights: { ar: "فارس نشط", en: "active knights" },
  stat_arenas: { ar: "ميادين", en: "arenas" },
  stat_labs: { ar: "مختبر عملي", en: "hands-on labs" },
  // sections
  arenas_title: { ar: "ميادين الفروسية السيبرانية", en: "Cyber-furusiyya arenas" },
  arenas_sub: { ar: "كل ميدان تخصّص كامل مربوط بفريق ومسار وظيفي.", en: "Each arena is a full specialization tied to a team and a career path." },
  latest_blog: { ar: "أحدث من مدونة فارس", en: "Latest from Faris Blog" },
  upcoming_hack: { ar: "هكاثونات قادمة", en: "Upcoming hackathons" },
  our_initiatives: { ar: "مبادراتنا", en: "Our initiatives" },
  view_all: { ar: "عرض الكل", en: "View all" },
  read_more: { ar: "اقرأ المزيد", en: "Read more" },
  register_now: { ar: "سجّل الآن", en: "Register now" },
  join_initiative: { ar: "شارك", en: "Join in" },
  // membership
  membership_h: { ar: "عضوية فارس", en: "Faris Membership" },
  membership_p: { ar: "انضم إلى أخوية الفرسان: مختبرات، شهادات، مجتمع، وفرص توظيف عالمية.", en: "Join the knights' fellowship: labs, certifications, community, and global career opportunities." },
  choose_plan: { ar: "اختر باقتك", en: "Choose your plan" },
  // auth
  email: { ar: "البريد الإلكتروني", en: "Email" },
  password: { ar: "كلمة المرور", en: "Password" },
  full_name: { ar: "الاسم الكامل", en: "Full name" },
  create_account: { ar: "أنشئ حسابك", en: "Create account" },
  have_account: { ar: "لديك حساب؟ دخول", en: "Have an account? Log in" },
  no_account: { ar: "ليس لديك حساب؟ انضم", en: "No account? Join" },
  // account dash
  welcome: { ar: "أهلاً", en: "Welcome" },
  my_rank: { ar: "رتبتي", en: "My rank" },
  my_arenas: { ar: "مياديني", en: "My arenas" },
  my_subscription: { ar: "اشتراكي", en: "My subscription" },
  my_posts: { ar: "مقالاتي", en: "My posts" },
  my_hackathons: { ar: "هكاثوناتي", en: "My hackathons" },
  profile: { ar: "الملف الشخصي", en: "Profile" },
  // admin
  members: { ar: "الأعضاء", en: "Members" },
  content: { ar: "المحتوى", en: "Content" },
  subscriptions_m: { ar: "الاشتراكات", en: "Subscriptions" },
  approvals: { ar: "الاعتمادات", en: "Approvals" },
  overview: { ar: "نظرة عامة", en: "Overview" },
  // footer
  tagline: { ar: "نصنع فرساناً، لا متدرّبين.", en: "We forge knights, not trainees." },
  demo_note: { ar: "نسخة أولية — بيانات تجريبية إلى أن تُربط قاعدة البيانات.", en: "Early build — sample data until the database is connected." },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; theme: Theme; toggleTheme: () => void; t: (k: string) => string };
const I18n = createContext<Ctx | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const l = (localStorage.getItem("cf_lang") as Lang) || "ar";
    const th = (localStorage.getItem("cf_theme") as Theme) || "dark";
    setLangState(l); setTheme(th);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    if (document.body) document.body.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("cf_lang", lang);
    localStorage.setItem("cf_theme", theme);
  }, [lang, theme]);

  const t = (k: string) => (DICT[k] ? DICT[k][lang] : k);
  const setLang = (l: Lang) => setLangState(l);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return <I18n.Provider value={{ lang, setLang, theme, toggleTheme, t }}>{children}</I18n.Provider>;
}

export function useT() {
  const c = useContext(I18n);
  if (!c) throw new Error("useT must be used within Providers");
  return c;
}
