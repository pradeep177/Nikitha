import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, PencilLine, Sparkles } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { ADMIN_NAV } from './adminNav'
import { adminApi } from '@/lib/adminApi'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'

const COUNTED = ADMIN_NAV.filter((item) => item.table)

export default function AdminDashboard() {
  usePageTitle('Admin')
  const { user, isDemo } = useAuth()
  const [counts, setCounts] = useState({})
  const [extra, setExtra] = useState({ placeholders: null, attempts: null })

  useEffect(() => {
    let cancelled = false
    Promise.allSettled(COUNTED.map((item) => adminApi.count(item.table))).then((results) => {
      if (cancelled) return
      const next = {}
      results.forEach((r, i) => (next[COUNTED[i].table] = r.status === 'fulfilled' ? r.value : '–'))
      setCounts(next)
    })
    Promise.allSettled([adminApi.placeholderCount(), adminApi.listQuizAttempts()]).then(([p, a]) => {
      if (cancelled) return
      setExtra({
        placeholders: p.status === 'fulfilled' ? p.value : null,
        attempts: a.status === 'fulfilled' ? a.value.length : null,
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <AdminPageHeader
        title="Welcome back ♡"
        description={isDemo ? 'Demo preview of the admin room — edits stay in this browser tab only.' : `Signed in securely as ${user?.email}.`}
      />

      {extra.placeholders > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start gap-3 rounded-3xl border border-dashed border-lavender-deep bg-lavender/70 p-4 text-sm text-ink">
          <PencilLine className="mt-0.5 size-5 shrink-0 text-berry-deep" aria-hidden="true" />
          <p>
            <strong>{extra.placeholders} placeholder items</strong> are still showing example wording. Edit or delete them so everything
            on the website is truly yours — especially the quiz answers.
          </p>
        </motion.div>
      )}

      <h2 className="mb-3 font-hand text-3xl font-bold text-ink">At a glance</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {COUNTED.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.li key={item.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={item.path} className="card-paper group flex h-full flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-xl bg-blush">
                    <Icon className="size-4 text-berry-deep" aria-hidden="true" />
                  </span>
                  <ArrowRight className="size-4 text-rose opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                </span>
                <span className="font-hand text-4xl leading-none font-bold text-ink">{counts[item.table] ?? '…'}</span>
                <span className="text-sm font-bold text-ink-soft">{item.label}</span>
              </Link>
            </motion.li>
          )
        })}
        <li>
          <Link to="/admin/quiz-results" className="card-paper group flex h-full flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
            <span className="grid size-9 place-items-center rounded-xl bg-butter">
              <BarChart3 className="size-4 text-berry-deep" aria-hidden="true" />
            </span>
            <span className="font-hand text-4xl leading-none font-bold text-ink">{extra.attempts ?? '…'}</span>
            <span className="text-sm font-bold text-ink-soft">Quiz results</span>
          </Link>
        </li>
      </ul>

      <h2 className="mt-10 mb-3 font-hand text-3xl font-bold text-ink">Shortcuts</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ['/admin/landing', 'Change her hero photo & welcome words'],
          ['/admin/quiz', 'Add the real quiz answers'],
          ['/admin/memories', 'Add a new memory'],
          ['/admin/surprise', 'Update the final surprise'],
          ['/admin/settings', 'Privacy, theme & her name'],
        ].map(([to, label]) => (
          <Link key={to} to={to} className="flex min-h-14 items-center gap-3 rounded-2xl bg-paper px-4 py-3 font-bold text-ink shadow-card transition hover:bg-blush">
            <Sparkles className="size-4 shrink-0 text-berry" aria-hidden="true" /> {label}
          </Link>
        ))}
      </div>
    </>
  )
}
