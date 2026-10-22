import type { Profile, Tour, Weekday } from './types'
import { LADEPUNKTE_BEISPIEL, PARKZONEN_BEISPIEL, type Bezirk } from '../data/berlin'

export const WEEKDAYS: Weekday[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/* ---------- Flow A: Elektrifizierung ---------- */

export interface EvSettings {
  rangeSummer: number // km
  winterFactor: number // 0..1
  depotChargeWindow: boolean
}

export const EV_DEFAULT: EvSettings = { rangeSummer: 180, winterFactor: 0.78, depotChargeWindow: true }

export type EvVerdict = 'ja' | 'knapp' | 'nein'

export interface EvRow {
  tour: Tour
  verdict: EvVerdict
  hint: string
  fast: number
}

export function evaluateEv(tours: Tour[], s: EvSettings) {
  const winter = Math.round(s.rangeSummer * s.winterFactor)
  // Bis 15 % über der Winterreichweite gilt: machbar, wenn mittags am Depot nachgeladen wird.
  const knapp = Math.round(winter * 1.15)
  const rows: EvRow[] = tours.map((t) => {
    const lp = LADEPUNKTE_BEISPIEL[t.district as Bezirk]
    const fast = lp ? lp.schnell : 0
    if (t.km <= winter) return { tour: t, verdict: 'ja', hint: 'passt auch im Winter', fast }
    if (t.km <= knapp && s.depotChargeWindow)
      return { tour: t, verdict: 'knapp', hint: 'im Winter knapp, Ladefenster am Depot reicht', fast }
    return { tour: t, verdict: 'nein', hint: `nur mit Schnellladung unterwegs, ${fast} Schnellladepunkte im Bezirk (Beispielwert)`, fast }
  })
  const ja = rows.filter((r) => r.verdict !== 'nein').length
  const nein = rows.length - ja
  const kmWeek = tours.reduce((acc, t) => acc + t.km * t.days.length, 0)
  const kwhWeek = Math.round(kmWeek * 0.28) // 28 kWh/100 km, Beispielwert Transporter
  return { rows, ja, nein, winter, kmWeek, kwhWeek }
}

/* ---------- Flow C: Fuhrparkgröße ---------- */

export interface Overlap {
  day: Weekday
  from: string
  to: string
  count: number
}

export function evaluateFleet(tours: Tour[], p: Profile) {
  const n = Math.max(1, p.vehicles)
  const perDay: Record<Weekday, number> = { Mo: 0, Di: 0, Mi: 0, Do: 0, Fr: 0, Sa: 0 }
  const windows: Record<Weekday, { from: number; to: number }> = { Mo: { from: 0, to: 0 }, Di: { from: 0, to: 0 }, Mi: { from: 0, to: 0 }, Do: { from: 0, to: 0 }, Fr: { from: 0, to: 0 }, Sa: { from: 0, to: 0 } }
  const overlaps: Overlap[] = []
  WEEKDAYS.forEach((day) => {
    const todays = tours.filter((t) => t.days.includes(day))
    // Sweep über alle Start/Ende-Punkte
    const events = todays.flatMap((t) => [
      { at: toMin(t.start), d: +1 },
      { at: toMin(t.end), d: -1 },
    ])
    events.sort((a, b) => a.at - b.at || a.d - b.d)
    let cur = 0
    let peak = 0
    let peakFrom = 0
    events.forEach((e) => {
      cur += e.d
      if (cur > peak) {
        peak = cur
        peakFrom = e.at
      }
    })
    perDay[day] = peak
    windows[day] = { from: peakFrom, to: (() => {
      const ends = events.filter((e) => e.d < 0 && e.at > peakFrom).map((e) => e.at)
      return ends.length ? Math.min(...ends) : peakFrom + 60
    })() }
  })
  // Spitze vs. Normaltag: Ragt nur ein kurzes Fenster (bis 2 h) über den zweithöchsten Tag hinaus,
  // gilt der zweithöchste Tag als Bedarf und die Spitze als lösbare Überlappung (Tour verschieben).
  const peaks = WEEKDAYS.map((d) => perDay[d])
  const maxPeak = Math.max(...peaks, 0)
  const others = peaks.filter((v) => v < maxPeak)
  const secondPeak = others.length ? Math.max(...others) : Math.max(0, maxPeak - 1)
  const peakDays = WEEKDAYS.filter((d) => perDay[d] === maxPeak && maxPeak > 0)
  const shortSpike = maxPeak - secondPeak === 1 && peakDays.every((d) => windows[d].to - windows[d].from <= 120)
  const needed = shortSpike ? secondPeak : maxPeak
  peakDays.forEach((d) => overlaps.push({ day: d, from: fmt(windows[d].from), to: fmt(windows[d].to), count: maxPeak }))
  const spare = Math.max(0, n - needed)
  // Auslastung je Fahrzeug: Tourstunden je Woche verteilt auf n Fahrzeuge, 55 h Verfügbarkeit (Mo bis Fr 7 bis 18 Uhr)
  const hoursWeek = tours.reduce((acc, t) => acc + ((toMin(t.end) - toMin(t.start)) / 60) * t.days.length, 0)
  const util = Math.min(100, Math.round((hoursWeek / (n * 55)) * 100))
  const costPerVehicle = 7500 // Beispielwert
  return { n, needed, spare, perDay, overlaps, maxPeak, shortSpike, util, hoursWeek: Math.round(hoursWeek), costPerVehicle }
}

const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

/* ---------- Flow B: Halten und Parken ---------- */

export interface AddressPoint {
  id: string
  x: number
  y: number
  ok: boolean
  note: string
}

export function evaluateParking(district: string) {
  const level = PARKZONEN_BEISPIEL[district as Bezirk] ?? 'mittel'
  // 12 Beispieladressen, Anteil mit Ladezone in 150 m hängt vom Beispielniveau ab
  const okCount = level === 'hoch' ? 8 : level === 'mittel' ? 9 : 10
  const base: Omit<AddressPoint, 'ok' | 'note'>[] = [
    { id: 'A', x: 90, y: 70 }, { id: 'B', x: 210, y: 60 }, { id: 'C', x: 330, y: 80 }, { id: 'D', x: 450, y: 70 },
    { id: 'E', x: 80, y: 160 }, { id: 'F', x: 200, y: 150 }, { id: 'G', x: 320, y: 170 }, { id: 'H', x: 440, y: 160 },
    { id: 'I', x: 100, y: 250 }, { id: 'J', x: 220, y: 240 }, { id: 'K', x: 340, y: 250 }, { id: 'L', x: 460, y: 240 },
  ]
  const notes: Record<string, string> = {
    D: 'nächste Ladezone 310 m, Halteverbot ganztags',
    F: 'Ausnahmegenehmigung Handwerkerparken möglich, Antrag beim Bezirksamt',
    K: 'Ausnahmegenehmigung möglich, Baustelle bis Dezember',
    L: 'Parkraumbewirtschaftung, 2 Stunden mit Ticket erlaubt',
  }
  const badIds = ['D', 'F', 'K', 'L'].slice(0, 12 - okCount)
  const points: AddressPoint[] = base.map((b) => ({ ...b, ok: !badIds.includes(b.id), note: notes[b.id] ?? '' }))
  const finePerCase = 55
  const casesPerMonth = badIds.length * 0.8
  const saving = Math.round(finePerCase * casesPerMonth)
  return { level, points, okCount, badIds, saving, finePerCase }
}
