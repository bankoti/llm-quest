import { motion } from 'framer-motion'
import { getRank, MAX_XP, XP_RANKS } from '@/data/curriculum'

interface Props { xp: number; animated?: boolean }

export function XPBar({ xp, animated = true }: Props) {
  const rank = getRank(xp)
  const pct = Math.min(100, Math.round((xp / MAX_XP) * 100))

  // Find next rank
  const rankIdx = XP_RANKS.findIndex(r => r.minXp === rank.minXp)
  const nextRank = XP_RANKS[rankIdx + 1]
  const toNext = nextRank ? nextRank.minXp - xp : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono font-semibold" style={{ color: rank.color }}>
          {rank.title}
        </span>
        <span className="text-xs text-gray-400 font-mono">
          {xp.toLocaleString()} XP
          {nextRank && <span className="text-gray-600"> · {toNext} to {nextRank.title}</span>}
        </span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: rank.color }}
          initial={animated ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
