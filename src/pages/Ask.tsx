import { useEffect, useMemo, useRef, useState } from 'react'
import type { Branche, Flow, HistoryEntry, Profile, Tour } from '../lib/types'
import { detect, FLOW_INTENT, FLOW_LABEL } from '../lib/detect'
import { FLOWS } from '../lib/flows'
import { BEZIRKE } from '../data/berlin'
import { EXAMPLE_QUESTIONS } from '../data/examples'
import { nowIso, uid, useHistory } from '../lib/store'
import Stepper from '../components/Stepper'
import { Label, NeedList, Toast } from '../components/ui'
import AnswerCard, { type AnswerSummary } from '../components/AnswerCard'
import GiveBack from '../components/GiveBack'

const BRANCHEN: Branche[] = ['SHK/Elektro', 'Gebäudereinigung', 'Bau/Tiefbau', 'Pflegedienst', 'Kurier/Logistik', 'Umzug', 'Catering', 'Taxi/Fahrdienst', 'Sonstiges']

interface Props {
  profile: Profile
  setProfile: (p: Profile) => void
  tours: Tour[]
}

export default function Ask({ profile, setProfile, tours }: Props) {
  const [step, setStep] = useState(1)
  const [max, setMax] = useState(1)
  const [question, setQuestion] = useState('')
  const [flow, setFlow] = useState<Flow | null>(null)
  const [unknown, setUnknown] = useState(false)
  const [viaChip, setViaChip] = useState(false)
  const [err, setErr] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [history, setHistory] = useHistory()
  const [entryId, setEntryId] = useState<string | null>(null)
  const qRef = useRef<HTMLTextAreaElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    h1Ref.current?.focus()
  }, [step])

  const say = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 2600)
  }

  const go = (k: number) => {
    setStep(k)
    setMax((m) => Math.max(m, k))
    window.scrollTo(0, 0)
  }

  const submit = () => {
    const q = question.trim()
    if (q.length < 8) {
      setErr('Bitte eine ganze Frage eintippen, zum Beispiel einen der Vorschläge.')
      qRef.current?.focus()
      return
    }
    setErr('')
    const f = detect(q)
    setFlow(f)
    setUnknown(f === null)
    setViaChip(false)
    go(2)
  }

  const chooseFlow = (f: Flow) => {
    setFlow(f)
    setUnknown(false)
    setViaChip(true)
  }

  const toAnswer = () => {
    if (!flow) return
    const id = uid()
    setEntryId(id)
    go(3)
  }

  const onSummary = (s: AnswerSummary) => {
    if (!entryId || !flow) return
    setHistory((h) => {
      if (h.some((e) => e.id === entryId)) return h
      const e: HistoryEntry = { id: entryId, at: nowIso(), question: question.trim(), flow, headline: (viaChip ? 'Stichwort nicht erkannt, per Chip gewählt · ' : '') + s.headline }
      return [e, ...h].slice(0, 50)
    })
  }

  const feedback = (fb: 'up' | 'down', comment?: string) => {
    if (!entryId) return
    setHistory((h) => h.map((e) => (e.id === entryId ? { ...e, feedback: fb, comment } : e)))
    say('Gespeichert, nur auf diesem Gerät.')
  }

  const reset = () => {
    setQuestion('')
    setFlow(null)
    setUnknown(false)
    setViaChip(false)
    setEntryId(null)
    setMax(1)
    setStep(1)
    window.setTimeout(() => qRef.current?.focus(), 0)
  }

  const spec = flow ? FLOWS[flow] : null
  const hasTours = tours.length > 0
  const needsOwn = useMemo(() => (spec ? spec.needsOwn(profile, hasTours) : []), [spec, profile, hasTours])
  const needsExt = useMemo(() => (spec ? spec.needsExt(profile) : []), [spec, profile])
  const bezText = profile.districts.length ? profile.districts.join(', ') : 'Berlin'
  const current = history.find((e) => e.id === entryId)

  return (
    <div>
      <Stepper step={step} max={max} onGo={go} />

      {/* ---------- Schritt 1 ---------- */}
      {step === 1 && (
        <section aria-labelledby="h1">
          <Label>01 · Ihre Frage</Label>
          <h1 id="h1" ref={h1Ref} tabIndex={-1} className="text-3xl sm:text-4xl font-semibold mt-2 mb-6 outline-none">
            Was wollen Sie über Ihren Fuhrpark wissen?
          </h1>
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            <div>
              <label htmlFor="q" className="sr-only">Ihre Frage</label>
              <textarea
                id="q"
                ref={qRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    submit()
                  }
                }}
                rows={3}
                placeholder="Auf Deutsch, in Ihren Worten. Enter schickt ab."
                className="field text-lg"
                aria-describedby="qhelp qerr"
              />
              <p id="qhelp" className="text-sm text-alu mt-2">Drei Fragen kann diese Version beantworten. Andere Fragen werden ehrlich abgelehnt, nicht erraten.</p>
              <p id="qerr" role="alert" className="text-sm text-ink mt-1 min-h-5">{err}</p>
              <div className="flex flex-wrap gap-2 mt-3" aria-label="Beispielfragen">
                {EXAMPLE_QUESTIONS.map((ex) => (
                  <button key={ex} type="button" className="chip" aria-pressed={question === ex} onClick={() => { setQuestion(ex); setErr(''); qRef.current?.focus() }}>
                    {ex}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" className="btn btn-primary" onClick={submit}>Frage stellen</button>
                {hasTours ? (
                  <span className="self-center text-sm text-alu">{tours.length} eigene Touren werden verwendet.</span>
                ) : (
                  <a href="#/touren" className="btn btn-ghost">Eigene Touren eintragen</a>
                )}
              </div>
            </div>

            <aside className="card">
              <Label className="mb-3">Ihr Betrieb</Label>
              <div className="grid gap-3">
                <label className="grid gap-1 text-sm">
                  Branche
                  <select className="field" value={profile.branche} onChange={(e) => setProfile({ ...profile, branche: e.target.value as Branche })}>
                    {BRANCHEN.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  Fahrzeuge
                  <input type="number" min={1} max={60} className="field" value={profile.vehicles} onChange={(e) => setProfile({ ...profile, vehicles: Number(e.target.value) })} onBlur={(e) => setProfile({ ...profile, vehicles: Math.max(1, Math.min(60, Number(e.target.value) || 1)) })} />
                </label>
                <fieldset>
                  <legend className="text-sm mb-1">Bezirke, in denen Sie meist unterwegs sind</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {BEZIRKE.map((b) => {
                      const on = profile.districts.includes(b)
                      return (
                        <button key={b} type="button" className="chip text-xs" aria-pressed={on} onClick={() => setProfile({ ...profile, districts: on ? profile.districts.filter((d) => d !== b) : [...profile.districts, b] })}>
                          {b}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
                <p className="text-xs text-alu">Bleibt im Browser auf diesem Gerät.</p>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* ---------- Schritt 2 ---------- */}
      {step === 2 && (
        <section aria-labelledby="h2">
          <Label>02 · Verstanden</Label>
          <h1 id="h2" ref={h1Ref} tabIndex={-1} className="text-3xl sm:text-4xl font-semibold mt-2 mb-2 outline-none">
            {unknown ? 'Diese Frage kann Fuhrwerk noch nicht beantworten.' : 'So hat Fuhrwerk Ihre Frage verstanden.'}
          </h1>
          <p className="text-lg mb-6">
            Ihre Frage: <q className="italic">{question.trim()}</q>
          </p>

          {unknown && (
            <div className="card mb-6">
              <p className="mb-3">Drei Fragen kann diese Version beantworten. Ist Ihre Frage eine davon? Sonst ist das ein wichtiger Hinweis für uns, kein Fehler von Ihnen.</p>
              <div className="flex flex-col gap-2 items-start">
                {(['A', 'B', 'C'] as Flow[]).map((f) => (
                  <button key={f} type="button" className="chip" aria-pressed={flow === f} onClick={() => chooseFlow(f)}>{FLOW_LABEL[f]}</button>
                ))}
                <button type="button" className="btn btn-ghost mt-2" onClick={() => { say('Notiert, nur auf diesem Gerät.'); setHistory((h) => [{ id: uid(), at: nowIso(), question: question.trim(), flow: null, headline: 'Nicht beantwortbar in v2' }, ...h]); reset() }}>
                  Keine davon, Frage notieren und neu beginnen
                </button>
              </div>
            </div>
          )}

          {flow && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card-dark">
                <Label className="text-nitro mb-2">Erkannte Absicht</Label>
                <p className="text-lg leading-snug">{FLOW_INTENT[flow]}</p>
                <p className="text-sm text-alu mt-3">Betrieb: {profile.branche}, {profile.vehicles} Fahrzeuge, {bezText}.</p>
              </div>
              <div className="card">
                <Label className="mb-2">Was bei Ihnen bleibt</Label>
                <NeedList items={needsOwn} />
              </div>
              <div className="card lg:col-span-2">
                <Label className="mb-2">Was von außen kommt, je mit Quelle, Stand, Lizenz</Label>
                <NeedList items={needsExt} />
                <p className="text-xs text-alu mt-3">Alle Quellen mit Details unter „Datenquellen“. Lücken werden als Lücken gezeigt, nicht überspielt.</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3 no-print">
            <button type="button" className="btn btn-ghost" onClick={() => go(1)}>Zurück</button>
            <button type="button" className="btn btn-primary" disabled={!flow} onClick={toAnswer}>Antwort berechnen</button>
          </div>
        </section>
      )}

      {/* ---------- Schritt 3 ---------- */}
      {step === 3 && flow && (
        <section aria-labelledby="h3">
          <div className="no-print">
            <Label>03 · Antwort</Label>
            <h1 id="h3" ref={h1Ref} tabIndex={-1} className="text-3xl sm:text-4xl font-semibold mt-2 mb-6 outline-none">Ihre Antwort, auf einer Seite.</h1>
          </div>
          <AnswerCard flow={flow} question={question.trim()} profile={profile} tours={tours} onSummary={onSummary} say={say} feedback={current?.feedback} onFeedback={feedback} />
          <div className="mt-6 flex flex-wrap gap-3 no-print">
            <button type="button" className="btn btn-ghost" onClick={() => go(2)}>Zurück</button>
            <button type="button" className="btn btn-primary" onClick={() => go(4)}>Weiter: Zurückgeben, optional</button>
            <button type="button" className="btn btn-ghost" onClick={reset}>Neue Frage</button>
          </div>
        </section>
      )}

      {/* ---------- Schritt 4 ---------- */}
      {step === 4 && flow && (
        <section aria-labelledby="h4">
          <Label>04 · Zurückgeben, optional</Label>
          <h1 id="h4" ref={h1Ref} tabIndex={-1} className="text-3xl sm:text-4xl font-semibold mt-2 mb-6 outline-none">Wollen Sie Zahlen zurückgeben, damit alle eine bessere Antwort bekommen?</h1>
          <GiveBack flow={flow} profile={profile} say={say} onDone={reset} onBack={() => go(3)} />
        </section>
      )}

      <Toast msg={toast} />
    </div>
  )
}
