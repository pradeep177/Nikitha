import { MessageCircleHeart } from 'lucide-react'
import SmartImage from './SmartImage'

/** Rounded smartphone frame for chat screenshots. */
export default function PhoneFrame({ src, alt = '', className = '', seed = 0, eager = false }) {
  return (
    <div className={`relative rounded-[2.2rem] bg-ink p-2 shadow-lift ring-1 ring-black/10 ${className}`}>
      <span className="absolute top-3.5 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-ink" aria-hidden="true" />
      <div className="overflow-hidden rounded-[1.75rem] bg-cream">
        {src ? (
          <SmartImage
            src={src}
            alt={alt}
            aspect="9/19"
            seed={seed}
            eager={eager}
            imgClassName="object-cover object-top"
            placeholderLabel="Screenshot unavailable"
          />
        ) : (
          <div className="relative" style={{ aspectRatio: '9/19' }}>
            <div className="absolute inset-0 flex flex-col gap-3 bg-gradient-to-b from-blush/70 to-lavender/70 px-4 pt-12">
              <span className="h-7 w-3/4 rounded-2xl rounded-bl-sm bg-white/80" />
              <span className="ml-auto h-7 w-2/3 rounded-2xl rounded-br-sm bg-berry/25" />
              <span className="h-7 w-1/2 rounded-2xl rounded-bl-sm bg-white/80" />
              <span className="ml-auto h-10 w-3/4 rounded-2xl rounded-br-sm bg-berry/25" />
              <div className="mt-auto mb-10 flex flex-col items-center gap-1 text-center">
                <MessageCircleHeart className="size-7 text-rose" aria-hidden="true" />
                <span className="font-hand text-lg leading-tight text-ink-soft">Your screenshot goes here</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
