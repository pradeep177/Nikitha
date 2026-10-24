import { Volume2, VolumeX } from 'lucide-react'

/** Opt-in sound toggle (sound is off by default). */
export default function SoundToggle({ enabled, onChange, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={`btn btn-ghost min-h-11 gap-1.5 px-3 py-2 text-sm ${className}`}
    >
      {enabled ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
      Sound {enabled ? 'on' : 'off'}
    </button>
  )
}
