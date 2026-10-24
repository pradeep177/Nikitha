-- =============================================================================
--  RUN-ALL: everything Supabase needs, in one script.
--  Paste this whole file into Supabase → SQL Editor → New query → Run.
--  It is a convenience copy of these files, in order:
--    1. supabase/migrations/20261024000000_init.sql
--    2. supabase/migrations/20261024000100_admin_functions.sql
--    3. supabase/migrations/20261024000200_flirty_lines.sql
--    4. supabase/migrations/20261024000300_her_photos.sql
--    5. supabase/seed.sql  (placeholder content — only fills empty tables)
--  Safe to run more than once.
-- =============================================================================
-- ===== FILE: 20261024000000_init.sql =====
-- =============================================================================
--  OUR LITTLE UNIVERSE ♡ — complete database setup
--  Run once in Supabase Dashboard → SQL Editor (or `supabase db push`).
--
--  Creates: tables, constraints, indexes, updated_at triggers, role helpers,
--  Row Level Security policies, storage buckets and storage policies.
--
--  Access model ("hybrid"):
--    • Anyone (anon)          → content in sections set to 'public'
--    • Viewer (Nikitha)       → also sections set to 'private'
--    • Admin (you)            → everything, plus all writes
--    • Section visibility lives in site_settings.section_visibility and is
--      enforced HERE in the database, not just hidden in the frontend.
--  Roles are granted only via public.user_roles, which only admins (or the
--  SQL editor) can modify — signing up never grants any access.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Shared trigger: keep updated_at fresh
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. Roles
-- -----------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

comment on table public.user_roles is
  'Who may administer (admin) or view private sections (viewer). Only admins can change this table.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_viewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin', 'viewer'));
$$;

-- -----------------------------------------------------------------------------
-- 3. Site settings (single row, id = 1)
-- -----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                   smallint primary key default 1 check (id = 1),
  site_title           text not null default 'Our Little Universe ♡' check (char_length(site_title) between 1 and 80),
  her_name             text not null default 'Nikitha' check (char_length(her_name) between 1 and 60),
  signature            text not null default 'Made with love, just for you' check (char_length(signature) <= 120),
  theme                text not null default 'blush' check (theme in ('blush', 'lavender', 'peach')),
  show_hearts          boolean not null default true,
  show_stars           boolean not null default true,
  show_clouds          boolean not null default true,
  -- 'public' | 'private' (viewer + admin) | 'hidden' (admin only). Unknown keys are treated as private.
  section_visibility   jsonb not null default '{
    "memories": "public", "quiz": "public", "chats": "private", "reasons": "public",
    "timeline": "public", "little_things": "public", "soundtrack": "public",
    "voice_notes": "private", "open_when": "private", "surprise": "private"
  }'::jsonb,
  quiz_save_results    boolean not null default true,
  quiz_result_messages jsonb not null default '{}'::jsonb,
  soundtrack_intro     text check (char_length(soundtrack_intro) <= 300),
  updated_at           timestamptz not null default now()
);

create or replace function public.can_view_section(p_section text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case coalesce((select section_visibility ->> p_section from public.site_settings where id = 1), 'private')
    when 'public'  then true
    when 'private' then public.is_viewer()
    else public.is_admin()
  end;
$$;

create or replace function public.quiz_saving_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select quiz_save_results from public.site_settings where id = 1), false);
$$;

