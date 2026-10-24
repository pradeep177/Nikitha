import { useCallback, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useDialog } from '@/hooks/useDialog'

const slide = {
  enter: (dir) => ({ x: dir * 60, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir * -60, opacity: 0, scale: 0.98 }),
}

/**
 * Full-screen gallery viewer with previous/next buttons, arrow keys,
 * swipe on touch screens, Escape / close button and focus management.
 */
export default function Lightbox({ items, index, onClose, onIndexChange, renderMedia, renderCaption, label = 'Photo viewer' }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const [direction, setDirection] = useState(1)
  const open = index !== null && index !== undefined && items[index] !== undefined
  const count = items.length

  const go = useCallback(
    (step) => {
      if (!open || count < 2) return
      setDirection(step)
      onIndexChange((index + step + count) % count)
    },
    [open, count, index, onIndexChange],
  )

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    },
    [go],
  )

  useDialog(open, onClose, panelRef, onKeyDown)
  const item = open ? items[index] : null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex flex-col bg-ink/85 text-white outline-none backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <h2 id={titleId} className="sr-only">
            {label}
          </h2>
          <div className="flex items-center justify-between gap-3 px-3 pt-3 md:px-6 md:pt-5">
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold" aria-live="polite">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="grid size-12 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
              aria-label="Close viewer"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-3 md:px-20">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={item.id ?? index}
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                drag={count > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) go(1)
                  else if (info.offset.x > 70) go(-1)
                }}
                className="flex max-h-full w-full max-w-4xl touch-pan-y items-center justify-center"
              >
                {renderMedia(item, index)}
              </motion.div>
            </AnimatePresence>

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-2 hidden size-12 place-items-center rounded-full bg-white/15 transition hover:bg-white/30 sm:grid md:left-5"
                  aria-label="Previous"
                >
                  <ChevronLeft className="size-7" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-2 hidden size-12 place-items-center rounded-full bg-white/15 transition hover:bg-white/30 sm:grid md:right-5"
                  aria-label="Next"
                >
                  <ChevronRight className="size-7" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          <div className="safe-bottom px-4 pt-1 md:pb-6">
            <div className="mx-auto max-w-2xl text-center">{renderCaption?.(item, index)}</div>
            {count > 1 && (
              <div className="mt-3 flex justify-center gap-3 sm:hidden">
                <button type="button" onClick={() => go(-1)} className="grid size-12 place-items-center rounded-full bg-white/15" aria-label="Previous">
                  <ChevronLeft className="size-6" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => go(1)} className="grid size-12 place-items-center rounded-full bg-white/15" aria-label="Next">
                  <ChevronRight className="size-6" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
