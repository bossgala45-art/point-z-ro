import { go } from '../lib/router'

export default function Confident() {
  return (
    <div className="stack">
      <section className="card soon">
        <h3>Le Confident n'est pas encore activé</h3>
        <p className="muted">
          Un espace pour parler quand tu veux, qui t'écoute et t'aide à y voir plus clair. On pourra
          l'ajouter plus tard, quand tu voudras.
        </p>
      </section>
      <section className="card">
        <h3>En attendant</h3>
        <p className="muted small">
          Parle à quelqu'un de confiance : un ami, ta famille, l'infirmière ou le centre PMS de l'école, un
          médecin. Pour être écouté de façon anonyme, le 107 est gratuit, jour et nuit.
        </p>
        <a className="helpline" href="tel:107">
          <span className="helpline-num">107</span>
          <span className="helpline-txt">
            <b>Télé-Accueil</b>
            <small>Belgique · gratuit · anonyme · 24h/24</small>
          </span>
        </a>
      </section>
      <button className="btn secondary big" onClick={() => go('sos')}>
        Ouvrir SOS : respirer, écrire
      </button>
    </div>
  )
}
