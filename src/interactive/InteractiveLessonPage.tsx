// InteractiveLessonPage: the step player for the interactive track.
// No Pyodide, no progress writes to the main system.
import { useState, useCallback, useEffect } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { INTERACTIVE_LESSONS, WARMUPS, unmetPrerequisites } from './curriculum'
import { scoredCount, saveLesson, stars as calcStars, loadTrack } from './types'
import type { Step, PredictQuestion, NumericQuestion } from './types'
import { getLevel } from '@/data/curriculum'
import { beacon } from '@/engine/beacon'

// ── atoms ─────────────────────────────────────────────────────────────────────

function Shape({ s }: { s: string }) {
  return <span className="font-mono text-emerald-400">{s}</span>
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-3 rounded-xl border text-left font-mono text-sm transition-colors
        ${active ? 'bg-violet-600/20 border-violet-500 text-violet-200' : 'bg-gray-800/60 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
      {children}
    </button>
  )
}

function ContinueBtn({ onClick, label = 'Continue' }: { onClick: () => void; label?: string }) {
  return (
    <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="mt-6 px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/40">
      {label}
    </motion.button>
  )
}

// ── step renderers ─────────────────────────────────────────────────────────────

function StepConcept({ step, onDone }: { step: Extract<Step, { kind: 'concept' }>; onDone: () => void }) {
  return (
    <div className="w-full max-w-lg">
      <h2 className="text-2xl font-bold text-white mb-4">{step.title}</h2>
      {step.lines.map((l, i) => <p key={i} className="text-gray-300 mb-3 leading-relaxed">{l}</p>)}
      {step.code && <pre className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4 font-mono text-sm text-sky-300 overflow-x-auto">{step.code}</pre>}
      <ContinueBtn onClick={onDone} label={step.cta ?? 'Continue'} />
    </div>
  )
}

function StepWorked({ step, onDone }: { step: Extract<Step, { kind: 'worked' }>; onDone: () => void }) {
  const [shown, setShown] = useState(0)
  const complete = shown >= step.stages.length
  return (
    <div className="w-full max-w-lg">
      <p className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">Worked example</p>
      <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
      <p className="text-gray-300 mb-5 leading-relaxed">{step.prompt}</p>
      <div className="border-l-2 border-gray-800 pl-4 space-y-4">
        {step.stages.slice(0, shown).map((stage, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-mono text-violet-400 mb-1">{i + 1}. {stage.label}</p>
            <p className="text-sm text-gray-300 leading-relaxed">{stage.body}</p>
            {stage.code && <pre className="mt-2 bg-gray-900 border border-gray-800 rounded-lg p-3 font-mono text-sm text-sky-300 overflow-x-auto">{stage.code}</pre>}
          </motion.div>
        ))}
      </div>
      {!complete ? (
        <button onClick={() => setShown(n => n + 1)}
          className="mt-6 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold">
          {shown === 0 ? 'Walk through it' : `Show step ${shown + 1}`}
        </button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
          <p className="text-sm text-emerald-300 border-l-2 border-emerald-600 pl-3">{step.takeaway}</p>
          <ContinueBtn onClick={onDone} label={step.cta ?? 'Try one yourself'} />
        </motion.div>
      )}
    </div>
  )
}

// Confidence lock-in: the learner stages an option, then commits as
// "sure" or "not sure" BEFORE the reveal. Calibration (sure-but-wrong) is
// summarized at the finale. Only the first commit counts for scoring.
export function StepMcq({ step, onDone }: { step: Extract<Step, { kind: 'mcq' }>; onDone: (firstTry: boolean, sureFirst?: boolean) => void }) {
  const [staged, setStaged] = useState<number | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [wrongOnes, setWrongOnes] = useState<number[]>([])
  const [firstSure, setFirstSure] = useState<boolean | null>(null)
  const solved = picked === step.answer

  const stage = (i: number) => {
    if (solved || wrongOnes.includes(i)) return
    setStaged(i)
  }
  const commit = (sure: boolean) => {
    if (staged === null) return
    if (firstSure === null) setFirstSure(sure)
    setPicked(staged)
    if (staged !== step.answer) setWrongOnes(w => (w.includes(staged) ? w : [...w, staged]))
    setStaged(null)
  }
  const wrongWhy = picked !== null && !solved
    ? (step.whys?.[picked] ?? step.nudge)
    : null
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-3">{step.prompt}</p>
      {step.code && <pre className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4 font-mono text-sm text-sky-300 overflow-x-auto">{step.code}</pre>}
      <div className="grid gap-3">
        {step.options.map((o, i) => {
          const isWrong = wrongOnes.includes(i)
          const isRight = solved && i === step.answer
          const isStaged = staged === i
          return (
            <motion.button key={i} onClick={() => stage(i)}
              animate={picked === i && isWrong ? { x: [0, -8, 8, -5, 5, 0] } : {}}
              transition={{ duration: 0.35 }}
              disabled={solved || isWrong}
              className={`px-4 py-3 rounded-xl border text-left font-mono text-sm transition-colors
                ${isRight ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : isWrong ? 'bg-red-900/20 border-red-800 text-red-300'
                : isStaged ? 'bg-violet-600/20 border-violet-500 text-violet-200'
                : 'bg-gray-800/60 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
              {o}
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence>
        {staged !== null && !solved && (
          <motion.div key={'c' + staged} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-3">
            <span className="text-sm text-gray-400">Lock it in:</span>
            <button onClick={() => commit(true)}
              className="px-4 py-2 rounded-lg bg-emerald-700/40 border border-emerald-600 text-emerald-200 text-sm font-semibold hover:bg-emerald-700/60">
              I'm sure
            </button>
            <button onClick={() => commit(false)}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-300 text-sm font-semibold hover:bg-gray-700">
              Best guess
            </button>
          </motion.div>
        )}
        {wrongWhy && staged === null && (
          <motion.p key={'n' + picked} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-4 text-sm text-amber-300">{wrongWhy} Try again, no penalty.</motion.p>
        )}
        {solved && (
          <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <p className="text-sm text-emerald-300 font-semibold">Correct.</p>
            <p className="text-sm text-gray-300 mt-1">{step.explain}</p>
            <ContinueBtn onClick={() => onDone(wrongOnes.length === 0, firstSure ?? false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PredictQ({ q, onDone }: { q: PredictQuestion; onDone: (firstTry: boolean) => void }) {
  const [pick, setPick] = useState<number | null>(null)
  const [missed, setMissed] = useState(false)
  const done = pick === q.answer
  return (
    <div className="mb-5">
      <p className="font-mono text-sm text-gray-200 mb-2">{q.label} <span className="text-gray-500">→ ?</span></p>
      <div className="flex flex-wrap gap-2">
        {q.options.map((o, i) => {
          const isPick = pick === i
          const isRight = isPick && i === q.answer
          const isWrong = isPick && i !== q.answer
          return (
            <button key={i}
              disabled={done}
              onClick={() => {
                if (done) return
                if (i !== q.answer) setMissed(true)
                else onDone(!missed && pick === null)
                setPick(i)
              }}
              className={`px-3 py-2 rounded-lg font-mono text-xs border
                ${isRight ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : isWrong ? 'bg-red-900/20 border-red-800 text-red-300'
                : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
              {o}
            </button>
          )
        })}
      </div>
      {pick !== null && !done && <p className="mt-2 text-xs text-amber-300">{q.whys?.[pick] ?? q.nudge ?? 'Not quite. Re-check the rule and try again.'}</p>}
      {done && <p className="mt-2 text-xs text-gray-400">{q.reveal}</p>}
    </div>
  )
}

export function StepPredict({ step, onDone }: { step: Extract<Step, { kind: 'predict' }>; onDone: (firstTryAll: boolean) => void }) {
  const [current, setCurrent] = useState(0)
  const [allFirstTry, setAllFirstTry] = useState(true)
  const total = step.questions.length
  const complete = current >= total

  const onQDone = (ft: boolean) => {
    if (!ft) setAllFirstTry(false)
    setCurrent(n => n + 1)
  }
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-3">{step.prompt}</p>
      {step.code && <pre className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4 font-mono text-sm text-sky-300 overflow-x-auto">{step.code}</pre>}
      {!complete && (
        <>
          {total > 1 && <p className="text-xs font-mono text-gray-500 mb-3">question {current + 1} of {total}</p>}
          <PredictQ key={current} q={step.questions[current]} onDone={onQDone} />
        </>
      )}
      {complete && <ContinueBtn onClick={() => onDone(allFirstTry)} />}
    </div>
  )
}

// numeric entry: compute the value, don't recognize it. Two failed attempts
// unlock a reveal that counts as a miss — no infinite stalls.
function NumericQ({ q, onDone }: { q: NumericQuestion; onDone: (firstTry: boolean) => void }) {
  const [val, setVal] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [state, setState] = useState<'open' | 'right' | 'revealed'>('open')
  const tol = q.tolerance ?? Math.abs(q.answer) * 0.01

  const check = () => {
    const n = parseFloat(val.replace(/[,_ ]/g, ''))
    if (!isFinite(n)) return
    if (Math.abs(n - q.answer) <= tol) {
      setState('right')
      onDone(attempts === 0)
    } else {
      setAttempts(a => a + 1)
    }
  }
  const reveal = () => {
    setState('revealed')
    setVal(String(q.answer))
    onDone(false)
  }
  const settled = state !== 'open'
  return (
    <div className="mb-5">
      <p className="font-mono text-sm text-gray-200 mb-2">{q.label} <span className="text-gray-500">→ ?</span></p>
      <div className="flex items-center gap-2">
        <input value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !settled) check() }}
          disabled={settled} inputMode="decimal" placeholder="type a number"
          className={`w-40 px-3 py-2 rounded-lg font-mono text-sm border bg-gray-900 outline-none
            ${state === 'right' ? 'border-emerald-500 text-emerald-300'
            : state === 'revealed' ? 'border-amber-600 text-amber-300'
            : 'border-gray-700 text-gray-100 focus:border-violet-500'}`} />
        {q.unit && <span className="text-xs text-gray-500 font-mono">{q.unit}</span>}
        {!settled && (
          <button onClick={check}
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold">
            Check
          </button>
        )}
      </div>
      {!settled && attempts > 0 && (
        <p className="mt-2 text-xs text-amber-300">
          Not it — recompute and try again.
          {attempts >= 2 && <>{' '}<button onClick={reveal} className="underline text-amber-200">Show the answer</button></>}
        </p>
      )}
      {settled && <p className="mt-2 text-xs text-gray-400">{q.reveal}</p>}
    </div>
  )
}

