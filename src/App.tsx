import { useEffect } from 'react'
import { askPersistentStorage, useData } from './lib/store'
import { go, useRoute, type Route } from './lib/router'
import { BookIcon, ChartIcon, ChatIcon, GearIcon, SunIcon } from './Icons'
import Welcome from './screens/Welcome'
import Today from './screens/Today'
import Progress from './screens/Progress'
import Journal from './screens/Journal'
import Confident from './screens/Confident'
import SettingsScreen from './screens/Settings'
import Sos from './screens/Sos'

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
}

export default function App() {
  const data = useData()
  const route = useRoute()

  useEffect(askPersistentStorage, [])

  if (!data.settings.firstName) return <Welcome />

  return (
    <div className="app">
      <header className="topbar">
        <h1>{TITLES[route]}</h1>
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
      </main>

      <nav className="tabbar">
        {TABS.map(({ route: r, label, Icon }) => (
          <button
            key={r}
            className={r === route ? 'tab active' : 'tab'}
            onClick={() => go(r)}
            aria-current={r === route ? 'page' : undefined}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
