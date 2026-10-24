import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Shuffle } from 'lucide-react'
import PageShell from '@/components/PageShell'
import ContentState from '@/components/ContentState'
import HeartBurst from '@/components/HeartBurst'
import PlaceholderBadge from '@/components/PlaceholderBadge'
import Polaroid from '@/components/Polaroid'
import { HeartShape } from '@/components/illustrations/Doodles'
import { useContent } from '@/hooks/useContent'
import { useHerPhotos } from '@/hooks/useHerPhotos'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useSound } from '@/hooks/useSound'

const FRONTS = ['bg-blush', 'bg-peach', 'bg-lavender', 'bg-butter']
const face = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }

function NoteCard({ note, index, flipped, onToggle, burst, cardRef }) {
  return (
    <motion.li
      ref={cardRef}
      className="relative scroll-mt-28"
      style={{ perspective: 1100 }}
      initial={{ opacity: 0, y: 30, rotate: index % 2 ? 2 : -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: 'spring', stiffness: 110, damping: 16, delay: (index % 3) * 0.07 }}
    >
      <motion.button
        type="button"
        onClick={onToggle}
        aria-expanded={flipped}
        aria-label={flipped ? `Close note: ${note.title}` : `Open note ${index + 1}: ${note.title}`}
        className="relative block h-64 w-full rounded-[1.75rem] text-left"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      >
        <span
          className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 shadow-card ${FRONTS[index % FRONTS.length]}`}
          style={face}
          aria-hidden={flipped}
        >
          <span className="flex items-start justify-between">
            <span className="font-hand text-2xl font-bold text-rose">No. {String(index + 1).padStart(2, '0')}</span>
            <PlaceholderBadge show={note.is_placeholder} label="Example" />
          </span>
          <HeartShape className="absolute -right-6 -bottom-6 size-32 rotate-[-12deg] text-white/50" />
          <span className="relative">
            <span className="block font-hand text-[2rem] leading-tight font-bold text-ink">{note.title}</span>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-berry-deep">
              <Heart className="size-4" aria-hidden="true" /> Tap to open
            </span>
          </span>
        </span>

        <span
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] border-2 border-blush-deep bg-paper p-6 shadow-lift"
          style={{ ...face, transform: 'rotateY(180deg)' }}
          aria-hidden={!flipped}
        >
          <span className="text-xs font-extrabold tracking-[0.2em] text-rose uppercase">Reason no. {index + 1}</span>
          <span className="mt-3 flex-1 overflow-y-auto font-hand text-[1.7rem] leading-snug text-ink">{note.message}</span>
          <span className="mt-2 text-right text-xs font-bold text-ink-soft">tap to close</span>
        </span>
      </motion.button>
      <HeartBurst trigger={burst} count={14} spread={110} />
    </motion.li>
  )
}

function PinnedPhoto({ photos, name }) {
  const [index, setIndex] = useState(0)
  const many = photos.length > 1
  const photo = photos[index % photos.length]
  const card = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={photo.id}
        className="block"
        initial={{ rotateY: 80, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -80, opacity: 0 }}
        transition={{ duration: 0.22 }}
      >
        <Polaroid photo={photo} name={name} seed={index + 3} padding="p-2 pb-2.5" captionClassName="line-clamp-2 pt-1.5 text-lg" sizes="160px" />
      </motion.span>
    </AnimatePresence>
  )

  return (
    <motion.div
      className="relative w-28 shrink-0 sm:w-40"
      style={{ perspective: 800 }}
      initial={{ opacity: 0, scale: 0.6, rotate: -16 }}
      animate={{ opacity: 1, scale: 1, rotate: -4 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 150, damping: 13 }}
    >
      <span className="absolute -top-2 left-1/2 z-20 size-5 -translate-x-1/2 rounded-full bg-berry shadow-md ring-2 ring-white" aria-hidden="true" />
      {many ? (
        <motion.button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % photos.length)}
          whileHover={{ rotate: 3, y: -3 }}
          whileTap={{ scale: 0.96 }}
          aria-label={`Show another photo of ${name}`}
          className="block w-full rounded-md text-left"
        >
          {card}
        </motion.button>
      ) : (
        card
      )}
    </motion.div>
  )
}

function LoveNotes({ notes, photos, name }) {
  const sound = useSound()
  const [flipped, setFlipped] = useState(() => new Set())
  const [bursts, setBursts] = useState({})
  const [lastRandom, setLastRandom] = useState(null)
  const refs = useRef({})

  const celebrate = (id) => {
    setBursts((b) => ({ ...b, [id]: (b[id] ?? 0) + 1 }))
    sound.play('pop')
  }

  const toggle = (id) => {
    setFlipped((set) => {
      const next = new Set(set)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    if (!flipped.has(id)) celebrate(id)
  }

  const another = () => {
    const pool = notes.filter((n) => n.id !== lastRandom)
    const closed = pool.filter((n) => !flipped.has(n.id))
    const pickFrom = closed.length ? closed : pool
    const note = pickFrom[Math.floor(Math.random() * pickFrom.length)] ?? notes[0]
    setLastRandom(note.id)
    setFlipped(new Set([note.id]))
    celebrate(note.id)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    refs.current[note.id]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
  }

  const shuffleButton = (className = '') => (
    <motion.button type="button" onClick={another} className={`btn btn-primary ${className}`} whileTap={{ scale: 0.95 }}>
      <Shuffle className="size-4" aria-hidden="true" />
      Give me another reason
    </motion.button>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-5">
      {photos.length ? (
        <div className="mb-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-5 sm:gap-8">
            <PinnedPhoto photos={photos} name={name} />
            <div className="max-w-xs">
              <p className="font-hand text-[1.9rem] leading-tight text-berry-deep">Reason no. 0? Just look at you ♡</p>
              <p className="mt-1.5 text-sm text-ink-soft">
                Every reason below started with this face.{photos.length > 1 && ' Tap the photo for another one.'}
              </p>
              {shuffleButton('mt-4 hidden sm:inline-flex')}
            </div>
          </div>
          {shuffleButton('sm:hidden')}
        </div>
      ) : (
        <div className="mb-8 flex justify-center">{shuffleButton()}</div>
      )}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note, i) => (
          <NoteCard
            key={note.id}
            note={note}
            index={i}
            flipped={flipped.has(note.id)}
            onToggle={() => toggle(note.id)}
            burst={bursts[note.id] ?? 0}
            cardRef={(el) => {
              refs.current[note.id] = el
            }}
          />
        ))}
      </ul>
    </div>
  )
}

export default function LoveNotesPage() {
  const query = useContent('listLoveNotes')
  const { photos } = useHerPhotos('reasons')
  const { settings } = useSiteSettings()
  return (
    <PageShell chapterId="reasons">
      <ContentState
        query={query}
        loadingMessage="Writing little notes…"
        empty={{ icon: Heart, title: 'The notes are still being written', message: 'A whole collection of reasons is on its way ♡' }}
      >
        {(notes) => <LoveNotes notes={notes} photos={photos} name={settings.her_name} />}
      </ContentState>
    </PageShell>
  )
}
