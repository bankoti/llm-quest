import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Non-graded syntax reference. Learners keep it open in a second tab so
// PyTorch/numpy notation never blocks a concept mid-lesson.
export function ReferencePage() {
  const navigate = useNavigate()
  const [md, setMd] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}content/reference/tensor_syntax.md`)
      .then(r => (r.ok ? r.text() : Promise.reject(r.status)))
      .then(setMd)
      .catch(() => setMd('_Reference not found._'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-6">
        <button
          onClick={() => navigate('/map')}
          className="text-gray-500 hover:text-white transition-colors text-sm font-mono"
        >
          ← Map
        </button>
        <h1 className="font-bold text-lg" style={{ color: '#7c3aed' }}>Syntax Reference</h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {md === null ? (
          <div className="text-gray-600 font-mono text-sm">Loading…</div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none
                          prose-headings:font-semibold prose-headings:text-white
                          prose-code:text-violet-300 prose-code:bg-violet-950/40 prose-code:px-1 prose-code:rounded
                          prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800
                          prose-a:text-violet-400 prose-strong:text-white
                          prose-table:text-gray-300 prose-th:text-white">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
