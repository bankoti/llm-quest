import { useState } from 'react'
import { PAPER_LABS } from '@/data/paperLabs'

export function WorkedSolution({ challengeFile }: { challengeFile: string }) {
  const lab = PAPER_LABS[challengeFile]
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState(false)
  if (!lab) return null
  async function reveal() {
    setOpen(true)
    setError(false)
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}content/solutions/${challengeFile}`)
      if (!response.ok) throw new Error('missing solution')
      setCode(await response.text())
    } catch { setError(true) }
  }
  return <section className="mt-4 border-t border-gray-700 pt-4 text-sm">
    <div className="flex gap-4 flex-wrap">
      <button className="text-sky-300 underline" onClick={() => open ? setOpen(false) : reveal()}>{open ? 'Hide worked solution' : 'Show worked solution'}</button>
      <a href={lab.paper} target="_blank" rel="noopener noreferrer" className="text-gray-300 underline">Original paper</a>
    </div>
    {open && <div className="mt-3">
      <p className="text-gray-300 mb-3">{lab.explanation}</p>
      {error ? <button onClick={reveal} className="text-amber-300 underline">Solution unavailable. Retry</button> : <pre className="text-xs bg-gray-900 p-3 rounded overflow-x-auto max-h-96">{code ?? 'Loading solution...'}</pre>}
    </div>}
  </section>
}
