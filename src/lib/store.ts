import { useSyncExternalStore } from 'react'

// Toutes les données vivent ici, dans le stockage local du téléphone.
// Rien n'est envoyé sur Internet.

export interface Settings {
  firstName: string
  bedtime: string // "HH:MM"
  wakeTime: string
  reminders: {
    morning: string
    noon: string
    evening: string
  }
  apiKey: string
}

export interface AppData {
  version: 1
  /** Jour 1 de l'aventure, au format AAAA-MM-JJ. */
  startDate: string
  settings: Settings
}

const KEY = 'pointzero:v1'

export function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function defaults(): AppData {
  return {
    version: 1,
    startDate: todayKey(),
    settings: {
      firstName: '',
      bedtime: '23:30',
      wakeTime: '06:30',
      reminders: { morning: '06:30', noon: '12:30', evening: '23:15' },
      apiKey: '',
    },
  }
}

function load(): AppData {
  const base = defaults()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as Partial<AppData>
    return {
      ...base,
      ...saved,
      settings: {
        ...base.settings,
        ...saved.settings,
        reminders: { ...base.settings.reminders, ...saved.settings?.reminders },
      },
    }
  } catch {
    return base
  }
}

let data: AppData = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Stockage plein ou bloqué : on garde au moins les données en mémoire.
  }
}

export function update(fn: (d: AppData) => AppData) {
  data = fn(data)
  persist()
  listeners.forEach((l) => l())
}

export function updateSettings(patch: Partial<Settings>) {
  update((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
}

export function eraseAll() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // rien
  }
  data = defaults()
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useData(): AppData {
  return useSyncExternalStore(subscribe, () => data)
}

/** Numéro du jour depuis le début (jour 1 = premier jour). */
export function dayNumber(startDate: string, now = new Date()): number {
  const [y, m, d] = startDate.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1
}

/** Demande au navigateur de ne pas effacer nos données quand il manque de place. */
export function askPersistentStorage() {
  navigator.storage?.persist?.().catch(() => {})
}
