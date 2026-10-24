/**
 * Admin data API — the only place the dashboard reads/writes content.
 *
 * Demo mode: edits apply to the in-memory demo database (this tab only).
 * Supabase mode: real queries; Row Level Security on the server is what
 * actually authorises every write.
 */
import { supabase, isDemoMode } from './supabase'
import { demoDb, newDemoId } from './demoData'
import { mediaRefs } from './mappers'
import { removeFileIfUnused } from './media'
import { invalidateContent } from '@/hooks/useContent'

/** Writable columns per table — anything else in a form is ignored. */
export const COLUMNS = {
  site_settings: [
    'site_title', 'her_name', 'signature', 'theme', 'show_hearts', 'show_stars', 'show_clouds',
    'section_visibility', 'quiz_save_results', 'quiz_result_messages', 'soundtrack_intro',
    'flirty_popups_enabled', 'flirty_interval_minutes',
  ],
  hero_content: [
    'label', 'heading', 'message', 'affection_line', 'photo_path', 'photo_alt', 'photo_caption',
    'primary_cta', 'secondary_cta', 'scroll_hint',
  ],
  cute_messages: ['message', 'is_published'],
  flirty_lines: ['message', 'is_published'],
  her_photos: [
    'image_path', 'image_width', 'image_height', 'alt_text', 'caption', 'show_on_landing', 'show_in_ribbon',
    'show_in_chapters', 'show_on_reasons', 'show_on_surprise', 'show_on_soundtrack', 'is_published',
  ],
  memory_categories: ['name', 'slug'],
  memories: [
    'title', 'caption', 'image_path', 'image_width', 'image_height', 'alt_text', 'taken_on', 'location',
    'category_id', 'is_featured', 'is_published',
  ],
  chat_screenshots: ['image_path', 'image_width', 'image_height', 'caption', 'alt_text', 'chat_date', 'collection', 'is_published'],
  love_notes: ['title', 'message', 'is_published', 'is_archived'],
  timeline_entries: ['event_date', 'title', 'story', 'image_path', 'image_alt', 'location', 'category', 'is_published'],
  mood_messages: ['mood', 'label', 'message', 'is_published'],
  soundtrack_tracks: ['kind', 'title', 'artist', 'note', 'audio_path', 'external_url', 'artwork_path', 'is_published'],
  open_when_letters: ['title', 'occasion', 'message', 'image_path', 'audio_path', 'is_published'],
  final_surprise: [
    'surprise_type', 'heading', 'intro', 'button_label', 'title', 'message', 'image_path', 'image_alt',
    'collage_paths', 'video_path', 'video_url', 'details', 'signoff',
  ],
}

const HAS_PLACEHOLDER = new Set([
  'cute_messages', 'flirty_lines', 'her_photos', 'memories', 'quiz_questions', 'chat_screenshots', 'love_notes', 'timeline_entries',
  'mood_messages', 'soundtrack_tracks', 'open_when_letters', 'final_surprise',
])
const SINGLETONS = new Set(['site_settings', 'hero_content', 'final_surprise'])

function clean(table, values) {
  const out = {}
  for (const col of COLUMNS[table] ?? []) {
    if (!(col in values)) continue
    const v = values[col]
    out[col] = typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : v
  }
  // Saving anything from the dashboard means it is now real content.
  if (HAS_PLACEHOLDER.has(table)) out.is_placeholder = false
  return out
}

/** Friendly wording for database / network errors. */
export function friendlyDbError(error) {
  const code = error?.code
  const msg = error?.message ?? String(error ?? '')
  if (code === '42501' || /row-level security|not authorized|permission denied/i.test(msg)) {
    return "You don't have permission to do that. Are you signed in as the admin?"
  }
  if (code === '23514') return "One of the values isn't allowed (it may be too long or in the wrong format)."
  if (code === '23505') return 'That would create a duplicate (for example two correct answers, or a repeated slug).'
  if (code === '23503') return 'This item is still linked to something else.'
  if (code === '22P02' || code === '22007' || code === '22008') return 'One of the values has the wrong format (check dates and numbers).'
  if (/failed to fetch|network/i.test(msg)) return "Couldn't reach the server — check your connection and try again."
  return msg || 'Something went wrong.'
}

