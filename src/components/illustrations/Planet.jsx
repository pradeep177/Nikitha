import { useId } from 'react'

const INK = '#4a3340'

function Face({ mood }) {
  const eyes =
    mood === 'excited' ? (
      <>
        <path d="M45 62 q4 -6 8 0" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M67 62 q4 -6 8 0" fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      </>
    ) : mood === 'sleepy' ? (
      <>
        <path d="M45 61 q4 4 8 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M67 61 q4 4 8 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      </>
    ) : (
      <>
        <ellipse cx="49" cy="61" rx="3.2" ry="4" fill={INK} />
        <ellipse cx="71" cy="61" rx="3.2" ry="4" fill={INK} />
        <circle cx="50" cy="59.6" r="1.1" fill="#fff" />
        <circle cx="72" cy="59.6" r="1.1" fill="#fff" />
      </>
    )

  const mouth =
    mood === 'excited' ? (
      <path d="M53 68 q7 10 14 0 z" fill={INK} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    ) : mood === 'oops' ? (
      <ellipse cx="60" cy="71" rx="3" ry="3.6" fill="none" stroke={INK} strokeWidth="2.4" />
    ) : mood === 'thinking' ? (
      <path d="M55 71 q3 -2 6 0 t6 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    ) : (
      <path d="M54 69 q6 6 12 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    )

  return (
    <g>
      {eyes}
      {mouth}
      <ellipse cx="42" cy="69" rx="5" ry="3" fill="#ff8fb0" opacity="0.6" />
      <ellipse cx="78" cy="69" rx="5" ry="3" fill="#ff8fb0" opacity="0.6" />
      {mood === 'oops' && <path d="M84 44 q3 5 0 8 q-3 -3 0 -8z" fill="#9fd3f5" />}
    </g>
  )
}

/** A tiny smiling planet — the mascot of our little universe. */
export default function Planet({ className = '', face = true, mood = 'happy', title }) {
  const gradientId = useId()
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffdbe4" />
          <stop offset="1" stopColor="#f19ab6" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="64" rx="55" ry="14" fill="none" stroke="#d8cbf6" strokeWidth="7" transform="rotate(-14 60 64)" />
      <circle cx="60" cy="60" r="35" fill={`url(#${gradientId})`} />
      <circle cx="47" cy="43" r="6" fill="#fff" opacity="0.45" />
      <circle cx="76" cy="78" r="4" fill="#e982a3" opacity="0.5" />
      {face && <Face mood={mood} />}
      <path
        d="M5 64 A55 14 0 0 0 115 64"
        fill="none"
        stroke="#c4b2f1"
        strokeWidth="7"
        strokeLinecap="round"
        transform="rotate(-14 60 64)"
      />
    </svg>
  )
}
