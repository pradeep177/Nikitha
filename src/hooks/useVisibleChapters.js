import { useMemo } from 'react'
import { CHAPTERS } from '@/app/chapters'
import { useAuth } from './useAuth'
import { useSiteSettings } from './useSiteSettings'

/** 'public' | 'private' | 'hidden' for a section key (unknown keys are treated as private, like the database). */
export function sectionVisibility(settings, section) {
  if (!section) return 'public'
  return settings.section_visibility?.[section] ?? 'private'
}

/**
 * Chapters the current visitor should see in navigation, each annotated with
 * `locked` (private and not signed in as viewer). Hidden chapters only appear
 * for admins. In demo mode every chapter is shown.
 */
export function useVisibleChapters() {
  const { settings } = useSiteSettings()
  const { isAdmin, isViewer, isDemo } = useAuth()

  return useMemo(
    () =>
      CHAPTERS.map((chapter) => {
        const visibility = isDemo ? 'public' : sectionVisibility(settings, chapter.section)
        return { ...chapter, visibility, locked: visibility === 'private' && !isViewer }
      }).filter((chapter) => chapter.visibility !== 'hidden' || isAdmin),
    [settings, isAdmin, isViewer, isDemo],
  )
}
