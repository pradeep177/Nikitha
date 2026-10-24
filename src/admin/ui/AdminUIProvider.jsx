import { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import Modal from '@/components/Modal'
import { AdminUIContext } from './adminUiContext'

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info }
const TONES = {
  success: 'border-butter-deep bg-butter',
  error: 'border-lavender-deep bg-lavender',
  info: 'border-blush-deep bg-paper',
}

/** Provides toast notifications and a promise-based confirmation dialog to admin pages. */
export default function AdminUIProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [dialog, setDialog] = useState(null)
  const resolver = useRef(null)
  const nextId = useRef(0)

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const push = useCallback(
    (type, message) => {
      nextId.current += 1
      const id = nextId.current
      setToasts((list) => [...list.slice(-3), { id, type, message }])
      setTimeout(() => dismiss(id), type === 'error' ? 7000 : 3500)
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  )

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve
        setDialog({ confirmLabel: 'Confirm', cancelLabel: 'Cancel', ...options })
      }),
    [],
  )

  const answer = (value) => {
    resolver.current?.(value)
    resolver.current = null
    setDialog(null)
  }

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm])

  return (
    <AdminUIContext.Provider value={value}>
      {children}

      <Modal open={!!dialog} onClose={() => answer(false)} title={dialog?.title ?? ''} showClose={false}>
        {dialog && (
          <div>
            {dialog.message && <p className="text-ink-soft">{dialog.message}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => answer(false)} className="btn btn-soft" data-autofocus>
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => answer(true)}
                className={`btn ${dialog.danger ? 'bg-ink text-white hover:bg-ink/85' : 'btn-primary'}`}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className={`pointer-events-auto flex w-full max-w-md items-start gap-2 rounded-2xl border px-4 py-3 text-sm text-ink shadow-lift ${TONES[t.type]}`}
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-berry-deep" aria-hidden="true" />
                <p className="flex-1">{t.message}</p>
                <button type="button" onClick={() => dismiss(t.id)} className="-m-1 grid size-7 place-items-center rounded-full hover:bg-white/60" aria-label="Dismiss">
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </AdminUIContext.Provider>
  )
}
