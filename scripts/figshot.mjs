// Screenshot the first figure-bearing step of lessons, for visual review of
// concept figures. Usage: node scripts/figshot.mjs [slug substrings...]
// Shots land in smoke-shots/figcheck-<slug>.png (does not wipe the dir).
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
const root = path.resolve(import.meta.dirname, '..')
const PORT = 4173
const lessonFiles = ['foundationLessons.ts','modelLessons.ts','adaptationLessons.ts','systemsLessons.ts','applicationLessons.ts','extensionLessons.ts','papersLessons.ts']
const all = []
const withFig = []
for (const f of lessonFiles) {
  const src = fs.readFileSync(path.join(root, 'src/interactive', f), 'utf8')
  const slugs = [...src.matchAll(/\bslug:\s*'([^']+)'/g)]
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i][1]
    all.push(slug)
    const block = src.slice(slugs[i].index, i + 1 < slugs.length ? slugs[i + 1].index : src.length)
    if (/figure:\s*'/.test(block)) withFig.push(slug)
  }
}
const args = process.argv.slice(2)
const targets = args.length ? withFig.filter(s => args.some(a => s.includes(a))) : withFig
console.log(`figshot: ${targets.length} lessons`)
const seeded = Object.fromEntries(all.map(s => [s, { firstTries: 1, scored: 1, completedAt: '2026-01-01T00:00:00.000Z' }]))
const server = spawn('npx vite preview --port ' + PORT + ' --strictPort', { cwd: root, shell: true, stdio: 'ignore' })
let up = false
for (let i = 0; i < 30 && !up; i++) { await new Promise(r => setTimeout(r, 1000)); up = await fetch(`http://localhost:${PORT}/`).then(r => r.ok).catch(() => false) }
if (!up) { server.kill(); throw new Error('preview did not start') }
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 900, height: 1100 } })
await ctx.addInitScript(`localStorage.setItem('llmquest_interactive_v2', ${JSON.stringify(JSON.stringify(seeded))})`)
fs.mkdirSync(path.join(root, 'smoke-shots'), { recursive: true })
for (const slug of targets) {
  const page = await ctx.newPage()
  const url = `http://localhost:${PORT}/interactive/${slug}`
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), ['llmquest_interactive_v2', JSON.stringify(seeded)])
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  try { await page.waitForSelector('[data-figure]', { timeout: 8000 }) } catch { console.log('NO FIGURE RENDERED:', slug) }
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(root, 'smoke-shots', `figcheck-${slug}.png`) })
  await page.close()
}
await browser.close(); server.kill(); process.exit(0)
