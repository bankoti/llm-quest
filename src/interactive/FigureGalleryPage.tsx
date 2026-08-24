// Dev gallery: renders every figure in the registry with its key, so all
// figures (including post-reveal quiz figures) can be reviewed or
// screenshot-verified on one page without playing lessons. Route: /figures
import { FIGURES } from './figures'

export function FigureGalleryPage() {
  const names = Object.keys(FIGURES).sort()
  return (
    <div className="min-h-screen bg-gray-950 px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Figure gallery</h1>
        <p className="text-sm text-gray-500 mb-8">{names.length} figures in the registry</p>
        {names.map(n => {
          const F = FIGURES[n]
          return (
            <div key={n} data-fig={n} className="mb-8">
              <p className="text-xs font-mono text-violet-400 mb-2">{n}</p>
              <div className="px-3 py-2 rounded-xl bg-gray-900/70 border border-gray-800"><F /></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
