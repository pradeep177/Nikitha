import { motion } from 'framer-motion'
import { Sparkle } from './illustrations/Doodles'

/**
 * Illustrated gift box. `open` pops the lid off with a glow;
 * changing `wiggleKey` makes it give an excited little shake.
 */
export default function GiftBox({ open = false, wiggleKey = 0, className = 'w-48' }) {
  return (
    <motion.div
      key={wiggleKey}
      className={`relative ${className}`}
      style={{ aspectRatio: '1 / 1' }}
      animate={wiggleKey ? { rotate: [0, -5, 5, -4, 4, 0], scale: [1, 1.04, 1] } : undefined}
      transition={{ duration: 0.55 }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-[18%] rounded-full bg-butter-deep blur-2xl"
        initial={false}
        animate={{ opacity: open ? 0.9 : 0, scale: open ? 1.25 : 0.4 }}
        transition={{ duration: 0.6 }}
      />
      {open &&
        [
          ['left-[12%] top-[18%]', 'size-5', 0.1],
          ['right-[10%] top-[10%]', 'size-6', 0.25],
          ['left-[46%] top-[2%]', 'size-4', 0.4],
          ['right-[22%] top-[34%]', 'size-3', 0.5],
        ].map(([pos, size, delay]) => (
          <motion.span
            key={pos}
            className={`absolute ${pos} text-butter-deep`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: 1, rotate: 45 }}
            transition={{ delay, duration: 0.5 }}
          >
            <Sparkle className={size} />
          </motion.span>
        ))}

      {/* box body */}
      <div className="absolute inset-x-[14%] top-[44%] bottom-[4%] overflow-hidden rounded-t-md rounded-b-2xl bg-berry shadow-lift">
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.28)_18%,transparent_20%)] bg-[length:22px_22px]" />
        <div className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2 bg-butter-deep" />
      </div>

      {/* lid */}
      <motion.div
        className="absolute inset-x-[8%] top-[30%] h-[17%]"
        initial={false}
        animate={open ? { y: '-150%', x: '-18%', rotate: -22, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
        transition={open ? { duration: 0.75, ease: [0.3, 1.4, 0.5, 1] } : { duration: 0.3 }}
      >
        <div className="absolute inset-0 rounded-xl bg-berry-deep shadow-card" />
        <div className="absolute inset-y-0 left-1/2 w-[15%] -translate-x-1/2 bg-butter-deep" />
        <div className="absolute bottom-[86%] left-1/2 h-[95%] w-[34%] -translate-x-full rotate-[-28deg] rounded-[50%] border-[6px] border-butter-deep" />
        <div className="absolute bottom-[86%] left-1/2 h-[95%] w-[34%] rotate-[28deg] rounded-[50%] border-[6px] border-butter-deep" />
        <div className="absolute bottom-[78%] left-1/2 size-[14%] -translate-x-1/2 rounded-full bg-butter-deep" />
      </motion.div>
    </motion.div>
  )
}
