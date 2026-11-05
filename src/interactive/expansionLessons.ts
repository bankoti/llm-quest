import type { InteractiveLesson, Step } from './types'
import { EXPANSION_TRACKS, trackPrefix, unitSlug } from '../data/expansion'
import { EXPANSION_WIDGETS } from './expansionWidgets'

export const EXPANSION_LESSONS: InteractiveLesson[] = EXPANSION_TRACKS.flatMap(track => track.units.map(unit => {
  const steps: Step[] = unit.sections.map(section => ({ kind: 'concept', ...section }))
  steps.push({ kind: 'worked', ...unit.worked })
  if (unit.widget) steps.push({ kind: 'widget', widget: EXPANSION_WIDGETS[unit.widget] })
  steps.push({ kind: 'numeric', ...unit.numeric }, ...unit.questions.map(question => ({ kind: 'mcq' as const, ...question })))
  steps.push({ kind: 'concept', title: 'Experiment and Evidence', lines: [...unit.interpretation, `Primary source: ${unit.sourceTitle}. The coding lab includes the source link, a worked solution, a CPU notebook, and transfer problems.`] })
  return {
    slug: unitSlug(track, unit.key), title: unit.title, emoji: '', blurb: unit.summary,
    minutes: 20, moduleId: trackPrefix(track.id), moduleTitle: track.title,
    prerequisites: unit.prerequisites, outcomes: unit.outcomes, concepts: unit.concepts,
    track: 'extension' as const, steps,
  }
}))
