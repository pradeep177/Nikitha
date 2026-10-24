import { useLocalStorage } from './useLocalStorage'
import { sounds } from '@/utils/sound'

/** Sound is OFF by default; the visitor opts in with a toggle. */
export function useSound() {
  const [enabled, setEnabled] = useLocalStorage('olu:sound', false)
  const play = (name) => {
    if (enabled) sounds[name]?.()
  }
  return { enabled, setEnabled, play }
}
