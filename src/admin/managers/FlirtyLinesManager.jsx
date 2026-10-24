import { HeartPulse } from 'lucide-react'
import CollectionManager from '../CollectionManager'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const fields = [
  {
    name: 'message',
    label: 'Flirty line',
    type: 'textarea',
    rows: 3,
    required: true,
    maxLength: 300,
    help: 'Short and sweet works best — one or two sentences about her.',
  },
  { name: 'is_published', label: 'Published', type: 'switch', onLabel: 'In the pop-up rotation', offLabel: 'Hidden (draft)' },
]

export default function FlirtyLinesManager() {
  const { settings } = useSiteSettings()
  const every = settings.flirty_interval_minutes ?? 1
  return (
    <CollectionManager
      table="flirty_lines"
      title="Flirty pop-ups"
      description={
        settings.flirty_popups_enabled === false
          ? 'Pop-ups are currently switched off in Settings.'
          : `One of these pops up on the website every ${every} minute${every === 1 ? '' : 's'}, in a shuffled order. Change the timing in Settings.`
      }
      noun="line"
      emptyIcon={HeartPulse}
      fields={fields}
      itemTitle={(row) => row.message}
      renderPreview={(values) => (
        <div className="relative rounded-[1.75rem] border border-blush-deep bg-paper p-4 shadow-lift">
          <p className="text-[0.68rem] font-extrabold tracking-[0.2em] text-rose uppercase">Psst, {settings.her_name}…</p>
          <p className="mt-0.5 font-hand text-[1.5rem] leading-tight text-ink">{values.message || 'Your flirty line…'}</p>
        </div>
      )}
    />
  )
}
