import { RouterProvider } from 'react-router/dom'
import { MotionConfig } from 'framer-motion'
import AuthProvider from '@/context/AuthProvider'
import SiteSettingsProvider from '@/context/SiteSettingsProvider'
import { router } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <SiteSettingsProvider>
        {/* "user" = honour the visitor's OS-level reduced-motion preference everywhere */}
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
        </MotionConfig>
      </SiteSettingsProvider>
    </AuthProvider>
  )
}
