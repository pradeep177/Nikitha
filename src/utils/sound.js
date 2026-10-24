let audioContext = null

function getContext() {
  if (typeof window === 'undefined') return null
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  audioContext ??= new Ctx()
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

/** Plays a few soft synthesized notes — no audio files needed. */
function playNotes(frequencies, { type = 'sine', gap = 0.09, duration = 0.32, volume = 0.07 } = {}) {
  const ctx = getContext()
  if (!ctx) return
  frequencies.forEach((frequency, i) => {
    const start = ctx.currentTime + i * gap
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(volume, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + duration + 0.05)
  })
}

export const sounds = {
  success: () => playNotes([659.25, 783.99, 1046.5]),
  oops: () => playNotes([392, 329.63], { type: 'triangle', gap: 0.14 }),
  pop: () => playNotes([880], { duration: 0.12, volume: 0.05 }),
  sparkle: () => playNotes([1046.5, 1318.5, 1568, 2093], { gap: 0.07, volume: 0.05 }),
}
