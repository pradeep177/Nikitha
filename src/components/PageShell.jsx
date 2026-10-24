import { motion } from 'framer-motion'
import ChapterIndicator from './ChapterIndicator'
import ChapterFooter from './ChapterFooter'
import SectionGate from './SectionGate'
import { Squiggle } from './illustrations/Doodles'
import { getChapter, personalize } from '@/app/chapters'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useSiteSettings } from '@/hooks/useSiteSettings'

const BACKDROPS = {
  blush: 'from-blush/80',
  peach: 'from-peach/80',
  lavender: 'from-lavender/80',
  butter: 'from-butter/80',
}

const headerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 160, damping: 20 } },
}

/**
 * Shared frame for every chapter page: title, chapter indicator,
 * section-tinted backdrop and "continue the story" footer.
 */
export default function PageShell({ chapterId, title, subtitle, children, showHeader = true, showFooter = true }) {
  const chapter = getChapter(chapterId)
  const { settings } = useSiteSettings()
  const heading = personalize(title ?? chapter?.title, settings.her_name)
  const description = personalize(subtitle ?? chapter?.subtitle, settings.her_name)

  usePageTitle(chapter?.id === 'home' ? null : chapter?.label)

  return (
    <div className="relative">
      <div
        className={`pointer-events-none absolute inset-x-0 -top-24 h-[28rem] bg-gradient-to-b ${
          BACKDROPS[chapter?.tint] ?? BACKDROPS.blush
        } to-transparent`}
        aria-hidden="true"
      />

      {showHeader && (
        <motion.header
          className="relative mx-auto max-w-3xl px-5 pt-10 pb-8 text-center md:pt-14"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div variants={headerItem}>
            <ChapterIndicator chapterId={chapterId} />
          </motion.div>
          <motion.h1
            variants={headerItem}
            className="mt-5 font-hand text-5xl leading-[1.05] font-bold text-balance text-ink sm:text-6xl"
          >
            {heading}
          </motion.h1>
          <motion.div variants={headerItem} className="mx-auto mt-2 w-36 text-berry/70">
            <Squiggle />
          </motion.div>
          {description && (
            <motion.p variants={headerItem} className="mx-auto mt-3 max-w-xl text-lg text-pretty text-ink-soft">
              {description}
            </motion.p>
          )}
        </motion.header>
      )}

      <div className="relative min-h-[60dvh]">
        <SectionGate section={chapter?.section}>{children}</SectionGate>
      </div>

      {showFooter && <ChapterFooter chapterId={chapterId} />}
    </div>
  )
}
