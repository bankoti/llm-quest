// Small, deterministic models shared by the visual experiments and their tests.
export function allocation(compute: number, parameterRatio: number) {
  if (!(compute > 0) || !(parameterRatio > 0)) throw new Error('Positive budget and ratio required')
  const optimalN = Math.sqrt(compute / 120)
  const params = optimalN * parameterRatio
  const tokens = compute / (6 * params)
  // Symmetric teaching proxy, not the fitted Chinchilla loss or a prediction.
  const proxy = Math.sqrt(optimalN / params) + Math.sqrt(20 * optimalN / tokens)
  return { params, tokens, compute: 6 * params * tokens, proxy }
}

export function onlineStep(state: { max: number; sum: number; weighted: number }, scores: number[], values: number[]) {
  const max = Math.max(state.max, ...scores)
  const correction = Math.exp(state.max - max)
  const weights = scores.map(x => Math.exp(x - max))
  const sum = correction * state.sum + weights.reduce((a, b) => a + b, 0)
  const weighted = correction * state.weighted + weights.reduce((a, b, i) => a + b * values[i], 0)
  return { max, sum, weighted }
}

export function zeroBytes(params: number, ranks: number, stage: number) {
  const shard = Math.ceil(params / ranks)
  return {
    weights: 2 * (stage >= 3 ? shard : params),
    gradients: 2 * (stage >= 2 ? shard : params),
    optimizer: 12 * (stage >= 1 ? shard : params),
  }
}

export function switchPlan(assignments: number[], experts: number, factor: number) {
  const capacity = Math.ceil(assignments.length * factor / experts)
  const load = Array(experts).fill(0) as number[]
  const accepted = assignments.map(e => ++load[e] <= capacity)
  return { capacity, load, accepted, dropped: accepted.filter(x => !x).length }
}
