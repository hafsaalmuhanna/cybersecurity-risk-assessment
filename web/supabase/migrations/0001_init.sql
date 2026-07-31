-- CyberFaris — initial schema
-- Run in Supabase (SQL editor or `supabase db push`). Enables auth-linked profiles,
-- membership/subscriptions, and community content (blog, hackathons, initiatives).

-- ---------- profiles (1:1 with auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('member','trainer','admin')),
  rank text not null default 'squire' check (rank in ('squire','knight','commander')),
  primary_arena text,
  accessibility jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- plans & subscriptions ----------
create table if not exists public.plans (
  id text primary key,           -- 'squire' | 'knight' | 'commander'
  name_ar text, name_en text, price_cents int not null default 0, period text
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text references public.plans(id),
  status text not null default 'active' check (status in ('active','canceled','past_due')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- blog ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  author_id uuid references public.profiles(id) on delete set null,
  title_ar text, title_en text, body_ar text, body_en text, excerpt_ar text, excerpt_en text,
  team text check (team in ('red','blue','purple','acc')),
  status text not null default 'draft' check (status in ('draft','pending','published')),
  created_at timestamptz not null default now()
);

-- ---------- hackathons ----------
create table if not exists public.hackathons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_ar text, title_en text, starts_at timestamptz, mode text, prize text,
  status text not null default 'soon' check (status in ('open','soon','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.hackathon_registrations (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid references public.hackathons(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  team_name text,
  created_at timestamptz not null default now(),
  unique (hackathon_id, user_id)
);

-- ---------- initiatives ----------
create table if not exists public.initiatives (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title_ar text, title_en text, desc_ar text, desc_en text, icon text
);
create table if not exists public.initiative_signups (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid references public.initiatives(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (initiative_id, user_id)
);

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.posts enable row level security;
alter table public.hackathon_registrations enable row level security;
alter table public.initiative_signups enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin() returns boolean language sql stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: users read/update their own; admins read all
create policy "profiles self read"   on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- subscriptions: owner reads own; admin all
create policy "subs owner read" on public.subscriptions for select using (auth.uid() = user_id or public.is_admin());

-- posts: anyone reads published; authors manage own; admin all
create policy "posts read published" on public.posts for select using (status = 'published' or author_id = auth.uid() or public.is_admin());
create policy "posts author insert"  on public.posts for insert with check (author_id = auth.uid());
create policy "posts author update"  on public.posts for update using (author_id = auth.uid() or public.is_admin());

-- registrations / signups: owner manages own
create policy "hreg owner" on public.hackathon_registrations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "isignup owner" on public.initiative_signups for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- plans / hackathons / initiatives are public catalog (read to everyone)
alter table public.plans enable row level security;
alter table public.hackathons enable row level security;
alter table public.initiatives enable row level security;
create policy "plans public read"       on public.plans       for select using (true);
create policy "hackathons public read"  on public.hackathons  for select using (true);
create policy "initiatives public read" on public.initiatives for select using (true);

-- ---------- seed catalog ----------
insert into public.plans (id,name_ar,name_en,price_cents,period) values
  ('squire','مُهر','Squire',0,'forever'),
  ('knight','فارس','Knight',1900,'month'),
  ('commander','أمير الفرسان','Commander',4900,'month')
on conflict (id) do nothing;
