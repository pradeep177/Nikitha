import { useMemo } from 'react'
import { useContent } from './useContent'
import { personalize } from '@/app/chapters'

export const photoAlt = (photo, name) => personalize(photo?.alt_text || photo?.caption || `A photo of ${name}`, name)

const FLAGS = {
  landing: 'show_on_landing',
  ribbon: 'show_in_ribbon',
  chapters: 'show_in_chapters',
  reasons: 'show_on_reasons',
  surprise: 'show_on_surprise',
  backgrounds: 'show_on_soundtrack',
}

/** The landing-page photo, shaped like a her_photos row. */
export const heroAsPhoto = (hero) => ({
  id: 'hero',
  image_url: hero?.photo_url ?? null,
  caption: hero?.photo_caption ?? null,
  alt_text: hero?.photo_alt ?? null,
})

/**
 * Published photos of her that are switched on for one spot of the site.
 * When none are ticked for that spot, the landing-page photo is used instead
 * (unless `heroFallback` is false). A missing table or network error simply
 * means "no extra photos", so the site never breaks because of them.
 */
export function useHerPhotos(place, { heroFallback = true } = {}) {
  const photosQuery = useContent('listHerPhotos')
  const heroQuery = useContent('getHero')
  const rows = photosQuery.data
  const hero = heroQuery.data

  const photos = useMemo(() => {
    const own = (rows ?? []).filter((p) => p[FLAGS[place]] !== false)
    if (own.length || !heroFallback) return own
    return hero?.photo_url ? [heroAsPhoto(hero)] : []
  }, [rows, hero, place, heroFallback])

  return { photos, loading: photosQuery.loading || heroQuery.loading }
}
