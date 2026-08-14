import { useState, useCallback, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import { runChallenge, getPyodide, RunResult } from '@/engine/pyodide'
import { incrementAttempts } from '@/engine/progress'

interface Props {
  levelId: string
  starterCode: string
  testCode: string
  xp: number
  hints: string[]                        // 0-3 escalating hints
  onPass: (hintsUsed: number) => void
}

type RunState = 'idle' | 'loading-pyodide' | 'running' | 'pass' | 'fail'

// Hint economics: hint 1 is free, hints 2-3 cost 10% of the level XP each.
// The cost keeps retrieval effortful (the testing effect) while making sure
// nobody rage-quits at the exact moment they were about to learn something.
const FAILS_TO_UNLOCK_FIRST_HINT = 2
export function hintXpMultiplier(hintsUsed: number): number {
  return 1 - 0.1 * Math.max(0, hintsUsed - 1)
}

// Drafts survive refresh/navigation — losing 30 min of typed code is fatal UX.
const draftKey = (levelId: string) => `llmquest_code_v1:${levelId}`

function loadDraft(levelId: string): string | null {
  try { return localStorage.getItem(draftKey(levelId)) } catch { return null }
}
function saveDraft(levelId: string, code: string): void {
  try { localStorage.setItem(draftKey(levelId), code) } catch {}
}
function clearDraft(levelId: string): void {
  try { localStorage.removeItem(draftKey(levelId)) } catch {}
}

export function Arena({ levelId, starterCode, testCode, xp, hints, onPass }: Props) {
  const [code, setCode] = useState(() => loadDraft(levelId) ?? starterCode)
  const [runState, setRunState] = useState<RunState>('idle')
  const [result, setResult] = useState<RunResult | null>(null)
  const [pyodideReady, setPyodideReady] = useState(false)
  const [failCount, setFailCount] = useState(0)
  const [revealed, setRevealed] = useState(0)

  // Pre-warm Pyodide in the background as soon as Arena mounts
  useEffect(() => {
    setRunState('loading-pyodide')
    getPyodide()
      .then(() => { setPyodideReady(true); setRunState('idle') })
      .catch(() => setRunState('idle'))
  }, [])

  // Debounced autosave of the draft
  useEffect(() => {
    if (code === starterCode) return
    const t = setTimeout(() => saveDraft(levelId, code), 400)
    return () => clearTimeout(t)
  }, [code, levelId, starterCode])

  const resetToStarter = useCallback(() => {
    if (code !== starterCode && !confirm('Discard your code and restore the starter?')) return
    clearDraft(levelId)
    setCode(starterCode)
    setResult(null)
    setRunState('idle')
  }, [code, starterCode, levelId])

  const run = useCallback(async () => {
    if (runState === 'running' || runState === 'loading-pyodide') return
    incrementAttempts(levelId)
    setRunState('running')
    setResult(null)

    const r = await runChallenge(code, testCode)
    setResult(r)
    setRunState(r.ok ? 'pass' : 'fail')

    if (r.ok) {
      // small delay so user sees the pass animation before parent advances
      setTimeout(() => onPass(revealed), 1200)
    } else {
      setFailCount(n => n + 1)
    }
  }, [code, testCode, levelId, onPass, runState, revealed])

  // Ctrl+Enter to run
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [run])

  const effectiveXp = Math.round(xp * hintXpMultiplier(revealed))
  const nextHintIndex = revealed
  const hasMoreHints = nextHintIndex < hints.length
  // Hint N (1-based) unlocks after FAILS_TO_UNLOCK_FIRST_HINT + N - 1 failed runs.
  const failsNeeded = FAILS_TO_UNLOCK_FIRST_HINT + nextHintIndex - failCount
  const nextHintCostsXp = nextHintIndex >= 1

  return (
    <div className="flex flex-col grow shrink-0" style={{ minHeight: '70vh' }}>
      {/* Editor */}
      <div className="flex-1 min-h-0 border border-gray-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={v => setCode(v ?? '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            padding: { top: 12 },
            wordWrap: 'on',
            tabSize: 4,
          }}
        />
      </div>

      {/* Controls */}
      <div className="mt-3 flex items-center gap-3">
        <motion.button
          onClick={run}
          disabled={runState === 'running' || runState === 'loading-pyodide'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-sm font-semibold
                     bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white transition-colors"
        >
          {runState === 'loading-pyodide' && <span className="animate-spin">⟳</span>}
          {runState === 'running' && <span className="animate-spin">⟳</span>}
          {runState === 'idle' || runState === 'fail' || runState === 'pass' ? '▶' : null}
          {runState === 'loading-pyodide'
            ? 'Loading Python…'
            : runState === 'running'
              ? 'Running…'
              : 'Run  (Ctrl+↵)'}
        </motion.button>

        <button
          onClick={resetToStarter}
          disabled={code === starterCode}
          title="Discard changes and restore the starter code"
          className="text-xs font-mono px-3 py-2 rounded-lg text-gray-400 hover:text-white
                     border border-gray-700 hover:border-gray-500 disabled:opacity-30
                     disabled:cursor-not-allowed transition-colors"
        >
          ↺ Reset code
        </button>

        {!pyodideReady && runState === 'idle' && (
          <span className="text-xs text-gray-600 font-mono">Warming up Python runtime…</span>
        )}

        <span className="ml-auto text-xs text-gray-600 font-mono hidden md:block"
              title="Use any AI assistant. The tests grade whether you understood what to build.">
          🤝 AI allowed — tests grade understanding, not typing
        </span>
      </div>

      {/* Hint ladder */}
      {hints.length > 0 && (failCount > 0 || revealed > 0) && (
        <div className="mt-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500">
              💡 Hints {revealed}/{hints.length}
            </span>
            {hasMoreHints && failsNeeded <= 0 && (
              <button
                onClick={() => setRevealed(n => n + 1)}
                className="text-xs font-mono px-3 py-1.5 rounded-lg border border-amber-700/50
                           text-amber-300 hover:bg-amber-950/40 transition-colors"
              >
                Reveal hint {nextHintIndex + 1}
                {nextHintCostsXp ? ' (−10% XP)' : ' (free)'}
              </button>
            )}
            {hasMoreHints && failsNeeded > 0 && (
              <span className="text-xs font-mono text-gray-600">
                Hint {nextHintIndex + 1} unlocks after {failsNeeded} more failed run{failsNeeded === 1 ? '' : 's'}
              </span>
            )}
            {revealed > 1 && (
              <span className="ml-auto text-xs font-mono text-gray-500">
                Level XP now {effectiveXp}
              </span>
            )}
          </div>
          <AnimatePresence>
            {hints.slice(0, revealed).map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-amber-200/90 leading-relaxed"
              >
                <span className="text-amber-500 font-mono text-xs mr-2">#{i + 1}</span>
                {h}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Output panel */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.ok ? 'pass' : `fail-${result.error}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 rounded-lg p-4 font-mono text-sm border ${
              result.ok
                ? 'bg-green-950/60 border-green-700/40 text-green-300'
                : 'bg-red-950/60 border-red-700/40 text-red-300'
            }`}
          >
            {result.ok ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400 text-lg">✓</span>
                  <span className="font-semibold text-green-300">All checks passed</span>
                  <span className="ml-auto text-green-600 text-xs">{result.durationMs.toFixed(0)}ms</span>
                </div>
                <pre className="text-green-400/80 text-xs whitespace-pre-wrap">{result.output}</pre>
                <XPFlash xp={effectiveXp} />
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400 text-lg">✗</span>
                  <span className="font-semibold">Check failed</span>
                </div>
                {result.output && (
                  <pre className="text-gray-400 text-xs whitespace-pre-wrap mb-2">{result.output}</pre>
                )}
                <pre className="text-red-300 text-xs whitespace-pre-wrap">{result.error}</pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function XPFlash({ xp }: { xp: number }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                 bg-yellow-500/20 border border-yellow-500/40"
    >
      <span className="text-yellow-400 text-base">⭐</span>
      <span className="text-yellow-300 font-semibold">+{xp} XP</span>
    </motion.div>
  )
}