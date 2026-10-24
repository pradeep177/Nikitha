import { Smile } from 'lucide-react'
import CollectionManager from '../CollectionManager'
import { adminApi } from '@/lib/adminApi'
import { MOODS } from '@/lib/defaults'

const CUSTOM = '__custom'
const isStandard = (mood) => MOODS.some((m) => m.id === mood)

const fields = [
  {
    name: 'mood',
    label: 'Mood',
    type: 'select',
    required: true,
    options: [...MOODS.map((m) => ({ value: m.id, label: m.label })), { value: CUSTOM, label: 'Something else…' }],
  },
  {
    name: 'label',
    label: 'Mood name',
    required: true,
    maxLength: 40,
    placeholder: 'e.g. Excited',
    when: (v) => v.mood === CUSTOM,
    help: 'Shown as the button label.',
  },
  { name: 'message', label: 'Message for this mood', type: 'textarea', rows: 4, required: true, maxLength: 800 },
  { name: 'is_published', label: 'Published', type: 'switch', onLabel: 'Visible on the website', offLabel: 'Hidden (draft)' },
]

const moodKey = (label) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30) || 'custom'

function toRow(values) {
  if (values.mood !== CUSTOM) return { ...values, label: null }
  return { ...values, mood: moodKey(values.label ?? ''), label: values.label }
}

const moodLabel = (row) => row.label || MOODS.find((m) => m.id === row.mood)?.label || row.mood

export default function MoodsManager() {
  return (
    <CollectionManager
      table="mood_messages"
      title="Mood messages"
      description="“How are you feeling today?” — a message for each mood in the Little Things chapter."
      noun="mood message"
      emptyIcon={Smile}
      fields={fields}
      defaults={{ mood: 'happy' }}
      toFormValues={(row) => (isStandard(row.mood) && !row.label ? row : { ...row, mood: CUSTOM, label: row.label || row.mood })}
      save={(values, row) => (row ? adminApi.update('mood_messages', row.id, toRow(values)) : adminApi.create('mood_messages', toRow(values)))}
      itemTitle={moodLabel}
      itemSubtitle={(row) => row.message}
      renderPreview={(values) => (
        <div className="rounded-3xl bg-blush/60 px-4 py-4">
          <p className="text-[0.65rem] font-extrabold tracking-[0.2em] text-rose uppercase">
            If you're feeling {(values.mood === CUSTOM ? values.label : moodLabel(values))?.toLowerCase() || '…'}…
          </p>
          <p className="mt-1 font-hand text-xl leading-snug text-ink">{values.message || 'Your message…'}</p>
        </div>
      )}
    />
  )
}
