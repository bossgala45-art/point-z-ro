import { dayNumber, useData } from '../lib/store'
import { go } from '../lib/router'

function greeting(h: number) {
  if (h < 5) return 'Encore debout'
  if (h < 12) return 'Salut'
  if (h < 18) return 'Hey'
  return 'Bonsoir'
}

export default function Today() {
  const { settings, startDate } = useData()
  const day = dayNumber(startDate)
  const now = new Date()

  return (
    <div className="stack">
      <section className="hero">
        <p className="eyebrow">Jour {day}</p>
        <h2>
          {greeting(now.getHours())} {settings.firstName}.
        </h2>
        <p className="muted">Un jour à la fois. C'est tout ce qu'on te demande.</p>
      </section>

      <section className="card soon">
        <h3>Tes missions du jour</h3>
        <p className="muted">Elles arrivent à l'étape 2 : trois missions simples, à cocher.</p>
      </section>

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
