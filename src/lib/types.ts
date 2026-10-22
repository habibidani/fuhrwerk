export type Flow = 'A' | 'B' | 'C'

export type Branche =
  | 'SHK/Elektro'
  | 'Gebäudereinigung'
  | 'Bau/Tiefbau'
  | 'Pflegedienst'
  | 'Kurier/Logistik'
  | 'Umzug'
  | 'Catering'
  | 'Taxi/Fahrdienst'
  | 'Sonstiges'

export interface Profile {
  branche: Branche
  vehicles: number
  districts: string[]
}

export type Weekday = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa'

export interface Tour {
  id: string
  name: string
  district: string
  km: number
  start: string // HH:MM
  end: string // HH:MM
  days: Weekday[]
  example?: boolean
}

export type Availability = 'g' | 'y' | 'r' | 's'
// g = vorhanden, y = teilweise, r = Lücke, s = synthetisch (Beispiel)

export interface Need {
  status: Availability
  title: string
  detail: string
  sourceId?: string
}

export interface HistoryEntry {
  id: string
  at: string
  question: string
  flow: Flow | null
  headline: string
  feedback?: 'up' | 'down'
  comment?: string
}

export interface Pledge {
  at: string
  flow: Flow
  via: string
  fields: string[]
}
