import assert from 'node:assert/strict'
import { allocation, onlineStep, zeroBytes, switchPlan } from '../src/interactive/paperMath.ts'
import { nextByteMass, evidenceRegion } from '../src/interactive/byteMath.ts'

for (const budget of [120, 3e21, 1e23]) {
  for (const ratio of [.25, .5, 1, 2, 4]) {
    const a = allocation(budget, ratio)
    assert.ok(Math.abs(a.compute / budget - 1) < 1e-12)
    assert.ok(a.proxy >= 2)
  }
  const a = allocation(budget, 1)
  assert.ok(Math.abs(a.tokens / a.params - 20) < 1e-12)
}
for (const scores of [[1,2,3,4], [1000,1001,999,1005], [-1000,-999,-1001,-998]]) {
  const values = [10,20,30,40]
  let state = {max:-Infinity, sum:0, weighted:0}
  for (let i=0;i<4;i+=2) state=onlineStep(state,scores.slice(i,i+2),values.slice(i,i+2))
  const p = scores.map(s=>Math.exp(s-Math.max(...scores)))
  const expected = p.reduce((a,w,i)=>a+w*values[i],0)/p.reduce((a,b)=>a+b,0)
  assert.ok(Math.abs(state.weighted/state.sum-expected)<1e-10)
}
assert.deepEqual([0,1,2,3].map(s=>Object.values(zeroBytes(1e9,4,s)).reduce((a,b)=>a+b,0)),[16e9,7e9,5.5e9,4e9])
assert.equal(switchPlan([0,0,0,0,0,1,2,3],4,1).dropped,3)
assert.equal(switchPlan([0,0,0,0,0,1,2,3],4,3).dropped,0)
assert.equal(switchPlan([0,1,2,3,0,1,2,3],4,1).dropped,0)
console.log('Equal compute, online softmax, ZeRO stages, and Switch capacity passed.')
const byteTokens = [[97], [97,98], [97,99]], teacher = [.2,.5,.3]
const approximate = nextByteMass(teacher, byteTokens, [97], false)
assert.ok(Math.abs(approximate[98]-.625)<1e-12 && Math.abs(approximate[99]-.375)<1e-12)
const exact = nextByteMass(teacher, byteTokens, [97], true)
assert.ok(Math.abs(exact[256]-.2)<1e-12)
for(const [i,token] of byteTokens.entries()) {
  let p = 1
  for(const [j,b] of token.entries()) p *= nextByteMass(teacher, byteTokens, token.slice(0,j), true)[b]
  p *= nextByteMass(teacher, byteTokens, token, true)[256]
  assert.ok(Math.abs(p-teacher[i])<1e-12)
}
assert.equal(nextByteMass(teacher, byteTokens, [122], true).reduce((a,b)=>a+b,0),0)
assert.deepEqual([10,15,20,100].map(c=>evidenceRegion([10,20,40],c)),['measured','interpolated','measured','extrapolated'])
console.log('Byte path conservation and evidence region calculations passed.')
