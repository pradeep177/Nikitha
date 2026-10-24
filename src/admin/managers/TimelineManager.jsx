import { CalendarHeart } from 'lucide-react'
import CollectionManager from '../CollectionManager'
import SmartImage from '@/components/SmartImage'
import { mediaUrl } from '@/lib/storage'
import { formatDate } from '@/utils/format'

const fields = [
  { name: 'title', label: 'Title', required: true, maxLength: 160 },
  { name: 'event_date', label: 'Date', type: 'date', full: false },
  { name: 'category', label: 'Milestone label (optional)', maxLength: 40, placeholder: 'e.g. First date', full: false },
  { name: 'story', label: 'Short story', type: 'textarea', rows: 5, maxLength: 2000 },
  { name: 'image_path', label: 'Photo (optional)', type: 'media', media: { bucket: 'public-media', folder: 'timeline', kind: 'image' } },
  { name: 'image_alt', label: 'Photo description (for screen readers)', maxLength: 300 },
  { name: 'location', label: 'Location (optional)', maxLength: 120 },
  { name: 'is_published', label: 'Published', type: 'switch', onLabel: 'Visible on the website', offLabel: 'Hidden (draft)' },
]

export default function TimelineManager() {
  return (
    <CollectionManager
      table="timeline_entries"
      title="Timeline"
      description="Milestones in your story. They appear in the order shown here — use the arrows to keep them chronological."
      noun="milestone"
      emptyIcon={CalendarHeart}
      fields={fields}
      itemTitle={(row) => row.title}
      itemSubtitle={(row) => [formatDate(row.event_date) ?? 'No date yet', row.location].filter(Boolean).join(' · ')}
      itemThumb={(row) => (row.image_path ? { bucket: 'public-media', path: row.image_path } : null)}
      renderPreview={(values) => (
        <div className="card-paper overflow-hidden">
          {values.image_path && <SmartImage src={mediaUrl('public-media', values.image_path)} alt="" aspect="16/10" />}
          <div className="p-4">
            <span className="sticker">{formatDate(values.event_date) ?? 'Date to be added'}</span>
            <p className="mt-2 font-hand text-2xl leading-tight font-bold text-ink">{values.title || 'Title…'}</p>
            {values.story && <p className="mt-1 line-clamp-5 text-sm text-ink-soft">{values.story}</p>}
          </div>
        </div>
      )}
    />
  )
}
