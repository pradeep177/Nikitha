import { useContext } from 'react'
import { SiteSettingsContext } from '@/context/siteSettingsContext'

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
