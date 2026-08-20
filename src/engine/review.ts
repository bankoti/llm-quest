// Spaced-review engine — Leitner boxes over completed levels.
// The two mechanisms with the strongest evidence in learning science are
// retrieval practice and spacing; this file implements both.
// Storage: localStorage, same upgrade path as progress.ts.

import { REVIEW_QUESTIONS, ReviewQuestion } from "@/data/review"
import { COURSES, getLevel } from "@/data/curriculum"
import { loadProgress, saveProgress, touchStreak } from "./progress"

export interface CardState {
  box: number      // Leitner box index into INTERVAL_DAYS
  due: number      // epoch ms
  seen: number
  right: number
}

export interface DefenseState {
  bestPct: number
  bonusAwarded: boolean
}

export interface ReviewState {
  cards: Record<string, CardState>          // keyed by question id
  xpFromReview: number
  defenses: Record<number, DefenseState>    // keyed by course id
}

const KEY = "llmquest_review_v1"
const DAY = 24 * 60 * 60 * 1000
const INTERVAL_DAYS = [1, 3, 7, 21, 60]

export const REVIEW_XP = 10          // per correct first answer
export const SESSION_CAP = 12        // max cards per daily session
export const DEFENSE_BONUS_XP = 250  // one-time, per course
export const DEFENSE_PASS_PCT = 80
export const RETRY_GAP = 3           // show missed card again after this many intervening cards

function defaultState(): ReviewState {
  return { cards: {}, xpFromReview: 0, defenses: {} }
}

export function loadReview(): ReviewState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...defaultState(), ...(JSON.parse(raw) as ReviewState) }
  } catch {}
  return defaultState()
}

export function saveReview(state: ReviewState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

// Cards due now. A question enters the system when its level is completed;
// its first review lands one day later (the spacing effect needs a gap).
export function dueQuestions(now = Date.now()): ReviewQuestion[] {
  const progress = loadProgress()
  const state = loadReview()
  let changed = false
  const due: ReviewQuestion[] = []

  for (const q of REVIEW_QUESTIONS) {
    const lvl = progress.levels[q.levelId]
    if (lvl?.status !== "complete") continue
    let card = state.cards[q.id]
    if (!card) {
      card = { box: 0, due: (lvl.completedAt ?? now) + INTERVAL_DAYS[0] * DAY, seen: 0, right: 0 }
      state.cards[q.id] = card
      changed = true
    }
    if (card.due <= now) due.push(q)
  }

  if (changed) saveReview(state)
  // Struggling cards first (lowest historical accuracy), oldest due as the
  // tiebreak so nothing starves. New cards sit in the middle at 0.5.
  const acc = (q: ReviewQuestion) => {
    const c = state.cards[q.id]
    return c && c.seen > 0 ? c.right / c.seen : 0.5
  }
  return due.sort((a, b) =>
    acc(a) - acc(b) ||
    (state.cards[a.id]?.due ?? 0) - (state.cards[b.id]?.due ?? 0))
}

export function dueCount(now = Date.now()): number {
  return dueQuestions(now).length
}

// Record a first-attempt miss: schedule in-session retry (reappear after
// RETRY_GAP intervening cards). On second miss, schedule tomorrow.
// Returns the scheduling decision to inform the UI queue manager.
export function answerCard(questionId: string, correct: boolean, now = Date.now()): "retry" | "tomorrow" | "promoted" {
  const state = loadReview()
  const card = state.cards[questionId] ?? { box: 0, due: now, seen: 0, right: 0 }
  card.seen += 1
  if (correct) {
    card.right += 1
    card.box = Math.min(card.box + 1, INTERVAL_DAYS.length - 1)
    card.due = now + INTERVAL_DAYS[card.box] * DAY
    state.cards[questionId] = card
    state.xpFromReview += REVIEW_XP
    saveReview(state)
    const progress = loadProgress()
    progress.totalXp += REVIEW_XP
    touchStreak(progress)
    saveProgress(progress)
    return "promoted"
  }

  // Wrong answer: check if this is a repeated miss (box already 0 from prior miss).
  const isRepeatMiss = card.box === 0 && card.seen > 1
  card.box = 0
  if (isRepeatMiss) {
    card.due = now + INTERVAL_DAYS[0] * DAY
  } else {
    // Keep due in the past so it stays "due" but the UI manages the retry queue.
    card.due = now
  }
  state.cards[questionId] = card
  saveReview(state)

  const progress = loadProgress()
  touchStreak(progress)
  saveProgress(progress)

  return isRepeatMiss ? "tomorrow" : "retry"
}

// ─── Boss defense ────────────────────────────────────────────────────────────
// After finishing a course, defend it: answer that course full question set.
// Score >= DEFENSE_PASS_PCT earns a one-time XP bonus. Retries always allowed.

export function defenseAvailable(courseId: number): boolean {
  const progress = loadProgress()
  const course = COURSES.find(c => c.id === courseId)
  if (!course) return false
  return course.levels.every(l => progress.levels[l.id]?.status === "complete")
}

export function courseQuestions(courseId: number): ReviewQuestion[] {
  return REVIEW_QUESTIONS.filter(q => getLevel(q.levelId)?.courseId === courseId)
}

export function getDefense(courseId: number): DefenseState | undefined {
  return loadReview().defenses[courseId]
}

export function recordDefense(courseId: number, pct: number): { bonus: number } {
  const state = loadReview()
  const d = state.defenses[courseId] ?? { bestPct: 0, bonusAwarded: false }
  d.bestPct = Math.max(d.bestPct, pct)
  let bonus = 0
  if (pct >= DEFENSE_PASS_PCT && !d.bonusAwarded) {
    d.bonusAwarded = true
    bonus = DEFENSE_BONUS_XP
  }
  state.defenses[courseId] = d
  saveReview(state)
  if (bonus > 0) {
    const progress = loadProgress()
    progress.totalXp += bonus
    touchStreak(progress)
    saveProgress(progress)
  }
  return { bonus }
}

export function resetReview(): void {
  localStorage.removeItem(KEY)
}
