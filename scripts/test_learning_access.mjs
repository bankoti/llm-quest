import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const preferenceKey = 'llmquest_prerequisite_locks_v1'
const progressKey = 'llmquest_progress_v1'
const output = new URL('../.paper-test-output/', import.meta.url)
const server = process.env.TEST_BASE_URL ? undefined : await createServer({ server: { host: '127.0.0.1', port: 5190, strictPort: true } })
let browser

const toggle = page => page.getByRole('checkbox', { name: 'Prerequisite locks' })
async function assertLocks(page, enabled) {
  await toggle(page).waitFor()
  await page.waitForFunction(expected => [...document.querySelectorAll('input[type="checkbox"]')]
    .find(input => input.closest('label')?.textContent.includes('Prerequisite locks'))?.checked === expected, enabled)
  assert.equal(await toggle(page).isChecked(), enabled)
}
async function certificateProgress(page) {
  await page.getByRole('link', { name: 'Transcript', exact: true }).click()
  await page.getByRole('heading', { name: 'Certificates & Transcript' }).waitFor()
  const result = await page.getByRole('progressbar').evaluateAll(bars => bars.map(bar => ({
    label: bar.getAttribute('aria-label'),
    completed: bar.getAttribute('aria-valuenow'),
    total: bar.getAttribute('aria-valuemax'),
  })))
  await page.getByRole('link', { name: '← Map', exact: true }).click()
  await toggle(page).waitFor()
  return result
}
async function assertPane(page, viewport, initial = 40) {
  const separator = page.getByRole('separator', { name: 'Resize lesson and code panes', includeHidden: true })
  await separator.waitFor({ state: 'attached' })
  assert.equal(await separator.getAttribute('aria-valuenow'), String(initial))
  if (viewport.width >= 768) {
    await separator.press('ArrowRight')
    assert.equal(await separator.getAttribute('aria-valuenow'), String(initial + 5))
    await page.getByRole('button', { name: 'Hide lesson for full-width editor', exact: true }).click()
    assert.equal(await separator.getAttribute('aria-valuenow'), '0')
    await page.getByRole('button', { name: 'Show lesson', exact: true }).click()
    assert.equal(await separator.getAttribute('aria-valuenow'), String(initial + 5))
  } else {
    await page.getByRole('tab', { name: 'code', exact: true }).click()
    assert.equal(await page.getByRole('tab', { name: 'code', exact: true }).getAttribute('aria-selected'), 'true')
    await page.getByRole('tab', { name: 'lesson', exact: true }).click()
    assert.equal(await page.getByRole('tab', { name: 'lesson', exact: true }).getAttribute('aria-selected'), 'true')
  }
}

