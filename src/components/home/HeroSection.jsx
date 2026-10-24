import { motion } from 'framer-motion'
import { ArrowDown, Gift, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import PhotoStack from './PhotoStack'
import { HeartShape, Sparkle, DoodleArrow } from '../illustrations/Doodles'
import Planet from '../illustrations/Planet'
import AnimatedHeart from '../AnimatedHeart'
import { personalize } from '@/app/chapters'

const HERO_STARS = [
  { top: '8%', left: '6%', size: 14, delay: 0.3 },
  { top: '18%', left: '44%', size: 10, delay: 0.5 },
  { top: '6%', left: '78%', size: 16, delay: 0.7 },
  { top: '52%', left: '3%', size: 9, delay: 0.9 },
  { top: '70%', left: '48%', size: 12, delay: 1.1 },
  { top: '38%', left: '94%', size: 10, delay: 1.3 },
]

const ORBIT_HEARTS = [
  { className: '-top-5 -left-4 size-9 text-berry', delay: 0.9, float: 8 },
  { className: 'top-[18%] -right-6 size-7 text-rose', delay: 1.0, float: 10 },
  { className: 'bottom-[24%] -left-7 size-6 text-blush-deep', delay: 1.1, float: 7 },
  { className: '-bottom-4 right-[18%] size-8 text-berry/70', delay: 1.2, float: 9 },
  { className: '-top-7 right-[28%] size-5 text-lavender-deep', delay: 1.3, float: 6 },
]

const rise = (delay) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
})

function HeroHeading({ text }) {
  const trimmed = text.trimEnd()
  const hasHeart = trimmed.endsWith('♡')
  const body = hasHeart ? trimmed.slice(0, -1).trimEnd() : trimmed
  return (
    <motion.h1
      className="font-hand text-[3.4rem] leading-[0.95] font-bold text-balance text-ink sm:text-7xl lg:text-[5.5rem]"
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 120, damping: 15 }}
    >
      {body}
      {hasHeart && (
        <motion.span
          className="ml-2 inline-block text-berry"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 12 }}
        >
          ♡
        </motion.span>
      )}
    </motion.h1>
  )
}

function HeroPhoto({ photos, name }) {
  return (
    <motion.figure
      className="relative mx-auto w-[min(78vw,22rem)] lg:w-[25rem]"
      initial={{ opacity: 0, scale: 0.82, rotate: -8, y: 30 }}
      animate={{ opacity: 1, scale: 1, rotate: 3, y: 0 }}
      transition={{ delay: 0.55, type: 'spring', stiffness: 100, damping: 15 }}
      aria-label={photos.length > 1 ? `Photos of ${name}` : undefined}
    >
      <PhotoStack photos={photos} name={name} placeholderLabel="A photo of you will live here ♡" />

      {ORBIT_HEARTS.map((heart, i) => (
        <motion.span
          key={i}
          className={`absolute ${heart.className}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, -heart.float, 0] }}
          transition={{
            opacity: { delay: heart.delay, duration: 0.4 },
            scale: { delay: heart.delay, type: 'spring', stiffness: 300, damping: 12 },
            y: { delay: heart.delay, duration: 2.6 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
          }}
          aria-hidden="true"
        >
          <HeartShape className="size-full drop-shadow-sm" />
        </motion.span>
      ))}

      <motion.div
        className="absolute -bottom-14 -left-7 w-20 sm:-left-16 sm:w-28"
        initial={{ opacity: 0, x: -20, rotate: -30 }}
        animate={{ opacity: 1, x: 0, rotate: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { delay: 1.1 },
          x: { delay: 1.1, type: 'spring' },
          rotate: { delay: 1.1, type: 'spring' },
          y: { delay: 2, duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        aria-hidden="true"
      >
        <Planet className="size-full" />
      </motion.div>
    </motion.figure>
  )
}

export default function HeroSection({ hero, photos, name, signature, onSecret, onScrollHint }) {
  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-6xl flex-col px-5 pt-8 pb-6 md:pt-12" aria-label="Welcome">
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[3rem] bg-gradient-to-b from-blush/70 via-lavender/30 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        aria-hidden="true"
      />
      {HERO_STARS.map((star, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-butter-deep"
          style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1], scale: [0, 1.2, 0.9, 1] }}
          transition={{ delay: star.delay, duration: 1.6 }}
          aria-hidden="true"
        >
          <Sparkle className="size-full" />
        </motion.span>
      ))}

      <div className="relative grid flex-1 items-center gap-x-12 gap-y-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="text-center md:col-start-1 md:row-start-1 md:self-end md:text-left">
          <motion.span className="sticker" {...rise(0.15)}>
            <Sparkles className="size-3.5" aria-hidden="true" />
            {hero.label}
          </motion.span>
          <div className="mt-5">
            <HeroHeading text={personalize(hero.heading, name)} />
          </div>
        </div>

        <div className="pb-10 md:col-start-2 md:row-span-2 md:row-start-1 md:pb-0">
          <HeroPhoto photos={photos} name={name} />
        </div>

        <div className="text-center md:col-start-1 md:row-start-2 md:self-start md:text-left">
          <motion.p className="mx-auto max-w-xl text-lg leading-relaxed text-pretty text-ink-soft md:mx-0" {...rise(0.95)}>
            {personalize(hero.message, name)}
          </motion.p>
          <motion.p className="mx-auto mt-4 max-w-lg font-hand text-[1.7rem] leading-snug text-berry-deep md:mx-0" {...rise(1.15)}>
            {personalize(hero.affection_line, name)}
          </motion.p>

          <motion.div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start" {...rise(1.35)}>
            <Link to="/memories" className="btn btn-primary w-full sm:w-auto sm:whitespace-nowrap">
              {hero.primary_cta}
            </Link>
            <button type="button" onClick={onSecret} className="btn btn-soft group w-full sm:w-auto sm:whitespace-nowrap">
              <Gift className="size-4 transition group-hover:rotate-12" aria-hidden="true" />
              {hero.secondary_cta}
            </button>
          </motion.div>

          <motion.p className="mt-6 inline-flex items-center gap-2 font-hand text-xl text-ink-soft" {...rise(1.55)}>
            {signature}
            <AnimatedHeart className="size-4 text-berry" />
          </motion.p>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={onScrollHint}
        className="relative mx-auto mt-8 flex flex-col items-center gap-1 rounded-3xl px-4 py-2 text-ink-soft hover:text-berry-deep"
        {...rise(1.8)}
      >
        <span className="font-hand text-2xl">{hero.scroll_hint}</span>
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="flex items-center gap-1">
          <DoodleArrow className="hidden size-9 text-rose sm:block" />
          <ArrowDown className="size-5 sm:hidden" aria-hidden="true" />
        </motion.span>
      </motion.button>
    </section>
  )
}
