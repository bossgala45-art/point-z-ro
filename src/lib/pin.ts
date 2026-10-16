import { useEffect, useState } from 'react'
import { updateSettings } from './store'

// Le code n'est jamais enregistré tel quel : seulement son empreinte (SHA-256 + sel).
async function digest(pin: string, salt: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${pin}`))
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function setPin(pin: string) {
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
  updateSettings({ pinSalt: salt, pinHash: await digest(pin, salt) })
}

export function clearPin() {
  updateSettings({ pinHash: '', pinSalt: '' })
}

export async function checkPin(pin: string, hash: string, salt: string): Promise<boolean> {
  return (await digest(pin, salt)) === hash
}

// L'appli se verrouille à l'ouverture, et quand elle est restée en arrière-plan plus de 30 secondes.
const RELOCK_AFTER_MS = 30_000

export function useLock(enabled: boolean) {
  const [locked, setLocked] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setLocked(false)
      return
    }
    let hiddenAt = 0
    const onVis = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now()
      else if (hiddenAt && Date.now() - hiddenAt > RELOCK_AFTER_MS) setLocked(true)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [enabled])

  return { locked: enabled && locked, unlock: () => setLocked(false) }
}
