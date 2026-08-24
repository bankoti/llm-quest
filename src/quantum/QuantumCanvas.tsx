import { useEffect, useRef } from 'react'

export type QuantumScene = 'scale' | 'duality' | 'photons' | 'slits' | 'probability' | 'check' | 'complete'

interface Props {
  scene: QuantumScene
  scaleIndex: number
  dualityMode: 'particle' | 'wave'
  photonHits: number[]
  observed: boolean
  measurement: 'left' | 'right' | null
}

const scaleNames = ['You', 'A hair', 'A cell', 'An atom', 'An electron']

export function sampleInterference(): number {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const y = 0.08 + Math.random() * 0.84
    const centered = y - 0.5
    const envelope = Math.exp(-centered * centered * 10)
    const bands = 0.14 + 0.86 * Math.cos(centered * 34) ** 2
    if (Math.random() < envelope * bands) return y
  }
  return 0.5
}

export function QuantumCanvas({ scene, scaleIndex, dualityMode, photonHits, observed, measurement }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let frame = 0
    let width = 0
    let height = 0
    let animationFrame = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(bounds.width, 1)
      height = Math.max(bounds.height, 1)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const line = (x1: number, y1: number, x2: number, y2: number, color: string, size = 2) => {
      context.beginPath()
      context.moveTo(x1, y1)
      context.lineTo(x2, y2)
      context.strokeStyle = color
      context.lineWidth = size
      context.stroke()
    }

    const dot = (x: number, y: number, radius: number, color: string) => {
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fillStyle = color
      context.fill()
    }

    const drawGrid = () => {
      context.fillStyle = '#080b14'
      context.fillRect(0, 0, width, height)
      for (let x = 18; x < width; x += 28) {
        for (let y = 18; y < height; y += 28) dot(x, y, 1, '#1f2937')
      }
    }

    const drawScale = (time: number) => {
      const centerX = width * 0.5
      const centerY = height * 0.48
      const pulse = reducedMotion ? 0 : Math.sin(time * 0.002) * 4
      const radii = [Math.min(width, height) * 0.32, 92, 54, 25, 7]
      const colors = ['#e5e7eb', '#22d3ee', '#fb7185', '#a78bfa', '#fbbf24']
      context.save()
      context.globalAlpha = 0.14
      dot(centerX, centerY, radii[scaleIndex] + pulse + 18, colors[scaleIndex])
      context.restore()
      dot(centerX, centerY, Math.max(7, radii[scaleIndex] + pulse), colors[scaleIndex])
      if (scaleIndex === 0) {
        dot(centerX, centerY - radii[0] * 0.45, radii[0] * 0.12, '#f6d5b5')
        context.fillStyle = '#374151'
        context.fillRect(centerX - radii[0] * 0.12, centerY - radii[0] * 0.26, radii[0] * 0.24, radii[0] * 0.48)
      } else if (scaleIndex === 2) {
        for (let i = 0; i < 7; i += 1) {
          const angle = i * 1.7 + time * 0.0002
          dot(centerX + Math.cos(angle) * 24, centerY + Math.sin(angle) * 24, 4, '#fecdd3')
        }
      } else if (scaleIndex === 3) {
        dot(centerX, centerY, 7, '#fbbf24')
        context.strokeStyle = '#ddd6fe'
        context.lineWidth = 2
        for (let ring = 0; ring < 3; ring += 1) {
          context.save()
          context.translate(centerX, centerY)
          context.rotate((ring * Math.PI) / 3 + time * 0.00015)
          context.beginPath()
          context.ellipse(0, 0, 48, 16, 0, 0, Math.PI * 2)
          context.stroke()
          context.restore()
        }
      } else if (scaleIndex === 4) {
        context.save()
        context.globalAlpha = 0.38
        for (let i = 0; i < 22; i += 1) {
          const angle = i * 2.4 + time * 0.00025
          const radius = 12 + ((i * 17) % 48)
          dot(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius, 3, '#fbbf24')
        }
        context.restore()
        dot(centerX, centerY, 5, '#a78bfa')
      }
      context.fillStyle = '#e5e7eb'
      context.font = '600 13px system-ui'
      context.textAlign = 'center'
      context.fillText(scaleNames[scaleIndex], centerX, height - 34)
      context.font = '12px ui-monospace, monospace'
      context.fillStyle = '#6b7280'
      context.fillText(['1 m', '0.0001 m', '0.00001 m', '0.0000000001 m', 'smaller still'][scaleIndex], centerX, height - 15)
    }

    const drawDuality = (time: number) => {
      const mid = height * 0.52
      line(42, mid + 72, width - 42, mid + 72, '#374151', 2)
      if (dualityMode === 'particle') {
        const travel = ((time * 0.00024) % 1) * (width - 130)
        const x = 65 + travel
        const y = mid - Math.abs(Math.sin(travel * 0.027)) * 85
        context.save()
        context.globalAlpha = 0.16
        dot(x, y, 24, '#fb7185')
        context.restore()
        dot(x, y, 10, '#fb7185')
        for (let i = 1; i < 5; i += 1) dot(x - i * 19, mid - Math.abs(Math.sin((travel - i * 19) * 0.027)) * 85, 4, '#7f1d1d')
      } else {
        context.beginPath()
        for (let x = 35; x < width - 35; x += 3) {
          const y = mid + Math.sin(x * 0.045 - time * 0.004) * 55
          if (x === 35) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.strokeStyle = '#a78bfa'
        context.lineWidth = 5
        context.stroke()
      }
      context.fillStyle = '#9ca3af'
      context.font = '600 12px system-ui'
      context.textAlign = 'left'
      context.fillText(dualityMode === 'particle' ? 'one place, one path' : 'spread out, many paths', 34, 32)
    }

    const drawApparatus = () => {
      context.fillStyle = '#d1d5db'
      context.fillRect(width * 0.43, 34, 8, height * 0.34)
      context.fillRect(width * 0.43, height * 0.66, 8, height * 0.34 - 34)
      context.fillRect(width * 0.43, height * 0.44, 8, height * 0.12)
      context.fillStyle = '#080b14'
      context.fillRect(width * 0.43, height * 0.35, 8, height * 0.09)
      context.fillRect(width * 0.43, height * 0.56, 8, height * 0.09)
      line(width * 0.87, 24, width * 0.87, height - 24, '#d1d5db', 5)
      dot(width * 0.13, height * 0.5, 13, '#fbbf24')
    }

    const drawPhotons = (time: number) => {
      drawApparatus()
      photonHits.forEach((hit, index) => {
        context.save()
        context.globalAlpha = Math.max(0.3, 1 - (photonHits.length - index) * 0.004)
        dot(width * 0.87, height * hit, 3.2, '#fb7185')
        context.restore()
      })
      for (let i = 0; i < Math.min(4, Math.max(1, photonHits.length)); i += 1) {
        const progress = (time * 0.00042 + i * 0.26) % 1
        const target = 0.5 + Math.sin(i * 4.7) * 0.27
        const x = width * (0.14 + progress * 0.72)
        const y = height * (0.5 + (target - 0.5) * Math.max(0, (progress - 0.42) / 0.58))
        context.save()
        context.globalAlpha = 0.9 - progress * 0.4
        dot(x, y, 4, '#fbbf24')
        context.restore()
      }
      context.fillStyle = '#9ca3af'
      context.font = '600 12px system-ui'
      context.textAlign = 'right'
      context.fillText(`${photonHits.length} detections`, width - 22, 26)
    }

    const drawSlits = (time: number) => {
      drawApparatus()
      const slitYs = [height * 0.395, height * 0.605]
      context.save()
      context.globalAlpha = observed ? 0.38 : 0.78
      slitYs.forEach((slitY, slitIndex) => {
        for (let ring = 0; ring < 6; ring += 1) {
          const radius = (time * 0.055 + ring * 42 + slitIndex * 9) % (width * 0.5)
          context.beginPath()
          context.arc(width * 0.44, slitY, radius, -Math.PI * 0.46, Math.PI * 0.46)
          context.strokeStyle = slitIndex === 0 ? '#a78bfa' : '#22d3ee'
          context.lineWidth = 2
          context.stroke()
        }
      })
      context.restore()
      for (let i = 0; i < 28; i += 1) {
        const y = 32 + (i / 27) * (height - 64)
        const centered = y / height - 0.5
        const intensity = observed
          ? Math.exp(-((centered - 0.18) ** 2) * 65) + Math.exp(-((centered + 0.18) ** 2) * 65)
          : Math.exp(-(centered ** 2) * 7) * (0.15 + 0.85 * Math.cos(centered * 32) ** 2)
        context.fillStyle = observed ? '#fb7185' : '#a78bfa'
        context.globalAlpha = Math.min(1, intensity)
        context.fillRect(width * 0.89, y - 3, Math.max(3, intensity * width * 0.08), 6)
      }
      context.globalAlpha = 1
      if (observed) {
        dot(width * 0.4, height * 0.395, 7, '#fb7185')
        dot(width * 0.4, height * 0.605, 7, '#fb7185')
      }
    }

    const drawProbability = (time: number) => {
      const baseline = height * 0.78
      line(28, baseline, width - 28, baseline, '#4b5563', 2)
      if (measurement) {
        const x = measurement === 'left' ? width * 0.34 : width * 0.67
        context.save()
        context.globalAlpha = 0.16
        dot(x, baseline - 86, 56 + Math.sin(time * 0.004) * 3, '#fb7185')
        context.restore()
        line(x, baseline, x, baseline - 130, '#fb7185', 4)
        dot(x, baseline - 130, 9, '#fb7185')
      } else {
        context.beginPath()
        for (let x = 28; x <= width - 28; x += 3) {
          const nx = x / width
          const envelope = Math.exp(-((nx - 0.5) ** 2) * 13)
          const wave = Math.sin(nx * 29 - time * 0.004) * 0.38 + 0.62
          const y = baseline - envelope * wave * height * 0.52
          if (x === 28) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.lineTo(width - 28, baseline)
        context.lineTo(28, baseline)
        context.closePath()
        context.fillStyle = 'rgba(167,139,250,0.18)'
        context.fill()
        context.strokeStyle = '#a78bfa'
        context.lineWidth = 4
        context.stroke()
        for (let i = 0; i < 54; i += 1) {
          const nx = 0.12 + (((i * 47) % 100) / 100) * 0.76
          const envelope = Math.exp(-((nx - 0.5) ** 2) * 13)
          const y = baseline - 10 - (((i * 31) % 100) / 100) * envelope * height * 0.38
          dot(nx * width, y, 2.2, i % 3 === 0 ? '#22d3ee' : '#a78bfa')
        }
      }
    }

    const drawAtom = (time: number, complete: boolean) => {
      const cx = width * 0.5
      const cy = height * 0.48
      if (complete) {
        for (let i = 0; i < 42; i += 1) {
          const angle = i * 2.399 + time * 0.00016
          const radius = 18 + i * 3.5
          const colors = ['#a78bfa', '#22d3ee', '#fb7185', '#fbbf24']
          dot(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.58, 3 + (i % 4), colors[i % colors.length])
        }
        dot(cx, cy, 24 + Math.sin(time * 0.003) * 2, '#e5e7eb')
        context.fillStyle = '#111827'
        context.font = '700 18px system-ui'
        context.textAlign = 'center'
        context.fillText('1', cx, cy + 6)
        return
      }
      context.strokeStyle = '#a78bfa'
      context.lineWidth = 3
      for (let ring = 0; ring < 3; ring += 1) {
        context.save()
        context.translate(cx, cy)
        context.rotate(ring * 1.05 + (reducedMotion ? 0 : time * 0.00022))
        context.beginPath()
        context.ellipse(0, 0, width * 0.27, height * 0.095, 0, 0, Math.PI * 2)
        context.stroke()
        const angle = time * 0.0016 + ring * 2
        dot(Math.cos(angle) * width * 0.27, Math.sin(angle) * height * 0.095, 6, ring === 1 ? '#fb7185' : '#22d3ee')
        context.restore()
      }
      dot(cx, cy, 17, '#fbbf24')
    }

    const render = (time: number) => {
      frame += 1
      drawGrid()
      if (scene === 'scale') drawScale(time)
      if (scene === 'duality') drawDuality(time)
      if (scene === 'photons') drawPhotons(time)
      if (scene === 'slits') drawSlits(time)
      if (scene === 'probability') drawProbability(time)
      if (scene === 'check') drawAtom(time, false)
      if (scene === 'complete') drawAtom(time, true)
      if (!reducedMotion || frame < 2) animationFrame = requestAnimationFrame(render)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    animationFrame = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
    }
  }, [scene, scaleIndex, dualityMode, photonHits, observed, measurement])

  return <canvas ref={canvasRef} className="qa-canvas" aria-label={`Animated ${scene} quantum experiment`} />
}
