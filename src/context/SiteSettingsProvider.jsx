import { useEffect, useMemo } from 'react'
import { SiteSettingsContext } from './siteSettingsContext'
import { DEFAULT_SETTINGS } from '@/lib/defaults'
import { useContent } from '@/hooks/useContent'

export default function SiteSettingsProvider({ children }) {
  const { data, loading } = useContent('getSettings')

  // Defaults fill any gaps, so a missing/failed settings row never breaks the site.
  const settings = useMemo(
    () => ({
      ...DEFAULT_SETTINGS,
      ...(data ?? {}),
      quiz_result_messages: { ...DEFAULT_SETTINGS.quiz_result_messages, ...(data?.quiz_result_messages ?? {}) },
    }),
    [data],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme || 'blush'
  }, [settings.theme])

  const value = useMemo(() => ({ settings, loading }), [settings, loading])

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}