async function run(promise) {
  const { data, error, count } = await promise
  if (error) {
    const err = new Error(friendlyDbError(error))
    err.cause = error
    throw err
  }
  return count ?? data
}

const byOrder = (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || String(a.created_at).localeCompare(String(b.created_at))

function changed() {
  invalidateContent()
}

// ---------------------------------------------------------------------------
// Demo implementation (in-memory, this tab only)
// ---------------------------------------------------------------------------
const tick = () => new Promise((r) => setTimeout(r, 120))

const demoApi = {
  async list(table) {
    await tick()
    return structuredClone([...demoDb[table]].sort(byOrder))
  },
  async getSingleton(table) {
    await tick()
    return structuredClone(demoDb[table])
  },
  async saveSingleton(table, values) {
    await tick()
    demoDb[table] = { ...demoDb[table], ...clean(table, values), updated_at: new Date().toISOString() }
    changed()
    return structuredClone(demoDb[table])
  },
  async create(table, values) {
    await tick()
    const list = demoDb[table]
    const row = {
      id: newDemoId(table),
      display_order: list.length ? Math.max(...list.map((r) => r.display_order ?? 0)) + 1 : 0,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...clean(table, values),
    }
    list.push(row)
    changed()
    return structuredClone(row)
  },
  async update(table, id, values) {
    await tick()
    const row = demoDb[table].find((r) => r.id === id)
    if (!row) throw new Error('That item no longer exists.')
    Object.assign(row, clean(table, values), { updated_at: new Date().toISOString() })
    changed()
    return structuredClone(row)
  },
  async patch(table, id, values) {
    await tick()
    const row = demoDb[table].find((r) => r.id === id)
    if (row) Object.assign(row, values)
    changed()
  },
  async remove(table, row) {
    await tick()
    demoDb[table] = demoDb[table].filter((r) => r.id !== row.id)
    if (table === 'memory_categories') demoDb.memories.forEach((m) => m.category_id === row.id && (m.category_id = null))
    changed()
  },
  async reorder(table, ids) {
    await tick()
    ids.forEach((id, i) => {
      const row = demoDb[table].find((r) => r.id === id)
      if (row) row.display_order = i
    })
    changed()
  },
  async count(table, filter) {
    const rows = Array.isArray(demoDb[table]) ? demoDb[table] : []
    return filter ? rows.filter(filter).length : rows.length
  },
  async listQuiz() {
    await tick()
    return structuredClone([...demoDb.quiz_questions].sort(byOrder))
  },
  async saveQuizQuestion(question, options) {
    await tick()
    validateQuiz(question, options)
    const opts = options.map((o, i) => ({ id: newDemoId('opt'), label: o.label.trim(), is_correct: !!o.is_correct, display_order: i }))
    if (question.id) {
      const row = demoDb.quiz_questions.find((q) => q.id === question.id)
      Object.assign(row, { category: question.category, question: question.question.trim(), explanation: question.explanation?.trim() || null, is_published: question.is_published, is_placeholder: false, options: opts })
    } else {
      demoDb.quiz_questions.push({
        id: newDemoId('q'),
        category: question.category,
        question: question.question.trim(),
        explanation: question.explanation?.trim() || null,
        is_published: question.is_published ?? true,
        is_placeholder: false,
        display_order: demoDb.quiz_questions.length,
        created_at: new Date().toISOString(),
        options: opts,
      })
    }
    changed()
  },
  async listQuizAttempts() {
    await tick()
    return structuredClone(demoDb.quiz_attempts)
  },
  async deleteQuizAttempt(id) {
    demoDb.quiz_attempts = demoDb.quiz_attempts.filter((a) => a.id !== id)
  },
  async clearQuizAttempts() {
    demoDb.quiz_attempts = []
  },
}

// ---------------------------------------------------------------------------
// Supabase implementation
// ---------------------------------------------------------------------------
const liveApi = {
  async list(table) {
    return run(supabase.from(table).select('*').order('display_order').order('created_at'))
  },
  async getSingleton(table) {
    return run(supabase.from(table).select('*').eq('id', 1).maybeSingle())
  },
  async saveSingleton(table, values) {
    const row = await run(supabase.from(table).upsert({ id: 1, ...clean(table, values) }).select().single())
    changed()
    return row
  },
  async create(table, values) {
    const rows = await run(supabase.from(table).select('display_order').order('display_order', { ascending: false }).limit(1))
    const nextOrder = rows?.length ? (rows[0].display_order ?? 0) + 1 : 0
    const row = await run(supabase.from(table).insert({ display_order: nextOrder, ...clean(table, values) }).select().single())
    changed()
    return row
  },
  async update(table, id, values) {
    const row = await run(supabase.from(table).update(clean(table, values)).eq('id', id).select().single())
    changed()
    return row
  },
  async patch(table, id, values) {
    await run(supabase.from(table).update(values).eq('id', id))
    changed()
  },
  async remove(table, row) {
    await run(supabase.from(table).delete().eq('id', row.id))
    // The row is gone, so its files can go too — unless something else still uses them.
    await Promise.allSettled(mediaRefs(table, row).map(([bucket, path]) => removeFileIfUnused(bucket, path)))
    changed()
  },
  async reorder(table, ids) {
    await run(supabase.rpc('reorder_rows', { p_table: table, p_ids: ids }))
    changed()
  },
  async count(table, filter) {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })
    if (filter === 'placeholder') query = query.eq('is_placeholder', true)
    return run(query)
  },
  async listQuiz() {
    const rows = await run(
      supabase.from('quiz_questions').select('*, options:quiz_options(*)').order('display_order').order('created_at'),
    )
    return rows.map((q) => ({ ...q, options: [...(q.options ?? [])].sort(byOrder) }))
  },
  async saveQuizQuestion(question, options) {
    validateQuiz(question, options)
    await run(
      supabase.rpc('save_quiz_question', {
        p_question: {
          id: question.id ?? null,
          category: question.category,
          question: question.question.trim(),
          explanation: question.explanation ?? '',
          is_published: question.is_published ?? true,
        },
        p_options: options.map((o) => ({ label: o.label.trim(), is_correct: !!o.is_correct })),
      }),
    )
    changed()
  },
  async listQuizAttempts() {
    return run(supabase.from('quiz_attempts').select('*').order('created_at', { ascending: false }).limit(500))
  },
  async deleteQuizAttempt(id) {
    await run(supabase.from('quiz_attempts').delete().eq('id', id))
  },
  async clearQuizAttempts() {
    await run(supabase.from('quiz_attempts').delete().not('id', 'is', null))
  },
}

function validateQuiz(question, options) {
  if (!question.question?.trim()) throw new Error('Please write the question.')
  if (options.length < 2 || options.length > 6) throw new Error('A question needs between 2 and 6 answers.')
  if (options.some((o) => !o.label?.trim())) throw new Error('Every answer option needs some text.')
  if (options.filter((o) => o.is_correct).length !== 1) throw new Error('Mark exactly one answer as correct.')
}

const impl = isDemoMode ? demoApi : liveApi

export const adminApi = {
  ...impl,
  isSingleton: (table) => SINGLETONS.has(table),
  /** Count placeholder rows across all content tables (dashboard reminder). */
  async placeholderCount() {
    const tables = [...HAS_PLACEHOLDER].filter((t) => !SINGLETONS.has(t))
    const counts = await Promise.all(
      tables.map((t) => (isDemoMode ? demoApi.count(t, (r) => r.is_placeholder) : liveApi.count(t, 'placeholder'))),
    )
    return counts.reduce((a, b) => a + (b ?? 0), 0)
  },
}
