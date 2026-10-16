import type { AppData, DayLog } from './store'
import { activeMissions, type Mission, type Phase } from './missions'
import { addDays, currentDay, daysBetween } from './day'

export const PHASE_DAYS = 14
export const GOOD_DAYS_NEEDED = 10

/** La phase dans laquelle tu étais ce jour-là. */
export function phaseOn(data: AppData, day: string): Phase {
  let phase: Phase = data.phaseHistory[0]?.phase ?? 1
  for (const h of data.phaseHistory) if (h.start <= day) phase = h.phase
  return phase
}

/** Les missions quotidiennes (pas celles « x fois par semaine »). */
export function dailyMissions(missions: Mission[], phase: Phase): Mission[] {
  return activeMissions(missions, phase).filter((m) => !m.perWeek)
}

/** Nombre de missions à tenir pour qu'une journée compte : 2 sur 3, arrondi au-dessus. */
export function neededPerDay(count: number): number {
  return Math.ceil((count * 2) / 3)
}

export function dailyDone(log: DayLog | undefined, daily: Mission[]): number {
  if (!log) return 0
  return daily.filter((m) => log.done.includes(m.id)).length
}

export type DayState = 'good' | 'some' | 'none' | 'future'

export interface PhaseStatus {
  phase: Phase
  /** 1 à 14 pendant la phase ; plus de 14 quand elle est finie. */
  dayInPhase: number
  cells: { day: string; state: DayState }[]
  good: number
  missing: number
  /** Jours restants où tu peux encore gagner un bon jour (aujourd'hui compris). */
  daysLeft: number
  /** ongoing : en cours · unlocked : la suite est débloquée · redo : à refaire · final : dernière phase */
  status: 'ongoing' | 'unlocked' | 'redo' | 'final'
}

export function phaseStatus(data: AppData): PhaseStatus {
  const today = currentDay()
  const start = data.phaseStartDate
  const daily = dailyMissions(data.missions, data.phase)
  const need = neededPerDay(daily.length)
  const dayInPhase = daysBetween(start, today) + 1

  const cells = Array.from({ length: PHASE_DAYS }, (_, i) => {
    const day = addDays(start, i)
    if (day > today) return { day, state: 'future' as const }
    const done = dailyDone(data.days[day], daily)
    const state: DayState = daily.length > 0 && done >= need ? 'good' : done > 0 ? 'some' : 'none'
    return { day, state }
  })

  const good = cells.filter((c) => c.state === 'good').length
  const missing = Math.max(0, GOOD_DAYS_NEEDED - good)
  // Jours où un « bon jour » peut encore arriver : aujourd'hui (s'il n'est pas déjà bon) et les suivants.
  const daysLeft = cells.filter((c) => c.day > today || (c.day === today && c.state !== 'good')).length

  let status: PhaseStatus['status'] = 'ongoing'
  if (data.phase === 3) status = 'final'
  else if (missing === 0) status = 'unlocked'
  else if (dayInPhase > PHASE_DAYS) status = 'redo'

  return { phase: data.phase, dayInPhase, cells, good, missing, daysLeft, status }
}
