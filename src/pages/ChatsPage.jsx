import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircleHeart } from 'lucide-react'
import PageShell from '@/components/PageShell'
import ContentState from '@/components/ContentState'
import FilterChips from '@/components/FilterChips'
import PhoneFrame from '@/components/PhoneFrame'
import Lightbox from '@/components/Lightbox'
import PlaceholderBadge from '@/components/PlaceholderBadge'
import { HeartShape, Sparkle } from '@/components/illustrations/Doodles'
import { CHAT_COLLECTIONS } from '@/lib/defaults'
import { useContent } from '@/hooks/useContent'
import { formatDate } from '@/utils/format'

function ChatGallery({ chats }) {
  const [filter, setFilter] = useState('all')
  const [openIndex, setOpenIndex] = useState(null)

  const options = useMemo(() => {
    const used = new Set(chats.map((c) => c.collection))
    return [{ id: 'all', label: 'All chats' }, ...CHAT_COLLECTIONS.filter((c) => used.has(c.id))]
  }, [chats])

  const shown = filter === 'all' ? chats : chats.filter((c) => c.collection === filter)

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-5">
      {options.length > 2 && (
        <div className="mb-8">
          <FilterChips options={options} value={filter} onChange={setFilter} label="Filter conversations" layoutId="chat-filter" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.ul
          key={filter}
          className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {shown.map((chat, i) => {
            const tilt = [-2, 1.5, -1, 2.2][i % 4]
            const date = formatDate(chat.chat_date, { day: 'numeric', month: 'short', year: 'numeric' })
            return (
              <motion.li
                key={chat.id}
                className="relative"
                initial={{ opacity: 0, y: 40, rotate: tilt * 2 }}
                whileInView={{ opacity: 1, y: 0, rotate: tilt }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: (i % 4) * 0.07 }}
                whileHover={{ rotate: 0, y: -6 }}
              >
                {i % 3 === 0 && <HeartShape className="absolute -top-3 -right-2 z-10 size-7 rotate-12 text-berry/80" />}
                {i % 3 === 1 && <Sparkle className="absolute -top-3 -left-2 z-10 size-6 text-butter-deep" />}
                <button
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  className="block w-full rounded-[2.2rem] text-left"
                  aria-label={`Open conversation${chat.caption ? `: ${chat.caption}` : ''}`}
                >
                  <PhoneFrame src={chat.image_url} alt={chat.alt_text || chat.caption || 'Chat screenshot'} seed={i} />
                </button>
                <div className="mt-3 px-1 text-center">
                  {chat.caption && <p className="font-hand text-xl leading-tight text-ink">{chat.caption}</p>}
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-rose">
                    {date && <span>{date}</span>}
                    <PlaceholderBadge show={chat.is_placeholder} />
                  </div>
                </div>
              </motion.li>
            )
          })}
        </motion.ul>
      </AnimatePresence>

      <Lightbox
        items={shown}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
        label="Conversation viewer"
        renderMedia={(chat, i) => (
          <PhoneFrame
            src={chat.image_url}
            alt={chat.alt_text || chat.caption || 'Chat screenshot'}
            seed={i}
            eager
            className="w-[min(78vw,calc(62dvh*9/19))]"
          />
        )}
        renderCaption={(chat) => {
          const date = formatDate(chat.chat_date)
          return (
            <div>
              {chat.caption && <p className="font-hand text-3xl font-bold">{chat.caption}</p>}
              <div className="mt-1 flex items-center justify-center gap-3 text-sm text-white/70">
                {date && <span>{date}</span>}
                <PlaceholderBadge show={chat.is_placeholder} />
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}

export default function ChatsPage() {
  const query = useContent('listChats')
  return (
    <PageShell chapterId="chats">
      <ContentState
        query={query}
        loadingMessage="Scrolling back through our chats…"
        empty={{
          icon: MessageCircleHeart,
          title: 'No chats saved here yet',
          message: 'Screenshots of our favourite conversations will appear here once they are added ♡',
        }}
      >
        {(chats) => <ChatGallery chats={chats} />}
      </ContentState>
    </PageShell>
  )
}
