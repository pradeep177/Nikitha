/**
 * DEMO MODE DATABASE
 * ------------------
 * An in-memory copy of the real database tables, used only when Supabase is
 * not configured. Rows have exactly the same columns as the SQL schema so the
 * admin dashboard and the public site behave the same way in both modes.
 *
 * Everything here is a clearly-labelled PLACEHOLDER (is_placeholder: true):
 * no real memories, photos, chats or facts. Edits made in the demo admin
 * preview live only in this browser tab and disappear on reload — they can
 * never reach a real database.
 */
import { DEFAULT_FINAL_SURPRISE, DEFAULT_HERO, DEFAULT_SETTINGS, FLIRTY_EXAMPLES } from './defaults'

let counter = 0
const uid = (prefix) => `${prefix}-${(counter += 1).toString(36)}`
const now = new Date().toISOString()

const rows = (prefix, items, extra = {}) =>
  items.map((item, i) => ({
    id: uid(prefix),
    display_order: i,
    is_published: true,
    is_placeholder: true,
    created_at: now,
    updated_at: now,
    ...extra,
    ...item,
  }))

function buildDemoDb() {
  counter = 0
  const categories = [
    ['Favourite moments', 'favorites'],
    ['Silly moments', 'silly'],
    ['Adventures', 'adventures'],
    ['Dates', 'dates'],
    ['Everyday memories', 'everyday'],
    ['Special days', 'special'],
  ].map(([name, slug], i) => ({ id: `cat-${slug}`, name, slug, display_order: i, created_at: now, updated_at: now }))

  const quiz = [
    ['about_me', 'What is my favorite food?'],
    ['about_me', 'Which little thing makes me smile?'],
    ['relationship', 'What would our ideal date look like?'],
    ['funny', 'Which one of us is more likely to start laughing at the wrong moment?'],
    ['favorites', 'What is one thing we both enjoy doing?'],
    ['inside_jokes', 'What is my most-used phrase?'],
    ['relationship', 'Which memory would we happily relive?'],
    ['random', 'What would I choose for a perfect day together?'],
  ]

  return {
    site_settings: { id: 1, ...structuredClone(DEFAULT_SETTINGS), updated_at: now },
    hero_content: { id: 1, ...DEFAULT_HERO, photo_path: null, updated_at: now },

    cute_messages: rows('cm', [
      { message: "Just a tiny reminder that you're special to me." },
      { message: 'You make ordinary days feel a little more magical.' },
      { message: 'Somehow, talking to you can make my entire day better.' },
      { message: "If I could save little moments forever, I'd save so many with you." },
      { message: "You're my favorite notification." },
      { message: 'This little website has one very important purpose: making you smile.' },
    ]),

    memory_categories: categories,

    flirty_lines: rows(
      'flirt',
      FLIRTY_EXAMPLES.map((message) => ({ message })),
    ),

    memories: rows(
      'mem',
      [
        { title: 'A favourite moment', caption: 'A favourite photo of us will live here.', category_id: 'cat-favorites', aspect: '4/5', is_featured: true },
        { title: 'A silly moment', caption: 'The goofiest picture we have goes here.', category_id: 'cat-silly', aspect: '1/1' },
        { title: 'A little adventure', caption: 'Somewhere we went together.', category_id: 'cat-adventures', aspect: '3/4' },
        { title: 'A date to remember', caption: 'Add the photo and a little caption.', category_id: 'cat-dates', aspect: '4/3' },
        { title: 'An ordinary day', caption: 'The everyday moments count the most.', category_id: 'cat-everyday', aspect: '4/5' },
        { title: 'A special day', caption: 'A day worth keeping forever.', category_id: 'cat-special', aspect: '1/1' },
        { title: 'Another favourite', caption: 'There is always room for one more.', category_id: 'cat-favorites', aspect: '3/4' },
        { title: 'Another silly one', caption: 'Because we are a little bit ridiculous.', category_id: 'cat-silly', aspect: '4/3' },
      ],
      { image_path: null, image_width: null, image_height: null, alt_text: null, taken_on: null, location: null, is_featured: false },
    ),

    // Options are nested here; in the real database they live in quiz_options.
    quiz_questions: rows(
      'q',
      quiz.map(([category, question], qi) => ({
        category,
        question,
        explanation: 'Placeholder question — the real answer still needs to be added in the admin dashboard.',
        options: [0, 1, 2, 3].map((oi) => ({
          id: `q${qi}-o${oi}`,
          label: `Placeholder answer ${String.fromCharCode(65 + oi)}`,
          is_correct: oi === qi % 4,
          display_order: oi,
        })),
      })),
    ),

    chat_screenshots: rows(
      'chat',
      [
        { caption: 'A conversation worth saving goes here.', collection: 'worth_saving' },
        { caption: 'One of our funniest chats goes here.', collection: 'funniest' },
        { caption: 'A cute goodnight message goes here.', collection: 'goodnight' },
      ],
      { image_path: null, image_width: null, image_height: null, alt_text: null, chat_date: null },
    ),

    love_notes: rows(
      'note',
      [
        { title: 'Our conversations', message: 'The way you can turn a normal conversation into my favorite part of the day.' },
        { title: 'Your little habits', message: 'Your little habits that make you unmistakably you.' },
        { title: 'Small moments', message: 'The way the smallest moments can become the best memories.' },
        { title: 'Your smile', message: "Your smile, especially when you don't realize how cute it is." },
        { title: 'Talking about anything', message: 'The comfort of being able to talk about absolutely anything.' },
        { title: 'Our story', message: 'All the tiny reasons that make our story ours.' },
      ],
      { is_archived: false },
    ),

    timeline_entries: rows(
      'tl',
      [
        { title: 'The beginning of something special.', story: 'Placeholder — write how it all began in the admin dashboard.', category: 'Beginning' },
        { title: "One of those days I'll always remember.", story: 'Placeholder — add a date, a photo and a few words.', category: 'Memory' },
        { title: 'An unexpectedly funny moment.', story: 'Placeholder — the story behind the laugh goes here.', category: 'Funny' },
        { title: 'A little adventure together.', story: 'Placeholder — where did we go?', category: 'Adventure' },
        { title: 'A memory worth keeping forever.', story: 'Placeholder — the moment you never want to forget.', category: 'Milestone' },
      ],
      { event_date: null, image_path: null, image_alt: null, location: null },
    ),

    mood_messages: rows(
      'mood',
      [
        { mood: 'happy', message: 'Yay! I love that for you. Hold onto this feeling — and tell me all about it later? ♡' },
        {
          mood: 'tired',
          message:
            "Take a little break, get comfortable, and remember that you don't have to do everything at once. Sending you a tiny virtual hug.",
        },
        {
          mood: 'stressed',
          message: "Deep breath in… and out. You've handled hard things before, and you'll handle this too — one small step at a time. I'm cheering for you.",
        },
        { mood: 'sleepy', message: 'Okay sleepyhead, this is your official permission to rest. Get cosy and dream of something lovely.' },
        { mood: 'missing', message: "I'm probably missing you right back at this exact moment. Here's a tiny virtual hug until the real one ♡" },
        { mood: 'need_smile', message: 'Emergency smile delivery! Imagine the silliest face I could possibly make right now.' },
      ],
      { label: null },
    ),

    soundtrack_tracks: rows(
      'track',
      [
        { kind: 'song', title: 'Our song', artist: 'Artist to be added', note: 'Placeholder — add the song that sounds like us, with a link to listen.' },
        { kind: 'song', title: 'A song that reminds me of you', artist: 'Artist to be added', note: 'Placeholder — add a note about why.' },
        {
          kind: 'voice_note',
          title: 'Demo chime',
          artist: 'Generated sound — demo only',
          note: 'A gentle placeholder sound so the player can be tried. Replace it with a voice note.',
          audio_path: 'demo:chime',
        },
      ],
      { audio_path: null, external_url: null, artwork_path: null },
    ),

    open_when_letters: rows(
      'letter',
      [
        ["Open when you're happy", 'happy', 'Look at you, glowing! Save this feeling somewhere safe — and know that your happiness makes me happy too.'],
        [
          "Open when you're having a difficult day",
          'difficult',
          "Hey you. Hard days don't last forever, even when they feel long. Be gentle with yourself today — you're doing better than you think.",
        ],
        ['Open when you miss me', 'missing', "Close your eyes for a second. I'm right there, probably thinking about you too. Distance is just a detail."],
        ["Open when you can't sleep", 'sleep', 'Count the stars in our little universe with me. One… two… three… and let your thoughts drift like the clouds.'],
        ['Open when you need encouragement', 'encouragement', 'You are so much more capable than you give yourself credit for. I believe in you — always, completely.'],
        ['Open when you want to smile', 'smile', 'Quick, think of the most ridiculous thing we ever laughed about. See? Told you it would work.'],
        ['Open when you want to remember us', 'remember', 'Go take a little walk through the Memories chapter. Every photo there is a tiny piece of us.'],
      ].map(([title, occasion, message]) => ({ title, occasion, message })),
      { image_path: null, audio_path: null },
    ),

    final_surprise: {
      id: 1,
      ...DEFAULT_FINAL_SURPRISE,
      image_path: null,
      image_alt: null,
      collage_paths: [],
      video_path: null,
      is_placeholder: true,
      updated_at: now,
    },

    quiz_attempts: [],
  }
}

/** The live in-memory demo database (mutated by the demo admin preview). */
export const demoDb = buildDemoDb()

export function newDemoId(prefix = 'row') {
  return uid(prefix)
}
