import { Info } from 'lucide-react'
import ContentEditor from '../ContentEditor'
import AnimatedHeart from '@/components/AnimatedHeart'
import { DEFAULT_SETTINGS, THEMES } from '@/lib/defaults'

const SECTIONS = [
  { key: 'memories', label: 'Our Memories' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'chats', label: 'Our Little Chats' },
  { key: 'reasons', label: 'Reasons I Love You' },
  { key: 'timeline', label: 'Our Timeline' },
  { key: 'little_things', label: 'Little Things' },
  { key: 'soundtrack', label: 'Soundtrack (songs)' },
  { key: 'voice_notes', label: 'Voice notes' },
  { key: 'open_when', label: 'Open When letters' },
  { key: 'surprise', label: 'Final surprise' },
]

const VISIBILITY = [
  { value: 'public', label: 'Everyone with the link' },
  { value: 'private', label: 'Only her (signed in) + you' },
  { value: 'hidden', label: 'Hidden — only you' },
]

const SWATCH = { blush: ['#fde2e7', '#d9487c'], lavender: ['#ece6fb', '#8b5cd6'], peach: ['#ffe6d9', '#e06a4c'] }

function ThemePicker({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Colour theme" className="grid gap-2 sm:grid-cols-3">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={value === t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left text-sm font-bold transition ${value === t.id ? 'border-berry bg-paper shadow-card' : 'border-blush hover:border-blush-deep'}`}
        >
          <span className="flex -space-x-2" aria-hidden="true">
            <span className="size-7 rounded-full ring-2 ring-white" style={{ background: SWATCH[t.id][0] }} />
            <span className="size-7 rounded-full ring-2 ring-white" style={{ background: SWATCH[t.id][1] }} />
          </span>
          {t.label}
        </button>
      ))}
    </div>
  )
}

function VisibilityEditor({ value = {}, onChange }) {
  return (
    <div>
      <p className="mb-3 flex items-start gap-2 rounded-2xl bg-lavender/60 px-4 py-3 text-sm text-ink">
        <Info className="mt-0.5 size-4 shrink-0 text-berry-deep" aria-hidden="true" />
        <span>
          <strong>Hiding is not the same as protecting.</strong> These settings are enforced by the database itself: “private” content and
          its files are never sent to anyone who isn’t signed in as her or you — even if they guess the page address. Photos in public
          chapters (memories, timeline, landing page) are stored in a public bucket, so anyone who has a photo’s exact link can open it.
        </span>
      </p>
      <div className="divide-y divide-blush-deep/40 rounded-2xl border-2 border-blush">
        {SECTIONS.map((s) => (
          <div key={s.key} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
            <label htmlFor={`vis-${s.key}`} className="text-sm font-bold text-ink">
              {s.label}
            </label>
            <select
              id={`vis-${s.key}`}
              value={value[s.key] ?? 'private'}
              onChange={(e) => onChange({ ...value, [s.key]: e.target.value })}
              className="min-h-10 rounded-xl border-2 border-blush-deep bg-paper px-3 text-sm"
            >
              {VISIBILITY.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

const fields = [
  { name: 'h-names', type: 'heading', label: 'Names & titles' },
  { name: 'her_name', label: 'Her displayed name', required: true, maxLength: 60, full: false },
  { name: 'site_title', label: 'Website title', required: true, maxLength: 80, full: false },
  { name: 'signature', label: 'Signature line', maxLength: 120, placeholder: 'Made with love, just for you' },
  { name: 'h-look', type: 'heading', label: 'Look & feel' },
  { name: 'theme', label: 'Colour theme', type: 'custom', render: (p) => <ThemePicker {...p} /> },
  { name: 'show_hearts', label: 'Floating hearts', type: 'switch', full: false, onLabel: 'On', offLabel: 'Off' },
  { name: 'show_stars', label: 'Twinkling stars', type: 'switch', full: false, onLabel: 'On', offLabel: 'Off' },
  { name: 'show_clouds', label: 'Drifting clouds', type: 'switch', full: false, onLabel: 'On', offLabel: 'Off' },
  { name: 'h-privacy', type: 'heading', label: 'Who can see each chapter' },
  { name: 'section_visibility', label: 'Chapter visibility', type: 'custom', render: (p) => <VisibilityEditor {...p} /> },
  { name: 'h-flirty', type: 'heading', label: 'Flirty pop-ups' },
  {
    name: 'flirty_popups_enabled',
    label: 'Show flirty pop-ups',
    type: 'switch',
    onLabel: 'A little line about her pops up now and then',
    offLabel: 'Off',
    full: false,
  },
  {
    name: 'flirty_interval_minutes',
    label: 'Every how many minutes?',
    type: 'number',
    required: true,
    full: false,
    help: 'Between 1 and 60. Counts only while the page is open and visible.',
    validate: (v) => (Number.isInteger(Number(v)) && v >= 1 && v <= 60 ? null : 'Please choose a whole number from 1 to 60.'),
  },
  { name: 'h-quiz', type: 'heading', label: 'Quiz' },
  {
    name: 'quiz_save_results',
    label: 'Save quiz results',
    type: 'switch',
    onLabel: 'Score, time and chosen answers are saved (only you can read them)',
    offLabel: 'Nothing is stored',
  },
  { name: 'quiz_result_messages.low', label: 'Result message — low score', type: 'textarea', rows: 2, maxLength: 300 },
  { name: 'quiz_result_messages.medium', label: 'Result message — medium score', type: 'textarea', rows: 2, maxLength: 300 },
  { name: 'quiz_result_messages.high', label: 'Result message — high score (70%+)', type: 'textarea', rows: 2, maxLength: 300 },
  { name: 'quiz_result_messages.perfect', label: 'Result message — perfect score', type: 'textarea', rows: 2, maxLength: 300 },
  { name: 'h-sound', type: 'heading', label: 'Soundtrack' },
  { name: 'soundtrack_intro', label: 'Soundtrack intro line', maxLength: 300 },
]

function Preview({ values }) {
  return (
    <div data-theme={values.theme} className="rounded-2xl bg-cream p-4 text-center">
      <p className="font-hand text-3xl font-bold text-ink">
        {values.site_title?.replace(/\s*♡\s*$/, '')} <span className="text-berry">♡</span>
      </p>
      <p className="mt-1 font-hand text-2xl text-ink-soft">Welcome home, {values.her_name}</p>
      <span className="mt-3 inline-block rounded-full bg-berry-deep px-4 py-2 text-xs font-bold text-white">A button</span>
      <p className="mt-3 flex items-center justify-center gap-1 font-hand text-lg text-ink-soft">
        {values.signature} <AnimatedHeart className="size-4 text-berry" />
      </p>
    </div>
  )
}

export default function SettingsManager() {
  return (
    <ContentEditor
      table="site_settings"
      title="Settings"
      description="Her name, the website title, colours, decorations and who can see each chapter."
      fields={fields}
      defaults={DEFAULT_SETTINGS}
      renderPreview={(values) => <Preview values={values} />}
    />
  )
}
