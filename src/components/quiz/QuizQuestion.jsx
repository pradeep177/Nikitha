import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Heart, Sparkles } from 'lucide-react'
import HeartBurst from '../HeartBurst'
import Mascot from '../Mascot'
import PlaceholderBadge from '../PlaceholderBadge'
import { QUIZ_CATEGORIES } from '@/lib/defaults'

const CORRECT = ['Yes! You know us so well ♡', "Correct! Someone's been paying attention.", 'Look at you go!', 'Nailed it ♡']
const WRONG = [
  'Hmm, not quite — but I still like you.',
  "Close! We'll call it a cute guess.",
  'Nope! Looks like we need another chat about this.',
  'Wrong, but adorably wrong.',
]
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/** One quiz question with animated answer feedback (no harsh error states). */
export default function QuizQuestion({ question, number, total, score, selectedId, onSelect, onNext, onBack, isLast }) {
  const [burst, setBurst] = useState(0)
  const answered = selectedId !== undefined
  const selected = question.options.find((o) => o.id === selectedId)
  const correct = !!selected?.is_correct
  const category = QUIZ_CATEGORIES.find((c) => c.id === question.category)?.label
  const mood = !answered ? 'thinking' : correct ? 'excited' : 'oops'

  const choose = (option) => {
    if (answered) return
    if (option.is_correct) setBurst((b) => b + 1)
    onSelect(option)
  }

  return (
    <div className="card-paper relative overflow-hidden px-5 pt-6 pb-6 sm:px-8 sm:pt-8">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-extrabold text-ink-soft">
          Question {number} <span className="font-bold">of {total}</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-blush px-3 py-1 text-sm font-extrabold text-berry-deep" aria-label={`Score: ${score}`}>
          <Heart className="size-4 fill-current" aria-hidden="true" />
          <motion.span key={score} initial={{ scale: 1.6 }} animate={{ scale: 1 }}>
            {score}
          </motion.span>
        </span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-blush" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={number - (answered ? 0 : 1)}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-rose to-berry"
          initial={false}
          animate={{ width: `${((number - (answered ? 0 : 1)) / total) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      <div className="mt-6 flex items-start gap-4">
        <div className="relative hidden shrink-0 sm:block">
          <Mascot mood={mood} reactionKey={selectedId} className="size-20" />
          <HeartBurst trigger={burst} count={12} spread={70} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {category && <span className="sticker">{category}</span>}
            <PlaceholderBadge show={question.is_placeholder} label="Needs real answer" />
          </div>
          <h2 className="mt-3 font-hand text-[2rem] leading-tight font-bold text-balance text-ink sm:text-4xl">{question.question}</h2>
        </div>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const isSelected = option.id === selectedId
          const reveal = answered && option.is_correct
          const state = reveal ? 'correct' : isSelected ? 'wrong' : answered ? 'idle-done' : 'idle'
          return (
            <li key={option.id}>
              <motion.button
                type="button"
                onClick={() => choose(option)}
                disabled={answered}
                aria-pressed={isSelected}
                whileHover={answered ? undefined : { y: -2 }}
                whileTap={answered ? undefined : { scale: 0.97 }}
                animate={state === 'wrong' ? { x: [0, -6, 6, -4, 4, 0] } : state === 'correct' && isSelected ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.45 }}
                className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-colors disabled:cursor-default ${
                  state === 'correct'
                    ? 'border-butter-deep bg-butter text-ink'
                    : state === 'wrong'
                      ? 'border-lavender-deep bg-lavender text-ink'
                      : state === 'idle-done'
                        ? 'border-blush bg-paper text-ink-soft opacity-70'
                        : 'border-blush-deep bg-paper text-ink hover:border-berry hover:bg-blush/40'
                }`}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
                    state === 'correct' ? 'bg-butter-deep text-ink' : state === 'wrong' ? 'bg-lavender-deep text-ink' : 'bg-blush text-berry-deep'
                  }`}
                  aria-hidden="true"
                >
                  {state === 'correct' ? <Check className="size-4" /> : LETTERS[i]}
                </span>
                <span>{option.label}</span>
                {state === 'correct' && <span className="sr-only">(correct answer)</span>}
              </motion.button>
            </li>
          )
        })}
      </ul>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-5 flex items-start gap-3 rounded-2xl px-4 py-3 ${correct ? 'bg-butter/70' : 'bg-lavender/70'}`}
            role="status"
          >
            <div className="relative sm:hidden">
              <Mascot mood={mood} reactionKey={selectedId} className="size-12" />
              <HeartBurst trigger={burst} count={10} spread={50} />
            </div>
            <div>
              <p className="flex items-center gap-1.5 font-hand text-2xl font-bold text-ink">
                {correct && <Sparkles className="size-4 text-berry" aria-hidden="true" />}
                {(correct ? CORRECT : WRONG)[(number - 1) % 4]}
              </p>
              {question.explanation && <p className="mt-0.5 text-sm text-ink-soft">{question.explanation}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        {number > 1 ? (
          <button type="button" onClick={onBack} className="btn btn-ghost px-3">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={onNext} disabled={!answered} className="btn btn-primary">
          {isLast ? 'See my results' : 'Next question'}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
