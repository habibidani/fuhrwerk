export const BEZIRKE = [
  'Mitte',
  'Friedrichshain-Kreuzberg',
  'Pankow',
  'Charlottenburg-Wilmersdorf',
  'Spandau',
  'Steglitz-Zehlendorf',
  'Tempelhof-Schöneberg',
  'Neukölln',
  'Treptow-Köpenick',
  'Marzahn-Hellersdorf',
  'Lichtenberg',
  'Reinickendorf',
] as const

export type Bezirk = (typeof BEZIRKE)[number]

// Beispielwerte, bis das Ladesäulenregister angebunden ist. Markiert als synthetisch.
export const LADEPUNKTE_BEISPIEL: Record<Bezirk, { punkte: number; schnell: number }> = {
  'Mitte': { punkte: 410, schnell: 48 },
  'Friedrichshain-Kreuzberg': { punkte: 260, schnell: 22 },
  'Pankow': { punkte: 240, schnell: 26 },
  'Charlottenburg-Wilmersdorf': { punkte: 330, schnell: 41 },
  'Spandau': { punkte: 120, schnell: 14 },
  'Steglitz-Zehlendorf': { punkte: 170, schnell: 19 },
  'Tempelhof-Schöneberg': { punkte: 210, schnell: 25 },
  'Neukölln': { punkte: 150, schnell: 16 },
  'Treptow-Köpenick': { punkte: 140, schnell: 18 },
  'Marzahn-Hellersdorf': { punkte: 110, schnell: 15 },
  'Lichtenberg': { punkte: 130, schnell: 17 },
  'Reinickendorf': { punkte: 120, schnell: 13 },
}

// Beispiel: Anteil bewirtschafteter Parkraum je Bezirk (Innenstadt hoch, Rand niedrig). Synthetisch.
export const PARKZONEN_BEISPIEL: Record<Bezirk, 'hoch' | 'mittel' | 'niedrig'> = {
  'Mitte': 'hoch',
  'Friedrichshain-Kreuzberg': 'hoch',
  'Pankow': 'mittel',
  'Charlottenburg-Wilmersdorf': 'hoch',
  'Spandau': 'niedrig',
  'Steglitz-Zehlendorf': 'mittel',
  'Tempelhof-Schöneberg': 'mittel',
  'Neukölln': 'mittel',
  'Treptow-Köpenick': 'niedrig',
  'Marzahn-Hellersdorf': 'niedrig',
  'Lichtenberg': 'niedrig',
  'Reinickendorf': 'niedrig',
}
