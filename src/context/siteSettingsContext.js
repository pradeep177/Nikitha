import { createContext } from 'react'
import { DEFAULT_SETTINGS } from '@/lib/defaults'

export const SiteSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: false,
})
