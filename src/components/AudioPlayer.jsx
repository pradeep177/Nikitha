import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Pause, Play, RotateCcw, VolumeX } from 'lucide-react'
import SmartImage from './SmartImage'
import { formatTime, safeMediaUrl } from '@/utils/format'

function Vinyl({ spinning, artwork }) {
  return (
    <div className="relative size-full">
      <div
        className={`absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,#3b2833_0_2px,#4a3340_2px_4px)] shadow-card ${
          spinning ? 'animate-spin-slow' : ''
        }`}
        style={{ animationDuration: '6s' }}
      >
        <div className="absolute inset-[30%] overflow-hidden rounded-full border-2 border-white/70 bg-blush">
          {artwork ? (
            <SmartImage src={artwork} alt="" className="size-full" aspect="1/1" />
          ) : (
            <div className="size-full bg-gradient-to-br from-blush to-lavender-deep" />
          )}
        </div>
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream" />
      </div>
    </div>
  )
}

/**
 * Custom audio player. Never autoplays on page load — playback only starts
 * after the visitor presses play (or picks a track, which is also a gesture).
 */
export default function AudioPlayer({ track, startPlaying = false, compact = false }) {
  const audioRef = useRef(null)
  const src = safeMediaUrl(track?.audio_url)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!startPlaying || !audio) return
    audio.play().catch(() => {})
  }, [startPlaying])

  useEffect(() => {
    const audio = audioRef.current
    // A detached <audio> keeps playing, so always pause on unmount.
    return () => audio?.pause()
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => setError(true))
    else audio.pause()
  }

  const seek = (value) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    audio.currentTime = value
    setCurrent(value)
  }

  const progress = duration ? (current / duration) * 100 : 0
  const unavailable = !src || error

  return (
    <div className={`card-paper flex items-center gap-4 ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      {!compact && (
        <div className="size-20 shrink-0 sm:size-24">
          <Vinyl spinning={playing} artwork={track?.artwork_url} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        {!compact && (
          <div className="mb-2 min-w-0">
            <p className="truncate font-hand text-2xl leading-tight font-bold text-ink">{track?.title}</p>
            {track?.artist && <p className="truncate text-sm text-ink-soft">{track.artist}</p>}
          </div>
        )}

        {unavailable ? (
          <p className="flex items-center gap-2 rounded-2xl bg-lavender/60 px-3 py-2 text-sm text-ink-soft" role="status">
            <VolumeX className="size-4 shrink-0" aria-hidden="true" />
            {src ? 'This track is resting right now — please try again later.' : 'No audio file for this one yet.'}
            {error && (
              <button
                type="button"
                onClick={() => {
                  setError(false)
                  audioRef.current?.load()
                }}
                className="ml-auto inline-flex items-center gap-1 font-bold text-berry-deep"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" /> Retry
              </button>
            )}
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={toggle}
              whileTap={{ scale: 0.9 }}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-berry-deep text-white shadow-soft"
              aria-label={playing ? `Pause ${track?.title ?? ''}` : `Play ${track?.title ?? ''}`}
            >
              {playing ? <Pause className="size-5 fill-current" aria-hidden="true" /> : <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />}
            </motion.button>
            <div className="min-w-0 flex-1">
              <div className="relative h-2.5 rounded-full bg-blush has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-4 has-[input:focus-visible]:outline-berry">
                <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose to-berry" style={{ width: `${progress}%` }} />
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step="0.1"
                  value={current}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Seek"
                  aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
                  disabled={!duration}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs font-bold text-ink-soft tabular-nums">
                <span>{formatTime(current)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}

        {src && (
          <audio
            ref={audioRef}
            src={src}
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onDurationChange={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
            onError={() => {
              setPlaying(false)
              setError(true)
            }}
          />
        )}
      </div>
    </div>
  )
}
