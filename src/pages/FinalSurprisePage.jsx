import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarHeart, Gift, RotateCcw, Video } from 'lucide-react'
import PageShell from '@/components/PageShell'
import GiftBox from '@/components/GiftBox'
import Confetti from '@/components/Confetti'
import SmartImage from '@/components/SmartImage'
import LoadingState from '@/components/LoadingState'
import Polaroid from '@/components/Polaroid'
import PhotoBackdrop from '@/components/PhotoBackdrop'
import { HeartShape } from '@/components/illustrations/Doodles'
import { personalize } from '@/app/chapters'
import { DEFAULT_FINAL_SURPRISE } from '@/lib/defaults'
import { useContent } from '@/hooks/useContent'
import { useHerPhotos } from '@/hooks/useHerPhotos'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useSound } from '@/hooks/useSound'
import { safeExternalUrl, safeMediaUrl } from '@/utils/format'

function Extra({ surprise }) {
  const type = surprise.surprise_type
  if (type === 'photo' && surprise.image_url) {
    return (
      <div className="mx-auto mt-6 w-[min(80%,20rem)] rotate-2 rounded-md bg-white p-3 pb-6 shadow-lift">
        <SmartImage src={surprise.image_url} alt={surprise.image_alt || ''} aspect="4/5" />
      </div>
    )
  }
  if (type === 'collage' && surprise.collage_urls?.length) {
    return (
      <div className="mt-6 grid grid-cols-2 gap-3">
        {surprise.collage_urls.slice(0, 6).map((url, i) => (
          <div key={url} className={`rounded-md bg-white p-2 shadow-card ${i % 2 ? 'rotate-2' : '-rotate-2'}`}>
            <SmartImage src={url} alt="" aspect="1/1" seed={i} />
          </div>
        ))}
      </div>
    )
  }
  if ((type === 'date' || type === 'gift') && surprise.details) {
    const Icon = type === 'date' ? CalendarHeart : Gift
    return (
      <div className="mt-6 flex items-start gap-3 rounded-3xl bg-butter/70 p-5 text-left">
        <Icon className="mt-1 size-6 shrink-0 text-berry-deep" aria-hidden="true" />
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-rose uppercase">{type === 'date' ? 'The plan' : 'Your gift'}</p>
          <p className="mt-1 font-hand text-2xl leading-snug whitespace-pre-line text-ink">{surprise.details}</p>
        </div>
      </div>
    )
  }
  if (type === 'video' && surprise.video_url) {
    const media = safeMediaUrl(surprise.video_url)
    const isFile = /\.(mp4|webm|mov)(\?|$)/i.test(surprise.video_url)
    return isFile && media ? (
      <video src={media} controls playsInline preload="metadata" className="mt-6 w-full rounded-2xl bg-ink shadow-lift" />
    ) : safeExternalUrl(surprise.video_url) ? (
      <a href={safeExternalUrl(surprise.video_url)} target="_blank" rel="noopener noreferrer" className="btn btn-soft mt-6">
        <Video className="size-4" aria-hidden="true" /> Watch your video
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    ) : null
  }
  return null
}

function Surprise({ surprise, name, photo }) {
  const reduce = useReducedMotion()
  const sound = useSound()
  const [stage, setStage] = useState('closed')
  const [confetti, setConfetti] = useState(0)
  const paragraphs = personalize(surprise.message, name).split(/\n\s*\n/).filter(Boolean)
  // Don't stack two photos when the surprise itself is already a photo or collage.
  const showsOwnPhoto =
    (surprise.surprise_type === 'photo' && surprise.image_url) || (surprise.surprise_type === 'collage' && surprise.collage_urls?.length)

  useEffect(() => {
    if (stage !== 'opening') return undefined
    const t = setTimeout(
      () => {
        setStage('revealed')
        setConfetti((c) => c + 1)
        sound.play('sparkle')
      },
      reduce ? 0 : 1300,
    )
    return () => clearTimeout(t)
    // sound.play is recreated each render; only the stage change should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, reduce])

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-5">
      <PhotoBackdrop start={3} blurred={stage !== 'revealed'} />
      <Confetti trigger={confetti} />
      <AnimatePresence mode="wait">
        {stage !== 'revealed' ? (
          <motion.div key="box" className="flex flex-col items-center text-center" exit={{ opacity: 0, scale: 0.9 }}>
            <motion.div animate={stage === 'closed' ? { y: [0, -10, 0] } : { y: 0 }} transition={{ duration: 2.6, repeat: stage === 'closed' ? Infinity : 0 }}>
              <GiftBox open={stage === 'opening'} wiggleKey={stage === 'opening' ? 1 : 0} className="w-56 sm:w-64" />
            </motion.div>
            <button type="button" onClick={() => setStage('opening')} disabled={stage === 'opening'} className="btn btn-primary mt-6 text-lg">
              {surprise.button_label}
            </button>
          </motion.div>
        ) : (
          <motion.article
            key="reveal"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 16 }}
            className="card-paper relative overflow-hidden px-6 py-10 text-center sm:px-12"
          >
            <HeartShape className="absolute -top-8 -left-8 size-28 rotate-[-15deg] text-blush" />
            <HeartShape className="absolute -right-6 -bottom-10 size-24 rotate-12 text-lavender" />
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative font-hand text-5xl font-bold text-berry-deep"
            >
              {personalize(surprise.title, name)}
            </motion.h2>
            <div className="relative mt-5 space-y-4">
              {paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.6, duration: 0.7 }}
                  className="font-hand text-[1.9rem] leading-snug text-balance text-ink"
                >
                  {p}
                </motion.p>
              ))}
            </div>
            <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + paragraphs.length * 0.6 }}>
              <Extra surprise={surprise} />
              {photo && !showsOwnPhoto && (
                <motion.figure
                  className="relative mx-auto mt-8 w-[min(62%,15rem)]"
                  initial={{ opacity: 0, scale: 0.3, rotate: -25, y: 30 }}
                  animate={{ opacity: 1, scale: 1, rotate: -4, y: 0 }}
                  transition={{ delay: 1.3 + paragraphs.length * 0.6, type: 'spring', stiffness: 160, damping: 11 }}
                >
                  <Polaroid photo={photo} name={name} tape padding="p-3 pb-4" captionClassName="pt-2 text-2xl" sizes="240px" />
                  <HeartShape className="absolute -top-4 -right-5 size-9 rotate-12 text-berry drop-shadow-sm" />
                  <HeartShape className="absolute -bottom-3 -left-5 size-7 -rotate-12 text-rose drop-shadow-sm" />
                </motion.figure>
              )}
              {surprise.signoff && <p className="mt-8 font-hand text-3xl text-rose">{personalize(surprise.signoff, name)} ♡</p>}
              <button
                type="button"
                onClick={() => {
                  setStage('closed')
                  setConfetti(0)
                }}
                className="btn btn-ghost mt-6"
              >
                <RotateCcw className="size-4" aria-hidden="true" /> Replay the surprise
              </button>
            </motion.div>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FinalSurprisePage() {
  const { settings } = useSiteSettings()
  const query = useContent('getFinalSurprise')
  const { photos } = useHerPhotos('surprise')
  const surprise = { ...DEFAULT_FINAL_SURPRISE, ...(query.data ?? {}) }

  return (
    <PageShell chapterId="surprise" title={surprise.heading} subtitle={surprise.intro}>
      {query.loading ? (
        <LoadingState message="Wrapping something special…" />
      ) : (
        <Surprise surprise={surprise} name={settings.her_name} photo={photos[0]} />
      )}
    </PageShell>
  )
}
