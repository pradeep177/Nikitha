-- =============================================================================
--  Grant roles — run in Supabase Dashboard → SQL Editor AFTER creating the
--  users in Authentication → Users (use "Add user" → "Create new user").
--
--  The SQL editor runs with full privileges, which is exactly why this is the
--  secure place to bootstrap the first admin: nobody can grant themselves a
--  role from the website.
--
--  Replace the e-mail addresses below, then run.
-- =============================================================================

-- 1) You — full admin access to /admin
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'you@example.com'
on conflict (user_id) do update set role = excluded.role;

-- 2) Nikitha — can see sections marked "private" (chats, letters, voice notes, final surprise…)
insert into public.user_roles (user_id, role)
select id, 'viewer' from auth.users where email = 'nikitha@example.com'
on conflict (user_id) do update set role = excluded.role;

-- Check the result:
select u.email, r.role
from public.user_roles r
join auth.users u on u.id = r.user_id;
