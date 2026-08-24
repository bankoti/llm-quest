// Smoke test the Quantum Atlas hub and first journey on desktop and mobile.
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const root = path.resolve(import.meta.dirname, '..')
const shotDir = path.join(root, 'smoke-shots')
const port = 4174
const base = `http://localhost:${port}`

fs.mkdirSync(shotDir, { recursive: true })
const server = spawn(`npx vite preview --port ${port} --strictPort`, { cwd: root, shell: true, stdio: 'inherit' })

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 500))
    if (await fetch(base).then(response => response.ok).catch(() => false)) return
  }
  throw new Error('Quantum preview server did not start')
}

function collectErrors(page) {
  const errors = []
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) errors.push(`console: ${message.text()}`)
  })
  return errors
}

async function expectNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (overflow > 1) throw new Error(`${label} overflows horizontally by ${overflow}px`)
}

async function expectCanvasDrawn(page) {
  const colors = await page.locator('.qa-canvas').evaluate(canvas => {
    const context = canvas.getContext('2d')
    if (!context) return 0
    const samples = new Set()
    for (let row = 0; row < 30; row += 1) {
      for (let column = 0; column < 40; column += 1) {
        const x = Math.min(canvas.width - 1, Math.floor((column + 0.5) * canvas.width / 40))
        const y = Math.min(canvas.height - 1, Math.floor((row + 0.5) * canvas.height / 30))
        const pixel = context.getImageData(x, y, 1, 1).data
        samples.add(`${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]}`)
      }
    }
    return samples.size
  })
  if (colors < 4) throw new Error(`Quantum canvas looks blank (${colors} sampled colors)`)
}

await waitForServer()
const browser = await chromium.launch({ headless: true })

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const desktopPage = await desktop.newPage()
  const desktopErrors = collectErrors(desktopPage)
  await desktopPage.goto(`${base}/quantum`, { waitUntil: 'networkidle' })
  await desktopPage.getByRole('heading', { name: 'Build a quantum universe you can actually see.' }).waitFor()
  const lessonCount = await desktopPage.locator('.qa-lesson-card').count()
  if (lessonCount !== 35) throw new Error(`Expected 35 curriculum lessons, found ${lessonCount}`)
  await expectNoHorizontalOverflow(desktopPage, 'desktop hub')
  await desktopPage.screenshot({ path: path.join(shotDir, 'quantum-hub-desktop.png'), fullPage: false })
  if (desktopErrors.length) throw new Error(desktopErrors.join(' | '))
  await desktop.close()

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await mobile.newPage()
  const errors = collectErrors(page)
  await page.goto(`${base}/quantum`, { waitUntil: 'networkidle' })
  await expectNoHorizontalOverflow(page, 'mobile hub')
  await page.getByRole('link', { name: /Start first journey/ }).click()
  await page.getByRole('heading', { name: 'First, shrink your point of view' }).waitFor()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(shotDir, 'quantum-lesson-mobile-start.png'), fullPage: false })
  await expectCanvasDrawn(page)
  await page.locator('input[type="range"]').fill('4')
  await page.getByRole('button', { name: 'Continue →' }).click()
  await page.getByRole('button', { name: 'Wave' }).click()
  await page.getByRole('button', { name: 'Continue →' }).click()
  await page.getByRole('button', { name: 'Burst 25' }).click()
  await page.getByText('Detector has recorded 25 events.').waitFor()
  await page.getByRole('button', { name: 'Continue →' }).click()
  await page.getByRole('button', { name: /Path detector off/ }).click()
  await page.getByRole('button', { name: 'Continue →' }).click()
  await page.getByRole('button', { name: 'Measure electron' }).click()
  await page.getByText(/Detector clicked on the/).waitFor()
  await page.getByRole('button', { name: 'Continue →' }).click()
  await page.getByRole('radio', { name: /Single detections are discrete/ }).click()
  await page.getByRole('button', { name: 'Check answer →' }).click()
  await page.getByText(/Exactly. Quantum theory predicts/).waitFor()
  await page.screenshot({ path: path.join(shotDir, 'quantum-check-mobile.png'), fullPage: false })
  await page.getByRole('button', { name: 'See summary →' }).click()
  await page.getByRole('heading', { name: 'Your first quantum model is alive' }).waitFor()
  await page.waitForTimeout(500)
  await expectCanvasDrawn(page)
  await page.screenshot({ path: path.join(shotDir, 'quantum-summary-mobile.png'), fullPage: false })
  await expectNoHorizontalOverflow(page, 'mobile summary')
  const complete = await page.evaluate(() => localStorage.getItem('quantum-atlas-complete'))
  if (complete !== 'true') throw new Error('Quantum completion was not saved')
  if (errors.length) throw new Error(errors.join(' | '))
  await mobile.close()
  console.log('Quantum smoke passed: 35-lesson hub and complete mobile journey')
} finally {
  await browser.close()
  server.kill()
}
