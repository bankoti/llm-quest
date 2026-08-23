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
import { PAPERS_LESSONS } from './papersLessons'
export { WARMUPS } from './warmups'

export const INTERACTIVE_LESSONS: InteractiveLesson[] = [
  ...FOUNDATION_LESSONS,
  ...MODEL_LESSONS,
  ...ADAPTATION_LESSONS,
  ...SYSTEMS_LESSONS,
  ...APPLICATION_LESSONS,
  ...EXTENSION_LESSONS,
  ...PAPERS_LESSONS,
]

export const LESSON_BY_SLUG = new Map(INTERACTIVE_LESSONS.map(l => [l.slug, l]))

export function unmetPrerequisites(slug: string, completed: Set<string>): string[] {
  return LESSON_BY_SLUG.get(slug)?.prerequisites.filter(p => !completed.has(p)) ?? []
}

// Build-line narrative for the hub. `builds` = what the learner has after the
// stage; optional modules sit outside the numbered assembly line.
export const MODULE_META: Record<string, { builds: string; short: string; optional?: boolean }> = {
  foundations: { short: 'Raw materials', builds: 'Text turned into tensors a model can compute with, plus the one operation (matmul) everything downstream reuses.' },
  transformer: { short: 'Transformer', builds: 'A complete transformer assembled piece by piece — attention, positions, blocks — then switched on to predict its first token.' },
  training: { short: 'Training', builds: 'Weights actually learned from data: the loss, gradients, backprop, the optimizer loop, and knowing when to stop.' },
  generation: { short: 'Generation', builds: 'Control over what your trained model says: sampling, temperature, and how a real LLM behaves in practice.' },
  adaptation: { short: 'Alignment', builds: 'The base model shaped into an assistant: fine-tuning, LoRA, preference learning, and calibrated confidence.' },
  systems: { short: 'Serving', builds: 'The same model made fast and affordable: KV caching, quantization, and the architecture tricks production systems use.' },
  applications: { short: 'Products', builds: 'Things built on top: retrieval, tool use, agents, and the economics of running them.' },
  frontier: { short: 'Frontier', builds: 'Optional deep dives past the core build.', optional: true },
  papers: { short: 'Papers', builds: 'Optional history: the papers where these ideas first appeared, read with the concepts you now have.', optional: true },
}

export const MODULES = [...new Map(INTERACTIVE_LESSONS.map(l => [l.moduleId, { id: l.moduleId, title: l.moduleTitle }])).values()]

