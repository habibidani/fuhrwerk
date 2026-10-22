import { useEffect, useState } from 'react'
import Ask from './pages/Ask'
import Tours from './pages/Tours'
import Sources from './pages/Sources'
import History from './pages/History'
import { useProfile, useTours } from './lib/store'

type Route = 'frage' | 'touren' | 'quellen' | 'verlauf'

const ROUTES: { id: Route; label: string; short: string }[] = [
  { id: 'frage', label: 'Frage', short: 'Frage' },
  { id: 'touren', label: 'Meine Touren', short: 'Touren' },
  { id: 'quellen', label: 'Datenquellen', short: 'Quellen' },
  { id: 'verlauf', label: 'Verlauf', short: 'Verlauf' },
]

function routeFromHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '') as Route
  return ROUTES.some((r) => r.id === h) ? h : 'frage'
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [profile, setProfile] = useProfile()
  const [tours, setTours] = useTours()

  useEffect(() => {
    const on = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const [askKey, setAskKey] = useState(0)
  const go = (r: Route) => {
    if (r === 'frage' && route === 'frage') setAskKey((k) => k + 1) // „Frage“ erneut geklickt: neu beginnen
    window.location.hash = '/' + r
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="no-print border-b border-line bg-paper sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 min-h-14 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <a href="#/frage" className="flex items-center gap-3" aria-label="Fuhrwerk, Startseite">
            <span className="inline-grid grid-cols-2 gap-[2px] w-5 h-5" aria-hidden="true">
              <i className="bg-nitro block" /><i className="bg-ink block" /><i className="bg-ink block" /><i className="bg-alu block" />
            </span>
            <span className="font-semibold tracking-tight">Fuhrwerk</span>
            <span className="label hidden sm:inline">Prototyp v2 · Beispielwerte</span>
          </a>
          <nav aria-label="Hauptnavigation" className="flex flex-wrap items-center gap-1">
            {ROUTES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => go(r.id)}
                aria-current={route === r.id ? 'page' : undefined}
                className={
                  'px-3 py-1.5 rounded text-sm ' +
                  (route === r.id ? 'bg-ink text-paper' : 'text-ink hover:bg-titan')
                }
              >
                <span className="sm:hidden">{r.short}</span><span className="hidden sm:inline">{r.label}</span>
                {r.id === 'touren' && tours.length > 0 && (
                  <span className="ml-1.5 label text-[0.65rem] text-inherit opacity-70">{tours.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
        {route === 'frage' && <Ask key={askKey} profile={profile} setProfile={setProfile} tours={tours} />}
        {route === 'touren' && <Tours tours={tours} setTours={setTours} profile={profile} />}
        {route === 'quellen' && <Sources />}
        {route === 'verlauf' && <History />}
      </main>

      <footer className="no-print border-t border-line">
        <div className="mx-auto max-w-5xl px-4 py-5 flex flex-wrap items-center justify-between gap-3">
          <p className="label">Fuhrwerk · Konzept-Prototyp v2 · CODE Berlin, M_10 · Partner-Challenge Mobility Data Space</p>
          <p className="label flex items-center gap-2">
            <i className="inline-block w-2.5 h-2.5 bg-nitro border border-ink" aria-hidden="true" /> grün = Beispielwert, synthetisch · nichts wird gesendet · keine Rechtsberatung
          </p>
        </div>
      </footer>
    </div>
  )
}
