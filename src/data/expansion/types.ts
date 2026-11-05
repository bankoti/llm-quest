export interface LearningUnit {
  key: string
  title: string
  summary: string
  prerequisites: string[]
  outcomes: string[]
  concepts: string[]
  sections: { title: string; lines: string[] }[]
  worked: { title: string; prompt: string; stages: { label: string; body: string }[]; takeaway: string }
  numeric: { prompt: string; questions: { label: string; answer: number; tolerance?: number; reveal: string }[] }
  questions: { prompt: string; options: string[]; answer: number; explain: string; nudge: string }[]
  hints: [string, string, string]
  source: string
  sourceTitle: string
  references?: { title: string; url: string }[]
  experiment: string
  interpretation: string[]
  transfer: string[]
  widget?: string
}

export interface LearningTrack {
  id: number
  slug: string
  title: string
  shortTitle: string
  prerequisite: number
  color: string
  accent: string
  description: string
  outcomes: string[]
  units: LearningUnit[]
}
