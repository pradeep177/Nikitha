import { useEffect, useState } from 'react'

/** useState that persists to localStorage (silently falls back if storage is blocked). */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initialValue : JSON.parse(raw)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Private browsing or storage disabled — keep the in-memory value only.
    }
  }, [key, value])

  return [value, setValue]
}