-- -----------------------------------------------------------------------------
-- 4. Landing page hero (single row, id = 1)
-- -----------------------------------------------------------------------------
create table if not exists public.hero_content (
  id             smallint primary key default 1 check (id = 1),
  label          text check (char_length(label) <= 120),
  heading        text check (char_length(heading) <= 120),
  message        text check (char_length(message) <= 1000),
  affection_line text check (char_length(affection_line) <= 400),
  photo_path     text,             -- object path in bucket 'public-media'
  photo_alt      text check (char_length(photo_alt) <= 200),
  photo_caption  text check (char_length(photo_caption) <= 160),
  primary_cta    text check (char_length(primary_cta) <= 80),
  secondary_cta  text check (char_length(secondary_cta) <= 80),
  scroll_hint    text check (char_length(scroll_hint) <= 120),
  updated_at     timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 5. Content tables
-- -----------------------------------------------------------------------------
create table if not exists public.cute_messages (
  id             uuid primary key default gen_random_uuid(),
  message        text not null check (char_length(message) between 1 and 400),
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  is_placeholder boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.memory_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 60),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.memories (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(title) between 1 and 120),
  caption        text check (char_length(caption) <= 600),
  image_path     text,             -- bucket 'public-media', folder 'memories/'
  image_width    integer check (image_width > 0),
  image_height   integer check (image_height > 0),
  alt_text       text check (char_length(alt_text) <= 300),
  taken_on       date,
  location       text check (char_length(location) <= 120),
  category_id    uuid references public.memory_categories (id) on delete set null,
  is_featured    boolean not null default false,
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  is_placeholder boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  category       text not null default 'random'
                 check (category in ('about_me', 'about_you', 'relationship', 'favorites', 'funny', 'inside_jokes', 'random')),
  question       text not null check (char_length(question) between 1 and 300),
  explanation    text check (char_length(explanation) <= 600),
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  is_placeholder boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.quiz_options (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references public.quiz_questions (id) on delete cascade,
  label         text not null check (char_length(label) between 1 and 200),
  is_correct    boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Exactly one correct option per question is enforced in the admin UI;
-- the database guarantees there is never more than one.
create unique index if not exists quiz_options_one_correct
  on public.quiz_options (question_id) where is_correct;

create table if not exists public.quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid default auth.uid() references auth.users (id) on delete set null,
  score      integer not null check (score >= 0),
  total      integer not null check (total between 1 and 200),
  answers    jsonb not null default '{}'::jsonb check (pg_column_size(answers) <= 20000),
  created_at timestamptz not null default now(),
  check (score <= total)
);

comment on table public.quiz_attempts is
  'Finished quiz attempts (score, total, chosen option per question). Insert-only for visitors; readable only by admins.';

create table if not exists public.chat_screenshots (
  id             uuid primary key default gen_random_uuid(),
  image_path     text,             -- bucket 'private-media', folder 'chats/'
  image_width    integer check (image_width > 0),
  image_height   integer check (image_height > 0),
  caption        text check (char_length(caption) <= 300),
  alt_text       text check (char_length(alt_text) <= 300),
  chat_date      date,
  collection     text check (collection in ('funniest', 'cute', 'goodnight', 'everyday', 'worth_saving')),
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  is_placeholder boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.love_notes (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(title) between 1 and 80),
  message        text not null check (char_length(message) between 1 and 1000),
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  is_archived    boolean not null default false,
  is_placeholder boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.timeline_entries (
  id             uuid primary key default gen_random_uuid(),
  event_date     date,
  title          text not null check (char_length(title) between 1 and 160),
  story          text check (char_length(story) <= 2000),
  image_path     text,             -- bucket 'public-media', folder 'timeline/'
  image_alt      text check (char_length(image_alt) <= 300),
  location       text check (char_length(location) <= 120),
  category       text check (char_length(category) <= 40),
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  is_placeholder boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.mood_messages (
  id             uuid primary key default gen_random_uuid(),
  mood           text not null check (mood ~ '^[a-z0-9_]{1,30}$'),
  label          text check (char_length(label) <= 40),   -- optional custom label for non-standard moods
  message        text not null check (char_length(message) between 1 and 800),
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  is_placeholder boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.soundtrack_tracks (
  id             uuid primary key default gen_random_uuid(),
  kind           text not null default 'song' check (kind in ('song', 'voice_note')),
  title          text not null check (char_length(title) between 1 and 120),
  artist         text check (char_length(artist) <= 120),
  note           text check (char_length(note) <= 800),
  audio_path     text,             -- bucket 'audio', folder 'soundtrack/' or 'voice_notes/'
  external_url   text check (external_url is null or external_url ~* '^https?://'),
  artwork_path   text,             -- bucket 'public-media', folder 'artwork/'
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  is_placeholder boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.open_when_letters (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(title) between 1 and 120),
  occasion       text check (char_length(occasion) <= 40),   -- e.g. 'difficult_day'
  message        text not null check (char_length(message) between 1 and 5000),
  image_path     text,             -- bucket 'private-media', folder 'open_when/'
  audio_path     text,             -- bucket 'audio', folder 'open_when/'
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  is_placeholder boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.final_surprise (
  id             smallint primary key default 1 check (id = 1),
  surprise_type  text not null default 'letter'
                 check (surprise_type in ('letter', 'photo', 'collage', 'date', 'gift', 'video', 'custom')),
  heading        text check (char_length(heading) <= 120),
  intro          text check (char_length(intro) <= 300),
  button_label   text check (char_length(button_label) <= 60),
  title          text check (char_length(title) <= 120),
  message        text check (char_length(message) <= 5000),
  image_path     text,             -- bucket 'private-media', folder 'surprise/'
  image_alt      text check (char_length(image_alt) <= 300),
  collage_paths  text[] not null default '{}' check (cardinality(collage_paths) <= 6),
  video_path     text,             -- bucket 'private-media', folder 'surprise/'
  video_url      text check (video_url is null or video_url ~* '^https?://'),
  details        text check (char_length(details) <= 2000),
  signoff        text check (char_length(signoff) <= 120),
  is_placeholder boolean not null default false,
  updated_at     timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 6. Indexes (ordering + foreign keys)
-- -----------------------------------------------------------------------------
create index if not exists cute_messages_order_idx     on public.cute_messages (display_order);
create index if not exists memory_categories_order_idx on public.memory_categories (display_order);
create index if not exists memories_order_idx          on public.memories (display_order, created_at);
create index if not exists memories_category_idx       on public.memories (category_id);
create index if not exists quiz_questions_order_idx    on public.quiz_questions (display_order);
create index if not exists quiz_options_question_idx   on public.quiz_options (question_id, display_order);
create index if not exists quiz_attempts_created_idx   on public.quiz_attempts (created_at desc);
create index if not exists chat_screenshots_order_idx  on public.chat_screenshots (display_order, created_at);
create index if not exists love_notes_order_idx        on public.love_notes (display_order);
create index if not exists timeline_entries_order_idx  on public.timeline_entries (display_order, event_date);
create index if not exists mood_messages_order_idx     on public.mood_messages (mood, display_order);
create index if not exists soundtrack_tracks_order_idx on public.soundtrack_tracks (kind, display_order);
create index if not exists open_when_letters_order_idx on public.open_when_letters (display_order);

-- -----------------------------------------------------------------------------
-- 7. updated_at triggers
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'hero_content', 'cute_messages', 'memory_categories', 'memories',
    'quiz_questions', 'quiz_options', 'chat_screenshots', 'love_notes', 'timeline_entries',
    'mood_messages', 'soundtrack_tracks', 'open_when_letters', 'final_surprise'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- 8. Row Level Security
--    (select fn()) wrappers let Postgres evaluate the helper once per query.
-- -----------------------------------------------------------------------------
alter table public.user_roles        enable row level security;
alter table public.site_settings     enable row level security;
alter table public.hero_content      enable row level security;
alter table public.cute_messages     enable row level security;
alter table public.memory_categories enable row level security;
alter table public.memories          enable row level security;
alter table public.quiz_questions    enable row level security;
alter table public.quiz_options      enable row level security;
alter table public.quiz_attempts     enable row level security;
alter table public.chat_screenshots  enable row level security;
alter table public.love_notes        enable row level security;
alter table public.timeline_entries  enable row level security;
alter table public.mood_messages     enable row level security;
alter table public.soundtrack_tracks enable row level security;
alter table public.open_when_letters enable row level security;
alter table public.final_surprise    enable row level security;

-- user_roles: you can see your own role; only admins manage roles.
drop policy if exists "read own role" on public.user_roles;
create policy "read own role" on public.user_roles
  for select using (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "admins manage roles" on public.user_roles;
create policy "admins manage roles" on public.user_roles
  for all using ((select public.is_admin())) with check ((select public.is_admin()));

-- Single-row, always-public tables (needed to render the landing page).
drop policy if exists "public read" on public.site_settings;
create policy "public read" on public.site_settings for select using (true);
drop policy if exists "public read" on public.hero_content;
create policy "public read" on public.hero_content for select using (true);
drop policy if exists "public read" on public.memory_categories;
create policy "public read" on public.memory_categories for select using (true);

drop policy if exists "public read published" on public.cute_messages;
create policy "public read published" on public.cute_messages
  for select using (is_published or (select public.is_admin()));

-- Section-gated content
drop policy if exists "read visible" on public.memories;
create policy "read visible" on public.memories
  for select using ((is_published and (select public.can_view_section('memories'))) or (select public.is_admin()));

drop policy if exists "read visible" on public.quiz_questions;
create policy "read visible" on public.quiz_questions
  for select using ((is_published and (select public.can_view_section('quiz'))) or (select public.is_admin()));

drop policy if exists "read visible" on public.quiz_options;
create policy "read visible" on public.quiz_options
  for select using (
    (select public.is_admin())
    or exists (
      select 1 from public.quiz_questions q
      where q.id = quiz_options.question_id and q.is_published and (select public.can_view_section('quiz'))
    )
  );

drop policy if exists "read visible" on public.chat_screenshots;
create policy "read visible" on public.chat_screenshots
  for select using ((is_published and (select public.can_view_section('chats'))) or (select public.is_admin()));

drop policy if exists "read visible" on public.love_notes;
create policy "read visible" on public.love_notes
  for select using ((is_published and not is_archived and (select public.can_view_section('reasons'))) or (select public.is_admin()));

drop policy if exists "read visible" on public.timeline_entries;
create policy "read visible" on public.timeline_entries
  for select using ((is_published and (select public.can_view_section('timeline'))) or (select public.is_admin()));

drop policy if exists "read visible" on public.mood_messages;
create policy "read visible" on public.mood_messages
  for select using ((is_published and (select public.can_view_section('little_things'))) or (select public.is_admin()));

drop policy if exists "read visible" on public.soundtrack_tracks;
create policy "read visible" on public.soundtrack_tracks
  for select using (
    (is_published and public.can_view_section(case when kind = 'voice_note' then 'voice_notes' else 'soundtrack' end))
    or (select public.is_admin())
  );

drop policy if exists "read visible" on public.open_when_letters;
create policy "read visible" on public.open_when_letters
  for select using ((is_published and (select public.can_view_section('open_when'))) or (select public.is_admin()));

drop policy if exists "read visible" on public.final_surprise;
create policy "read visible" on public.final_surprise
  for select using ((select public.can_view_section('surprise')) or (select public.is_admin()));

-- Quiz attempts: visitors may only INSERT (when saving is enabled); only admins read/delete.
drop policy if exists "save own attempt" on public.quiz_attempts;
create policy "save own attempt" on public.quiz_attempts
  for insert with check (
    (select public.quiz_saving_enabled())
    and (select public.can_view_section('quiz'))
    and (user_id is null or user_id = (select auth.uid()))
  );
drop policy if exists "admins read attempts" on public.quiz_attempts;
create policy "admins read attempts" on public.quiz_attempts
  for select using ((select public.is_admin()));
drop policy if exists "admins delete attempts" on public.quiz_attempts;
create policy "admins delete attempts" on public.quiz_attempts
  for delete using ((select public.is_admin()));

-- Admin write policies for every content table.
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'hero_content', 'cute_messages', 'memory_categories', 'memories',
    'quiz_questions', 'quiz_options', 'chat_screenshots', 'love_notes', 'timeline_entries',
    'mood_messages', 'soundtrack_tracks', 'open_when_letters', 'final_surprise'
  ]
  loop
    execute format('drop policy if exists "admins insert" on public.%I', t);
    execute format('create policy "admins insert" on public.%I for insert with check ((select public.is_admin()))', t);
    execute format('drop policy if exists "admins update" on public.%I', t);
    execute format('create policy "admins update" on public.%I for update using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('drop policy if exists "admins delete" on public.%I', t);
    execute format('create policy "admins delete" on public.%I for delete using ((select public.is_admin()))', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- 9. Admin helpers
-- -----------------------------------------------------------------------------

-- Is a storage object still referenced by any row (optionally ignoring one row)?
-- Called by the admin UI before deleting or replacing a file, so shared files
-- are never removed by accident.
create or replace function public.media_path_in_use(
  p_bucket text,
  p_path text,
  p_ignore_table text default null,
  p_ignore_id text default null
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  found boolean := false;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if p_bucket = 'public-media' then
    select exists (select 1 from hero_content where photo_path = p_path and (p_ignore_table is distinct from 'hero_content' or id::text is distinct from p_ignore_id))
        or exists (select 1 from memories where image_path = p_path and (p_ignore_table is distinct from 'memories' or id::text is distinct from p_ignore_id))
        or exists (select 1 from timeline_entries where image_path = p_path and (p_ignore_table is distinct from 'timeline_entries' or id::text is distinct from p_ignore_id))
        or exists (select 1 from soundtrack_tracks where artwork_path = p_path and (p_ignore_table is distinct from 'soundtrack_tracks' or id::text is distinct from p_ignore_id))
      into found;
  elsif p_bucket = 'private-media' then
    select exists (select 1 from chat_screenshots where image_path = p_path and (p_ignore_table is distinct from 'chat_screenshots' or id::text is distinct from p_ignore_id))
        or exists (select 1 from open_when_letters where image_path = p_path and (p_ignore_table is distinct from 'open_when_letters' or id::text is distinct from p_ignore_id))
        or exists (
             select 1 from final_surprise
             where (image_path = p_path or video_path = p_path or p_path = any (collage_paths))
               and (p_ignore_table is distinct from 'final_surprise' or id::text is distinct from p_ignore_id)
           )
      into found;
  elsif p_bucket = 'audio' then
    select exists (select 1 from soundtrack_tracks where audio_path = p_path and (p_ignore_table is distinct from 'soundtrack_tracks' or id::text is distinct from p_ignore_id))
        or exists (select 1 from open_when_letters where audio_path = p_path and (p_ignore_table is distinct from 'open_when_letters' or id::text is distinct from p_ignore_id))
      into found;
  end if;

  return coalesce(found, false);
end;
$$;

-- The signed-in user's role ('admin' | 'viewer' | null).
create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles where user_id = auth.uid();
$$;

revoke execute on function public.media_path_in_use(text, text, text, text) from public, anon;
grant execute on function public.media_path_in_use(text, text, text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 10. Storage buckets
--   public-media  (public)  : hero photo, memories, timeline photos, artwork
--   private-media (private) : chat screenshots, letter photos, final surprise media
--   audio         (private) : songs, voice notes, letter audio
-- Folder name (first path segment) = section key, e.g. 'chats/…', 'voice_notes/…'.
-- Private files are readable only if that section is visible to the requester.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('private-media', 'private-media', false, 52428800,
   array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm']),
  ('audio', 'audio', false, 26214400,
   array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Admins: full control of all three buckets.
drop policy if exists "olu admins insert media" on storage.objects;
create policy "olu admins insert media" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('public-media', 'private-media', 'audio') and (select public.is_admin()));

drop policy if exists "olu admins update media" on storage.objects;
create policy "olu admins update media" on storage.objects
  for update to authenticated
  using (bucket_id in ('public-media', 'private-media', 'audio') and (select public.is_admin()))
  with check (bucket_id in ('public-media', 'private-media', 'audio') and (select public.is_admin()));

drop policy if exists "olu admins delete media" on storage.objects;
create policy "olu admins delete media" on storage.objects
  for delete to authenticated
  using (bucket_id in ('public-media', 'private-media', 'audio') and (select public.is_admin()));

drop policy if exists "olu admins list media" on storage.objects;
create policy "olu admins list media" on storage.objects
  for select to authenticated
  using (bucket_id in ('public-media', 'private-media', 'audio') and (select public.is_admin()));

-- Private buckets: readers need the section of the file's folder to be visible to them.
drop policy if exists "olu read private media by section" on storage.objects;
create policy "olu read private media by section" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id in ('private-media', 'audio')
    and public.can_view_section((storage.foldername(name))[1])
  );

-- ===== FILE: 20261024000100_admin_functions.sql =====
-- =============================================================================
--  Admin helper functions (atomic operations used by the admin dashboard).
--  Both functions run with elevated rights (security definer) but refuse to do
--  anything unless the caller is an admin.
-- =============================================================================

-- Reorder rows in one statement: display_order follows the order of p_ids.
create or replace function public.reorder_rows(p_table text, p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_table not in (
    'cute_messages', 'memory_categories', 'memories', 'quiz_questions', 'chat_screenshots', 'love_notes',
    'timeline_entries', 'mood_messages', 'soundtrack_tracks', 'open_when_letters'
  ) then
    raise exception 'cannot reorder table %', p_table;
  end if;

  execute format(
    'update public.%I as t set display_order = o.ord - 1
       from unnest($1) with ordinality as o(id, ord)
      where t.id = o.id and t.display_order is distinct from o.ord - 1',
    p_table
  ) using p_ids;
end;
$$;

-- Create or update a quiz question together with its options, all-or-nothing.
--   p_question: { id?, category, question, explanation, is_published }
--   p_options : [{ label, is_correct }, ...]  (2–6 items, exactly one correct)
create or replace function public.save_quiz_question(p_question jsonb, p_options jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  qid uuid := nullif(p_question ->> 'id', '')::uuid;
  option_count integer := jsonb_array_length(coalesce(p_options, '[]'::jsonb));
  correct_count integer;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if option_count < 2 or option_count > 6 then
    raise exception 'A question needs between 2 and 6 answer options.';
  end if;
  select count(*) into correct_count
  from jsonb_array_elements(p_options) e
  where coalesce((e ->> 'is_correct')::boolean, false);
  if correct_count <> 1 then
    raise exception 'Exactly one answer must be marked as correct.';
  end if;

  if qid is null then
    insert into quiz_questions (category, question, explanation, is_published, is_placeholder, display_order)
    values (
      coalesce(p_question ->> 'category', 'random'),
      p_question ->> 'question',
      nullif(p_question ->> 'explanation', ''),
      coalesce((p_question ->> 'is_published')::boolean, true),
      false,
      coalesce((select max(display_order) + 1 from quiz_questions), 0)
    )
    returning id into qid;
  else
    update quiz_questions
       set category = coalesce(p_question ->> 'category', category),
           question = p_question ->> 'question',
           explanation = nullif(p_question ->> 'explanation', ''),
           is_published = coalesce((p_question ->> 'is_published')::boolean, is_published),
           is_placeholder = false
     where id = qid;
    if not found then
      raise exception 'Question not found.';
    end if;
  end if;

  delete from quiz_options where question_id = qid;
  insert into quiz_options (question_id, label, is_correct, display_order)
  select qid, trim(e ->> 'label'), coalesce((e ->> 'is_correct')::boolean, false), (o.ord - 1)::integer
  from jsonb_array_elements(p_options) with ordinality as o(e, ord);

  return qid;
end;
$$;

revoke execute on function public.reorder_rows(text, uuid[]) from public, anon;
revoke execute on function public.save_quiz_question(jsonb, jsonb) from public, anon;
grant execute on function public.reorder_rows(text, uuid[]) to authenticated;
grant execute on function public.save_quiz_question(jsonb, jsonb) to authenticated;

-- ===== FILE: 20261024000200_flirty_lines.sql =====
-- =============================================================================
--  Flirty pop-ups: short lines about her that pop up every few minutes.
--  Run after 20261024000000_init.sql and 20261024000100_admin_functions.sql.
--  Safe to run more than once.
-- =============================================================================

create table if not exists public.flirty_lines (
  id             uuid primary key default gen_random_uuid(),
  message        text not null check (char_length(message) between 1 and 300),
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  is_placeholder boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists flirty_lines_order_idx on public.flirty_lines (display_order);

drop trigger if exists set_updated_at on public.flirty_lines;
create trigger set_updated_at before update on public.flirty_lines
  for each row execute function public.set_updated_at();

alter table public.flirty_lines enable row level security;

drop policy if exists "public read published" on public.flirty_lines;
create policy "public read published" on public.flirty_lines
  for select using (is_published or (select public.is_admin()));
drop policy if exists "admins insert" on public.flirty_lines;
create policy "admins insert" on public.flirty_lines for insert with check ((select public.is_admin()));
drop policy if exists "admins update" on public.flirty_lines;
create policy "admins update" on public.flirty_lines
  for update using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins delete" on public.flirty_lines;
create policy "admins delete" on public.flirty_lines for delete using ((select public.is_admin()));

-- Settings: on/off switch + how often (minutes)
alter table public.site_settings add column if not exists flirty_popups_enabled boolean not null default true;
alter table public.site_settings add column if not exists flirty_interval_minutes integer not null default 1;
alter table public.site_settings alter column flirty_interval_minutes set default 1;
alter table public.site_settings drop constraint if exists site_settings_flirty_interval_check;
alter table public.site_settings add constraint site_settings_flirty_interval_check check (flirty_interval_minutes between 1 and 60);

-- Allow the admin's reorder arrows to work on the new table
create or replace function public.reorder_rows(p_table text, p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_table not in (
    'cute_messages', 'memory_categories', 'memories', 'quiz_questions', 'chat_screenshots', 'love_notes',
    'timeline_entries', 'mood_messages', 'soundtrack_tracks', 'open_when_letters', 'flirty_lines'
  ) then
    raise exception 'cannot reorder table %', p_table;
  end if;

  execute format(
    'update public.%I as t set display_order = o.ord - 1
       from unnest($1) with ordinality as o(id, ord)
      where t.id = o.id and t.display_order is distinct from o.ord - 1',
    p_table
  ) using p_ids;
end;
$$;

revoke execute on function public.reorder_rows(text, uuid[]) from public, anon;
grant execute on function public.reorder_rows(text, uuid[]) to authenticated;

-- Example lines (placeholders) — only added while the table is empty.
do $$
begin
  if not exists (select 1 from public.flirty_lines) then
    insert into public.flirty_lines (message, display_order, is_placeholder)
    select line, ord - 1, true
    from unnest(array[
      'Your smile should come with a warning label — it''s dangerously cute.',
      'Fun fact: you''re the prettiest notification I''ve ever received.',
      'Your laugh is officially my favourite sound effect.',
      'Somewhere, a sunset is jealous of how good you look today.',
      'You''re proof that cute and clever can live in the same person.',
      'Those eyes should be illegal. I''d happily do the time.',
      'You don''t walk into a room — you upgrade it.',
      'If being adorable were a crime, you''d be serving a life sentence.',
      'Your cheeks when you smile? Totally unfair advantage.',
      'You''re the reason I look at my phone and smile like an idiot.',
      'Warning: excessive cuteness detected on this screen. Source: you.',
      'Your voice is my favourite place to be.',
      'You make “gorgeous” sound like an understatement.',
      'I''d tell you you''re beautiful, but the stars probably told you first.',
      'Your hugs should be available on prescription.',
      'Even your sleepy face is a masterpiece.',
      'You + that smile = my one and only weakness.',
      'You''re cuter than every cat video on the internet combined.',
      'Every time you look at me, my heart forgets how to behave.',
      'Plot twist: the prettiest thing on this website is the person reading it.'
    ]) with ordinality as t(line, ord);
  end if;
end;
$$;

-- ===== FILE: 20261024000300_her_photos.sql =====
-- =============================================================================
--  Her photos: extra photos of her shown around the site (landing-page photo
--  stack, home-page photo ribbon, chapter titles, Reasons page, Final Surprise).
--  Run after the earlier migrations. Safe to run more than once.
-- =============================================================================

create table if not exists public.her_photos (
  id               uuid primary key default gen_random_uuid(),
  image_path       text not null,     -- bucket 'public-media', folder 'her/'
  image_width      integer,
  image_height     integer,
  alt_text         text check (char_length(alt_text) <= 300),
  caption          text check (char_length(caption) <= 160),
  show_on_landing  boolean not null default true,
  show_in_ribbon   boolean not null default true,
  show_in_chapters boolean not null default true,
  show_on_reasons  boolean not null default true,
  show_on_surprise boolean not null default true,
  show_on_soundtrack boolean not null default true,  -- full-screen page backgrounds
  display_order    integer not null default 0,
  is_published     boolean not null default true,
  is_placeholder   boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists her_photos_order_idx on public.her_photos (display_order);

-- Added after the first version of this file: soft full-screen page backgrounds
-- (Soundtrack, Open When, Quiz, Final Surprise, 404). The name is kept for compatibility.
alter table public.her_photos add column if not exists show_on_soundtrack boolean not null default true;

drop trigger if exists set_updated_at on public.her_photos;
create trigger set_updated_at before update on public.her_photos
  for each row execute function public.set_updated_at();

alter table public.her_photos enable row level security;

drop policy if exists "public read published" on public.her_photos;
create policy "public read published" on public.her_photos
  for select using (is_published or (select public.is_admin()));
drop policy if exists "admins insert" on public.her_photos;
create policy "admins insert" on public.her_photos for insert with check ((select public.is_admin()));
drop policy if exists "admins update" on public.her_photos;
create policy "admins update" on public.her_photos
  for update using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins delete" on public.her_photos;
create policy "admins delete" on public.her_photos for delete using ((select public.is_admin()));

-- Allow the admin's reorder arrows to work on the new table
create or replace function public.reorder_rows(p_table text, p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_table not in (
    'cute_messages', 'memory_categories', 'memories', 'quiz_questions', 'chat_screenshots', 'love_notes',
    'timeline_entries', 'mood_messages', 'soundtrack_tracks', 'open_when_letters', 'flirty_lines', 'her_photos'
  ) then
    raise exception 'cannot reorder table %', p_table;
  end if;

  execute format(
    'update public.%I as t set display_order = o.ord - 1
       from unnest($1) with ordinality as o(id, ord)
      where t.id = o.id and t.display_order is distinct from o.ord - 1',
    p_table
  ) using p_ids;
end;
$$;

revoke execute on function public.reorder_rows(text, uuid[]) from public, anon;
grant execute on function public.reorder_rows(text, uuid[]) to authenticated;

-- Files used by her_photos must never be deleted while still referenced.
create or replace function public.media_path_in_use(
  p_bucket text,
  p_path text,
  p_ignore_table text default null,
  p_ignore_id text default null
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  found boolean := false;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if p_bucket = 'public-media' then
    select exists (select 1 from hero_content where photo_path = p_path and (p_ignore_table is distinct from 'hero_content' or id::text is distinct from p_ignore_id))
        or exists (select 1 from memories where image_path = p_path and (p_ignore_table is distinct from 'memories' or id::text is distinct from p_ignore_id))
        or exists (select 1 from timeline_entries where image_path = p_path and (p_ignore_table is distinct from 'timeline_entries' or id::text is distinct from p_ignore_id))
        or exists (select 1 from soundtrack_tracks where artwork_path = p_path and (p_ignore_table is distinct from 'soundtrack_tracks' or id::text is distinct from p_ignore_id))
        or exists (select 1 from her_photos where image_path = p_path and (p_ignore_table is distinct from 'her_photos' or id::text is distinct from p_ignore_id))
      into found;
  elsif p_bucket = 'private-media' then
    select exists (select 1 from chat_screenshots where image_path = p_path and (p_ignore_table is distinct from 'chat_screenshots' or id::text is distinct from p_ignore_id))
        or exists (select 1 from open_when_letters where image_path = p_path and (p_ignore_table is distinct from 'open_when_letters' or id::text is distinct from p_ignore_id))
        or exists (
             select 1 from final_surprise
             where (image_path = p_path or video_path = p_path or p_path = any (collage_paths))
               and (p_ignore_table is distinct from 'final_surprise' or id::text is distinct from p_ignore_id)
           )
      into found;
  elsif p_bucket = 'audio' then
    select exists (select 1 from soundtrack_tracks where audio_path = p_path and (p_ignore_table is distinct from 'soundtrack_tracks' or id::text is distinct from p_ignore_id))
        or exists (select 1 from open_when_letters where audio_path = p_path and (p_ignore_table is distinct from 'open_when_letters' or id::text is distinct from p_ignore_id))
      into found;
  end if;

  return coalesce(found, false);
end;
$$;

revoke execute on function public.media_path_in_use(text, text, text, text) from public, anon;
grant execute on function public.media_path_in_use(text, text, text, text) to authenticated;

-- ===== FILE: seed.sql =====
-- =============================================================================
--  OUR LITTLE UNIVERSE ♡ — starter content (optional, safe to re-run)
--
--  Everything inserted here is a clearly-marked PLACEHOLDER (is_placeholder =
--  true). It is example wording only — no real memories, photos, chats or
--  facts. Edit or delete it from the admin dashboard; saving an item there
--  clears its placeholder flag.
--
--  Each block only runs when its table is still empty, so re-running this file
--  never duplicates or overwrites your real content.
-- =============================================================================

insert into public.site_settings (id, quiz_result_messages, soundtrack_intro)
values (
  1,
  '{
    "low": "Looks like we need a few more silly conversations together!",
    "medium": "Not bad, miss {name}. You know quite a few things about us!",
    "high": "Okay, someone has been paying attention!",
    "perfect": "Excuse me, are you secretly keeping notes about us? ♡"
  }'::jsonb,
  'Press play whenever you like — nothing here plays on its own.'
)
on conflict (id) do nothing;

insert into public.hero_content (id, label, heading, message, affection_line, photo_alt, photo_caption, primary_cta, secondary_cta, scroll_hint)
values (
  1,
  'A little universe made just for you',
  'Welcome home, {name} ♡',
  'I made a little corner of the internet just for you. A place for our memories, our silly moments, our conversations, and all the little things that make us... us.',
  'Because if I could make a whole universe out of the things I love, you''d be at the center of it.',
  'A photo of {name}',
  'my favourite person in the whole universe',
  'Come explore our little world ♡',
  'There''s something for you...',
  'There''s so much more waiting for you...'
)
on conflict (id) do nothing;

insert into public.final_surprise (id, surprise_type, heading, intro, button_label, title, message, signoff, is_placeholder)
values (
  1, 'letter', 'Before you go...', 'I saved one last little thing for you.', 'Open your surprise ♡', 'One last thing ♡',
  'Whatever adventures come next, I''m really glad our paths crossed. Thank you for being part of my world, {name}. Here''s to more laughs, more memories, more little moments, and more reasons to smile together.',
  'Always yours', true
)
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from public.cute_messages) then
    insert into public.cute_messages (message, display_order, is_placeholder) values
      ('Just a tiny reminder that you''re special to me.', 0, true),
      ('You make ordinary days feel a little more magical.', 1, true),
      ('Somehow, talking to you can make my entire day better.', 2, true),
      ('If I could save little moments forever, I''d save so many with you.', 3, true),
      ('You''re my favorite notification.', 4, true),
      ('This little website has one very important purpose: making you smile.', 5, true);
  end if;

  if not exists (select 1 from public.memory_categories) then
    insert into public.memory_categories (name, slug, display_order) values
      ('Favourite moments', 'favorites', 0),
      ('Silly moments', 'silly', 1),
      ('Adventures', 'adventures', 2),
      ('Dates', 'dates', 3),
      ('Everyday memories', 'everyday', 4),
      ('Special days', 'special', 5);
  end if;

  if not exists (select 1 from public.quiz_questions) then
    with q as (
      insert into public.quiz_questions (category, question, explanation, display_order, is_placeholder)
      select category, question, 'Placeholder question — the real answer still needs to be added in the admin dashboard.', ord, true
      from (values
        ('about_me', 'What is my favorite food?', 0),
        ('about_me', 'Which little thing makes me smile?', 1),
        ('relationship', 'What would our ideal date look like?', 2),
        ('funny', 'Which one of us is more likely to start laughing at the wrong moment?', 3),
        ('favorites', 'What is one thing we both enjoy doing?', 4),
        ('inside_jokes', 'What is my most-used phrase?', 5),
        ('relationship', 'Which memory would we happily relive?', 6),
        ('random', 'What would I choose for a perfect day together?', 7)
      ) as v(category, question, ord)
      returning id, display_order
    )
    insert into public.quiz_options (question_id, label, is_correct, display_order)
    select q.id, 'Placeholder answer ' || chr(65 + o.n), o.n = (q.display_order % 4), o.n
    from q cross join generate_series(0, 3) as o(n);
  end if;

  if not exists (select 1 from public.love_notes) then
    insert into public.love_notes (title, message, display_order, is_placeholder) values
      ('Our conversations', 'The way you can turn a normal conversation into my favorite part of the day.', 0, true),
      ('Your little habits', 'Your little habits that make you unmistakably you.', 1, true),
      ('Small moments', 'The way the smallest moments can become the best memories.', 2, true),
      ('Your smile', 'Your smile, especially when you don''t realize how cute it is.', 3, true),
      ('Talking about anything', 'The comfort of being able to talk about absolutely anything.', 4, true),
      ('Our story', 'All the tiny reasons that make our story ours.', 5, true);
  end if;

  if not exists (select 1 from public.timeline_entries) then
    insert into public.timeline_entries (title, story, category, display_order, is_placeholder) values
      ('The beginning of something special.', 'Placeholder — write how it all began in the admin dashboard.', 'Beginning', 0, true),
      ('One of those days I''ll always remember.', 'Placeholder — add a date, a photo and a few words.', 'Memory', 1, true),
      ('An unexpectedly funny moment.', 'Placeholder — the story behind the laugh goes here.', 'Funny', 2, true),
      ('A little adventure together.', 'Placeholder — where did we go?', 'Adventure', 3, true),
      ('A memory worth keeping forever.', 'Placeholder — the moment you never want to forget.', 'Milestone', 4, true);
  end if;

  if not exists (select 1 from public.mood_messages) then
    insert into public.mood_messages (mood, message, display_order, is_placeholder) values
      ('happy', 'Yay! I love that for you. Hold onto this feeling — and tell me all about it later? ♡', 0, true),
      ('tired', 'Take a little break, get comfortable, and remember that you don''t have to do everything at once. Sending you a tiny virtual hug.', 1, true),
      ('stressed', 'Deep breath in… and out. You''ve handled hard things before, and you''ll handle this too — one small step at a time. I''m cheering for you.', 2, true),
      ('sleepy', 'Okay sleepyhead, this is your official permission to rest. Get cosy and dream of something lovely.', 3, true),
      ('missing', 'I''m probably missing you right back at this exact moment. Here''s a tiny virtual hug until the real one ♡', 4, true),
      ('need_smile', 'Emergency smile delivery! Imagine the silliest face I could possibly make right now.', 5, true);
  end if;

  if not exists (select 1 from public.open_when_letters) then
    insert into public.open_when_letters (title, occasion, message, display_order, is_placeholder) values
      ('Open when you''re happy', 'happy', 'Look at you, glowing! Save this feeling somewhere safe — and know that your happiness makes me happy too.', 0, true),
      ('Open when you''re having a difficult day', 'difficult', 'Hey you. Hard days don''t last forever, even when they feel long. Be gentle with yourself today — you''re doing better than you think.', 1, true),
      ('Open when you miss me', 'missing', 'Close your eyes for a second. I''m right there, probably thinking about you too. Distance is just a detail.', 2, true),
      ('Open when you can''t sleep', 'sleep', 'Count the stars in our little universe with me. One… two… three… and let your thoughts drift like the clouds.', 3, true),
      ('Open when you need encouragement', 'encouragement', 'You are so much more capable than you give yourself credit for. I believe in you — always, completely.', 4, true),
      ('Open when you want to smile', 'smile', 'Quick, think of the most ridiculous thing we ever laughed about. See? Told you it would work.', 5, true),
      ('Open when you want to remember us', 'remember', 'Go take a little walk through the Memories chapter. Every photo there is a tiny piece of us.', 6, true);
  end if;
end;
$$;
