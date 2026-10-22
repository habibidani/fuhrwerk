import type { Flow } from './types'

// Eigene Wortgrenze, weil \b Umlaute nicht kennt.
const B = '(^|[^a-zäöüß])'
const E = '(?=$|[^a-zäöüß])'
const rx = (list: string[]) => list.map((p) => new RegExp(B + p + E))

const KEYS: Record<Flow, RegExp[]> = {
  A: rx(['e-?transporter', 'elektrisch(e[rsn]?)?', 'elektro', '(auf)?laden', 'ladesäulen?', 'reichweite', 'e-?autos?', 'e-?fahrzeuge?', 'strom', 'akku', 'batterie', 'umstellen', 'umstieg', 'umstellung', 'elektrifizier\\w*', 'e-?mobil\\w*']),
  B: rx(['halten', 'parken', 'halteverbot', 'lieferzonen?', 'ladezonen?', 'knöllchen', 'parkplatz', 'parkplätze', 'stehen', 'strafzettel', 'parkraum', 'anhalten', 'bußgeld', 'abschlepp\\w*']),
  C: rx(['fahrzeuge zu viel', 'zu viele fahrzeuge', 'auslastung', 'ausgelastet', 'brauche ich', 'brauchen wir', 'wie viele', 'abschaffen', 'weniger', 'zu viel', 'leasing zurück', 'reicht', 'reichen', 'zu viele', 'autos?', 'wagen', 'schicht\\w*', 'flotte verkleinern', 'fuhrpark verkleinern']),
}

/** Liefert den erkannten Flow oder null, wenn die Frage nicht einsortiert werden kann. */
export function detect(q: string): Flow | null {
  const t = ' ' + q.toLowerCase().replace(/\s+/g, ' ').trim() + ' '
  let best: Flow | null = null
  let bestN = 0
  ;(['A', 'B', 'C'] as Flow[]).forEach((k) => {
    const n = KEYS[k].reduce((acc, r) => acc + (r.test(t) ? 1 : 0), 0)
    if (n > bestN) {
      bestN = n
      best = k
    }
  })
  return best
}

export const FLOW_LABEL: Record<Flow, string> = {
  A: 'Lohnt sich ein E-Transporter für meine Touren?',
  B: 'Wo dürfen meine Fahrzeuge halten, ohne Knöllchen?',
  C: 'Brauche ich wirklich so viele Fahrzeuge?',
}

export const FLOW_INTENT: Record<Flow, string> = {
  A: 'Elektrifizierung: Welche Ihrer Touren fahren mit einem E-Transporter, auch im Winter?',
  B: 'Halten und Parken: Wo stehen Ihre Fahrzeuge beim Kunden ohne Bußgeld?',
  C: 'Fuhrparkgröße: Wie viele Fahrzeuge brauchen Sie für Ihre Touren wirklich?',
}
