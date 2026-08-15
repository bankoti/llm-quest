import { useEffect, useState, type CSSProperties } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PROSE_CLASSES, markdownComponents } from './markdown'

interface Props {
  lessonFile: string
  /** Course accent color; tints headings, list markers, and default callouts. */
  accent?: string
}

export function LessonPanel({ lessonFile, accent }: Props) {
  const [md, setMd] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}content/lessons/${lessonFile}`)
      .then(r => r.ok ? r.text() : Promise.reject(r.status))
      .then(setMd)
      .catch(() => setMd('_Lesson not found._'))
  }, [lessonFile])

  if (md === null) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 font-mono text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div
      className={`${PROSE_CLASSES} h-full overflow-y-auto px-6 py-5 scrollbar-thin`}
      style={accent ? ({ '--accent': accent } as CSSProperties) : undefined}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {md}
      </ReactMarkdown>
    </div>
  )
}
