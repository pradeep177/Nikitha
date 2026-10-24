import { useSiteSettings } from '@/hooks/useSiteSettings'
import { seededRandom } from '@/utils/random'
import { Cloud, HeartShape, Sparkle } from './illustrations/Doodles'

const rand = seededRandom(14)

const STARS = Array.from({ length: 16 }, () => ({
  top: `${(rand() * 92).toFixed(1)}%`,
  left: `${(rand() * 96).toFixed(1)}%`,
  size: 8 + Math.round(rand() * 10),
  delay: `${(rand() * 4).toFixed(2)}s`,
  tone: rand() > 0.5 ? 'text-butter-deep' : 'text-lavender-deep',
}))

const CLOUDS = [
  { top: '9%', width: 150, duration: '95s', delay: '-20s', opacity: 0.9 },
  { top: '38%', width: 110, duration: '120s', delay: '-70s', opacity: 0.7 },
  { top: '72%', width: 170, duration: '140s', delay: '-35s', opacity: 0.6 },
]

const HEARTS = Array.from({ length: 7 }, (_, i) => ({
  left: `${(6 + i * 13 + rand() * 6).toFixed(1)}%`,
  size: 12 + Math.round(rand() * 12),
  duration: `${(14 + rand() * 10).toFixed(1)}s`,
  delay: `${(-rand() * 20).toFixed(1)}s`,
  tone: i % 3 === 0 ? 'text-berry/35' : i % 3 === 1 ? 'text-blush-deep' : 'text-rose/40',
}))

/**
 * Fixed, non-interactive background layer: twinkling stars, drifting clouds and
 * rising hearts. Pure CSS animations keep CPU usage low, and everything is
 * hidden from assistive tech and switched off for reduced-motion visitors.
 */
export default function FloatingDecorations() {
  const { settings } = useSiteSettings()

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-32 -left-24 size-80 rounded-full bg-blush/70 blur-3xl" />
      <div className="absolute top-1/3 -right-28 size-96 rounded-full bg-lavender/70 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 size-80 rounded-full bg-peach/60 blur-3xl" />

      {settings.show_clouds &&
        CLOUDS.map((cloud, i) => (
          <div
            key={`cloud-${i}`}
            className="animate-drift absolute left-0 text-white motion-reduce:hidden"
            style={{ top: cloud.top, animationDuration: cloud.duration, animationDelay: cloud.delay, opacity: cloud.opacity }}
          >
            <Cloud style={{ width: cloud.width }} className="drop-shadow-[0_6px_10px_rgba(194,124,142,0.15)]" />
          </div>
        ))}

      {settings.show_stars &&
        STARS.map((star, i) => (
          <Sparkle
            key={`star-${i}`}
            className={`animate-twinkle absolute ${star.tone}`}
            style={{ top: star.top, left: star.left, width: star.size, height: star.size, animationDelay: star.delay }}
          />
        ))}

      {settings.show_hearts &&
        HEARTS.map((heart, i) => (
          <HeartShape
            key={`heart-${i}`}
            className={`animate-float-up absolute -bottom-10 ${heart.tone} motion-reduce:hidden`}
            style={{
              left: heart.left,
              width: heart.size,
              height: heart.size,
              animationDuration: heart.duration,
              animationDelay: heart.delay,
            }}
          />
        ))}
    </div>
  )
}
