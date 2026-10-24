import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { motion } from 'framer-motion'
import { LayoutGrid } from 'lucide-react'
import ChaptersMenu from './ChaptersMenu'
import { MOBILE_PRIMARY_CHAPTERS, isChapterActive } from '@/app/chapters'
import { useVisibleChapters } from '@/hooks/useVisibleChapters'

/** Floating bottom tab bar for phones, with a "Chapters" sheet for everything else. */
export default function MobileNavigation() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const chapters = useVisibleChapters()
  const PRIMARY = MOBILE_PRIMARY_CHAPTERS.map((id) => chapters.find((c) => c.id === id)).filter(Boolean)
  const onSecondaryChapter = !PRIMARY.some((c) => isChapterActive(c, pathname))

  return (
    <>
      <nav aria-label="Chapters" className="safe-bottom fixed inset-x-0 bottom-0 z-40 px-3 md:hidden">
        <ul className="mx-auto flex max-w-md items-stretch justify-between rounded-[1.75rem] border border-blush-deep/60 bg-paper/90 p-1.5 shadow-lift backdrop-blur-md">
          {PRIMARY.map((chapter) => {
            const Icon = chapter.icon
            const active = isChapterActive(chapter, pathname)
            return (
              <li key={chapter.id} className="relative flex-1">
                <NavLink
                  to={chapter.path}
                  end={chapter.path === '/'}
                  className={`relative z-10 flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-3xl px-0.5 text-[0.62rem] font-extrabold min-[360px]:text-[0.68rem] transition-colors ${
                    active ? 'text-berry-deep' : 'text-ink-soft'
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" strokeWidth={active ? 2.6 : 2} />
                  <span className="max-w-full truncate">{chapter.tab ?? chapter.short}</span>
                </NavLink>
                {active && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-3xl bg-blush"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    aria-hidden="true"
                  />
                )}
              </li>
            )
          })}
          <li className="relative flex-1">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              className={`relative z-10 flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-3xl px-0.5 text-[0.62rem] font-extrabold min-[360px]:text-[0.68rem] ${
                onSecondaryChapter ? 'text-berry-deep' : 'text-ink-soft'
              }`}
            >
              <LayoutGrid className="size-5" aria-hidden="true" />
              <span>Chapters</span>
            </button>
            {onSecondaryChapter && (
              <motion.span
                layoutId="mobile-nav-pill"
                className="absolute inset-0 rounded-3xl bg-blush"
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                aria-hidden="true"
              />
            )}
          </li>
        </ul>
      </nav>
      <ChaptersMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
