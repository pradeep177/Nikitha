import { useEffect } from 'react'
import { useSiteSettings } from './useSiteSettings'

/** Sets a friendly document title like "Memories · Our Little Universe ♡". */
export function usePageTitle(title) {
  const { settings } = useSiteSettings()
  useEffect(() => {
    document.title = title ? `${title} · ${settings.site_title}` : settings.site_title
  }, [title, settings.site_title])
}
