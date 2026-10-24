/**
 * Generates a short, gentle chime as a WAV blob URL so the audio player can be
 * tried out in demo mode without shipping (or downloading) any music.
 */
let cachedUrl = null

export function createDemoChimeUrl() {
  if (cachedUrl) return cachedUrl
  const sampleRate = 22050
  const seconds = 6
  const total = sampleRate * seconds
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 587.33, 783.99]
  const noteLength = total / notes.length
  const data = new Int16Array(total)

  for (let i = 0; i < total; i += 1) {
    const noteIndex = Math.floor(i / noteLength)
    const t = (i - noteIndex * noteLength) / sampleRate
    const f = notes[noteIndex]
    const envelope = Math.exp(-3.2 * t)
    const sample = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t)) * envelope * 0.32
    data[i] = Math.max(-1, Math.min(1, sample)) * 0x7fff
  }

  const buffer = new ArrayBuffer(44 + data.length * 2)
  const view = new DataView(buffer)
  const writeString = (offset, text) => [...text].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)))
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + data.length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, data.length * 2, true)
  new Int16Array(buffer, 44).set(data)

  cachedUrl = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
  return cachedUrl
}
