import { clearAll, useHistory, usePledges } from '../lib/store'
import { FLOW_LABEL } from '../lib/detect'
import { Label } from '../components/ui'

const fmt = (iso: string) => new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function History() {
  const [history, setHistory] = useHistory()
  const [pledges, setPledges] = usePledges()
  const unanswered = history.filter((h) => h.flow === null)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ exportiert: new Date().toISOString(), fragen: history, zusagen: pledges }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'fuhrwerk-verlauf.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const wipe = () => {
    clearAll()
    setHistory([])
    setPledges([])
  }

  return (
    <div>
      <Label>Verlauf · nur auf diesem Gerät</Label>
      <h1 className="text-3xl sm:text-4xl font-semibold mt-2 mb-2">Ihre Fragen, Antworten und Rückmeldungen.</h1>
      <p className="text-alu mb-6">
        {history.length} {history.length === 1 ? 'Frage' : 'Fragen'}, davon {unanswered.length} nicht beantwortbar, {history.filter((h) => h.feedback).length} mit Rückmeldung, {pledges.length} {pledges.length === 1 ? 'Zusage' : 'Zusagen'} vorgemerkt. Nichts davon hat dieses Gerät verlassen.
      </p>
      <div className="flex gap-2 mb-6 no-print">
        <button type="button" className="btn btn-ghost" onClick={exportJson} disabled={history.length === 0 && pledges.length === 0}>Als JSON exportieren</button>
        <button type="button" className="btn btn-ghost" onClick={wipe} disabled={history.length === 0 && pledges.length === 0}>Alles auf diesem Gerät löschen</button>
      </div>

      {history.length === 0 ? (
        <div className="card text-alu">Noch keine Fragen gestellt.</div>
      ) : (
        <ul className="divide-y divide-line">
          {history.map((h) => (
            <li key={h.id} className="py-4 grid gap-1 sm:grid-cols-[9rem_1fr_6rem]">
              <span className="label">{fmt(h.at)}</span>
              <div>
                <p className="font-medium">{h.question}</p>
                <p className="text-sm text-alu">{h.flow ? FLOW_LABEL[h.flow] + ' · ' : ''}{h.headline}</p>
                {h.comment && <p className="text-sm mt-1">„{h.comment}“</p>}
              </div>
              <span className="label sm:text-right">{h.feedback === 'up' ? 'hilfreich' : h.feedback === 'down' ? 'nicht hilfreich' : ''}</span>
            </li>
          ))}
        </ul>
      )}

      {pledges.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-8 mb-2">Vorgemerkte Beiträge (Demo, nichts gesendet)</h2>
          <ul className="divide-y divide-line">
            {pledges.map((p, i) => (
              <li key={i} className="py-3 grid gap-1 sm:grid-cols-[9rem_1fr]">
                <span className="label">{fmt(p.at)}</span>
                <div>
                  <p className="font-medium">{FLOW_LABEL[p.flow]} · über {p.via}</p>
                  <p className="text-sm text-alu">{p.fields.join(' · ')}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
