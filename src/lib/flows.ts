import type { Flow, Need, Profile } from './types'

export interface FlowSpec {
  needsOwn: (p: Profile, hasTours: boolean) => Need[]
  needsExt: (p: Profile) => Need[]
  giveBackDoc: string
  giveBackFields: string[]
  neverLeaves: string[]
}

const lieferzonen = (): Need => ({
  status: 'r',
  title: 'Lieferzonen und Halteverbote',
  detail: 'Kein Datensatz vorhanden, weder offen noch im Datenraum (Stand 10/2026). Näherung über Parkzonen (Senatsverwaltung, offen). Die Lücke schließen Betriebe gemeinsam in Schritt 4.',
  sourceId: 'lieferzonen',
})

const tours = (hasTours: boolean): Need =>
  hasTours
    ? { status: 'g', title: 'Ihre Touren', detail: 'Aus „Meine Touren“ auf diesem Gerät. Bleibt im Browser, wird nicht gesendet.', sourceId: 'eigene' }
    : { status: 's', title: 'Ihre Touren', detail: 'Noch keine eingetragen. Die Antwort nutzt 9 Beispieltouren, markiert als synthetisch. Eigene Touren unter „Meine Touren“ eintragen.', sourceId: 'eigene' }

export const FLOWS: Record<Flow, FlowSpec> = {
  A: {
    needsOwn: (_p, hasTours) => [
      tours(hasTours),
      { status: 'y', title: 'Tankkarten-Abrechnung', detail: 'Optional: Monatsabrechnung der letzten 3 Monate, für die Kostenseite. Noch nicht in dieser Version.', sourceId: 'eigene' },
    ],
    needsExt: () => [
      { status: 'g', title: 'Ladepunkte je Bezirk', detail: 'Bundesnetzagentur Ladesäulenregister, offen, Stand 30.09.2026, CC BY 4.0. In dieser Version noch Beispielwerte je Bezirk.', sourceId: 'bnetza' },
      lieferzonen(),
      { status: 'y', title: 'Baustellen und Verkehrslage', detail: 'VIZ Berlin über Mobilithek, offen, täglich, kostenlos. In dieser Version noch nicht eingerechnet.', sourceId: 'viz' },
      { status: 'y', title: 'Winter-Reichweitenfaktor', detail: 'Herstellerangabe als Beispiel: 180 km Sommer, 140 km Winter. In der Antwort einstellbar.', sourceId: 'reichweite' },
    ],
    giveBackDoc: 'Ladebedarfskarte Gewerbe für Ihren Bezirk, aus den Zahlen von mindestens 10 Betrieben, als Argument gegenüber Bezirk und Netzbetreiber.',
    giveBackFields: ['Touren elektrisch fahrbar: ja/nein, als Zähler je Bezirk und Woche', 'Ladebedarf in kWh-Klassen je Bezirk', 'Fahrzeugklasse (bis 3,5 t) als Zähler'],
    neverLeaves: ['Adressen und Kundennamen', 'Einzelne Touren, Zeiten, Fahrer', 'Tankkarten- oder Leasingdaten'],
  },
  B: {
    needsOwn: (_p, hasTours) => [
      { status: 's', title: 'Adressen Ihrer häufigsten Kunden', detail: 'In dieser Version 12 Beispieladressen, markiert als synthetisch. Später: Export aus Ihrer Rechnungssoftware, bleibt bei Ihnen.', sourceId: 'eigene' },
      { status: 'y', title: 'Uhrzeiten Ihrer Stopps', detail: 'Noch nicht ausgewertet. Uhrzeiten aus Ihrer Frage (zum Beispiel „6 Uhr früh“) fließen in dieser Version nicht ein.' + (hasTours ? ' Ihre Touren werden hier noch nicht verwendet.' : ''), sourceId: 'eigene' },
    ],
    needsExt: () => [
      lieferzonen(),
      { status: 'y', title: 'Parkraumbewirtschaftung', detail: 'Senatsverwaltung Berlin, offen, Stand 09/2026, alle Bezirke, kostenlos. In dieser Version nur als Beispiel-Niveau je Bezirk.', sourceId: 'parkzonen' },
      { status: 'y', title: 'Baustellen', detail: 'VIZ Berlin, offen, täglich, kostenlos. In dieser Version noch nicht eingerechnet.', sourceId: 'viz' },
      { status: 'y', title: 'Handwerkerparkausweis, Bedingungen', detail: 'Bezirksämter, je Bezirk unterschiedlich, Beispielwerte.', sourceId: 'handwerkerparken' },
    ],
    giveBackDoc: 'Lieferzonen-Argument für Ihren Bezirk, aus den Zahlen von mindestens 10 Betrieben, als Vorlage für Innung oder Verband gegenüber dem Bezirksamt.',
    giveBackFields: ['Halte-Vorgänge je Bezirk und Woche, in Klassen', 'Anteil Halte-Vorgänge mit Lieferzone in 150 m', 'Bußgeld-Vorgänge je Monat, in Klassen'],
    neverLeaves: ['Kundenadressen', 'Zeiten einzelner Stopps, Fahrer, Kennzeichen', 'Einzelne Bußgeldbescheide'],
  },
  C: {
    needsOwn: (_p, hasTours) => [
      tours(hasTours),
      { status: 'y', title: 'Fahrtenbuch oder Tankkarte', detail: 'Optional, für Kilometer und Kosten. Noch nicht in dieser Version.', sourceId: 'eigene' },
    ],
    needsExt: () => [
      { status: 'y', title: 'Verkehrslage und Fahrzeiten je Tageszeit', detail: 'VIZ Berlin, offen, alle 15 Minuten, kostenlos. In dieser Version noch nicht eingerechnet.', sourceId: 'viz' },
      { status: 'y', title: 'Vollkosten-Richtwerte Transporter', detail: 'Verbandsdaten als Beispiel: 7.500 € pro Jahr und Fahrzeug, bis das TCO-Modell steht.', sourceId: 'vollkosten' },
      { status: 'y', title: 'Baustellen', detail: 'VIZ Berlin, offen, täglich, kostenlos. In dieser Version noch nicht eingerechnet.', sourceId: 'viz' },
    ],
    giveBackDoc: 'Fahrzeug-Richtwert je Branche und Bezirk, aus den Zahlen von mindestens 10 Betrieben: Wie viele Fahrzeuge haben Betriebe Ihrer Größe?',
    giveBackFields: ['Fahrzeuge je 10 Touren, als Zähler je Branche', 'Auslastung in Klassen je Bezirk und Woche'],
    neverLeaves: ['Einzelne Touren, Kunden, Zeiten', 'Leasing- und Kostendaten', 'Fahrer und Kennzeichen'],
  },
}

export function viaFor(p: Profile): string {
  if (p.branche === 'SHK/Elektro' || p.branche === 'Gebäudereinigung' || p.branche === 'Bau/Tiefbau') return 'Innung / Handwerkskammer Berlin'
  if (p.branche === 'Taxi/Fahrdienst') return 'Leitstelle'
  if (p.branche === 'Pflegedienst') return 'Pflegeverband'
  return 'Verband'
}
