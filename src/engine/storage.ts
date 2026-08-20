const EXACT_KEYS = [
  'llmquest_progress_v1', 'llmquest_review_v1', 'llmquest_interactive_v2',
  'llmquest_interactive_v3', 'llmquest_practice_spacing_v1', 'llmquest_mix_v2', 'llmquest_warmups_v1', 'llmquest_name', 'llmquest_split_v1', 'llmquest_split_v1:collapsed',
]
const PREFIXES = ['llmquest_code_v1:']

export function exportLearningData(): Record<string, string> {
  const out: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (EXACT_KEYS.includes(key) || PREFIXES.some(p => key.startsWith(p)))) {
      const value = localStorage.getItem(key)
      if (value !== null) out[key] = value
    }
  }
  return out
}

export function downloadLearningData(): void {
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data: exportLearningData() }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'zeroone-progress.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function resetAllLearningData(): void {
  for (const key of EXACT_KEYS) localStorage.removeItem(key)
  const dynamic: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && PREFIXES.some(p => key.startsWith(p))) dynamic.push(key)
  }
  for (const key of dynamic) localStorage.removeItem(key)
}