export function StepNumeric({ step, onDone }: { step: Extract<Step, { kind: 'numeric' }>; onDone: (firstTryAll: boolean) => void }) {
  const [current, setCurrent] = useState(0)
  const [allFirstTry, setAllFirstTry] = useState(true)
  const total = step.questions.length
  const complete = current >= total
  const onQDone = (ft: boolean) => {
    if (!ft) setAllFirstTry(false)
    setCurrent(n => n + 1)
  }
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-3">{step.prompt}</p>
      {step.code && <pre className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4 font-mono text-sm text-sky-300 overflow-x-auto">{step.code}</pre>}
      {!complete && (
        <>
          {total > 1 && <p className="text-xs font-mono text-gray-500 mb-3">question {current + 1} of {total}</p>}
          <NumericQ key={current} q={step.questions[current]} onDone={onQDone} />
        </>
      )}
      {complete && <ContinueBtn onClick={() => onDone(allFirstTry)} />}
    </div>
  )
}

// ── finale card ───────────────────────────────────────────────────────────────

// first main-track level whose warm-up is this lesson and which the learner
// has not completed yet — the "now apply it" transfer link
function applyTarget(slug: string): { id: string; title: string } | undefined {
  let raw: Record<string, { status?: string }> = {}
  try { raw = JSON.parse(localStorage.getItem('llmquest_progress_v1') ?? '{}')?.levels ?? {} } catch {}
  const ids = Object.keys(WARMUPS).filter(id => WARMUPS[id] === slug)
  const open = ids.find(id => raw[id]?.status !== 'complete') ?? ids[0]
  if (!open) return undefined
  const lvl = getLevel(open)
  return lvl ? { id: lvl.id, title: lvl.title } : undefined
}

