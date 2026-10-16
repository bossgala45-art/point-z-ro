import { useEffect, useState } from 'react'

export type Route =
  | 'aujourdhui'
  | 'progres'
  | 'carnet'
  | 'confident'
  | 'reglages'
  | 'sos'

const ROUTES: Route[] = ['aujourdhui', 'progres', 'carnet', 'confident', 'reglages', 'sos']

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
