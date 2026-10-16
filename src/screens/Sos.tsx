import { PhoneIcon } from '../Icons'

export const HELPLINES = [
  { num: '107', name: 'Télé-Accueil', info: 'Belgique · gratuit · anonyme · 24h/24' },
  { num: '3114', name: 'Prévention suicide', info: 'France · gratuit · 24h/24' },
  { num: '112', name: 'Urgences', info: 'Si tu es en danger maintenant' },
]

export default function Sos() {
  return (
    <div className="stack">
      <section className="hero">
        <h2>Tu n'es pas seul.</h2>
        <p className="muted">
          Si c'est trop lourd en ce moment, appelle. Des gens sont là pour écouter, sans juger.
        </p>
      </section>

      <section className="stack tight">
        {HELPLINES.map((h) => (
          <a key={h.num} className="helpline" href={`tel:${h.num}`}>
            <span className="helpline-num">{h.num}</span>
            <span className="helpline-txt">
              <b>{h.name}</b>
              <small>{h.info}</small>
            </span>
            <PhoneIcon />
          </a>
        ))}
      </section>

      <section className="card soon">
        <h3>Respirer, écrire</h3>
        <p className="muted">
          À l'étape 6 : un exercice de respiration guidé (4-7-8) et un espace pour écrire ce
          que tu ressens.
        </p>
      </section>
    </div>
  )
}
