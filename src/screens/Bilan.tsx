import { useState } from 'react'
import { saveCheckin, toggleMission, useData } from '../lib/store'
import { currentDay } from '../lib/day'
import { activeMissions } from '../lib/missions'
import { go } from '../lib/router'
import MissionRow from './MissionRow'
import { weekCount } from './Today'

function Scale({
  label,
  low,
  high,
  value,
  onChange,
}: {
  label: string
  low: string
  high: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="scale">
      <div className="scale-head">
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <div className="scale-ends">
        <small>{low}</small>
        <small>{high}</small>
      </div>
    </div>
  )
}

export default function Bilan() {
  const data = useData()
  const { settings, missions, phase, days } = data
  const day = currentDay()
  const log = days[day] ?? { done: [] }
  const prev = log.checkin

  const [mood, setMood] = useState(prev?.mood ?? 5)
  const [energy, setEnergy] = useState(prev?.energy ?? 5)
  const [stress, setStress] = useState(prev?.stress ?? 5)
  const [win, setWin] = useState(prev?.win ?? '')
  const [saved, setSaved] = useState(false)

  const list = activeMissions(missions, phase)
  const canSave = win.trim().length > 0

  const save = () => {
    if (!canSave) return
    saveCheckin(day, { mood, energy, stress, win: win.trim(), savedAt: new Date().toISOString() })
    setSaved(true)
    window.scrollTo(0, 0)
  }

  if (saved) {
    const h = new Date().getHours()
    return (
      <div className="stack">
        <section className="hero">
          <p className="eyebrow">Bilan enregistré</p>
          <h2>C'est noté.</h2>
        </section>
        <section className="card proof">
          <p className="muted small">Ajouté à ton Carnet de preuves :</p>
          <p className="proof-text">« {win.trim()} »</p>
        </section>
        <p className="muted">
          {h >= 21 || h < 4
            ? 'Maintenant, téléphone loin du lit. Bonne nuit.'
            : 'Tu peux le modifier jusqu’à ce soir si tu veux.'}
        </p>
        <button className="btn primary big" onClick={() => go('aujourdhui')}>
          Retour à aujourd'hui
        </button>
      </div>
    )
  }

  return (
    <div className="stack">
      <p className="muted">Deux minutes. Réponds vite, sans trop réfléchir.</p>

      <section className="card">
        <h3>Comment tu te sens ?</h3>
        <Scale label="Humeur" low="Au plus bas" high="Au top" value={mood} onChange={setMood} />
        <Scale label="Énergie" low="Vidé" high="À fond" value={energy} onChange={setEnergy} />
        <Scale label="Stress" low="Calme" high="Sous pression" value={stress} onChange={setStress} />
      </section>

      <section className="card">
        <h3>Tes missions tenues</h3>
        <div className="stack tight">
          {list.map((m) => (
            <MissionRow
              key={m.id}
              mission={m}
              bedtime={settings.bedtime}
              done={log.done.includes(m.id)}
              weekCount={m.perWeek ? weekCount(data, m.id, day) : undefined}
              onToggle={() => toggleMission(day, m.id)}
            />
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Une chose que tu as réussie aujourd'hui</h3>
        <p className="muted small">Même minuscule. « J'ai pris le bus à l'heure » compte.</p>
        <textarea
          value={win}
          onChange={(e) => setWin(e.target.value)}
          placeholder="Aujourd'hui, j'ai…"
          rows={3}
          maxLength={280}
        />
      </section>

      <button className="btn primary big" disabled={!canSave} onClick={save}>
        {prev ? 'Mettre à jour mon bilan' : 'Enregistrer mon bilan'}
      </button>
      {!canSave && <p className="fine center">Écris ta réussite du jour pour enregistrer.</p>}
    </div>
  )
}
