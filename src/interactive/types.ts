// Interactive track: step schema for Brilliant-style lessons.
// A lesson is a linear array of steps; the player renders one per screen.
// 'mcq' and 'predict' steps are scored (first-try counts toward stars).
import type { ComponentType } from 'react'

export interface ConceptStep {
  kind: 'concept'
  title: string
  lines: string[]
  code?: string
  cta?: string
}

export interface McqStep {
  kind: 'mcq'
  prompt: string
  code?: string
  options: string[]
  answer: number
  explain: string
  nudge: string
}

export interface PredictQuestion {
  label: string
  options: string[]
  answer: number
  reveal: string
}

export interface PredictStep {
  kind: 'predict'
  prompt: string
  code?: string
  questions: PredictQuestion[]
}

export interface WidgetProps { onDone: () => void }

export interface WidgetStep {
  kind: 'widget'
  widget: ComponentType<WidgetProps>
}

export type Step = ConceptStep | McqStep | PredictStep | WidgetStep

export interface InteractiveLesson {
  slug: string
  title: string
  emoji: string
  blurb: string
  minutes: number
  steps: Step[]
}

export const scoredCount = (l: InteractiveLesson) =>
  l.steps.filter(s => s.kind === 'mcq' || s.kind === 'predict').length

// ── local progress for this track only ───────────────────────────────────────
// Deliberately separate from llmquest_progress_v1: the interactive track
// never touches main XP, gating, or the certificate.
const KEY = 'llmquest_interactive_v1'

export interface LessonRecord { firstTries: number; scored: number; completedAt: string }
export type TrackState = Record<string, LessonRecord>

export function loadTrack(): TrackState {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

export function saveLesson(slug: string, rec: LessonRecord) {
  const s = loadTrack()
  const prev = s[slug]
  // keep the best score across replays
  if (!prev || rec.firstTries > prev.firstTries) s[slug] = rec
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function stars(rec: LessonRecord | undefined): number {
  if (!rec) return 0
  if (rec.scored === 0) return 3
  const r = rec.firstTries / rec.scored
  return r >= 0.99 ? 3 : r >= 0.6 ? 2 : 1
}
