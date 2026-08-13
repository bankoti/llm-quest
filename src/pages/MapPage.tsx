import { SITE } from '@/config/site'
import { WorldMap } from '@/components/WorldMap/WorldMap'
import { XPBar } from '@/components/Progress/XPBar'
import { StreakBadge } from '@/components/Progress/StreakBadge'
import { getProgressSummary, ProgressState } from '@/engine/progress'
import { MAX_XP } from '@/data/curriculum'
import { isAdminMode } from '@/engine/admin'
import { AdminPanel } from '@/components/AdminPanel'

interface Props {
  progress: ProgressState
  onProgressChange: (p: ProgressState) => void
}

export function MapPage({ progress, onProgressChange }: Props) {
  const { completed, total, rank } = getProgressSummary(progress)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-6">
        <div>
          <h1 className="font-bold text-lg tracking-tight" style={{ color: '#7c3aed' }}>
            {SITE.name}
          </h1>
          <p className="text-xs text-gray-500 font-mono">{SITE.tagline}</p>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <StreakBadge days={progress.streakDays} />
          <div className="text-xs font-mono text-gray-500">
            {completed}/{total} levels
          </div>
          <div className="w-52">
            <XPBar xp={progress.totalXp} />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {isAdminMode() && <AdminPanel onProgressChange={onProgressChange} />}
        {completed === 0 && (
          <div className="mb-10 p-6 rounded-2xl border border-violet-800/40 bg-violet-950/20">
            <h2 className="text-white font-semibold text-lg mb-1">Welcome to {SITE.name}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              {total} levels. 8 courses. Build an LLM from scratch, then ship a
              production AI system. Start at Level 1 — every level unlocks the next.
            </p>
            <div className="mt-3 text-xs font-mono text-gray-500">
              Total available: {MAX_XP.toLocaleString()} XP · {rank.title} → Distinguished
            </div>
          </div>
        )}

        <WorldMap progress={progress} />
      </div>
    </div>
  )
}
