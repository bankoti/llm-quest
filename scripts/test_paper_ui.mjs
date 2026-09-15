import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const root=path.resolve(import.meta.dirname,'..')
const server=await createServer({root,server:{host:'127.0.0.1',port:0}})
await server.listen()
const base=`http://127.0.0.1:${server.httpServer.address().port}`
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
let browser
const shots=process.env.PAPER_EVIDENCE_DIR ?? path.join(root,'.paper-test-output')
fs.mkdirSync(shots,{recursive:true})
const slugs=['scaling-laws','flash-attention','zero-sharding','switch-transformer','paged-attention','byte-boundaries','byte-distillation','byte-model-evaluation']

async function layout(page,name) {
  await page.waitForTimeout(500)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${name}: horizontal overflow`)
  await page.screenshot({path:path.join(shots,`${name}.png`),fullPage:true,animations:'disabled'})
}
async function click(page,name) {
  await page.getByRole('button',{name,exact:true}).click()
  // The existing lesson player keeps the outgoing screen during its 250ms exit.
  await page.waitForTimeout(300)
}
async function slider(page,id,value) {
  const input=page.locator(`#${id}`)
  const min=Number(await input.getAttribute('min'))
  const step=Number(await input.getAttribute('step')??1)
  await input.focus();await input.press('Home')
  for(let i=0;i<Math.round((value-min)/step);i++)await input.press('ArrowRight')
}
try {
  browser=await chromium.launch({headless:true,...(fs.existsSync(chrome)?{executablePath:chrome}:{})})
  for (const viewport of [{width:1280,height:900},{width:390,height:844}]) {
    const page=await browser.newPage({viewport,reducedMotion:'reduce'})
    const errors=[]
    page.on('pageerror',e=>errors.push(e.message))
    await page.goto(`${base}/interactive`)
    const data=await page.evaluate(async()=>{
      const {INTERACTIVE_LESSONS}=await import('/src/interactive/curriculum.ts')
      const {ALL_LEVELS}=await import('/src/data/curriculum.ts')
      return {lessons:INTERACTIVE_LESSONS.map(l=>({...l,steps:l.steps.map(s=>({...s,widget:undefined}))})),levels:ALL_LEVELS}
    })
    // Validate the actual assembled curriculum as data, including graph edges.
    const bySlug=new Map(data.lessons.map(l=>[l.slug,l]))
    const visiting=new Set(), visited=new Set()
    function visit(slug) {
      assert.ok(bySlug.has(slug),`missing prerequisite ${slug}`)
      assert.ok(!visiting.has(slug),`prerequisite cycle ${slug}`)
      if(visited.has(slug))return
      visiting.add(slug);for(const p of bySlug.get(slug).prerequisites)visit(p)
      visiting.delete(slug);visited.add(slug)
    }
    for(const l of data.lessons)visit(l.slug)
    const seed=Object.fromEntries(data.lessons.map(l=>[l.slug,{firstTries:1,scored:1,completedAt:new Date().toISOString()}]))
    await page.evaluate(({seed,levels})=>{
      localStorage.setItem('llmquest_interactive_v2',JSON.stringify(seed))
      localStorage.setItem('llmquest_progress_v1',JSON.stringify({levels:Object.fromEntries(levels.map(l=>[l.id,{status:'unlocked',xpEarned:0,attempts:0}])),totalXp:0,streakDays:0,lastActiveDate:''}))
    },{seed,levels:data.levels})
    for(const slug of slugs) {
      const lesson=bySlug.get(slug)
      await page.evaluate(slug=>{
        const state=JSON.parse(localStorage.getItem('llmquest_interactive_v2'))
        delete state[slug]
        localStorage.setItem('llmquest_interactive_v2',JSON.stringify(state))
      },slug)
      await page.goto(`${base}/interactive/${slug}`)
      for(const step of lesson.steps) {
        if(step.kind==='concept') {
          await page.getByRole('heading',{name:step.title,exact:true}).waitFor()
          await click(page,step.cta??'Continue')
        } else if(step.kind==='worked') {
          for(let i=0;i<step.stages.length;i++)await click(page,i===0?'Walk through it':`Show step ${i+1}`)
          await click(page,step.cta??'Try one yourself')
        } else if(step.kind==='numeric') {
          for(const [index,q] of step.questions.entries()) {
            await page.getByPlaceholder('type a number').waitFor()
            assert.equal(await page.getByPlaceholder('type a number').count(),1)
            if(step.questions.length>1)await page.getByText(`question ${index+1} of ${step.questions.length}`,{exact:true}).waitFor()
            await page.getByPlaceholder('type a number').fill(String(q.answer))
            await click(page,'Check');await click(page,'Continue')
          }
          await click(page,'Continue')
        } else if(step.kind==='mcq') {
          await click(page,step.options[step.answer])
          assert.equal(await page.getByRole('button',{name:'Continue',exact:true}).count(),0)
          await click(page,"I'm sure");await click(page,'Continue')
        } else if(step.kind==='widget') {
          if(slug==='scaling-laws') {
            for(const i of [0,4,2]){await slider(page,'parameter-ratio',i);assert.equal(await page.getByTestId('budget-ratio').innerText(),'1.000')}
          } else if(slug==='flash-attention') {
            await click(page,'Process next tile');await click(page,'Process next tile')
            assert.match(await page.getByTestId('flash-experiment').innerText(),/a\/l=34\.9265/)
          } else if(slug==='zero-sharding') {
            for(const s of ['1','2','3'])await page.locator('#zero-stage').selectOption(s)
            assert.match(await page.getByTestId('zero-total').innerText(),/4.00 GB/)
            await slider(page,'zero-ranks',8)
            assert.match(await page.getByTestId('zero-total').innerText(),/2.00 GB/)
          } else if(slug==='switch-transformer') {
            assert.match(await page.getByTestId('switch-overflow').innerText(),/overflow: 3\/8/)
            await page.locator('#routing-pattern').selectOption('balanced')
            await slider(page,'switch-capacity',2)
            assert.match(await page.getByTestId('switch-overflow').innerText(),/overflow: 0\/8/)
          } else if(slug==='paged-attention') {
            for(let i=0;i<4;i++)await click(page,'Next cache event')
            assert.match(await page.getByTestId('paging-experiment').innerText(),/\[0, 2, 1\]/)
          } else if(slug==='byte-boundaries') {
            await page.locator('#boundary-sample').selectOption('unicode')
            assert.deepEqual(await page.getByTestId('byte-lengths').locator('dd').allTextContents(),['4','2','5','7'])
          } else if(slug==='byte-distillation') {
            assert.match(await page.getByTestId('byte-next-probabilities').innerText(),/0.625/)
            await page.locator('#byte-scheme').selectOption('eot')
            assert.match(await page.getByTestId('byte-next-probabilities').innerText(),/0.200/)
            await page.locator('#byte-prefix').selectOption('ab')
            assert.match(await page.getByTestId('byte-next-probabilities').innerText(),/1.000/)
            await page.locator('#byte-scheme').selectOption('approximate')
            await page.getByText('No remaining token continuation.',{exact:false}).waitFor()
            await page.locator('#byte-scheme').selectOption('eot')
            await page.locator('#byte-prefix').selectOption('a')
            await slider(page,'short-token-mass',40)
            assert.match(await page.getByTestId('byte-next-probabilities').innerText(),/0.400/)
          } else if(slug==='byte-model-evaluation') {
            await slider(page,'evidence-budget',15)
            assert.match(await page.getByTestId('evidence-region').innerText(),/interpolated/)
            await slider(page,'evidence-budget',100)
            assert.equal(await page.getByTestId('evidence-region').innerText(),'extrapolated: 58.0')
          }
          await layout(page,`${viewport.width}-${slug}`)
          await click(page,'Continue')
        } else throw new Error(`Unsupported step in focused test: ${step.kind}`)
      }
      await page.getByRole('link',{name:'Back to track',exact:true}).waitFor()
      const completed=await page.evaluate(slug=>JSON.parse(localStorage.getItem('llmquest_interactive_v2'))[slug],slug)
      const expectedScore=lesson.steps.reduce((n,s)=>n+(s.kind==='mcq'?1:['numeric','predict'].includes(s.kind)?s.questions.length:0),0)
      assert.equal(completed.scored,expectedScore,`${slug}: every question must be scored`)
      assert.equal(completed.firstTries,completed.scored,`${slug}: score must persist`)
      console.log(`PASS ${viewport.width}px ${slug}: completed and scored`)
    }
    for(const id of ['c2-l5','c2-l3','c7-l9','c9-l8','c9-l1','c9-l9','c9-l10']) {
      await page.goto(`${base}/level/${id}`)
      if(viewport.width<768)await page.getByRole('tab',{name:'code',exact:true}).click()
      await click(page,'Show worked solution')
      await page.getByText('Loading solution...',{exact:true}).waitFor({state:'hidden'})
      const level=data.levels.find(l=>l.id===id)
      const expected=fs.readFileSync(path.join(root,'public/content/solutions',level.challengeFile),'utf8')
      assert.equal((await page.locator('section pre').innerText()).trimEnd(),expected.trimEnd())
      assert.ok((await page.getByRole('link',{name:'Open in Colab'}).getAttribute('href')).includes(level.challengeFile.replace('.py','.ipynb')))
      await page.locator('section pre').scrollIntoViewIfNeeded()
      await layout(page,`${viewport.width}-${id}-solution`)
    }
    if(process.env.PAPER_PYODIDE==='1' && viewport.width===1280) {
      for(const id of ['c1-l6','c1-l7','c2-l3','c2-l5','c7-l9','c9-l1','c9-l8','c9-l9','c9-l10']) {
        const level=data.levels.find(l=>l.id===id)
        const result=await page.evaluate(async file=>{
          const {runChallenge}=await import('/src/engine/pyodide.ts')
          const solution=await (await fetch(`/content/solutions/${file}`)).text()
          const tests=await (await fetch(`/content/tests/${file.replace('.py','_test.py')}`)).text()
          return await runChallenge(solution,tests)
        },level.challengeFile)
        assert.equal(result.ok,true,`${id}: ${result.error}`)
        console.log(`PASS Pyodide ${id}`)
      }
    }
    assert.deepEqual(errors,[],`browser errors at ${viewport.width}px`)
    await page.close()
  }
} finally {
  await browser?.close()
  await server.close()
}
