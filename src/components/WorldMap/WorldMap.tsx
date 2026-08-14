import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { COURSES, ALL_LEVELS } from '@/data/curriculum'
import { ProgressState } from '@/engine/progress'
import { isAdminMode } from '@/engine/admin'
import clsx from 'clsx'

interface Props { progress: ProgressState }

export function WorldMap({ progress }: Props) {
  const navigate = useNavigate()
  const admin = isAdminMode()

  return (
    <div className="flex flex-col gap-8 pb-16">
      {COURSES.map((course, ci) => {
        const completedInCourse = course.levels.filter(
          l => progress.levels[l.id]?.status === 'complete'
        ).length
        const allComplete = completedInCourse === course.levels.length

        return (
          <motion.div
            key={course.id}
            id={`course-${course.id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.06 }}
          >
            {/* Course header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-2 h-10 rounded-full"
                style={{ background: course.accent }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                    Course {course.id}
                  </span>
                  {allComplete && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                      Complete
                    </span>
                  )}
                </div>
                <h2 className="text-white font-semibold text-base">{course.title}</h2>
              </div>
              <div className="ml-auto text-xs font-mono text-gray-500">
                {completedInCourse}/{course.levels.length}
              </div>
            </div>

            {/* What this course is about */}
            <div className="pl-5 mb-4 max-w-2xl">
              <p className="text-sm text-gray-400 leading-relaxed">{course.description}</p>
              <details className="mt-1.5">
                <summary
                  className="text-xs font-mono cursor-pointer select-none text-gray-500 hover:text-gray-300 transition-colors"
                >
                  What you&apos;ll be able to do
                </summary>
                <ul className="mt-1.5 space-y-1">
                  {course.outcomes.map(o => (
                    <li key={o} className="text-xs text-gray-400 flex gap-2 leading-relaxed">
                      <span className="font-mono" style={{ color: course.accent }}>+</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>

            {/* Level nodes */}
            <div className="flex items-center gap-2 flex-wrap pl-5">
              {course.levels.map((level, li) => {
                const state = progress.levels[level.id]
                const status = state?.status ?? 'locked'
                const isLocked = status === 'locked' && !admin
                const isComplete = status === 'complete'
                const isBoss = level.type === 'boss'
                const isDebug = level.type === 'debug'

                return (
                  <div key={level.id} className="flex items-center gap-2">
                    {/* Connector line */}
                    {li > 0 && (
                      <div
                        className="h-px w-4"
                        style={{
                          background: isLocked ? '#374151' : course.accent,
                          opacity: isLocked ? 0.4 : 0.6,
                        }}
                      />
                    )}

                    {/* Level node */}
                    <motion.button
                      onClick={() => !isLocked && navigate(`/level/${level.id}`)}
                      whileHover={!isLocked ? { scale: 1.08 } : {}}
                      whileTap={!isLocked ? { scale: 0.95 } : {}}
                      className={clsx(
                        'relative flex items-center justify-center rounded-full font-mono font-bold text-sm transition-colors',
                        isBoss ? 'w-14 h-14 text-base' : 'w-10 h-10',
                        isLocked && 'cursor-not-allowed opacity-40',
                        !isLocked && !isComplete && 'cursor-pointer ring-2 ring-offset-2 ring-offset-gray-950',
                        isComplete && 'cursor-pointer',
                      )}
                      style={{
                        background: isComplete
                          ? course.accent
                          : isLocked
                            ? '#1f2937'
                            : `${course.accent}22`,
                        border: `2px solid ${isLocked ? '#374151' : course.accent}`,
                        boxShadow: !isLocked && !isComplete
                          ? `0 0 16px ${course.accent}55`
                          : isComplete
                            ? `0 0 12px ${course.accent}88`
                            : 'none',
                      }}
                      title={level.title}
                    >
                      {isComplete ? (
                        <span className="text-white">✓</span>
                      ) : isLocked ? (
                        <span className="text-gray-600">🔒</span>
                      ) : isBoss ? (
                        <span>⚔️</span>
                      ) : isDebug ? (
                        <span title="Debug level">🐛</span>
                      ) : (
                        <span style={{ color: course.accent }}>{li + 1}</span>
                      )}

                      {/* Boss crown */}
                      {isBoss && !isLocked && !isComplete && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs">👑</span>
                      )}
                    </motion.button>

                    {/* Tooltip label — show on last node or boss */}
                    {(isBoss || li === 0) && (
                      <span
                        className={clsx(
                          'text-xs font-mono hidden sm:block max-w-[120px] truncate',
                          isLocked ? 'text-gray-600' : 'text-gray-400',
                        )}
                      >
                        {level.title}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
