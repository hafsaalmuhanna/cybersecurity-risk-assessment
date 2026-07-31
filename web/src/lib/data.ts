// Sample content shown until Supabase is connected. Mirrors the DB schema in
// supabase/migrations/0001_init.sql so pages can swap to live data seamlessly.

export type Post = { slug: string; title_ar: string; title_en: string; excerpt_ar: string; excerpt_en: string; author: string; date: string; team: "red" | "blue" | "purple" | "acc" };
export type Hackathon = { slug: string; title_ar: string; title_en: string; date: string; mode_ar: string; mode_en: string; prize: string; status: "open" | "soon" | "closed" };
export type Initiative = { slug: string; title_ar: string; title_en: string; desc_ar: string; desc_en: string; icon: string };
export type Plan = { id: string; name_ar: string; name_en: string; price: string; period_ar: string; period_en: string; popular?: boolean; features_ar: string[]; features_en: string[] };

export const posts: Post[] = [
  { slug: "sql-injection-2026", title_ar: "تشريح ثغرة حقن SQL في 2026", title_en: "Anatomy of an SQL injection in 2026", excerpt_ar: "كيف تكتشف وتستغل — وتصلح — ثغرات الحقن في تطبيقات الويب الحديثة.", excerpt_en: "How to find, exploit — and fix — injection flaws in modern web apps.", author: "سالم", date: "2026-07-20", team: "red" },
  { slug: "soc-first-90-days", title_ar: "أول ٩٠ يوماً في مركز عمليات الأمن", title_en: "Your first 90 days in a SOC", excerpt_ar: "خارطة طريق الفارس المبتدئ في ميدان السباق (الدفاع والاستجابة).", excerpt_en: "A rookie knight's roadmap in the Racing arena (defense & response).", author: "مريم", date: "2026-07-14", team: "blue" },
  { slug: "grc-for-hackers", title_ar: "الحوكمة للمخترقين: لماذا تهمّك؟", title_en: "GRC for hackers: why it matters", excerpt_ar: "ميدان الترويض ليس مملاً — إنه حيث تُبنى القرارات.", excerpt_en: "The Dressage arena isn't boring — it's where decisions are built.", author: "نورة", date: "2026-07-05", team: "purple" },
];

export const hackathons: Hackathon[] = [
  { slug: "kuwait-ctf-2026", title_ar: "كأس فرسان الكويت CTF", title_en: "Kuwait Knights CTF Cup", date: "2026-09-12", mode_ar: "افتراضي + حضوري", mode_en: "Hybrid", prize: "$10,000", status: "open" },
  { slug: "defense-sprint", title_ar: "سباق الدفاع الأزرق", title_en: "Blue Defense Sprint", date: "2026-10-03", mode_ar: "افتراضي", mode_en: "Online", prize: "$4,000", status: "soon" },
  { slug: "ai-red-team", title_ar: "هكاثون أمن الذكاء الاصطناعي", title_en: "AI Red-Team Hackathon", date: "2026-11-20", mode_ar: "افتراضي", mode_en: "Online", prize: "$6,000", status: "soon" },
];

export const initiatives: Initiative[] = [
  { slug: "faris-for-all", title_ar: "فارس للجميع", title_en: "Faris for All", desc_ar: "منح ومسارات وصولية لذوي الاحتياجات الخاصة ليتعلّموا بالطريقة التي تناسبهم.", desc_en: "Scholarships and accessible pathways so learners with disabilities train their way.", icon: "♿" },
  { slug: "young-knights", title_ar: "الفرسان الصغار", title_en: "Young Knights", desc_ar: "برنامج «البوني» لتعليم النشء أساسيات الأمن السيبراني بأمان ومتعة.", desc_en: "The 'Pony' program teaching youth cybersecurity fundamentals, safely.", icon: "🌱" },
  { slug: "women-in-cyber", title_ar: "فارسات السيبراني", title_en: "Women in Cyber", desc_ar: "مجتمع ومِنح لتمكين النساء في مهن الأمن السيبراني في المنطقة.", desc_en: "Community and grants empowering women in cybersecurity careers.", icon: "🛡️" },
];

export const plans: Plan[] = [
  { id: "squire", name_ar: "مُهر", name_en: "Squire", price: "مجاني", period_ar: "للأبد", period_en: "forever",
    features_ar: ["ميدان البوني كامل", "٣ نِزالات شهرياً", "المجتمع والمدونة"], features_en: ["Full Pony arena", "3 challenges / month", "Community & blog"] },
  { id: "knight", name_ar: "فارس", name_en: "Knight", price: "$19", period_ar: "شهرياً", period_en: "/mo", popular: true,
    features_ar: ["كل الميادين والمختبرات", "مدرّب شيخ الفروسية AI", "مشاهد VR + بديل 2D", "تحضير الشهادات"], features_en: ["All arenas & labs", "Al-Faris AI mentor", "VR scenes + 2D fallback", "Certification prep"] },
  { id: "commander", name_ar: "أمير الفرسان", name_en: "Commander", price: "$49", period_ar: "شهرياً", period_en: "/mo",
    features_ar: ["كل مزايا فارس", "مسار بناء الشركة", "توصية توظيف", "جلسات إرشاد مباشرة"], features_en: ["Everything in Knight", "Company-building track", "Hiring referrals", "Live mentorship"] },
];

export const arenas = [
  { icon: "🚧", team: "red", title_ar: "قفز الحواجز — الأمن الهجومي", title_en: "Show Jumping — Offensive", tag_ar: "اختراق", tag_en: "Offense" },
  { icon: "⚡", team: "blue", title_ar: "السباق — الدفاع والاستجابة", title_en: "Racing — Defense & Response", tag_ar: "دفاع", tag_en: "Defense" },
  { icon: "🎯", team: "purple", title_ar: "الترويض — الحوكمة والمعمارية", title_en: "Dressage — Governance", tag_ar: "حوكمة", tag_en: "Governance" },
  { icon: "🌱", team: "acc", title_ar: "البوني — الأساسيات للجميع", title_en: "Pony — Fundamentals", tag_ar: "مبتدئ", tag_en: "Beginner" },
  { icon: "👑", team: "gold", title_ar: "الإسطبل — القيادة وريادة الأعمال", title_en: "Stable — Leadership", tag_ar: "قيادة", tag_en: "Command" },
  { icon: "🥽", team: "acc", title_ar: "ميدان الواقع الافتراضي VR", title_en: "VR Arena", tag_ar: "انغماس", tag_en: "Immersive" },
] as const;
