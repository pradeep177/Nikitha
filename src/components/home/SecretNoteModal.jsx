import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import Modal from '../Modal'
import HeartBurst from '../HeartBurst'
import GiftBox from '../GiftBox'
import { pickRandom } from '@/utils/format'

/** "There's something for you..." — reveals a random message from the collection. */
export default function SecretNoteModal({ open, onClose, messages }) {
  const [note, setNote] = useState(null)
  const [burst, setBurst] = useState(0)
  const [lastOpen, setLastOpen] = useState(false)

  // Pick a fresh note each time the modal opens (derived during render, no effect needed).
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setNote(pickRandom(messages))
      setBurst((b) => b + 1)
    }
  }

  const another = () => {
    setNote((current) => pickRandom(messages, current))
    setBurst((b) => b + 1)
  }

  return (
    <Modal open={open} onClose={onClose} title="A little note for you ♡">
      <div className="relative flex flex-col items-center text-center">
        <div className="relative">
          <GiftBox open className="w-28" />
          <HeartBurst trigger={burst} count={12} spread={80} />
        </div>
        <div className="mt-2 min-h-28 w-full rounded-3xl bg-blush/60 px-5 py-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={note?.id ?? 'none'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="font-hand text-3xl leading-tight text-ink"
              aria-live="polite"
            >
              {note ? note.message : 'Little notes are on their way ♡'}
            </motion.p>
          </AnimatePresence>
        </div>
        {messages.length > 1 && (
          <button type="button" onClick={another} className="btn btn-soft mt-5">
            <RefreshCw className="size-4" aria-hidden="true" />
            Another one, please
          </button>
        )}
      </div>
    </Modal>
  )
}
