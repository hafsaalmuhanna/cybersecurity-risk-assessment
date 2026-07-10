# خطة منصة التعليم السيبراني بالواقع الافتراضي والذكاء الاصطناعي
# VR + AI Cybersecurity Education Platform — Master Plan

> وثيقة تخطيط شاملة (تقنية + منتج + خارطة طريق + تكاليف)
> Comprehensive planning document (technical + product + roadmap + costs)
>
> **الحالة / Status:** مسودة أولى للمناقشة — Draft v1 for review
> **التاريخ / Date:** 2026-07-10

---

## 0) الاسم المقترح للمنصة / Proposed Platform Name

أسماء مقترحة (اختر واحداً أو اقترح غيره) — Suggested names (pick one or propose your own):

| الاسم / Name | الفكرة / Rationale |
|---|---|
| **SiberVerse / سايبرفيرس** | عالم افتراضي للأمن السيبراني — a virtual cyber-world |
| **HackoraVR** | قريب من المرجع المُلهِم — close to the reference brand |
| **CyberMithaq / ميثاق** | "ميثاق" = عهد/أمان، هوية عربية — trust/covenant, Arabic identity |
| **NeuraRange** | AI tutor + cyber range في اسم واحد — AI tutor + cyber range |

> في بقية الوثيقة سنستخدم الاسم المؤقت **"المنصة" / "the Platform"**.

---

## 1) الرؤية والمشكلة / Vision & Problem

### عربي
منصات التدريب السيبراني الحالية (TryHackMe، Hack The Box، Cybrary، وما يشبه hackora.org) قوية لكنها:
- نصية/مرئية فقط، بلا انغماس حقيقي (لا واقع افتراضي).
- تعتمد على مسار موحّد لا يتكيّف مع أسلوب تعلّم كل طالب.
- ضعيفة في إتاحة الوصول لذوي الاحتياجات الخاصة.
- الدعم بشري أو منتديات، بلا معلّم ذكاء اصطناعي متخصص يتفاعل لحظياً.

**رؤيتنا:** منصة تعليم أمن سيبراني تجمع بين:
1. **الواقع الافتراضي (VR)** لتحويل المفاهيم المجردة (شبكة، هجوم، دفاع) إلى بيئات ثلاثية الأبعاد يتفاعل معها الطالب.
2. **معلّم ذكاء اصطناعي متخصص** يشرح، يجيب، يصحّح، ويولّد تمارين.
3. **مدرّب AI شخصي متكيّف** يقيس أسلوب الطالب (بصري/سمعي/عملي) وسرعته ويعدّل الطريقة.
4. **مسارات شهادات عالمية** (Security+, CEH, CISSP…) بتدريب وامتحانات تجريبية.
5. **إتاحة وصول شاملة** لذوي الاحتياجات الخاصة كخاصية أساسية لا إضافة لاحقة.

### English
Existing platforms (TryHackMe, Hack The Box, Cybrary, hackora.org-like sites) are strong but: text/screen only (no immersion), one-size-fits-all paths, weak accessibility, and human/forum support with no specialized real-time AI teacher.

**Our vision:** a cybersecurity learning platform combining **VR immersion**, a **specialized AI teacher**, an **adaptive personal AI trainer**, **global certification tracks**, and **accessibility-first design**.

---

## 2) الجمهور المستهدف / Target Audience

| الشريحة / Segment | الاحتياج / Need |
|---|---|
| مبتدئون / Beginners | مدخل بصري تفاعلي بلا خوف من التعقيد |
| طلاب جامعات / University students | تدريب عملي + تحضير شهادات |
| محترفون يعيدون التأهيل / Reskillers | مسار سريع لشهادة معتمدة |
| ذوو الاحتياجات الخاصة / Learners with disabilities | تعلّم بالطريقة التي تناسبهم (بصري/سمعي/حركي/إدراكي) |
| جهات وشركات / B2B & Gov | تدريب فرق الأمن + تقارير امتثال (يتوافق مع رؤية 2030 والأمن السيبراني السعودي) |

---

## 3) تحليل تنافسي مختصر / Competitive Snapshot

