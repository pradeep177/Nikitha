import { LogOut } from 'lucide-react'
import AnimatedHeart from './AnimatedHeart'
import { useAuth } from '@/hooks/useAuth'
import { useFlirtyPreference } from '@/hooks/useFlirtyPreference'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function SiteFooter() {
  const { settings } = useSiteSettings()
  const { user, isDemo, signOut } = useAuth()
  const { paused, setPaused } = useFlirtyPreference()

  return (
    <footer className="relative z-10 px-5 pt-16 pb-32 text-center md:pb-10">
      <p className="inline-flex items-center gap-2 font-hand text-2xl text-ink-soft">
        {settings.signature}
        <AnimatedHeart className="size-5 text-berry" />
      </p>
      {settings.flirty_popups_enabled !== false && (
        <p className="mt-2 text-xs text-ink-soft">
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            aria-pressed={!paused}
            className="inline-flex min-h-8 items-center gap-1 rounded-full px-2 font-bold hover:bg-blush hover:text-berry-deep"
          >
            ♡ Little pop-up notes: {paused ? 'paused — tap to turn back on' : 'on'}
          </button>
        </p>
      )}
      {user && !isDemo && (
        <p className="mt-3 text-xs text-ink-soft">
          Signed in as {user.email}
          <button
            type="button"
            onClick={() => signOut().catch(() => {})}
            className="ml-2 inline-flex min-h-8 items-center gap-1 rounded-full px-2 font-bold text-berry-deep hover:bg-blush"
          >
            <LogOut className="size-3.5" aria-hidden="true" /> Sign out
          </button>
        </p>
      )}
    </footer>
  )
}
