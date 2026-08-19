// Curriculum integrity gate. Intentionally reads source rather than importing TS,
// so it runs in the same no-extra-dependency environment as the project build.
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const files = [
  'src/interactive/foundationLessons.ts',
  'src/interactive/modelLessons.ts',
  'src/interactive/adaptationLessons.ts',
  'src/interactive/systemsLessons.ts',
  'src/interactive/applicationLessons.ts',
  'src/interactive/extensionLessons.ts',
]
const source = files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n')
const errors = []

const slugs = [...source.matchAll(/\bslug:\s*'([^']+)'/g)].map(m => m[1])
const unique = new Set(slugs)
if (slugs.length !== unique.size) errors.push(`duplicate lesson slug: ${slugs.filter((s, i) => slugs.indexOf(s) !== i).join(', ')}`)
if (slugs.length < 25) errors.push(`expected at least 25 rewritten novice-first lessons, found ${slugs.length}`)

for (const required of ['matmul','softmax-probabilities','qkv-attention','training-objective','gradients','backpropagation','lora','distillation','rlhf-reward-models','direct-preference-optimization','calibration']) {
  if (!unique.has(required)) errors.push(`missing core lesson: ${required}`)
}

const lessonStarts = [...source.matchAll(/\n\s{2}\{\n\s{4}slug:/g)].map(m => m.index)
for (let i = 0; i < lessonStarts.length; i++) {
  const block = source.slice(lessonStarts[i], lessonStarts[i + 1] ?? source.length)
  const slug = /slug:\s*'([^']+)'/.exec(block)?.[1] ?? `lesson-${i}`
  for (const field of ['moduleId:', 'moduleTitle:', 'prerequisites:', 'outcomes:', 'concepts:', 'steps:']) {
    if (!block.includes(field)) errors.push(`${slug}: missing ${field}`)
  }
  const scored = (block.match(/kind:\s*'(mcq|predict|numeric)'/g) ?? []).length
  if (scored < 2) errors.push(`${slug}: only ${scored} scored checks`)
  if (!block.includes("kind:'concept'") && !block.includes("kind: 'concept'")) errors.push(`${slug}: no concept orientation`)
}

const curriculum = fs.readFileSync(path.join(root, 'src/interactive/curriculum.ts'), 'utf8')
for (const required of ['...FOUNDATION_LESSONS','...MODEL_LESSONS','...ADAPTATION_LESSONS','...SYSTEMS_LESSONS','...APPLICATION_LESSONS','...EXTENSION_LESSONS']) {
  if (!curriculum.includes(required)) errors.push(`curriculum assembly missing ${required}`)
}
const player = fs.readFileSync(path.join(root, 'src/interactive/InteractiveLessonPage.tsx'), 'utf8')
if (!player.includes('step.questions[current]')) errors.push('player does not render multi-question steps sequentially')
if (!player.includes("s.kind === 'worked'")) errors.push('player does not render worked examples')

if (errors.length) {
  console.error(`Interactive curriculum validation failed (${errors.length}):`)
  for (const e of errors) console.error(`- ${e}`)
  process.exit(1)
}
console.log(`Interactive curriculum validation passed: ${slugs.length} rewritten lessons, ${unique.size} unique slugs.`)
