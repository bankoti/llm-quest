import { useState } from 'react'
import { ContinueBtn } from './widgets'
import type { WidgetProps } from './types'
import { onlineStep, switchPlan, zeroBytes } from './paperMath'

export function FlashPlay({ onDone }: WidgetProps) {
  const [tile, setTile] = useState(0)
  let state = { max: -Infinity, sum: 0, weighted: 0 }
  const scores = [1, 2, 3, 4], values = [10, 20, 30, 40]
  const history = []
  for (let i = 0; i < tile; i++) {
    state = onlineStep(state, scores.slice(i * 2, i * 2 + 2), values.slice(i * 2, i * 2 + 2))
    history.push(state)
  }
  return <div className="w-full max-w-lg" data-testid="flash-experiment">
    <h2 className="text-xl font-semibold mb-4">One query, two key tiles</h2>
    <div className="grid grid-cols-4 gap-2 mb-5">
      {scores.map((score, i) => <div key={i} className={`text-center p-2 rounded border ${Math.floor(i / 2) < tile ? 'border-emerald-500 bg-emerald-950' : 'border-gray-700 bg-gray-900'}`}>
        <p className="text-xs text-gray-400">key {i}</p><p>score {score}</p><p className="text-sm">v = {values[i]}</p>
      </div>)}
    </div>
    <div className="min-h-32 space-y-3" aria-live="polite">
      {history.map((h, i) => <p key={i} className="font-mono text-sm break-words">Tile {i + 1}: m={h.max}, l={h.sum.toFixed(4)}, a={h.weighted.toFixed(4)}; a/l={(h.weighted/h.sum).toFixed(4)}</p>)}
      {tile === 0 && <p className="text-gray-400">m = -infinity, l = 0, a = 0</p>}
      {tile === 2 && <p className="text-emerald-300">When m changes from 2 to 4, multiply the old l and a by exp(-2). Normalizing each tile separately would give the wrong answer.</p>}
    </div>
    {tile < 2 ? <button className="mt-4 px-4 py-2 rounded bg-sky-700" onClick={() => setTile(t => t + 1)}>Process next tile</button> : <ContinueBtn onClick={onDone} />}
  </div>
}

export function ZeroPlay({ onDone }: WidgetProps) {
  const [stage, setStage] = useState(0), [ranks, setRanks] = useState(4)
  const [seen, setSeen] = useState(new Set([0]))
  const bytes = zeroBytes(1e9, ranks, stage)
  return <div className="w-full max-w-lg" data-testid="zero-experiment">
    <h2 className="text-xl font-semibold mb-4">One billion parameters</h2>
    <label className="block text-sm mb-2" htmlFor="zero-stage">ZeRO stage</label>
    <select id="zero-stage" value={stage} className="w-full bg-gray-900 border border-gray-600 rounded p-2 mb-4" onChange={e => { const s = +e.target.value; setStage(s); setSeen(old => new Set(old).add(s)) }}>
      {[0, 1, 2, 3].map(s => <option key={s} value={s}>{s === 0 ? '0: replicated baseline' : `${s}: shard ${['', 'optimizer', 'optimizer and gradients', 'all model state'][s]}`}</option>)}
    </select>
    <label htmlFor="zero-ranks" className="text-sm">Logical devices: {ranks}</label>
    <input id="zero-ranks" type="range" min="1" max="8" value={ranks} onChange={e => setRanks(+e.target.value)} className="w-full my-3 accent-sky-500" />
    <div className="space-y-3">
      {Object.entries(bytes).map(([key, value], i) => <div key={key}>
        <p className="text-sm mb-1">{key}: {(value/1e9).toFixed(2)} GB per device</p>
        <div className="h-5 bg-gray-800 rounded overflow-hidden"><div className={['bg-sky-500','bg-amber-500','bg-emerald-500'][i]} style={{height:'100%',width:`${value/12e9*100}%`}} /></div>
      </div>)}
    </div>
    <p className="mt-4 font-mono" aria-live="polite" data-testid="zero-total">Persistent state: {(Object.values(bytes).reduce((a,b)=>a+b,0)/1e9).toFixed(2)} GB/device</p>
    <p className="text-sm text-gray-400 mt-3">Weights: 2 bytes, gradients: 2, master weights and Adam moments: 12. Activations and temporary gathers are additional. Sharding changes ownership, not the number of learned parameters.</p>
    {seen.size === 4 ? <ContinueBtn onClick={onDone} /> : <p className="mt-4 text-sm text-gray-400">Compare all stages ({seen.size}/4).</p>}
  </div>
}

