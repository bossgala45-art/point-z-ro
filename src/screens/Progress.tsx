import { useState } from 'react'
import { startPhase, useData } from '../lib/store'
import { go } from '../lib/router'
import { PHASES, type Phase } from '../lib/missions'
import { GOOD_DAYS_NEEDED, PHASE_DAYS, phaseStatus, type DayState } from '../lib/phase'
import { average, firstVsNow, lastDays, totals, weeklyRates, type Metric } from '../lib/stats'
import { levelInfo, streakInfo, totalXp } from '../lib/rewards'
import { BarChart, fmtNum, LineChart, longDate, Meter, shortDate } from './Charts'

const METRICS: { key: Metric; label: string; note?: string }[] = [
  { key: 'mood', label: 'Humeur' },
  { key: 'energy', label: 'Énergie' },
  { key: 'stress', label: 'Stress', note: 'plus bas = plus calme' },
]

const CELL_LABEL: Record<DayState, string> = {
  good: 'bon jour',
  some: 'au moins une mission',
  none: 'jour sans',
  future: 'à venir',
}

function PhaseCard() {
  const data = useData()
  const st = phaseStatus(data)
  const next = (st.phase + 1) as Phase
  const dayShown = Math.min(st.dayInPhase, PHASE_DAYS)

  let message: string
  if (st.status === 'final') message = 'Dernière phase. Ici, le but c’est de garder le rythme.'
  else if (st.status === 'unlocked') message = `${GOOD_DAYS_NEEDED} bons jours. Tu as construit quelque chose de solide.`
  else if (st.status === 'redo')
    message = `${st.good} bons jours sur ${PHASE_DAYS}. Ce n’est pas un échec : tu sais maintenant ce qui coince. On refait 14 jours ?`
  else if (st.missing <= st.daysLeft)
    message = `Encore ${st.missing} bon${st.missing > 1 ? 's' : ''} jour${st.missing > 1 ? 's' : ''} pour débloquer la phase ${next}. Il reste ${st.daysLeft} jour${st.daysLeft > 1 ? 's' : ''} : c’est jouable.`
  else
    message = `Cette fois, les ${GOOD_DAYS_NEEDED} bons jours ne passeront pas avant la fin. Pas grave : chaque mission tenue compte quand même, et on refera la phase.`

  return (
    <section className="card">
      <div className="card-head">
        <h3>
          Phase {st.phase} · {PHASES[st.phase].name}
        </h3>
        <span className="badge">
          Jour {dayShown}/{PHASE_DAYS}
        </span>
      </div>

      <div className="stack tight">
        <div className="meter-head">
          <span>
            <b>{Math.min(st.good, GOOD_DAYS_NEEDED)}</b>{' '}
            <span className="muted">
              bon{st.good > 1 ? 's' : ''} jour{st.good > 1 ? 's' : ''} sur {GOOD_DAYS_NEEDED}
              {st.good > GOOD_DAYS_NEEDED ? ` (+${st.good - GOOD_DAYS_NEEDED} en bonus)` : ''}
            </span>
          </span>
        </div>
        <Meter value={st.good} max={GOOD_DAYS_NEEDED} label="Bons jours de la phase" />
      </div>

      <div className="day-strip" aria-label="Les 14 jours de la phase">
        {st.cells.map((c) => (
          <span key={c.day} className={`cell ${c.state}`} title={`${longDate(c.day)} : ${CELL_LABEL[c.state]}`} />
        ))}
      </div>
      <div className="strip-legend">
        <span>
          <i className="cell good" /> bon jour
        </span>
        <span>
          <i className="cell some" /> au moins 1
        </span>
        <span>
          <i className="cell none" /> sans
        </span>
      </div>
      <p className="muted small">Un bon jour = au moins 2 missions sur 3 tenues.</p>

      <p>{message}</p>

      {st.status === 'unlocked' && (
        <>
          <p className="muted small">
            La phase {next} ajoute : {data.missions.filter((m) => m.phase === next).map((m) => m.title).join(', ')}.
          </p>
          <button className="btn primary big" onClick={() => startPhase(next)}>
            Passer à la phase {next}
          </button>
          <p className="fine center">Tu peux aussi rester en phase {st.phase} le temps que tu veux.</p>
        </>
      )}
      {st.status === 'redo' && (
        <>
          <button className="btn primary big" onClick={() => startPhase(st.phase)}>
            Refaire la phase {st.phase}
          </button>
          <button className="link" onClick={() => go('missions')}>
            Ou rendre une mission plus facile d’abord
          </button>
        </>
      )}
    </section>
  )
}