| المنصة | القوة | الفجوة التي نملؤها |
|---|---|---|
| TryHackMe / HTB | مختبرات عملية قوية، مجتمع | لا VR، لا معلّم AI متكيّف، ضعف الوصولية والعربية |
| Cybrary / SANS | محتوى شهادات عميق | باهظ، نصي، غير منغمس |
| hackora.org | تدريب تفاعلي | (نفس الفجوات أعلاه) |

**ميزتنا التفاضلية / Our moat:** الانغماس (VR) + التخصيص (Adaptive AI) + الوصولية + المحتوى ثنائي اللغة العربي/الإنجليزي.

---

## 4) الميزات الأساسية / Core Features

### 4.1 المعلّم/المدرّب الذكي — AI Teacher & Adaptive Trainer

**عربي — ماذا يفعل:**
- يشرح المفاهيم بلغة الطالب (عربي/إنجليزي) وبمستواه.
- يجيب على الأسئلة لحظياً داخل الدرس أو المختبر.
- يولّد تمارين وأسئلة اختبار مخصّصة.
- يراقب الأداء (وقت، أخطاء، محاولات) ويبني **ملف تعلّم** لكل طالب.
- يكيّف الأسلوب: بصري (رسوم/3D)، سمعي (شرح صوتي)، قرائي (نصوص)، حركي (مختبرات عملية).
- ينبّه ويحفّز (Spaced repetition، تذكير بالمراجعة).

**English — how it works (architecture):**
- **LLM core:** Claude (Anthropic API) as the tutoring brain — bilingual, strong reasoning, tool-use.
- **RAG layer:** course + certification content indexed in a vector DB so answers are grounded (no hallucinated exam facts).
- **Learner model:** a per-student profile (skill graph, pace, preferred modality, misconceptions) stored and fed into the prompt each session.
- **Adaptive policy:** rules + lightweight ML that pick the next item and modality based on the learner model (mastery learning / knowledge tracing).
- **Tool use:** the AI can spawn a lab, grade a task, generate a quiz, or launch a VR scene via function calls.

### 4.2 الواقع الافتراضي — VR Learning

أمثلة سيناريوهات VR / Example VR scenarios:
- **غرفة الشبكة (Network Room):** الطالب يمشي داخل شبكة ثلاثية الأبعاد، يرى الحزم تتحرك، يضبط الجدار الناري بيده.
- **مسرح الهجوم (Attack Theatre):** تمثيل هجوم فيشينغ/برمجية خبيثة كأحداث مرئية يوقفها الطالب.
- **مركز عمليات SOC:** لوحات مراقبة افتراضية للتدرب على كشف الحوادث والاستجابة.
- **معمل التشفير:** تفكيك/تركيب عمليات التشفير بصرياً.

**تقنياً / Tech:** WebXR (يعمل في المتصفح والنظارات مثل Meta Quest) للبداية، ثم تطبيق Unity أصلي لاحقاً للمشاهد الثقيلة. **مبدأ مهم:** كل درس VR له بديل ثنائي الأبعاد (2D fallback) — لا أحد يُستبعد لعدم امتلاك نظارة، وهذا أيضاً جزء من الوصولية.

### 4.3 مسارات الشهادات — Certification Tracks

المرحلة الأولى / Phase 1 tracks:
- **CompTIA Security+** (مدخل، الأعلى طلباً)
- **Certified Ethical Hacker (CEH)**
- لاحقاً: **CISSP، CySA+، OSCP، ISO 27001 Lead**

كل مسار / Each track includes: دروس + مختبرات + اختبارات تجريبية محاكية للامتحان + تتبّع الجاهزية (readiness score) + بطاقات مراجعة ذكية.

> **ملاحظة / Note:** نُدرّب *على* الشهادات ولا نصدر شهادات معتمدة رسمياً؛ الاعتماد الرسمي يتطلب اتفاقيات مع الجهات المانحة (CompTIA/EC-Council/ISC²). We *prepare for* certs; official accreditation requires partner agreements.

### 4.4 الوصولية لذوي الاحتياجات الخاصة — Accessibility (First-Class)

