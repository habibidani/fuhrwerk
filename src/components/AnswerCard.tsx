import { useEffect, useMemo, useState } from 'react'
import type { Flow, Profile, Tour } from '../lib/types'
import { EXAMPLE_TOURS } from '../data/examples'
import { EV_DEFAULT, evaluateEv, evaluateFleet, evaluateParking, type EvSettings, WEEKDAYS } from '../lib/compute'
import { today } from '../lib/store'
import { Label, SynthNote } from './ui'

export interface AnswerSummary {
  headline: string
  text: string
}

interface Props {
  flow: Flow
  question: string
  profile: Profile
  tours: Tour[]
  onSummary: (s: AnswerSummary) => void
  say: (m: string) => void
  feedback?: 'up' | 'down'
  onFeedback: (fb: 'up' | 'down', comment?: string) => void
}

export default function AnswerCard(p: Props) {
  const useExample = p.tours.length === 0
  const tours = useExample ? EXAMPLE_TOURS : p.tours
  const [ev, setEv] = useState<EvSettings>(EV_DEFAULT)
  const district = p.profile.districts[0] ?? 'Mitte'

  const result = useMemo(() => {
    if (p.flow === 'A') return { kind: 'A' as const, r: evaluateEv(tours, ev) }
    if (p.flow === 'C') return { kind: 'C' as const, r: evaluateFleet(tours, p.profile) }
    return { kind: 'B' as const, r: evaluateParking(district) }
  }, [p.flow, tours, ev, p.profile, district])

  const prefix = useExample ? 'Beispielrechnung: ' : ''
  const headline = useMemo(() => {
    if (result.kind === 'A') {
      const { ja, nein, rows } = result.r
      return prefix + (nein === 0
        ? `Alle ${rows.length} Touren fahren mit einem E-Transporter, auch im Winter.`
        : `${ja} von ${rows.length} Touren ${ja === 1 ? 'fährt' : 'fahren'} mit einem E-Transporter. ${nein} ${nein === 1 ? 'Tour braucht' : 'Touren brauchen'} unterwegs eine Schnellladesäule.`)
    }
    if (result.kind === 'C') {
      const { n, needed, spare, missing, overlaps, shortSpike } = result.r
      const spike = shortSpike && overlaps.length && overlaps[0].count > needed ? overlaps[0] : null
      if (missing > 0) return prefix + `Ihnen ${missing === 1 ? 'fehlt 1 Fahrzeug' : `fehlen ${missing} Fahrzeuge`}: an ${overlaps.length ? overlaps.map((o) => o.day).join(', ') : 'mehreren Tagen'} laufen ${needed} Touren gleichzeitig, Sie haben ${n}.`
      if (spare === 0) return prefix + (n === 1 ? `Ihr Fahrzeug wird gebraucht: an ${overlaps.length ? overlaps.map((o) => o.day).join(', ') : 'mehreren Tagen'} läuft eine Tour.` : `Sie brauchen alle ${n} Fahrzeuge: an ${overlaps.length ? overlaps.map((o) => o.day).join(', ') : 'mehreren Tagen'} laufen ${needed} Touren gleichzeitig.`)
      return prefix + `Mit ${n - spare} statt ${n} Fahrzeugen schaffen Sie alle Touren${spike ? `, außer ${spike.day} ${spike.from} bis ${spike.to} (${spike.count} Touren gleichzeitig)` : ''}.`
    }
    const { points, okCount } = result.r
    return `Beispielrechnung: Von 12 Beispieladressen in ${district} haben ${okCount} eine Lieferzone innerhalb 150 m, ${points.length - okCount} nicht.`
  }, [result, district, prefix])

  const text = useMemo(() => `Fuhrwerk, Antwort vom ${today()}\nFrage: ${p.question}\n\n${headline}\n\n${useExample || p.flow === 'B' ? 'Beispielrechnung, ' : 'Gerechnet mit eigenen Touren, externe Werte sind Beispiele. '}Quellen in der App. Nichts wurde gesendet.`, [headline, p.question, useExample, p.flow])

  useEffect(() => {
    p.onSummary({ headline, text })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headline])

  const share = () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener')
    p.say('WhatsApp geöffnet. Sie entscheiden, ob und an wen.')
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      p.say('Als Text kopiert.')
    } catch {
      p.say('Kopieren nicht möglich, bitte markieren und kopieren.')
    }
  }
  const [comment, setComment] = useState('')

  return (
    <article className="a4" aria-label="Antwort als A4-Karte">
      <header className="flex flex-wrap justify-between gap-2 text-xs text-alu font-mono border-b border-line pb-3 mb-4">
        <span>Fuhrwerk · Antwort vom {today()} · {p.profile.branche}, {p.profile.vehicles} Fahrzeuge, {p.profile.districts.join(', ') || 'Berlin'}</span>
        <span>Frage: <q>{p.question}</q></span>
      </header>

      <h2 className="text-2xl sm:text-3xl font-semibold leading-tight mb-5">{headline}</h2>

      {result.kind === 'A' && <FlowA r={result.r} ev={ev} setEv={setEv} useExample={useExample} />}
      {result.kind === 'B' && <FlowB r={result.r} district={district} />}
      {result.kind === 'C' && <FlowC r={result.r} useExample={useExample} tourCount={tours.length} />}

      <SynthNote>
        {p.flow === 'B'
          ? 'Beispielrechnung mit 12 synthetischen Adressen, nicht Ihre. In der nächsten Version aus Ihrer Kundenliste, die auf diesem Gerät bleibt. Uhrzeiten aus Ihrer Frage werden noch nicht ausgewertet. Lieferzonen gibt es nirgends als Datensatz, siehe Datenquellen.'
          : useExample
            ? 'Beispielrechnung mit 9 synthetischen Touren. Mit Ihren eigenen Touren unter „Meine Touren“ rechnet die Karte mit Ihren Zahlen, die auf diesem Gerät bleiben.'
            : 'Gerechnet mit Ihren Touren von diesem Gerät. Ladepunkte, Parkzonen und Kosten sind in dieser Version noch Beispielwerte, siehe Datenquellen. Zahlen und Uhrzeiten aus Ihrer Frage (etwa „4 von 12“ oder „6 Uhr früh“) werden noch nicht ausgewertet.'}
      </SynthNote>

      <div className="no-print mt-6 pt-4 border-t border-line flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>Als PDF drucken</button>
        <button type="button" className="btn btn-ghost" onClick={share}>Per WhatsApp teilen</button>
        <button type="button" className="btn btn-ghost" onClick={copy}>Als Text kopieren</button>
        <span className="flex-1" />
        <span className="label">War das hilfreich?</span>
        <button type="button" className="chip" aria-pressed={p.feedback === 'up'} onClick={() => p.onFeedback('up', comment)}>Ja</button>
        <button type="button" className="chip" aria-pressed={p.feedback === 'down'} onClick={() => p.onFeedback('down', comment)}>Nein</button>
        <input className="field max-w-xs text-sm" placeholder="Was fehlt? (optional)" value={comment} onChange={(e) => setComment(e.target.value)} aria-label="Kommentar zur Antwort" />
      </div>
    </article>
  )
}

