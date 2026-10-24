import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowUpRight, Lock } from 'lucide-react'
import { personalize } from '@/app/chapters'
import { useVisibleChapters } from '@/hooks/useVisibleChapters'

const TINTS = {
  blush: 'bg-blush',
  peach: 'bg-peach',
  lavender: 'bg-lavender',
  butter: 'bg-butter',
}

/** "Where shall we go first?" — the main chapter menu on the landing page. */
export default function ChapterMap({ name }) {
  const chapters = useVisibleChapters().filter((c) => c.id !== 'home')

  return (
    <section className="mx-auto max-w-6xl px-5" aria-labelledby="chapter-map-title">
      <div className="mb-8 text-center">
        <h2 id="chapter-map-title" className="font-hand text-5xl font-bold text-ink">
          Where shall we go first?
        </h2>
        <p className="mt-2 text-ink-soft">{chapters.length} little chapters, all about us.</p>
      </div>

      <ol className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
        {chapters.map((chapter, i) => {
          const Icon = chapter.icon
          return (
            <motion.li
              key={chapter.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={chapter.path}
                className="group card-paper relative flex h-full items-start gap-4 overflow-hidden p-5 transition duration-300 hover:-translate-y-1.5 hover:rotate-[-0.6deg] hover:shadow-lift"
              >
                <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${TINTS[chapter.tint]} transition group-hover:scale-110 group-hover:rotate-6`}>
                  <Icon className="size-6 text-berry-deep" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-hand text-lg font-bold text-rose">Chapter {String(i + 2).padStart(2, '0')}</span>
                  <span className="block text-lg leading-tight font-extrabold text-ink">
                    {chapter.label}
                    {chapter.locked && <Lock className="ml-1.5 inline size-3.5 align-[-1px] text-rose" aria-label="(just for Nikitha — sign-in needed)" />}
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">{personalize(chapter.subtitle, name)}</span>
                </span>
                <ArrowUpRight
                  className="size-5 shrink-0 text-rose opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}
