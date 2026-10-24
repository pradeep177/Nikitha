import { motion } from 'framer-motion'
import { HeartShape } from './illustrations/Doodles'

/**
 * Illustrated envelope built from layered shapes:
 * back → letter (children) → front pocket → flap (+ heart seal).
 */
export default function Envelope({ tint = 'blush', open = false, children, className = '', sealed = true }) {
  const vars = {
    '--env': `var(--color-${tint})`,
    '--env-deep': `var(--color-${tint}-deep)`,
  }

  return (
    <div className={`relative w-full ${className}`} style={{ ...vars, aspectRatio: '4/3', perspective: 900 }}>
      <div className="absolute inset-0 rounded-2xl bg-[var(--env-deep)] shadow-card" />

      {children && (
        <motion.div
          className="absolute inset-x-[7%] top-[6%] bottom-[6%] z-[1] rounded-lg bg-paper shadow-sm"
          initial={false}
          animate={{ y: open ? '-58%' : '0%' }}
          transition={{ delay: open ? 0.45 : 0, type: 'spring', stiffness: 120, damping: 18 }}
        >
          {children}
        </motion.div>
      )}

      <div
        className="absolute inset-0 z-[2] rounded-2xl bg-[var(--env)]"
        style={{ clipPath: 'polygon(0 34%, 50% 70%, 100% 34%, 100% 100%, 0 100%)' }}
      />
      <div
        className="absolute inset-0 z-[2] rounded-2xl bg-[color-mix(in_srgb,var(--env-deep)_35%,var(--env))]"
        style={{ clipPath: 'polygon(0 100%, 50% 58%, 100% 100%)' }}
      />

      <motion.div
        className="absolute inset-x-0 top-0 z-[3] h-[66%] origin-top rounded-t-2xl bg-[color-mix(in_srgb,var(--env-deep)_60%,var(--env))]"
        style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', transformStyle: 'preserve-3d' }}
        initial={false}
        animate={open ? { rotateX: 180, transitionEnd: { zIndex: 0 } } : { rotateX: 0, zIndex: 3 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      />

      {sealed && (
        <motion.span
          className="absolute top-[54%] left-1/2 z-[4] grid size-[18%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-berry-deep shadow-soft"
          initial={false}
          animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
          transition={{ duration: 0.25 }}
          aria-hidden="true"
        >
          <HeartShape className="size-1/2 text-white" />
        </motion.span>
      )}
    </div>
  )
}
