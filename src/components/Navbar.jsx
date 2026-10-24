import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { motion } from 'framer-motion'
import { LayoutGrid, Lock } from 'lucide-react'
import AnimatedHeart from './AnimatedHeart'
import ChaptersMenu from './ChaptersMenu'
import Planet from './illustrations/Planet'
import { isChapterActive } from '@/app/chapters'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useVisibleChapters } from '@/hooks/useVisibleChapters'

export function Logo({ compact = false }) {
  const { settings } = useSiteSettings()
  return (
    <Link to="/" className="group flex min-h-12 items-center gap-2 rounded-full pr-2" aria-label={`${settings.site_title} — home`}>
      <Planet className="size-9 shrink-0 transition-transform duration-500 group-hover:rotate-12 min-[360px]:size-10" />
      <span className={`font-hand leading-none font-bold whitespace-nowrap text-ink ${compact ? 'text-2xl' : 'text-[1.45rem] min-[360px]:text-[1.7rem]'}`}>
        {settings.site_title.replace(/\s*♡\s*$/, '')}
        <span className="ml-1 text-berry">♡</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const chapters = useVisibleChapters()

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-blush-deep/50 bg-paper/80 py-1.5 pr-2 pl-3 shadow-card backdrop-blur-md"
      >
        <Logo />

        <ul className="hidden items-center gap-0.5 xl:flex">
          {chapters.map((chapter) => {
            const active = isChapterActive(chapter, pathname)
            return (
              <li key={chapter.id} className="relative">
                <NavLink
                  to={chapter.path}
                  end={chapter.path === '/'}
                  className={`relative z-10 block rounded-full px-3 py-2 text-sm font-bold transition-colors ${
                    active ? 'text-berry-deep' : 'text-ink-soft hover:text-berry-deep'
                  }`}
                >
                  {chapter.short}
                  {chapter.locked && <Lock className="ml-1 inline size-3 align-[-1px] opacity-60" aria-label="(sign-in needed)" />}
                </NavLink>
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-blush"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-1">
          <AnimatedHeart className="size-6 text-berry xl:hidden" />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="btn btn-soft hidden min-h-11 px-4 py-2 text-sm md:inline-flex xl:hidden"
            aria-haspopup="dialog"
          >
            <LayoutGrid className="size-4" aria-hidden="true" />
            Chapters
          </button>
          <AnimatedHeart className="mr-2 hidden size-6 text-berry xl:block" />
        </div>
      </nav>

      <ChaptersMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
