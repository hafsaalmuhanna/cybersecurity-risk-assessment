# العارضات — كيف تولّدينهن وتسمّينهن

في Codera، **العارضات مكتبة خاصة بك** (أنتِ Codera)، والتجّار يفعّلون منها ما يناسب متجرهم.
لكل عارضة **اسم** ونسختان: **عادية** و**بحجاب**، ويتبدّلن تلقائياً في المتجر.

عندك ٣ طرق — الأولى الأسهل:

---

## الطريقة ١: توليد داخل Codera (بضغطة) — موصى بها

لوحة المنصّة (`/admin`) → قسم **العارضات** → **✨ توليد بالذكاء الاصطناعي**:

1. اكتبي **الاسم** (مثلاً: ليلى).
2. اختاري **الإثنية/المظهر** (خليجي، جنوب آسيوي، متوسطي، بشرة داكنة، شرق آسيوي…).
3. اختاري **لون البشرة**.
4. اضغطي **توليد** → يولّد **النسختين** (عادية + حجاب) ويحفظهما باسم العارضة.

### لتصير الصور واقعية (لا توضيحية)
بدون مفتاح، Codera يولّد صورة **توضيحية**. لصور فوتوغرافية واقعية، أضيفي مزوّد صور في `.env`:

```bash
IMAGE_PROVIDER=replicate          # أو openai أو fal
# لـ Replicate (Flux/SDXL):
REPLICATE_API_TOKEN=r8_xxx
IMAGE_MODEL_VERSION=<model-version-hash>   # مثلاً نسخة black-forest-labs/flux
# أو OpenAI:
IMAGE_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
# أو Fal:
IMAGE_PROVIDER=fal
FAL_KEY=xxx
```

**أيهم أختار؟**
- **Replicate + Flux** — جودة عالية وسعر معقول، الأنسب للبدء.
- **OpenAI (gpt-image-1)** — بسيط وسريع الربط.
- **Fal (Flux)** — سريع جداً.

التكلفة تقريبية: ~0.01–0.05 دولار للصورة (تحقّقي من أسعار المزوّد). أنتِ تولّدين العارضات
**مرة واحدة** وتعاد استخدامها لكل المتاجر — فالتكلفة بسيطة.

---

## الطريقة ٢: توليد خارجي + رفع (بأي أداة صور)

إذا تبين تستخدمين Midjourney أو أداتك المفضّلة، ولّدي الصور ثم ارفعيها من
**العارضات → + رفع يدوي** (صورة عادية + صورة بحجاب لكل عارضة).

### قوالب Prompt جاهزة (انسخيها)

**نسخة عادية (بدون حجاب):**
```
Elegant fashion e-commerce studio half-body portrait of a {الإثنية} woman in her mid-20s,
{لون البشرة} skin, long styled hair, natural glam makeup, calm confident expression,
looking at camera, wearing a plain simple fitted neutral top, clean warm beige studio
background with soft golden bokeh, professional beauty lighting, high-end editorial
fashion photography, photorealistic, sharp focus, head and shoulders fully visible.
```

**نسخة بحجاب (نفس العارضة):**
```
...same woman..., wearing an elegant modest hijab headscarf neatly framing the face,
natural glam makeup, warm beige studio background with soft golden bokeh, professional
beauty lighting, photorealistic. (use the same seed/reference to keep the same face)
```

### أمثلة جاهزة بالأسماء (مثل اللي بالصور)

| الاسم | الإثنية | البشرة | ملاحظة |
|---|---|---|---|
| **ليلى** | Gulf Khaleeji | warm wheatish | خليجي كلاسيك |
| **نورة** | South Asian | medium | جنوب آسيوي |
| **سارة** | Gulf Khaleeji | fair | تظهر بالحجاب افتراضياً |
| **مايا** | East African | deep | بشرة داكنة |
| **صوفيا** | Mediterranean | fair | متوسطي |
| **مي** | East Asian | fair | شرق آسيوي |

> **سرّ ثبات الوجه:** لتبقى العارضة **نفس الوجه** في كل الصور (عادية/حجاب/وضعيات)، استخدمي
> **نفس الـ seed** أو صورة مرجعية (reference / face-swap / LoRA). هذا مهم لهوية ثابتة —
> مفصّل في `ROADMAP.md` (المرحلة ٢).

---

## الطريقة ٣: صور حقيقية (تصوير)

لو صوّرتِ عارضات حقيقيات في استوديو، ارفعي صورهن مباشرة (**+ رفع يدوي**). أعلى جودة
وأوضح هوية، لكن أعلى تكلفة. مناسب لاحقاً عند التوسّع.

---

## بعد إنشاء العارضة

- تظهر مباشرة في مكتبة العارضات، ويقدر التاجر يفعّلها من لوحته.
- في المتجر، زر **حجاب** يبدّل بين النسختين تلقائياً.
- عند التجربة الافتراضية، تُستخدم النسخة الصحيحة (عادية/حجاب) كأساس للموديل.
