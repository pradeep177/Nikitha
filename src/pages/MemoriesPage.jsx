import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Images, MapPin } from 'lucide-react'
import PageShell from '@/components/PageShell'
import ContentState from '@/components/ContentState'
import FilterChips from '@/components/FilterChips'
import PhotoCard from '@/components/PhotoCard'
import Lightbox from '@/components/Lightbox'
import SmartImage from '@/components/SmartImage'
import PlaceholderBadge from '@/components/PlaceholderBadge'
import { useContent } from '@/hooks/useContent'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { formatDate } from '@/utils/format'

const PAGE_SIZE = 12

function MemoriesGallery({ memories, categories }) {
  const [filter, setFilter] = useState('all')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [openIndex, setOpenIndex] = useState(null)
  const [favorites, setFavorites] = useLocalStorage('olu:favorite-memories', [])

  const options = useMemo(() => {
    const used = new Set(memories.map((m) => m.category_id))
    return [
      { id: 'all', label: 'All memories' },
      ...(memories.some((m) => m.is_featured) ? [{ id: 'featured', label: 'Featured ♡' }] : []),
      ...categories.filter((c) => used.has(c.id)).map((c) => ({ id: c.id, label: c.name })),
      ...(favorites.length ? [{ id: 'hearts', label: 'My hearts' }] : []),
    ]
  }, [memories, categories, favorites.length])

  const filtered = useMemo(() => {
    if (filter === 'all') return memories
    if (filter === 'featured') return memories.filter((m) => m.is_featured)
    if (filter === 'hearts') return memories.filter((m) => favorites.includes(m.id))
    return memories.filter((m) => m.category_id === filter)
  }, [memories, filter, favorites])

  const shown = filtered.slice(0, visible)

  const toggleFavorite = (id) =>
    setFavorites((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const changeFilter = (id) => {
    setFilter(id)
    setVisible(PAGE_SIZE)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-5">
      {options.length > 2 && (
        <div className="mb-8">
          <FilterChips options={options} value={filter} onChange={changeFilter} label="Filter memories" layoutId="memory-filter" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="columns-2 gap-3 pt-3 sm:columns-3 sm:gap-5 lg:columns-4"
        >
          {shown.map((memory, i) => (
            <PhotoCard
              key={memory.id}
              memory={memory}
              index={i}
              onOpen={() => setOpenIndex(i)}
              isFavorite={favorites.includes(memory.id)}
              onToggleFavorite={() => toggleFavorite(memory.id)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p className="py-10 text-center font-hand text-2xl text-ink-soft">Nothing here yet — tap a heart on a photo you love ♡</p>
      )}

      {visible < filtered.length && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn btn-soft">
            Show more memories
          </button>
        </div>
      )}

      <Lightbox
        items={shown}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
        label="Memory viewer"
        renderMedia={(memory, i) =>
          memory.image_url ? (
            <SmartImage
              src={memory.image_url}
              alt={memory.alt_text || memory.caption || memory.title || ''}
              aspect={memory.width && memory.height ? `${memory.width}/${memory.height}` : memory.aspect || '4/5'}
              className="max-h-[68dvh] w-auto max-w-full rounded-xl bg-transparent shadow-lift"
              imgClassName="object-contain"
              eager
              seed={i}
            />
          ) : (
            <div className="w-[min(80vw,24rem)] overflow-hidden rounded-xl bg-white p-3 shadow-lift">
              <SmartImage src={null} aspect={memory.aspect || '4/5'} seed={i} placeholderLabel="Photo coming soon" />
            </div>
          )
        }
        renderCaption={(memory) => {
          const date = formatDate(memory.taken_on)
          return (
            <div>
              <p className="font-hand text-3xl font-bold">{memory.title}</p>
              {memory.caption && <p className="mt-1 text-white/85">{memory.caption}</p>}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/70">
                {date && <span>{date}</span>}
                {memory.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {memory.location}
                  </span>
                )}
                <PlaceholderBadge show={memory.is_placeholder} />
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}

export default function MemoriesPage() {
  const query = useContent('listMemories')
  return (
    <PageShell chapterId="memories">
      <ContentState
        query={query}
        loadingMessage="Unpacking the scrapbook…"
        isEmpty={(data) => !data?.memories?.length}
        empty={{
          icon: Images,
          title: 'Our memories are waiting to be added here ♡',
          message: 'Every photo we add will appear here like a little scrapbook page.',
        }}
      >
        {(data) => <MemoriesGallery memories={data.memories} categories={data.categories} />}
      </ContentState>
    </PageShell>
  )
}
