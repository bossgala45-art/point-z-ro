import type { AppData, Checkin } from './store'
import { addDays, currentDay, weekStart } from './day'
import { dailyDone, dailyMissions, phaseOn } from './phase'

export type Metric = 'mood' | 'energy' | 'stress'

export interface DayPoint {
  day: string
  checkin?: Checkin
  done: number
  total: number
}

/** Les N derniers jours (sans remonter avant le jour 1), du plus ancien au plus récent. */
export function lastDays(data: AppData, n: number): DayPoint[] {
  const today = currentDay()
  const out: DayPoint[] = []
  for (let i = n - 1; i >= 0; i--) {
    const day = addDays(today, -i)
    if (day < data.startDate) continue
    const daily = dailyMissions(data.missions, phaseOn(data, day))
    const log = data.days[day]
    out.push({ day, checkin: log?.checkin, done: dailyDone(log, daily), total: daily.length })
  }
  return out
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

export interface WeekRate {
  week: string // lundi
  rate: number // 0 à 1
  current: boolean
}

/** Taux de missions quotidiennes tenues, semaine par semaine (8 dernières). */
export function weeklyRates(data: AppData): WeekRate[] {
  const today = currentDay()
  const thisWeek = weekStart(today)
  const out: WeekRate[] = []
  for (let w = weekStart(data.startDate); w <= thisWeek; w = addDays(w, 7)) {
    let done = 0
    let total = 0
    for (let i = 0; i < 7; i++) {
      const day = addDays(w, i)
      if (day < data.startDate || day > today) continue
      const daily = dailyMissions(data.missions, phaseOn(data, day))
      done += dailyDone(data.days[day], daily)
      total += daily.length
    }
    out.push({ week: w, rate: total ? done / total : 0, current: w === thisWeek })
  }
  return out.slice(-8)
}

export interface Totals {
  missions: number
  checkins: number
  activeDays: number
}

export function totals(data: AppData): Totals {
  let missions = 0
  let checkins = 0
  let activeDays = 0
  for (const log of Object.values(data.days)) {
    missions += log.done.length
    if (log.checkin) checkins++
    if (log.done.length || log.checkin) activeDays++
  }
  return { missions, checkins, activeDays }
}

/** « Moi au jour 1 » : ton tout premier bilan. « Moi aujourd'hui » : la moyenne de tes 7 derniers jours. */
export function firstVsNow(data: AppData) {
  const days = Object.keys(data.days)
    .filter((d) => data.days[d].checkin)
    .sort()
  if (days.length === 0) return null
  const first = data.days[days[0]].checkin!
  const recent = lastDays(data, 7)
    .map((p) => p.checkin)
    .filter((c): c is Checkin => Boolean(c))
  const avg = (k: Metric) => average(recent.map((c) => c[k]))
  return {
    firstDay: days[0],
    count: days.length,
    first,
    now: { mood: avg('mood'), energy: avg('energy'), stress: avg('stress') },
  }
}
