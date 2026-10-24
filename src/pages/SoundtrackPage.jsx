import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, LockKeyhole, Mic, Music, Play } from 'lucide-react'
import PageShell from '@/components/PageShell'
import PhotoBackdrop from '@/components/PhotoBackdrop'
import ContentState from '@/components/ContentState'
import AudioPlayer from '@/components/AudioPlayer'
import PlaceholderBadge from '@/components/PlaceholderBadge'
import SmartImage from '@/components/SmartImage'
import Reveal from '@/components/Reveal'
import SignInForm from '@/components/auth/SignInForm'
import { useAuth } from '@/hooks/useAuth'
import { useContent } from '@/hooks/useContent'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { sectionVisibility } from '@/hooks/useVisibleChapters'
import { safeExternalUrl } from '@/utils/format'

const TINTS = ['from-blush to-lavender', 'from-peach to-blush', 'from-lavender to-butter', 'from-butter to-peach']

function TrackCard({ track, index, active, onPlay }) {
  const link = safeExternalUrl(track.external_url)
  const Icon = track.kind === 'voice_note' ? Mic : Music

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: (index % 3) * 0.06 }}
      className={`card-paper flex gap-4 p-4 transition ${active ? 'ring-3 ring-berry/60' : ''}`}
    >
      <div className={`relative size-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${TINTS[index % TINTS.length]}`}>
        {track.artwork_url ? (
          <SmartImage src={track.artwork_url} alt="" aspect="1/1" className="size-full" />
        ) : (
          <Icon className="absolute inset-0 m-auto size-7 text-berry-deep" aria-hidden="true" />
        )}
        {active && (
          <span className="absolute right-1 bottom-1 flex h-4 items-end gap-0.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1 rounded-full bg-berry-deep"
                animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-hand text-2xl leading-tight font-bold text-ink">{track.title}</h3>
          <PlaceholderBadge show={track.is_placeholder} />
        </div>
        {track.artist && <p className="text-sm font-bold text-rose">{track.artist}</p>}
        {track.note && <p className="mt-1 text-sm whitespace-pre-line text-ink-soft">{track.note}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {track.audio_url && (
            <button type="button" onClick={onPlay} className="btn btn-soft min-h-10 px-4 py-1.5 text-sm">
              <Play className="size-3.5 fill-current" aria-hidden="true" />
              {active ? 'Playing above' : 'Play here'}
            </button>
          )}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-10 px-4 py-1.5 text-sm">
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Listen
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
          {!track.audio_url && !link && <span className="text-xs font-bold text-ink-soft">Link coming soon ♡</span>}
        </div>
      </div>
    </motion.li>
  )
}

function VoiceNotesUnlock() {
  const { settings } = useSiteSettings()
  const { isViewer, isDemo, user } = useAuth()
  if (isDemo || isViewer || sectionVisibility(settings, 'voice_notes') !== 'private') return null
  return (
    <details className="card-paper mt-10 p-5">
      <summary className="flex cursor-pointer items-center gap-2 font-hand text-2xl font-bold text-ink">
        <LockKeyhole className="size-5 text-berry-deep" aria-hidden="true" />
        There are little voice notes just for {settings.her_name} ♡
      </summary>
      <div className="mx-auto mt-4 max-w-sm">
        {user ? (
          <p className="text-sm text-ink-soft">This account can't open the private voice notes.</p>
        ) : (
          <SignInForm submitLabel="Unlock the voice notes" />
        )}
      </div>
    </details>
  )
}

function Soundtrack({ tracks }) {
  const playable = tracks.filter((t) => t.audio_url)
  const [current, setCurrent] = useState({ id: playable[0]?.id ?? null, start: false })
  const currentTrack = tracks.find((t) => t.id === current.id)
  const songs = tracks.filter((t) => t.kind !== 'voice_note')
  const voiceNotes = tracks.filter((t) => t.kind === 'voice_note')

  const play = (track) => {
    setCurrent({ id: track.id, start: true, nonce: Date.now() })
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('now-playing')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' })
  }

  const section = (title, list, offset = 0) =>
    list.length > 0 && (
      <section className="mt-10">
        <h2 className="mb-4 font-hand text-4xl font-bold text-ink">{title}</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i + offset} active={current.id === track.id && current.start} onPlay={() => play(track)} />
          ))}
        </ul>
      </section>
    )

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-5">
      {currentTrack && (
        <Reveal className="scroll-mt-28" y={12}>
          <div id="now-playing" className="scroll-mt-28">
            <p className="mb-2 text-xs font-extrabold tracking-[0.2em] text-rose uppercase">Now playing</p>
            <AudioPlayer key={`${currentTrack.id}-${current.nonce ?? 0}`} track={currentTrack} startPlaying={current.start} />
          </div>
        </Reveal>
      )}
      {section('Our songs', songs)}
      {section('Little voice notes', voiceNotes, songs.length)}
      <VoiceNotesUnlock />
    </div>
  )
}

export default function SoundtrackPage() {
  const { settings } = useSiteSettings()
  const query = useContent('listTracks')
  return (
    <PageShell chapterId="soundtrack" subtitle={settings.soundtrack_intro}>
      <PhotoBackdrop start={0} />
      <ContentState
        query={query}
        loadingMessage="Tuning the little radio…"
        empty={{ icon: Music, title: 'Our soundtrack is still being curated', message: 'Songs and voice notes that sound like us will appear here ♡' }}
      >
        {(tracks) => <Soundtrack tracks={tracks} />}
      </ContentState>
    </PageShell>
  )
}
