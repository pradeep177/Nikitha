import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getChapterIndex } from '@/app/chapters'
import { useVisibleChapters } from '@/hooks/useVisibleChapters'

/** "Previous / next chapter" links so the site reads like one continuous story. */
export default function ChapterFooter({ chapterId }) {
  const chapters = useVisibleChapters()
  const index = getChapterIndex(chapterId, chapters)
  if (index < 0) return null
  const prev = chapters[index - 1]
  const next = chapters[index + 1]

  return (
    <motion.nav
      aria-label="Continue the story"
      className="mx-auto mt-16 grid max-w-4xl gap-3 px-5 sm:grid-cols-2"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
    >
      {prev ? (
        <Link
          to={prev.path}
          className="card-paper group flex min-h-20 items-center gap-4 px-5 py-4 transition hover:-translate-y-1 hover:shadow-lift"
        >
          <ArrowLeft className="size-5 shrink-0 text-berry transition group-hover:-translate-x-1" aria-hidden="true" />
          <span>
            <span className="block text-xs font-bold tracking-wide text-ink-soft uppercase">Previous chapter</span>
            <span className="font-hand text-2xl font-bold text-ink">{prev.label}</span>
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <Link
          to={next.path}
          className="card-paper group flex min-h-20 items-center justify-end gap-4 px-5 py-4 text-right transition hover:-translate-y-1 hover:shadow-lift"
        >
          <span>
            <span className="block text-xs font-bold tracking-wide text-ink-soft uppercase">Next chapter</span>
            <span className="font-hand text-2xl font-bold text-ink">{next.label}</span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-berry transition group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      ) : (
        <Link
          to="/"
          className="card-paper group flex min-h-20 items-center justify-end gap-4 px-5 py-4 text-right transition hover:-translate-y-1 hover:shadow-lift"
        >
          <span>
            <span className="block text-xs font-bold tracking-wide text-ink-soft uppercase">The end… for now</span>
            <span className="font-hand text-2xl font-bold text-ink">Back to the beginning ♡</span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-berry transition group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      )}
    </motion.nav>
  )
}
