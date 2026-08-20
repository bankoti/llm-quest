// Build-time integrity gate for the concept course, coding bridge, and review data.
import fs from 'node:fs'
import path from 'node:path'
const root=path.resolve(import.meta.dirname,'..')
const lessonFiles=['foundationLessons.ts','modelLessons.ts','adaptationLessons.ts','systemsLessons.ts','applicationLessons.ts','extensionLessons.ts'].map(f=>`src/interactive/${f}`)
const source=lessonFiles.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n')
const errors=[]
const slugs=[...source.matchAll(/\bslug:\s*'([^']+)'/g)].map(m=>m[1]), unique=new Set(slugs)
if(slugs.length!==unique.size)errors.push(`duplicate lesson slug: ${slugs.filter((s,i)=>slugs.indexOf(s)!==i).join(', ')}`)
if(slugs.length<52)errors.push(`expected at least 52 lessons, found ${slugs.length}`)
for(const required of ['matmul','qkv-attention','causal-attention','parameter-counts','training-data','adaptation-capstone','systems-capstone','application-capstone'])if(!unique.has(required))errors.push(`missing core lesson: ${required}`)
const starts=[...source.matchAll(/\n\s{2}\{\n\s{4}slug:/g)].map(m=>m.index)
const choiceAnswers=[...source.matchAll(/options:\s*\[[^\]]+\],\s*answer:\s*(\d+)/g)].map(m=>Number(m[1]))
for(let i=0;i<starts.length;i++){
 const block=source.slice(starts[i],starts[i+1]??source.length), slug=/slug:\s*'([^']+)'/.exec(block)?.[1]??`lesson-${i}`
 for(const f of ['moduleId:','moduleTitle:','prerequisites:','outcomes:','concepts:','steps:'])if(!block.includes(f))errors.push(`${slug}: missing ${f}`)
 const scored=(block.match(/kind:\s*'(mcq|predict|numeric)'/g)??[]).length
 if(scored<2)errors.push(`${slug}: only ${scored} scored groups`)
 if(!block.includes("kind:'concept'")&&!block.includes("kind: 'concept'"))errors.push(`${slug}: no concept orientation`)
}
if(new Set(choiceAnswers).size<3)errors.push('choice-answer positions are not distributed across at least 3 source indices')
const curriculum=fs.readFileSync(path.join(root,'src/interactive/curriculum.ts'),'utf8')
for(const required of ['...FOUNDATION_LESSONS','...MODEL_LESSONS','...ADAPTATION_LESSONS','...SYSTEMS_LESSONS','...APPLICATION_LESSONS','...EXTENSION_LESSONS'])if(!curriculum.includes(required))errors.push(`curriculum assembly missing ${required}`)
const warmups=fs.readFileSync(path.join(root,'src/interactive/warmups.ts'),'utf8')
const curriculumData=fs.readFileSync(path.join(root,'src/data/curriculum.ts'),'utf8')
const levelIds=[...curriculumData.matchAll(/\{ id:'(c\d+-(?:l|d)\d+)'/g)].map(m=>m[1])
const mappings=new Map([...warmups.matchAll(/'(c\d+-(?:l|d)\d+)':'([^']+)'/g)].map(m=>[m[1],m[2]]))
for(const id of levelIds){if(!mappings.has(id))errors.push(`missing standalone warm-up mapping: ${id}`);else if(!unique.has(mappings.get(id)))errors.push(`${id}: warm-up target does not exist: ${mappings.get(id)}`)}
if(mappings.size!==levelIds.length)errors.push(`warm-up mapping count ${mappings.size} does not match level count ${levelIds.length}`)
const review=fs.readFileSync(path.join(root,'src/data/review.ts'),'utf8')
const covered=new Set([...review.matchAll(/levelId:\s*'(c\d+-(?:l|d)\d+)'/g)].map(m=>m[1]))
for(const id of levelIds.filter(x=>!x.startsWith('c0-')))if(!covered.has(id))errors.push(`no spaced-review card for ${id}`)
const reviewAnswers=[...review.matchAll(/options:\s*\[[^\]]+\],\s*answer:\s*(\d+)/g)].map(m=>Number(m[1]))
if(new Set(reviewAnswers).size<3)errors.push('review answer positions are not distributed across at least 3 source indices')
const player=fs.readFileSync(path.join(root,'src/interactive/InteractiveLessonPage.tsx'),'utf8')
if(!player.includes('step.questions[current]'))errors.push('player does not render multi-question steps sequentially')
if(!player.includes('showConfidence = true'))errors.push('player lacks optional confidence lock-in')
if(errors.length){console.error(`Curriculum validation failed (${errors.length}):`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log(`Curriculum validation passed: ${slugs.length} concept lessons, ${levelIds.length} coding levels, ${mappings.size} standalone warm-ups, review coverage complete.`)
