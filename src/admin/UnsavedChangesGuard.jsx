import { useEffect } from 'react'
import { useBlocker } from 'react-router'
import Modal from '@/components/Modal'

/**
 * Warns before losing unsaved edits — both for in-app navigation
 * (React Router blocker) and for closing/reloading the tab (beforeunload).
 */
export default function UnsavedChangesGuard({ when }) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    if (!when) return undefined
    const handler = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [when])

  return (
    <Modal open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()} title="Leave without saving?" showClose={false}>
      <p className="text-ink-soft">You have unsaved changes. If you leave now, they'll be lost.</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => blocker.reset?.()} className="btn btn-soft" data-autofocus>
          Keep editing
        </button>
        <button type="button" onClick={() => blocker.proceed?.()} className="btn bg-ink text-white hover:bg-ink/85">
          Discard changes
        </button>
      </div>
    </Modal>
  )
}
