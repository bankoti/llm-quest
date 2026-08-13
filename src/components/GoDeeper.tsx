/**
 * GoDeeper — shown below the Arena for C1-C3 levels.
 * The browser challenges run pure numpy; the full PyTorch workbooks
 * require a GPU environment — Codespaces gives them one click away.
 */

const COURSE_DIRS: Record<number, string> = {
  1: 'courses/01_foundations',
  2: 'courses/02_modern_decoder',
  3: 'courses/03_architecture_atlas',
}

const REPO = 'bankoti/llm-from-first-principles'

interface Props {
  courseId: number
  challengeFile: string  // e.g. "c1/06_attention.py"
}

export function GoDeeper({ courseId, challengeFile }: Props) {
  const dir = COURSE_DIRS[courseId]
  if (!dir) return null

  // e.g. "c1/06_attention.py" → "06_attention.py"
  const fileName = challengeFile.split('/').pop() ?? ''
  const labPath = `${dir}/labs/${fileName}`
  const codespacesUrl = `https://codespaces.new/${REPO}?quickstart=1`
  const fileViewUrl = `https://github.com/${REPO}/blob/main/${labPath}`

  return (
    <div className="mt-3 rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3 flex items-start gap-3">
      <span className="text-lg mt-0.5 shrink-0">🚀</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-300 mb-0.5">Go Deeper — Full PyTorch Workbook</p>
        <p className="text-xs text-gray-500 leading-relaxed mb-2">
          The browser version uses numpy. The original lab uses PyTorch with real
          tensors and GPU back-ends. Clone the repo or open it in a Codespace for
          the full experience.
        </p>
        <div className="flex gap-2 flex-wrap">
          <a
            href={codespacesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
            Open in Codespace
          </a>
          <a
            href={fileViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-xs font-mono transition-colors"
          >
            View lab on GitHub →
          </a>
        </div>
      </div>
    </div>
  )
}
