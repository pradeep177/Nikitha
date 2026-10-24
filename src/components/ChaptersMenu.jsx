import { Link, useLocation } from 'react-router'
import { motion } from 'framer-motion'
import Modal from './Modal'
import { Lock } from 'lucide-react'
import { isChapterActive } from '@/app/chapters'
import { useVisibleChapters } from '@/hooks/useVisibleChapters'

const TINTS = {
  blush: 'bg-blush',
  peach: 'bg-peach',
  lavender: 'bg-lavender',
  butter: 'bg-butter',
}

/** Storybook-style "table of contents" listing every chapter. */
export default function ChaptersMenu({ open, onClose }) {
  const { pathname } = useLocation()
  const chapters = useVisibleChapters()

  return (
    <Modal open={open} onClose={onClose} title="Choose a chapter ♡" variant="sheet">
      <p className="mb-5 text-ink-soft">Every chapter is a little piece of our story.</p>
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {chapters.map((chapter, index) => {
          const Icon = chapter.icon
          const active = isChapterActive(chapter, pathname)
          return (
            <motion.li
              key={chapter.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * index }}
            >
              <Link
                to={chapter.path}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={`group flex h-full min-h-28 flex-col justify-between rounded-3xl p-4 transition hover:-translate-y-1 hover:shadow-card ${
                  TINTS[chapter.tint]
                } ${active ? 'ring-3 ring-berry' : ''}`}
              >
                <span className="flex items-center justify-between">
                  <span className="font-hand text-xl font-bold text-berry-deep">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <Icon className="size-5 text-berry-deep transition group-hover:scale-110" aria-hidden="true" />
                </span>
                <span className="mt-3 text-sm leading-tight font-extrabold text-ink">
                  {chapter.label}
                  {chapter.locked && <Lock className="ml-1 inline size-3 opacity-60" aria-label="(sign-in needed)" />}
                </span>
              </Link>
            </motion.li>
          )
        })}
      </ol>
    </Modal>
  )
}
