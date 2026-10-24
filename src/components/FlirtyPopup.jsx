import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import AnimatedHeart from './AnimatedHeart'
import HeartBurst from './HeartBurst'
import PlaceholderBadge from './PlaceholderBadge'
import { useContent } from '@/hooks/useContent'
import { useFlirtyPreference } from '@/hooks/useFlirtyPreference'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useSound } from '@/hooks/useSound'

const VISIBLE_MS = 15_000
/** Minimum quiet time after a pop-up closes before the next one may appear. */
const MIN_GAP_MS = 8_000

function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Interval in ms. In development, localStorage 'olu:flirty-test-interval-ms' can shorten it for testing. */
function intervalFor(minutes) {
  if (import.meta.env.DEV) {
    const override = Number(window.localStorage.getItem('olu:flirty-test-interval-ms'))
    if (override > 0) return override
  }
  return Math.min(60, Math.max(1, Number(minutes) || 1)) * 60_000
}

/**
 * Every few minutes (default: every minute) a little card pops up with a flirty line about her.
 * • The interval is measured in real time from one pop-up appearing to the next; if one comes due while
 *   the tab is hidden, it appears as soon as the page is visible again (no backlog).
 * • A pop-up never covers another one or an open dialog, and there's always a short quiet gap after one closes.
 * • Lines are shuffled and don't repeat until all have been shown.
 * • Closes by itself after 15 s (paused while hovered or focused); never steals focus.
 * • Can be switched off in Admin → Settings, or paused by the visitor.
 */
export default function FlirtyPopup() {
  const { settings } = useSiteSettings()
  const { paused, setPaused } = useFlirtyPreference()
  const { data: lines } = useContent('listFlirtyLines')
  const sound = useSound()
  const [current, setCurrent] = useState(null)
  const [hold, setHold] = useState(false)
  const bag = useRef([])
  const lastId = useRef(null)
  const remaining = useRef(VISIBLE_MS)
  const startedAt = useRef(0)
  const playRef = useRef(sound.play)
  const visibleRef = useRef(false)
  const quietUntil = useRef(0)

  useEffect(() => {
    playRef.current = sound.play
  })

  // Track whether a pop-up is showing; when one closes, keep a short quiet gap.
  useEffect(() => {
    if (visibleRef.current && !current) quietUntil.current = performance.now() + MIN_GAP_MS
    visibleRef.current = !!current
  }, [current])

  const enabled = settings.flirty_popups_enabled !== false && !paused && (lines?.length ?? 0) > 0
  const minutes = settings.flirty_interval_minutes

  useEffect(() => {
    if (!enabled) return undefined
    const intervalMs = intervalFor(minutes)
    let elapsed = 0
    let last = performance.now()

    const nextLine = () => {
      if (bag.current.length === 0) {
        bag.current = shuffle(lines)
        if (bag.current.length > 1 && bag.current[0].id === lastId.current) bag.current.push(bag.current.shift())
      }
      const line = bag.current.shift()
      lastId.current = line.id
      return line
    }

    const timer = setInterval(() => {
      const now = performance.now()
      // Real time keeps counting even if the tab is hidden; a due pop-up simply waits until she's looking.
      elapsed += now - last
      last = now
      if (elapsed < intervalMs) return
      if (document.visibilityState !== 'visible') return
      // Wait while a pop-up is still showing, during the quiet gap, or while a dialog is open.
      if (visibleRef.current || now < quietUntil.current) return
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return
      elapsed = 0
      remaining.current = VISIBLE_MS
      const line = nextLine()
      setCurrent({ ...line, key: `${line.id}-${now}` })
      playRef.current('sparkle')
    }, 1000)

    return () => clearInterval(timer)
  }, [enabled, minutes, lines])

  // Auto-close, pausing the countdown while hovered/focused.
  useEffect(() => {
    if (!current || hold) return undefined
    startedAt.current = performance.now()
    const timeout = setTimeout(() => setCurrent(null), Math.max(0, remaining.current))
    return () => {
      clearTimeout(timeout)
      remaining.current -= performance.now() - startedAt.current
    }
  }, [current, hold])

  const close = () => {
    setCurrent(null)
    setHold(false)
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-3 top-[5.5rem] z-[45] flex justify-center md:inset-x-auto md:top-auto md:bottom-6 md:left-6 md:justify-start"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {current && enabled && (
          <motion.aside
            key={current.key}
            aria-label="A little note about you"
            initial={{ opacity: 0, y: -18, scale: 0.94, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={() => setHold(false)}
            className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-blush-deep bg-paper/95 p-4 pr-12 shadow-lift backdrop-blur-md"
          >
            <div className="flex gap-3">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-blush">
                <AnimatedHeart className="size-5 text-berry" />
                <HeartBurst trigger={current.key} count={10} spread={46} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.68rem] font-extrabold tracking-[0.2em] text-rose uppercase">Psst, {settings.her_name}…</p>
                <p className="mt-0.5 font-hand text-[1.5rem] leading-tight text-ink">{current.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {current.is_placeholder && <PlaceholderBadge label="Example" />}
                  <button
                    type="button"
                    onClick={() => {
                      setPaused(true)
                      close()
                    }}
                    className="min-h-8 rounded-full px-1 text-xs font-bold text-ink-soft underline-offset-2 hover:text-berry-deep hover:underline"
                  >
                    Pause these
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              className="absolute top-2 right-2 grid size-10 place-items-center rounded-full text-ink-soft hover:bg-blush hover:text-berry-deep"
              aria-label="Close"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <span
              className="absolute bottom-0 left-0 h-1 rounded-full bg-berry/50"
              style={{ animation: `olu-shrink ${VISIBLE_MS}ms linear forwards`, animationPlayState: hold ? 'paused' : 'running' }}
              aria-hidden="true"
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
