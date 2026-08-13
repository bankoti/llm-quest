// Admin mode + grant links — client-side only (no backend in v1).
// Admin activates via ?admin=<SITE.adminKey>; grant links unlock chosen
// courses in a user's localStorage via ?grant=<code>.
//
// Honesty note: the key ships in the JS bundle, so this deters casual
// skipping only. Real gating needs a backend (Supabase upgrade path).

import { COURSES, ALL_LEVELS } from '@/data/curriculum'
import { loadProgress, saveProgress } from '@/engine/progress'
import { SITE } from '@/config/site'

const ADMIN_FLAG = 'llmquest_admin_v1'

export function isAdminMode(): boolean {
  try { return localStorage.getItem(ADMIN_FLAG) === '1' } catch { return false }
}

export function exitAdminMode(): void {
  localStorage.removeItem(ADMIN_FLAG)
}

// djb2 — tiny non-crypto signature so grant codes aren't trivially handmade
function hash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}

function b64urlEncode(s: string): string {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlDecode(s: string): string {
  return atob(s.replace(/-/g, '+').replace(/_/g, '/'))
}

export function makeGrantLink(courseIds: number[]): string {
  const payload = courseIds.slice().sort((a, b) => a - b).join(',')
  const code = b64urlEncode(`${payload}|${hash(payload + SITE.adminKey)}`)
  return `${location.origin}${import.meta.env.BASE_URL}?grant=${code}`
}

// Returns granted course ids, or null if the code is invalid.
export function applyGrant(code: string): number[] | null {
  let decoded: string
  try { decoded = b64urlDecode(code) } catch { return null }
  const [payload, sig] = decoded.split('|')
  if (!payload || sig !== hash(payload + SITE.adminKey)) return null

  const state = loadProgress()
  const granted: number[] = []
  for (const part of payload.split(',')) {
    const course = COURSES.find(c => c.id === Number(part))
    if (!course) continue
    for (const level of course.levels) {
      if (state.levels[level.id]?.status === 'locked') {
        state.levels[level.id].status = 'unlocked'
      }
    }
    granted.push(course.id)
  }
  saveProgress(state)
  return granted
}

// Persistently unlock every level in this browser's progress.
export function unlockAllLevels(): void {
  const state = loadProgress()
  for (const level of ALL_LEVELS) {
    if (state.levels[level.id]?.status === 'locked') {
      state.levels[level.id].status = 'unlocked'
    }
  }
  saveProgress(state)
}

// Parse ?admin= / ?grant= once at startup, then scrub them from the URL.
export function processUrlFlags(): { granted: number[] | null } {
  const params = new URLSearchParams(location.search)
  const admin = params.get('admin')
  const grant = params.get('grant')
  let granted: number[] | null = null

  if (admin !== null) {
    if (admin === 'off') localStorage.removeItem(ADMIN_FLAG)
    else if (admin === SITE.adminKey) localStorage.setItem(ADMIN_FLAG, '1')
  }
  if (grant) granted = applyGrant(grant)

  if (admin !== null || grant) {
    params.delete('admin')
    params.delete('grant')
    const qs = params.toString()
    history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash)
  }
  return { granted }
}
