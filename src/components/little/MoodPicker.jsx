import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BatteryLow, CloudLightning, Heart, HeartHandshake, Laugh, Moon, Smile } from 'lucide-react'
import { MOODS } from '@/lib/defaults'

const ICONS = {
  happy: Smile,
  tired: BatteryLow,
  stressed: CloudLightning,
  sleepy: Moon,
  missing: HeartHandshake,
  need_smile: Laugh,
}

const TINTS = ['bg-butter', 'bg-lavender', 'bg-peach', 'bg-blush']

/** Feature C — "How are you feeling today?" with a message for each mood. */
export default function MoodPicker({ moodMessages }) {
  const [selected, setSelected] = useState(null)
  const available = MOODS.map((mood) => ({ ...mood, entry: moodMessages.find((m) => m.mood === mood.id) })).filter((m) => m.entry)
  const extra = moodMessages
    .filter((m) => !MOODS.some((mood) => mood.id === m.mood))
    .map((m) => ({ id: m.mood, label: m.label || m.mood, entry: m }))
  const moods = [...available, ...extra]
  const current = moods.find((m) => m.id === selected)

  if (!moods.length) {
    return <p className="text-center text-sm text-ink-soft">Mood messages will appear here soon ♡</p>
  }

  return (
    <div>
      <div role="radiogroup" aria-label="How are you feeling today?" className="grid grid-cols-2 gap-2.5 min-[480px]:grid-cols-3">
        {moods.map((mood, i) => {
          const Icon = ICONS[mood.id] ?? Heart
          const active = mood.id === selected
          return (
            <motion.button
              key={mood.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(mood.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex min-h-14 items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left text-sm font-extrabold transition ${
                active ? 'border-berry bg-paper text-berry-deep shadow-card' : `border-transparent ${TINTS[i % TINTS.length]} text-ink hover:-translate-y-0.5`
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {mood.label}
            </motion.button>
          )
        })}
      </div>

      <div className="mt-4 min-h-28" aria-live="polite">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-3xl bg-blush/60 px-5 py-4"
            >
              <p className="text-xs font-extrabold tracking-[0.2em] text-rose uppercase">If you're feeling {current.label.toLowerCase()}…</p>
              <p className="mt-1 font-hand text-2xl leading-snug text-ink">{current.entry.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
