import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SITE } from '@/config/site'
import { COURSES, MAX_XP, getRank } from '@/data/curriculum'
import { loadProgress, getProgressSummary } from '@/engine/progress'
import { getDefense, loadReview } from '@/engine/review'

// Deterministic completion code: verifiable by recomputing on this page.
// Honest scope: this is an integrity check, not a cryptographic credential —
// real verification needs a backend (the Supabase upgrade path).
function completionCode(name: string, completed: number, xp: number): string {
  const input = name.trim().toLowerCase() + '|' + completed + '|' + xp
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36).toUpperCase().padStart(7, '0')
}

const NAME_KEY = 'llmquest_name'

export function CertPage() {
  const navigate = useNavigate()
  const [name, setName] = useState(() => {
    try { return localStorage.getItem(NAME_KEY) ?? '' } catch { return '' }
  })
  const progress = loadProgress()
  const review = loadReview()
  const { completed, total, percent } = getProgressSummary(progress)
  const rank = getRank(progress.totalXp)
  const done = completed === total

  const completionDates = Object.values(progress.levels)
    .map(l => l.completedAt)
    .filter((t): t is number => t !== undefined)
  const finishedOn = completionDates.length > 0
    ? new Date(Math.max(...completionDates)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  const reviewCards = Object.values(review.cards)
  const retained = reviewCards.filter(c => c.box >= 2).length

  function saveName(v: string) {
    setName(v)
    try { localStorage.setItem(NAME_KEY, v) } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header (hidden when printing) */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-6 print:hidden">
        <button
          onClick={() => navigate('/map')}
          className="text-gray-500 hover:text-white transition-colors text-sm font-mono"
        >
          ← Map
        </button>
        <h1 className="font-bold text-lg" style={{ color: '#7c3aed' }}>Certificate & Transcript</h1>
        {done && (
          <button
            onClick={() => window.print()}
            className="ml-auto px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500
                       text-sm font-mono text-gray-300 transition-colors"
          >
            🖨 Print / save PDF
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Name (needed for the certificate) */}
        <div className="mb-8 print:hidden">
          <label className="block text-xs font-mono text-gray-500 mb-2">
            Name as it should appear on the certificate
          </label>
          <input
            value={name}
            onChange={e => saveName(e.target.value)}
            placeholder="Ada Lovelace"
            className="w-full max-w-sm px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700
                       focus:border-violet-500 focus:outline-none text-sm"
          />
        </div>

        {/* Certificate */}
        {done && name.trim() ? (
          <div
            className="rounded-2xl border-2 p-10 text-center mb-10 bg-gray-900/70 print:bg-white print:text-black"
            style={{ borderColor: '#7c3aed' }}
          >
            <div className="text-xs font-mono uppercase tracking-widest text-violet-400 mb-6">
              {SITE.name} · Certificate of Completion
            </div>
            <div className="text-3xl font-bold mb-2">{name.trim()}</div>
            <p className="text-gray-400 print:text-gray-700 text-sm mb-6 leading-relaxed">
              completed all {total} levels of<br />
              <span className="text-gray-200 print:text-black font-semibold">{SITE.tagline}</span>
            </p>
            <div className="flex items-center justify-center gap-8 text-sm font-mono mb-6">
              <div>
                <div className="text-gray-500">XP</div>
                <div className="text-yellow-300 print:text-black font-bold">{progress.totalXp.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Rank</div>
                <div style={{ color: rank.color }} className="font-bold">{rank.title}</div>
              </div>
              <div>
                <div className="text-gray-500">Date</div>
                <div className="text-gray-200 print:text-black font-bold">{finishedOn}</div>
              </div>
            </div>
            <div className="text-xs font-mono text-gray-600">
              Completion code: {completionCode(name, completed, progress.totalXp)} · {SITE.domain}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-8 text-center mb-10">
            <div className="text-4xl mb-3">📜</div>
            <h2 className="text-lg font-semibold mb-1">Certificate locks in at 100%</h2>
            <p className="text-gray-500 text-sm font-mono">
              {completed}/{total} levels · {percent}% complete
              {!name.trim() && completed === total ? ' · enter your name above' : ''}
            </p>
            <div className="mt-4 h-2 rounded-full bg-gray-800 overflow-hidden max-w-sm mx-auto">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: percent + '%', background: '#7c3aed' }}
              />
            </div>
          </div>
        )}

        {/* Mastery transcript */}
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-4">
          Mastery transcript
        </h2>
        <div className="grid gap-2 mb-8">
          {COURSES.map(c => {
            const levels = c.levels.map(l => progress.levels[l.id])
            const lvlDone = levels.filter(l => l?.status === 'complete').length
            const xpEarned = levels.reduce((s, l) => s + (l?.xpEarned ?? 0), 0)
            const d = getDefense(c.id)
            return (
              <div
                key={c.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-800 bg-gray-900/40 print:bg-white"
              >
                <span className="text-xs font-mono font-semibold w-8" style={{ color: c.accent }}>
                  C{c.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-200 print:text-black">{c.title}</div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">
                    {lvlDone}/{c.levels.length} levels · {xpEarned.toLocaleString()} XP
                    {d ? ' · defense ' + d.bestPct + '%' : ''}
                  </div>
                </div>
                <span className="text-lg">
                  {lvlDone === c.levels.length ? (d && d.bestPct >= 80 ? '🛡️' : '✅') : lvlDone > 0 ? '▶️' : '—'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Retention line — the honest differentiator */}
        <div className="text-xs font-mono text-gray-600 mb-8">
          {progress.totalXp.toLocaleString()} / {MAX_XP.toLocaleString()} course XP
          {review.xpFromReview > 0 ? ' · +' + review.xpFromReview.toLocaleString() + ' XP from spaced review' : ''}
          {retained > 0 ? ' · ' + retained + ' concepts in long-term retention (7+ day box)' : ''}
        </div>
      </div>
    </div>
  )
}
