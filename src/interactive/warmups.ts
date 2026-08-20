// Standalone coding-level warm-ups. These reuse one concept, one worked example,
// and one check from the interactive curriculum but deliberately ignore the
// full interactive prerequisite graph: a warm-up is a just-in-time refresher,
// not a second course gate.
export const WARMUPS: Record<string, string> = {
  'c0-l1':'numbers-to-tensors','c0-l2':'axes-and-slices','c0-l3':'next-token-prediction','c0-l4':'axes-and-slices','c0-l5':'matmul',
  'c1-l1':'numbers-to-tensors','c1-l2':'subword-tokenization','c1-l3':'training-objective','c1-l4':'next-token-prediction','c1-l5':'gradients','c1-l6':'causal-attention','c1-d1':'causal-attention','c1-l7':'transformer-block',
  'c2-l1':'position-information','c2-l2':'grouped-query-attention','c2-l3':'mixture-of-experts','c2-l4':'transformer-block','c2-l5':'qkv-attention','c2-l6':'kv-cache','c2-l7':'grouped-query-attention','c2-d1':'transformer-block',
  'c3-l1':'inference-loop','c3-l2':'long-context-architectures','c3-l3':'reading-model-cards','c3-l4':'long-context-architectures','c3-l5':'reading-model-cards','c3-d1':'kv-cache','c3-l6':'model-capstone',
  'c4-l1':'application-capstone','c4-l2':'validation-generalization','c4-l3':'agent-reliability','c4-l4':'reading-model-cards','c4-l5':'token-economics','c4-d1':'calibration','c4-l6':'application-capstone',
  'c5-l1':'retrieval-quality','c5-l2':'dot-product-similarity','c5-l3':'retrieval-quality','c5-l4':'retrieval-basics','c5-l5':'retrieval-quality','c5-d1':'retrieval-quality','c5-l6':'retrieval-basics',
  'c6-l1':'retrieval-quality','c6-l5':'validation-generalization','c6-l3':'calibration','c6-l4':'rlhf-reward-models','c6-l2':'distillation','c6-d1':'calibration','c6-l6':'validation-generalization',
  'c7-l1':'agent-reliability','c7-l2':'kv-cache','c7-l3':'token-economics','c7-l4':'agent-reliability','c7-l5':'agent-reliability','c7-d1':'agent-reliability','c7-l7':'precision-quantization','c7-l8':'speculative-decoding','c7-l6':'agent-reliability',
  'c8-l1':'validation-generalization','c8-l2':'application-capstone','c8-l3':'calibration','c8-l4':'reading-model-cards','c8-l5':'application-capstone','c8-d1':'calibration','c8-l6':'application-capstone',
  'c9-l1':'scaling-laws','c9-l2':'training-data','c9-l3':'direct-preference-optimization','c9-l4':'direct-preference-optimization','c9-l5':'reading-model-cards','c9-l7':'speculative-decoding','c9-d1':'scaling-laws','c9-l6':'scaling-laws',
}

const KEY = 'llmquest_warmups_v1'
export function loadWarmupCompletions(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}
export function warmupDone(levelId: string): boolean { return loadWarmupCompletions().includes(levelId) }
export function markWarmupDone(levelId: string): void {
  const ids = loadWarmupCompletions()
  if (!ids.includes(levelId)) localStorage.setItem(KEY, JSON.stringify([...ids, levelId]))
}
