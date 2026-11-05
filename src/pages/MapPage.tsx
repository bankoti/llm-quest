import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SITE } from '@/config/site'
import { WorldMap } from '@/components/WorldMap/WorldMap'
import { XPBar } from '@/components/Progress/XPBar'
import { StreakBadge } from '@/components/Progress/StreakBadge'
import { getProgressSummary, nextRecommendedLevel, ProgressState } from '@/engine/progress'
import { ALL_LEVELS, COURSES, MAX_XP } from '@/data/curriculum'
import { isAdminMode } from '@/engine/admin'
import { AdminPanel } from '@/components/AdminPanel'
import { LearningAccessSetting } from '@/components/LearningAccessSetting'
import { dueCount } from '@/engine/review'
import { WARMUPS, warmupDone } from '@/interactive/warmups'

interface Props { progress: ProgressState; onProgressChange: (p: ProgressState) => void }
export function MapPage({ progress, onProgressChange }: Props) {
  const [due] = useState(dueCount)
  const { hash } = useLocation()
  useEffect(() => { if (hash) requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ behavior:'smooth', block:'start' })) }, [hash])
  const { completed, total, rank } = getProgressSummary(progress)
  const next = nextRecommendedLevel(progress)
  const resumeHref = next ? (WARMUPS[next.id] && !warmupDone(next.id) ? `/warmup/${next.id}` : `/level/${next.id}`) : '/cert'

  return <div className="min-h-screen bg-gray-950 text-white">
    <header className="border-b border-gray-800 px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3 sm:gap-5">
        <Link to="/" className="mr-auto"><h1 className="font-bold text-lg text-violet-500">{SITE.name}</h1><p className="hidden sm:block text-xs text-gray-500 font-mono">{SITE.tagline}</p></Link>
        <nav aria-label="Learning tools" className="flex flex-wrap items-center gap-2">
          <Link to="/interactive" className="nav-chip text-violet-300 border-violet-800">Concepts</Link>
          <Link to="/reference" className="nav-chip">Syntax</Link>
          <Link to="/review" className="nav-chip relative">Review{due>0&&<span className="ml-1 text-amber-300">{due}</span>}</Link>
          <Link to="/cert" className="nav-chip">Transcript</Link>
        </nav>
        <div className="hidden lg:flex items-center gap-3"><StreakBadge days={progress.streakDays}/><span className="text-xs font-mono text-gray-500">{completed}/{total}</span><div className="w-48"><XPBar xp={progress.totalXp}/></div></div>
      </div>
    </header>

    <div className="max-w-4xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
      {isAdminMode() && <AdminPanel onProgressChange={onProgressChange}/>} 
      <div className="mb-5 border-b border-gray-800"><LearningAccessSetting /></div>
      {next ? <Link to={resumeHref} className="block mb-8 p-5 rounded-xl border border-violet-700 bg-violet-950/25 hover:bg-violet-950/40"><p className="text-xs font-mono uppercase text-violet-400">Recommended next</p><h2 className="text-lg font-semibold mt-1">{next.title} →</h2><p className="text-sm text-gray-400 mt-1">{WARMUPS[next.id] ? 'Start with a standalone 3–5 minute concept warm-up, then apply it in code.' : next.description}</p></Link>
      : <Link to="/cert" className="block mb-8 p-5 rounded-xl border border-emerald-700 bg-emerald-950/20"><h2 className="font-semibold">Coding journey complete →</h2><p className="text-sm text-gray-400 mt-1">View your specializations, transcript, and completion card.</p></Link>}

      <section className="mb-8 border-b border-gray-800 pb-5"><h2 className="font-semibold">Choose a continuation</h2><p className="text-gray-400 text-sm mt-1">Courses 1–3 lead to Production Engineering (4–8) and Frontier Training (9). After Course 1, continue into hands-on model training (10) or learning dynamics (11). Policy learning (12) builds on 10; embodied AI (13) is optional. Existing certificates retain their original requirements.</p><nav aria-label="Continuation tracks" className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm">{COURSES.filter(c=>c.id>=10).map(c=><Link key={c.id} to={`#course-${c.id}`} className="text-emerald-300 underline">{c.shortTitle}</Link>)}</nav><p className="mt-3 text-xs font-mono text-gray-600">{COURSES.length} courses · {ALL_LEVELS.length} coding levels · {MAX_XP.toLocaleString()} XP · current rank {rank.title}</p></section>
      <WorldMap progress={progress} recommendedId={next?.id}/>
    </div>
  </div>
}
