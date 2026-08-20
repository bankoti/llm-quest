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
  // optional per-option feedback for wrong picks, index-aligned with options.
  // Falls back to `nudge` where absent. Fill these in for the most-missed
  // steps once beacon data says which those are.
  whys?: (string | undefined)[]
}

export interface PredictQuestion {
  label: string
  options: string[]
  answer: number
  reveal: string
  nudge?: string
  whys?: (string | undefined)[]
}

export interface PredictStep {
  kind: 'predict'
  prompt: string
  code?: string
  questions: PredictQuestion[]
}

// numeric-entry prediction: the learner computes the value instead of
// recognizing it in a list (generation effect). tolerance is absolute.
export interface NumericQuestion {
  label: string
  answer: number
  tolerance?: number
  unit?: string
  reveal: string
  hint?: string
}

export interface NumericStep {
  kind: 'numeric'
  prompt: string
  code?: string
  questions: NumericQuestion[]
}

// A worked example reveals one reasoning step at a time. It bridges a
// demonstration and an independent check without asking a novice to make an
// unsupported leap.
export interface WorkedStage {
  label: string
  body: string
  code?: string
}

export interface WorkedStep {
  kind: 'worked'
  title: string
  prompt: string
  stages: WorkedStage[]
  takeaway: string
  cta?: string
}

export interface WidgetProps { onDone: () => void }

export interface WidgetStep {
  kind: 'widget'
  widget: ComponentType<WidgetProps>
}

export type Step = ConceptStep | WorkedStep | McqStep | PredictStep | NumericStep | WidgetStep

export type LessonTrack = 'core' | 'extension'

export interface InteractiveLesson {
  slug: string
  title: string
  emoji: string
  blurb: string
  minutes: number
  moduleId: string
  moduleTitle: string
  prerequisites: string[]
  outcomes: string[]
  concepts: string[]
  track?: LessonTrack
  steps: Step[]
}

// Count individual scoreable questions: MCQ = 1, predict/numeric = questions.length
export const scoredCount = (l: InteractiveLesson): number =>
  l.steps.reduce((n, s) => {
    if (s.kind === 'mcq') return n + 1
    if (s.kind === 'predict') return n + s.questions.length
    if (s.kind === 'numeric') return n + s.questions.length
    return n
  }, 0)

// ── local progress for this track only ───────────────────────────────────────
// Deliberately separate from llmquest_progress_v1: the interactive track
// never touches main XP, gating, or the certificate.
// v2 intentionally starts a fresh record: the dependency-first redesign changes
// step indexes and lesson meaning, so v1 missed-step records are not safe to replay.
const KEY = 'llmquest_interactive_v2'

// sure / sureWrong: confidence calibration across a run. `sure` counts first
// commits where the learner locked in as confident; `sureWrong` the subset
// that were wrong. Best-run semantics for score; latest-run for missed/calibration.
export interface LessonRecord {
  firstTries: number
  scored: number
  completedAt: string
  missed?: number[]
  sure?: number
  sureWrong?: number
}
export type TrackState = Record<string, LessonRecord>

