interface Props { days: number }

export function StreakBadge({ days }: Props) {
  if (days < 1) return null
  return (
    <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 rounded-full px-3 py-1">
      <span className="text-orange-400 text-sm">🔥</span>
      <span className="text-xs font-mono text-orange-300 font-semibold">
        {days} day{days !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
