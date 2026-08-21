// Smoke test: play every interactive lesson end-to-end in a real browser.
// Generic solver: clicks Continue-style buttons, tries answer options until
// correct, fills numeric inputs from answers extracted out of lesson source.
// Fails on any page error; reports lessons that could not reach completion.
// Usage: node scripts/smoke-interactive.mjs [--filter slug-substring]
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const root = path.resolve(import.meta.dirname, '..')
const SHOT_DIR = path.join(root, 'smoke-shots')
const PORT = 4173
const filter = process.argv.includes('--filter') ? process.argv[process.argv.indexOf('--filter') + 1] : null

// ---- extract lesson slugs + numeric answers from source (curriculum order) ----
const lessonFiles = ['foundationLessons.ts', 'modelLessons.ts', 'adaptationLessons.ts', 'systemsLessons.ts', 'applicationLessons.ts', 'extensionLessons.ts']
const lessons = [] // { slug, numericAnswers: [] }
for (const f of lessonFiles) {
  const src = fs.readFileSync(path.join(root, 'src/interactive', f), 'utf8')
  const slugIdx = [...src.matchAll(/\bslug:\s*'([^']+)'/g)]
  for (let i = 0; i < slugIdx.length; i++) {
    const start = slugIdx[i].index, end = i + 1 < slugIdx.length ? slugIdx[i + 1].index : src.length
    const block = src.slice(start, end)
    // numeric question answers, in order of appearance
    const numericAnswers = [...block.matchAll(/answer:\s*(-?[\d.]+)\s*,\s*tolerance/g)].map(m => m[1])
    lessons.push({ slug: slugIdx[i][1], numericAnswers })
  }
}
const targets = filter ? lessons.filter(l => l.slug.includes(filter)) : lessons
console.log(`smoke: ${targets.length} lessons to play`)

// ---- start preview server ----
fs.rmSync(SHOT_DIR, { recursive: true, force: true }); fs.mkdirSync(SHOT_DIR, { recursive: true })
const server = spawn('npx vite preview --port ' + PORT + ' --strictPort', { cwd: root, shell: true, stdio: 'inherit' })
let up = false
for (let i = 0; i < 60 && !up; i++) {
  await new Promise(r => setTimeout(r, 1000))
  up = await fetch(`http://localhost:${PORT}/`).then(r => r.ok).catch(() => false)
}
if (!up) { server.kill(); throw new Error('preview server did not start') }

const browser = await chromium.launch({ headless: true }) // bundled chromium; msedge channel hangs on launch (enterprise policies)
const context = await browser.newContext({ viewport: { width: 900, height: 900 } })
// unlock everything: mark every lesson complete before app code runs
const seeded = Object.fromEntries(lessons.map(l => [l.slug, { firstTries: 1, scored: 1, completedAt: '2026-01-01T00:00:00.000Z' }]))
await context.addInitScript(`localStorage.setItem('llmquest_interactive_v2', ${JSON.stringify(JSON.stringify(seeded))})`)

