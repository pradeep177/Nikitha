import { motion } from 'framer-motion'
import Planet from './illustrations/Planet'

/** Gentle loading indicator: a bobbing planet with a soft message. */
export default function LoadingState({ message = 'Gathering little moments…', fullPage = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 px-6 text-center ${fullPage ? 'min-h-dvh' : 'py-20'}`}
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Planet className="size-20" />
      </motion.div>
      <p className="font-hand text-2xl text-ink-soft">{message}</p>
    </div>
  )
}
