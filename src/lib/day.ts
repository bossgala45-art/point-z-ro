// Une « journée » dans l'appli se termine à 4 h du matin :
// un bilan fait à 0 h 30 compte pour la veille.
const DAY_ENDS_AT_HOUR = 4

function fmt(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** La journée en cours, au format AAAA-MM-JJ. */
export function currentDay(now = new Date()): string {
  const d = new Date(now)
  if (d.getHours() < DAY_ENDS_AT_HOUR) d.setDate(d.getDate() - 1)
  return fmt(d)
}

export function addDays(key: string, n: number): string {
  const d = parseDay(key)
  d.setDate(d.getDate() + n)
  return fmt(d)
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / 86_400_000)
}

/** Lundi de la semaine qui contient ce jour. */
export function weekStart(key: string): string {
  const d = parseDay(key)
  const shift = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - shift)
  return fmt(d)
}

export function isEvening(now = new Date()): boolean {
  const h = now.getHours()
  return h >= 18 || h < DAY_ENDS_AT_HOUR
}

export function formatDay(key: string): string {
  return parseDay(key).toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' })
}
