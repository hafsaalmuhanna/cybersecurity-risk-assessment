# CyberFaris — سايبر فارس

The first global virtual school forging **cyber knights** — VR + AI, inclusive by design, from Kuwait.
Built with **Next.js (App Router)** + **Supabase**, bilingual (AR/EN, RTL) with a Hack-The-Box-inspired dark identity.

## Pages
- **Landing** `/` — hero, arenas, latest blog, hackathons, initiatives
- **Faris Blog** `/blog`, `/blog/[slug]` — members' articles
- **Faris Hackathons** `/hackathons` — competitions + registration
- **Faris Initiatives** `/initiatives` — inclusion / youth / women in cyber
- **Membership** `/membership` and **Subscriptions** `/pricing`
- **Auth** `/login`, `/register` (Supabase email/password)
- **Member account** `/account` — rank, arenas, subscription, posts
- **Admin (Command Center)** `/admin` — members, content, approvals, subscriptions

> The site renders with **sample data** until Supabase is connected, so you can preview it immediately.

## Run locally
```bash
cd web
npm install
cp .env.example .env.local   # then fill in your Supabase URL + anon key
npm run dev                  # http://localhost:3000
```

## Connect Supabase
1. Create a project at supabase.com (or reuse an existing one).
2. In **SQL editor**, run `supabase/migrations/0001_init.sql`.
3. Copy **Project URL** and **anon public key** (Settings → API) into `.env.local`.
4. Restart `npm run dev`. Registration, login, and the account dashboard now use the live database.
5. To make yourself an admin: in the `profiles` table set your row's `role` to `admin`.

## Deploy
Deploy `web/` to **Vercel** (framework auto-detected). Add the two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project settings.

## Next phases
- Payments (Stripe / Moyasar) wired to `subscriptions`
- Learning "arenas" + interactive rooms/labs (isolated environments)
- AI mentor (Claude) + RAG over course content
- VR scenes (WebXR) with 2D fallback
- Accessibility passes to WCAG 2.2 AA
