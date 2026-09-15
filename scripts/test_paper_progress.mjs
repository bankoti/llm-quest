import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const root = path.resolve(import.meta.dirname, '..')
const server = await createServer({ root, server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const base = `http://127.0.0.1:${server.httpServer.address().port}`
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const shots = process.env.PAPER_EVIDENCE_DIR ?? path.join(root, '.paper-test-output')
fs.mkdirSync(shots, { recursive: true })
let browser
try {
  browser = await chromium.launch({ headless: true, ...(fs.existsSync(chrome) ? { executablePath: chrome } : {}) })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(base)
  const previous = { levels: Object.fromEntries(['c2-l3', 'c2-l5', 'c9-l1'].map(id => [id, { status: 'complete', xpEarned: id === 'c9-l1' ? 150 : 200, attempts: 2, completedAt: 1700000000000 }])), totalXp: 550, streakDays: 3, lastActiveDate: '2026-09-13' }
  await page.evaluate(state => localStorage.setItem('llmquest_progress_v1', JSON.stringify(state)), previous)
  for (const [id, file] of [['c2-l3', 'c2/03_sparse_moe.py'], ['c2-l5', 'c2/05_flash_io.py'], ['c9-l1', 'c9/01_scaling_laws.py']]) {
    const solution = fs.readFileSync(path.join(root, 'public/content/solutions', file), 'utf8')
    await page.evaluate(({ id, solution }) => localStorage.setItem(`llmquest_code_v1:${id}`, solution), { id, solution })
    await page.goto(`${base}/level/${id}`)
    await page.getByRole('button', { name: 'Next →', exact: true }).waitFor()
    await page.waitForFunction(async () => { const { getPyodide } = await import('/src/engine/pyodide.ts'); await getPyodide(); return true }, null, { timeout: 120000 })
    await page.waitForTimeout(500)
    await page.keyboard.press('Control+Enter')
    await page.getByRole('dialog').waitFor({ timeout: 120000 })
    await page.getByText('XP already earned', { exact: true }).waitFor()
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('llmquest_progress_v1')))
    assert.equal(state.totalXp, previous.totalXp)
    for (const [oldId, old] of Object.entries(previous.levels)) {
      assert.equal(state.levels[oldId].status, old.status)
      assert.equal(state.levels[oldId].xpEarned, old.xpEarned)
      assert.equal(state.levels[oldId].completedAt, old.completedAt)
    }
    await page.screenshot({ path: path.join(shots, `${id}-revisit-complete.png`), animations: 'disabled' })
    fs.writeFileSync(path.join(shots, 'revisited-progress.json'), JSON.stringify(state, null, 2))
    console.log(`PASS ${id}: saved solution ran through learner UI; prior completion and 550 XP preserved`)
  }
} finally {
  await browser?.close()
  await server.close()
}
