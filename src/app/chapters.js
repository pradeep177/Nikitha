import {
  CalendarHeart,
  Gift,
  Heart,
  House,
  Images,
  Mail,
  MessageCircleHeart,
  Music,
  Puzzle,
  Sparkles,
} from 'lucide-react'

/**
 * The website is told as one continuous story; each public section is a chapter.
 * `{name}` is replaced with her displayed name from site settings.
 */
export const CHAPTERS = [
  {
    id: 'home',
    path: '/',
    label: 'Welcome Home',
    short: 'Home',
    icon: House,
    tint: 'blush',
    title: 'Welcome home, {name} ♡',
    subtitle: 'A little universe made just for you',
  },
  {
    id: 'memories',
    section: 'memories',
    path: '/memories',
    label: 'Our Memories',
    short: 'Memories',
    icon: Images,
    tint: 'peach',
    title: 'Our little moments ♡',
    subtitle: 'Every photo holds a little piece of our story.',
  },
  {
    id: 'quiz',
    section: 'quiz',
    path: '/quiz',
    label: 'How Well Do You Know Us?',
    short: 'Quiz',
    icon: Puzzle,
    tint: 'lavender',
    title: 'How well do you know us? ♡',
    subtitle: "Let's see how much attention you've been paying, miss {name}!",
  },
  {
    id: 'chats',
    section: 'chats',
    path: '/chats',
    label: 'Our Little Chats',
    short: 'Chats',
    icon: MessageCircleHeart,
    tint: 'butter',
    title: 'Our little conversations',
    subtitle: 'Some conversations are too cute, too funny, or too us to forget.',
  },
  {
    id: 'reasons',
    section: 'reasons',
    path: '/reasons',
    label: 'Reasons I Love You',
    short: 'Reasons',
    icon: Heart,
    tint: 'blush',
    title: "A few reasons you're special to me ♡",
    subtitle: 'Tap a card to open a little note.',
  },
  {
    id: 'timeline',
    section: 'timeline',
    path: '/timeline',
    label: 'Our Timeline',
    short: 'Timeline',
    icon: CalendarHeart,
    tint: 'lavender',
    title: 'Our story, one little moment at a time.',
    subtitle: 'Scroll slowly — every step is a memory.',
  },
  {
    id: 'little-things',
    section: 'little_things',
    path: '/little-things',
    label: 'Little Things',
    short: 'Little Things',
    tab: 'Happy Box',
    icon: Sparkles,
    tint: 'butter',
    title: 'A little box of happiness ♡',
    subtitle: 'Tiny surprises, silly games and soft little messages.',
  },
  {
    id: 'soundtrack',
    section: 'soundtrack',
    path: '/soundtrack',
    label: 'Our Soundtrack',
    short: 'Soundtrack',
    icon: Music,
    tint: 'lavender',
    title: 'The soundtrack of us.',
    subtitle: 'Songs and little voice notes that sound like us.',
  },
  {
    id: 'open-when',
    section: 'open_when',
    path: '/open-when',
    label: 'Open When...',
    short: 'Open When',
    icon: Mail,
    tint: 'peach',
    title: 'Little letters for different days.',
    subtitle: 'Pick the envelope that matches your day.',
  },
  {
    id: 'surprise',
    section: 'surprise',
    path: '/surprise',
    label: 'One Last Surprise',
    short: 'Surprise',
    icon: Gift,
    tint: 'blush',
    title: 'Before you go...',
    subtitle: 'I saved one last little thing for you.',
  },
]

export const MOBILE_PRIMARY_CHAPTERS = ['home', 'memories', 'reasons', 'little-things']

export function getChapter(id) {
  return CHAPTERS.find((c) => c.id === id)
}

export function getChapterIndex(id, list = CHAPTERS) {
  return list.findIndex((c) => c.id === id)
}

export function isChapterActive(chapter, pathname) {
  if (chapter.path === '/') return pathname === '/'
  return pathname === chapter.path || pathname.startsWith(`${chapter.path}/`)
}

export function personalize(text, name) {
  return (text ?? '').replaceAll('{name}', name)
}
