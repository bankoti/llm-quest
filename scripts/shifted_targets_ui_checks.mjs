import assert from 'node:assert/strict'

export async function shiftedTargetsRegression(page,snapshot) {
  const widget=page.getByRole('region',{name:'Shifted Response Targets',exact:true})
  await widget.waitFor()
  const cells=widget.locator('[aria-label="Computed values"] > div')
  async function setLength(name,value) {
    const control=widget.getByRole('slider',{name,exact:true})
    await control.press('Home')
    for(let i=Number(await control.getAttribute('min'));i<value;i++)await control.press('ArrowRight')
  }
  async function check(prompt,response,labels,mask) {
    await setLength('Prompt length',prompt)
    await setLength('Response length',response)
    assert.deepEqual(await cells.allTextContents(),[...labels,...Array(12-labels.length).fill('PAD')])
    assert.deepEqual(await widget.locator('dd').allTextContents(),[String(prompt+response),String(response+1)])
    const colors=await cells.evaluateAll(async elements=>{
      elements.forEach(el=>el.getBoundingClientRect())
      await Promise.all(elements.flatMap(el=>el.getAnimations()).map(animation=>animation.finished.catch(()=>{})))
      return elements.map(el=>getComputedStyle(el).backgroundColor)
    })
    assert.deepEqual(colors.map(color=>color!==colors.at(-1)),[...mask,...Array(12-mask.length).fill(false)],'Only response and EOS targets should receive scoring emphasis')
    await snapshot(page,`${page.viewportSize().width}-shifted-targets-${prompt}-${response}`)
  }
  await check(3,2,['P2','P3','R1','R2','EOS'],[false,false,true,true,true])
  await check(1,0,['EOS'],[true])
  await setLength('Prompt length',3)
  await setLength('Response length',2)
  console.log(`PASS ${page.viewportSize().width}px shifted targets: token labels, scored positions, empty response`)
}
