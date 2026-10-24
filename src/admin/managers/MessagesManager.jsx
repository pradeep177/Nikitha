import { MessageSquareHeart } from 'lucide-react'
import CollectionManager from '../CollectionManager'

const fields = [
  { name: 'message', label: 'Message', type: 'textarea', rows: 3, required: true, maxLength: 400, help: 'Shown in the landing-page carousel, the secret note and the gift box.' },
  { name: 'is_published', label: 'Published', type: 'switch', onLabel: 'Visible on the website', offLabel: 'Hidden (draft)' },
]

export default function MessagesManager() {
  return (
    <CollectionManager
      table="cute_messages"
      title="Cute messages"
      description="Short affectionate lines that rotate on the landing page and pop out of surprises."
      noun="message"
      emptyIcon={MessageSquareHeart}
      fields={fields}
      itemTitle={(row) => row.message}
      renderPreview={(values) => (
        <div className="card-paper px-4 py-6 text-center">
          <p className="text-[0.65rem] font-extrabold tracking-[0.2em] text-rose uppercase">A little reminder</p>
          <p className="mt-2 font-hand text-2xl leading-tight text-ink">“{values.message || '…'}”</p>
        </div>
      )}
    />
  )
}