try {
  await mkdir(output, { recursive: true })
  await server?.listen()
  const base = process.env.TEST_BASE_URL ?? server.resolvedUrls.local[0].replace(/\/$/, '')
  browser = await chromium.launch()
  async function newContext(options = {}) {
    const context = await browser.newContext(options)
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin === new URL(base).origin) return route.continue()
      const monaco = url.pathname.split('/min/vs/')[1]
      if (monaco) return route.fulfill({
        path: fileURLToPath(new URL(`../node_modules/monaco-editor/min/vs/${monaco}`, import.meta.url)),
        headers: { 'Access-Control-Allow-Origin': '*', 'Cross-Origin-Resource-Policy': 'cross-origin' },
      })
      return route.abort()
    })
    return context
  }
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const context = await newContext({ viewport })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${base}/map`)
    await assertLocks(page, true)
    const progress = JSON.stringify({
      levels: {
        'c1-l1': { status: 'complete', xpEarned: 100, attempts: 3, completedAt: 1735689600000 },
        'c13-l1': { status: 'unlocked', xpEarned: 0, attempts: 0 },
      },
      totalXp: 100, streakDays: 4, lastActiveDate: '2026-11-01',
    })
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: progressKey, value: progress })
    await page.reload()
    await assertLocks(page, true)
    const certificates = await certificateProgress(page)
    assert.equal(certificates.length, 3)
    const locked = await page.locator('button[disabled][aria-label]').count()
    assert.ok(locked > 0)
    await toggle(page).uncheck()
    assert.equal(await page.locator('button[disabled][aria-label]').count(), 0)
    await page.reload()
    await assertLocks(page, false)
    const second = await context.newPage()
    await second.goto(`${base}/map`)
    await toggle(second).check()
    await assertLocks(page, true)
    assert.equal(await page.locator('button[disabled][aria-label]').count(), locked)

    await toggle(page).uncheck()
    await assertLocks(second, false)
    await page.getByRole('link', { name: 'Concepts', exact: true }).click()
    await page.getByRole('heading', { name: 'Interactive Course', exact: true }).waitFor()
    assert.equal(await toggle(page).count(), 0)
    await toggle(second).check()
    await page.waitForFunction(key => localStorage.getItem(key) === 'on', preferenceKey)
    await page.getByRole('link', { name: '← Map', exact: true }).click()
    await assertLocks(page, true)
    assert.equal(await page.locator('button[disabled][aria-label]').count(), locked)
    await second.close()

    await page.goto(`${base}/level/c13-l1`)
    await page.getByRole('button', { name: '← Map', exact: true }).waitFor()
    await page.goto(`${base}/level/c13-l6`)
    await page.getByText('Complete the prerequisite before opening this challenge.').waitFor()
    await page.getByRole('checkbox', { name: 'Prerequisite locks' }).click({ noWaitAfter: true })
    await page.getByRole('button', { name: 'Map', exact: false }).first().waitFor()
    assert.equal(await page.getByText('Complete the prerequisite before opening this challenge.').count(), 0)
    assert.equal(await page.evaluate(key => localStorage.getItem(key), progressKey), progress)
    await page.goto(`${base}/map`)
    await toggle(page).waitFor()
    assert.deepEqual(await certificateProgress(page), certificates)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.screenshot({ path: new URL(`learning-access-${viewport.width}.png`, output).pathname })
    assert.deepEqual(errors, [])
    await context.close()

    const denied = await newContext({ viewport })
    await denied.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage denied', 'SecurityError') } })
    })
    const lesson = await denied.newPage()
    const deniedErrors = []
    lesson.on('pageerror', error => deniedErrors.push(error.message))
    await lesson.goto(`${base}/level/c13-l6`)
    await assertLocks(lesson, true)
    await toggle(lesson).click({ noWaitAfter: true })
    await lesson.getByRole('button', { name: '← Map', exact: true }).waitFor()
    await assertPane(lesson, viewport)
    await lesson.getByRole('button', { name: '← Map', exact: true }).click()
    await assertLocks(lesson, false)
    assert.equal(await lesson.locator('button[disabled][aria-label]').count(), 0)
    await toggle(lesson).check()
    assert.ok(await lesson.locator('button[disabled][aria-label]').count() > 0)
    assert.deepEqual(deniedErrors, [])
    await denied.close()
    console.log(`PASS ${viewport.width}px: navigation sync, denied storage, direct routes, persisted progress, grants and certificates`)
  }

  const context = await newContext({ viewport: { width: 1280, height: 900 } })
  const admin = await context.newPage()
  const errors = []
  admin.on('pageerror', error => errors.push(error.message))
  await admin.goto(`${base}/?admin=quest-master-42`)
  await admin.goto(`${base}/map`)
  await assertLocks(admin, false)
  await toggle(admin).check()
  assert.ok(await admin.locator('button[disabled][aria-label]').count() > 0)
  const second = await context.newPage()
  await second.goto(`${base}/map`)
  await toggle(second).waitFor()
  await second.evaluate(key => localStorage.removeItem(key), preferenceKey)
  await assertLocks(admin, false)
  await admin.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Storage full', 'QuotaExceededError') }
  })
  await toggle(admin).check()
  await assertLocks(admin, true)
  await toggle(admin).uncheck()
  await assertLocks(admin, false)
  await admin.evaluate(() => {
    window.adminChangeObserved = false
    const changed = event => {
      if (event.key !== 'llmquest_admin_v1') return
      window.removeEventListener('storage', changed)
      requestAnimationFrame(() => requestAnimationFrame(() => { window.adminChangeObserved = true }))
    }
    window.addEventListener('storage', changed)
  })
  await second.getByRole('button', { name: 'exit admin', exact: true }).click()
  await admin.waitForFunction(() => window.adminChangeObserved)
  await assertLocks(second, true)
  assert.equal(await toggle(admin).isChecked(), false)
  assert.equal(await admin.locator('button[disabled][aria-label]').count(), 0)
  assert.equal(await admin.evaluate(key => localStorage.getItem(key), preferenceKey), null)
  await admin.getByRole('link', { name: 'Concepts', exact: true }).click()
  await admin.getByRole('link', { name: '← Map', exact: true }).click()
  await assertLocks(admin, false)
  await admin.getByRole('button', { name: 'Compare Architectures Without a Winner Narrative: available', exact: true }).click()
  await admin.getByRole('button', { name: '← Map', exact: true }).waitFor()
  await assertPane(admin, { width: 1280 })
  assert.deepEqual(errors, [])
  await context.close()
  console.log('PASS: admin default, explicit override, failed-write choice across admin changes, pane state with failed writes')
} finally {
  await browser?.close()
  await server?.close()
}
