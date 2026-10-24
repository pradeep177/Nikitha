import { useRef, useState } from 'react'
import PageShell from '@/components/PageShell'
import HeroSection from '@/components/home/HeroSection'
import MessageCarousel from '@/components/home/MessageCarousel'
import PhotoRibbon from '@/components/home/PhotoRibbon'
import ChapterMap from '@/components/home/ChapterMap'
import SecretNoteModal from '@/components/home/SecretNoteModal'
import { DEFAULT_HERO } from '@/lib/defaults'
import { useContent } from '@/hooks/useContent'
import { heroAsPhoto, useHerPhotos } from '@/hooks/useHerPhotos'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function HomePage() {
  const { settings } = useSiteSettings()
  const heroQuery = useContent('getHero')
  const messagesQuery = useContent('listCuteMessages')
  const { photos: landingExtras } = useHerPhotos('landing', { heroFallback: false })
  const { photos: ribbonPhotos } = useHerPhotos('ribbon', { heroFallback: false })
  const [secretOpen, setSecretOpen] = useState(false)
  const nextRef = useRef(null)

  // The hero always renders (defaults fill any gaps), so the first screen never waits on the network.
  const hero = { ...DEFAULT_HERO, ...(heroQuery.data ?? {}) }
  const messages = messagesQuery.data ?? []
  const landingPhotos = [heroAsPhoto(hero), ...landingExtras]

  const scrollToNext = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    nextRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <PageShell chapterId="home" showHeader={false}>
      <HeroSection
        hero={hero}
        photos={landingPhotos}
        name={settings.her_name}
        signature={settings.signature}
        onSecret={() => setSecretOpen(true)}
        onScrollHint={scrollToNext}
      />

      <div ref={nextRef} className="scroll-mt-24 space-y-20 pt-10">
        {messages.length > 0 && <MessageCarousel messages={messages} />}
        <PhotoRibbon photos={ribbonPhotos} name={settings.her_name} />
        <ChapterMap name={settings.her_name} />
      </div>

      <SecretNoteModal open={secretOpen} onClose={() => setSecretOpen(false)} messages={messages} />
    </PageShell>
  )
}
