import { PencilLine } from 'lucide-react'

/** Small sticker shown on content that is still placeholder / unverified. */
export default function PlaceholderBadge({ show = true, label = 'Placeholder', className = '' }) {
  if (!show) return null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-dashed border-lavender-deep bg-lavender/90 px-2 py-0.5 text-[0.68rem] font-extrabold tracking-wide text-ink-soft uppercase ${className}`}
    >
      <PencilLine className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}
