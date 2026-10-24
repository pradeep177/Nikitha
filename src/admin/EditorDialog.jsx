import { useMemo, useRef, useState } from 'react'
import { Eye, Loader2, PencilLine, Save } from 'lucide-react'
import Modal from '@/components/Modal'
import FieldGrid from '@/components/admin/FieldGrid'
import UnsavedChangesGuard from './UnsavedChangesGuard'
import { isDirty, setIn, validateFields } from './forms'
import { useConfirm } from './ui/useAdminUI'
import { MediaSessionContext, useMediaSession } from './media/mediaSession'

/**
 * Create/edit dialog for one item: validated form + live preview.
 * Keeps the user's input if saving fails, and asks before discarding edits.
 */
export default function EditorDialog({ title, fields, initial, onSave, onSaved, onClose, renderPreview, context, isNew }) {
  const confirm = useConfirm()
  const formRef = useRef(null)
  const session = useMediaSession(fields)
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [tab, setTab] = useState('edit')
  const allFields = useMemo(() => fields.filter((f) => f.type !== 'heading'), [fields])
  const dirty = isDirty(allFields, initial, values)

  const setValue = (name, value) => {
    setValues((v) => setIn(v, name, value))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  const requestClose = async () => {
    if (saving) return
    if (dirty && !(await confirm({ title: 'Discard your changes?', message: "What you've typed here will be lost.", confirmLabel: 'Discard', danger: true }))) return
    onClose()
  }

  const submit = async (event) => {
    event?.preventDefault()
    const found = validateFields(allFields, values)
    setErrors(found)
    if (Object.keys(found).length) {
      setTab('edit')
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    setSaving(true)
    setSubmitError(null)
    try {
      await onSave(values)
    } catch (err) {
      setSubmitError(err.message)
      setSaving(false)
      return
    }
    // Saved: tidy up replaced/removed files (each checked against the DB first), then close.
    await session.afterSave(initial, values)
    onSaved()
  }

  return (
    <Modal open onClose={requestClose} title={title} variant="sheet" panelClassName="md:max-w-5xl">
      <UnsavedChangesGuard when={dirty && !saving} />
      {renderPreview && (
        <div className="mb-4 flex gap-1 rounded-full bg-blush/60 p-1 lg:hidden" role="tablist" aria-label="Editor view">
          {[
            ['edit', 'Edit', PencilLine],
            ['preview', 'Preview', Eye],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-bold ${tab === id ? 'bg-paper text-berry-deep shadow-sm' : 'text-ink-soft'}`}
            >
              <Icon className="size-4" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      )}

      <form ref={formRef} onSubmit={submit} noValidate>
        <MediaSessionContext.Provider value={session.context}>
        <div className={`grid gap-6 ${renderPreview ? 'lg:grid-cols-[1fr_19rem]' : ''}`}>
          <div className={tab === 'edit' ? '' : 'hidden lg:block'}>
            <FieldGrid fields={fields} values={values} errors={errors} setValue={setValue} context={context} />
          </div>
          {renderPreview && (
            <aside className={`${tab === 'preview' ? '' : 'hidden lg:block'}`} aria-label="Preview">
              <div className="lg:sticky lg:top-0">
                <p className="mb-2 text-xs font-extrabold tracking-[0.2em] text-rose uppercase">Preview</p>
                <div className="rounded-3xl bg-cream p-4 ring-1 ring-blush-deep/60">{renderPreview(values, context)}</div>
              </div>
            </aside>
          )}
        </div>

        {submitError && (
          <p role="alert" className="mt-5 rounded-2xl bg-lavender px-4 py-3 text-sm font-bold text-ink">
            Couldn't save: {submitError} Your changes are still here — please try again.
          </p>
        )}

        <div className="sticky -bottom-6 z-10 -mx-6 mt-6 flex flex-col-reverse gap-2 border-t border-blush-deep/50 bg-paper/95 px-6 py-4 backdrop-blur sm:flex-row sm:justify-end">
          <button type="button" onClick={requestClose} className="btn btn-soft" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
            {saving ? 'Saving…' : isNew ? 'Create' : 'Save changes'}
          </button>
        </div>
        </MediaSessionContext.Provider>
      </form>
    </Modal>
  )
}
