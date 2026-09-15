export const BYTE_EOT = 256

export function nextByteMass(probabilities: number[], tokens: number[][], prefix: number[], useEot: boolean): number[] {
  const mass = Array(useEot ? 257 : 256).fill(0) as number[]
  tokens.forEach((token, i) => {
    if (!prefix.every((b, j) => token[j] === b)) return
    const symbol = token.length === prefix.length ? (useEot ? BYTE_EOT : -1) : token[prefix.length]
    if (symbol >= 0) mass[symbol] += probabilities[i]
  })
  const total = mass.reduce((a, b) => a + b, 0)
  return total ? mass.map(p => p / total) : mass
}

export function evidenceRegion(measured: number[], target: number): 'measured' | 'interpolated' | 'extrapolated' {
  if (measured.includes(target)) return 'measured'
  return Math.min(...measured) < target && target < Math.max(...measured) ? 'interpolated' : 'extrapolated'
}
