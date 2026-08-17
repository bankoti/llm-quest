// Renders a 1200x630 (OG-image sized) share card PNG on an offscreen canvas.
// Pure client-side: the download link gets a data URL, no backend involved.

export interface ShareCardInput {
  name: string          // may be empty — card omits the name line
  rankTitle: string
  rankColor: string
  xp: number
  completed: number
  total: number
  done: boolean
  code: string          // completion code, shown only when done
  siteName: string
  tagline: string
  domain: string
}

export async function renderShareCard(input: ShareCardInput): Promise<string> {
  // Inter is loaded by the page; wait so canvas text uses it instead of a fallback.
  try { await document.fonts.ready } catch { /* draw with fallback fonts */ }

  const W = 1200, H = 630
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d context unavailable')

  // Background
  ctx.fillStyle = '#0b0b12'
  ctx.fillRect(0, 0, W, H)

  // Subtle dot grid
  ctx.fillStyle = 'rgba(124, 58, 237, 0.10)'
  for (let x = 40; x < W; x += 48) {
    for (let y = 40; y < H; y += 48) {
      ctx.beginPath()
      ctx.arc(x, y, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Border
  ctx.strokeStyle = '#7c3aed'
  ctx.lineWidth = 4
  ctx.strokeRect(24, 24, W - 48, H - 48)

  const mono = 'ui-monospace, "JetBrains Mono", Consolas, monospace'
  const sans = 'Inter, system-ui, sans-serif'

  // Header: wordmark + domain
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#a78bfa'
  ctx.font = `bold 34px ${mono}`
  ctx.textAlign = 'left'
  ctx.fillText(`\u26A1 ${input.siteName}`, 72, 106)
  ctx.fillStyle = '#6b7280'
  ctx.font = `24px ${mono}`
  ctx.textAlign = 'right'
  ctx.fillText(input.domain, W - 72, 106)

  // Headline: name (optional) + achievement
  ctx.textAlign = 'center'
  let y = input.name ? 240 : 270
  if (input.name) {
    ctx.fillStyle = '#f9fafb'
    ctx.font = `bold 58px ${sans}`
    ctx.fillText(input.name, W / 2, y)
    y += 76
  }
  ctx.fillStyle = input.rankColor
  ctx.font = `bold 64px ${sans}`
  ctx.fillText(input.done ? `Completed \u00B7 ${input.rankTitle}` : `Rank: ${input.rankTitle}`, W / 2, y)

  // Stats line
  y += 62
  ctx.fillStyle = '#d1d5db'
  ctx.font = `30px ${mono}`
  ctx.fillText(
    `${input.xp.toLocaleString()} XP \u00B7 ${input.completed}/${input.total} levels`,
    W / 2, y,
  )

  // Progress bar
  y += 48
  const barW = 640, barH = 14, barX = (W - barW) / 2
  ctx.fillStyle = '#1f2937'
  ctx.beginPath()
  ctx.roundRect(barX, y, barW, barH, barH / 2)
  ctx.fill()
  const frac = input.total > 0 ? input.completed / input.total : 0
  if (frac > 0) {
    ctx.fillStyle = '#7c3aed'
    ctx.beginPath()
    ctx.roundRect(barX, y, Math.max(barH, barW * frac), barH, barH / 2)
    ctx.fill()
  }

  // Footer: tagline + completion code when finished
  ctx.fillStyle = '#6b7280'
  ctx.font = `24px ${sans}`
  ctx.fillText(input.tagline, W / 2, H - 110)
  if (input.done && input.code) {
    ctx.font = `20px ${mono}`
    ctx.fillStyle = '#4b5563'
    ctx.fillText(`Completion code ${input.code}`, W / 2, H - 68)
  }

  return canvas.toDataURL('image/png')
}
