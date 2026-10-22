import type { ReactNode } from 'react'
import type { Availability, Need } from '../lib/types'

export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={'label ' + className}>{children}</p>
}

export function Amp({ s }: { s: Availability }) {
  const txt: Record<Availability, string> = { g: 'vorhanden', y: 'teilweise', r: 'Lücke', s: 'Beispiel' }
  return (
    <span className={'amp amp-' + s}>
      <i aria-hidden="true" />
      {txt[s]}
    </span>
  )
}

export function NeedList({ items }: { items: Need[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((n) => (
        <li key={n.title} className="py-3 grid grid-cols-[7.5rem_1fr] gap-3 items-start">
          <Amp s={n.status} />
          <div>
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-alu leading-snug">{n.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-paper px-4 py-2 rounded text-sm shadow-lg z-20">
      {msg}
    </div>
  )
}

export function SynthNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 flex items-start gap-2 text-sm text-alu">
      <i className="mt-1 inline-block w-2.5 h-2.5 shrink-0 bg-nitro border border-ink" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
