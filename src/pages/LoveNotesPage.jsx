import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Shuffle } from 'lucide-react'
import PageShell from '@/components/PageShell'
import ContentState from '@/components/ContentState'
import HeartBurst from '@/components/HeartBurst'
import PlaceholderBadge from '@/components/PlaceholderBadge'
import { HeartShape } from '@/components/illustrations/Doodles'
import { useContent } from '@/hooks/useContent'
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

function LoveNotes({ notes }) {
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

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-5">
      <div className="mb-8 flex justify-center">
        <motion.button type="button" onClick={another} className="btn btn-primary" whileTap={{ scale: 0.95 }}>
          <Shuffle className="size-4" aria-hidden="true" />
          Give me another reason
        </motion.button>
      </div>
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
  return (
    <PageShell chapterId="reasons">
      <ContentState
        query={query}
        loadingMessage="Writing little notes…"
        empty={{ icon: Heart, title: 'The notes are still being written', message: 'A whole collection of reasons is on its way ♡' }}
      >
        {(notes) => <LoveNotes notes={notes} />}
      </ContentState>
    </PageShell>
  )
}
