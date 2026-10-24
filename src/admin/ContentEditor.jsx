import { useEffect, useMemo, useState } from 'react'
import { Loader2, RotateCcw, Save } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import FieldGrid from '@/components/admin/FieldGrid'
import LoadingState from '@/components/LoadingState'
import ErrorState from '@/components/ErrorState'
import UnsavedChangesGuard from './UnsavedChangesGuard'
import { isDirty, setIn, validateFields } from './forms'
import { useToast } from './ui/useAdminUI'
import { MediaSessionContext, useMediaSession } from './media/mediaSession'
import { adminApi } from '@/lib/adminApi'
import { isDemoMode } from '@/lib/supabase'

/**
 * Editor for single-row content (landing page, final surprise, settings):
 * form + live preview + sticky save bar + unsaved-changes protection.
 */
export default function ContentEditor({ table, title, description, fields, defaults = {}, renderPreview, context, intro }) {
  const toast = useToast()
  const session = useMediaSession(fields)
  const [initial, setInitial] = useState(null)
  const [values, setValues] = useState(null)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [nonce, setNonce] = useState(0)
  const allFields = useMemo(() => fields.filter((f) => f.type !== 'heading'), [fields])

  useEffect(() => {
    let cancelled = false
    adminApi.getSingleton(table).then(
      (row) => {
        if (cancelled) return
        const merged = { ...structuredClone(defaults), ...(row ?? {}) }
        setInitial(merged)
        setValues(merged)
        setError(null)
      },
      (err) => !cancelled && setError(err),
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, nonce])

  const dirty = !!values && isDirty(allFields, initial, values)

  const setValue = (name, value) => {
    setValues((v) => setIn(v, name, value))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const found = validateFields(allFields, values)
    setErrors(found)
    if (Object.keys(found).length) {
      toast.error('Please fix the highlighted fields.')
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    setSaving(true)
    try {
      const saved = await adminApi.saveSingleton(table, values)
      await session.afterSave(initial, values)
      const merged = { ...structuredClone(defaults), ...saved }
      setInitial(merged)
      setValues(merged)
      toast.success(`Saved ♡${isDemoMode ? ' (demo — kept in this tab only)' : ''}`)
    } catch (err) {
      toast.error(`Couldn't save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const header = <AdminPageHeader title={title} description={description} />
  if (error && !values) {
    return (
      <>
        {header}
        <ErrorState message={error.message} onRetry={() => setNonce((n) => n + 1)} />
      </>
    )
  }
  if (!values) {
    return (
      <>
        {header}
        <LoadingState message="Loading…" />
      </>
    )
  }

  return (
    <form onSubmit={submit} noValidate>
      <UnsavedChangesGuard when={dirty && !saving} />
      {header}
      {intro}
      <div className={`grid gap-6 ${renderPreview ? 'xl:grid-cols-[1fr_22rem]' : ''}`}>
        <div className="card-paper p-5 sm:p-6">
          <MediaSessionContext.Provider value={session.context}>
            <FieldGrid fields={fields} values={values} errors={errors} setValue={setValue} context={context} />
          </MediaSessionContext.Provider>
        </div>
        {renderPreview && (
          <aside aria-label="Preview">
            <div className="xl:sticky xl:top-6">
              <p className="mb-2 text-xs font-extrabold tracking-[0.2em] text-rose uppercase">Preview</p>
              <div className="rounded-3xl bg-cream p-4 ring-1 ring-blush-deep/60">{renderPreview(values, context)}</div>
            </div>
          </aside>
        )}
      </div>

      <div className="sticky bottom-3 z-20 mt-6 flex flex-wrap items-center justify-end gap-2 rounded-3xl border border-blush-deep/60 bg-paper px-4 py-3 shadow-lift">
        <p className="mr-auto text-sm font-bold text-ink-soft" aria-live="polite">
          {dirty ? 'You have unsaved changes' : 'All changes saved'}
        </p>
        <button
          type="button"
          onClick={() => {
            session.discard()
            setValues(initial)
            setErrors({})
          }}
          disabled={!dirty || saving}
          className="btn btn-ghost"
        >
          <RotateCcw className="size-4" aria-hidden="true" /> Discard
        </button>
        <button type="submit" disabled={!dirty || saving} className="btn btn-primary">
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
