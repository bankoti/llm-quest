// Progress state — stored in localStorage, no backend needed for v1.
// Upgrade path: swap localStorage calls for Supabase calls in one file.

import { ALL_LEVELS, getRank } from '@/data/curriculum'

export interface LevelState {
  status: 'locked' | 'unlocked' | 'complete'
  xpEarned: number
  completedAt?: number  // epoch ms
  attempts: number
}

export interface ProgressState {
  levels: Record<string, LevelState>
  totalXp: number
  streakDays: number
  lastActiveDate: string  // YYYY-MM-DD
}

const KEY = 'llmquest_progress_v1'

// Course 0 is an open reference course: every level is always unlocked and
// completing it is never required to progress. The linear unlock chain runs
// over the gated (non-course-0) levels only.
const isFree = (l: { courseId: number }) => l.courseId === 0
const GATED_LEVELS = ALL_LEVELS.filter(l => !isFree(l))

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function defaultState(): ProgressState {
  const levels: Record<string, LevelState> = {}
  ALL_LEVELS.forEach(level => {
    const first = GATED_LEVELS[0]?.id === level.id
    levels[level.id] = {
      status: isFree(level) || first ? 'unlocked' : 'locked',
      xpEarned: 0,
      attempts: 0,
    }
  })
  return { levels, totalXp: 0, streakDays: 0, lastActiveDate: today() }
}

// Backfill entries for levels added after the user first saved progress
// (e.g. debug levels). A new level is unlocked if the level before it in
// ALL_LEVELS order is already complete, otherwise locked.
function migrate(state: ProgressState): ProgressState {
  ALL_LEVELS.forEach(level => {
    if (state.levels[level.id]) return
    let unlocked: boolean
    if (isFree(level)) {
      unlocked = true
    } else {
      const gi = GATED_LEVELS.findIndex(l => l.id === level.id)
      const prev = gi > 0 ? state.levels[GATED_LEVELS[gi - 1].id] : undefined
      unlocked = gi === 0 || prev?.status === 'complete'
    }
    state.levels[level.id] = {
      status: unlocked ? 'unlocked' : 'locked',
      xpEarned: 0,
      attempts: 0,
    }
  })
  return state
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

// Any learning activity counts toward the streak — passing a level or
// clearing review cards. Exported so the review engine can share it.
export function touchStreak(state: ProgressState): void {
  const t = today()
  const prev = state.lastActiveDate
  if (prev === t) return
  const prevDate = new Date(prev)
  prevDate.setDate(prevDate.getDate() + 1)
  const yesterday = prevDate.toISOString().slice(0, 10)
  state.streakDays = t === yesterday ? state.streakDays + 1 : 1
  state.lastActiveDate = t
}

// xpMultiplier < 1 when paid hints were used (see Arena hint ladder).
export function completeLevel(levelId: string, xpMultiplier = 1): ProgressState {
  const state = loadProgress()
  const level = ALL_LEVELS.find(l => l.id === levelId)
  if (!level) return state

  // Replaying an already-complete level never re-awards XP.
  if (state.levels[levelId]?.status === 'complete') {
    touchStreak(state)
    saveProgress(state)
    return state
  }

  const earned = Math.round(level.xp * xpMultiplier)
  state.levels[levelId] = {
    ...state.levels[levelId],
    status: 'complete',
    xpEarned: earned,
    completedAt: Date.now(),
  }
  state.totalXp += earned

  // Unlock next level in the gated chain (course 0 gates nothing)
  const idx = GATED_LEVELS.findIndex(l => l.id === levelId)
  if (idx >= 0 && idx + 1 < GATED_LEVELS.length) {
    const nextId = GATED_LEVELS[idx + 1].id
    if (state.levels[nextId]?.status === 'locked') {
      state.levels[nextId].status = 'unlocked'
    }
  }

  touchStreak(state)
  saveProgress(state)
  return state
}

export function incrementAttempts(levelId: string): void {
  const state = loadProgress()
  if (state.levels[levelId]) {
    state.levels[levelId].attempts += 1
    saveProgress(state)
  }
}

export function getProgressSummary(state: ProgressState) {
  const completed = Object.values(state.levels).filter(l => l.status === 'complete').length
  const total = ALL_LEVELS.length
  const rank = getRank(state.totalXp)
  return { completed, total, percent: Math.round((completed / total) * 100), rank }
}

export function resetProgress(): void {
  localStorage.removeItem(KEY)
}