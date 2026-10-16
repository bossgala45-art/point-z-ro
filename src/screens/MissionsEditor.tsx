import { useState } from 'react'
import { setMissions, useData } from '../lib/store'
import { DEFAULT_MISSIONS, missionTitle, newMissionId, PHASES, type Mission, type Phase } from '../lib/missions'

export default function MissionsEditor() {
  const { missions, settings, phase: currentPhase } = useData()
  const [openId, setOpenId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const patch = (id: string, p: Partial<Mission>) =>
    setMissions(missions.map((m) => (m.id === id ? { ...m, ...p } : m)))

  const add = (phase: Phase) => {
    const m: Mission = { id: newMissionId(), phase, title: 'Nouvelle mission' }
    setMissions([...missions, m])
    setOpenId(m.id)
  }

  const remove = (id: string) => {
    setMissions(missions.filter((m) => m.id !== id))
    setConfirmDelete(null)
    setOpenId(null)
  }

  return (
    <div className="stack">
      <p className="muted small">
        Touche une mission pour la modifier. Écris <b>{'{coucher}'}</b> dans un titre pour y mettre ton
        heure de coucher.
      </p>

      {([1, 2, 3] as Phase[]).map((p) => (
        <section key={p} className="card">
          <div className="card-head">
            <h3>
              Phase {p} · {PHASES[p].name}
            </h3>
            {p === currentPhase && <span className="badge">En cours</span>}
            {p > currentPhase && <span className="badge dim">Plus tard</span>}
          </div>

          <div className="stack tight">
            {missions
              .filter((m) => m.phase === p)
              .map((m) =>
                openId === m.id ? (
                  <div key={m.id} className="edit-box">
                    <label className="field">
                      <span>Titre</span>
                      <input value={m.title} maxLength={60} onChange={(e) => patch(m.id, { title: e.target.value })} />
                    </label>
                    <label className="field">
                      <span>Petit conseil (facultatif)</span>
                      <input
                        value={m.hint ?? ''}
                        maxLength={60}
                        onChange={(e) => patch(m.id, { hint: e.target.value || undefined })}
                      />
                    </label>
                    <label className="row-field">
                      <span>Rythme</span>
                      <select
                        value={m.perWeek ?? 0}
                        onChange={(e) => patch(m.id, { perWeek: Number(e.target.value) || undefined })}
                      >
                        <option value={0}>Tous les jours</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n} fois par semaine
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="btn-row">
                      {confirmDelete === m.id ? (
                        <button className="btn danger" onClick={() => remove(m.id)}>
                          Oui, supprimer
                        </button>
                      ) : (
                        <button className="btn danger-outline" onClick={() => setConfirmDelete(m.id)}>
                          Supprimer
                        </button>
                      )}
                      <button
                        className="btn primary"
                        onClick={() => {
                          if (!m.title.trim()) patch(m.id, { title: 'Mission' })
                          setOpenId(null)
                          setConfirmDelete(null)
                        }}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                ) : (
                  <button key={m.id} className="edit-row" onClick={() => setOpenId(m.id)}>
                    <span>
                      {missionTitle(m, settings.bedtime)}
                      {m.perWeek ? <small> · {m.perWeek}×/sem.</small> : null}
                    </span>
                    <span className="muted" aria-hidden>
                      ›
                    </span>
                  </button>
                ),
              )}
          </div>

          <button className="btn ghost" onClick={() => add(p)}>
            + Ajouter une mission
          </button>
        </section>
      ))}

      <section className="card">
        {confirmReset ? (
          <div className="btn-row">
            <button className="btn ghost" onClick={() => setConfirmReset(false)}>
              Annuler
            </button>
            <button
              className="btn danger"
              onClick={() => {
                setMissions(DEFAULT_MISSIONS)
                setConfirmReset(false)
              }}
            >
              Remettre
            </button>
          </div>
        ) : (
          <button className="btn ghost" onClick={() => setConfirmReset(true)}>
            Remettre les missions de départ
          </button>
        )}
      </section>
    </div>
  )
}
