-- ===========================================================================
--  Duo Pixel Agency — Supabase schema
--  Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
--  It creates tables, RLS policies, storage bucket and realtime publication.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- designers  (editable from the designer dashboard)
-- ---------------------------------------------------------------------------
create table if not exists public.designers (
  slug              text primary key check (slug in ('markanti', 'sundar')),
  name              text not null,
  short_name        text not null,
  title             text not null,
  tagline           text not null default '',
  bio               text not null default '',
  skills            text[] not null default '{}',
  tools             text[] not null default '{}',
  experience        text not null default '',
  photo_color       text[] not null default {'#B9FF39', '#3E7BFF'},
  starting_price    integer not null default 0,
  avg_delivery_days integer not null default 7,
  availability      text not null default 'Available' check (availability in ('Available', 'Busy')),
  availability_note text not null default '',
  whatsapp          text not null default '',
  email             text not null default '',
  stats             jsonb not null default '{"projects": 0, "clients": 0, "rating": 5}'::jsonb
);

-- ---------------------------------------------------------------------------
-- packages  (prices edited from the dashboard)
-- ---------------------------------------------------------------------------
create table if not exists public.packages (
  id            text primary key,
  name          text not null,
  price         integer not null default 0,
  price_note    text not null default 'one-time',
  delivery      text not null default '',
  summary       text not null default '',
  features      text[] not null default '{}',
  popular       boolean not null default false,
  website_types text[] not null default '{}'
);

-- ---------------------------------------------------------------------------
-- reviews  (seeded client reviews per designer)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id       text primary key,
  designer text not null check (designer in ('markanti', 'sundar')),
  client   text not null,
  role     text not null default '',
  rating   numeric(2,1) not null default 5,
  text     text not null,
  project  text not null default '',
  date     date not null default current_date
);

-- ---------------------------------------------------------------------------
-- bookings  (the core table)
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id               uuid primary key default gen_random_uuid(),
  booking_code     text not null unique,
  designer_slug    text check (designer_slug in ('markanti', 'sundar')),
  website_type     text not null,
  website_name     text not null,
  description      text not null,
  pages_needed     text not null default '',
  features         text[] not null default '{}',
  style_preferences text not null default '',
  reference_links  text not null default '',
  files            jsonb not null default '[]'::jsonb,
  budget           text not null default '',
  deadline         text not null default '',
  language         text not null default 'English',
  package_id       text,
  client_name      text not null,
  client_phone     text not null,
  client_email     text not null,
  contact_method   text not null default 'WhatsApp',
  status           text not null default 'Pending'
                   check (status in ('Pending','Accepted','In Design','Review','Revisions','Delivered','Completed','Cancelled')),
  history          jsonb not null default '[]'::jsonb,
  rating           numeric(2,1),
  review           text,
  internal_note    text not null default '',
  client_uid       uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists bookings_code_idx on public.bookings (booking_code);
create index if not exists bookings_designer_idx on public.bookings (designer_slug, status);
create index if not exists bookings_client_idx on public.bookings (client_uid);

-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text not null default '',
  subject    text not null default '',
  message    text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- profiles (mirrors auth.users so we can look up designers by uid)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text not null default '',
  designer_slug text check (designer_slug in ('markanti', 'sundar')),
  created_at    timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, designer_slug)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when new.email in ('markanti@duopixel.agency', 'sundar@duopixel.agency')
         then split_part(new.email, '@', 1)::text
         else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.designers         enable row level security;
alter table public.packages          enable row level security;
alter table public.reviews           enable row level security;
alter table public.bookings          enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.profiles          enable row level security;

-- helper: is the current user one of the two designer accounts?
create or replace function public.is_designer()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (
        designer_slug is not null
        or email in ('markanti@duopixel.agency', 'sundar@duopixel.agency')
      )
  );
$$;

-- designers / packages / reviews: public read, designer write
drop policy if exists "public read designers" on public.designers;
create policy "public read designers" on public.designers for select using (true);
drop policy if exists "designers update own" on public.designers;
create policy "designers update own" on public.designers
  for update using (public.is_designer()) with check (public.is_designer());

drop policy if exists "public read packages" on public.packages;
create policy "public read packages" on public.packages for select using (true);
drop policy if exists "designers update packages" on public.packages;
create policy "designers update packages" on public.packages
  for update using (public.is_designer()) with check (public.is_designer());

drop policy if exists "public read reviews" on public.reviews;
create policy "public read reviews" on public.reviews for select using (true);

-- bookings
drop policy if exists "anyone can create bookings" on public.bookings;
create policy "anyone can create bookings" on public.bookings
  for insert with check (true);

drop policy if exists "client reads own bookings" on public.bookings;
create policy "client reads own bookings" on public.bookings
  for select using (
    auth.uid() = client_uid
    or client_email = coalesce(auth.jwt() ->> 'email', '')
  );

drop policy if exists "designers read all bookings" on public.bookings;
create policy "designers read all bookings" on public.bookings
  for select using (public.is_designer());

drop policy if exists "designers update bookings" on public.bookings;
create policy "designers update bookings" on public.bookings
  for update using (public.is_designer()) with check (public.is_designer());

drop policy if exists "clients update own bookings" on public.bookings;
create policy "clients update own bookings" on public.bookings
  for update using (auth.uid() = client_uid) with check (auth.uid() = client_uid);

-- contact messages: anyone can write, only designers read
drop policy if exists "anyone can message" on public.contact_messages;
create policy "anyone can message" on public.contact_messages for insert with check (true);
drop policy if exists "designers read messages" on public.contact_messages;
create policy "designers read messages" on public.contact_messages
  for select using (public.is_designer());

-- profiles
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_touch on public.bookings;
create trigger bookings_touch
  before update on public.bookings
  for each row execute procedure public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Storage: attachments bucket (logo / sketches uploads)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('booking-attachments', 'booking-attachments', true)
on conflict (id) do nothing;

drop policy if exists "public read booking attachments" on storage.objects;
create policy "public read booking attachments" on storage.objects
  for select using (bucket_id = 'booking-attachments');

drop policy if exists "anyone can upload booking attachments" on storage.objects;
create policy "anyone can upload booking attachments" on storage.objects
  for insert with check (bucket_id = 'booking-attachments');

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.bookings;
