import { useState } from 'react'
import { COURSES } from '@/data/curriculum'
import { loadProgress, resetProgress, ProgressState } from '@/engine/progress'
import { exitAdminMode, makeGrantLink, unlockAllLevels } from '@/engine/admin'

interface Props { onProgressChange: (p: ProgressState) => void }

export function AdminPanel({ onProgressChange }: Props) {
  const [selected, setSelected] = useState<number[]>([])
  const [copied, setCopied] = useState(false)

  function toggle(id: number) {
    setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
    setCopied(false)
  }

  async function copyLink() {
    if (!selected.length) return
    await navigator.clipboard.writeText(makeGrantLink(selected))
    setCopied(true)
  }

  return (
    <div className="mb-8 p-5 rounded-2xl border border-amber-700/40 bg-amber-950/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
          ADMIN
        </span>
        <span className="text-xs text-gray-500 font-mono">
          All levels are playable while admin mode is on.
        </span>
        <button
          onClick={() => { exitAdminMode(); location.reload() }}
          className="ml-auto text-xs font-mono text-gray-500 hover:text-white underline"
        >
          exit admin
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => { unlockAllLevels(); onProgressChange(loadProgress()) }}
          className="text-xs font-mono px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-600/40"
        >
          Unlock all (persist in this browser)
        </button>
        <button
          onClick={() => {
            if (confirm('Reset ALL progress in this browser?')) {
              resetProgress()
              onProgressChange(loadProgress())
            }
          }}
          className="text-xs font-mono px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/40"
        >
          Reset progress
        </button>
      </div>

      <div className="text-xs font-mono text-gray-400 mb-2">
        Grant link — unlocks selected courses for whoever opens it:
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {COURSES.map(c => (
          <label
            key={c.id}
            className={`text-xs font-mono px-2.5 py-1 rounded-lg border cursor-pointer select-none transition-colors ${
              selected.includes(c.id)
                ? 'bg-violet-600/40 border-violet-500 text-white'
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={selected.includes(c.id)}
              onChange={() => toggle(c.id)}
            />
            C{c.id} · {c.shortTitle}
          </label>
        ))}
      </div>
      <button
        onClick={copyLink}
        disabled={!selected.length}
        className="text-xs font-mono px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white"
      >
        {copied ? '✓ Link copied' : 'Copy unlock link'}
      </button>
    </div>
  )
}
