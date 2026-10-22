const STEPS = ['Frage', 'Verstanden', 'Antwort', 'Zurückgeben']

export default function Stepper({ step, max, onGo }: { step: number; max: number; onGo: (k: number) => void }) {
  return (
    <ol className="no-print flex flex-wrap gap-2 mb-6" aria-label="Schritte">
      {STEPS.map((s, i) => {
        const k = i + 1
        const done = k < step
        const cur = k === step
        const can = k <= max && !cur
        return (
          <li key={s}>
            <button
              type="button"
              onClick={() => can && onGo(k)}
              disabled={!can}
              aria-current={cur ? 'step' : undefined}
              className={
                'flex items-center gap-2 px-3 py-1.5 rounded text-sm border ' +
                (cur ? 'bg-ink text-paper border-ink' : done ? 'bg-titan border-titan text-ink' : 'border-line text-alu')
              }
            >
              <span className="label text-inherit">{String(k).padStart(2, '0')}</span>
              {s}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
