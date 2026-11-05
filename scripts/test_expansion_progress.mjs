import assert from 'node:assert/strict'
import { createServer } from 'vite'
const store = new Map()
globalThis.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) }
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  const { ALL_LEVELS, COURSES, LEGACY_CERTIFICATE_LEVELS } = await server.ssrLoadModule('/src/data/curriculum.ts')
  const { loadProgress, getCompletionSummary, isCourseAvailable } = await server.ssrLoadModule('/src/engine/progress.ts')
  const key = 'llmquest_progress_v1'
  const legacy = ALL_LEVELS.filter(l => l.courseId <= 9)
  const state = { levels: Object.fromEntries(legacy.map(l => [l.id, { status: 'complete', xpEarned: l.xp, attempts: 3, completedAt: 123 }])), totalXp: 9876, streakDays: 5, lastActiveDate: '2026-11-01' }
  localStorage.setItem(key, JSON.stringify(state))
  const migrated = loadProgress()
  assert.equal(migrated.totalXp, 9876)
  for (const l of legacy) assert.deepEqual(migrated.levels[l.id], state.levels[l.id])
  assert.equal(getCompletionSummary(migrated).full.done, true)
  assert.equal(getCompletionSummary(migrated).full.total, LEGACY_CERTIFICATE_LEVELS.length)
  assert.equal(migrated.levels['c10-l1'].status, 'unlocked')
  assert.equal(migrated.levels['c11-l1'].status, 'unlocked')
  assert.equal(migrated.levels['c12-l1'].status, 'locked')
  assert.equal(migrated.levels['c13-l1'].status, 'locked')
  for (const l of COURSES.find(c => c.id === 10).levels) migrated.levels[l.id].status = 'complete'
  localStorage.setItem(key, JSON.stringify(migrated))
  assert.equal(loadProgress().levels['c12-l1'].status, 'unlocked')
  localStorage.removeItem(key)
  const fresh = loadProgress()
  assert.equal(isCourseAvailable(fresh, 10), false)
  assert.equal(getCompletionSummary(fresh).full.done, false)
  console.log('PASS: legacy IDs, XP, certificates, fresh state, and continuation prerequisites')
} finally { await server.close() }
