import { useSyncExternalStore } from 'react'
import { currentDay, daysBetween } from './day'
import { DEFAULT_MISSIONS, type Mission, type Phase } from './missions'

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

export interface Checkin {
  mood: number // 1 à 10
  energy: number
  stress: number
  /** « Une chose que j'ai réussie aujourd'hui » */
  win: string
  savedAt: string
}

export interface DayLog {
  /** Identifiants des missions tenues ce jour-là. */
  done: string[]
  checkin?: Checkin
}

export interface AppData {
  version: 1
  /** Jour 1 de l'aventure, au format AAAA-MM-JJ. */
  startDate: string
  settings: Settings
  missions: Mission[]
  phase: Phase
  phaseStartDate: string
  days: Record<string, DayLog>
}

const KEY = 'pointzero:v1'

function defaults(): AppData {
  const today = currentDay()
  return {
    version: 1,
    startDate: today,
    settings: {
      firstName: '',
      bedtime: '23:30',
      wakeTime: '06:30',
      reminders: { morning: '06:30', noon: '12:30', evening: '23:15' },
      apiKey: '',
    },
    missions: DEFAULT_MISSIONS,
    phase: 1,
    phaseStartDate: today,
    days: {},
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
      phaseStartDate: saved.startDate ?? base.phaseStartDate,
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

function updateDay(day: string, fn: (log: DayLog) => DayLog) {
  update((d) => ({ ...d, days: { ...d.days, [day]: fn(d.days[day] ?? { done: [] }) } }))
}

export function toggleMission(day: string, id: string) {
  updateDay(day, (log) => ({
    ...log,
    done: log.done.includes(id) ? log.done.filter((x) => x !== id) : [...log.done, id],
  }))
}

export function setMissionsDone(day: string, done: string[]) {
  updateDay(day, (log) => ({ ...log, done }))
}

export function saveCheckin(day: string, checkin: Checkin) {
  updateDay(day, (log) => ({ ...log, checkin }))
}

export function setMissions(missions: Mission[]) {
  update((d) => ({ ...d, missions }))
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
export function dayNumber(startDate: string): number {
  return daysBetween(startDate, currentDay()) + 1
}

/** Demande au navigateur de ne pas effacer nos données quand il manque de place. */
export function askPersistentStorage() {
  navigator.storage?.persist?.().catch(() => {})
}
