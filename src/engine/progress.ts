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

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function defaultState(): ProgressState {
  const levels: Record<string, LevelState> = {}
  ALL_LEVELS.forEach((level, i) => {
    levels[level.id] = {
      status: i === 0 ? 'unlocked' : 'locked',
      xpEarned: 0,
      attempts: 0,
    }
  })
  return { levels, totalXp: 0, streakDays: 0, lastActiveDate: today() }
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as ProgressState
  } catch {}
  return defaultState()
}

export function saveProgress(state: ProgressState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function completeLevel(levelId: string): ProgressState {
  const state = loadProgress()
  const level = ALL_LEVELS.find(l => l.id === levelId)
  if (!level) return state

  // Mark complete and award XP
  state.levels[levelId] = {
    ...state.levels[levelId],
    status: 'complete',
    xpEarned: level.xp,
    completedAt: Date.now(),
  }
  state.totalXp += level.xp

  // Unlock next level
  const idx = ALL_LEVELS.findIndex(l => l.id === levelId)
  if (idx >= 0 && idx + 1 < ALL_LEVELS.length) {
    const nextId = ALL_LEVELS[idx + 1].id
    if (state.levels[nextId].status === 'locked') {
      state.levels[nextId].status = 'unlocked'
    }
  }

  // Update streak
  const t = today()
  const prev = state.lastActiveDate
  if (prev === t) {
    // already active today
  } else {
    const prevDate = new Date(prev)
    prevDate.setDate(prevDate.getDate() + 1)
    const yesterday = prevDate.toISOString().slice(0, 10)
    state.streakDays = t === yesterday ? state.streakDays + 1 : 1
    state.lastActiveDate = t
  }

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