const results = [] // { slug, ok, steps, error }
for (const lesson of targets) {
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', e => pageErrors.push(`pageerror: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('Failed to load resource')) pageErrors.push(`console: ${m.text()}`) })
  const numQueue = [...lesson.numericAnswers]
  let shots = 0, actions = 0, lastSig = '', stuckFor = 0, done = false, error = null
  // fallback rotation state: only advance start index when a fallback click produces no sig change
  let fallbackStart = 0
  try {
    const lessonUrl = `http://localhost:${PORT}/interactive/${lesson.slug}`
    await page.goto(lessonUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
    // Re-seed localStorage after React has mounted (addInitScript alone can lose a race when
    // previous lessons have modified the same key in the shared browser context).
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), ['llmquest_interactive_v2', JSON.stringify(seeded)])
    // Second navigation so React re-mounts with the freshly seeded data.
    await page.goto(lessonUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(1500)
    const deadline = Date.now() + 240000
    while (Date.now() < deadline && actions < 400) {
      // completion screen?
      if (await page.locator('text=Back to track').first().isVisible().catch(() => false)) { done = true; break }
      if (await page.locator('text=Lesson not found').first().isVisible().catch(() => false)) { error = 'lesson not found'; break }
      if (await page.locator('text=Build the foundation first').first().isVisible().catch(() => false)) { error = 'prereq gate hit despite seed'; break }
      // screenshot on visual change
      const sig = await page.locator('#root').first().innerText({ timeout: 500 }).catch(() => '')
      if (sig !== lastSig) {
        lastSig = sig; stuckFor = 0
        await page.screenshot({ path: path.join(SHOT_DIR, `${lesson.slug}-${String(shots++).padStart(2, '0')}.png`) }).catch(() => {})
      } else if (++stuckFor > 60) { error = 'no progress (stuck step)'; break }
      // 1) numeric input visible → fill next answer
      const input = page.locator('input[type="number"], input[inputmode="decimal"], input[type="text"]').first()
      if (await input.isVisible().catch(() => false)) {
        const v = numQueue.length ? numQueue.shift() : '0'
        await input.fill(String(v)).catch(() => {})
      }
      // 2) prefer explicit advance buttons
      let clicked = false
      for (const label of [
        /^continue$/i, /^show the answer$/i, /^check/i, /^next/i, /^got it/i, /^start/i,
        /^← /i, /^reveal/i, /^i'm sure$/i, /^not sure$/i, /^best guess$/i,
        /^try again$/i,              // reset after wrong RLHF order
        /^SFT$/,                     // RLHF pipeline step 1
        /^Reward Model$/,            // RLHF pipeline step 2
        /^PPO$/,                     // RLHF pipeline step 3
        /^Call calculator/i,         // AgentPlay round 1 correct pick
        /^Return the answer/i,       // AgentPlay round 2 correct pick
      ]) {
        const btn = page.getByRole('button', { name: label }).first()
        if (await btn.isVisible().catch(() => false) && await btn.isEnabled().catch(() => false)) {
          await btn.click({ timeout: 2000 }).catch(() => {}); fallbackStart = 0; clicked = true; break
        }
      }
      // 3) otherwise rotate through enabled buttons; fallbackStart advances when a click produces no progress
      if (!clicked) {
        const buttons = page.locator('button:enabled')
        const n = await buttons.count()
        for (let i = 0; i < n; i++) {
          const b = buttons.nth((fallbackStart + i) % n)
          const txt = (await b.innerText({ timeout: 1000 }).catch(() => '')).trim()
          if (txt === '✕' || txt === '←') continue  // skip bare close/back arrows
          if (await b.isVisible().catch(() => false)) {
            await b.click({ timeout: 2000 }).catch(() => {})
            fallbackStart++; clicked = true; break  // always advance: next iteration tries next button
          }
        }
      }
      if (!clicked) await page.waitForTimeout(250)
      actions++
      await page.waitForTimeout(120)
    }
    if (!done && !error) error = 'timeout before completion'
  } catch (e) { error = e.message }
  if (pageErrors.length) error = `${error ? error + '; ' : ''}${pageErrors.slice(0, 3).join(' | ')}`
  results.push({ slug: lesson.slug, ok: done && !pageErrors.length, steps: shots, error })
  console.log(`${done && !pageErrors.length ? 'PASS' : 'FAIL'} ${lesson.slug} (${shots} screens, ${actions} actions)${error ? ' — ' + error : ''}`)
  await page.close()
}

await browser.close(); server.kill()
const failed = results.filter(r => !r.ok)
fs.writeFileSync(path.join(SHOT_DIR, 'report.json'), JSON.stringify(results, null, 2))
console.log(`\n${results.length - failed.length}/${results.length} lessons completed clean`)
if (failed.length) { console.log('failures:'); failed.forEach(f => console.log(`- ${f.slug}: ${f.error}`)) }
process.exit(failed.length ? 1 : 0)
