-- =============================================================================
--  Sanity check — run in Supabase SQL Editor after the migration.
--  Every row in the first result should show rls_enabled = true.
-- =============================================================================

select c.relname as table_name, c.relrowsecurity as rls_enabled,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by 1;

select id as bucket, public, file_size_limit / 1048576 as max_mb, allowed_mime_types
from storage.buckets
where id in ('public-media', 'private-media', 'audio');

select policyname, cmd from pg_policies where schemaname = 'storage' and policyname like 'olu %' order by 1;

select section_visibility from public.site_settings where id = 1;
