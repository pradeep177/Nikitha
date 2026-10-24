import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, ChevronDown, Trash2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import LoadingState from '@/components/LoadingState'
import ErrorState from '@/components/ErrorState'
import EmptyState from '@/components/EmptyState'
import { useConfirm, useToast } from '../ui/useAdminUI'
import { adminApi } from '@/lib/adminApi'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const dateTime = (iso) =>
  new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

export default function QuizResultsPage() {
  const toast = useToast()
  const confirm = useConfirm()
  const { settings } = useSiteSettings()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [nonce, setNonce] = useState(0)
  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    Promise.all([adminApi.listQuizAttempts(), adminApi.listQuiz()]).then(
      ([attempts, questions]) => !cancelled && (setData({ attempts, questions }), setError(null)),
      (err) => !cancelled && setError(err),
    )
    return () => {
      cancelled = true
    }
  }, [nonce])

  const lookup = useMemo(() => {
    const map = new Map()
    data?.questions.forEach((q) => map.set(q.id, q))
    return map
  }, [data])

  const remove = async (attempt) => {
    if (!(await confirm({ title: 'Delete this result?', confirmLabel: 'Delete', danger: true }))) return
    try {
      await adminApi.deleteQuizAttempt(attempt.id)
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const clearAll = async () => {
    if (!(await confirm({ title: 'Delete all quiz results?', message: 'This removes every saved attempt permanently.', confirmLabel: 'Delete all', danger: true }))) return
    try {
      await adminApi.clearQuizAttempts()
      toast.success('All results deleted.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const header = (
    <AdminPageHeader
      title="Quiz results"
      description={
        settings.quiz_save_results
          ? 'Saved when someone finishes the quiz: score, total, the time, and which answer was picked for each question. Only you can see this page.'
          : 'Saving results is currently switched off in Settings, so new attempts are not stored.'
      }
      actions={
        data?.attempts.length ? (
          <button type="button" onClick={clearAll} className="btn btn-soft">
            <Trash2 className="size-4" aria-hidden="true" /> Delete all
          </button>
        ) : null
      }
    />
  )

  if (error && !data) return (<>{header}<ErrorState message={error.message} onRetry={reload} /></>)
  if (!data) return (<>{header}<LoadingState message="Loading results…" /></>)
  if (!data.attempts.length) return (<>{header}<EmptyState icon={BarChart3} title="No results yet" message="When the quiz is finished, the score will show up here ♡" /></>)

  const best = Math.max(...data.attempts.map((a) => a.score / a.total))

  return (
    <>
      {header}
      <p className="mb-4 text-sm text-ink-soft">
        {data.attempts.length} attempt{data.attempts.length === 1 ? '' : 's'} · best score {Math.round(best * 100)}%
      </p>
      <ul className="space-y-3">
        {data.attempts.map((attempt) => (
          <li key={attempt.id} className="card-paper p-4">
            <details>
              <summary className="flex cursor-pointer list-none items-center gap-3">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-blush font-hand text-2xl font-bold text-berry-deep">
                  {attempt.score}/{attempt.total}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold text-ink">{Math.round((attempt.score / attempt.total) * 100)}% correct</span>
                  <span className="block text-sm text-ink-soft">
                    {dateTime(attempt.created_at)} · {attempt.user_id ? 'signed-in visitor' : 'guest'}
                  </span>
                </span>
                <ChevronDown className="size-4 text-ink-soft" aria-hidden="true" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    remove(attempt)
                  }}
                  className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-blush"
                  aria-label="Delete this result"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </summary>
              <ol className="mt-3 space-y-1.5 border-t border-blush-deep/50 pt-3 text-sm">
                {Object.entries(attempt.answers ?? {}).map(([questionId, optionId]) => {
                  const q = lookup.get(questionId)
                  const chosen = q?.options.find((o) => o.id === optionId)
                  return (
                    <li key={questionId} className="flex gap-2">
                      <span aria-hidden="true">{chosen?.is_correct ? '✓' : '·'}</span>
                      <span>
                        <span className="text-ink-soft">{q?.question ?? 'A question that has since been changed'}</span>
                        <br />
                        <span className="font-bold text-ink">{chosen?.label ?? '(answer changed since)'}</span>
                      </span>
                    </li>
                  )
                })}
              </ol>
            </details>
          </li>
        ))}
      </ul>
    </>
  )
}
