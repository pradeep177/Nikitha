import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), audio[controls], video[controls], [tabindex]:not([tabindex="-1"])'

function getFocusable(root) {
  if (!root) return []
  return [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement)
}

// Stack of open dialogs: only the top-most one reacts to keys and traps focus.
const stack = []
let savedOverflow = ''

/**
 * Shared accessible-dialog behaviour: Escape to close, focus trap,
 * focus restore and body scroll lock. Extra key handlers (e.g. arrow keys
 * in a lightbox) can be passed via `onKeyDown`.
 */
export function useDialog(open, onClose, panelRef, onKeyDown) {
  const onCloseRef = useRef(onClose)
  const onKeyDownRef = useRef(onKeyDown)

  useEffect(() => {
    onCloseRef.current = onClose
    onKeyDownRef.current = onKeyDown
  }, [onClose, onKeyDown])

  useEffect(() => {
    if (!open) return undefined

    const token = {}
    const previouslyFocused = document.activeElement
    if (stack.length === 0) {
      savedOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    stack.push(token)

    const frame = requestAnimationFrame(() => {
      const preferred = panelRef.current?.querySelector('[data-autofocus]')
      ;(preferred ?? panelRef.current)?.focus({ preventScroll: true })
    })

    function handleKey(event) {
      if (stack[stack.length - 1] !== token) return
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current?.()
        return
      }
      onKeyDownRef.current?.(event)
      if (event.key !== 'Tab') return
      const items = getFocusable(panelRef.current)
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      } else if (!panelRef.current?.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKey)
      const index = stack.indexOf(token)
      if (index >= 0) stack.splice(index, 1)
      if (stack.length === 0) document.body.style.overflow = savedOverflow
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) previouslyFocused.focus({ preventScroll: true })
    }
  }, [open, panelRef])
}
