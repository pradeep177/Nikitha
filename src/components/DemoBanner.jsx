import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FlaskConical, X } from 'lucide-react'
import { isDemoMode } from '@/lib/supabase'
import { useLocalStorage } from '@/hooks/useLocalStorage'

/** Discreet notice that the site is showing placeholder (demo) content. */
export default function DemoBanner() {
  const [dismissed, setDismissed] = useLocalStorage('olu:demo-banner-dismissed', false)
  const [expanded, setExpanded] = useState(false)
  if (!isDemoMode) return null

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 1.2 } }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed right-3 bottom-[6.5rem] z-30 flex max-w-[18rem] items-center gap-1 rounded-2xl border border-dashed border-lavender-deep bg-lavender/95 py-1 pr-1 pl-3 text-xs text-ink shadow-card backdrop-blur md:bottom-4"
          aria-label="Demo mode notice"
        >
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex items-start gap-2 py-1 text-left md:pointer-events-none"
            aria-expanded={expanded}
          >
            <FlaskConical className="mt-0.5 size-4 shrink-0 text-berry-deep" aria-hidden="true" />
            <span>
              <strong>Demo mode</strong>
              <span className={expanded ? 'inline' : 'hidden md:inline'}>
                {' '}
                — you're seeing placeholder content. Connect Supabase to show real memories.
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/60"
            aria-label="Dismiss demo notice"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
