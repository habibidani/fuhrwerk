import { KIND_LABEL, SOURCES, type SourceKind } from '../data/sources'
import { Label } from '../components/ui'

const DOT: Record<SourceKind, string> = {
  'offen': 'bg-ink',
  'datenraum': 'bg-alu',
  'im-haus': 'bg-paper border border-ink',
  'luecke': 'bg-transparent border border-dashed border-ink',
  'beispiel': 'bg-nitro border border-ink',
}

export default function Sources() {
  const counts = SOURCES.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.kind]: (acc[s.kind] ?? 0) + 1 }), {})
  return (
    <div>
      <Label>Datenquellen · Stand 22.10.2026</Label>
      <h1 className="text-3xl sm:text-4xl font-semibold mt-2 mb-2">Woher die Zahlen kommen, und wo noch Lücken sind.</h1>
      <p className="text-alu mb-6">
        {counts['offen'] ?? 0} offene Quellen, {counts['datenraum'] ?? 0} nur im Datenraum, {counts['luecke'] ?? 0} Lücke, {counts['beispiel'] ?? 0} Beispielwerte. Was gelb markiert ist, wird in der nächsten Version durch echte Daten ersetzt.
      </p>
      <ul className="flex flex-wrap gap-4 mb-6 label">
        {(Object.keys(KIND_LABEL) as SourceKind[]).map((k) => (
          <li key={k} className="flex items-center gap-2"><i className={'inline-block w-2.5 h-2.5 ' + DOT[k]} aria-hidden="true" />{KIND_LABEL[k]}</li>
        ))}
      </ul>
      <div className="overflow-x-auto">
        <table className="sheet">
          <thead><tr><th>Quelle</th><th>Anbieter</th><th>Status</th><th>Lizenz</th><th>Stand / Takt</th><th>Kosten</th></tr></thead>
          <tbody>
            {SOURCES.map((s) => (
              <tr key={s.id}>
                <td>
                  <p className="font-medium">{s.url ? <a className="underline decoration-line underline-offset-2 hover:decoration-ink" href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a> : s.name}</p>
                  {s.note && <p className="text-sm text-alu mt-0.5">{s.note}</p>}
                </td>
                <td className="text-alu">{s.provider}</td>
                <td><span className="amp"><i className={DOT[s.kind]} aria-hidden="true" />{KIND_LABEL[s.kind]}</span></td>
                <td className="text-alu">{s.licence}</td>
                <td className="text-alu">{s.updated} / {s.cadence}</td>
                <td className="text-alu">{s.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-dark mt-6">
        <Label className="text-nitro mb-1">Unser Weg in den Mobility Data Space</Label>
        <p className="text-sm leading-snug">Mitgliedschaft, dann ein EDC-Connector oder Connector-as-a-Service, dann Angebot im Katalog finden (11 Kategorien, Mobilithek gespiegelt), Vertrag gegen die Nutzungsbedingungen des Anbieters verhandeln (oft manuelle Freigabe), Übertragung Connector zu Connector. Die Daten bleiben beim Anbieter. Stand heute: Connector-Set-up begonnen, noch kein Katalogzugriff. Jede Hürde wird dokumentiert.</p>
      </div>
    </div>
  )
}
