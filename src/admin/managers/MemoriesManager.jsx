import { useCallback, useEffect, useState } from 'react'
import { Check, Images, Pencil, Plus, Tag, Trash2, X } from 'lucide-react'
import CollectionManager from '../CollectionManager'
import { useConfirm, useToast } from '../ui/useAdminUI'
import PhotoCard from '@/components/PhotoCard'
import { adminApi } from '@/lib/adminApi'
import { mediaUrl } from '@/lib/storage'
import { inputClass } from '@/utils/ui'

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || `category-${Date.now().toString(36)}`

const fields = [
  { name: 'title', label: 'Title', required: true, maxLength: 120 },
  { name: 'caption', label: 'Caption', type: 'textarea', rows: 3, maxLength: 600, help: 'Shown handwritten under the photo.' },
  { name: 'image_path', label: 'Photo', type: 'media', media: { bucket: 'public-media', folder: 'memories', kind: 'image', maxDimension: 2000, dimensions: { width: 'image_width', height: 'image_height' } }, help: 'Large photos are resized to save space (longest side 2000px).' },
  { name: 'alt_text', label: 'Photo description (for screen readers)', maxLength: 300 },
  { name: 'taken_on', label: 'Date', type: 'date', full: false },
  { name: 'location', label: 'Location (optional)', maxLength: 120, full: false },
  {
    name: 'category_id',
    label: 'Category',
    type: 'select',
    emptyLabel: '— No category —',
    options: (ctx) => (ctx?.categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    full: false,
  },
  { name: 'is_featured', label: 'Featured', type: 'switch', onLabel: 'Shown under “Featured ♡”', full: false },
  { name: 'is_published', label: 'Published', type: 'switch', onLabel: 'Visible on the website', offLabel: 'Hidden (draft)' },
]

function CategoriesPanel({ categories, onChanged }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)

  const add = async (event) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      await adminApi.create('memory_categories', { name: trimmed, slug: slugify(trimmed) })
      setName('')
      onChanged()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const rename = async () => {
    if (!editing?.name.trim()) return
    try {
      await adminApi.update('memory_categories', editing.id, { name: editing.name.trim() })
      setEditing(null)
      onChanged()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const remove = async (category) => {
    const ok = await confirm({
      title: `Delete the “${category.name}” category?`,
      message: 'Memories in this category are kept — they just won’t have a category any more.',
      confirmLabel: 'Delete category',
      danger: true,
    })
    if (!ok) return
    try {
      await adminApi.remove('memory_categories', category)
      onChanged()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <details className="card-paper mb-6 p-4 sm:p-5">
      <summary className="flex cursor-pointer items-center gap-2 font-extrabold text-ink">
        <Tag className="size-4 text-berry-deep" aria-hidden="true" /> Categories ({categories.length})
      </summary>
      <ul className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-1 rounded-full bg-blush py-1 pr-1 pl-3 text-sm font-bold text-ink">
            {editing?.id === c.id ? (
              <>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), rename())}
                  className="w-36 rounded-full bg-paper px-2 py-0.5"
                  aria-label="Category name"
                  maxLength={60}
                  autoFocus
                />
                <button type="button" onClick={rename} className="grid size-7 place-items-center rounded-full hover:bg-paper" aria-label="Save name">
                  <Check className="size-3.5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setEditing(null)} className="grid size-7 place-items-center rounded-full hover:bg-paper" aria-label="Cancel">
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                {c.name}
                <button type="button" onClick={() => setEditing({ id: c.id, name: c.name })} className="grid size-7 place-items-center rounded-full hover:bg-paper" aria-label={`Rename ${c.name}`}>
                  <Pencil className="size-3.5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => remove(c)} className="grid size-7 place-items-center rounded-full hover:bg-paper" aria-label={`Delete ${c.name}`}>
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" aria-label="New category name" maxLength={60} className={`${inputClass} min-h-11 py-2`} />
        <button type="submit" disabled={busy || !name.trim()} className="btn btn-soft min-h-11 shrink-0 px-4 py-2">
          <Plus className="size-4" aria-hidden="true" /> Add
        </button>
      </form>
    </details>
  )
}

export default function MemoriesManager() {
  const [categories, setCategories] = useState([])
  const [nonce, setNonce] = useState(0)
  const refreshCategories = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    adminApi.list('memory_categories').then(setCategories, () => setCategories([]))
  }, [nonce])

  const categoryName = (id) => categories.find((c) => c.id === id)?.name

  return (
    <CollectionManager
      table="memories"
      title="Memories"
      description="Your scrapbook of photos together. Use the arrows to change the order."
      noun="memory"
      emptyIcon={Images}
      fields={fields}
      context={{ categories }}
      itemTitle={(row) => row.title}
      itemSubtitle={(row) => row.caption}
      itemThumb={(row) => (row.image_path ? { bucket: 'public-media', path: row.image_path } : null)}
      itemBadges={(row) => [row.is_featured && 'Featured', categoryName(row.category_id)].filter(Boolean)}
      renderPreview={(values) => (
        <div className="mx-auto max-w-[15rem]">
          <PhotoCard memory={{ ...values, image_url: mediaUrl('public-media', values.image_path) }} index={0} onOpen={() => {}} />
        </div>
      )}
    >
      <CategoriesPanel categories={categories} onChanged={refreshCategories} />
    </CollectionManager>
  )
}
