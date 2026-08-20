import { useMemo, useState, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { COURSES } from '@/data/curriculum'
import { ReviewQuestion } from '@/data/review'
import {
  dueQuestions, answerCard, courseQuestions, defenseAvailable, getDefense,
  recordDefense, REVIEW_XP, SESSION_CAP, DEFENSE_BONUS_XP, DEFENSE_PASS_PCT,
  RETRY_GAP,
} from '@/engine/review'
import { loadProgress, nextRecommendedLevel, ProgressState } from '@/engine/progress'
import { XPBar } from '@/components/Progress/XPBar'
import { StreakBadge } from '@/components/Progress/StreakBadge'

interface Props { onProgressChange: (p: ProgressState) => void }

type Tab = 'daily' | 'defense'

export function ReviewPage({ onProgressChange }: Props) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('daily')
  const [progress, setProgress] = useState(loadProgress)
  // Defense session state: null = picking a course
  const [defenseCourse, setDefenseCourse] = useState<number | null>(null)
  const [sessionKey, setSessionKey] = useState(0)

  function refresh() {
    const p = loadProgress()
    setProgress(p)
    onProgressChange(p)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-6">
        <button
          onClick={() => navigate('/map')}
          className="text-gray-500 hover:text-white transition-colors text-sm font-mono"
        >
          ← Map
        </button>
        <h1 className="font-bold text-lg" style={{ color: '#7c3aed' }}>Review</h1>
        <div className="flex items-center gap-3 ml-auto">
          <StreakBadge days={progress.streakDays} />
          <div className="w-52"><XPBar xp={progress.totalXp} /></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <TabButton active={tab === 'daily'} onClick={() => { setTab('daily'); setSessionKey(k => k + 1) }}>
            🔁 Daily review
          </TabButton>
          <TabButton active={tab === 'defense'} onClick={() => { setTab('defense'); setDefenseCourse(null) }}>
            🛡️ Boss defense
          </TabButton>
        </div>

        {tab === 'daily' && (
          <DailySession key={sessionKey} onAnswered={refresh} />
        )}

        {tab === 'defense' && defenseCourse === null && (
          <DefensePicker onPick={setDefenseCourse} />
        )}

        {tab === 'defense' && defenseCourse !== null && (
          <DefenseSession
            courseId={defenseCourse}
            onDone={refresh}
            onExit={() => setDefenseCourse(null)}
          />
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={'px-4 py-2 rounded-lg text-sm font-mono transition-colors border ' + (active
        ? 'bg-violet-600/20 border-violet-500/50 text-violet-200'
        : 'border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600')}
    >
      {children}
    </button>
  )
}

// ─── Daily review ─────────────────────────────────────────────────────────────

function DailySession({ onAnswered }: { onAnswered: () => void }) {
  const navigate = useNavigate()
  // Snapshot the due set once per session so answering does not reshuffle it.
  const initialCards = useMemo(() => dueQuestions().slice(0, SESSION_CAP), [])
  // Queue tracks the full order including retries inserted after RETRY_GAP.
  const [queue, setQueue] = useState<ReviewQuestion[]>(initialCards)
  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [sinceLastRetry, setSinceLastRetry] = useState(0)
  // Pending retries: cards missed once, waiting for RETRY_GAP intervening cards.
  const [retryPool, setRetryPool] = useState<{ card: ReviewQuestion; gap: number }[]>([])

  const advance = useCallback((wasCorrect: boolean, currentCard: ReviewQuestion) => {
    const result = answerCard(currentCard.id, wasCorrect)
    if (wasCorrect) setCorrect(c => c + 1)
    onAnswered()

    // Manage retry queue
    let newRetryPool = [...retryPool]
    let newQueue = [...queue]
    const newSince = sinceLastRetry + 1

    if (result === 'retry') {
      // First miss: insert after RETRY_GAP intervening cards
      newRetryPool.push({ card: currentCard, gap: 0 })
    }

    // Age all pending retries and inject those that have waited long enough
    const stillWaiting: { card: ReviewQuestion; gap: number }[] = []
    for (const entry of newRetryPool) {
      const aged = result === 'retry' && entry.card.id === currentCard.id
        ? { ...entry, gap: 0 } // just added
        : { ...entry, gap: entry.gap + 1 }
      if (aged.gap >= RETRY_GAP) {
        // Insert this card right after current position
        newQueue = [...newQueue.slice(0, idx + 1 + stillWaiting.length), aged.card, ...newQueue.slice(idx + 1 + stillWaiting.length)]
      } else {
        stillWaiting.push(aged)
      }
    }

    setRetryPool(stillWaiting)
    setQueue(newQueue)
    setSinceLastRetry(newSince)
    setIdx(i => i + 1)
  }, [queue, idx, retryPool, sinceLastRetry, onAnswered])

  if (initialCards.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">✨</div>
        <h2 className="text-xl font-semibold mb-2">Nothing due right now</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
          Questions unlock a day after you complete a level, then space out as
          you answer them correctly: 1 → 3 → 7 → 21 → 60 days. Spacing is what
          moves knowledge into long-term memory.
        </p>
        <button
          onClick={() => navigate('/map')}
          className="mt-6 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 font-mono text-sm"
        >
          Back to the map →
        </button>
      </div>
    )
  }

  if (idx >= queue.length) {
    const next = nextRecommendedLevel(loadProgress())
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🧠</div>
        <h2 className="text-xl font-semibold mb-2">Review complete</h2>
        <p className="text-gray-400 text-sm mb-1">
          {correct}/{initialCards.length} correct · +{correct * REVIEW_XP} XP
        </p>
        <p className="text-gray-600 text-xs font-mono mb-6">
          Correct cards moved up a box. Missed cards reappear next session.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate('/map')}
            className="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 font-mono text-sm"
          >
            Done →
          </button>
          {next && (
            <button
              onClick={() => navigate(`/level/${next.id}`)}
              className="px-6 py-2.5 rounded-lg border border-violet-500/50 hover:bg-violet-600/20 font-mono text-sm text-violet-200"
            >
              Continue: {next.title} →
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-xs font-mono text-gray-600 mb-4">
        Card {idx + 1} of {queue.length}
      </div>
      <QuizCard
        key={queue[idx].id + '-' + idx}
        question={queue[idx]}
        xpPerCorrect={REVIEW_XP}
        onNext={wasCorrect => advance(wasCorrect, queue[idx])}
      />
    </div>
  )
}

// ─── Boss defense ─────────────────────────────────────────────────────────────

function DefensePicker({ onPick }: { onPick: (courseId: number) => void }) {
  return (
    <div>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed">
        Finished a course? Defend it. Answer its full question set —
        score {DEFENSE_PASS_PCT}% or better and earn a one-time
        <span className="text-yellow-300"> +{DEFENSE_BONUS_XP} XP</span> bonus.
        Retry as often as you like.
      </p>
      <div className="grid gap-3">
        {COURSES.map(c => {
          const available = defenseAvailable(c.id)
          const d = getDefense(c.id)
          return (
            <button
              key={c.id}
              disabled={!available}
              onClick={() => onPick(c.id)}
              className={'flex items-center gap-4 p-4 rounded-xl border text-left transition-colors ' + (available
                ? 'border-gray-700 bg-gray-900/60 hover:border-gray-500 cursor-pointer'
                : 'border-gray-800/60 bg-gray-900/20 opacity-50 cursor-not-allowed')}
            >
              <span className="text-xs font-mono font-semibold w-8" style={{ color: c.accent }}>
                C{c.id}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-200">{c.shortTitle}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">
                  {available
                    ? (d ? 'Best: ' + d.bestPct + '%' + (d.bonusAwarded ? ' · bonus claimed ✓' : '') : 'Not attempted')
                    : 'Complete the course to unlock'}
                </div>
              </div>
              {available && <span className="text-gray-600">→</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DefenseSession({ courseId, onDone, onExit }: {
  courseId: number; onDone: () => void; onExit: () => void
}) {
  const course = COURSES.find(c => c.id === courseId)!
  const questions = useMemo(
    () => shuffle(courseQuestions(courseId)),
    [courseId],
  )
  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [result, setResult] = useState<{ pct: number; bonus: number } | null>(null)

  if (result) {
    const passed = result.pct >= DEFENSE_PASS_PCT
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">{passed ? '🛡️' : '⚔️'}</div>
        <h2 className="text-xl font-semibold mb-2">
          {passed ? 'Defense held!' : 'Defense broken'}
        </h2>
        <p className="text-gray-400 text-sm mb-1">
          {course.shortTitle}: {result.pct}% ({correct}/{questions.length})
        </p>
        {result.bonus > 0 && (
          <p className="text-yellow-300 font-semibold mt-2">+{result.bonus} XP bonus</p>
        )}
        {!passed && (
          <p className="text-gray-600 text-xs font-mono mt-2">
            Need {DEFENSE_PASS_PCT}% for the bonus. Review the misses and try again.
          </p>
        )}
        <button
          onClick={onExit}
          className="mt-6 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 font-mono text-sm"
        >
          Back to defenses →
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 text-xs font-mono text-gray-600 mb-4">
        <span style={{ color: course.accent }}>Defending {course.shortTitle}</span>
        <span className="ml-auto">{idx + 1} / {questions.length}</span>
      </div>
      <QuizCard
        key={questions[idx].id}
        question={questions[idx]}
        xpPerCorrect={0}
        onNext={wasCorrect => {
          const newCorrect = correct + (wasCorrect ? 1 : 0)
          if (wasCorrect) setCorrect(newCorrect)
          if (idx + 1 >= questions.length) {
            const pct = Math.round((newCorrect / questions.length) * 100)
            const { bonus } = recordDefense(courseId, pct)
            setResult({ pct, bonus })
            onDone()
          } else {
            setIdx(i => i + 1)
          }
        }}
      />
    </div>
  )
}

// ─── Shared quiz card ─────────────────────────────────────────────────────────

function QuizCard({ question, onNext, xpPerCorrect }: {
  question: ReviewQuestion
  onNext: (correct: boolean) => void
  xpPerCorrect: number
}) {
  // Shuffle option order per card so answers cannot be memorized by position.
  const order = useMemo(() => shuffle(question.options.map((_, i) => i)), [question.id])
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const wasCorrect = picked === question.answer

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
    >
      <p className="text-gray-100 leading-relaxed mb-5">{question.prompt}</p>
      <div className="grid gap-2">
        {order.map(optIdx => {
          const isAnswer = optIdx === question.answer
          const isPicked = optIdx === picked
          let cls = 'border-gray-700 hover:border-gray-500 text-gray-300'
          if (answered && isAnswer) cls = 'border-green-600 bg-green-950/40 text-green-200'
          else if (answered && isPicked) cls = 'border-red-600 bg-red-950/40 text-red-200'
          else if (answered) cls = 'border-gray-800 text-gray-600'
          return (
            <button
              key={optIdx}
              disabled={answered}
              onClick={() => setPicked(optIdx)}
              className={'text-left px-4 py-3 rounded-lg border text-sm transition-colors ' + cls}
            >
              {question.options[optIdx]}
            </button>
          )
        })}
      </div>
      {answered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
          <p className={'text-sm font-semibold mb-1 ' + (wasCorrect ? 'text-green-400' : 'text-red-400')}>
            {wasCorrect ? '✓ Correct' + (xpPerCorrect > 0 ? ' · +' + xpPerCorrect + ' XP' : '') : '✗ Not quite'}
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">{question.explain}</p>
          <button
            onClick={() => onNext(wasCorrect)}
            className="mt-4 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 font-mono text-sm"
          >
            Next →
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
