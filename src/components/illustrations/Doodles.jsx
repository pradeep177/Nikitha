export const HEART_PATH =
  'M12 20.6C6.4 16.7 2.4 13.1 2.4 8.9 2.4 6 4.6 3.8 7.4 3.8c1.9 0 3.5.9 4.6 2.5 1.1-1.6 2.7-2.5 4.6-2.5 2.8 0 5 2.2 5 5.1 0 4.2-4 7.8-9.6 11.7z'

export const SPARKLE_PATH = 'M12 1.5c.7 5.6 4.9 9.8 10.5 10.5-5.6.7-9.8 4.9-10.5 10.5C11.3 16.9 7.1 12.7 1.5 12 7.1 11.3 11.3 7.1 12 1.5z'

export function HeartShape({ className = '', style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d={HEART_PATH} fill="currentColor" />
    </svg>
  )
}

export function Sparkle({ className = '', style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d={SPARKLE_PATH} fill="currentColor" />
    </svg>
  )
}

export function Cloud({ className = '', style }) {
  return (
    <svg viewBox="0 0 120 64" className={className} style={style} aria-hidden="true">
      <g fill="currentColor">
        <circle cx="34" cy="38" r="20" />
        <circle cx="60" cy="28" r="24" />
        <circle cx="88" cy="38" r="18" />
        <rect x="18" y="38" width="86" height="20" rx="10" />
      </g>
    </svg>
  )
}

/** Hand-drawn style squiggle used under headings. */
export function Squiggle({ className = '' }) {
  return (
    <svg viewBox="0 0 160 14" className={className} fill="none" aria-hidden="true">
      <path
        d="M2 8 C 16 1, 28 13, 42 7 S 68 1, 82 7 S 108 13, 122 7 S 146 1, 158 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Doodle arrow that curls down. */
export function DoodleArrow({ className = '' }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none" aria-hidden="true">
      <path
        d="M10 6 C 34 4, 50 20, 38 34 C 30 43, 18 36, 26 28 C 34 20, 46 34, 40 52"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M33 47 L40 53 L46 45" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
