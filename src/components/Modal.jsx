import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useDialog } from '@/hooks/useDialog'

/**
 * Accessible, animated modal dialog.
 * variant: "center" (default) | "sheet" (slides up from the bottom on mobile)
 */
export default function Modal({
  open,
  onClose,
  title,
  hideTitle = false,
  children,
  variant = 'center',
  panelClassName = '',
  showClose = true,
}) {
  const panelRef = useRef(null)
  const titleId = useId()
  useDialog(open, onClose, panelRef)

  const isSheet = variant === 'sheet'

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 z-50 flex justify-center ${isSheet ? 'items-end md:items-center' : 'items-center'} p-0 md:p-6`}
        >
          <motion.div
            className="absolute inset-0 bg-ink/35 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`relative z-10 max-h-[92dvh] w-full overflow-y-auto overscroll-contain bg-paper shadow-lift outline-none ${
              isSheet ? 'safe-bottom rounded-t-[2rem] md:max-w-3xl md:rounded-[2rem]' : 'mx-4 max-w-lg rounded-[2rem]'
            } ${panelClassName}`}
            initial={isSheet ? { y: 60, opacity: 0 } : { y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={isSheet ? { y: 60, opacity: 0 } : { y: 16, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <h2 id={titleId} className={hideTitle ? 'sr-only' : 'font-hand text-3xl font-bold text-ink'}>
                {title}
              </h2>
              {showClose && (
                <button type="button" onClick={onClose} className="btn btn-ghost -mt-1 -mr-2 size-12 shrink-0 p-0" aria-label="Close">
                  <X className="size-6" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="px-6 pt-2 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
