// Interactive-track hub: /interactive
// Shows all 8 lessons with star rating from local progress.
// No dependency on main progress or curriculum.ts.
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { INTERACTIVE_LESSONS } from './lessons'
import { loadTrack, stars, scoredCount, computeStreak } from './types'

const TOTAL = INTERACTIVE_LESSONS.length

function StreakCalendar({ activeDates }: { activeDates: Set<string> }) {
  const days: { date: string; active: boolean }[] = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const iso = d.toISOString().slice(0, 10)
    days.push({ date: iso, active: activeDates.has(iso) })
  }
  const weeks: typeof days[] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return (
    <div className="mb-8">
      <p className="font-mono text-[10px] text-gray-600 mb-2">last 28 days</p>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(d => (
              <div key={d.date} title={d.date}
                className={`w-4 h-4 rounded-sm transition-colors ${d.active ? 'bg-violet-500' : 'bg-gray-800'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function InteractiveHubPage() {
  const [track, setTrack] = useState(loadTrack)
  useEffect(() => { setTrack(loadTrack()) }, [])

  const completed = INTERACTIVE_LESSONS.filter(l => track[l.slug]).length
  const totalStars = INTERACTIVE_LESSONS.reduce((n, l) => n + stars(track[l.slug]), 0)
  const weakSpots = INTERACTIVE_LESSONS.reduce((n, l) => n + (track[l.slug]?.missed?.length ?? 0), 0)
  const streak = computeStreak(track)

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">

        {/* header */}
        <div className="flex items-center gap-4 mb-2">
          <Link to="/map" className="text-gray-500 hover:text-gray-300 text-sm">← Map</Link>
        </div>
        <h1 className="text-3xl font-bold mb-1">Interactive Track</h1>
        <p className="text-gray-400 mb-2">Tap-first lessons. No code, no typing — just intuition.</p>
        <div className="flex items-center gap-4 mb-4 text-sm font-mono text-gray-500">
          <span>{completed}/{TOTAL} lessons done</span>
          <span>{'⭐'.repeat(Math.min(totalStars, 6))} {totalStars}/{TOTAL * 3} stars</span>
          {streak.current > 0 && (
            <span className="text-orange-400">🔥 {streak.current}-day streak</span>
          )}
          {streak.longest > 1 && streak.current < streak.longest && (
            <span className="text-gray-600">best: {streak.longest}</span>
          )}
        </div>

        {/* calendar heatmap — last 28 days */}
        {completed > 0 && <StreakCalendar activeDates={streak.activeDates} />}

        {/* weakest-first practice */}
        {weakSpots > 0 && (
          <Link to="/interactive/practice"
            className="flex items-center gap-3 p-4 mb-6 rounded-xl border bg-amber-950/30 border-amber-800/60 hover:border-amber-500 transition-colors group">
            <span className="text-2xl">🎯</span>
            <span className="flex-1">
              <span className="block font-semibold text-amber-200 group-hover:text-amber-100">Practice weak spots</span>
              <span className="block text-xs text-amber-500/80">{weakSpots} missed {weakSpots === 1 ? 'check' : 'checks'}, weakest lesson first</span>
            </span>
            <span className="text-amber-600 group-hover:text-amber-400 text-lg">›</span>
          </Link>
        )}

        {/* lesson cards */}
        <div className="grid gap-4">
          {INTERACTIVE_LESSONS.map((l, idx) => {
            const rec = track[l.slug]
            const s = stars(rec)
            const sc = scoredCount(l)
            return (
              <motion.div key={l.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Link to={`/interactive/${l.slug}`}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-gray-900/60 border-gray-800 hover:border-violet-600 transition-colors group">
                  <div className="text-3xl w-10 shrink-0 text-center">{l.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-white group-hover:text-violet-300 transition-colors">{l.title}</h2>
                      {rec && <span className="text-xs font-mono text-gray-500">{s === 3 ? '⭐⭐⭐' : s === 2 ? '⭐⭐☆' : '⭐☆☆'}</span>}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{l.blurb}</p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-600 font-mono">
                      <span>~{l.minutes} min</span>
                      <span>{sc} scored checks</span>
                      {rec && <span className="text-emerald-600">{rec.firstTries}/{rec.scored} first-try</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-gray-600 group-hover:text-violet-400 text-lg transition-colors">›</div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* footer note */}
        <p className="mt-10 text-xs text-gray-700 text-center">
          Stars save locally in your browser. This track is separate from your main XP and course certificate.
        </p>
      </div>
    </div>
  )
}