| الفئة / Group | الميزات / Features |
|---|---|
| الإعاقة البصرية / Visual | قارئ شاشة كامل، وصف صوتي للمشاهد، تباين عالٍ، تكبير، وصف صوتي للـ VR (audio-first mode) |
| الإعاقة السمعية / Hearing | ترجمة نصية لكل صوت، لغة إشارة (فيديو/أفاتار)، تنبيهات بصرية |
| الحركية / Motor | تحكم كامل بلوحة المفاتيح/الصوت، أهداف كبيرة، بلا مؤقتات صارمة، VR بلا حركة مجهدة |
| الإدراكية / Cognitive | لغة مبسّطة، خطوات صغيرة، تقليل التشتيت، وتيرة يحددها الطالب |
| الحسّاسية للحركة / VR comfort | خيارات ضد دوار الحركة، أوضاع جلوس، حركة انتقالية |

**المعيار / Standard:** الالتزام بـ **WCAG 2.2 AA** كحد أدنى + إرشادات XR accessibility (XAUR). المدرّب الذكي نفسه يتكيّف مع ملف الوصولية للطالب.

### 4.5 التلعيب والمجتمع — Gamification & Community
نقاط، شارات، مسارات، لوحات صدارة اختيارية، تحديات CTF أسبوعية، وضع فرق للشركات.

---

## 5) المعمارية التقنية الموصى بها / Recommended Technical Architecture

### لماذا هذا الاختيار / Why this stack
اخترتُ **مقاربة الويب أولاً (Web-first)** لأنها الأسرع وصولاً للسوق، تعمل على أي جهاز، تدعم VR عبر المتصفح (WebXR)، وتسهّل ثنائية اللغة والوصولية. تطبيق VR الأصلي (Unity) يُضاف في مرحلة لاحقة للمشاهد المتقدمة.

```
┌────────────────────────────────────────────────────────────┐
│                        العميل / Clients                     │
│  Web (Next.js/React) · WebXR (three.js/A-Frame) ·           │
│  Mobile (React Native) · [لاحقاً] Unity VR (Quest)          │
└───────────────┬────────────────────────────────────────────┘
                │ HTTPS / WebSocket
┌───────────────▼────────────────────────────────────────────┐
│                    الخلفية / Backend API                    │
│  Node.js (NestJS) أو Python (FastAPI)                        │
│  Auth · Courses · Labs orchestration · Progress · Billing   │
└───┬───────────────┬───────────────┬────────────────────────┘
    │               │               │
┌───▼────┐   ┌──────▼───────┐   ┌───▼──────────────────────┐
│Postgres│   │ Vector DB    │   │  خدمة الذكاء / AI Service │
│(core)  │   │(pgvector/    │   │  Claude API (tutor)      │
│        │   │ Qdrant) RAG  │   │  Learner-model + policy  │
└────────┘   └──────────────┘   └──────────────────────────┘
    │
┌───▼─────────────────────────────────────────────────────────┐
│  مختبرات معزولة / Isolated Labs: Docker/K8s + Firecracker    │
│  (بيئات هجوم/دفاع حقيقية لكل طالب، معزولة وآمنة)              │
└─────────────────────────────────────────────────────────────┘
```

### المكوّنات / Components

| الطبقة / Layer | التقنية الموصى بها / Recommendation | البديل / Alt |
|---|---|---|
| Web frontend | **Next.js (React) + TypeScript + Tailwind** | Nuxt/Vue |
| i18n (عربي/إنجليزي + RTL) | **next-intl / i18next** + دعم RTL كامل | — |
| VR (browser) | **WebXR + three.js / react-three-fiber** أو **A-Frame** | Babylon.js |
| VR (native, لاحقاً) | **Unity + OpenXR** (Meta Quest) | Unreal |
| Backend | **NestJS (Node/TS)** | FastAPI (Python) |
| DB | **PostgreSQL** | — |
| Vector/RAG | **pgvector** (بداية) → Qdrant | Pinecone |
| AI tutor | **Claude API (claude-opus / claude-sonnet)** | — |
| Speech (وصولية) | STT/TTS (نطق + تفريغ) للعربي والإنجليزي | — |
| Labs sandbox | **Docker + Kubernetes** (عزل قوي) | Firecracker microVMs |
| Auth | **Auth.js / Keycloak** + MFA | Auth0 |
| Infra/Cloud | سحابة سعودية/إقليمية للامتثال (STC Cloud / AWS Bahrain) | Azure |
| Payments | مزود يدعم مدى/Apple Pay (Moyasar/Tap) + Stripe دولي | — |
| Analytics | PostHog (خصوصية) | — |

