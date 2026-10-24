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
