import { useState } from 'react'
import { useData } from '../lib/store'
import { go } from '../lib/router'
import { formatDay } from '../lib/day'

export default function Journal() {
  const { days } = useData()
  const proofs = Object.entries(days)
    .filter(([, log]) => log.checkin?.win)
    .map(([day, log]) => ({ day, text: log.checkin!.win }))
    .sort((a, b) => (a.day < b.day ? 1 : -1))

  const [random, setRandom] = useState<number | null>(null)

  const pick = () => {
    if (proofs.length === 0) return
    let i = Math.floor(Math.random() * proofs.length)
    // Jamais deux fois la même d'affilée.
    if (proofs.length > 1 && i === random) i = (i + 1) % proofs.length
    setRandom(i)
  }

  if (proofs.length === 0) {
    return (
      <div className="stack">
        <section className="card soon">
          <h3>Ton carnet est encore vide</h3>
          <p className="muted">
            Chaque soir, ton bilan te demande une chose réussie, même minuscule. Elle arrive ici. Petit à
            petit, ça devient la preuve noir sur blanc que tu avances.
          </p>
        </section>
        <button className="btn primary big" onClick={() => go('bilan')}>
          Faire mon bilan
        </button>
      </div>
    )
  }

  const r = random != null ? proofs[random] : null

  return (
    <div className="stack">
      <section className="hero">
        <p className="eyebrow">Ton carnet</p>
        <h2>
          {proofs.length} preuve{proofs.length > 1 ? 's' : ''} que tu avances.
        </h2>
        <p className="muted">Quand ta tête te dit le contraire, relis-les.</p>
      </section>

      <button className="btn primary big" onClick={pick}>
        {r ? 'Une autre preuve' : 'Montre-moi une preuve au hasard'}
      </button>

      {r && (
        <section className="card proof random-proof" key={random}>
          <p className="muted small">{formatDay(r.day)}</p>
          <p className="proof-text">« {r.text} »</p>
          <p className="muted small">Ça, c'est toi. Personne ne peut te l'enlever.</p>
        </section>
      )}

      <section className="stack tight">
        {proofs.map((p) => (
          <article key={p.day} className="proof-item">
            <small>{formatDay(p.day)}</small>
            <p>{p.text}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
