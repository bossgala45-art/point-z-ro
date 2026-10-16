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
  /** Rappels ajoutés au Calendrier de l'iPhone (heure arrondie "HHMM"), et alarme du réveil réglée. */
  calendar: Partial<Record<'matin' | 'midi' | 'soir', string>>
  alarmSet: boolean
  /** Code PIN : on garde seulement une empreinte (hash), jamais le code lui-même. Vide = pas de code. */
  pinHash: string
  pinSalt: string
  /** Date de la dernière sauvegarde exportée (ISO). */
  lastBackup: string
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
  /** Défi du jour : combien de fois tu en as demandé un autre, et s'il est fait. */
  challenge?: { rerolls: number; done: boolean }
}

export interface AppData {
  version: 1
  /** Jour 1 de l'aventure, au format AAAA-MM-JJ. */
  startDate: string
  settings: Settings
  missions: Mission[]
  phase: Phase
  phaseStartDate: string
  /** Chaque début (ou reprise) de phase, du plus ancien au plus récent. */
  phaseHistory: { phase: Phase; start: string }[]
  days: Record<string, DayLog>
  /** « Écris ce que tu ressens » (SOS) : seulement ce que tu as choisi de garder. */
  sosNotes: { id: string; at: string; text: string }[]
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
      calendar: {},
      alarmSet: false,
      pinHash: '',
      pinSalt: '',
      lastBackup: '',
    },
    missions: DEFAULT_MISSIONS,
    phase: 1,
    phaseStartDate: today,
    phaseHistory: [{ phase: 1, start: today }],
    days: {},
    sosNotes: [],
  }
}

/** Complète des données enregistrées (ou restaurées) avec les valeurs par défaut. */
export function normalize(saved: Partial<AppData>): AppData {
  const base = defaults()
  const start = saved.startDate ?? base.startDate
  return {
    ...base,
    phaseStartDate: start,
    phaseHistory: [{ phase: saved.phase ?? 1, start: saved.phaseStartDate ?? start }],
    ...saved,
    settings: {
      ...base.settings,
      ...saved.settings,
      reminders: { ...base.settings.reminders, ...saved.settings?.reminders },
    },
  }
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaults()
    return normalize(JSON.parse(raw) as Partial<AppData>)
  } catch {
    return defaults()
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

export function rerollChallenge(day: string) {
  updateDay(day, (log) => ({ ...log, challenge: { rerolls: (log.challenge?.rerolls ?? 0) + 1, done: false } }))
}

export function toggleChallenge(day: string) {
  updateDay(day, (log) => ({
    ...log,
    challenge: { rerolls: log.challenge?.rerolls ?? 0, done: !log.challenge?.done },
  }))
}

export function setMissions(missions: Mission[]) {
  update((d) => ({ ...d, missions }))
}

/** Passe à la phase suivante, à partir d'aujourd'hui. */
export function startPhase(phase: Phase) {
  const today = currentDay()
  update((d) => ({
    ...d,
    phase,
    phaseStartDate: today,
    phaseHistory: [...d.phaseHistory.filter((h) => h.start !== today), { phase, start: today }],
  }))
}

export function addSosNote(text: string) {
  const note = { id: Date.now().toString(36), at: new Date().toISOString(), text }
  update((d) => ({ ...d, sosNotes: [note, ...d.sosNotes] }))
}

export function deleteSosNote(id: string) {
  update((d) => ({ ...d, sosNotes: d.sosNotes.filter((n) => n.id !== id) }))
}

/** Remplace toutes les données par une sauvegarde. Le code PIN et la clé API de ce téléphone sont conservés. */
export function restore(saved: Partial<AppData>) {
  const keep = data.settings
  const next = normalize(saved)
  update(() => ({
    ...next,
    settings: { ...next.settings, apiKey: keep.apiKey, pinHash: keep.pinHash, pinSalt: keep.pinSalt },
  }))
}

/** Les données en ce moment (pour l'export). */
export function snapshot(): AppData {
  return data
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
