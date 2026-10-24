import { Camera } from 'lucide-react'
import CollectionManager from '../CollectionManager'
import SmartImage from '@/components/SmartImage'
import { mediaUrl } from '@/lib/storage'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { personalize } from '@/app/chapters'

const PLACES = [
  { name: 'show_on_landing', label: 'Landing page photo stack', short: 'Landing' },
  { name: 'show_in_ribbon', label: 'Home page photo ribbon (“Look at you ♡”)', short: 'Ribbon' },
  { name: 'show_in_chapters', label: 'Beside the chapter titles', short: 'Chapters' },
  { name: 'show_on_reasons', label: 'Pinned on the Reasons page', short: 'Reasons' },
  { name: 'show_on_surprise', label: 'Final Surprise reveal', short: 'Surprise' },
  {
    name: 'show_on_soundtrack',
    label: 'Full-screen page backgrounds (Soundtrack, Open When, Quiz, Final Surprise, “Lost” page)',
    short: 'Backgrounds',
  },
]

const fields = [
  {
    name: 'image_path',
    label: 'Photo',
    type: 'media',
    required: true,
    media: { bucket: 'public-media', folder: 'her', kind: 'image', maxDimension: 2000, dimensions: { width: 'image_width', height: 'image_height' } },
    help: 'Portrait photos look best (they are shown in Polaroid frames). Large photos are resized to save space.',
  },
  { name: 'caption', label: 'Handwritten caption (optional)', maxLength: 160, placeholder: 'e.g. that smile ♡', help: 'Tip: {name} is replaced with her name.' },
  { name: 'alt_text', label: 'Photo description (for screen readers)', maxLength: 300 },
  { name: 'h-places', type: 'heading', label: 'Where should this photo appear?' },
  ...PLACES.map((p) => ({ name: p.name, label: p.label, type: 'switch', onLabel: 'Yes', offLabel: 'No', full: false })),
  { name: 'is_published', label: 'Published', type: 'switch', onLabel: 'Visible on the website', offLabel: 'Hidden (draft)' },
]

const defaults = Object.fromEntries(PLACES.map((p) => [p.name, true]))

export default function HerPhotosManager() {
  const { settings } = useSiteSettings()
  const name = settings.her_name
  return (
    <CollectionManager
      table="her_photos"
      title="Her photos"
      description="Extra photos of her shown around the site. The landing-page photo (set in Landing page) always comes first in the stack; these follow in the order shown here. The home-page ribbon appears once at least 3 photos are ticked for it."
      noun="photo"
      emptyIcon={Camera}
      fields={fields}
      defaults={defaults}
      itemTitle={(row) => personalize(row.caption, name) || 'Untitled photo'}
      itemSubtitle={(row) => {
        const on = PLACES.filter((p) => row[p.name] !== false).map((p) => p.short)
        return on.length ? `Shows on: ${on.join(', ')}` : 'Not shown anywhere yet'
      }}
      itemThumb={(row) => (row.image_path ? { bucket: 'public-media', path: row.image_path } : null)}
      renderPreview={(values) => (
        <div className="mx-auto w-44 rotate-2 rounded-md bg-white p-2 pb-3 shadow-card">
          <SmartImage src={mediaUrl('public-media', values.image_path)} alt="" aspect="4/5" placeholderLabel="Her photo" />
          <p className="mt-1.5 text-center font-hand text-lg leading-tight text-ink-soft">{personalize(values.caption, name)}</p>
        </div>
      )}
    />
  )
}
