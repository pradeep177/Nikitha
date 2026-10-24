import { Heart } from 'lucide-react'
import CollectionManager from '../CollectionManager'

const fields = [
  { name: 'title', label: 'Card title (front)', required: true, maxLength: 80, help: 'A few words shown on the front of the card.' },
  { name: 'message', label: 'The reason (back)', type: 'textarea', rows: 4, required: true, maxLength: 1000 },
  { name: 'is_published', label: 'Published', type: 'switch', onLabel: 'Visible on the website', offLabel: 'Hidden (draft)' },
]

export default function LoveNotesManager() {
  return (
    <CollectionManager
      table="love_notes"
      title="Reasons I love you"
      description="Each card flips open to reveal a reason. Archive a card to hide it without losing it."
      noun="reason"
      emptyIcon={Heart}
      archivable
      fields={fields}
      itemTitle={(row) => row.title}
      itemSubtitle={(row) => row.message}
      renderPreview={(values) => (
        <div className="space-y-3">
          <div className="flex h-36 flex-col justify-end rounded-3xl bg-blush p-4 shadow-card">
            <p className="font-hand text-2xl leading-tight font-bold text-ink">{values.title || 'Card title'}</p>
            <p className="text-xs font-bold text-berry-deep">♡ Tap to open</p>
          </div>
          <div className="rounded-3xl border-2 border-blush-deep bg-paper p-4 shadow-card">
            <p className="text-[0.65rem] font-extrabold tracking-[0.2em] text-rose uppercase">Reason</p>
            <p className="mt-1 font-hand text-xl leading-snug text-ink">{values.message || 'The reason…'}</p>
          </div>
        </div>
      )}
    />
  )
}
