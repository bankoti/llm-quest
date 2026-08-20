// Dependency-first interactive curriculum hub.
// Lessons remain directly reachable, but the hub makes the recommended path,
// prerequisites, and extension boundary explicit.
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { INTERACTIVE_LESSONS, MODULES, unmetPrerequisites } from './curriculum'
import { loadTrack, stars, scoredCount, computeStreak, mixDoneToday } from './types'

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
        {weeks.map((week, wi) => <div key={wi} className="flex flex-col gap-1">
          {week.map(d => <div key={d.date} title={d.date} className={`w-4 h-4 rounded-sm ${d.active ? 'bg-violet-500' : 'bg-gray-800'}`} />)}
        </div>)}
      </div>
    </div>
  )
}

export function InteractiveHubPage() {
  const [track, setTrack] = useState(loadTrack)
  useEffect(() => { setTrack(loadTrack()) }, [])

  const completedSlugs = new Set(Object.keys(track).filter(slug => track[slug]?.completedAt))
  const completed = completedSlugs.size
  const totalStars = INTERACTIVE_LESSONS.reduce((n, l) => n + stars(track[l.slug]), 0)
  const weakSpots = INTERACTIVE_LESSONS.reduce((n, l) => n + (track[l.slug]?.missed?.length ?? 0), 0)
  const streak = computeStreak(track)
  const next = INTERACTIVE_LESSONS.find(l => !completedSlugs.has(l.slug) && unmetPrerequisites(l.slug, completedSlugs).length === 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white px-5 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-2"><Link to="/map" className="text-gray-500 hover:text-gray-300 text-sm">← Map</Link></div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-violet-400 mb-2">Build the mental model, one dependency at a time</p>
        <h1 className="text-3xl font-bold mb-2">Interactive Course</h1>
        <p className="text-gray-400 mb-4 max-w-2xl">Start with ordinary numbers and text. Each lesson introduces one small mechanism, works through it, then asks you to use it. No ML background assumed.</p><p className="text-sm text-sky-300/80 mb-4">Concept-course stars and practice are separate from coding XP and certificates. Use the Guided Route from the home page when you want them connected.</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 text-sm font-mono text-gray-500">
          <span>{completed}/{INTERACTIVE_LESSONS.length} lessons</span>
          <span>{totalStars}/{INTERACTIVE_LESSONS.length * 3} stars</span>
          {streak.current > 0 && <span className="text-orange-400">🔥 {streak.current}-day streak</span>}
          {streak.longest > 1 && streak.current < streak.longest && <span>best: {streak.longest}</span>}
        </div>

        {completed > 0 && <StreakCalendar activeDates={streak.activeDates} />}

        {next && (
          <Link to={`/interactive/${next.slug}`} className="block p-5 mb-5 rounded-xl bg-violet-700/20 border border-violet-600 hover:bg-violet-700/30">
            <span className="block text-xs font-mono uppercase tracking-wider text-violet-400 mb-1">Recommended next</span>
            <span className="text-lg font-semibold text-violet-100">{next.emoji} {next.title} →</span>
            <span className="block text-sm text-gray-400 mt-1">{next.blurb}</span>
          </Link>
        )}

        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {completed > 0 && <Link to="/interactive/mix" className="flex items-center gap-3 p-4 rounded-xl border bg-sky-950/30 border-sky-800/60 hover:border-sky-500 group">
            <span className="text-2xl">🥣</span><span className="flex-1"><span className="block font-semibold text-sky-200">Daily mix</span><span className="block text-xs text-sky-500/80">{mixDoneToday() ? 'done today ✓' : 'interleaved recall across completed lessons'}</span></span><span className="text-sky-500">›</span>
          </Link>}
          {weakSpots > 0 && <Link to="/interactive/practice" className="flex items-center gap-3 p-4 rounded-xl border bg-amber-950/30 border-amber-800/60 hover:border-amber-500 group">
            <span className="text-2xl">🎯</span><span className="flex-1"><span className="block font-semibold text-amber-200">Practice weak spots</span><span className="block text-xs text-amber-500/80">{weakSpots} missed {weakSpots === 1 ? 'check' : 'checks'}</span></span><span className="text-amber-500">›</span>
          </Link>}
        </div>

        <div className="space-y-10">
          {MODULES.map((module, moduleIdx) => {
            const lessons = INTERACTIVE_LESSONS.filter(l => l.moduleId === module.id)
            const moduleDone = lessons.filter(l => completedSlugs.has(l.slug)).length
            return <section key={module.id}>
              <div className="flex items-end justify-between gap-3 mb-3 border-b border-gray-800 pb-2">
                <div><p className="text-[10px] font-mono uppercase tracking-widest text-gray-600">Module {moduleIdx + 1}</p><h2 className="text-xl font-semibold">{module.title}</h2></div>
                <span className="text-xs font-mono text-gray-500">{moduleDone}/{lessons.length}</span>
              </div>
              <div className="grid gap-3">
                {lessons.map((lesson, idx) => {
                  const rec = track[lesson.slug]
                  const missing = unmetPrerequisites(lesson.slug, completedSlugs)
                  const ready = missing.length === 0
                  const prereqNames = missing.map(s => INTERACTIVE_LESSONS.find(l => l.slug === s)?.title ?? s)
                  return <motion.div key={lesson.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.025, 0.15) }}>
                    <Link to={`/interactive/${lesson.slug}`} className={`flex gap-4 p-4 rounded-xl border transition-colors ${ready ? 'bg-gray-900/60 border-gray-800 hover:border-violet-600' : 'bg-gray-950 border-gray-900 hover:border-gray-700'}`}>
                      <div className={`text-2xl w-9 text-center ${ready ? '' : 'grayscale opacity-50'}`}>{lesson.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><h3 className={`font-semibold ${ready ? 'text-white' : 'text-gray-500'}`}>{lesson.title}</h3>{rec && <span className="text-xs">{'⭐'.repeat(stars(rec))}{'☆'.repeat(3 - stars(rec))}</span>}{lesson.track === 'extension' && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">extension</span>}</div>
                        <p className="text-sm text-gray-400 mt-0.5">{lesson.blurb}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs font-mono text-gray-600"><span>~{lesson.minutes} min</span><span>{scoredCount(lesson)} checks</span><span>{lesson.outcomes.length} outcomes</span></div>
                        {!ready && <p className="text-xs text-amber-700 mt-2">Build first: {prereqNames.join(', ')}</p>}
                      </div>
                      <span className="text-gray-600 self-center">›</span>
                    </Link>
                  </motion.div>
                })}
              </div>
            </section>
          })}
        </div>

        <p className="mt-12 text-xs text-gray-700 text-center">Progress saves in this browser. Extension lessons are optional; core lessons build the complete prerequisite path.</p>
      </div>
    </div>
  )
}
