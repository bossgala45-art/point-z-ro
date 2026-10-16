import { isIOS, isStandalone, useInstallPrompt } from '../lib/install'

export default function InstallHelp({ compact = false }: { compact?: boolean }) {
  const install = useInstallPrompt()

  if (isStandalone()) {
    return (
      <div className="card">
        <p className="ok-line">✓ L'appli est installée sur ton écran d'accueil.</p>
      </div>
    )
  }

  return (
    <div className="card install">
      <h3>Installe-moi d'abord</h3>
      {compact && (
        <p className="muted">
          Ajoute l'appli à ton écran d'accueil, puis ouvre-la depuis l'icône.
          Sinon, ce que tu notes ici et ce que tu notes dans l'appli seront séparés.
        </p>
      )}
      {install ? (
        <button className="btn primary" onClick={install}>
          Installer Point Zéro
        </button>
      ) : isIOS() ? (
        <ol className="steps">
          <li>Ouvre cette page dans <b>Safari</b>.</li>
          <li>Touche le bouton <b>Partager</b> (le carré avec une flèche).</li>
          <li>Choisis <b>« Sur l'écran d'accueil »</b>, puis <b>Ajouter</b>.</li>
        </ol>
      ) : (
        <ol className="steps">
          <li>Ouvre cette page dans <b>Chrome</b>.</li>
          <li>Touche le menu <b>⋮</b> en haut à droite.</li>
          <li>Choisis <b>« Ajouter à l'écran d'accueil »</b> ou <b>« Installer l'application »</b>.</li>
        </ol>
      )}
    </div>
  )
}
