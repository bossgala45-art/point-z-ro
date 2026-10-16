import { useEffect } from 'react'
import { askPersistentStorage, useData } from './lib/store'
import { back, go, PARENT, useRoute, type Route } from './lib/router'
import { BookIcon, ChartIcon, ChatIcon, GearIcon, SunIcon } from './Icons'
import Welcome from './screens/Welcome'
import Lock from './screens/Lock'
import { useLock } from './lib/pin'
import Today from './screens/Today'
import Progress from './screens/Progress'
import Journal from './screens/Journal'
import Confident from './screens/Confident'
import SettingsScreen from './screens/Settings'
import Sos from './screens/Sos'
import Bilan from './screens/Bilan'
import MissionsEditor from './screens/MissionsEditor'
import Reminders from './screens/Reminders'

const TABS: { route: Route; label: string; Icon: () => React.JSX.Element }[] = [
  { route: 'aujourdhui', label: "Aujourd'hui", Icon: SunIcon },
  { route: 'progres', label: 'Progrès', Icon: ChartIcon },
  { route: 'carnet', label: 'Preuves', Icon: BookIcon },
  { route: 'confident', label: 'Confident', Icon: ChatIcon },
  { route: 'reglages', label: 'Réglages', Icon: GearIcon },
]

const TITLES: Record<Route, string> = {
  aujourdhui: "Aujourd'hui",
  progres: 'Progression',
  carnet: 'Carnet de preuves',
  confident: 'Le Confident',
  reglages: 'Réglages',
  sos: 'SOS',
  bilan: 'Bilan du soir',
  missions: 'Mes missions',
  rappels: 'Mes rappels',
}

export default function App() {
  const data = useData()
  const route = useRoute()

  const { locked, unlock } = useLock(Boolean(data.settings.pinHash))

  useEffect(askPersistentStorage, [])

  if (!data.settings.firstName) return <Welcome />
  if (locked) return <Lock onUnlock={unlock} />

  const parent = PARENT[route]
  const activeTab = parent ?? route
  const showBack = parent !== undefined || route === 'sos'

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-title">
          {showBack && (
            <button className="back" onClick={() => back(parent ?? 'aujourdhui')} aria-label="Retour">
              ‹
            </button>
          )}
          <h1>{TITLES[route]}</h1>
        </div>
        {route !== 'sos' && (
          <button className="sos-pill" onClick={() => go('sos')}>
            SOS
          </button>
        )}
      </header>

      <main className="content">
        {route === 'aujourdhui' && <Today />}
        {route === 'progres' && <Progress />}
        {route === 'carnet' && <Journal />}
        {route === 'confident' && <Confident />}
        {route === 'reglages' && <SettingsScreen />}
        {route === 'sos' && <Sos />}
        {route === 'bilan' && <Bilan />}
        {route === 'missions' && <MissionsEditor />}
        {route === 'rappels' && <Reminders />}
      </main>

      <nav className="tabbar">
        {TABS.map(({ route: r, label, Icon }) => (
          <button
            key={r}
            className={r === activeTab ? 'tab active' : 'tab'}
            onClick={() => go(r)}
            aria-current={r === activeTab ? 'page' : undefined}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
