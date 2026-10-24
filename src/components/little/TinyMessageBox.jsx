import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import GiftBox from '../GiftBox'
import HeartBurst from '../HeartBurst'
import { pickRandom } from '@/utils/format'

/** Feature A — tap the gift for a tiny random message. */
export default function TinyMessageBox({ messages, onSound }) {
  const [message, setMessage] = useState(null)
  const [wiggle, setWiggle] = useState(0)

  const open = () => {
    setWiggle((w) => w + 1)
    setMessage((current) => pickRandom(messages, current) ?? { id: 'none', message: 'A tiny message is on its way ♡' })
    onSound?.('sparkle')
  }

  return (
    <div className="flex flex-col items-center text-center">
      <button
        type="button"
        onClick={open}
        className="relative rounded-3xl p-2 transition hover:scale-105"
        aria-label={message ? 'Open another tiny message' : 'Open the gift for a tiny message'}
      >
        <GiftBox open={!!message} wiggleKey={wiggle} className="w-36" />
        <HeartBurst trigger={wiggle} count={10} spread={80} />
      </button>
      <div className="mt-3 grid min-h-24 w-full place-items-center rounded-3xl bg-blush/60 px-4 py-4" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={message ? `${message.id}-${wiggle}` : 'hint'}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, delay: message ? 0.25 : 0 }}
            className={message ? 'font-hand text-2xl leading-tight text-ink' : 'text-sm font-bold text-ink-soft'}
          >
            {message ? message.message : 'Tap the gift ♡'}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
