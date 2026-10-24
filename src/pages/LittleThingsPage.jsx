import { Sparkles } from 'lucide-react'
import PageShell from '@/components/PageShell'
import Reveal from '@/components/Reveal'
import TinyMessageBox from '@/components/little/TinyMessageBox'
import CatchTheHearts from '@/components/little/CatchTheHearts'
import MoodPicker from '@/components/little/MoodPicker'
import MysteryButton from '@/components/little/MysteryButton'
import SoundToggle from '@/components/SoundToggle'
import ErrorState from '@/components/ErrorState'
import { useContent } from '@/hooks/useContent'
import { useSound } from '@/hooks/useSound'

function Panel({ title, subtitle, tint, children, delay = 0, className = '' }) {
  return (
    <Reveal delay={delay} className={`card-paper relative overflow-hidden p-5 sm:p-6 ${className}`}>
      <div className={`pointer-events-none absolute -top-16 -right-16 size-40 rounded-full ${tint} blur-2xl`} aria-hidden="true" />
      <h2 className="relative font-hand text-[2.1rem] leading-tight font-bold text-ink">{title}</h2>
      {subtitle && <p className="relative mb-4 text-sm text-ink-soft">{subtitle}</p>}
      <div className="relative">{children}</div>
    </Reveal>
  )
}

export default function LittleThingsPage() {
  const sound = useSound()
  const messages = useContent('listCuteMessages')
  const moods = useContent('listMoodMessages')

  return (
    <PageShell chapterId="little-things">
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <div className="mb-4 flex justify-end">
          <SoundToggle enabled={sound.enabled} onChange={sound.setEnabled} />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Tap for a tiny message" subtitle="There's a new one every time." tint="bg-blush">
            <TinyMessageBox messages={messages.data ?? []} onSound={sound.play} />
          </Panel>

          <Panel title="How are you feeling today?" subtitle="Pick one — I've left a little something for each." tint="bg-lavender" delay={0.08}>
            {moods.error ? (
              <ErrorState onRetry={moods.reload} className="shadow-none" />
            ) : (
              <MoodPicker moodMessages={moods.data ?? []} />
            )}
          </Panel>

          <Panel title="Catch the hearts" subtitle="A tiny game. Twenty seconds. All the hearts." tint="bg-peach" className="lg:col-span-2">
            <CatchTheHearts onSound={sound.play} />
          </Panel>

          <Panel
            title="The mystery button"
            subtitle={
              <span className="inline-flex items-center gap-1">
                <Sparkles className="size-3.5" aria-hidden="true" /> Completely harmless. Probably.
              </span>
            }
            tint="bg-butter"
            className="lg:col-span-2"
          >
            <MysteryButton onSound={sound.play} />
          </Panel>
        </div>
      </div>
    </PageShell>
  )
}
