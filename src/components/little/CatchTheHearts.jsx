import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, RotateCcw, Timer, Trophy } from 'lucide-react'
import { HeartShape } from '../illustrations/Doodles'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const DURATION = 20_000
const SPAWN_EVERY = 560
const LIFETIME = 1500
const COLORS = ['text-berry', 'text-rose', 'text-berry-deep', 'text-blush-deep']

function resultMessage(score) {
  if (score >= 16) return "Heart-catching champion ♡ I'm officially caught."
  if (score >= 8) return 'So quick! My heart never stood a chance.'
  if (score > 0) return 'Warming up! Want another go?'
  return 'The hearts escaped this time… try again?'
}

/** Feature B — a 20-second "catch the hearts" mini-game (touch + mouse + keyboard). */
export default function CatchTheHearts({ onSound }) {
  const [phase, setPhase] = useState('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [hearts, setHearts] = useState([])
  const [pops, setPops] = useState([])
  const [best, setBest] = useLocalStorage('olu:best-hearts', 0)
  const nextId = useRef(0)
  const scoreRef = useRef(0)

  useEffect(() => {
    if (phase !== 'playing') return undefined
    const startedAt = performance.now()

    const timer = setInterval(() => {
      const left = Math.max(0, DURATION - (performance.now() - startedAt))
      setTimeLeft(left)
      if (left <= 0) {
        setPhase('done')
        setHearts([])
        setBest((b) => Math.max(b, scoreRef.current))
      }
    }, 100)

    const spawner = setInterval(() => {
      const now = performance.now()
      nextId.current += 1
      const heart = {
        id: nextId.current,
        x: 6 + Math.random() * 82,
        y: 8 + Math.random() * 74,
        size: 42 + Math.random() * 18,
        color: COLORS[nextId.current % COLORS.length],
        born: now,
      }
      setHearts((list) => [...list.filter((h) => now - h.born < LIFETIME), heart])
    }, SPAWN_EVERY)

    return () => {
      clearInterval(timer)
      clearInterval(spawner)
    }
  }, [phase, setBest])

  const start = () => {
    setScore(0)
    scoreRef.current = 0
    setTimeLeft(DURATION)
    setHearts([])
    setPops([])
    setPhase('playing')
  }

  const catchHeart = (heart) => {
    setHearts((list) => list.filter((h) => h.id !== heart.id))
    scoreRef.current += 1
    setScore(scoreRef.current)
    setPops((list) => [...list.slice(-6), { id: heart.id, x: heart.x, y: heart.y }])
    onSound?.('pop')
  }

  const seconds = Math.ceil(timeLeft / 1000)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2 text-sm font-extrabold">
        <span className="inline-flex items-center gap-1 rounded-full bg-blush px-3 py-1 text-berry-deep" aria-live="off">
          <HeartShape className="size-4" /> {score}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-lavender px-3 py-1 text-ink" aria-label={`${seconds} seconds left`}>
          <Timer className="size-4" aria-hidden="true" /> {seconds}s
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-butter px-3 py-1 text-ink" title="Best score">
          <Trophy className="size-4" aria-hidden="true" /> {best}
        </span>
      </div>

      <div
        className="relative h-72 touch-manipulation overflow-hidden rounded-3xl bg-gradient-to-br from-lavender via-blush to-peach select-none sm:h-80"
        role="application"
        aria-label="Catch the hearts game area"
      >
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/40">
          <motion.div className="h-full bg-berry" animate={{ width: `${(timeLeft / DURATION) * 100}%` }} transition={{ duration: 0.1, ease: 'linear' }} />
        </div>

        <AnimatePresence>
          {phase === 'playing' &&
            hearts.map((heart) => (
              <motion.button
                key={heart.id}
                type="button"
                onClick={() => catchHeart(heart)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1 ${heart.color}`}
                style={{ left: `${heart.x}%`, top: `${heart.y}%`, width: heart.size, height: heart.size }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: -10 }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 380, damping: 16, y: { duration: 1.4 } }}
                aria-label="Catch this heart"
              >
                <HeartShape className="size-full drop-shadow-md" />
              </motion.button>
            ))}
        </AnimatePresence>

        <AnimatePresence>
          {pops.map((pop) => (
            <motion.span
              key={`pop-${pop.id}`}
              className="pointer-events-none absolute -translate-x-1/2 font-hand text-3xl font-bold text-berry-deep"
              style={{ left: `${pop.x}%`, top: `${pop.y}%` }}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.7 }}
              onAnimationComplete={() => setPops((list) => list.filter((p) => p.id !== pop.id))}
              aria-hidden="true"
            >
              +1
            </motion.span>
          ))}
        </AnimatePresence>

        {phase !== 'playing' && (
          <div className="absolute inset-0 grid place-items-center bg-white/30 p-6 text-center backdrop-blur-[1px]">
            <div>
              {phase === 'done' ? (
                <>
                  <p className="font-hand text-5xl font-bold text-berry-deep">{score} hearts!</p>
                  <p className="mt-1 max-w-xs font-hand text-2xl leading-tight text-ink" role="status">
                    {resultMessage(score)}
                  </p>
                  <button type="button" onClick={start} className="btn btn-primary mt-4">
                    <RotateCcw className="size-4" aria-hidden="true" /> Play again
                  </button>
                </>
              ) : (
                <>
                  <p className="font-hand text-3xl font-bold text-ink">Catch as many hearts as you can!</p>
                  <p className="mt-1 text-sm text-ink-soft">You have 20 seconds. Tap or click them.</p>
                  <button type="button" onClick={start} className="btn btn-primary mt-4">
                    <Play className="size-4 fill-current" aria-hidden="true" /> Start
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
