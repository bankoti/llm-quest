// Interactive-track hub: /interactive
// Shows all 8 lessons with star rating from local progress.
// No dependency on main progress or curriculum.ts.
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { INTERACTIVE_LESSONS } from './lessons'
import { loadTrack, stars, scoredCount } from './types'

const TOTAL = INTERACTIVE_LESSONS.length

export function InteractiveHubPage() {
  const [track, setTrack] = useState(loadTrack)
  useEffect(() => { setTrack(loadTrack()) }, [])

  const completed = INTERACTIVE_LESSONS.filter(l => track[l.slug]).length
  const totalStars = INTERACTIVE_LESSONS.reduce((n, l) => n + stars(track[l.slug]), 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">

        {/* header */}
        <div className="flex items-center gap-4 mb-2">
          <Link to="/map" className="text-gray-500 hover:text-gray-300 text-sm">← Map</Link>
        </div>
        <h1 className="text-3xl font-bold mb-1">Interactive Track</h1>
        <p className="text-gray-400 mb-2">Tap-first lessons. No code, no typing — just intuition.</p>
        <div className="flex items-center gap-4 mb-8 text-sm font-mono text-gray-500">
          <span>{completed}/{TOTAL} lessons done</span>
          <span>{'⭐'.repeat(Math.min(totalStars, 6))} {totalStars}/{TOTAL * 3} stars</span>
        </div>

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
