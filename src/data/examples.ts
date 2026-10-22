import type { Tour } from '../lib/types'

// 9 Beispieltouren eines Elektrobetriebs mit 6 Fahrzeugen. Synthetisch, keine echten Daten.
export const EXAMPLE_TOURS: Tour[] = [
  { id: 'ex1', name: 'Tour 1, Nord', district: 'Pankow', km: 62, start: '07:00', end: '12:00', days: ['Mo', 'Di', 'Mi', 'Do', 'Fr'], example: true },
  { id: 'ex2', name: 'Tour 2, Wedding', district: 'Mitte', km: 48, start: '07:30', end: '11:30', days: ['Mo', 'Di', 'Mi', 'Do', 'Fr'], example: true },
  { id: 'ex3', name: 'Tour 3, Moabit', district: 'Mitte', km: 55, start: '09:00', end: '15:00', days: ['Mo', 'Fr'], example: true },
  { id: 'ex4', name: 'Tour 4, Spandau', district: 'Spandau', km: 165, start: '06:30', end: '17:00', days: ['Di', 'Do'], example: true },
  { id: 'ex5', name: 'Tour 5, Prenzlauer Berg', district: 'Pankow', km: 44, start: '13:00', end: '17:30', days: ['Mo', 'Di', 'Mi', 'Do', 'Fr'], example: true },
  { id: 'ex6', name: 'Tour 6, Tiergarten', district: 'Mitte', km: 38, start: '08:00', end: '12:30', days: ['Mo', 'Di', 'Mi', 'Do', 'Fr'], example: true },
  { id: 'ex7', name: 'Tour 7, Köpenick', district: 'Treptow-Köpenick', km: 172, start: '07:00', end: '18:00', days: ['Mi'], example: true },
  { id: 'ex8', name: 'Tour 8, Kreuzberg', district: 'Friedrichshain-Kreuzberg', km: 70, start: '08:00', end: '16:00', days: ['Mo', 'Di', 'Mi', 'Do', 'Fr'], example: true },
  { id: 'ex9', name: 'Tour 9, Neukölln', district: 'Neukölln', km: 81, start: '09:00', end: '11:00', days: ['Mi'], example: true },
]

export const EXAMPLE_QUESTIONS = [
  'Lohnt sich ein E-Transporter für meine Touren?',
  'Wo dürfen meine Fahrzeuge in Mitte halten, ohne Knöllchen?',
  'Brauche ich wirklich 6 Fahrzeuge?',
]
