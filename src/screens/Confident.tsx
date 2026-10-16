import { go } from '../lib/router'

export default function Confident() {
  return (
    <div className="stack">
      <section className="card soon">
        <h3>Le Confident arrive à l'étape 7</h3>
        <p className="muted">
          Un espace pour parler, quand tu veux. Il t'écoute, reformule, et t'aide à y voir
          plus clair. Ce n'est pas un psy, mais il est là.
        </p>
      </section>
      <button className="btn secondary" onClick={() => go('sos')}>
        Besoin d'aide maintenant ? Ouvre SOS
      </button>
    </div>
  )
}
