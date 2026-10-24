import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { CalendarHeart, MapPin } from 'lucide-react'
import PageShell from '@/components/PageShell'
import ContentState from '@/components/ContentState'
import SmartImage from '@/components/SmartImage'
import PlaceholderBadge from '@/components/PlaceholderBadge'
import { HeartShape, Sparkle } from '@/components/illustrations/Doodles'
import { useContent } from '@/hooks/useContent'
import { formatDate } from '@/utils/format'

const DOTS = ['bg-berry', 'bg-rose', 'bg-lavender-deep', 'bg-peach-deep', 'bg-butter-deep']

function TimelineEntry({ entry, index }) {
  const left = index % 2 === 0
  const date = formatDate(entry.event_date)

  return (
    <li className="relative grid grid-cols-[2.5rem_1fr] gap-x-3 md:grid-cols-[1fr_4rem_1fr] md:gap-x-0">
      {/* dot + sparkle */}
      <div className="relative col-start-1 row-start-1 flex justify-center md:col-start-2">
        <motion.span
          className={`relative z-10 mt-6 grid size-6 place-items-center rounded-full ring-4 ring-cream ${DOTS[index % DOTS.length]}`}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14 }}
        >
          <HeartShape className="size-3 text-white" />
        </motion.span>
        <motion.span
          className="absolute top-3 left-1/2 text-butter-deep"
          initial={{ opacity: 0, scale: 0, x: '-50%' }}
          whileInView={{ opacity: [0, 1, 0], scale: [0, 1.6, 0.4], rotate: 90, x: '-50%' }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, delay: 0.15 }}
          aria-hidden="true"
        >
          <Sparkle className="size-10" />
        </motion.span>
      </div>

      <motion.article
        className={`col-start-2 row-start-1 pb-10 ${left ? 'md:col-start-1 md:pr-2' : 'md:col-start-3 md:pl-2'}`}
        initial={{ opacity: 0, x: left ? -40 : 40, y: 10 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="card-paper overflow-hidden">
          {entry.image_url && (
            <motion.div initial={{ opacity: 0, scale: 1.06 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
              <SmartImage src={entry.image_url} alt={entry.image_alt || entry.title} aspect="16/10" seed={index} />
            </motion.div>
          )}
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="sticker">{date ?? 'Date to be added'}</span>
              {entry.category && (
                <span className="rounded-full bg-lavender px-3 py-1 text-xs font-extrabold text-ink-soft">{entry.category}</span>
              )}
              <PlaceholderBadge show={entry.is_placeholder} />
            </div>
            <h2 className="mt-3 font-hand text-[2rem] leading-tight font-bold text-ink">{entry.title}</h2>
            {entry.story && <p className="mt-2 leading-relaxed whitespace-pre-line text-ink-soft">{entry.story}</p>}
            {entry.location && (
              <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-rose">
                <MapPin className="size-4" aria-hidden="true" />
                {entry.location}
              </p>
            )}
          </div>
        </div>
      </motion.article>
    </li>
  )
}

function Timeline({ entries }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })

  return (
    <div ref={ref} className="relative mx-auto max-w-5xl px-4 sm:px-5">
      <div className="absolute top-0 bottom-10 left-[calc(1rem+1.25rem)] w-1 -translate-x-1/2 rounded-full bg-blush-deep/50 sm:left-[calc(1.25rem+1.25rem)] md:left-1/2" aria-hidden="true">
        <motion.div className="h-full w-full origin-top rounded-full bg-gradient-to-b from-berry via-rose to-lavender-deep" style={{ scaleY: progress }} />
      </div>
      <ol className="relative">
        {entries.map((entry, i) => (
          <TimelineEntry key={entry.id} entry={entry} index={i} />
        ))}
      </ol>
      <p className="relative text-center font-hand text-3xl text-ink-soft">…and so many more chapters to come ♡</p>
    </div>
  )
}

export default function TimelinePage() {
  const query = useContent('listTimeline')
  return (
    <PageShell chapterId="timeline">
      <ContentState
        query={query}
        loadingMessage="Turning back the pages…"
        empty={{ icon: CalendarHeart, title: 'Our story is just getting started', message: 'Milestones will appear here, one little moment at a time ♡' }}
      >
        {(entries) => <Timeline entries={entries} />}
      </ContentState>
    </PageShell>
  )
}
