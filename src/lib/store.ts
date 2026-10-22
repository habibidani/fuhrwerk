import { useCallback, useEffect, useState } from 'react'
import type { HistoryEntry, Pledge, Profile, Tour } from './types'

const PREFIX = 'fuhrwerk.v3.'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* privater Modus oder voll: Zustand bleibt im Speicher */
  }
}

/** useState, das im Browser dieses Geräts bleibt. Nichts verlässt das Gerät. */
export function useLocal<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => read(key, fallback))
  useEffect(() => {
    write(key, value)
  }, [key, value])
  const set = useCallback((v: T | ((prev: T) => T)) => setValue(v), [])
  return [value, set]
}

export const DEFAULT_PROFILE: Profile = { branche: 'SHK/Elektro', vehicles: 6, districts: ['Mitte'] }

export const useProfile = () => useLocal<Profile>('profile', DEFAULT_PROFILE)
export const useTours = () => useLocal<Tour[]>('tours', [])
export const useHistory = () => useLocal<HistoryEntry[]>('history', [])
export const usePledges = () => useLocal<Pledge[]>('pledges', [])

export function clearAll() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignorieren */
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10)
export const nowIso = () => new Date().toISOString()
export const today = () => new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
