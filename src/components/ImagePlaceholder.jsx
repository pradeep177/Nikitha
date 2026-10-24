import { ImageIcon } from 'lucide-react'
import { HeartShape, Sparkle } from './illustrations/Doodles'

const TINTS = ['from-blush to-peach', 'from-lavender to-blush', 'from-butter to-peach', 'from-peach to-lavender']

/** Neutral illustrated stand-in for a photo that hasn't been uploaded (or failed to load). */
export default function ImagePlaceholder({ label = 'Photo coming soon', seed = 0, className = '', icon: Icon = ImageIcon }) {
  return (
    <div
      className={`relative flex size-full flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br p-4 text-center ${
        TINTS[Math.abs(seed) % TINTS.length]
      } ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <Sparkle className="absolute top-[12%] left-[14%] size-4 text-white/90" />
      <Sparkle className="absolute right-[16%] bottom-[18%] size-3 text-white/80" />
      <HeartShape className="absolute top-[18%] right-[18%] size-4 text-berry/30" />
      <span className="grid size-14 place-items-center rounded-full bg-white/70 shadow-sm">
        <Icon className="size-6 text-rose" aria-hidden="true" />
      </span>
      {label && <span className="font-hand text-xl leading-tight text-ink-soft">{label}</span>}
    </div>
  )
}
