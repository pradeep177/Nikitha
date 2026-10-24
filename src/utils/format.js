/** Only allow http(s) links to leave the site — blocks javascript: and data: URLs. */
export function safeExternalUrl(url) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : null
  } catch {
    return null
  }
}

/** Media sources: http(s) plus in-memory blob: URLs (used for previews and the demo chime). */
export function safeMediaUrl(url) {
  if (!url) return null
  try {
    const parsed = new URL(url, window.location.origin)
    return ['https:', 'http:', 'blob:'].includes(parsed.protocol) ? parsed.href : null
  } catch {
    return null
  }
}

export function formatDate(value, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!value) return null
  const date = new Date(`${value}`.length === 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, options).format(date)
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function pickRandom(list, exclude) {
  if (!list?.length) return null
  if (list.length === 1) return list[0]
  let item
  do {
    item = list[Math.floor(Math.random() * list.length)]
  } while (exclude && item === exclude)
  return item
}
