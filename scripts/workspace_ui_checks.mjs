import assert from 'node:assert/strict'

const storageKey='llmquest_split_v1'
const separatorName='Resize lesson and code panes'
const lessonPane=page=>page.locator('.lesson-prose').locator('..')
const separator=page=>page.getByRole('separator',{name:separatorName,includeHidden:true})

export async function lessonGeometry(page,name) {
  const pane=lessonPane(page)
  await pane.waitFor({state:'visible'})
  await pane.evaluate(async el=>{
    el.getBoundingClientRect()
    await Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{})))
  })
  const bounds=await pane.evaluate(el=>({width:el.getBoundingClientRect().width,workspace:el.parentElement.getBoundingClientRect().width}))
  const mobile=page.viewportSize().width<768
  const pct=Number(await separator(page).getAttribute('aria-valuenow'))
  const expected=mobile?bounds.workspace:bounds.workspace*pct/100
  assert.ok(Math.abs(bounds.width-expected)<bounds.workspace*.005+1,`${name}: lesson width ${bounds.width}, expected ${expected}`)
  if(mobile) {
    const heading=await page.locator('.lesson-prose h1').boundingBox()
    assert.ok(heading && heading.width>=bounds.workspace-50,`${name}: mobile heading must use the available reading width`)
  }
}

export async function codeGeometry(page,name) {
  const bounds=await separator(page).evaluate(el=>({
    code:el.nextElementSibling.getBoundingClientRect().width,
    lesson:el.previousElementSibling.getBoundingClientRect().width,
    divider:el.getBoundingClientRect().width,
    workspace:el.parentElement.getBoundingClientRect().width,
  }))
  const expected=page.viewportSize().width<768?bounds.workspace:bounds.workspace-bounds.lesson-bounds.divider
  assert.ok(bounds.code>0 && Math.abs(bounds.code-expected)<1,`${name}: code width ${bounds.code}, expected ${expected}`)
}

export async function workspaceRegression(page,base,expectedSolution,snapshot) {
  const saved=()=>page.evaluate(key=>({pct:localStorage.getItem(key),collapsed:localStorage.getItem(`${key}:collapsed`)}),storageKey)
  const tab=name=>page.getByRole('tab',{name,exact:true})
  const show=()=>page.getByRole('button',{name:'Show lesson',exact:true})
  const hide=()=>page.getByRole('button',{name:'Hide lesson for full-width editor',exact:true})
  await page.evaluate(key=>{
    localStorage.setItem(key,'57')
    localStorage.setItem(`${key}:collapsed`,'0')
  },storageKey)
  await page.goto(`${base}/level/c10-l8`)
  await page.getByRole('heading',{name:'Worked Answers',exact:true}).waitFor()
  await lessonGeometry(page,'desktop saved split')
  await separator(page).focus()
  await separator(page).press('ArrowLeft')
  assert.equal(await separator(page).getAttribute('aria-valuenow'),'52')
  await lessonGeometry(page,'desktop keyboard split')
  const handle=await separator(page).boundingBox()
  const workspace=await separator(page).evaluate(el=>({x:el.parentElement.getBoundingClientRect().x,width:el.parentElement.getBoundingClientRect().width}))
  await page.mouse.move(handle.x+handle.width/2,handle.y+20)
  await page.mouse.down()
  await page.mouse.move(workspace.x+workspace.width*.6,handle.y+20,{steps:4})
  await page.mouse.up()
  const preference=await saved()
  assert.ok(Math.abs(Number(preference.pct)-60)<.1,'desktop drag must update the saved split')
  await page.reload()
  await page.getByRole('heading',{name:'Worked Answers',exact:true}).waitFor()
  await lessonGeometry(page,'desktop reloaded split')
  assert.deepEqual(await saved(),preference)
  await hide().click()
  await show().waitFor()
  await lessonPane(page).waitFor({state:'hidden'})
  await codeGeometry(page,'desktop collapsed editor')
  const collapsed={...preference,collapsed:'1'}
  assert.deepEqual(await saved(),collapsed)
  await snapshot(page,'1280-workspace-collapsed')

  await page.setViewportSize({width:390,height:844})
  await tab('lesson').click()
  assert.equal(await tab('lesson').getAttribute('aria-selected'),'true')
  await lessonGeometry(page,'mobile after desktop collapse')
  await page.getByRole('heading',{name:'Worked Answers',exact:true}).scrollIntoViewIfNeeded()
  await snapshot(page,'390-workspace-lesson-after-collapse')
  await tab('code').click()
  await lessonPane(page).waitFor({state:'hidden'})
  await codeGeometry(page,'mobile code tab')
  await page.getByRole('button',{name:'Show worked solution',exact:true}).click()
  const solution=page.locator('section pre')
  await page.getByText('Loading solution...',{exact:true}).waitFor({state:'hidden'})
  assert.equal((await solution.innerText()).trimEnd(),expectedSolution.trimEnd())
  await solution.scrollIntoViewIfNeeded()
  await snapshot(page,'390-workspace-solution')
  await tab('lesson').click()
  await solution.waitFor({state:'hidden'})
  await lessonGeometry(page,'mobile lesson tab return')
  await tab('code').click()
  await solution.waitFor({state:'visible'})
  await page.getByRole('button',{name:'Hide worked solution',exact:true}).click()
  assert.equal(await solution.count(),0)
  assert.deepEqual(await saved(),collapsed)

  await page.reload()
  await page.getByRole('heading',{name:'Worked Answers',exact:true}).waitFor()
  assert.equal(await tab('lesson').getAttribute('aria-selected'),'true')
  await lessonGeometry(page,'mobile reload with persisted desktop collapse')
  await tab('code').click()
  await codeGeometry(page,'mobile reloaded code tab')
  await tab('lesson').click()
  await lessonGeometry(page,'mobile reloaded lesson tab')
  assert.deepEqual(await saved(),collapsed)
  await snapshot(page,'390-workspace-reloaded')

  await page.setViewportSize({width:1280,height:900})
  await show().waitFor()
  await lessonPane(page).waitFor({state:'hidden'})
  assert.equal(await tab('lesson').isVisible(),false)
  await codeGeometry(page,'desktop collapse restored')
  assert.deepEqual(await saved(),collapsed)
  await show().click()
  await hide().waitFor()
  await lessonGeometry(page,'desktop saved width restored')
  assert.deepEqual(await saved(),{...preference,collapsed:'0'})
  await separator(page).dblclick({position:{x:3,y:20}})
  assert.equal(await separator(page).getAttribute('aria-valuenow'),'40')
  await lessonGeometry(page,'desktop default split restored')
  await snapshot(page,'1280-workspace-restored')
  console.log('PASS workspace: desktop resize/collapse persistence, mobile full width/reload/tabs, solution reveal/hide')
}
