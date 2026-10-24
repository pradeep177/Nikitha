import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { OctagonAlert } from 'lucide-react'
import HeartBurst from '../HeartBurst'
import Planet from '../illustrations/Planet'
import { HeartShape, Sparkle } from '../illustrations/Doodles'
import { seededRandom } from '@/utils/random'

const LABELS = ['Do not press this button.', 'Seriously. Do not.', 'Okay, this is the last time…', 'You never listen, do you?']
const SURPRISES = ['loading', 'burst', 'stickers', 'kiss']

function FakeLoading({ onDone }) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true)
      onDone?.()
    }, 2600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="w-full">
      <p className="text-sm font-bold text-ink-soft">{done ? 'Error 143:' : 'Deleting all of the love…'}</p>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-blush">
        <motion.div
          className="h-full rounded-full bg-berry"
          initial={{ width: '0%' }}
          animate={{ width: done ? '100%' : ['0%', '64%', '91%', '99%'] }}
          transition={{ duration: 2.4, times: [0, 0.4, 0.8, 1] }}
        />
      </div>
      {done && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-hand text-2xl text-ink">
          Too much love to delete. Please try again never ♡
        </motion.p>
      )}
    </div>
  )
}

function StickerStorm({ seed, onClose }) {
  const rand = seededRandom(seed)
  const stickers = Array.from({ length: 16 }, (_, i) => ({
    left: 4 + rand() * 86,
    top: 6 + rand() * 80,
    rotate: (rand() - 0.5) * 50,
    size: 48 + rand() * 46,
    delay: i * 0.06,
    kind: i % 3,
  }))

  useEffect(() => {
    const t = setTimeout(onClose, 3200)
    return () => clearTimeout(t)
  }, [onClose])

  return createPortal(
    <motion.button
      type="button"
      onClick={onClose}
      className="fixed inset-0 z-[60] cursor-pointer bg-cream/40 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-label="Close the sticker surprise"
    >
      {stickers.map((s, i) => (
        <motion.span
          key={i}
          className="absolute drop-shadow-lg"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          initial={{ scale: 0, rotate: s.rotate - 40 }}
          animate={{ scale: 1, rotate: s.rotate }}
          transition={{ delay: s.delay, type: 'spring', stiffness: 300, damping: 12 }}
        >
          {s.kind === 0 ? (
            <HeartShape className="size-full text-berry" />
          ) : s.kind === 1 ? (
            <Sparkle className="size-full text-butter-deep" />
          ) : (
            <Planet className="size-full" />
          )}
        </motion.span>
      ))}
      <span className="absolute inset-x-0 bottom-[12%] mx-auto w-fit rounded-full bg-paper px-5 py-2 font-hand text-3xl text-ink shadow-lift">
        You've been stickered ♡
      </span>
    </motion.button>,
    document.body,
  )
}

/** Feature D — the mystery button that absolutely should not be pressed. */
export default function MysteryButton({ onSound }) {
  const [presses, setPresses] = useState(0)
  const [active, setActive] = useState(null)
  const surprise = presses ? SURPRISES[(presses - 1) % SURPRISES.length] : null
  const closeStickers = useCallback(() => setActive(null), [])

  const press = () => {
    setPresses((p) => p + 1)
    setActive(SURPRISES[presses % SURPRISES.length])
    onSound?.('sparkle')
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <motion.button
          type="button"
          onClick={press}
          disabled={active === 'stickers'}
          whileHover={{ scale: 1.04, rotate: -1 }}
          whileTap={{ scale: 0.92 }}
          className="relative inline-flex min-h-16 items-center gap-2 rounded-full border-b-[6px] border-ink/40 bg-berry-deep px-7 py-4 text-lg font-extrabold text-white shadow-lift active:border-b-2"
        >
          <OctagonAlert className="size-5" aria-hidden="true" />
          {LABELS[Math.min(presses, LABELS.length - 1)]}
        </motion.button>
        <HeartBurst trigger={surprise === 'burst' ? presses : 0} count={22} spread={150} />
      </div>

      <div className="mt-5 grid min-h-24 w-full place-items-center rounded-3xl bg-lavender/50 px-4 py-4" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div key={presses} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full">
            {!surprise && <p className="text-sm font-bold text-ink-soft">Whatever you do… don't.</p>}
            {surprise === 'loading' && <FakeLoading />}
            {surprise === 'burst' && <p className="font-hand text-2xl text-ink">I told you not to press it! Now you're stuck with me ♡</p>}
            {surprise === 'stickers' && <p className="font-hand text-2xl text-ink">Oops. Sticker explosion. Totally your fault.</p>}
            {surprise === 'kiss' && <p className="font-hand text-2xl text-ink">Okay fine, you win. Here's a virtual forehead kiss ♡</p>}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>{active === 'stickers' && <StickerStorm seed={presses} onClose={closeStickers} />}</AnimatePresence>
    </div>
  )
}
