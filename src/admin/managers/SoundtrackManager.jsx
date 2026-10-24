import { Mic, Music } from 'lucide-react'
import CollectionManager from '../CollectionManager'
import { safeExternalUrl } from '@/utils/format'

const fields = [
  {
    name: 'kind',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'song', label: 'Song' },
      { value: 'voice_note', label: 'Voice note' },
    ],
    full: false,
    help: 'Voice notes follow the “voice notes” privacy setting.',
  },
  { name: 'is_published', label: 'Published', type: 'switch', onLabel: 'Visible on the website', offLabel: 'Hidden (draft)', full: false },
  { name: 'title', label: 'Title', required: true, maxLength: 120 },
  { name: 'artist', label: 'Artist (or who recorded it)', maxLength: 120 },
  { name: 'note', label: 'A little note about it', type: 'textarea', rows: 3, maxLength: 800 },
  {
    name: 'external_url',
    label: 'Listen link (Spotify, YouTube, Apple Music…)',
    type: 'url',
    placeholder: 'https://',
    help: 'For songs you don’t own, add a link instead of uploading the music file.',
  },
  {
    name: 'audio_path',
    label: 'Audio file',
    type: 'media',
    media: { bucket: 'audio', folder: (v) => (v.kind === 'voice_note' ? 'voice_notes' : 'soundtrack'), kind: 'audio' },
    help: 'Only upload recordings you made or have permission to share.',
  },
  { name: 'artwork_path', label: 'Artwork (optional)', type: 'media', media: { bucket: 'public-media', folder: 'artwork', kind: 'image' } },
]

export default function SoundtrackManager() {
  return (
    <CollectionManager
      table="soundtrack_tracks"
      title="Soundtrack"
      description="Songs that sound like you two, and little voice notes. Nothing ever autoplays on the website."
      noun="track"
      emptyIcon={Music}
      fields={fields}
      defaults={{ kind: 'song' }}
      itemTitle={(row) => row.title}
      itemSubtitle={(row) => [row.artist, row.external_url ? 'has link' : null, row.audio_path ? 'has audio' : null].filter(Boolean).join(' · ')}
      itemBadges={(row) => [row.kind === 'voice_note' ? 'Voice note' : 'Song']}
      itemThumb={(row) => (row.artwork_path ? { bucket: 'public-media', path: row.artwork_path } : null)}
      renderPreview={(values) => {
        const Icon = values.kind === 'voice_note' ? Mic : Music
        return (
          <div className="card-paper flex gap-3 p-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blush to-lavender">
              <Icon className="size-6 text-berry-deep" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-hand text-2xl leading-tight font-bold text-ink">{values.title || 'Title…'}</p>
              {values.artist && <p className="text-sm font-bold text-rose">{values.artist}</p>}
              {values.note && <p className="mt-1 text-xs text-ink-soft">{values.note}</p>}
              {safeExternalUrl(values.external_url) && <p className="mt-1 text-xs font-bold text-berry-deep">↗ Listen link added</p>}
            </div>
          </div>
        )
      }}
    />
  )
}
