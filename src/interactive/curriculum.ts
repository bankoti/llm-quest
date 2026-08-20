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
export { WARMUPS } from './warmups'

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

