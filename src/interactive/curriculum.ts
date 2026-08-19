// Dependency-first interactive curriculum.
// Foundation/model lessons are rewritten for novices; advanced lessons retain
// the strongest existing application content and follow only after the core.
import type { InteractiveLesson } from './types'
import { FOUNDATION_LESSONS } from './foundationLessons'
import { MODEL_LESSONS } from './modelLessons'
import { ADAPTATION_LESSONS } from './adaptationLessons'
import { SYSTEMS_LESSONS } from './systemsLessons'
import { APPLICATION_LESSONS } from './applicationLessons'
import { EXTENSION_LESSONS } from './extensionLessons'
import { WARMUPS as LEGACY_WARMUPS } from './lessons'

export const INTERACTIVE_LESSONS: InteractiveLesson[] = [
  ...FOUNDATION_LESSONS,
  ...MODEL_LESSONS,
  ...ADAPTATION_LESSONS,
  ...SYSTEMS_LESSONS,
  ...APPLICATION_LESSONS,
  ...EXTENSION_LESSONS,
]

export const LESSON_BY_SLUG = new Map(INTERACTIVE_LESSONS.map(l => [l.slug, l]))

export function unmetPrerequisites(slug: string, completed: Set<string>): string[] {
  return LESSON_BY_SLUG.get(slug)?.prerequisites.filter(p => !completed.has(p)) ?? []
}

export const MODULES = [...new Map(INTERACTIVE_LESSONS.map(l => [l.moduleId, { id: l.moduleId, title: l.moduleTitle }])).values()]

// Keep existing main-track links working, then point foundational challenges to
// the smallest lesson that actually teaches their prerequisite.
export const WARMUPS: Record<string, string> = {
  ...LEGACY_WARMUPS,
  'c0-l4': 'axes-and-slices',
  'c1-l1': 'numbers-to-tensors',
  'c1-l2': 'subword-tokenization',
  'c1-l3': 'training-objective',
  'c1-l4': 'next-token-prediction',
  'c1-l5': 'gradients',
  'c1-l6': 'causal-attention',
  'c1-d1': 'causal-attention',
  'c1-l7': 'transformer-block',
  'c2-l1': 'position-information',
  'c2-l4': 'transformer-block',
  'c5-l2': 'dot-product-similarity',
  'c6-l2': 'distillation',
  'c6-l3': 'calibration',
  'c6-l4': 'rlhf-reward-models',
  'c6-d1': 'calibration',
  'c8-l1': 'validation-generalization',
  'c8-l3': 'validation-generalization',
  'c9-l3': 'direct-preference-optimization',
  'c9-l4': 'direct-preference-optimization',
  'c2-l2': 'grouped-query-attention',
  'c2-l3': 'mixture-of-experts',
  'c2-l6': 'kv-cache',
  'c3-l3': 'mixture-of-experts',
  'c5-l1': 'retrieval-quality',
  'c5-l3': 'retrieval-quality',
  'c5-l5': 'retrieval-quality',
  'c5-l6': 'retrieval-basics',
  'c7-l4': 'agent-reliability',
  'c7-d1': 'agent-reliability',
  'c7-l7': 'precision-quantization',
  'c7-l8': 'speculative-decoding',
  'c9-l1': 'scaling-laws',
  'c9-l7': 'speculative-decoding',
}