function Compare() {
  const data = useData()
  const c = firstVsNow(data)
  if (!c) {
    return (
      <section className="card soon">
        <h3>Toi au jour 1, toi aujourd’hui</h3>
        <p className="muted">Fais ton premier bilan du soir : il deviendra ton point de départ.</p>
      </section>
    )
  }
  return (
    <section className="card">
      <h3>Toi au jour 1, toi aujourd’hui</h3>
      <div className="compare">
        <span />
        <span className="muted small">1er bilan ({shortDate(c.firstDay)})</span>
        <span className="muted small">7 derniers jours</span>
        {METRICS.map(({ key, label }) => {
          const now = c.now[key]
          const delta = now == null ? null : now - c.first[key]
          const better = delta != null && (key === 'stress' ? delta < -0.4 : delta > 0.4)
          return (
            <div key={key} className="compare-row">
              <span>{label}</span>
              <span className="compare-val">{c.first[key]}</span>
              <span className="compare-val">
                {now == null ? '—' : fmtNum(now)}
                {delta != null && Math.abs(delta) >= 0.5 && (
                  <small className={better ? 'delta good' : 'delta'}>
                    {delta > 0 ? '+' : '−'}
                    {fmtNum(Math.abs(delta))}
                  </small>
                )}
              </span>
            </div>
          )
        })}
      </div>
      {c.count < 4 && <p className="muted small">La comparaison devient parlante après quelques bilans.</p>}
    </section>
  )
}

function Weekly() {
  const data = useData()
  const [table, setTable] = useState(false)
  const rates = weeklyRates(data)
  const bars = rates.map((r) => ({
    key: r.week,
    label: shortDate(r.week),
    value: r.rate,
    tag: r.current ? 'en cours' : shortDate(r.week),
  }))
  return (
    <section className="card">
      <div className="card-head">
        <h3>Missions tenues par semaine</h3>
        <button className="link" onClick={() => setTable((t) => !t)}>
          {table ? 'Graphique' : 'Chiffres'}
        </button>
      </div>
      {table ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Semaine du</th>
              <th>Tenues</th>
            </tr>
          </thead>
          <tbody>
            {[...rates].reverse().map((r) => (
              <tr key={r.week}>
                <td>
                  {shortDate(r.week)}
                  {r.current ? ' (en cours)' : ''}
                </td>
                <td>{Math.round(r.rate * 100)} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <BarChart bars={bars} ariaLabel="Pourcentage de missions tenues chaque semaine" />
      )}
      <p className="muted small">Missions quotidiennes de ta phase, en pourcentage.</p>
    </section>
  )
}

function Mood() {
  const data = useData()
  const [range, setRange] = useState<7 | 30>(7)
  const [table, setTable] = useState(false)
  const days = lastDays(data, range)
  const withCheckin = days.filter((d) => d.checkin)

  return (
    <section className="stack">
      <div className="section-head">
        <h3>Ton moral</h3>
        <div className="segmented" role="tablist" aria-label="Période">
          {([7, 30] as const).map((r) => (
            <button key={r} role="tab" aria-selected={range === r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>
              {r} jours
            </button>
          ))}
        </div>
      </div>

      {withCheckin.length < 2 ? (
        <section className="card soon">
          <p className="muted">
            {withCheckin.length === 0
              ? 'Fais ton bilan du soir : tes courbes apparaîtront ici.'
              : 'Encore un bilan et ta première courbe apparaît.'}
          </p>
        </section>
      ) : table ? (
        <section className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Jour</th>
                <th>Hum.</th>
                <th>Éner.</th>
                <th>Stress</th>
              </tr>
            </thead>
            <tbody>
              {[...withCheckin].reverse().map((d) => (
                <tr key={d.day}>
                  <td>{longDate(d.day)}</td>
                  <td>{d.checkin!.mood}</td>
                  <td>{d.checkin!.energy}</td>
                  <td>{d.checkin!.stress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        METRICS.map(({ key, label, note }) => {
          const avg = average(withCheckin.map((d) => d.checkin![key]))
          return (
            <section key={key} className="card">
              <div className="card-head">
                <h3>{label}</h3>
                <span className="muted small">moyenne {avg == null ? '—' : fmtNum(avg)}</span>
              </div>
              {note && <p className="muted small">{note}</p>}
              <LineChart label={label} points={days.map((d) => ({ day: d.day, value: d.checkin ? d.checkin[key] : null }))} />
            </section>
          )
        })
      )}

      {withCheckin.length >= 2 && (
        <button className="link center" onClick={() => setTable((t) => !t)}>
          {table ? 'Voir les courbes' : 'Voir les chiffres'}
        </button>
      )}
    </section>
  )
}

export default function Progress() {
  const data = useData()
  const t = totals(data)
  const proofs = Object.values(data.days).filter((d) => d.checkin?.win).length
  const xp = totalXp(data)
  const lvl = levelInfo(xp)
  const streak = streakInfo(data)

  return (
    <div className="stack">
      <section className="hero">
        <p className="eyebrow">Depuis le jour 1</p>
        <p className="hero-figure">
          {t.missions} <span>mission{t.missions > 1 ? 's' : ''} tenue{t.missions > 1 ? 's' : ''}</span>
        </p>
        <p className="muted">
          {t.checkins} bilan{t.checkins > 1 ? 's' : ''} · {proofs} preuve{proofs > 1 ? 's' : ''} dans ton carnet
        </p>
        <p className="muted">
          Niveau {lvl.level} · {xp} XP · meilleure série : {streak.best} jour{streak.best > 1 ? 's' : ''}
        </p>
      </section>

      <PhaseCard />
      <Compare />
      <Weekly />
      <Mood />
    </div>
  )
}
