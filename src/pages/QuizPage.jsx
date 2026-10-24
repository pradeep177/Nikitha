import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Info, Puzzle } from 'lucide-react'
import PageShell from '@/components/PageShell'
import PhotoBackdrop from '@/components/PhotoBackdrop'
import ContentState from '@/components/ContentState'
import Mascot from '@/components/Mascot'
import SoundToggle from '@/components/SoundToggle'
import QuizQuestion from '@/components/quiz/QuizQuestion'
import QuizResults from '@/components/quiz/QuizResults'
import { content } from '@/lib/database'
import { isDemoMode } from '@/lib/supabase'
import { useContent } from '@/hooks/useContent'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useSound } from '@/hooks/useSound'

/** A question is playable only if it has 2+ options and exactly one correct answer. */
const isPlayable = (q) => q.options?.length >= 2 && q.options.filter((o) => o.is_correct).length === 1

function Quiz({ questions }) {
  const { settings } = useSiteSettings()
  const sound = useSound()
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [saveNote, setSaveNote] = useState(null)

  const score = useMemo(
    () => questions.filter((q) => q.options.find((o) => o.id === answers[q.id])?.is_correct).length,
    [questions, answers],
  )
  const hasPlaceholders = questions.some((q) => q.is_placeholder)

  const start = () => {
    setAnswers({})
    setIndex(0)
    setSaveNote(null)
    setPhase('playing')
  }

  const select = (question, option) => {
    setAnswers((a) => ({ ...a, [question.id]: option.id }))
    sound.play(option.is_correct ? 'success' : 'oops')
  }

  const finish = async () => {
    setPhase('results')
    if (!settings.quiz_save_results) return
    try {
      const result = await content.saveQuizAttempt({ score, total: questions.length, answers })
      setSaveNote(result?.saved ? 'Your score has been saved ♡' : isDemoMode ? 'Demo mode — scores are not saved.' : null)
    } catch {
      setSaveNote(null)
    }
  }

  const next = () => {
    if (index + 1 >= questions.length) finish()
    else setIndex((i) => i + 1)
  }

  const question = questions[index]

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-5">
      <div className="mb-4 flex justify-end">
        <SoundToggle enabled={sound.enabled} onChange={sound.setEnabled} />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="card-paper px-6 py-10 text-center"
          >
            <Mascot mood="happy" className="size-28" />
            <h2 className="mt-4 font-hand text-4xl font-bold text-ink">Ready, miss {settings.her_name}?</h2>
            <p className="mx-auto mt-2 max-w-md text-ink-soft">
              {questions.length} little questions about us. No pressure… but I <em>will</em> be checking your score ♡
            </p>
            {hasPlaceholders && (
              <p className="mx-auto mt-5 flex max-w-md items-start gap-2 rounded-2xl bg-lavender/70 px-4 py-3 text-left text-sm text-ink">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Some questions are still placeholders — their real answers haven't been added yet.
              </p>
            )}
            {settings.quiz_save_results && (
              <p className="mx-auto mt-3 max-w-md text-xs text-ink-soft">
                Just so you know: when you finish, your score and chosen answers are saved so I can see how you did.
              </p>
            )}
            <button type="button" onClick={start} className="btn btn-primary mt-7">
              Let's play ♡
            </button>
          </motion.div>
        )}

        {phase === 'playing' && question && (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          >
            <QuizQuestion
              question={question}
              number={index + 1}
              total={questions.length}
              score={score}
              selectedId={answers[question.id]}
              onSelect={(option) => select(question, option)}
              onNext={next}
              onBack={() => setIndex((i) => Math.max(0, i - 1))}
              isLast={index + 1 === questions.length}
            />
            <div className="mt-4 text-center">
              <button type="button" onClick={start} className="btn btn-ghost text-sm">
                Restart quiz
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'results' && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuizResults
              score={score}
              total={questions.length}
              messages={settings.quiz_result_messages}
              name={settings.her_name}
              saveNote={saveNote}
              onRestart={start}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function QuizPage() {
  const query = useContent('listQuizQuestions')
  const playable = useMemo(() => (query.data ?? []).filter(isPlayable), [query.data])

  return (
    <PageShell chapterId="quiz">
      <PhotoBackdrop start={2} />
      <ContentState
        query={{ ...query, data: query.data === undefined ? undefined : playable }}
        loadingMessage="Thinking of tricky questions…"
        empty={{
          icon: Puzzle,
          title: 'The quiz is still being written',
          message: 'Questions about us will appear here soon. Get ready, miss!',
        }}
      >
        {(questions) => <Quiz questions={questions} />}
      </ContentState>
    </PageShell>
  )
}
