import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SITE } from '@/config/site'
import { COURSES, MAX_XP } from '@/data/curriculum'
import { ProgressState, getProgressSummary } from '@/engine/progress'

interface Props { progress: ProgressState }

export function HomePage({ progress }: Props) {
  const navigate = useNavigate()
  const { completed, total } = getProgressSummary(progress)
  const hasStarted = completed > 0

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <span className="font-bold text-violet-400 text-lg font-mono">{SITE.name}</span>
        <button
          onClick={() => navigate('/map')}
          className="text-sm font-mono text-gray-400 hover:text-white transition-colors"
        >
          {hasStarted ? `Resume (${completed}/${total})` : 'Start Learning →'}
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-6">⚡</div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {SITE.tagline}
          </h1>
          <p className="text-gray-400 text-lg mb-2 leading-relaxed">
            {SITE.description}
          </p>
          <p className="text-gray-500 text-sm mb-2 leading-relaxed max-w-xl mx-auto">
            AI-friendly by design: use Claude, ChatGPT, whatever you like.
            The graders only check that your system works — the skill you build
            here is knowing <em>what to ask for</em> and whether the answer is right.
          </p>
          <p className="text-gray-600 text-sm mb-10 font-mono">
            {MAX_XP.toLocaleString()} XP · {total} levels · runs entirely in your browser
          </p>

          <motion.button
            onClick={() => navigate('/map')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-4 rounded-xl text-lg font-semibold font-mono
                       bg-violet-600 hover:bg-violet-500 text-white transition-colors
                       shadow-lg shadow-violet-900/40"
          >
            {hasStarted ? `Continue (Level ${completed + 1})` : 'Start for Free'}
          </motion.button>

          <p className="mt-4 text-xs text-gray-600 font-mono">
            No signup. Progress saved locally.
          </p>
        </motion.div>

        {/* Course grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full"
        >
          {COURSES.map(c => (
            <div
              key={c.id}
              className="p-3 rounded-lg border border-gray-800 bg-gray-900/50 text-left"
            >
              <div
                className="text-xs font-mono font-semibold mb-1"
                style={{ color: c.accent }}
              >
                Course {c.id}
              </div>
              <div className="text-xs text-gray-300 leading-snug">{c.shortTitle}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
