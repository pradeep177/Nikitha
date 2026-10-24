import { MessageCircleHeart } from 'lucide-react'
import CollectionManager from '../CollectionManager'
import PhoneFrame from '@/components/PhoneFrame'
import { ResolvedMedia } from '@/components/admin/MediaPreview'
import { CHAT_COLLECTIONS } from '@/lib/defaults'

const fields = [
  {
    name: 'image_path',
    label: 'Screenshot',
    type: 'media',
    media: { bucket: 'private-media', folder: 'chats', kind: 'image', maxDimension: 2600, dimensions: { width: 'image_width', height: 'image_height' } },
    help: 'Stored privately — only visible to people allowed to see the Chats chapter.',
  },
  { name: 'caption', label: 'Caption', maxLength: 300 },
  { name: 'alt_text', label: 'Screenshot description (for screen readers)', maxLength: 300 },
  { name: 'chat_date', label: 'Date of the chat', type: 'date', full: false },
  { name: 'collection', label: 'Collection', type: 'select', options: CHAT_COLLECTIONS.map((c) => ({ value: c.id, label: c.label })), full: false },
  { name: 'is_published', label: 'Published', type: 'switch', onLabel: 'Visible in the Chats chapter', offLabel: 'Hidden (draft)' },
]

export default function ChatsManager() {
  return (
    <CollectionManager
      table="chat_screenshots"
      title="Chat screenshots"
      description="Little windows into your conversations. Only real screenshots you upload are shown — nothing is generated."
      noun="screenshot"
      emptyIcon={MessageCircleHeart}
      fields={fields}
      itemTitle={(row) => row.caption || 'Untitled screenshot'}
      itemSubtitle={(row) => CHAT_COLLECTIONS.find((c) => c.id === row.collection)?.label}
      itemThumb={(row) => (row.image_path ? { bucket: 'private-media', path: row.image_path } : null)}
      renderPreview={(values) => (
        <div className="mx-auto max-w-[11rem] text-center">
          <ResolvedMedia bucket="private-media" path={values.image_path}>
            {(url) => <PhoneFrame src={url} />}
          </ResolvedMedia>
          <p className="mt-2 font-hand text-lg leading-tight text-ink">{values.caption}</p>
        </div>
      )}
    />
  )
}
