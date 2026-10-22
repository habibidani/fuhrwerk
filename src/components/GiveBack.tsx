import { useState } from 'react'
import type { Flow, Profile } from '../lib/types'
import { FLOWS, viaFor } from '../lib/flows'
import { nowIso, usePledges } from '../lib/store'
import { Label } from './ui'

interface Props {
  flow: Flow
  profile: Profile
  say: (m: string) => void
  onDone: () => void
  onBack: () => void
}

const VIAS = ['Innung / Handwerkskammer Berlin', 'Verband', 'Leitstelle', 'Pflegeverband', 'gar nicht']

export default function GiveBack({ flow, profile, say, onDone, onBack }: Props) {
  const spec = FLOWS[flow]
  const [via, setVia] = useState(viaFor(profile))
  const [fields, setFields] = useState<string[]>(spec.giveBackFields)
  const [done, setDone] = useState(false)
  const [, setPledges] = usePledges()
  const none = via === 'gar nicht' || fields.length === 0

  const toggle = (f: string) => setFields((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]))

  const commit = () => {
    if (!none) setPledges((p) => [{ at: nowIso(), flow, via, fields }, ...p].slice(0, 20))
    setDone(true)
    say(none ? 'Kein Beitrag. Nichts wurde gesendet.' : 'Vorgemerkt, nur auf diesem Gerät. Nichts wurde gesendet.')
  }

  if (done) {
    return (
      <div className="card-dark">
        <h2 className="text-2xl font-semibold mb-2">{none ? 'Kein Beitrag. Nichts wurde gesendet.' : 'Vorgemerkt. Nichts wurde gesendet.'}</h2>
        <p className="text-alu mb-5">{none ? 'Ihre Antwort bleibt bei Ihnen.' : `In der echten Version bekommen Sie eine Bestätigung von ${via}, bevor irgendetwas fließt, und sehen vorher genau die Zähler, die rausgehen.`}</p>
        <button type="button" className="btn btn-nitro" onClick={onDone}>Neue Frage stellen</button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card">
        <Label className="mb-2">Was Sie dafür bekommen</Label>
        <p className="leading-snug">{spec.giveBackDoc}</p>
        <p className="text-sm text-alu mt-3">Erst wenn mindestens 10 Betriebe mitmachen, wird gerechnet. Vorher fließt nichts.</p>
      </div>
      <div className="card">
        <Label className="mb-2">Über wen</Label>
        <label className="grid gap-1 text-sm">
          Weg in den Datenraum
          <select className="field" value={via} onChange={(e) => setVia(e.target.value)}>
            {VIAS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <p className="text-sm text-alu mt-3">{via === 'gar nicht' ? 'Niemand, es fließt nichts.' : `${via}, zusammen mit mindestens 10 Betrieben. Sie sehen vorher jede Zahl.`}</p>
      </div>
      <div className="card">
        <Label className="mb-2">Was rausgeht, nur als Zähler</Label>
        <ul className="grid gap-2">
          {spec.giveBackFields.map((f) => (
            <li key={f}>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" checked={fields.includes(f)} onChange={() => toggle(f)} disabled={via === 'gar nicht'} />
                <span>{f}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="card-dark">
        <Label className="text-nitro mb-2">Was nie rausgeht</Label>
        <ul className="grid gap-1 text-sm">
          {spec.neverLeaves.map((f) => <li key={f}>{f}</li>)}
        </ul>
        <p className="text-xs text-alu mt-3">Rohdaten bleiben im Betrieb. Nur das Ergebnis wird gerechnet.</p>
      </div>
      <div className="lg:col-span-2 flex gap-3 no-print">
        <button type="button" className="btn btn-ghost" onClick={onBack}>Zurück</button>
        <button type="button" className="btn btn-primary" onClick={commit}>{none ? 'Ohne Beitrag abschließen' : 'Beitrag vormerken (Demo)'}</button>
      </div>
    </div>
  )
}
