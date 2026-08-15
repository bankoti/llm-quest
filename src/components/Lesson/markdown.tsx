import type { Components } from 'react-markdown'

/**
 * Shared markdown look for lesson-style pages (LessonPanel, ReferencePage).
 * Detailed element styling lives in index.css under `.lesson-prose`, driven
 * by the `--accent` CSS variable so each course tints its own lessons.
 */
export const PROSE_CLASSES = `lesson-prose prose prose-invert prose-sm max-w-none
  prose-headings:font-semibold
  prose-code:text-violet-300 prose-code:bg-violet-950/40 prose-code:px-1 prose-code:rounded
  prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800
  prose-table:text-gray-300 prose-th:text-white`

type CalloutKind = 'note' | 'tip' | 'warning'

/**
 * Callout convention: a blockquote whose first bold word names its kind.
 *   > **Note:** ...      blue
 *   > **Tip:** ...       green
 *   > **Gotcha:** ...    amber (also Warning/Careful)
 * Reads naturally in raw markdown; no custom syntax to learn.
 */
function calloutKind(node: unknown): CalloutKind {
  try {
    const n = node as { children: Array<{ tagName?: string; children?: Array<{ tagName?: string; children?: Array<{ value?: string }> }> }> }
    const p = n.children.find(c => c.tagName === 'p')
    const strong = p?.children?.find(c => c.tagName === 'strong')
    const text = (strong?.children?.[0]?.value ?? '').toLowerCase()
    if (text.startsWith('tip')) return 'tip'
    if (text.startsWith('gotcha') || text.startsWith('warning') || text.startsWith('careful')) return 'warning'
  } catch { /* fall through to default */ }
  return 'note'
}

export const markdownComponents: Components = {
  // Lesson markdown references images as 'content/images/...'; prefix the
  // deploy base so they resolve on GitHub Pages subpaths too.
  img: ({ src, alt }) => (
    <img
      src={src && !/^(https?:)?\/\//.test(src) ? `${import.meta.env.BASE_URL}${src}` : src}
      alt={alt ?? ''}
      loading="lazy"
      className="rounded-lg border border-gray-800 bg-gray-900/60 my-4 w-full max-w-2xl"
    />
  ),
  blockquote: ({ node, children }) => (
    <blockquote className={`callout callout-${calloutKind(node)}`}>{children}</blockquote>
  ),
}