/* ---------- A ---------- */
function FlowA({ r, ev, setEv, useExample }: { r: ReturnType<typeof evaluateEv>; ev: EvSettings; setEv: (s: EvSettings) => void; useExample: boolean }) {
  return (
    <div>
      <ul className="grid sm:grid-cols-3 gap-3 mb-5">
        <Fact big={`${ev.rangeSummer} km`} small={`Reichweite angenommen, im Winter ${r.winter} km`} />
        <Fact big={`${r.kwhWeek} kWh`} small={`Ladebedarf pro Woche für ${r.kmWeek} km (28 kWh je 100 km, Beispielwert)`} />
        <Fact big={ev.depotChargeWindow ? 'Mittags am Depot' : 'Kein Ladefenster'} small={ev.depotChargeWindow ? `Ladefenster reicht für ${r.ja} von ${r.rows.length} Touren; ${r.nein === 0 ? 'keine' : r.nein} ${r.nein === 1 ? 'braucht' : 'brauchen'} zusätzlich Schnellladung unterwegs` : 'Ohne Ladefenster werden knappe Touren unsicher'} />
      </ul>
      <h3 className="font-semibold mb-2">Alle {r.rows.length} Touren im Einzelnen</h3>
      <div className="overflow-x-auto">
        <table className="sheet">
          <thead><tr><th>Tour</th><th>Bezirk</th><th className="num">Strecke</th><th>Elektrisch</th><th>Hinweis</th></tr></thead>
          <tbody>
            {r.rows.map((row) => (
              <tr key={row.tour.id}>
                <td>{row.tour.name}{row.tour.example && <span className="ml-1 inline-block w-2 h-2 bg-nitro border border-ink align-middle" title="Beispieltour" />}</td>
                <td className="text-alu">{row.tour.district}</td>
                <td className="num">{row.tour.km} km</td>
                <td className={row.verdict === 'nein' ? 'text-alu' : 'font-medium'}>{row.verdict === 'ja' ? 'Ja' : row.verdict === 'knapp' ? 'Ja, knapp' : 'Nein'}</td>
                <td className="text-alu">{row.hint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Tomorrow>
        {r.nein === 0
          ? `Sie können alle ${r.rows.length} Touren ab dem ersten Tag elektrisch fahren und laden am Depot.`
          : `Sie können ${r.ja} ${r.ja === 1 ? 'Tour' : 'Touren'} ab dem ersten Tag elektrisch fahren und laden am Depot. Für ${r.rows.filter((x) => x.verdict === 'nein').map((x) => x.tour.name.split(',')[0]).join(' und ')} planen Sie eine Schnellladung unterwegs ein (bei 150 kW etwa 20 bis 30 Minuten, Beispielwert) oder lassen ${r.nein === 1 ? 'diese Tour' : 'diese Touren'} vorerst beim Diesel.`}
      </Tomorrow>
      <details className="no-print mt-4">
        <summary className="cursor-pointer text-sm font-medium">Annahmen ändern</summary>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <label className="grid gap-1 text-sm">Reichweite Sommer (km)<input type="number" className="field" min={80} max={400} value={ev.rangeSummer} onChange={(e) => setEv({ ...ev, rangeSummer: Number(e.target.value) || 180 })} /></label>
          <label className="grid gap-1 text-sm">Winterfaktor<input type="number" className="field" step={0.01} min={0.5} max={1} value={ev.winterFactor} onChange={(e) => setEv({ ...ev, winterFactor: Math.min(1, Math.max(0.5, Number(e.target.value) || 0.78)) })} /></label>
          <label className="flex items-center gap-2 text-sm self-end"><input type="checkbox" checked={ev.depotChargeWindow} onChange={(e) => setEv({ ...ev, depotChargeWindow: e.target.checked })} />Ladefenster am Depot (mittags)</label>
        </div>
      </details>
      <Sources items={[
        useExample ? 'Tourendaten: synthetisch, 9 Touren eines Beispielbetriebs, nicht Ihre Daten' : 'Tourendaten: Ihre Einträge unter „Meine Touren“, nur auf diesem Gerät',
        'Ladepunkte je Bezirk: Beispielwerte, werden durch das Ladesäulenregister der Bundesnetzagentur ersetzt (CC BY 4.0, monatlich)',
        'Baustellen und Verkehrslage: VIZ Berlin über Mobilithek, in dieser Version nicht eingerechnet',
        'Lieferzonen und Halteverbote: kein Datensatz (Stand 10/2026)',
        `Reichweite ${ev.rangeSummer} km, Winterfaktor ${ev.winterFactor}: Herstellerangabe, Beispiel`,
      ]} />
    </div>
  )
}

/* ---------- B ---------- */
function FlowB({ r, district }: { r: ReturnType<typeof evaluateParking>; district: string }) {
  const bad = r.points.filter((x) => !x.ok)
  return (
    <div>
      <ul className="grid sm:grid-cols-3 gap-3 mb-5">
        <Fact big={`${bad.length} Adressen`} small={`darauf konzentriert sich das Bußgeld-Risiko im Beispiel (${bad.map((b) => b.id).join(', ')})`} />
        <Fact big={`${r.saving} € pro Monat`} small={`geschätzte Ersparnis, wenn Sie dort anders halten (${r.finePerCase} € je Vorgang, Beispiel)`} />
        <Fact big={r.level === 'hoch' ? 'Parkraum bewirtschaftet' : r.level === 'mittel' ? 'Teils bewirtschaftet' : 'Kaum bewirtschaftet'} small={`Parkzonen-Niveau in ${district}, Beispielwert bis der WFS der Senatsverwaltung angebunden ist`} />
      </ul>
      <h3 className="font-semibold mb-2">12 Beispieladressen, schematisch</h3>
      <svg viewBox="0 0 560 300" role="img" aria-label={`Schematische Karte: 12 Beispieladressen, ${r.okCount} mit Lieferzone innerhalb 150 Meter, ${bad.length} ohne. Schematisch, nicht die echte Karte.`} className="w-full max-w-2xl border border-line rounded">
        <rect width="560" height="300" fill="#FDFDFD" />
        {Array.from({ length: 9 }, (_, i) => 40 + i * 60).map((x) => <line key={'v' + x} x1={x} y1="20" x2={x} y2="290" stroke="#EFEFEF" />)}
        {Array.from({ length: 5 }, (_, i) => 30 + i * 65).map((y) => <line key={'h' + y} x1="20" y1={y} x2="540" y2={y} stroke="#EFEFEF" />)}
        <rect x="40" y="95" width="480" height="8" fill="#E2E2E2" /><rect x="40" y="200" width="480" height="8" fill="#E2E2E2" /><rect x="265" y="20" width="8" height="270" fill="#E2E2E2" />
        {r.points.map((pt) => (
          <g key={pt.id}>
            {pt.ok && <rect x={pt.x - 22} y={pt.y - 14} width="44" height="28" rx="4" fill="#E8FF2B" stroke="#2A2720" strokeDasharray="3 2" />}
            <circle cx={pt.x} cy={pt.y} r="9" fill={pt.ok ? '#2A2720' : '#818181'} />
            <text x={pt.x} y={pt.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#FDFDFD">{pt.id}</text>
          </g>
        ))}
        <text x="540" y="292" textAnchor="end" fontSize="11" fill="#818181">schematisch, nicht die echte Karte</text>
      </svg>
      <p className="text-sm text-alu mt-2">Grünes Feld = Lieferzone innerhalb 150 m ({r.okCount}). Grau = keine Lieferzone in 150 m ({bad.length}).</p>
      {bad.length > 0 && (
        <>
          <h3 className="font-semibold mt-4 mb-2">Die {bad.length} ohne Lieferzone</h3>
          <ul className="list-disc pl-5 text-sm">
            {bad.map((b) => <li key={b.id}><b>{b.id}:</b> {b.note}</li>)}
          </ul>
        </>
      )}
      <Tomorrow>
        Im Beispiel: Bei {r.points.filter((x) => x.ok).map((x) => x.id).join(', ')} halten die Fahrer ab morgen in der markierten Lieferzone, nicht davor.
        {bad.some((b) => b.id === 'F' || b.id === 'K') && ' Für F und K stellen Sie den Antrag auf Handwerkerparken.'}
        {bad.some((b) => b.id === 'D' || b.id === 'L') && ' Für D und L planen Sie 5 Minuten Fußweg ein.'}
      </Tomorrow>
      <Sources items={[
        `Adressdaten: synthetisch, 12 Beispieladressen in ${district}, nicht Ihre Daten`,
        `Lieferzonen und Halteverbote: kein öffentlicher Datensatz für ${district} (Stand 10/2026), Annahmen als Beispiel`,
        'Parkzonen: Senatsverwaltung für Mobilität, Stand 09/2026, Datenlizenz Deutschland Zero 2.0, in dieser Version nur als Beispiel-Niveau je Bezirk',
        'Baustellen und Verkehrslage: VIZ Berlin über Mobilithek, in dieser Version nicht eingerechnet',
        `Bußgeld ${r.finePerCase} € je Vorgang: Bußgeldkatalog 2026, Beispielrechnung`,
      ]} />
    </div>
  )
}

/* ---------- C ---------- */
function FlowC({ r, useExample, tourCount }: { r: ReturnType<typeof evaluateFleet>; useExample: boolean; tourCount: number }) {
  const thin = !useExample && tourCount < r.n
  return (
    <div>
      {thin && (
        <p className="card mb-4 text-sm">Sie haben {tourCount} {tourCount === 1 ? 'Tour' : 'Touren'} für {r.n} Fahrzeuge eingetragen. Die Rechnung ist erst belastbar, wenn alle Touren eines typischen Tages drin sind; bis dahin ist die Zahl unten eine Untergrenze, keine Empfehlung.</p>
      )}
      <ul className="grid sm:grid-cols-3 gap-3 mb-5">
        <Fact big={`${r.needed} ${r.needed === 1 ? 'Fahrzeug' : 'Fahrzeuge'}`} small={r.shortSpike ? `reichen an normalen Tagen; Spitze ${r.maxPeak} am ${r.overlaps.map((o) => o.day).join(', ')}, lösbar durch Tourentausch. Sie haben ${r.n}` : `gleichzeitig unterwegs in der Spitze; Sie haben ${r.n}`} />
        {r.spare > 0 ? (
          <Fact big={`ca. ${(r.spare * r.costPerVehicle).toLocaleString('de-DE')} € pro Jahr`} small={`Vollkosten für ${r.spare} ${r.spare === 1 ? 'Fahrzeug' : 'Fahrzeuge'} (Leasing, Versicherung, Wartung, Steuer; ${r.costPerVehicle.toLocaleString('de-DE')} € je Fahrzeug, Beispielwert)`} />
        ) : (
          <Fact big="Kein Fahrzeug frei" small={r.missing > 0 ? `Es fehlen ${r.missing}; Vollkosten je zusätzlichem Fahrzeug etwa ${r.costPerVehicle.toLocaleString('de-DE')} € pro Jahr (Beispielwert)` : 'Alle Fahrzeuge sind in der Spitze unterwegs; Einsparung erst, wenn eine Tour verschoben wird'} />
        )}
        <Fact big={`${r.util} %`} small={`Auslastung Ihrer ${r.n} Fahrzeuge an ${r.activeDays} Tourtagen, 11 Stunden je Tag (${r.hoursWeek} Tourstunden pro Woche)`} />
      </ul>
      <h3 className="font-semibold mb-2">Gleichzeitige Touren je Wochentag</h3>
      <div className="grid gap-1.5">
        {WEEKDAYS.map((d) => {
          const v = r.perDay[d]
          const w = Math.round((v / Math.max(r.n, 1)) * 100)
          return (
            <div key={d} className="grid grid-cols-[2.5rem_1fr_3rem] items-center gap-3 text-sm">
              <span className="label">{d}</span>
              <div className="h-5 bg-titan rounded-sm overflow-hidden"><div className={'h-full ' + (v > r.n - r.spare ? 'bg-ink' : 'bg-alu')} style={{ width: `${Math.min(100, w)}%` }} /></div>
              <span className="num">{v} / {r.n}</span>
            </div>
          )
        })}
      </div>
      <Tomorrow>
        {r.spare > 0
          ? `Sie lassen ${r.spare === 1 ? 'ein Fahrzeug' : `${r.spare} Fahrzeuge`} vier Wochen stehen und fahren alle Touren mit ${r.n - r.spare}.${r.shortSpike && r.overlaps.length && r.overlaps[0].count > r.needed ? ` ${r.overlaps[0].day} ${r.overlaps[0].from} bis ${r.overlaps[0].to} laufen ${r.overlaps[0].count} Touren gleichzeitig: eine Tour so verschieben, dass sie das Fenster von ${r.overlaps[0].from} bis ${r.overlaps[0].to} nicht berührt.` : ''} Wenn in den vier Wochen nichts liegen bleibt, geben Sie ${r.spare === 1 ? 'das Fahrzeug' : 'die Fahrzeuge'} ab, ob Leasing, Verkauf oder Pool.`
          : `Alle ${r.n} Fahrzeuge werden gebraucht. Bevor Sie ein weiteres anschaffen, prüfen Sie, ob eine Tour am ${r.overlaps[0]?.day ?? 'Spitzentag'} verschoben werden kann.`}
      </Tomorrow>
      <Sources items={[
        useExample ? 'Tourendaten: synthetisch, 9 Touren eines Beispielbetriebs, nicht Ihre Daten' : 'Tourendaten: Ihre Einträge unter „Meine Touren“, nur auf diesem Gerät',
        'Fahrzeiten je Tageszeit: VIZ Berlin Verkehrslage, alle 15 Minuten, in dieser Version nicht eingerechnet',
        `Vollkosten ${r.costPerVehicle.toLocaleString('de-DE')} € pro Jahr für einen Transporter bis 3,5 t: Verbandsrichtwert, Beispiel`,
      ]} />
    </div>
  )
}

/* ---------- Bausteine ---------- */
function Fact({ big, small }: { big: string; small: string }) {
  return (
    <li className="card">
      <p className="text-xl font-semibold leading-tight">{big}</p>
      <p className="text-sm text-alu mt-1 leading-snug">{small}</p>
    </li>
  )
}

function Tomorrow({ children }: { children: React.ReactNode }) {
  return (
    <section className="card-dark mt-5">
      <Label className="text-nitro mb-1">Was morgen anders läuft</Label>
      <p className="leading-snug">{children}</p>
    </section>
  )
}

function Sources({ items }: { items: string[] }) {
  return (
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer font-medium">Woher die Zahlen kommen</summary>
      <ul className="list-disc pl-5 mt-2 text-alu">
        {items.map((s) => <li key={s}>{s}</li>)}
      </ul>
    </details>
  )
}