function Finale({ lessonSlug, firstTries, scored, missedCount, sure, sureWrong }: { lessonSlug: string; firstTries: number; scored: number; missedCount: number; sure: number; sureWrong: number }) {
  const s = scored === 0 || firstTries / scored >= 0.99 ? 3 : firstTries / scored >= 0.6 ? 2 : 1
  const apply = applyTarget(lessonSlug)
  const lessonIdx = INTERACTIVE_LESSONS.findIndex(l => l.slug === lessonSlug)
  const nextLesson = lessonIdx >= 0 ? INTERACTIVE_LESSONS[lessonIdx + 1] : undefined
  return (
    <div className="w-full max-w-lg text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
        <p className="text-5xl mb-3">{'⭐'.repeat(s)}{'☆'.repeat(3 - s)}</p>
        <h2 className="text-2xl font-bold text-white mb-2">Lesson complete</h2>
        <p className="text-gray-300 mb-1">{firstTries} of {scored} checks on the first try.</p>
        {s === 3 && <p className="text-emerald-400 text-sm mb-2">Perfect round. No second guesses.</p>}
        {s < 3 && <p className="text-amber-300 text-sm mb-2">Replay to earn 3 stars — no time limit, no pressure.</p>}
        {sureWrong > 0 && (
          <p className="text-sm text-rose-300 mb-2">
            Calibration check: you locked in "I'm sure" on {sureWrong} answer{sureWrong > 1 ? 's' : ''} that {sureWrong > 1 ? 'were' : 'was'} wrong.
            Confident misses are the ones worth a second look.
          </p>
        )}
        {sure > 0 && sureWrong === 0 && scored > 0 && (
          <p className="text-sm text-emerald-400/80 mb-2">Well calibrated: every "I'm sure" was right.</p>
        )}
      </motion.div>
      {nextLesson && (
        <Link to={`/interactive/${nextLesson.slug}`}
          className="mt-6 block px-6 py-4 rounded-xl bg-violet-700/30 border border-violet-600 hover:bg-violet-700/50 text-left">
          <span className="block text-xs text-violet-400 mb-1">Next concept</span>
          <span className="block font-semibold text-violet-200">{nextLesson.title} →</span>
          <span className="block text-xs text-gray-400 mt-1">{nextLesson.blurb}</span>
        </Link>
      )}
      {apply && (
        <Link to={`/level/${apply.id}`}
          className="mt-3 block px-6 py-4 rounded-xl bg-emerald-700/30 border border-emerald-600 hover:bg-emerald-700/50 text-left">
          <span className="block text-xs text-emerald-400 mb-1">Apply it in code — graded challenge</span>
          <span className="block font-semibold text-emerald-200">{apply.title} →</span>
        </Link>
      )}
      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/interactive"
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold">
          Back to track
        </Link>
        {missedCount > 0 && (
          <Link to="/interactive/practice"
            className="px-6 py-3 rounded-xl bg-amber-700/40 border border-amber-600 hover:bg-amber-700/60 text-amber-200 font-semibold">
            Practice your {missedCount} miss{missedCount > 1 ? 'es' : ''}
          </Link>
        )}
        <Link to={`/interactive/${lessonSlug}`}
          className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold">
          Replay
        </Link>
      </div>
      <p className="mt-10 text-xs text-gray-600">Interactive track progress is separate from your main XP and certificate.</p>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export function InteractiveLessonPage() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  // location.key changes on every navigation — remount resets step/done state
  // when moving lesson -> next lesson (same route, different param) or replaying.
  return <LessonPlayer key={`${slug}:${location.key}`} slug={slug} />
}

function LessonPlayer({ slug }: { slug?: string }) {
  const lesson = INTERACTIVE_LESSONS.find(l => l.slug === slug)
  const completedSlugs = new Set(Object.keys(loadTrack()).filter(s => loadTrack()[s]?.completedAt))
  const missing = lesson ? unmetPrerequisites(lesson.slug, completedSlugs) : []

  useEffect(() => {
    if (lesson) beacon('lesson_start', lesson.slug)
  }, [lesson?.slug])
  const [step, setStep] = useState(0)
  const [firstTries, setFirstTries] = useState(0)
  const [missed, setMissed] = useState<number[]>([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [done, setDone] = useState(false)
  const [sure, setSure] = useState(0)
  const [sureWrong, setSureWrong] = useState(0)

  const scored = lesson ? scoredCount(lesson) : 0

  // ftDelta/missStep are passed explicitly so the final step's result is included
  // in the saved record (state updates would not be visible to this closure yet)
  const next = useCallback((ftDelta = 0, missStep: number | null = null, sureDelta = 0, sureWrongDelta = 0) => {
    if (!lesson) return
    const ft = firstTries + ftDelta
    const ms = missStep === null ? missed : [...missed, missStep]
    const su = sure + sureDelta
    const sw = sureWrong + sureWrongDelta
    setFirstTries(ft)
    setMissed(ms)
    setSure(su)
    setSureWrong(sw)
    if (step + 1 >= lesson.steps.length) {
      saveLesson(lesson.slug, { firstTries: ft, scored, completedAt: new Date().toISOString(), missed: ms, sure: su, sureWrong: sw })
      beacon('lesson_complete', lesson.slug)
      setDone(true)
    } else {
      setStep(s => s + 1)
    }
  }, [step, lesson, firstTries, missed, scored, sure, sureWrong])

  const scored_step = useCallback((ft: boolean, sureFirst?: boolean) => {
    if (ft) setStreak(s => { const ns = s + 1; setBestStreak(b => Math.max(b, ns)); return ns })
    else setStreak(0)
    next(ft ? 1 : 0, ft ? null : step, sureFirst ? 1 : 0, sureFirst && !ft ? 1 : 0)
  }, [next, step])

  if (!lesson) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Lesson not found.</p>
        <Link to="/interactive" className="text-violet-400 hover:text-violet-300">← Back to track</Link>
      </div>
    </div>
  )

  if (missing.length > 0) {
    const names = missing.map(s => INTERACTIVE_LESSONS.find(l => l.slug === s)).filter(Boolean)
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-6">
        <div className="max-w-md">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-2">Build the foundation first</p>
          <h1 className="text-2xl font-bold mb-3">{lesson.title} depends on earlier ideas</h1>
          <p className="text-gray-400 mb-5">This course never assumes a concept you have not built. Complete {names.length === 1 ? 'this lesson' : 'these lessons'} first:</p>
          <div className="grid gap-2">{names.map(l => l && <Link key={l.slug} to={`/interactive/${l.slug}`} className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-violet-600"><span className="font-semibold">{l.emoji} {l.title}</span><span className="block text-sm text-gray-500 mt-1">{l.blurb}</span></Link>)}</div>
          <Link to="/interactive" className="inline-block mt-6 text-violet-400 text-sm">← Back to course</Link>
        </div>
      </div>
    )
  }

  const totalSteps = lesson.steps.length
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center px-6 py-8">
      {/* header */}
      <div className="w-full max-w-lg flex items-center gap-3 mb-10">
        <Link to="/interactive" className="text-gray-500 hover:text-gray-300 text-sm shrink-0">✕</Link>
        <div className="flex-1 flex gap-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors duration-500
              ${i < step || done ? 'bg-violet-500' : i === step ? 'bg-violet-800' : 'bg-gray-800'}`} />
          ))}
        </div>
        <span className={`font-mono text-sm shrink-0 ${streak > 0 ? 'text-orange-400' : 'text-gray-600'}`}>🔥 {streak}</span>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
            <Finale lessonSlug={lesson.slug} firstTries={firstTries} scored={scored} missedCount={missed.length} sure={sure} sureWrong={sureWrong} />
          </motion.div>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}
            className="w-full flex justify-center">
            {(() => {
              const s = lesson.steps[step]
              if (s.kind === 'concept') return <StepConcept step={s} onDone={() => next()} />
              if (s.kind === 'worked') return <StepWorked step={s} onDone={() => next()} />
              if (s.kind === 'mcq') return <StepMcq step={s} onDone={scored_step} />
              if (s.kind === 'predict') return <StepPredict step={s} onDone={scored_step} />
              if (s.kind === 'numeric') return <StepNumeric step={s} onDone={scored_step} />
              if (s.kind === 'widget') return <s.widget onDone={() => next()} />
              return null
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
