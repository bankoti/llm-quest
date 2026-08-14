import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props { lessonFile: string }

export function LessonPanel({ lessonFile }: Props) {
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
    <div className="prose prose-invert prose-sm max-w-none h-full overflow-y-auto px-6 py-5
                    prose-headings:font-semibold prose-headings:text-white
                    prose-code:text-violet-300 prose-code:bg-violet-950/40 prose-code:px-1 prose-code:rounded
                    prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800
                    prose-a:text-violet-400 prose-strong:text-white
                    scrollbar-thin">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
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
        }}
      >{md}</ReactMarkdown>
    </div>
  )
}
