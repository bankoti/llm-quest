// Screenshot individual figures from the /figures gallery for visual review.
// Usage: node scripts/galleryshot.mjs [key prefix, default 'fx-']
// Shots land in smoke-shots/gal-<key>.png
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
const root = path.resolve(import.meta.dirname, '..')
const PORT = 4173
const prefix = process.argv[2] ?? 'fx-'
const server = spawn('npx vite preview --port ' + PORT + ' --strictPort', { cwd: root, shell: true, stdio: 'ignore' })
let up = false
for (let i = 0; i < 30 && !up; i++) { await new Promise(r => setTimeout(r, 1000)); up = await fetch(`http://localhost:${PORT}/`).then(r => r.ok).catch(() => false) }
if (!up) { server.kill(); throw new Error('preview did not start') }
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } })
await page.goto(`http://localhost:${PORT}/figures`, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('[data-fig]', { timeout: 15000 })
await page.waitForTimeout(500)
fs.mkdirSync(path.join(root, 'smoke-shots'), { recursive: true })
const keys = await page.$$eval('[data-fig]', els => els.map(e => e.getAttribute('data-fig')))
const targets = keys.filter(k => k.startsWith(prefix))
console.log(`galleryshot: ${targets.length} figures (of ${keys.length})`)
for (const key of targets) {
  const el = await page.$(`[data-fig="${key}"]`)
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(80)
  await el.screenshot({ path: path.join(root, 'smoke-shots', `gal-${key}.png`) })
}
await browser.close(); server.kill(); process.exit(0)
