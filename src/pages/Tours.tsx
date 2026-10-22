import { useState } from 'react'
import type { Profile, Tour, Weekday } from '../lib/types'
import { BEZIRKE } from '../data/berlin'
import { EXAMPLE_TOURS } from '../data/examples'
import { WEEKDAYS } from '../lib/compute'
import { uid } from '../lib/store'
import { Label, Toast } from '../components/ui'

interface Props {
  tours: Tour[]
  setTours: (t: Tour[] | ((prev: Tour[]) => Tour[])) => void
  profile: Profile
}

const EMPTY = (district: string): Omit<Tour, 'id'> => ({ name: '', district, km: 50, start: '07:30', end: '16:00', days: ['Mo', 'Di', 'Mi', 'Do', 'Fr'] })

export default function Tours({ tours, setTours, profile }: Props) {
  const [draft, setDraft] = useState<Omit<Tour, 'id'>>(EMPTY(profile.districts[0] ?? 'Mitte'))
  const [err, setErr] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const say = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 2400)
  }

  const add = () => {
    if (!draft.name.trim()) return setErr('Bitte einen Namen für die Tour eintragen, zum Beispiel „Tour Nord“.')
    if (draft.km <= 0 || draft.km > 600) return setErr('Strecke zwischen 1 und 600 km.')
    if (draft.start === draft.end) return setErr('Start und Ende dürfen nicht gleich sein. Nachttouren über Mitternacht sind erlaubt (z. B. 22:00 bis 02:00).')
    if (draft.days.length === 0) return setErr('Mindestens einen Wochentag wählen.')
    setErr('')
    setTours((t) => [...t, { ...draft, id: uid(), name: draft.name.trim() }])
    setDraft(EMPTY(draft.district))
    say('Tour gespeichert, nur auf diesem Gerät.')
  }

  const remove = (id: string) => setTours((t) => t.filter((x) => x.id !== id))
  const loadExample = () => {
    setTours(EXAMPLE_TOURS.map((t) => ({ ...t, id: uid() })))
    say('9 Beispieltouren geladen. Zum Bearbeiten löschen und neu eintragen.')
  }
  const clear = () => {
    setTours([])
    say('Alle Touren gelöscht.')
  }
  const toggleDay = (d: Weekday) => setDraft((x) => ({ ...x, days: x.days.includes(d) ? x.days.filter((y) => y !== d) : [...x.days, d] }))

  const kmWeek = tours.reduce((a, t) => a + t.km * t.days.length, 0)

  return (
    <div>
      <Label>Meine Touren</Label>
      <h1 className="text-3xl sm:text-4xl font-semibold mt-2 mb-2">Ihre Touren, damit die Antwort mit Ihren Zahlen rechnet.</h1>
      <p className="text-alu mb-6">Bleibt im Browser auf diesem Gerät. Wird nirgendwohin gesendet. Ohne eigene Touren rechnet Fuhrwerk mit 9 Beispieltouren, als synthetisch markiert.</p>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <form
          className="card grid gap-3 self-start"
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
        >
          <Label>Tour hinzufügen</Label>
          <label className="grid gap-1 text-sm">Name<input className="field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Tour Nord" /></label>
          <label className="grid gap-1 text-sm">Bezirk (Schwerpunkt)
            <select className="field" value={draft.district} onChange={(e) => setDraft({ ...draft, district: e.target.value })}>
              {BEZIRKE.map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">Strecke pro Tag, hin und zurück (km)<input type="number" className="field" min={1} max={600} inputMode="numeric" value={draft.km} onChange={(e) => setDraft({ ...draft, km: Number(e.target.value) })} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">Start<input type="time" className="field" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} /></label>
            <label className="grid gap-1 text-sm">Ende<input type="time" className="field" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} /></label>
          </div>
          <fieldset>
            <legend className="text-sm mb-1">Wochentage</legend>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d) => <button key={d} type="button" className="chip text-xs" aria-pressed={draft.days.includes(d)} onClick={() => toggleDay(d)}>{d}</button>)}
            </div>
          </fieldset>
          <p role="alert" className="text-sm min-h-5">{err}</p>
          <button type="submit" className="btn btn-primary">Tour speichern</button>
        </form>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="text-sm text-alu">{tours.length} {tours.length === 1 ? 'Tour' : 'Touren'} · {kmWeek.toLocaleString('de-DE')} km pro Woche · {profile.vehicles} Fahrzeuge im Profil</p>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost" onClick={loadExample}>Beispieltouren laden</button>
              <button type="button" className="btn btn-ghost" onClick={clear} disabled={tours.length === 0}>Alle löschen</button>
            </div>
          </div>
          {tours.length === 0 ? (
            <div className="card text-alu">Noch keine Touren. Tragen Sie links Ihre Touren ein oder laden Sie die Beispieltouren, um die Antwort auszuprobieren.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="sheet">
                <thead><tr><th>Tour</th><th>Bezirk</th><th className="num">km/Tag</th><th>Zeit</th><th>Tage</th><th></th></tr></thead>
                <tbody>
                  {tours.map((t) => (
                    <tr key={t.id}>
                      <td>{t.name}{t.example && <span className="ml-1 inline-block w-2 h-2 bg-nitro border border-ink align-middle" title="Beispieltour" />}</td>
                      <td className="text-alu">{t.district}</td>
                      <td className="num">{t.km}</td>
                      <td className="text-alu">{t.start} bis {t.end}</td>
                      <td className="text-alu">{t.days.join(' ')}</td>
                      <td className="text-right"><button type="button" className="chip text-xs" onClick={() => remove(t.id)} aria-label={`Tour ${t.name} löschen`}>Löschen</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tours.length > 0 && <a href="#/frage" className="btn btn-nitro mt-4">Jetzt eine Frage stellen</a>}
        </div>
      </div>
      <Toast msg={toast} />
    </div>
  )
}
