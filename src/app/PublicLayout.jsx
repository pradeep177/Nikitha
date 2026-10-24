import { useLocation, useOutlet } from 'react-router'
import { AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import MobileNavigation from '@/components/MobileNavigation'
import FloatingDecorations from '@/components/FloatingDecorations'
import PageTransition from '@/components/PageTransition'
import SiteFooter from '@/components/SiteFooter'
import DemoBanner from '@/components/DemoBanner'
import FlirtyPopup from '@/components/FlirtyPopup'

/** Frame shared by every public chapter. */
export default function PublicLayout() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div className="relative flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <FloatingDecorations />
      <Navbar />
      <main id="main" tabIndex={-1} className="relative z-10 flex-1 outline-none">
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0 })}>
          <PageTransition key={location.pathname}>{outlet}</PageTransition>
        </AnimatePresence>
      </main>
      <SiteFooter />
      <MobileNavigation />
      <FlirtyPopup />
      <DemoBanner />
    </div>
  )
}
