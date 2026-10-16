import { useEffect, useRef, useState } from 'react'
import { dayNumber, rerollChallenge, toggleChallenge, toggleMission, useData, type AppData } from '../lib/store'
import { go } from '../lib/router'
import { addDays, currentDay, isEvening, weekStart } from '../lib/day'
import { activeMissions, PHASES, type Mission } from '../lib/missions'
import MissionRow from './MissionRow'
import { phaseStatus } from '../lib/phase'
import { isHeld, levelInfo, streakInfo, totalXp, XP } from '../lib/rewards'
import { challengeFor } from '../lib/challenges'
import { Meter } from './Charts'

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
  return !isHeld(data.days[y])
}

/** Un petit « +10 XP » qui s'affiche puis disparaît. */
function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const show = (m: string) => {
    setMsg(m)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMsg(null), 1400)
  }
  return [msg, show] as const
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

  const phaseSt = phaseStatus(data)
  const streak = streakInfo(data)
  const lvl = levelInfo(totalXp(data))
  const [toast, showToast] = useToast()
  const challenge = challengeFor(today, log.challenge?.rerolls ?? 0)
  const challengeDone = Boolean(log.challenge?.done)
  const rerollsLeft = 2 - (log.challenge?.rerolls ?? 0)

  const onToggle = (id: string) => {
    if (!log.done.includes(id)) showToast(`+${XP.mission} XP`)
    toggleMission(today, id)
  }
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

      <section className="card stats">
        <div className="stat-row">
          <div className="stat">
            <small>Série</small>
            {streak.current === 0 ? (
              <b>Nouvelle</b>
            ) : (
              <b>
                {streak.current} <span>jour{streak.current > 1 ? 's' : ''}</span>
              </b>
            )}
          </div>
          <div className="stat">
            <small>Joker</small>
            <b className={streak.jokerAvailable ? '' : 'dim'}>{streak.jokerAvailable ? 'Dispo' : 'Utilisé'}</b>
          </div>
          <div className="stat">
            <small>Niveau {lvl.level}</small>
            <b className="level-name">{lvl.name}</b>
          </div>
        </div>
        <Meter value={lvl.into} max={lvl.span} label="XP vers le niveau suivant" />
        <p className="fine">
          {lvl.toNext} XP avant le niveau {lvl.level + 1} · 1 joker par semaine protège ta série
        </p>
      </section>

      {phaseSt.status === 'unlocked' && (
        <button className="card nav-card highlight" onClick={() => go('progres')}>
          <span>
            <h3>Phase {phase + 1} débloquée</h3>
            <span className="muted small">Tu as tenu 10 bons jours. Va voir la suite.</span>
          </span>
          <span aria-hidden>›</span>
        </button>
      )}
      {phaseSt.status === 'redo' && (
        <button className="card nav-card" onClick={() => go('progres')}>
          <span>
            <h3>Ta phase {phase} est terminée</h3>
            <span className="muted small">On fait le point, sans reproche.</span>
          </span>
          <span className="muted" aria-hidden>›</span>
        </button>
      )}

      {comeback && (
        <section className="card calm">
          <p>
            <b>Hier, c'était un jour sans.</b> Un jour raté, c'est un jour. Rien de plus.
          </p>
          {streak.savedYesterday && <p className="muted">Ton joker de la semaine a protégé ta série.</p>}
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
              onToggle={() => onToggle(m.id)}
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

      <section className={challengeDone ? 'card challenge done' : 'card challenge'}>
        <div className="card-head">
          <h3>Défi du jour</h3>
          <span className="muted small">5 min · +{XP.challenge} XP</span>
        </div>
        <p className="challenge-text">{challenge.text}</p>
        <div className="btn-row">
          {!challengeDone && rerollsLeft > 0 && (
            <button className="btn ghost" onClick={() => rerollChallenge(today)}>
              Un autre
            </button>
          )}
          <button
            className={challengeDone ? 'btn secondary' : 'btn primary'}
            onClick={() => {
              if (!challengeDone) showToast(`+${XP.challenge} XP`)
              toggleChallenge(today)
            }}
          >
            {challengeDone ? 'Fait ✓' : 'C’est fait'}
          </button>
        </div>
      </section>

      <button className="btn secondary big" onClick={() => go('confident')}>
        Parler au Confident
      </button>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
