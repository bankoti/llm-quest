// Progress state stored locally. Course prerequisites form a graph: after C3,
// learners may continue into production engineering (C4-C8) or frontier
// training (C9). Course 0 is an always-open optional toolkit.
import { beacon } from './beacon'
import {
  ALL_LEVELS, COURSES, FRONTIER_LEVELS, GATED_LEVELS, PRODUCTION_LEVELS,
  getCourse, getLevel, getRank,
} from '@/data/curriculum'

export interface LevelState {
  status: 'locked' | 'unlocked' | 'complete'
  xpEarned: number
  completedAt?: number
  attempts: number
}

export interface ProgressState {
  levels: Record<string, LevelState>
  totalXp: number
  streakDays: number
  lastActiveDate: string
}

const KEY = 'llmquest_progress_v1'

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isComplete(state: ProgressState, levelId: string): boolean {
  return state.levels[levelId]?.status === 'complete'
}

export function isCourseComplete(state: ProgressState, courseId: number): boolean {
  const course = COURSES.find(c => c.id === courseId)
  return Boolean(course && course.levels.every(l => isComplete(state, l.id)))
}

export function isCourseAvailable(state: ProgressState, courseId: number): boolean {
  const course = COURSES.find(c => c.id === courseId)
  if (!course) return false
  return course.id === 0 || course.prerequisite === null || isCourseComplete(state, course.prerequisite)
}

// Unlock only the next incomplete level in every currently available course.
// Existing explicit grants/admin unlocks are preserved because this only opens,
// never re-locks, records.
function unlockEligible(state: ProgressState): ProgressState {
  for (const course of COURSES) {
    if (course.id === 0) {
      for (const level of course.levels) {
        if (state.levels[level.id]?.status === 'locked') state.levels[level.id].status = 'unlocked'
      }
      continue
    }
    if (!isCourseAvailable(state, course.id)) continue
    const next = course.levels.find(l => !isComplete(state, l.id))
    if (next && state.levels[next.id]?.status === 'locked') state.levels[next.id].status = 'unlocked'
  }
  return state
}

function defaultState(): ProgressState {
  const levels: Record<string, LevelState> = {}
  for (const level of ALL_LEVELS) {
    levels[level.id] = { status: level.courseId === 0 ? 'unlocked' : 'locked', xpEarned: 0, attempts: 0 }
  }
  return unlockEligible({ levels, totalXp: 0, streakDays: 0, lastActiveDate: '' })
}

function migrate(state: ProgressState): ProgressState {
  state.levels ??= {}
  state.totalXp ??= 0
  state.streakDays ??= 0
  state.lastActiveDate ??= ''
  for (const level of ALL_LEVELS) {
    state.levels[level.id] ??= { status: level.courseId === 0 ? 'unlocked' : 'locked', xpEarned: 0, attempts: 0 }
  }
  return unlockEligible(state)
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return migrate(JSON.parse(raw) as ProgressState)
  } catch {}
  return defaultState()
}

export function saveProgress(state: ProgressState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function touchStreak(state: ProgressState): void {
  const today = localDateKey()
  if (state.lastActiveDate === today) {
    if (state.streakDays < 1) state.streakDays = 1
    return
  }
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  state.streakDays = state.lastActiveDate === localDateKey(yesterday) ? Math.max(1, state.streakDays + 1) : 1
  state.lastActiveDate = today
}

export function completeLevel(levelId: string, xpMultiplier = 1): ProgressState {
  const state = loadProgress()
  const level = getLevel(levelId)
  if (!level) return state

  if (state.levels[levelId]?.status === 'complete') {
    touchStreak(state)
    saveProgress(state)
    return state
  }

  const earned = Math.round(level.xp * xpMultiplier)
  state.levels[levelId] = { ...state.levels[levelId], status: 'complete', xpEarned: earned, completedAt: Date.now() }
  state.totalXp += earned
  touchStreak(state)
  unlockEligible(state)
  saveProgress(state)
  beacon('level_complete', levelId)
  return state
}

export function incrementAttempts(levelId: string): void {
  const state = loadProgress()
  if (state.levels[levelId]) {
    state.levels[levelId].attempts += 1
    saveProgress(state)
  }
}

export function nextRecommendedLevel(state: ProgressState) {
  // Continue the production path by default. If it is complete, offer the
  // frontier specialization. Toolkit levels remain optional references.
  return PRODUCTION_LEVELS.find(l => state.levels[l.id]?.status === 'unlocked')
    ?? FRONTIER_LEVELS.find(l => state.levels[l.id]?.status === 'unlocked')
    ?? GATED_LEVELS.find(l => state.levels[l.id]?.status === 'unlocked')
}

export function requiredPredecessor(state: ProgressState, levelId: string) {
  const level = getLevel(levelId)
  if (!level || level.courseId === 0) return undefined
  const course = getCourse(level.courseId)
  const idx = course.levels.findIndex(l => l.id === levelId)
  if (idx > 0) return course.levels[idx - 1]
  if (course.prerequisite !== null && !isCourseComplete(state, course.prerequisite)) {
    const prereq = getCourse(course.prerequisite)
    return prereq.levels.find(l => state.levels[l.id]?.status !== 'complete') ?? prereq.levels[prereq.levels.length - 1]
  }
  return undefined
}

export interface CompletionSummary {
  production: { completed: number; total: number; done: boolean }
  frontier: { completed: number; total: number; done: boolean }
  full: { completed: number; total: number; done: boolean }
}

export function getCompletionSummary(state: ProgressState): CompletionSummary {
  const summarize = (levels: typeof ALL_LEVELS) => {
    const completed = levels.filter(l => isComplete(state, l.id)).length
    return { completed, total: levels.length, done: completed === levels.length }
  }
  return { production: summarize(PRODUCTION_LEVELS), frontier: summarize(FRONTIER_LEVELS), full: summarize(GATED_LEVELS) }
}

export function getProgressSummary(state: ProgressState) {
  const completed = ALL_LEVELS.filter(l => state.levels[l.id]?.status === 'complete').length
  const total = ALL_LEVELS.length
  const rank = getRank(state.totalXp)
  return { completed, total, percent: Math.round((completed / total) * 100), rank }
}

export function resetProgress(): void {
  localStorage.removeItem(KEY)
}
