import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { animate, motion, useReducedMotion } from 'framer-motion'
import { House, RotateCcw } from 'lucide-react'
import Mascot from '../Mascot'
import Confetti from '../Confetti'
import { personalize } from '@/app/chapters'

function scoreTier(score, total) {
  if (!total) return 'low'
  const ratio = score / total
  if (ratio === 1) return 'perfect'
  if (ratio >= 0.7) return 'high'
  if (ratio >= 0.4) return 'medium'
  return 'low'
}

function CountUp({ value }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? value : 0)
  useEffect(() => {
    if (reduce) return undefined
    const controls = animate(0, value, { duration: 1.2, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) })
    return () => controls.stop()
  }, [value, reduce])
  return <>{reduce ? value : shown}</>
}

export default function QuizResults({ score, total, messages, name, saveNote, onRestart }) {
  const tier = scoreTier(score, total)
  const message = personalize(messages[tier], name)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="card-paper relative overflow-hidden px-6 py-10 text-center"
    >
      <Confetti trigger={tier === 'perfect' || tier === 'high' ? 1 : 0} />
      <Mascot mood={tier === 'low' ? 'oops' : 'excited'} className="size-24" reactionKey="results" />
      <p className="mt-4 text-sm font-extrabold tracking-[0.2em] text-rose uppercase">Your score</p>
      <p className="mt-1 font-hand text-7xl font-bold text-berry-deep" aria-live="polite">
        <CountUp value={score} />
        <span className="text-4xl text-ink-soft"> / {total}</span>
      </p>
      <p className="text-ink-soft">
        {score} correct {score === 1 ? 'answer' : 'answers'} out of {total}
      </p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mx-auto mt-5 max-w-md font-hand text-3xl leading-tight text-balance text-ink"
      >
        {message}
      </motion.p>
      {saveNote && <p className="mt-4 text-xs text-ink-soft">{saveNote}</p>}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={onRestart} className="btn btn-soft">
          <RotateCcw className="size-4" aria-hidden="true" />
          Play again
        </button>
        <Link to="/" className="btn btn-primary">
          <House className="size-4" aria-hidden="true" />
          Back to our little universe
        </Link>
      </div>
    </motion.div>
  )
}
