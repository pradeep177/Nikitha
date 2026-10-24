import { motion } from 'framer-motion'

/** Horizontal, scrollable filter pills with an animated selection bubble. */
export default function FilterChips({ options, value, onChange, label, layoutId = 'chip-bubble' }) {
  return (
    <div role="radiogroup" aria-label={label} className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
      <div className="mx-auto flex w-max gap-2">
        {options.map((option) => {
          const active = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.id)}
              className={`relative min-h-11 rounded-full border px-4 py-2 text-sm font-extrabold whitespace-nowrap transition-colors ${
                active ? 'border-transparent text-white' : 'border-blush-deep bg-paper/80 text-ink-soft hover:text-berry-deep'
              }`}
            >
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-full bg-berry-deep"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  aria-hidden="true"
                />
              )}
              <span className="relative">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