### ملاحظات معمارية مهمة / Key architectural notes
- **عزل المختبرات أمن حرج:** بيئات الهجوم يجب أن تكون معزولة تماماً (شبكة داخلية، حدود موارد، تدمير تلقائي) حتى لا تُستغل ضد المنصة أو الإنترنت.
- **RAG لتفادي الهلوسة:** حقائق الامتحانات تأتي من قاعدة معرفة مُدارة، لا من ذاكرة النموذج.
- **الخصوصية:** ملف تعلّم الطالب وبيانات الوصولية بيانات حساسة — تشفير، تقليل جمع، وموافقة صريحة (متوافق مع نظام حماية البيانات الشخصية PDPL السعودي).

---

## 6) نموذج البيانات المبدئي / Initial Data Model (high level)

```
User(id, name, email, locale, role)
AccessibilityProfile(user_id, visual, hearing, motor, cognitive, vr_comfort, prefs…)
LearnerModel(user_id, skill_graph_json, pace, preferred_modality, misconceptions…)
Course(id, title_ar, title_en, level, cert_track)
Module(id, course_id, type[video|reading|lab|vr|quiz], content_ref)
Lab(id, module_id, image, network_policy, difficulty)
VRScene(id, module_id, scene_ref, has_2d_fallback)
Enrollment(user_id, course_id, progress, readiness_score)
Attempt(id, user_id, item_id, score, time_spent, errors_json)
Certification(id, name, provider, track_ref)
TutorSession(id, user_id, transcript_ref, modality_used, outcomes)
Subscription(user_id, plan, status, provider)
```

---

## 7) خارطة الطريق / Roadmap (phased)

### المرحلة 0 — التأسيس / Foundations (أسابيع 1–4)
- هوية، تصميم UX ثنائي اللغة RTL، نظام تصميم متوافق مع WCAG 2.2 AA.
- هيكل المشروع (Monorepo)، CI/CD، بيئات.
- إثبات مفهوم للمعلّم الذكي (Claude + RAG على درس واحد).

### المرحلة 1 — MVP (أسابيع 5–14)
- تسجيل/دخول + ملف الوصولية.
- مسار **Security+** كامل: دروس + اختبارات تجريبية + بطاقات.
- **المعلّم الذكي المحادثي** داخل الدروس (نص + صوت).
- **مشهد VR واحد** (غرفة الشبكة) عبر WebXR مع بديل 2D.
- مختبر عملي واحد معزول (Docker).
- الوصولية الأساسية (قارئ شاشة، ترجمة، تحكم لوحة مفاتيح، تباين/تكبير).

### المرحلة 2 — التخصيص والتوسّع / Adaptivity & Scale (أسابيع 15–26)
- المدرّب المتكيّف (Learner model + adaptive path + knowledge tracing).
- مسار CEH + 3–5 مشاهد VR إضافية.
- لغة إشارة (أفاتار/فيديو)، وضع سمعي أول للـ VR.
- الاشتراكات والمدفوعات، لوحة تقدم، تلعيب.

### المرحلة 3 — النضج / Maturity (أسابيع 27+)
- تطبيق Unity الأصلي لـ Meta Quest.
- منتج B2B/حكومي + تقارير امتثال.
- مسارات إضافية (CISSP، OSCP)، شراكات اعتماد، تحديات CTF.

---

## 8) الفريق المطلوب / Team (lean start)

| الدور / Role | المرحلة |
|---|---|
| Product/PM (أنت + قائد) | 0+ |
| Full-stack (Next.js/Nest) ×2 | 0+ |
| AI/ML engineer (LLM/RAG/adaptive) | 1+ |
| VR/3D engineer (WebXR/Unity) | 1+ |
| Accessibility specialist (a11y/WCAG) | 0+ (استشاري) |
| خبير محتوى أمن سيبراني (SME) | 0+ |
| UX/UI designer (RTL + a11y) | 0+ |
| DevOps/Security (عزل المختبرات) | 1+ |

> يمكن البدء بفريق مصغّر 4–5 أشخاص + استشاريين، ثم التوسّع.

---

## 9) تقدير التكاليف / Cost Estimate (indicative, not a quote)

