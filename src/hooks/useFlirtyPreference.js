import { useCallback, useSyncExternalStore } from 'react'

const KEY = 'olu:flirty-paused'
const listeners = new Set()

function read() {
  try {
    return window.localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

function subscribe(callback) {
  listeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

/** The visitor's own "pause the pop-ups" choice, remembered on this device and shared across components. */
export function useFlirtyPreference() {
  const paused = useSyncExternalStore(subscribe, read, () => false)
  const setPaused = useCallback((value) => {
    try {
      if (value) window.localStorage.setItem(KEY, '1')
      else window.localStorage.removeItem(KEY)
    } catch {
      // Storage blocked (private mode) — the choice just won't be remembered.
    }
    listeners.forEach((listener) => listener())
  }, [])
  return { paused, setPaused }
}
