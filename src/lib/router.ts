import { useEffect, useState } from 'react'

export type Route =
  | 'aujourdhui'
  | 'progres'
  | 'carnet'
  | 'confident'
  | 'reglages'
  | 'sos'
  | 'bilan'
  | 'missions'
  | 'rappels'

const ROUTES: Route[] = ['aujourdhui', 'progres', 'carnet', 'confident', 'reglages', 'sos', 'bilan', 'missions', 'rappels']

/** Écrans « enfants » : ils ont un bouton retour et allument l'onglet parent. */
export const PARENT: Partial<Record<Route, Route>> = {
  bilan: 'aujourdhui',
  missions: 'reglages',
  rappels: 'reglages',
}

export function back(fallback: Route) {
  if (window.history.length > 1) window.history.back()
  else go(fallback)
}

function read(): Route {
  const h = window.location.hash.replace(/^#\/?/, '') as Route
  return ROUTES.includes(h) ? h : 'aujourdhui'
}

export function go(route: Route) {
  window.location.hash = `/${route}`
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(read)
  useEffect(() => {
    const on = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}
