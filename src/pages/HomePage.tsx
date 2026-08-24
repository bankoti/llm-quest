import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SITE } from '@/config/site'
import { ALL_LEVELS, COURSES, MAX_XP } from '@/data/curriculum'
import { ProgressState, getProgressSummary, nextRecommendedLevel } from '@/engine/progress'
import { dueCount } from '@/engine/review'
import { WARMUPS, warmupDone } from '@/interactive/warmups'

interface Props { progress: ProgressState }

export function HomePage({ progress }: Props) {
  const navigate = useNavigate()
  const { completed, total } = getProgressSummary(progress)
  const next = nextRecommendedLevel(progress)
  const hasStarted = completed > 0
  const due = dueCount()
  const guidedHref = next ? (WARMUPS[next.id] && !warmupDone(next.id) ? `/warmup/${next.id}` : `/level/${next.id}`) : '/map'

  return <div className="min-h-screen bg-gray-950 text-white flex flex-col">
    <nav aria-label="Primary" className="flex items-center justify-between gap-4 px-5 sm:px-8 py-4 border-b border-gray-800">
      <Link to="/" className="font-bold text-violet-400 text-lg font-mono">{SITE.name}</Link>
      <div className="flex items-center gap-3 sm:gap-5">
        {due > 0 && <Link to="/review" className="text-sm font-mono text-amber-300 hover:text-amber-200">{due} due</Link>}
        <Link to="/map" className="text-sm font-mono text-gray-400 hover:text-white">{hasStarted ? `Progress ${completed}/${total}` : 'Explore map'}</Link>
      </div>
    </nav>

    <div className="flex-1 px-5 sm:px-6 py-12 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-violet-400 mb-4">From mechanism to working system</p>
          <h1 className="text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight">{SITE.tagline}</h1>
          <p className="text-gray-400 text-lg mt-6 leading-relaxed">{SITE.description}</p>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">Use any AI assistant you like. The course tests whether you can specify, inspect, and defend a working system.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => navigate(guidedHref)} className="px-7 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold">
              {next ? `${hasStarted ? 'Resume' : 'Start guided route'}: ${next.title} →` : 'View completed journey →'}
            </button>
            {due > 0 && <button onClick={() => navigate('/review')} className="px-6 py-3.5 rounded-xl border border-amber-700 text-amber-200 hover:bg-amber-950/40">Review {due} due →</button>}
          </div>
          <p className="mt-4 text-xs text-gray-600 font-mono">No signup · progress stays in this browser · {ALL_LEVELS.length} coding levels · 49 concept lessons</p>
        </div>

        <section aria-labelledby="choose-path" className="mt-16">
          <h2 id="choose-path" className="text-xl font-semibold">Choose how you want to learn</h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">The guided route alternates concepts and code. The other paths let you focus.</p>
          <div className="grid md:grid-cols-3 gap-3">
            <Link to={guidedHref} className="p-5 rounded-xl border border-violet-600 bg-violet-950/25 hover:bg-violet-950/40">
              <p className="text-xs font-mono uppercase text-violet-400">Recommended</p><h3 className="font-semibold text-lg mt-1">Guided route</h3><p className="text-sm text-gray-400 mt-2">A short concept warm-up, one graded coding challenge, then spaced review.</p>
            </Link>
            <Link to="/interactive" className="p-5 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-sky-700">
              <p className="text-xs font-mono uppercase text-sky-400">No keyboard needed</p><h3 className="font-semibold text-lg mt-1">Concept course</h3><p className="text-sm text-gray-400 mt-2">49 tap-first lessons with manipulatives, worked examples, and numeric traces.</p>
            </Link>
            <Link to="/map" className="p-5 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-emerald-700">
              <p className="text-xs font-mono uppercase text-emerald-400">Build directly</p><h3 className="font-semibold text-lg mt-1">Coding course</h3><p className="text-sm text-gray-400 mt-2">{COURSES.length} courses, {ALL_LEVELS.length} tested challenges, entirely in-browser.</p>
            </Link>
          </div>
        </section>

        <section aria-labelledby="course-map" className="mt-16">
          <div className="flex items-end justify-between"><h2 id="course-map" className="text-xl font-semibold">Course map</h2><span className="text-xs font-mono text-gray-600">{MAX_XP.toLocaleString()} XP available</span></div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {COURSES.map(c => <Link key={c.id} to={`/map#course-${c.id}`} title={c.description} className="p-3 rounded-lg border border-gray-800 bg-gray-900/40 hover:bg-gray-800/70 hover:border-gray-600"><div className="text-xs font-mono font-semibold" style={{ color: c.accent }}>Course {c.id}</div><div className="text-xs text-gray-300 mt-1">{c.shortTitle}</div></Link>)}
          </div>
        </section>
      </motion.div>
    </div>
  </div>
}
