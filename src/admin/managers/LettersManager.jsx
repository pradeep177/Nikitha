import { Mail } from 'lucide-react'
import CollectionManager from '../CollectionManager'
import Envelope from '@/components/Envelope'

const fields = [
  { name: 'title', label: 'Envelope label', required: true, maxLength: 120, placeholder: 'Open when…' },
  { name: 'occasion', label: 'Mood or occasion (optional)', maxLength: 40, placeholder: 'e.g. difficult day', help: 'Just for your own organising.' },
  { name: 'message', label: 'The letter', type: 'textarea', rows: 9, required: true, maxLength: 5000 },
  { name: 'image_path', label: 'Photo inside the letter (optional)', type: 'media', media: { bucket: 'private-media', folder: 'open_when', kind: 'image' } },
  { name: 'audio_path', label: 'Voice note inside the letter (optional)', type: 'media', media: { bucket: 'audio', folder: 'open_when', kind: 'audio' } },
  { name: 'is_published', label: 'Published', type: 'switch', onLabel: 'Visible on the website', offLabel: 'Hidden (draft)' },
]

export default function LettersManager() {
  return (
    <CollectionManager
      table="open_when_letters"
      title="Open When letters"
      description="Little letters for different days. These follow the “Open When” privacy setting (private by default)."
      noun="letter"
      emptyIcon={Mail}
      fields={fields}
      itemTitle={(row) => row.title}
      itemSubtitle={(row) => row.message}
      renderPreview={(values) => (
        <div className="space-y-3">
          <div className="mx-auto w-40">
            <Envelope tint="blush" />
          </div>
          <div className="rounded-2xl bg-paper p-4 shadow-card">
            <p className="font-hand text-2xl leading-tight font-bold text-berry-deep">{values.title || 'Open when…'}</p>
            <p className="mt-2 line-clamp-[10] font-hand text-lg leading-snug whitespace-pre-line text-ink">{values.message || 'Your letter…'}</p>
          </div>
        </div>
      )}
    />
  )
}
