// DailyMixPage: /interactive/mix
// Six interleaved checks sampled from lessons you've already completed.
// Same questions all day (seeded by date) so a retry isn't a reroll.
// Finishing counts toward the daily streak via recordMixDay().
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { INTERACTIVE_LESSONS } from './lessons'
import { loadTrack, recordMixDay, mulberry32 } from './types'
import type { InteractiveLesson, McqStep, PredictStep, NumericStep } from './types'
import { StepMcq, StepPredict, StepNumeric } from './InteractiveLessonPage'

const MIX_SIZE = 6

interface MixItem {
  lesson: InteractiveLesson
  step: McqStep | PredictStep | NumericStep
}

// Sample up to MIX_SIZE scored steps across completed lessons, preferring
// one question per lesson before doubling up. Deterministic per calendar day.
function buildMix(): MixItem[] {
  const track = loadTrack()
  const completed = INTERACTIVE_LESSONS.filter(l => track[l.slug]?.completedAt)
  if (completed.length === 0) return []

  const rand = mulberry32(Math.floor(Date.now() / 86400000))
  const pools = completed.map(lesson => ({
    lesson,
    steps: lesson.steps.filter(
      (s): s is McqStep | PredictStep | NumericStep =>
        s.kind === 'mcq' || s.kind === 'predict' || s.kind === 'numeric'
    ),
  })).filter(p => p.steps.length > 0)

  // shuffle lesson order, then round-robin one pick per lesson until full
  for (let i = pools.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pools[i], pools[j]] = [pools[j], pools[i]]
  }
  const out: MixItem[] = []
  let round = 0
  while (out.length < MIX_SIZE) {
    let picked = false
    for (const p of pools) {
      if (out.length >= MIX_SIZE) break
      if (p.steps.length === 0) continue
      const idx = Math.floor(rand() * p.steps.length)
      out.push({ lesson: p.lesson, step: p.steps.splice(idx, 1)[0] })
      picked = true
    }
    if (!picked) break
    round++
    if (round > MIX_SIZE) break
  }
  return out
}

export function DailyMixPage() {
  const [queue] = useState(buildMix)
  const [pos, setPos] = useState(0)
  const [right, setRight] = useState(0)

  const total = queue.length
  const done = total > 0 && pos >= total

  useEffect(() => {
    if (done) recordMixDay() // idempotent per calendar day
  }, [done])

  const onStepDone = (ft: boolean) => {
    if (ft) setRight(n => n + 1)
    setPos(p => p + 1)
  }

  if (total === 0) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">🥣</p>
        <h1 className="text-xl font-bold text-white mb-2">Nothing to mix yet</h1>
        <p className="text-gray-400 text-sm mb-6">Complete at least one lesson and the daily mix will pull questions from everything you've finished.</p>
        <Link to="/interactive" className="text-violet-400 hover:text-violet-300 text-sm">← Back to track</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center px-6 py-8">
      {/* header */}
      <div className="w-full max-w-lg flex items-center gap-3 mb-10">
        <Link to="/interactive" className="text-gray-500 hover:text-gray-300 text-sm shrink-0">✕</Link>
        <div className="flex-1 flex gap-1">
          {queue.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors duration-500
              ${i < pos ? 'bg-sky-500' : i === pos ? 'bg-sky-800' : 'bg-gray-800'}`} />
          ))}
        </div>
        <span className="font-mono text-sm text-gray-500 shrink-0">{Math.min(pos + 1, total)}/{total}</span>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
            className="w-full max-w-lg text-center">
            <motion.p initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
              className="text-5xl mb-3">{right === total ? '🌟' : '🥣'}</motion.p>
            <h2 className="text-2xl font-bold text-white mb-2">Mix complete</h2>
            <p className="text-gray-300 mb-1">{right} of {total} first try. Today's mix is banked.</p>
            <p className="text-sky-300 text-sm mb-2">Mixing topics feels harder than reviewing one lesson — that difficulty is what makes it stick.</p>
            <div className="mt-8">
              <Link to="/interactive" className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold">
                Back to track
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div key={pos} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}
            className="w-full flex flex-col items-center">
            <p className="w-full max-w-lg text-xs font-mono text-gray-500 mb-3">
              from {queue[pos].lesson.emoji} {queue[pos].lesson.title}
            </p>
            {queue[pos].step.kind === 'mcq'
              ? <StepMcq step={queue[pos].step as McqStep} onDone={onStepDone} />
              : queue[pos].step.kind === 'numeric'
                ? <StepNumeric step={queue[pos].step as NumericStep} onDone={onStepDone} />
                : <StepPredict step={queue[pos].step as PredictStep} onDone={onStepDone} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
