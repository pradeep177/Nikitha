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
