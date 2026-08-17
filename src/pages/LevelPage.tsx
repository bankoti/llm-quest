import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getLevel, getCourse, ALL_LEVELS } from '@/data/curriculum'
import { loadProgress, completeLevel, ProgressState } from '@/engine/progress'
import { LessonPanel } from '@/components/Lesson/LessonPanel'
import { lazy, Suspense } from 'react'
const Arena = lazy(() => import('@/components/Arena/Arena').then(m => ({ default: m.Arena })))
import { XPBar } from '@/components/Progress/XPBar'
import { GoDeeper } from '@/components/GoDeeper'
import { SplitPane } from '@/components/SplitPane'
import { isAdminMode } from '@/engine/admin'
import { HINTS } from '@/data/hints'
import { hintXpMultiplier } from '@/components/Arena/xpUtils'
import { WARMUPS } from '@/interactive/lessons'

interface Props { onProgressChange: (p: ProgressState) => void }

export function LevelPage({ onProgressChange }: Props) {
  const { levelId } = useParams<{ levelId: string }>()
  const navigate = useNavigate()
  const level = levelId ? getLevel(levelId) : undefined
  const course = level ? getCourse(level.courseId) : undefined

  const [starterCode, setStarterCode] = useState<string | null>(null)
  const [testCode, setTestCode]       = useState<string | null>(null)
  const [progress, setProgress]       = useState(loadProgress)
  const [passed, setPassed]           = useState(false)
  const [earnedXp, setEarnedXp]       = useState(0)

  useEffect(() => {
    if (!level) return
    setPassed(false)
    setEarnedXp(0)
    setStarterCode(null)
    setTestCode(null)
    // challenge file e.g. "c1/06_attention.py" → test: "c1/06_attention_test.py"
    const [courseDir, fileName] = level.challengeFile.split('/')
    const testFile = fileName.replace('.py', '_test.py')

    Promise.all([
      fetch(`${import.meta.env.BASE_URL}content/challenges/${level.challengeFile}`).then(r => r.ok ? r.text() : '# challenge not found'),
      fetch(`${import.meta.env.BASE_URL}content/tests/${courseDir}/${testFile}`).then(r => r.ok ? r.text() : '# test not found'),
    ]).then(([starter, test]) => {
      setStarterCode(starter)
      setTestCode(test)
    })
  }, [level])

  function handlePass(hintsUsed: number) {
    if (!level) return
    const wasComplete = progress.levels[level.id]?.status === 'complete'
    const newProgress = completeLevel(level.id, hintXpMultiplier(hintsUsed))
    setProgress(newProgress)
    onProgressChange(newProgress)
    setEarnedXp(wasComplete ? 0 : newProgress.levels[level.id]?.xpEarned ?? level.xp)
    setPassed(true)
  }

  // Escape dismisses the pass overlay and stays on the level.
  useEffect(() => {
    if (!passed) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPassed(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [passed])

  function goNext() {
    if (!level) return
    const idx = ALL_LEVELS.findIndex(l => l.id === level.id)
    const next = ALL_LEVELS[idx + 1]
    if (next) navigate(`/level/${next.id}`)
    else navigate('/map')
  }

  if (!level || !course) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 font-mono">
        Level not found.
      </div>
    )
  }

  const levelState = progress.levels[level.id]
  if (levelState?.status === 'locked' && !isAdminMode()) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 font-mono">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <div>Complete previous levels to unlock this one.</div>
          <button onClick={() => navigate('/map')} className="mt-4 text-violet-400 text-sm underline">
            Back to map
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Top bar */}
      <div
        className="flex items-center gap-4 px-6 py-3 border-b border-gray-800"
        style={{ borderTopColor: course.accent, borderTopWidth: 2 }}
      >
        <button
          onClick={() => navigate('/map')}
          className="text-gray-500 hover:text-white transition-colors text-sm font-mono"
        >
          ← Map
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-mono uppercase tracking-widest shrink-0" style={{ color: course.accent }}>
            C{level.courseId}
          </span>
          <span className="text-gray-600 shrink-0">/</span>
          <span className="text-sm font-semibold text-white truncate">{level.title}</span>
          {level.type === 'boss' && <span title="Boss fight" className="shrink-0">👑</span>}
          {level.type === 'debug' && <span title="Debug level — find the bug" className="shrink-0">🐛</span>}
        </div>
        {WARMUPS[level.id] && (
          <a
            href={`${import.meta.env.BASE_URL}interactive/${WARMUPS[level.id]}`}
            target="_blank"
            rel="noopener"
            className="text-xs font-mono text-violet-400 hover:text-violet-200 transition-colors shrink-0"
            title="3-minute interactive warm-up for this level (new tab)"
          >
            ⚡ Warm-up
          </a>
        )}
        {/* Opens in a new tab so in-progress code in the Arena stays put. */}
        <a
          href={`${import.meta.env.BASE_URL}reference`}
          target="_blank"
          rel="noopener"
          className="text-xs font-mono text-gray-500 hover:text-white transition-colors shrink-0"
          title="Tensor syntax reference (new tab)"
        >
          📖 Syntax
        </a>
        <div className="w-40 shrink-0">
          <XPBar xp={progress.totalXp} animated={false} />
        </div>
        <span className="text-xs font-mono text-gray-500 shrink-0">~{level.estimateMinutes}min</span>
        {levelState?.status === 'complete' && (
          <button
            onClick={goNext}
            className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg text-white shrink-0 transition-opacity hover:opacity-90"
            style={{ background: course.accent }}
            title="Continue to the next level"
          >
            Next →
          </button>
        )}
      </div>

      {/* Split view: lesson left, arena right. Divider drags; chevron collapses the lesson. */}
      <SplitPane
        storageKey="llmquest_split_v1"
        left={<LessonPanel lessonFile={level.lessonFile} accent={course.accent} />}
        right={
          <div className="h-full flex flex-col p-4 overflow-y-auto">
            {starterCode === null || testCode === null ? (
              <div className="flex items-center justify-center h-full text-gray-600 font-mono text-sm">
                Loading challenge…
              </div>
            ) : (
              <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-600 text-sm">Loading editor…</div>}>
              <Arena
                key={level.id}
                levelId={level.id}
                starterCode={starterCode}
                testCode={testCode}
                xp={level.xp}
                hints={HINTS[level.id] ?? []}
                onPass={handlePass}
              />
              </Suspense>
            )}
            <GoDeeper courseId={level.courseId} challengeFile={level.challengeFile} />
          </div>
        }
      />

      {/* Pass overlay */}
      {passed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPassed(false)}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-10 text-center max-w-sm mx-4"
            style={{ borderTopColor: course.accent, borderTopWidth: 3 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">{level.type === 'boss' ? '🏆' : '⭐'}</div>
            <h2 className="text-2xl font-bold text-white mb-1">{level.title}</h2>
            <p className="text-gray-400 text-sm mb-4">Level complete</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-yellow-400 text-2xl">+</span>
              <span className="text-yellow-300 font-bold text-2xl">{earnedXp} XP</span>
            </div>
            <XPBar xp={progress.totalXp} />
            <button
              onClick={goNext}
              className="mt-6 w-full py-3 rounded-xl font-mono font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: course.accent }}
            >
              Next Level →
            </button>
            <button
              onClick={() => setPassed(false)}
              className="mt-3 w-full py-2 rounded-xl font-mono text-sm text-gray-400 hover:text-white transition-colors"
            >
              Stay on this level (Esc)
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
