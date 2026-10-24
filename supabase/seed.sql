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
