import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, FlaskConical, LogOut, Menu, X } from 'lucide-react'
import Planet from '@/components/illustrations/Planet'
import { ADMIN_NAV } from './adminNav'
import { useAuth } from '@/hooks/useAuth'
import { useDialog } from '@/hooks/useDialog'
import AdminUIProvider from './ui/AdminUIProvider'

function NavItems({ onNavigate }) {
  return (
    <ul className="space-y-1">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon
        return (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold transition ${
                  isActive ? 'bg-berry-deep text-white shadow-soft' : 'text-ink-soft hover:bg-blush hover:text-berry-deep'
                }`
              }
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}

function AccountBox() {
  const { user, isDemo, signOut } = useAuth()
  return (
    <div className="space-y-2 border-t border-blush-deep/50 pt-4">
      <Link to="/" target="_blank" className="flex min-h-11 items-center gap-2 rounded-2xl px-3 text-sm font-bold text-ink-soft hover:bg-blush">
        <ExternalLink className="size-4" aria-hidden="true" /> View website
      </Link>
      <p className="truncate px-3 text-xs text-ink-soft" title={user?.email}>
        {isDemo ? 'Demo preview' : user?.email}
      </p>
      <button
        type="button"
        onClick={() => signOut().catch(() => {})}
        className="flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 text-sm font-bold text-ink-soft hover:bg-blush hover:text-berry-deep"
      >
        <LogOut className="size-4" aria-hidden="true" /> {isDemo ? 'Leave preview' : 'Sign out'}
      </button>
    </div>
  )
}

function Brand() {
  return (
    <Link to="/admin" className="flex items-center gap-2">
      <Planet className="size-9" />
      <span className="leading-tight">
        <span className="block font-hand text-2xl font-bold text-ink">Our Little Universe</span>
        <span className="block text-[0.65rem] font-extrabold tracking-[0.2em] text-rose uppercase">Admin room</span>
      </span>
    </Link>
  )
}

function MobileDrawer({ open, onClose }) {
  const panelRef = useRef(null)
  useDialog(open, onClose, panelRef)
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div className="absolute inset-0 bg-ink/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.nav
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="safe-bottom absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto bg-paper p-4 shadow-lift outline-none"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full hover:bg-blush" aria-label="Close menu">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1">
              <NavItems onNavigate={onClose} />
            </div>
            <AccountBox />
          </motion.nav>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default function AdminLayout() {
  const { isDemo } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-cream lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 overflow-y-auto border-r border-blush-deep/50 bg-paper/80 p-5 lg:flex">
        <Brand />
        <nav aria-label="Admin" className="flex-1">
          <NavItems />
        </nav>
        <AccountBox />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-blush-deep/50 bg-paper/90 px-4 py-2 backdrop-blur lg:hidden">
          <Brand />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="grid size-11 place-items-center rounded-full hover:bg-blush"
            aria-label="Open admin menu"
            aria-haspopup="dialog"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </header>

        {isDemo && (
          <div role="status" className="flex items-start gap-2 border-b border-dashed border-lavender-deep bg-lavender px-4 py-2.5 text-sm text-ink md:px-8">
            <FlaskConical className="mt-0.5 size-4 shrink-0 text-berry-deep" aria-hidden="true" />
            <p>
              <strong>Demo mode — sandbox preview.</strong> Edits only live in this browser tab and vanish on reload. Connect Supabase to
              save for real.
            </p>
          </div>
        )}

        <main id="admin-main" className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
          <AdminUIProvider>
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <Outlet />
            </motion.div>
          </AdminUIProvider>
        </main>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
