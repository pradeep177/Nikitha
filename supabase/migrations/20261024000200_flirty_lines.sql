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
