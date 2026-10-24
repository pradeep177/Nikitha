import ContentEditor from '../ContentEditor'
import SmartImage from '@/components/SmartImage'
import { personalize } from '@/app/chapters'
import { DEFAULT_HERO } from '@/lib/defaults'
import { mediaUrl } from '@/lib/storage'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const NAME_HELP = 'Tip: {name} is replaced with her name from Settings.'

const fields = [
  { name: 'h-words', type: 'heading', label: 'Words' },
  { name: 'label', label: 'Small label above the heading', maxLength: 120 },
  { name: 'heading', label: 'Main heading', required: true, maxLength: 120, help: NAME_HELP },
  { name: 'message', label: 'Welcome message', type: 'textarea', rows: 4, maxLength: 1000, help: NAME_HELP },
  { name: 'affection_line', label: 'Handwritten affectionate line', type: 'textarea', rows: 2, maxLength: 400 },
  { name: 'h-photo', type: 'heading', label: 'Her photograph' },
  { name: 'photo_path', label: 'Hero photo', type: 'media', media: { bucket: 'public-media', folder: 'hero', kind: 'image' }, help: 'Shown in a Polaroid frame on the landing page. If empty, a soft illustration is shown instead.' },
  { name: 'photo_alt', label: 'Photo description (for screen readers)', maxLength: 200 },
  { name: 'photo_caption', label: 'Handwritten caption under the photo', maxLength: 160 },
  { name: 'h-buttons', type: 'heading', label: 'Buttons & hints' },
  { name: 'primary_cta', label: 'Main button', maxLength: 80, full: false },
  { name: 'secondary_cta', label: 'Surprise button', maxLength: 80, full: false },
  { name: 'scroll_hint', label: 'Scroll invitation', maxLength: 120 },
]

function Preview({ values, name }) {
  return (
    <div className="space-y-3 text-center">
      {values.label && <span className="sticker">{values.label}</span>}
      <p className="font-hand text-4xl leading-none font-bold text-ink">{personalize(values.heading, name)}</p>
      <div className="mx-auto w-40 rotate-2 rounded bg-white p-2 pb-3 shadow-card">
        <SmartImage src={mediaUrl('public-media', values.photo_path)} alt="" aspect="4/5" placeholderLabel="Her photo" />
        <p className="mt-1 font-hand text-sm leading-tight text-ink-soft">{values.photo_caption}</p>
      </div>
      <p className="line-clamp-4 text-xs text-ink-soft">{personalize(values.message, name)}</p>
      <p className="font-hand text-lg leading-tight text-berry-deep">{values.affection_line}</p>
      <div className="flex flex-col gap-1.5">
        <span className="rounded-full bg-berry-deep px-3 py-1.5 text-xs font-bold text-white">{values.primary_cta}</span>
        <span className="rounded-full border border-blush-deep px-3 py-1.5 text-xs font-bold text-berry-deep">{values.secondary_cta}</span>
      </div>
    </div>
  )
}

export default function LandingManager() {
  const { settings } = useSiteSettings()
  return (
    <ContentEditor
      table="hero_content"
      title="Landing page"
      description="The very first thing she sees. Edit the welcome words, her photo and the buttons."
      fields={fields}
      defaults={DEFAULT_HERO}
      renderPreview={(values) => <Preview values={values} name={settings.her_name} />}
    />
  )
}
