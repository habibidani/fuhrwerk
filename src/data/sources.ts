export type SourceKind = 'offen' | 'datenraum' | 'im-haus' | 'luecke' | 'beispiel'

export interface Source {
  id: string
  name: string
  provider: string
  kind: SourceKind
  licence: string
  updated: string
  cadence: string
  cost: string
  url?: string
  note?: string
}

// Stand der Recherche: 22.10.2026. Alles, was "beispiel" ist, steht in der App als synthetisch markiert.
export const SOURCES: Source[] = [
  { id: 'bnetza', name: 'Ladesäulenregister', provider: 'Bundesnetzagentur', kind: 'offen', licence: 'CC BY 4.0', updated: '30.09.2026', cadence: 'monatlich', cost: 'kostenlos', url: 'https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/E-Mobilitaet/Ladesaeulenkarte/start.html', note: 'Alle öffentlichen Ladepunkte, alle Bezirke. Noch nicht angebunden, nächster Schritt (Mika, 5.11.).' },
  { id: 'parkzonen', name: 'Parkraumbewirtschaftung Berlin', provider: 'Senatsverwaltung für Mobilität, Verkehr, Klimaschutz und Umwelt', kind: 'offen', licence: 'Datenlizenz Deutschland Zero 2.0', updated: '09/2026', cadence: 'bei Änderung', cost: 'kostenlos', url: 'https://daten.berlin.de', note: 'Parkzonen als WFS. Dient als Näherung für Halteverbote, ersetzt keine Lieferzonen.' },
  { id: 'viz', name: 'Verkehrslage und Baustellen', provider: 'VIZ Berlin über Mobilithek', kind: 'offen', licence: 'Datenlizenz Deutschland Namensnennung 2.0', updated: 'täglich', cadence: 'alle 15 Minuten (Lage), täglich (Baustellen)', cost: 'kostenlos', url: 'https://mobilithek.info', note: 'Im Datenraum gespiegelt, Spiegel nicht verifiziert.' },
  { id: 'dwd', name: 'Wetter und Temperatur', provider: 'Deutscher Wetterdienst', kind: 'offen', licence: 'CC BY 4.0', updated: 'täglich', cadence: 'stündlich', cost: 'kostenlos', url: 'https://opendata.dwd.de', note: 'Für den Winter-Reichweitenfaktor.' },
  { id: 'oem', name: 'Fahrzeugdaten E-Status, Reichweite', provider: 'Mercedes-Benz, BMW über Mobility Data Space', kind: 'datenraum', licence: 'Nutzungsbedingungen des Anbieters, Vertrag je Abruf', updated: 'laufend', cadence: 'auf Anfrage', cost: '0 bis 30 € je Fahrzeug und Monat (Data-Act-Feldtest)', note: 'Nur im Datenraum. Zugriff über Connector, manuelle Freigabe. Unser Connector: Set-up begonnen, noch kein Katalogzugriff.' },
  { id: 'lieferzonen', name: 'Lieferzonen und Halteverbote', provider: 'niemand', kind: 'luecke', licence: 'kein Datensatz', updated: 'Stand 10/2026', cadence: 'kein Datensatz', cost: 'kein Datensatz', note: 'Weder offen noch im Datenraum. Genau diese Lücke könnten Betriebe über die Innung gemeinsam schließen (Schritt 4).' },
  { id: 'handwerkerparken', name: 'Handwerkerparkausweis, Bedingungen', provider: 'Bezirksämter Berlin', kind: 'beispiel', licence: 'Verwaltungsinformation', updated: 'jährlich', cadence: 'jährlich', cost: 'Gebühr je Fahrzeug, Beispielwerte 50 bis 200 €', note: 'Bedingungen je Bezirk unterschiedlich; in der App als Beispiel.' },
  { id: 'vollkosten', name: 'Vollkosten-Richtwerte Transporter', provider: 'Verbandsdaten, Beispiel', kind: 'beispiel', licence: 'Beispiel', updated: 'Beispiel', cadence: 'jährlich', cost: 'Beispiel', note: '7.500 € pro Jahr für einen Transporter bis 3,5 t als Platzhalter, bis das TCO-Modell steht (Tom, 5.11.).' },
  { id: 'reichweite', name: 'Reichweite E-Transporter', provider: 'Herstellerangabe, Beispiel', kind: 'beispiel', licence: 'Beispiel', updated: 'Beispiel', cadence: 'jährlich', cost: 'kostenlos', note: '180 km Sommer, Winterfaktor 0,78 = 140 km. In der App einstellbar.' },
  { id: 'eigene', name: 'Ihre Touren, Ihr Kalender, Ihre Tankkarte', provider: 'Ihr Betrieb', kind: 'im-haus', licence: 'bleibt bei Ihnen', updated: 'laufend', cadence: 'laufend', cost: 'kostenlos', note: 'Bleibt im Browser auf diesem Gerät. Wird nirgendwohin gesendet.' },
]

export const KIND_LABEL: Record<SourceKind, string> = {
  'offen': 'offen',
  'datenraum': 'nur Datenraum',
  'im-haus': 'im Haus',
  'luecke': 'Lücke',
  'beispiel': 'Beispielwert',
}

export const source = (id: string) => SOURCES.find((s) => s.id === id)
