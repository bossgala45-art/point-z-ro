import { useState } from 'react'
import { dayNumber, toggleMission, useData, type AppData } from '../lib/store'
import { go } from '../lib/router'
import { addDays, currentDay, isEvening, weekStart } from '../lib/day'
import { activeMissions, PHASES, type Mission } from '../lib/missions'
import MissionRow from './MissionRow'

function greeting(h: number) {
  if (h < 5) return 'Encore debout'
  if (h < 12) return 'Salut'
  if (h < 18) return 'Hey'
  return 'Bonsoir'
}

/** Combien de fois cette mission a été tenue cette semaine (lundi → aujourd'hui). */
export function weekCount(data: AppData, id: string, day: string): number {
  let n = 0
  for (let d = weekStart(day); d <= day; d = addDays(d, 1)) {
    if (data.days[d]?.done.includes(id)) n++
  }
  return n
}

/** Hier n'a rien donné (ni mission, ni bilan) ? */
function missedYesterday(data: AppData, today: string): boolean {
  const y = addDays(today, -1)
  if (y < data.startDate) return false
  const log = data.days[y]
  return !log || (log.done.length === 0 && !log.checkin)
}

function doneMessage(done: number, total: number): string {
  if (done === 0) return 'Commence par la plus simple.'
  if (done === total) return 'Tout est coché. Solide.'
  if (done === 1) return 'Une de faite. C’est déjà une journée qui compte.'
  return 'Ça avance. Continue comme ça.'
}

export default function Today() {
  const data = useData()
  const { settings, startDate, phase, missions, days } = data
  const [showAll, setShowAll] = useState(false)
  const today = currentDay()
  const log = days[today] ?? { done: [] }
  const day = dayNumber(startDate)
  const list = activeMissions(missions, phase)
  const doneCount = list.filter((m) => log.done.includes(m.id)).length

  // Après un jour sans : une seule mission mise en avant, sans reproche.
  const comeback = missedYesterday(data, today) && log.done.length === 0 && !showAll
  const focus: Mission | undefined = list[0]
  const shown = comeback && focus ? [focus] : list

  const evening = isEvening()
  const bilanDone = Boolean(log.checkin)

  const bilanButton = (
    <button className={`btn big ${evening && !bilanDone ? 'primary' : 'secondary'}`} onClick={() => go('bilan')}>
      {bilanDone ? 'Bilan fait ✓ · Modifier' : 'Faire mon bilan du soir · 2 min'}
    </button>
  )

  return (
    <div className="stack">
      <section className="hero">
        <p className="eyebrow">
          Jour {day} · Phase {phase} · {PHASES[phase].name}
        </p>
        <h2>
          {greeting(new Date().getHours())} {settings.firstName}.
        </h2>
        <p className="muted">Un jour à la fois. C'est tout ce qu'on te demande.</p>
      </section>

      {comeback && (
        <section className="card calm">
          <p>
            <b>Hier, c'était un jour sans.</b> Un jour raté, c'est un jour. Rien de plus.
          </p>
          <p className="muted">Aujourd'hui, on reprend avec une seule mission.</p>
        </section>
      )}

      {evening && bilanButton}

      <section className="card">
        <div className="card-head">
          <h3>{comeback ? 'Ta mission du jour' : 'Tes missions du jour'}</h3>
          {!comeback && (
            <span className="count">
              {doneCount}/{list.length}
            </span>
          )}
        </div>
        <div className="stack tight">
          {shown.map((m) => (
            <MissionRow
              key={m.id}
              mission={m}
              bedtime={settings.bedtime}
              done={log.done.includes(m.id)}
              weekCount={m.perWeek ? weekCount(data, m.id, today) : undefined}
              onToggle={() => toggleMission(today, m.id)}
            />
          ))}
        </div>
        {comeback && list.length > 1 ? (
          <button className="link" onClick={() => setShowAll(true)}>
            Voir les {list.length - 1} autres
          </button>
        ) : (
          <p className="muted small">{doneMessage(doneCount, list.length)}</p>
        )}
      </section>

      {!evening && bilanButton}

      <section className="card soon">
        <h3>Défi du jour</h3>
        <p className="muted">Un petit défi de 5 minutes, tiré au hasard (étape 4).</p>
      </section>

      <button className="btn secondary big" onClick={() => go('confident')}>
        Parler au Confident
      </button>
    </div>
  )
}
