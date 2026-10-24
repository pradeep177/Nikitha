import { getChapterIndex } from '@/app/chapters'
import { useVisibleChapters } from '@/hooks/useVisibleChapters'

/** "Chapter 03 of 10" label with a row of progress dots. */
export default function ChapterIndicator({ chapterId }) {
  const chapters = useVisibleChapters()
  const index = getChapterIndex(chapterId, chapters)
  if (index < 0) return null

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="sticker">
        Chapter {String(index + 1).padStart(2, '0')} <span className="text-ink-soft">of {chapters.length}</span>
      </span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {chapters.map((chapter, i) => (
          <span
            key={chapter.id}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? 'w-6 bg-berry' : i < index ? 'w-1.5 bg-rose/60' : 'w-1.5 bg-blush-deep'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
