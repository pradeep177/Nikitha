import ContentEditor from '../ContentEditor'
import SmartImage from '@/components/SmartImage'
import { MediaThumb, ResolvedMedia } from '@/components/admin/MediaPreview'
import { personalize } from '@/app/chapters'
import { DEFAULT_FINAL_SURPRISE, SURPRISE_TYPES } from '@/lib/defaults'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const fields = [
  { name: 'surprise_type', label: 'Type of surprise', type: 'select', required: true, options: SURPRISE_TYPES.map((t) => ({ value: t.id, label: t.label })) },
  { name: 'h-before', type: 'heading', label: 'Before opening' },
  { name: 'heading', label: 'Page heading', maxLength: 120, full: false },
  { name: 'button_label', label: 'Button label', maxLength: 60, full: false },
  { name: 'intro', label: 'Intro line', maxLength: 300 },
  { name: 'h-after', type: 'heading', label: 'The reveal' },
  { name: 'title', label: 'Title', maxLength: 120 },
  { name: 'message', label: 'Final message', type: 'textarea', rows: 7, required: true, maxLength: 5000, help: 'Leave an empty line between paragraphs. {name} becomes her name.' },
  { name: 'signoff', label: 'Sign-off', maxLength: 120, placeholder: 'Always yours' },
  {
    name: 'image_path',
    label: 'Photograph',
    type: 'media',
    media: { bucket: 'private-media', folder: 'surprise', kind: 'image' },
    when: (v) => v.surprise_type === 'photo',
  },
  { name: 'image_alt', label: 'Photo description', maxLength: 300, when: (v) => v.surprise_type === 'photo' },
  {
    name: 'collage_paths',
    label: 'Collage photos (up to 6)',
    type: 'collage',
    media: { bucket: 'private-media', folder: 'surprise', kind: 'image', max: 6, maxDimension: 1600 },
    when: (v) => v.surprise_type === 'collage',
  },
  {
    name: 'details',
    label: 'Details',
    type: 'textarea',
    rows: 4,
    maxLength: 2000,
    when: (v) => v.surprise_type === 'date' || v.surprise_type === 'gift',
    help: 'Describe the plan or the gift — only what is real.',
  },
  {
    name: 'video_path',
    label: 'Video file (mp4 / webm)',
    type: 'media',
    media: { bucket: 'private-media', folder: 'surprise', kind: 'video' },
    when: (v) => v.surprise_type === 'video',
  },
  { name: 'video_url', label: '…or a video link', type: 'url', placeholder: 'https://', when: (v) => v.surprise_type === 'video' },
]

function Preview({ values, name }) {
  return (
    <div className="card-paper px-4 py-6 text-center">
      <p className="font-hand text-3xl font-bold text-berry-deep">{personalize(values.title, name)}</p>
      <p className="mt-2 line-clamp-[8] font-hand text-lg leading-snug whitespace-pre-line text-ink">{personalize(values.message, name)}</p>
      {values.surprise_type === 'photo' && (
        <div className="mx-auto mt-3 w-32 rotate-2 rounded bg-white p-2 shadow-card">
          <ResolvedMedia bucket="private-media" path={values.image_path}>
            {(url) => <SmartImage src={url} alt="" aspect="4/5" placeholderLabel="Photo" />}
          </ResolvedMedia>
        </div>
      )}
      {values.surprise_type === 'collage' && values.collage_paths?.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {values.collage_paths.map((path, i) => (
            <MediaThumb key={path} bucket="private-media" path={path} seed={i} className="aspect-square w-full" />
          ))}
        </div>
      )}
      {(values.surprise_type === 'date' || values.surprise_type === 'gift') && values.details && (
        <p className="mt-3 rounded-2xl bg-butter/70 p-3 text-left font-hand text-lg leading-snug">{values.details}</p>
      )}
      {values.signoff && <p className="mt-3 font-hand text-xl text-rose">{values.signoff} ♡</p>}
    </div>
  )
}

export default function SurpriseManager() {
  const { settings } = useSiteSettings()
  return (
    <ContentEditor
      table="final_surprise"
      title="Final surprise"
      description="The last chapter: a gift box that opens to reveal this. Don’t describe anything that isn’t real yet ♡"
      fields={fields}
      defaults={DEFAULT_FINAL_SURPRISE}
      renderPreview={(values) => <Preview values={values} name={settings.her_name} />}
    />
  )
}
