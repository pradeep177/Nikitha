import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { EyeOff, LockKeyhole } from 'lucide-react'
import EmptyState from './EmptyState'
import LoadingState from './LoadingState'
import SignInForm from './auth/SignInForm'
import { HeartShape } from './illustrations/Doodles'
import { useAuth } from '@/hooks/useAuth'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { sectionVisibility } from '@/hooks/useVisibleChapters'

/**
 * Shows a chapter's content only if the visitor may see it.
 * This is a friendly UI layer — the database (RLS) is what actually protects
 * private content, so even a tampered frontend gets no private rows.
 */
export default function SectionGate({ section, children }) {
  const { settings } = useSiteSettings()
  const { ready, isAdmin, isViewer, isDemo, user } = useAuth()
  const visibility = sectionVisibility(settings, section)

  if (!section || isDemo || visibility === 'public') return children
  if (!ready) return <LoadingState message="Checking who's here…" />

  if (visibility === 'hidden' && !isAdmin) {
    return (
      <div className="px-5">
        <EmptyState
          icon={EyeOff}
          title="This chapter is resting for now"
          message="It will be back soon ♡"
          action={
            <Link to="/" className="btn btn-soft">
              Back home
            </Link>
          }
        />
      </div>
    )
  }

  if (visibility === 'private' && !isViewer) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5">
        <div className="card-paper relative mx-auto max-w-md overflow-hidden px-6 py-8 sm:px-8">
          <HeartShape className="absolute -top-6 -right-6 size-24 rotate-12 text-blush" />
          <div className="relative mb-5 text-center">
            <span className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-lavender">
              <LockKeyhole className="size-7 text-berry-deep" aria-hidden="true" />
            </span>
            <h2 className="font-hand text-3xl font-bold text-ink">This chapter is just for {settings.her_name} ♡</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {user
                ? "You're signed in, but this account can't open private chapters."
                : 'Sign in with the account made for you to open it.'}
            </p>
          </div>
          {!user && <SignInForm submitLabel="Open this chapter" />}
        </div>
      </motion.div>
    )
  }

  return children
}