**تكاليف البناء / Build (أول 6 أشهر، تقديري):**
- فريق مصغّر 4–5 أفراد: النطاق الأكبر من الميزانية (حسب سوق التوظيف).
- استشارات وصولية + خبير أمن (SME): متوسط.

**تكاليف تشغيل شهرية / Monthly run-rate (MVP):**
| البند / Item | ملاحظة |
|---|---|
| استضافة سحابية + مختبرات (K8s) | يتصاعد مع عدد المستخدمين المتزامنين |
| استدعاءات Claude API (المعلّم) | حسب عدد الرسائل — يُدار بالتخزين المؤقت وRAG لتقليل التكلفة |
| Vector DB / تخزين | منخفض في البداية (pgvector) |
| STT/TTS للوصولية | حسب دقائق الصوت |
| مدفوعات/دعم/أدوات | ثابت تقريباً |

> **توصية لضبط التكلفة:** استخدم نموذجاً أصغر (claude-sonnet/haiku) للردود الروتينية والنموذج الأقوى للشرح المعقّد، مع **prompt caching** و**RAG** لتقليل التوكنز. أستطيع تجهيز نموذج تكلفة تفصيلي (بالأرقام) عند تحديد عدد المستخدمين المتوقع.

---

## 10) المخاطر والتخفيف / Risks & Mitigations

| الخطر / Risk | التخفيف / Mitigation |
|---|---|
| أمن المختبرات (إساءة استخدام) | عزل شبكي كامل، حدود موارد، تدمير تلقائي، مراقبة |
| هلوسة المعلّم في حقائق الامتحان | RAG + مصادر مُدارة + مراجعة SME |
| تكلفة الـ VR وتعقيده | ويب أولاً + بديل 2D دائماً، Unity لاحقاً |
| الاعتماد الرسمي للشهادات | شراكات مع CompTIA/EC-Council؛ حتى ذلك: "تحضير" لا "إصدار" |
| خصوصية بيانات الوصولية/التعلّم | تشفير، PDPL، موافقة صريحة، تقليل الجمع |
| دوار الحركة في VR | أوضاع راحة، جلوس، حركة انتقالية |
| الحمل على المدرّب البشري | AI يتحمّل الدعم الأولي، تصعيد بشري عند الحاجة |

---

## 11) الاعتبارات القانونية والامتثال / Legal & Compliance
- **PDPL** (نظام حماية البيانات الشخصية السعودي) + **GDPR** إن توسّعنا دولياً.
- متطلبات **الهيئة الوطنية للأمن السيبراني (NCA)** وضوابطها للمحتوى التدريبي.
- **WCAG 2.2 AA** كالتزام وصولية.
- تراخيص المحتوى والعلامات التجارية للشهادات (استخدام أسماء CompTIA/CEH بشكل نظامي).

---

## 12) الخطوة التالية المقترحة / Recommended Next Step

**عربي:** أقترح — بعد موافقتك على هذه الوثيقة — أن أبني **MVP أولي شغّال** يتضمن:
1. هيكل مشروع Next.js ثنائي اللغة (عربي RTL + إنجليزي) بنظام تصميم متوافق مع الوصولية.
2. صفحة رئيسية + كتالوج دورات + صفحة درس.
3. **معلّم AI محادثي تجريبي** (Claude) داخل الدرس.
4. نموذج مشهد VR بسيط عبر WebXR مع بديل 2D.
5. نموذج ملف الوصولية.

**English:** After you approve this plan, I recommend building a working MVP: a bilingual Next.js scaffold (accessibility-first), home + course catalog + lesson page, a demo conversational AI tutor, a simple WebXR VR scene with 2D fallback, and an accessibility profile.

---

### أسئلة أحتاج إجابتها قبل الـ MVP / Questions before MVP
1. الاسم النهائي للمنصة؟ / Final platform name?
2. أول شهادة نركّز عليها: Security+ أم CEH؟ / First cert focus?
3. هل عندك محتوى/مصادر جاهزة أم نبدأ من الصفر؟ / Existing content or from scratch?
4. الميزانية والجدول الزمني التقريبي؟ / Budget & timeline range?
5. أولوية الإطلاق: أفراد (B2C) أم جهات/شركات (B2B/Gov)؟ / Launch priority?

> هذه مسودة أولى — كل قسم قابل للتعديل حسب أولوياتك.
> This is a first draft — every section is adjustable to your priorities.
