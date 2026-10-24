import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Mail, X } from 'lucide-react'
import PageShell from '@/components/PageShell'
import ContentState from '@/components/ContentState'
import Envelope from '@/components/Envelope'
import SmartImage from '@/components/SmartImage'
import AudioPlayer from '@/components/AudioPlayer'
import PlaceholderBadge from '@/components/PlaceholderBadge'
import { useContent } from '@/hooks/useContent'
import { useDialog } from '@/hooks/useDialog'

const TINTS = ['blush', 'peach', 'lavender', 'butter']

function LetterDialog({ letter, tint, onClose }) {
  const panelRef = useRef(null)
  const reduce = useReducedMotion()
  const [stage, setStage] = useState(reduce ? 'letter' : 'envelope')
  useDialog(true, onClose, panelRef)

  useEffect(() => {
    if (reduce) return undefined
    const t = setTimeout(() => setStage('letter'), 1500)
    return () => clearTimeout(t)
  }, [reduce])

  return createPortal(
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="absolute inset-0 bg-ink/30"
        initial={{ backdropFilter: 'blur(0px)' }}
        animate={{ backdropFilter: 'blur(6px)' }}
        transition={{ duration: 0.8 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="letter-title"
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg outline-none"
      >
        <AnimatePresence mode="wait">
          {stage === 'envelope' ? (
            <motion.div key="env" className="mx-auto w-[min(86vw,22rem)]" initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.1, y: -20 }}>
              <h2 id="letter-title" className="sr-only">
                {letter.title}
              </h2>
              <Envelope tint={tint} open>
                <div className="p-3 font-hand text-lg leading-tight text-ink-soft">{letter.title}…</div>
              </Envelope>
            </motion.div>
          ) : (
            <motion.article
              key="letter"
              initial={{ opacity: 0, y: 60, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="relative max-h-[86dvh] overflow-y-auto rounded-[1.5rem] bg-paper p-6 shadow-lift sm:p-8"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent 0 35px, color-mix(in srgb, var(--color-blush-deep) 45%, transparent) 35px 36px)',
                backgroundPositionY: '72px',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-paper/90 text-ink-soft hover:text-berry-deep"
                aria-label="Close letter"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
              <h2 id="letter-title" className="pr-10 font-hand text-4xl leading-tight font-bold text-berry-deep">
                {letter.title}
              </h2>
              <PlaceholderBadge show={letter.is_placeholder} label="Placeholder letter" className="mt-2" />
              {letter.image_url && <SmartImage src={letter.image_url} alt="" aspect="4/3" className="mt-4 rounded-xl" />}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.8 }}
                className="mt-4 font-hand text-[1.75rem] leading-[36px] whitespace-pre-line text-ink"
              >
                {letter.message}
              </motion.p>
              {letter.audio_url && (
                <div className="mt-5">
                  <AudioPlayer track={{ title: 'A little voice note', audio_url: letter.audio_url }} compact />
                </div>
              )}
              <p className="mt-6 text-right font-hand text-2xl text-rose">— with love ♡</p>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </motion.div>,
    document.body,
  )
}

function Letters({ letters }) {
  const [openId, setOpenId] = useState(null)
  const openIndex = letters.findIndex((l) => l.id === openId)

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-5">
      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 min-[440px]:grid-cols-2 lg:grid-cols-3">
        {letters.map((letter, i) => (
          <motion.li
            key={letter.id}
            initial={{ opacity: 0, y: 30, rotate: i % 2 ? 3 : -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15, delay: (i % 3) * 0.07 }}
          >
            <motion.button
              type="button"
              onClick={() => setOpenId(letter.id)}
              className="group block w-full text-left"
              whileHover={{ y: -6, rotate: 0 }}
              whileTap={{ scale: 0.97 }}
              aria-haspopup="dialog"
            >
              <Envelope tint={TINTS[i % TINTS.length]} />
              <span className="mt-3 block px-1 text-center font-hand text-2xl leading-tight font-bold text-ink group-hover:text-berry-deep">
                {letter.title}
              </span>
            </motion.button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {openIndex >= 0 && (
          <LetterDialog
            key={openId}
            letter={letters[openIndex]}
            tint={TINTS[openIndex % TINTS.length]}
            onClose={() => setOpenId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function OpenWhenPage() {
  const query = useContent('listLetters')
  return (
    <PageShell chapterId="open-when">
      <ContentState
        query={query}
        loadingMessage="Sealing the envelopes…"
        empty={{ icon: Mail, title: 'The letters are still being written', message: 'Little letters for every kind of day will be waiting here ♡' }}
      >
        {(letters) => <Letters letters={letters} />}
      </ContentState>
    </PageShell>
  )
}
