import { useState } from 'react'
import ImagePlaceholder from './ImagePlaceholder'
import { safeMediaUrl } from '@/utils/format'

/**
 * Lazy-loaded image that fades in, reserves its space (no layout shift) and
 * falls back to an illustrated placeholder instead of ever showing a broken image.
 */
export default function SmartImage({
  src,
  alt = '',
  aspect,
  className = '',
  imgClassName = 'object-cover',
  placeholderLabel,
  seed = 0,
  eager = false,
  sizes,
}) {
  const url = safeMediaUrl(src)
  const [status, setStatus] = useState({ url: null, state: 'loading' })
  const state = status.url === url ? status.state : 'loading'

  return (
    <div className={`relative overflow-hidden bg-blush/50 ${className}`} style={aspect ? { aspectRatio: aspect } : undefined}>
      {!url || state === 'error' ? (
        <ImagePlaceholder label={placeholderLabel} seed={seed} className="absolute inset-0" />
      ) : (
        <img
          src={url}
          alt={alt}
          sizes={sizes}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable="false"
          onLoad={() => setStatus({ url, state: 'loaded' })}
          onError={() => setStatus({ url, state: 'error' })}
          className={`absolute inset-0 size-full transition-opacity duration-700 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
      )}
    </div>
  )
}
