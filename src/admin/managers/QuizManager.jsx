import { ArrowDown, ArrowUp, Check, Plus, Puzzle, X } from 'lucide-react'
import CollectionManager from '../CollectionManager'
import { adminApi } from '@/lib/adminApi'
import { QUIZ_CATEGORIES } from '@/lib/defaults'
import { inputClass } from '@/utils/ui'

const LETTERS = 'ABCDEF'

function OptionsEditor({ value = [], onChange, describedBy }) {
  const update = (index, patch) => onChange(value.map((o, i) => (i === index ? { ...o, ...patch } : o)))
  const markCorrect = (index) => onChange(value.map((o, i) => ({ ...o, is_correct: i === index })))
  const removeAt = (index) => {
    const next = value.filter((_, i) => i !== index)
    if (value[index]?.is_correct && next.length) next[0] = { ...next[0], is_correct: true }
    onChange(next)
  }
  const move = (index, step) => {
    const next = [...value]
    ;[next[index], next[index + step]] = [next[index + step], next[index]]
    onChange(next)
  }

  return (
    <div aria-describedby={describedBy}>
      <ul className="space-y-2">
        {value.map((option, i) => (
          <li key={i} className={`flex items-center gap-2 rounded-2xl border-2 p-2 ${option.is_correct ? 'border-butter-deep bg-butter/60' : 'border-blush bg-paper'}`}>
            <button
              type="button"
              role="radio"
              aria-checked={!!option.is_correct}
              onClick={() => markCorrect(i)}
              className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-extrabold ${option.is_correct ? 'bg-butter-deep text-ink' : 'bg-blush text-berry-deep hover:bg-blush-deep'}`}
              aria-label={`Mark option ${LETTERS[i]} as the correct answer`}
              title="Mark as correct"
            >
              {option.is_correct ? <Check className="size-4" aria-hidden="true" /> : LETTERS[i]}
            </button>
            <input
              value={option.label ?? ''}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder={`Answer ${LETTERS[i]}`}
              aria-label={`Answer ${LETTERS[i]}${option.is_correct ? ' (correct)' : ''}`}
              maxLength={200}
              className={`${inputClass} min-h-10 py-2`}
            />
            <div className="flex shrink-0">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-8 place-items-center rounded-full hover:bg-blush disabled:opacity-30" aria-label={`Move answer ${LETTERS[i]} up`}>
                <ArrowUp className="size-3.5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="grid size-8 place-items-center rounded-full hover:bg-blush disabled:opacity-30" aria-label={`Move answer ${LETTERS[i]} down`}>
                <ArrowDown className="size-3.5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => removeAt(i)} disabled={value.length <= 2} className="grid size-8 place-items-center rounded-full hover:bg-blush disabled:opacity-30" aria-label={`Remove answer ${LETTERS[i]}`}>
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {value.length < 6 && (
        <button type="button" onClick={() => onChange([...value, { label: '', is_correct: value.length === 0 }])} className="btn btn-ghost mt-2 min-h-10 px-3 py-1.5 text-sm">
          <Plus className="size-4" aria-hidden="true" /> Add an answer
        </button>
      )}
      <p className="mt-1 text-xs text-ink-soft">Tap the letter to mark the correct answer. 2–6 answers; exactly one correct.</p>
    </div>
  )
}

const fields = [
  { name: 'category', label: 'Category', type: 'select', required: true, options: QUIZ_CATEGORIES.map((c) => ({ value: c.id, label: c.label })), full: false },
  { name: 'is_published', label: 'Published', type: 'switch', onLabel: 'In the quiz', offLabel: 'Hidden (draft)', full: false },
  { name: 'question', label: 'Question', type: 'textarea', rows: 2, required: true, maxLength: 300 },
  {
    name: 'options',
    label: 'Answers',
    type: 'custom',
    render: (props) => <OptionsEditor {...props} />,
    validate: (options = []) => {
      if (options.length < 2) return 'Add at least two answers.'
      if (options.some((o) => !o.label?.trim())) return 'Every answer needs some text.'
      if (options.filter((o) => o.is_correct).length !== 1) return 'Mark exactly one answer as correct.'
      return null
    },
  },
  { name: 'explanation', label: 'Little explanation shown after answering (optional)', type: 'textarea', rows: 2, maxLength: 600 },
]

export default function QuizManager() {
  return (
    <CollectionManager
      table="quiz_questions"
      title="Quiz"
      description="Questions for “How well do you know us?”. Only you know the real answers — the placeholders need your help!"
      noun="question"
      emptyIcon={Puzzle}
      fields={fields}
      defaults={{ category: 'random', options: [{ label: '', is_correct: true }, { label: '', is_correct: false }, { label: '', is_correct: false }, { label: '', is_correct: false }] }}
      load={adminApi.listQuiz}
      save={(values, row) => adminApi.saveQuizQuestion({ ...values, id: row?.id }, values.options)}
      toFormValues={(row) => ({ ...row, options: (row.options ?? []).map((o) => ({ label: o.label, is_correct: o.is_correct })) })}
      itemTitle={(row) => row.question}
      itemSubtitle={(row) => {
        const correct = row.options?.find((o) => o.is_correct)?.label
        return `${QUIZ_CATEGORIES.find((c) => c.id === row.category)?.label ?? ''} · ${row.options?.length ?? 0} answers${correct ? ` · ✓ ${correct}` : ''}`
      }}
      renderPreview={(values) => (
        <div className="card-paper p-4">
          <span className="sticker">{QUIZ_CATEGORIES.find((c) => c.id === values.category)?.label}</span>
          <p className="mt-2 font-hand text-2xl leading-tight font-bold text-ink">{values.question || 'Your question…'}</p>
          <ul className="mt-3 space-y-1.5">
            {(values.options ?? []).map((o, i) => (
              <li key={i} className={`rounded-xl border-2 px-3 py-1.5 text-sm font-bold ${o.is_correct ? 'border-butter-deep bg-butter' : 'border-blush'}`}>
                {LETTERS[i]}. {o.label || '…'}
              </li>
            ))}
          </ul>
          {values.explanation && <p className="mt-2 text-xs text-ink-soft">{values.explanation}</p>}
        </div>
      )}
    />
  )
}