export function loadTrack(): TrackState {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

export function saveLesson(slug: string, rec: LessonRecord) {
  const s = loadTrack()
  const prev = s[slug]
  if (!prev) {
    // first completion
    s[slug] = rec
  } else {
    // compare rates cross-multiplied to avoid floating point: a/b > c/d iff a*d > c*b
    const newBetter = rec.firstTries * prev.scored > prev.firstTries * rec.scored
    const bestFirst = newBetter ? rec.firstTries : prev.firstTries
    const bestScored = newBetter ? rec.scored : prev.scored
    s[slug] = {
      firstTries: bestFirst,
      scored: bestScored,
      completedAt: rec.completedAt,
      // missed always reflects the latest run
      missed: rec.missed,
      // calibration from latest run (most recent signal is most relevant)
      sure: rec.sure,
      sureWrong: rec.sureWrong,
    }
  }
  localStorage.setItem(KEY, JSON.stringify(s))
}

// remove one step from a lesson's missed list (cleared in practice)
export function clearMiss(slug: string, stepIdx: number) {
  const s = loadTrack()
  const rec = s[slug]
  if (!rec?.missed) return
  rec.missed = rec.missed.filter(i => i !== stepIdx)
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function stars(rec: LessonRecord | undefined): number {
  if (!rec) return 0
  if (rec.scored === 0) return 3
  const r = rec.firstTries / rec.scored
  return r >= 0.99 ? 3 : r >= 0.6 ? 2 : 1
}

// ── streak & calendar ────────────────────────────────────────────────────────

// Returns "YYYY-MM-DD" in local time (DST-safe: uses date parts, not offsets)
export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Parse "YYYY-MM-DD" into a local-midnight Date
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Get yesterday's date string (DST-safe)
function yesterdayStr(today: string): string {
  const d = parseLocalDate(today)
  d.setDate(d.getDate() - 1)
  return toDateStr(d)
}

// Advance one day backward from a date string
function prevDayStr(s: string): string {
  const d = parseLocalDate(s)
  d.setDate(d.getDate() - 1)
  return toDateStr(d)
}

// Diff in calendar days (local-time-aware)
function dayDiff(a: string, b: string): number {
  const da = parseLocalDate(a)
  const db = parseLocalDate(b)
  return Math.round((db.getTime() - da.getTime()) / 86400000)
}

export interface StreakInfo {
  current: number     // days in a row ending today (or yesterday)
  longest: number
  activeDates: Set<string>  // all unique days a lesson was completed
}

export function computeStreak(track: TrackState): StreakInfo {
  const dates = new Set<string>()
  for (const rec of Object.values(track)) {
    if (rec.completedAt) dates.add(toDateStr(new Date(rec.completedAt)))
  }
  for (const d of loadMixDates()) dates.add(d)
  if (dates.size === 0) return { current: 0, longest: 0, activeDates: dates }

  const sorted = [...dates].sort()
  const today = toDateStr(new Date())
  const yesterday = yesterdayStr(today)

  // Longest streak
  let longest = 1, run = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = dayDiff(sorted[i - 1], sorted[i])
    run = diff === 1 ? run + 1 : 1
    if (run > longest) longest = run
  }

  // Current streak: must include today or yesterday
  let current = 0
  if (dates.has(today) || dates.has(yesterday)) {
    const anchor = dates.has(today) ? today : yesterday
    current = 1
    let check = anchor
    for (;;) {
      const prev = prevDayStr(check)
      if (dates.has(prev)) { current++; check = prev } else break
    }
  }

  return { current, longest, activeDates: dates }
}

// ── parameterized variants ────────────────────────────────────────────────────
// Picks a variant based on the current day. Same call within a calendar day
// returns the same item, so a session is stable. Different day = different variant.
// Runs at module load time — no React state needed.
export function dailyPick<T>(arr: T[]): T {
  const day = Math.floor(Date.now() / 86400000)
  return arr[day % arr.length]
}

// ── daily mix ─────────────────────────────────────────────────────────────────
// A 2-minute interleaved retrieval session across completed lessons.
// Completing it counts toward the streak (merged in computeStreak).
const MIX_KEY = 'llmquest_mix_v2'

export function loadMixDates(): string[] {
  try { return JSON.parse(localStorage.getItem(MIX_KEY) ?? '[]') } catch { return [] }
}

export function recordMixDay(): void {
  const today = toDateStr(new Date())
  const dates = loadMixDates()
  if (!dates.includes(today)) {
    dates.push(today)
    localStorage.setItem(MIX_KEY, JSON.stringify(dates))
  }
}

export function mixDoneToday(): boolean {
  return loadMixDates().includes(toDateStr(new Date()))
}

// deterministic PRNG so the day's mix is stable across reloads
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── practice spacing metadata ─────────────────────────────────────────────────
// Per-item spacing for weak-spot practice: tracks when each item was last
// practiced and when it is next due. Oldest/due-first ordering in PracticePage.
const SPACING_KEY = 'llmquest_practice_spacing_v1'

export interface SpacingEntry {
  lastPracticed: string
  due: string
  intervalDays: number
}

export type SpacingState = Record<string, SpacingEntry> // key: "slug:stepIdx"

export function loadSpacing(): SpacingState {
  try { return JSON.parse(localStorage.getItem(SPACING_KEY) ?? '{}') } catch { return {} }
}

export function saveSpacing(state: SpacingState): void {
  localStorage.setItem(SPACING_KEY, JSON.stringify(state))
}

// Record a practice event. Interval doubles on each successive correct answer.
// key = "lessonSlug:stepIdx"
export function recordPractice(key: string, correct: boolean): void {
  const state = loadSpacing()
  const now = new Date().toISOString()
  const prev = state[key]
  if (correct) {
    // interval: first success = 1 day, then doubles (1, 2, 4, 8...)
    const nextInterval = prev ? Math.min(60, Math.max(1, (prev.intervalDays ?? 1) * 2)) : 1
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + nextInterval)
    state[key] = { lastPracticed: now, due: dueDate.toISOString(), intervalDays: nextInterval }
  } else {
    state[key] = { lastPracticed: now, due: now, intervalDays: 0 }
  }
  saveSpacing(state)
}

// Sort key for practice items: due items first (oldest due), then by lastPracticed (oldest first)
export function spacingSortKey(key: string): number {
  const state = loadSpacing()
  const entry = state[key]
  if (!entry) return 0 // never practiced = highest priority (epoch 0)
  return new Date(entry.due).getTime()
}
