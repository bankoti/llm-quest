import assert from 'node:assert/strict'
import path from 'node:path'
import { createServer } from 'vite'

const root = path.resolve(import.meta.dirname, '..')
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' })
try {
  const { INTERACTIVE_LESSONS: lessons, WARMUPS } = await server.ssrLoadModule('/src/interactive/curriculum.ts')
  const { ALL_LEVELS: levels } = await server.ssrLoadModule('/src/data/curriculum.ts')
  const { REVIEW_QUESTIONS: review } = await server.ssrLoadModule('/src/data/review.ts')
  const slugs = new Set(lessons.map(l => l.slug))
  assert.equal(slugs.size, lessons.length, 'duplicate lesson slug')
  assert.ok(lessons.length >= 52, 'expected at least 52 lessons')
  for (const slug of ['matmul', 'qkv-attention', 'causal-attention', 'parameter-counts', 'training-data', 'adaptation-capstone', 'systems-capstone', 'application-capstone']) {
    assert.ok(slugs.has(slug), `missing core lesson: ${slug}`)
  }
  for (const [file, name] of [
    ['foundationLessons', 'FOUNDATION_LESSONS'], ['modelLessons', 'MODEL_LESSONS'],
    ['adaptationLessons', 'ADAPTATION_LESSONS'], ['systemsLessons', 'SYSTEMS_LESSONS'],
    ['paperSystemsLessons', 'PAPER_SYSTEMS_LESSONS'], ['applicationLessons', 'APPLICATION_LESSONS'],
    ['extensionLessons', 'EXTENSION_LESSONS'], ['papersLessons', 'PAPERS_LESSONS'],
  ]) {
    const module = await server.ssrLoadModule(`/src/interactive/${file}.ts`)
    for (const lesson of module[name]) assert.ok(lessons.includes(lesson), `curriculum omits ${lesson.slug}`)
  }
  const choiceAnswers = new Set()
  function checkChoice(question, context, answers) {
    assert.ok(Array.isArray(question.options) && question.options.length > 1, `${context}: missing options`)
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length, `${context}: invalid answer index`)
    answers.add(question.answer)
  }
  for (const lesson of lessons) {
    for (const field of ['moduleId', 'moduleTitle']) assert.ok(lesson[field], `${lesson.slug}: missing ${field}`)
    for (const field of ['prerequisites', 'outcomes', 'concepts', 'steps']) assert.ok(Array.isArray(lesson[field]), `${lesson.slug}: missing ${field}`)
    assert.ok(lesson.steps.some(s => s.kind === 'concept'), `${lesson.slug}: no concept orientation`)
    assert.ok(lesson.steps.filter(s => ['mcq', 'predict', 'numeric'].includes(s.kind)).length >= 2, `${lesson.slug}: fewer than two scored groups`)
    for (const step of lesson.steps) {
      if (step.kind === 'mcq') checkChoice(step, lesson.slug, choiceAnswers)
      if (step.kind === 'predict' || step.kind === 'numeric') {
        assert.ok(step.questions.length > 0, `${lesson.slug}: empty question group`)
        for (const question of step.questions) {
          if (step.kind === 'predict') checkChoice(question, lesson.slug, choiceAnswers)
          else assert.ok(Number.isFinite(question.answer), `${lesson.slug}: invalid numeric answer`)
        }
      }
    }
  }
  assert.ok(choiceAnswers.size >= 3, 'choice answers must use at least three positions')
  assert.equal(Object.keys(WARMUPS).length, levels.length, 'warm-up count differs from level count')
  const covered = new Set(review.map(q => q.levelId))
  for (const level of levels) {
    assert.ok(slugs.has(WARMUPS[level.id]), `${level.id}: missing or invalid warm-up`)
    if (level.courseId !== 0) assert.ok(covered.has(level.id), `${level.id}: no spaced-review card`)
  }
  const reviewAnswers = new Set()
  for (const question of review) checkChoice(question, question.id, reviewAnswers)
  assert.ok(reviewAnswers.size >= 3, 'review answers must use at least three positions')
  console.log(`Curriculum validation passed: ${lessons.length} concept lessons, ${levels.length} coding levels, ${Object.keys(WARMUPS).length} standalone warm-ups, review coverage complete.`)
} finally {
  await server.close()
}
