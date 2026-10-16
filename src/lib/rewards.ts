import type { AppData, DayLog } from './store'
import { addDays, currentDay, weekStart } from './day'

// XP : on gagne, on ne perd jamais.
export const XP = { mission: 10, checkin: 20, challenge: 15 }

export function dayXp(log: DayLog | undefined): number {
  if (!log) return 0
  return log.done.length * XP.mission + (log.checkin ? XP.checkin : 0) + (log.challenge?.done ? XP.challenge : 0)
}

export function totalXp(data: AppData): number {
  return Object.values(data.days).reduce((sum, log) => sum + dayXp(log), 0)
}

const LEVEL_NAMES = [
  'Point de départ',
  'Réveil',
  'Élan',
  'Régulier',
  'Fondations',
  'Bâtisseur',
  'En rythme',
  'Cap tenu',
  'Moteur',
  'Entrepreneur de sa vie',
]

/** XP total qu'il faut pour atteindre un niveau : 0, 100, 300, 600, 1000… */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1)
}

export function levelInfo(xp: number) {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  const from = xpForLevel(level)
  const to = xpForLevel(level + 1)
  return {
    level,
    name: LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length) - 1],
    into: xp - from,
    span: to - from,
    toNext: to - xp,
  }
}

/** Un jour « tenu » : au moins une mission ou ton bilan. La barre est basse exprès. */
export function isHeld(log: DayLog | undefined): boolean {
  return Boolean(log && (log.done.length > 0 || log.checkin))
}

export interface StreakInfo {
  current: number
  best: number
  /** Le joker de cette semaine est-il encore là ? */
  jokerAvailable: boolean
  /** Jour où le joker de cette semaine a servi. */
  jokerUsedOn?: string
  /** Hier a été sauvé par un joker. */
  savedYesterday: boolean
  todayHeld: boolean
}

/**
 * Série de jours tenus. Un jour sans ne casse pas la série si le joker
 * de la semaine (un par semaine, lundi → dimanche) est encore disponible.
 * Aujourd'hui ne compte pas contre toi : la journée n'est pas finie.
 */
export function streakInfo(data: AppData): StreakInfo {
  const today = currentDay()
  const jokerUsed = new Map<string, string>() // semaine → jour sauvé
  let current = 0
  let best = 0
  let savedYesterday = false

  for (let d = data.startDate; d < today; d = addDays(d, 1)) {
    if (isHeld(data.days[d])) {
      current++
    } else {
      const week = weekStart(d)
      if (!jokerUsed.has(week) && current > 0) {
        jokerUsed.set(week, d)
        if (d === addDays(today, -1)) savedYesterday = true
      } else {
        current = 0
      }
    }
    best = Math.max(best, current)
  }

  const todayHeld = isHeld(data.days[today])
  if (todayHeld) current++
  best = Math.max(best, current)

  const thisWeek = weekStart(today)
  return {
    current,
    best,
    jokerAvailable: !jokerUsed.has(thisWeek),
    jokerUsedOn: jokerUsed.get(thisWeek),
    savedYesterday,
    todayHeld,
  }
}