export function SwitchPlay({ onDone }: WidgetProps) {
  const [skew, setSkew] = useState(true), [factor, setFactor] = useState(1)
  const [seen, setSeen] = useState(new Set<string>())
  const assignments = skew ? [0,0,0,0,0,1,2,3] : [0,1,2,3,0,1,2,3]
  const plan = switchPlan(assignments, 4, factor)
  return <div className="w-full max-w-lg" data-testid="switch-experiment">
    <h2 className="text-xl font-semibold mb-4">Eight tokens, four experts</h2>
    <label htmlFor="routing-pattern" className="text-sm">Router assignments</label>
    <select id="routing-pattern" value={skew ? 'skew' : 'balanced'} className="w-full bg-gray-900 border border-gray-600 p-2 rounded my-2" onChange={e => {setSkew(e.target.value==='skew');setSeen(s=>new Set(s).add('pattern'))}}>
      <option value="skew">Collapsed toward expert 0</option><option value="balanced">Balanced assignments</option>
    </select>
    <label htmlFor="switch-capacity" className="text-sm">Capacity factor: {factor}</label>
    <input id="switch-capacity" type="range" min="0.5" max="3" step="0.5" value={factor} className="w-full my-3 accent-amber-500" onChange={e=>{setFactor(+e.target.value);setSeen(s=>new Set(s).add('capacity'))}} />
    <div className="grid grid-cols-2 gap-3">
      {[0,1,2,3].map(e => <div key={e} className="border border-gray-700 p-3 rounded min-h-32">
        <p className="text-sm mb-2">Expert {e}: {plan.load[e]} assigned</p>
        <div className="flex flex-wrap gap-1">{assignments.map((a,i)=>a===e && <span key={i} className={`p-1 text-xs border rounded ${plan.accepted[i]?'border-emerald-500 bg-emerald-950':'border-red-400 bg-red-950 line-through'}`}>t{i}</span>)}</div>
      </div>)}
    </div>
    <p aria-live="polite" className="mt-4" data-testid="switch-overflow">Capacity: {plan.capacity}/expert; overflow: {plan.dropped}/8 tokens</p>
    <p className="mt-3 text-sm text-gray-400">Extra capacity reduces dropping but cannot give unused experts training data. A balancing loss changes router learning; this control only changes buffer capacity.</p>
    {seen.size === 2 ? <ContinueBtn onClick={onDone} /> : <p className="mt-4 text-sm text-gray-400">Compare routing and capacity.</p>}
  </div>
}

const FRAMES = [
  { event:'A caches three tokens', tables:{A:[0,1]} as Record<string,number[]>, blocks:[[1,2],[3],[],[]] },
  { event:'B forks A: both block tables share physical storage', tables:{A:[0,1],B:[0,1]}, blocks:[[1,2],[3],[],[]] },
  { event:'B appends token 4: copy the shared partial block', tables:{A:[0,1],B:[0,2]}, blocks:[[1,2],[3],[3,4],[]] },
  { event:'A finishes: release its unshared block; B keeps the shared prefix', tables:{B:[0,2]}, blocks:[[1,2],[],[3,4],[]] },
  { event:'B appends token 5: reuse physical block 1', tables:{B:[0,2,1]}, blocks:[[1,2],[5],[3,4],[]] },
]
export function PagingPlay({ onDone }: WidgetProps) {
  const [step,setStep] = useState(0)
  const frame = FRAMES[step]
  return <div className="w-full max-w-lg" data-testid="paging-experiment">
    <h2 className="text-xl font-semibold mb-4">Four physical blocks, two slots each</h2>
    <div className="min-h-20 text-sm space-y-2">{Object.entries(frame.tables).map(([name,ids])=><p key={name} className="font-mono">{name}: logical blocks map to [{ids?.join(', ')}]</p>)}</div>
    <div className="grid grid-cols-2 gap-3">
      {frame.blocks.map((tokens,i)=><div key={i} className={`border rounded p-3 ${tokens.length?'border-sky-500':'border-gray-700'}`}>
        <p className="text-sm text-gray-400">Physical {i}; owners: {Object.values(frame.tables).filter(ids=>ids?.includes(i)).length}</p>
        <div className="grid grid-cols-2 gap-2 mt-2">{[0,1].map(j=><span key={j} className="text-center bg-gray-800 p-2 font-mono">{tokens[j]??'empty'}</span>)}</div>
      </div>)}
    </div>
    <p className="mt-4 min-h-16 text-emerald-300" aria-live="polite">{frame.event}</p>
    <p className="text-sm text-gray-400">Numbers identify cached K/V pairs. Attention follows logical order through the table; it cannot sort physical block IDs.</p>
    {step<FRAMES.length-1 ? <button className="mt-4 px-4 py-2 rounded bg-sky-700" onClick={()=>setStep(s=>s+1)}>Next cache event</button> : <ContinueBtn onClick={onDone} />}
  </div>
}
