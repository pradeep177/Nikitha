import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Archive, ArchiveRestore, ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Switch from '@/components/admin/Switch'
import SmartImage from '@/components/SmartImage'
import LoadingState from '@/components/LoadingState'
import ErrorState from '@/components/ErrorState'
import EmptyState from '@/components/EmptyState'
import EditorDialog from './EditorDialog'
import { useConfirm, useToast } from './ui/useAdminUI'
import { adminApi } from '@/lib/adminApi'
import { isDemoMode } from '@/lib/supabase'
import { MediaThumb } from '@/components/admin/MediaPreview'
import { inputClass } from '@/utils/ui'

function Badge({ children, tone = 'blush' }) {
  const tones = {
    blush: 'bg-blush text-berry-deep',
    lavender: 'bg-lavender text-ink-soft',
    butter: 'bg-butter text-ink',
    ink: 'bg-ink/10 text-ink-soft',
  }
  return <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-extrabold tracking-wide uppercase ${tones[tone]}`}>{children}</span>
}

/**
 * Generic list manager: create, edit, reorder, publish/unpublish, archive and
 * delete rows of one table — driven entirely by configuration.
 */
export default function CollectionManager({
  table,
  title,
  description,
  noun = 'item',
  fields,
  defaults = {},
  itemTitle,
  itemSubtitle,
  itemThumb,
  itemBadges,
  renderPreview,
  publishable = true,
  orderable = true,
  archivable = false,
  context,
  emptyIcon,
  load = () => adminApi.list(table),
  save,
  remove = (row) => adminApi.remove(table, row),
  toFormValues = (row) => row,
  children,
}) {
  const toast = useToast()
  const confirm = useConfirm()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const [nonce, setNonce] = useState(0)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    let cancelled = false
    load().then(
      (data) => !cancelled && (setRows(data ?? []), setError(null)),
      (err) => !cancelled && setError(err),
    )
    return () => {
      cancelled = true
    }
    // `load` is a stable config function per page; reload is driven by nonce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  const visibleRows = useMemo(() => {
    let list = rows ?? []
    if (archivable && !showArchived) list = list.filter((r) => !r.is_archived)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((r) => `${itemTitle(r)} ${itemSubtitle?.(r) ?? ''}`.toLowerCase().includes(q))
    }
    return list
  }, [rows, archivable, showArchived, query, itemTitle, itemSubtitle])

  const canReorder = orderable && !query.trim() && (!archivable || showArchived)
  const drafts = (rows ?? []).filter((r) => publishable && r.is_published === false).length
  const placeholders = (rows ?? []).filter((r) => r.is_placeholder).length
  const savedNote = isDemoMode ? ' (demo — kept in this tab only)' : ''

  const handleSave = async (values) => {
    const isNew = !editing.row
    if (save) await save(values, editing.row)
    else if (isNew) await adminApi.create(table, values)
    else await adminApi.update(table, editing.row.id, values)
    toast.success(`${isNew ? 'Created' : 'Saved'} ♡${savedNote}`)
  }

  const handleSaved = () => {
    setEditing(null)
    reload()
  }

  const togglePublished = async (row) => {
    const next = !row.is_published
    setRows((list) => list.map((r) => (r.id === row.id ? { ...r, is_published: next } : r)))
    try {
      await adminApi.patch(table, row.id, { is_published: next })
      toast.success(next ? 'Published — it is now visible on the website.' : 'Unpublished — hidden from the website.')
    } catch (err) {
      setRows((list) => list.map((r) => (r.id === row.id ? { ...r, is_published: !next } : r)))
      toast.error(err.message)
    }
  }

  const toggleArchived = async (row) => {
    try {
      await adminApi.patch(table, row.id, { is_archived: !row.is_archived })
      toast.success(row.is_archived ? 'Restored from the archive.' : 'Archived — hidden from the website but kept safe.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const move = async (index, step) => {
    const list = [...visibleRows]
    const target = index + step
    if (target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    const previous = rows
    const ids = list.map((r) => r.id)
    setRows((all) => [...all].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)))
    try {
      await adminApi.reorder(table, ids)
    } catch (err) {
      setRows(previous)
      toast.error(`Couldn't reorder: ${err.message}`)
    }
  }

  const handleDelete = async (row) => {
    const ok = await confirm({
      title: `Delete “${itemTitle(row)}”?`,
      message: 'This permanently removes it from the website and cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await remove(row)
      toast.success(`Deleted.${savedNote}`)
      reload()
    } catch (err) {
      toast.error(`Couldn't delete: ${err.message}`)
    }
  }

  const header = (
    <AdminPageHeader
      title={title}
      description={description}
      actions={
        <button type="button" onClick={() => setEditing({ row: null })} className="btn btn-primary">
          <Plus className="size-4" aria-hidden="true" /> Add {noun}
        </button>
      }
    />
  )

  if (error && !rows) {
    return (
      <>
        {header}
        <ErrorState message={error.message} onRetry={reload} />
      </>
    )
  }
  if (!rows) {
    return (
      <>
        {header}
        <LoadingState message="Loading…" />
      </>
    )
  }

  return (
    <>
      {header}
      {children}

      {rows.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-ink-soft">
            {rows.length} {rows.length === 1 ? noun : `${noun}s`}
            {drafts > 0 && ` · ${drafts} unpublished`}
            {placeholders > 0 && ` · ${placeholders} placeholder${placeholders === 1 ? '' : 's'} still to personalise`}
          </p>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {archivable && (
              <label className="flex items-center gap-2 text-sm font-bold text-ink-soft">
                <Switch size="sm" checked={showArchived} onChange={setShowArchived} label="Show archived" /> Show archived
              </label>
            )}
            {rows.length > 6 && (
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  aria-label={`Search ${noun}s`}
                  className={`${inputClass} min-h-10 w-56 py-1.5 pl-9`}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={`No ${noun}s yet`}
          message={`Add your first ${noun} and it will appear on the website.`}
          action={
            <button type="button" onClick={() => setEditing({ row: null })} className="btn btn-primary">
              <Plus className="size-4" aria-hidden="true" /> Add {noun}
            </button>
          }
        />
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {visibleRows.map((row, index) => {
              const thumb = itemThumb?.(row)
              return (
                <motion.li
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`card-paper flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:p-4 ${row.is_published === false || row.is_archived ? 'opacity-75' : ''}`}
                >
                  {canReorder && (
                    <div className="flex shrink-0 flex-col">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-blush disabled:opacity-30"
                        aria-label={`Move “${itemTitle(row)}” up`}
                      >
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === visibleRows.length - 1}
                        className="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-blush disabled:opacity-30"
                        aria-label={`Move “${itemTitle(row)}” down`}
                      >
                        <ArrowDown className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}

                  {thumb !== undefined &&
                    (thumb ? (
                      <MediaThumb bucket={thumb.bucket} path={thumb.path} seed={index} />
                    ) : (
                      <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-blush/60">
                        <SmartImage src={null} alt="" aspect="1/1" className="size-full" placeholderLabel="" seed={index} />
                      </div>
                    ))}

                  <div className="min-w-0 flex-1 basis-40">
                    <p className="truncate font-extrabold text-ink">{itemTitle(row)}</p>
                    {itemSubtitle && <p className="line-clamp-2 text-sm text-ink-soft">{itemSubtitle(row)}</p>}
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {publishable && row.is_published === false && <Badge tone="ink">Draft</Badge>}
                      {row.is_archived && <Badge tone="ink">Archived</Badge>}
                      {row.is_placeholder && <Badge tone="lavender">Placeholder</Badge>}
                      {itemBadges?.(row)?.map((b) => (
                        <Badge key={b} tone="butter">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
                    {publishable && (
                      <label className="mr-2 flex items-center gap-2 text-xs font-bold text-ink-soft">
                        <Switch size="sm" checked={row.is_published !== false} onChange={() => togglePublished(row)} label={`Published: ${itemTitle(row)}`} />
                        <span className="hidden sm:inline">{row.is_published !== false ? 'Live' : 'Draft'}</span>
                      </label>
                    )}
                    {archivable && (
                      <button
                        type="button"
                        onClick={() => toggleArchived(row)}
                        className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-blush"
                        aria-label={row.is_archived ? `Restore “${itemTitle(row)}”` : `Archive “${itemTitle(row)}”`}
                        title={row.is_archived ? 'Restore' : 'Archive'}
                      >
                        {row.is_archived ? <ArchiveRestore className="size-4" aria-hidden="true" /> : <Archive className="size-4" aria-hidden="true" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditing({ row })}
                      className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-blush hover:text-berry-deep"
                      aria-label={`Edit “${itemTitle(row)}”`}
                      title="Edit"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-blush hover:text-berry-deep"
                      aria-label={`Delete “${itemTitle(row)}”`}
                      title="Delete"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
          {visibleRows.length === 0 && <p className="py-6 text-center text-sm text-ink-soft">Nothing matches your search.</p>}
        </ul>
      )}

      {editing && (
        <EditorDialog
          key={editing.row?.id ?? 'new'}
          title={editing.row ? `Edit ${noun}` : `New ${noun}`}
          isNew={!editing.row}
          fields={fields}
          initial={editing.row ? toFormValues(editing.row) : { is_published: true, ...structuredClone(defaults) }}
          onSave={handleSave}
          onSaved={handleSaved}
          onClose={() => setEditing(null)}
          renderPreview={renderPreview}
          context={context}
        />
      )}
    </>
  )
}
