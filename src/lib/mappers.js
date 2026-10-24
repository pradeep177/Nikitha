/**
 * Converts database rows (which store storage *paths*) into the shapes the
 * public pages render (which need *URLs*). `url(bucket, path)` resolves a path.
 */
const byOrder = (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
const published = (row) => row.is_published !== false

export const BUCKET = {
  public: 'public-media',
  private: 'private-media',
  audio: 'audio',
}

export const mapHero = (row, url) => row && { ...row, photo_url: url(BUCKET.public, row.photo_path) }

export const mapMemory = (row, url) => ({ ...row, image_url: url(BUCKET.public, row.image_path) })

export const mapHerPhoto = (row, url) => ({ ...row, image_url: url(BUCKET.public, row.image_path) })

export const mapChat = (row, url) => ({ ...row, image_url: url(BUCKET.private, row.image_path) })

export const mapTimeline = (row, url) => ({ ...row, image_url: url(BUCKET.public, row.image_path) })

export const mapTrack = (row, url) => ({
  ...row,
  audio_url: url(BUCKET.audio, row.audio_path),
  artwork_url: url(BUCKET.public, row.artwork_path),
})

export const mapLetter = (row, url) => ({
  ...row,
  image_url: url(BUCKET.private, row.image_path),
  audio_url: url(BUCKET.audio, row.audio_path),
})

export const mapFinalSurprise = (row, url) =>
  row && {
    ...row,
    image_url: url(BUCKET.private, row.image_path),
    collage_urls: (row.collage_paths ?? []).map((p) => url(BUCKET.private, p)).filter(Boolean),
    video_url: url(BUCKET.private, row.video_path) ?? row.video_url ?? null,
  }

export function mapQuizQuestion(row) {
  return { ...row, options: [...(row.options ?? row.quiz_options ?? [])].sort(byOrder) }
}

export const sortPublished = (list, extraFilter = () => true) => list.filter((r) => published(r) && extraFilter(r)).sort(byOrder)

/** Every (bucket, path) pair a row references — used to resolve URLs in batches. */
export function mediaRefs(table, row) {
  const refs = {
    hero_content: [[BUCKET.public, row.photo_path]],
    memories: [[BUCKET.public, row.image_path]],
    her_photos: [[BUCKET.public, row.image_path]],
    timeline_entries: [[BUCKET.public, row.image_path]],
    chat_screenshots: [[BUCKET.private, row.image_path]],
    soundtrack_tracks: [
      [BUCKET.audio, row.audio_path],
      [BUCKET.public, row.artwork_path],
    ],
    open_when_letters: [
      [BUCKET.private, row.image_path],
      [BUCKET.audio, row.audio_path],
    ],
    final_surprise: [[BUCKET.private, row.image_path], [BUCKET.private, row.video_path], ...(row.collage_paths ?? []).map((p) => [BUCKET.private, p])],
  }[table]
  return (refs ?? []).filter(([, path]) => !!path)
}
