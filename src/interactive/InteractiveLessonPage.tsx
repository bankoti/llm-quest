// InteractiveLessonPage: the step player for the interactive track.
// No Pyodide, no progress writes to the main system.
import { useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { INTERACTIVE_LESSONS } from './lessons'
import { scoredCount, saveLesson, stars as calcStars } from './types'
import type { Step, PredictQuestion } from './types'

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

function StepMcq({ step, onDone }: { step: Extract<Step, { kind: 'mcq' }>; onDone: (firstTry: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [wrongOnes, setWrongOnes] = useState<number[]>([])
  const solved = picked === step.answer

  const pick = (i: number) => {
    if (solved) return
    setPicked(i)
    if (i !== step.answer) setWrongOnes(w => (w.includes(i) ? w : [...w, i]))
  }
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-3">{step.prompt}</p>
      {step.code && <pre className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4 font-mono text-sm text-sky-300 overflow-x-auto">{step.code}</pre>}
      <div className="grid gap-3">
        {step.options.map((o, i) => {
          const isWrong = wrongOnes.includes(i)
          const isRight = solved && i === step.answer
          return (
            <motion.button key={i} onClick={() => pick(i)}
              animate={picked === i && isWrong ? { x: [0, -8, 8, -5, 5, 0] } : {}}
              transition={{ duration: 0.35 }}
              disabled={solved}
              className={`px-4 py-3 rounded-xl border text-left font-mono text-sm transition-colors
                ${isRight ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : isWrong ? 'bg-red-900/20 border-red-800 text-red-300'
                : 'bg-gray-800/60 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
              {o}
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence>
        {picked !== null && !solved && (
          <motion.p key={'n' + picked} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-4 text-sm text-amber-300">{step.nudge} Try again, no penalty.</motion.p>
        )}
        {solved && (
          <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <p className="text-sm text-emerald-300 font-semibold">Correct.</p>
            <p className="text-sm text-gray-300 mt-1">{step.explain}</p>
            <ContinueBtn onClick={() => onDone(wrongOnes.length === 0)} />
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
      {pick !== null && !done && <p className="mt-2 text-xs text-amber-300">Not quite. Try again.</p>}
      {done && <p className="mt-2 text-xs text-gray-400">{q.reveal}</p>}
    </div>
  )
}

function StepPredict({ step, onDone }: { step: Extract<Step, { kind: 'predict' }>; onDone: (firstTryAll: boolean) => void }) {
  const [doneCount, setDoneCount] = useState(0)
  const [allFirstTry, setAllFirstTry] = useState(true)
  const [key, setKey] = useState(0)
  const total = step.questions.length

  const onQDone = (ft: boolean) => {
    if (!ft) setAllFirstTry(false)
    setDoneCount(n => n + 1)
  }
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-3">{step.prompt}</p>
      {step.code && <pre className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4 font-mono text-sm text-sky-300 overflow-x-auto">{step.code}</pre>}
      {step.questions.map((q, i) => (
        <PredictQ key={key + '-' + i} q={q} onDone={(ft) => onQDone(ft)} />
      ))}
      {doneCount === total && <ContinueBtn onClick={() => onDone(allFirstTry)} />}
    </div>
  )
}

// ── finale card ───────────────────────────────────────────────────────────────

function Finale({ lessonSlug, firstTries, scored }: { lessonSlug: string; firstTries: number; scored: number }) {
  const s = scored === 0 || firstTries / scored >= 0.99 ? 3 : firstTries / scored >= 0.6 ? 2 : 1
  return (
    <div className="w-full max-w-lg text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
        <p className="text-5xl mb-3">{'⭐'.repeat(s)}{'☆'.repeat(3 - s)}</p>
        <h2 className="text-2xl font-bold text-white mb-2">Lesson complete</h2>
        <p className="text-gray-300 mb-1">{firstTries} of {scored} checks on the first try.</p>
        {s === 3 && <p className="text-emerald-400 text-sm mb-2">Perfect round. No second guesses.</p>}
        {s < 3 && <p className="text-amber-300 text-sm mb-2">Replay to earn 3 stars — no time limit, no pressure.</p>}
      </motion.div>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/interactive"
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold">
          Back to track
        </Link>
        <a href={`/interactive/${lessonSlug}`} onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold">
          Replay
        </a>
      </div>
      <p className="mt-10 text-xs text-gray-600">Interactive track progress is separate from your main XP and certificate.</p>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export function InteractiveLessonPage() {
  const { slug } = useParams<{ slug: string }>()
  const lesson = INTERACTIVE_LESSONS.find(l => l.slug === slug)
  const [step, setStep] = useState(0)
  const [firstTries, setFirstTries] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [done, setDone] = useState(false)

  const scored = lesson ? scoredCount(lesson) : 0

  const next = useCallback(() => {
    if (!lesson) return
    if (step + 1 >= lesson.steps.length) {
      saveLesson(lesson.slug, { firstTries, scored, completedAt: new Date().toISOString() })
      setDone(true)
    } else {
      setStep(s => s + 1)
    }
  }, [step, lesson, firstTries, scored])

  const scored_step = useCallback((ft: boolean) => {
    if (ft) {
      setFirstTries(n => n + 1)
      setStreak(s => { const ns = s + 1; setBestStreak(b => Math.max(b, ns)); return ns })
    } else {
      setStreak(0)
    }
    next()
  }, [next])

  if (!lesson) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Lesson not found.</p>
        <Link to="/interactive" className="text-violet-400 hover:text-violet-300">← Back to track</Link>
      </div>
    </div>
  )

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
            <Finale lessonSlug={lesson.slug} firstTries={firstTries} scored={scored} />
          </motion.div>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}
            className="w-full flex justify-center">
            {(() => {
              const s = lesson.steps[step]
              if (s.kind === 'concept') return <StepConcept step={s} onDone={next} />
              if (s.kind === 'mcq') return <StepMcq step={s} onDone={scored_step} />
              if (s.kind === 'predict') return <StepPredict step={s} onDone={scored_step} />
              if (s.kind === 'widget') return <s.widget onDone={next} />
              return null
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
