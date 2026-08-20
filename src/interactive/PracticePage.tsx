// PracticePage: /interactive/practice
// Weakest-first replay of every check you missed, across all lessons.
// Uses spacing metadata: oldest-due-first. Does NOT clear on non-first-try.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { INTERACTIVE_LESSONS } from './curriculum'
import { loadTrack, stars, clearMiss, spacingSortKey, recordPractice } from './types'
import type { InteractiveLesson, McqStep, PredictStep, NumericStep } from './types'
import { StepMcq, StepPredict, StepNumeric } from './InteractiveLessonPage'

interface PracticeItem {
  lesson: InteractiveLesson
  stepIdx: number
  step: McqStep | PredictStep | NumericStep
  spacingKey: string
}

// weakest lesson first (fewest stars), then oldest-due-first via spacing metadata
function buildQueue(): PracticeItem[] {
  const track = loadTrack()
  const order = [...INTERACTIVE_LESSONS].sort(
    (a, b) => stars(track[a.slug]) - stars(track[b.slug])
  )
  const q: PracticeItem[] = []
  for (const lesson of order) {
    const missed = track[lesson.slug]?.missed ?? []
    for (const stepIdx of [...missed].sort((a, b) => a - b)) {
      const step = lesson.steps[stepIdx]
      if (step && (step.kind === 'mcq' || step.kind === 'predict' || step.kind === 'numeric')) {
        const spacingKey = `${lesson.slug}:${stepIdx}`
        q.push({ lesson, stepIdx, step, spacingKey })
      }
    }
  }
  // Only surface items whose spacing interval has elapsed, then oldest first.
  const now = Date.now()
  return q.filter(item => { const due = spacingSortKey(item.spacingKey); return due === 0 || due <= now })
    .sort((a, b) => spacingSortKey(a.spacingKey) - spacingSortKey(b.spacingKey))
}

export function PracticePage() {
  const [queue] = useState(buildQueue)
  const [pos, setPos] = useState(0)
  const [cleared, setCleared] = useState(0)

  const total = queue.length
  const done = pos >= total

  // Unified handler for MCQ (ft, sureFirst?) and predict/numeric (allFirst, earned?, possible?)
  const onStepDone = (ft: boolean, _sureOrEarned?: boolean | number, _possible?: number) => {
    const item = queue[pos]
    let wasFirstTry: boolean
    if (typeof _sureOrEarned === 'number') {
      // predict/numeric: all questions correct on first try?
      const earned = _sureOrEarned
      const possible = _possible ?? 1
      wasFirstTry = earned === possible
    } else {
      wasFirstTry = ft
    }

    // Record spacing metadata regardless
    recordPractice(item.spacingKey, wasFirstTry)

    // Only clear from missed list on first-try success
    if (wasFirstTry) {
      clearMiss(item.lesson.slug, item.stepIdx)
      setCleared(n => n + 1)
    }
    setPos(p => p + 1)
  }

  if (total === 0) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">🎯</p>
        <h1 className="text-xl font-bold text-white mb-2">No weak spots</h1>
        <p className="text-gray-400 text-sm mb-6">Miss a check in any lesson and it lands here for review.</p>
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
              ${i < pos ? 'bg-amber-500' : i === pos ? 'bg-amber-800' : 'bg-gray-800'}`} />
          ))}
        </div>
        <span className="font-mono text-sm text-gray-500 shrink-0">{Math.min(pos + 1, total)}/{total}</span>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
            className="w-full max-w-lg text-center">
            <motion.p initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
              className="text-5xl mb-3">{cleared === total ? '🏆' : '🎯'}</motion.p>
            <h2 className="text-2xl font-bold text-white mb-2">Practice done</h2>
            <p className="text-gray-300 mb-1">You cleared {cleared} of {total} weak spots.</p>
            {cleared < total && <p className="text-amber-300 text-sm mb-2">The rest stay in the queue — come back anytime.</p>}
            {cleared === total && <p className="text-emerald-400 text-sm mb-2">Queue empty. Nothing left to review.</p>}
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
              ? <StepMcq step={queue[pos].step as McqStep} onDone={onStepDone} showConfidence={false} />
              : queue[pos].step.kind === 'numeric'
                ? <StepNumeric step={queue[pos].step as NumericStep} onDone={onStepDone} />
                : <StepPredict step={queue[pos].step as PredictStep} onDone={onStepDone} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
