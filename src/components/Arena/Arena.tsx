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
  onPass: () => void
}

type RunState = 'idle' | 'loading-pyodide' | 'running' | 'pass' | 'fail'

export function Arena({ levelId, starterCode, testCode, xp, onPass }: Props) {
  const [code, setCode] = useState(starterCode)
  const [runState, setRunState] = useState<RunState>('idle')
  const [result, setResult] = useState<RunResult | null>(null)
  const [pyodideReady, setPyodideReady] = useState(false)

  // Pre-warm Pyodide in the background as soon as Arena mounts
  useEffect(() => {
    setRunState('loading-pyodide')
    getPyodide()
      .then(() => { setPyodideReady(true); setRunState('idle') })
      .catch(() => setRunState('idle'))
  }, [])

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
      setTimeout(() => onPass(), 1200)
    }
  }, [code, testCode, levelId, onPass, runState])

  // Ctrl+Enter to run
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [run])

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

        {!pyodideReady && runState === 'idle' && (
          <span className="text-xs text-gray-600 font-mono">Warming up Python runtime…</span>
        )}
      </div>

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
                <XPFlash xp={xp} />
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
