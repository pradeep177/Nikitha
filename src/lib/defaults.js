/**
 * Fallback content. Used in demo mode and whenever the database has no row
 * yet, so the website never crashes on an empty database. Every value here
 * can be overridden from the admin dashboard.
 */
export const DEFAULT_SETTINGS = {
  site_title: 'Our Little Universe ♡',
  her_name: 'Nikitha',
  signature: 'Made with love, just for you',
  theme: 'blush',
  show_hearts: true,
  show_stars: true,
  show_clouds: true,
  quiz_save_results: true,
  flirty_popups_enabled: true,
  flirty_interval_minutes: 1,
  // Mirrors the database default. 'public' | 'private' (Nikitha + admin) | 'hidden' (admin only).
  section_visibility: {
    memories: 'public',
    quiz: 'public',
    chats: 'private',
    reasons: 'public',
    timeline: 'public',
    little_things: 'public',
    soundtrack: 'public',
    voice_notes: 'private',
    open_when: 'private',
    surprise: 'private',
  },
  quiz_result_messages: {
    low: 'Looks like we need a few more silly conversations together!',
    medium: 'Not bad, miss {name}. You know quite a few things about us!',
    high: 'Okay, someone has been paying attention!',
    perfect: 'Excuse me, are you secretly keeping notes about us? ♡',
  },
  soundtrack_intro: 'Press play whenever you like — nothing here plays on its own.',
}

export const DEFAULT_HERO = {
  label: 'A little universe made just for you',
  heading: 'Welcome home, {name} ♡',
  message:
    'I made a little corner of the internet just for you. A place for our memories, our silly moments, our conversations, and all the little things that make us... us.',
  affection_line:
    "Because if I could make a whole universe out of the things I love, you'd be at the center of it.",
  photo_url: null,
  photo_alt: 'A photo of {name}',
  photo_caption: 'my favourite person in the whole universe',
  primary_cta: 'Come explore our little world ♡',
  secondary_cta: "There's something for you...",
  scroll_hint: "There's so much more waiting for you...",
}

export const DEFAULT_FINAL_SURPRISE = {
  surprise_type: 'letter',
  heading: 'Before you go...',
  intro: 'I saved one last little thing for you.',
  button_label: 'Open your surprise ♡',
  title: 'One last thing ♡',
  message:
    "Whatever adventures come next, I'm really glad our paths crossed. Thank you for being part of my world, {name}. Here's to more laughs, more memories, more little moments, and more reasons to smile together.",
  image_url: null,
  video_url: null,
  details: '',
  signoff: 'Always yours',
}

export const SURPRISE_TYPES = [
  { id: 'letter', label: 'A personalised love letter' },
  { id: 'photo', label: 'A photograph' },
  { id: 'collage', label: 'A photo collage' },
  { id: 'date', label: 'A planned date or outing' },
  { id: 'gift', label: 'A gift description' },
  { id: 'video', label: 'A video' },
  { id: 'custom', label: 'A custom message' },
]

export const QUIZ_CATEGORIES = [
  { id: 'about_me', label: 'About me' },
  { id: 'about_you', label: 'About you' },
  { id: 'relationship', label: 'Our relationship' },
  { id: 'favorites', label: 'Our favourite things' },
  { id: 'funny', label: 'Our funny moments' },
  { id: 'inside_jokes', label: 'Our inside jokes' },
  { id: 'random', label: 'Random couple questions' },
]

export const MOODS = [
  { id: 'happy', label: 'Happy' },
  { id: 'tired', label: 'Tired' },
  { id: 'stressed', label: 'Stressed' },
  { id: 'sleepy', label: 'Sleepy' },
  { id: 'missing', label: 'Missing me' },
  { id: 'need_smile', label: 'Need a smile' },
]

export const CHAT_COLLECTIONS = [
  { id: 'funniest', label: 'Funniest conversations' },
  { id: 'cute', label: 'Cute messages' },
  { id: 'goodnight', label: 'Goodnight conversations' },
  { id: 'everyday', label: 'Random everyday moments' },
  { id: 'worth_saving', label: 'Conversations worth saving' },
]

export const THEMES = [
  { id: 'blush', label: 'Blush pink' },
  { id: 'lavender', label: 'Lavender dream' },
  { id: 'peach', label: 'Peach sunset' },
]

/** Example pop-up lines (placeholders until replaced in Admin → Flirty pop-ups). */
export const FLIRTY_EXAMPLES = [
  "Your smile should come with a warning label — it's dangerously cute.",
  "Fun fact: you're the prettiest notification I've ever received.",
  'Your laugh is officially my favourite sound effect.',
  'Somewhere, a sunset is jealous of how good you look today.',
  "You're proof that cute and clever can live in the same person.",
  "Those eyes should be illegal. I'd happily do the time.",
  "You don't walk into a room — you upgrade it.",
  "If being adorable were a crime, you'd be serving a life sentence.",
  'Your cheeks when you smile? Totally unfair advantage.',
  "You're the reason I look at my phone and smile like an idiot.",
  'Warning: excessive cuteness detected on this screen. Source: you.',
  'Your voice is my favourite place to be.',
  'You make “gorgeous” sound like an understatement.',
  "I'd tell you you're beautiful, but the stars probably told you first.",
  'Your hugs should be available on prescription.',
  'Even your sleepy face is a masterpiece.',
  'You + that smile = my one and only weakness.',
  "You're cuter than every cat video on the internet combined.",
  'Every time you look at me, my heart forgets how to behave.',
  'Plot twist: the prettiest thing on this website is the person reading it.',
]
