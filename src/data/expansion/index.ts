import type { Course } from '../curriculum'
import type { ReviewQuestion } from '../review'
import type { LearningTrack } from './types'
import { SCRATCH_TRACK } from './scratch'
import { DYNAMICS_TRACK } from './dynamics'
import { RL_TRACK } from './rl'
import { EMBODIED_TRACK } from './embodied'

const extraSources: Record<string, { title: string; url: string }[]> = {
  '11/06_search': [{ title: 'Lowerre: HARPY thesis abstract', url: 'https://www.csd.cs.cmu.edu/academics/doctoral/degrees-conferred/bruce-lowerre' }],
  '13/01_vision': [{ title: 'An Image is Worth 16x16 Words', url: 'https://arxiv.org/abs/2010.11929' }, { title: 'ImageNet Classification with Deep Convolutional Neural Networks', url: 'https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks' }],
  '13/02_ssl': [{ title: 'DINOv3', url: 'https://arxiv.org/abs/2508.10104' }],
  '13/03_actions': [{ title: 'Demonstrating Large Language Models on Robots', url: 'https://www.roboticsproceedings.org/rss19/p024.pdf' }, { title: 'RT-1', url: 'https://arxiv.org/abs/2212.06817' }, { title: 'PaLM-E', url: 'https://arxiv.org/abs/2303.03378' }, { title: 'RT-2', url: 'https://arxiv.org/abs/2307.15818' }],
  '13/04_latents': [{ title: 'LeWorldModel', url: 'https://arxiv.org/abs/2603.19312' }],
  '13/06_evidence': [{ title: 'CLIP', url: 'https://arxiv.org/abs/2103.00020' }, { title: 'V-JEPA 2', url: 'https://arxiv.org/abs/2506.09985' }, { title: 'LeWorldModel', url: 'https://arxiv.org/abs/2603.19312' }],
}
export const EXPANSION_TRACKS: LearningTrack[] = [SCRATCH_TRACK, DYNAMICS_TRACK, RL_TRACK, EMBODIED_TRACK].map(track => ({
  ...track, units: track.units.map(unit => ({ ...unit, references: extraSources[`${track.id}/${unit.key}`] ?? [] })),
}))
export const trackPrefix = (id: number) => ({ 10: 'scratch', 11: 'dynamics', 12: 'rl', 13: 'embodied' }[id]!)
export const unitSlug = (track: LearningTrack, key: string) => `${trackPrefix(track.id)}-${key}`
export const EXPANSION_COURSES: Course[] = EXPANSION_TRACKS.map(track => ({
  ...track,
  levels: track.units.map((unit, index) => ({
    id: `c${track.id}-l${index + 1}`, courseId: track.id, index: index + 1,
    title: unit.title, description: unit.summary, xp: index === track.units.length - 1 ? 500 : 250,
    type: index === track.units.length - 1 ? 'boss' : 'challenge',
    lessonFile: `c${track.id}/${unit.key}.md`, challengeFile: `c${track.id}/${unit.key}.py`, estimateMinutes: 75,
  })),
}))
export const EXPANSION_HINTS = Object.fromEntries(EXPANSION_TRACKS.flatMap(t => t.units.map((u, i) => [`c${t.id}-l${i + 1}`, u.hints])))
export const EXPANSION_WARMUPS = Object.fromEntries(EXPANSION_TRACKS.flatMap(t => t.units.map((u, i) => [`c${t.id}-l${i + 1}`, unitSlug(t, u.key)])))
export const EXPANSION_REVIEW: ReviewQuestion[] = EXPANSION_TRACKS.flatMap(t => t.units.flatMap((u, i) => u.questions.map((q, j) => ({ ...q, id: `c${t.id}-l${i + 1}-q${j + 1}`, levelId: `c${t.id}-l${i + 1}` }))))
export const EXPANSION_LABS = Object.fromEntries(EXPANSION_TRACKS.flatMap(t => t.units.map(u => [`c${t.id}/${u.key}.py`, { paper: u.source, sourceLabel: u.sourceTitle, explanation: u.worked.takeaway, experiment: true }])))
