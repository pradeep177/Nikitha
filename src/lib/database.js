/**
 * Public content API. Pages never talk to Supabase directly — they call these
 * functions (through the `useContent` hook), which keeps data access separate
 * from presentation.
 *
 *  • Demo mode     → the in-memory demo database (demoData.js)
 *  • Supabase mode → real queries. Row Level Security decides what each
 *    visitor may read; we additionally ask only for *published* rows so the
 *    admin sees the same public site as everyone else.
 */
import { supabase, isDemoMode } from './supabase'
import { demoDb } from './demoData'
import {
  mapChat,
  mapFinalSurprise,
  mapHero,
  mapHerPhoto,
  mapLetter,
  mapMemory,
  mapQuizQuestion,
  mapTimeline,
  mapTrack,
  mediaRefs,
  sortPublished,
} from './mappers'
import { resolveMediaUrls } from './storage'
import { createDemoChimeUrl } from '@/utils/demoAudio'

// ---------------------------------------------------------------------------
// Demo
// ---------------------------------------------------------------------------
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Demo media: only in-memory previews (blob:) and the generated chime exist. */
const demoUrl = (_bucket, path) => {
  if (!path) return null
  if (path === 'demo:chime') return createDemoChimeUrl()
  return path.startsWith('blob:') ? path : null
}

async function demo(read) {
  await wait(200)
  return structuredClone(read(demoDb))
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------
async function run(query) {
  const { data, error } = await query
  if (error) {
    const err = new Error(error.message || 'The database request failed.')
    err.cause = error
    throw err
  }
  return data
}

const ordered = (table, columns = '*') =>
  supabase.from(table).select(columns).eq('is_published', true).order('display_order').order('created_at')

/** Fetch rows, resolve all their media in one batch, then map them for the page. */
async function withMedia(table, rows, mapper) {
  const url = await resolveMediaUrls(rows.flatMap((row) => mediaRefs(table, row)))
  return rows.map((row) => mapper(row, url))
}

const live = {
  getSettings: () => run(supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()),

  async getHero() {
    const row = await run(supabase.from('hero_content').select('*').eq('id', 1).maybeSingle())
    if (!row) return null
    const [hero] = await withMedia('hero_content', [row], mapHero)
    return hero
  },

  listCuteMessages: () => run(ordered('cute_messages')),

  listFlirtyLines: () => run(ordered('flirty_lines')),

  async listHerPhotos() {
    return withMedia('her_photos', await run(ordered('her_photos')), mapHerPhoto)
  },

  async listMemories() {
    const [memories, categories] = await Promise.all([
      run(ordered('memories')),
      run(supabase.from('memory_categories').select('*').order('display_order')),
    ])
    return { memories: await withMedia('memories', memories, mapMemory), categories }
  },

  async listQuizQuestions() {
    const rows = await run(ordered('quiz_questions', '*, options:quiz_options(*)'))
    return rows.map(mapQuizQuestion)
  },

  async listChats() {
    return withMedia('chat_screenshots', await run(ordered('chat_screenshots')), mapChat)
  },

  listLoveNotes: () => run(ordered('love_notes').eq('is_archived', false)),

  async listTimeline() {
    return withMedia('timeline_entries', await run(ordered('timeline_entries')), mapTimeline)
  },

  listMoodMessages: () => run(ordered('mood_messages')),

  async listTracks() {
    return withMedia('soundtrack_tracks', await run(ordered('soundtrack_tracks')), mapTrack)
  },

  async listLetters() {
    return withMedia('open_when_letters', await run(ordered('open_when_letters')), mapLetter)
  },

  async getFinalSurprise() {
    const row = await run(supabase.from('final_surprise').select('*').eq('id', 1).maybeSingle())
    if (!row) return null
    const [surprise] = await withMedia('final_surprise', [row], mapFinalSurprise)
    return surprise
  },

  /**
   * Insert-only: visitors are not allowed to read attempts back, so we must
   * not ask PostgREST to return the row (no `.select()`).
   */
  async saveQuizAttempt({ score, total, answers }) {
    const { error } = await supabase.from('quiz_attempts').insert({ score, total, answers })
    if (error) throw new Error(error.message)
    return { saved: true }
  },
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
const demoApi = {
  getSettings: () => demo((db) => db.site_settings),
  getHero: () => demo((db) => mapHero(db.hero_content, demoUrl)),
  listCuteMessages: () => demo((db) => sortPublished(db.cute_messages)),
  listFlirtyLines: () => demo((db) => sortPublished(db.flirty_lines)),
  listHerPhotos: () => demo((db) => sortPublished(db.her_photos).map((p) => mapHerPhoto(p, demoUrl))),
  listMemories: () =>
    demo((db) => ({
      memories: sortPublished(db.memories).map((m) => mapMemory(m, demoUrl)),
      categories: [...db.memory_categories].sort((a, b) => a.display_order - b.display_order),
    })),
  listQuizQuestions: () => demo((db) => sortPublished(db.quiz_questions).map(mapQuizQuestion)),
  listChats: () => demo((db) => sortPublished(db.chat_screenshots).map((c) => mapChat(c, demoUrl))),
  listLoveNotes: () => demo((db) => sortPublished(db.love_notes, (n) => !n.is_archived)),
  listTimeline: () => demo((db) => sortPublished(db.timeline_entries).map((t) => mapTimeline(t, demoUrl))),
  listMoodMessages: () => demo((db) => sortPublished(db.mood_messages)),
  listTracks: () => demo((db) => sortPublished(db.soundtrack_tracks).map((t) => mapTrack(t, demoUrl))),
  listLetters: () => demo((db) => sortPublished(db.open_when_letters).map((l) => mapLetter(l, demoUrl))),
  getFinalSurprise: () => demo((db) => mapFinalSurprise(db.final_surprise, demoUrl)),
  saveQuizAttempt: async (attempt) => {
    demoDb.quiz_attempts.unshift({ id: `attempt-${Date.now()}`, user_id: null, created_at: new Date().toISOString(), ...attempt })
    return { saved: false, reason: 'demo' }
  },
}

export const content = isDemoMode ? demoApi : live
