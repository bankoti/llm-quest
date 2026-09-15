import { useState } from 'react'
import type { WidgetProps } from './types'
import { ContinueBtn } from './widgets'
import { evidenceRegion, nextByteMass } from './byteMath'

const SELECT = 'w-full bg-gray-900 border border-gray-600 rounded p-2 mt-1 mb-4 text-sm'
const SAMPLES = { ascii: ['c', 'ab'], unicode: ['caf', '\u00e9'] }

export function ByteBoundaryPlay({ onDone }: WidgetProps) {
  const [sample, setSample] = useState<keyof typeof SAMPLES>('ascii')
  const [seen, setSeen] = useState(new Set(['ascii']))
  const parts = SAMPLES[sample], text = parts.join(''), encoder = new TextEncoder()
  return <div className="w-full max-w-lg" data-testid="byte-boundaries-experiment">
    <h2 className="text-xl font-semibold mb-4">One text, three sequence lengths</h2>
    <label htmlFor="boundary-sample" className="text-sm">Declared toy tokenization</label>
    <select id="boundary-sample" className={SELECT} value={sample} onChange={e => { setSample(e.target.value as keyof typeof SAMPLES); setSeen(s => new Set(s).add(e.target.value)) }}>
      <option value="ascii">cab: c | ab</option><option value="unicode">caf{'\u00e9'}: caf | {'\u00e9'}</option>
    </select>
    <div className="border-y border-gray-700 divide-y divide-gray-800">
      {parts.map(part => <div key={part} className="grid grid-cols-[60px_minmax(0,1fr)] gap-3 py-3">
        <span className="font-mono">{part}</span>
        <div className="flex flex-wrap gap-2">{[...encoder.encode(part)].map((b, i) => <span key={i} className="font-mono text-sm text-sky-300 border-b-2 border-sky-500 px-2 py-1">{b}</span>)}<span className="text-sm text-amber-300 border-b-2 border-amber-500 px-2 py-1">EOT</span></div>
      </div>)}
    </div>
    <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 my-5 text-sm" data-testid="byte-lengths">
      <dt>Unicode code points</dt><dd>{[...text].length}</dd>
      <dt>Toy BPE tokens</dt><dd>{parts.length}</dd>
      <dt>UTF-8 content bytes</dt><dd>{encoder.encode(text).length}</dd>
      <dt>Bytes + EOT prediction units</dt><dd>{encoder.encode(text).length + parts.length}</dd>
    </dl>
    <p className="text-sm text-gray-400">EOT records a boundary; it is not part of the text. More prediction units can increase attention and decoding work even when the vocabulary shrinks.</p>
    {seen.size === 2 && <ContinueBtn onClick={onDone} />}
  </div>
}

export function ByteConversionPlay({ onDone }: WidgetProps) {
  const [scheme, setScheme] = useState('approximate'), [prefix, setPrefix] = useState('a')
  const [shortMass, setShortMass] = useState(20)
  const [seen, setSeen] = useState(new Set(['approximate:a']))
  const probs = [shortMass / 100, (1 - shortMass / 100) * 5 / 8, (1 - shortMass / 100) * 3 / 8]
  const tokens = [[97], [97, 98], [97, 99]], labels = ['a', 'ab', 'ac']
  const current = [...new TextEncoder().encode(prefix)]
  const distribution = nextByteMass(probs, tokens, current, scheme === 'eot')
  const supported = distribution.some(p => p > 0)
  return <div className="w-full max-w-lg" data-testid="byte-conversion-experiment">
    <h2 className="text-xl font-semibold mb-4">Where does a completed token go?</h2>
    <figure className="mb-5" aria-label="Teacher prefix tree: a branches into EOT, b then EOT, or c then EOT">
      <figcaption className="text-xs text-gray-400 mb-2">Teacher token paths and unconditional probabilities</figcaption>
      <p className="font-mono text-center">a</p><div className="h-3 w-px bg-gray-500 mx-auto" />
      <div className="grid grid-cols-3 border-t border-gray-500">
        {labels.map((label, i) => <div key={label} className={`text-center min-w-0 ${label.startsWith(prefix) ? 'text-sky-300' : 'text-gray-500'}`}>
          <div className="h-3 w-px bg-gray-500 mx-auto" />
          <p className="font-mono text-xs">{['EOT', 'b, EOT', 'c, EOT'][i]}</p>
          <p className="text-xs text-gray-400 mt-1">token {label}</p><p className="text-sm">{probs[i].toFixed(3)}</p>
        </div>)}
      </div>
    </figure>
    <label htmlFor="byte-scheme" className="text-sm">Conversion</label>
    <select id="byte-scheme" className={SELECT} value={scheme} onChange={e => { setScheme(e.target.value); setSeen(s => new Set(s).add(`${e.target.value}:${prefix}`)) }}>
      <option value="approximate">Marginalize-It</option><option value="eot">End-Of-Token</option>
    </select>
    <label htmlFor="byte-prefix" className="text-sm">Observed prefix inside this token</label>
    <select id="byte-prefix" className={SELECT} value={prefix} onChange={e => { setPrefix(e.target.value); setSeen(s => new Set(s).add(`${scheme}:${e.target.value}`)) }}>
      <option value="">Before the first byte</option><option value="a">a</option><option value="ab">ab</option>
    </select>
    <label htmlFor="short-token-mass" className="text-sm">Teacher probability of token a: {shortMass}%</label>
    <input id="short-token-mass" type="range" min="0" max="80" step="10" value={shortMass} onChange={e => setShortMass(+e.target.value)} className="w-full my-3 accent-sky-500" />
    <div className="min-h-40 space-y-3" aria-live="polite" data-testid="byte-next-probabilities">
      {[97, 98, 99, 256].map(b => <div key={b} className="grid grid-cols-[40px_minmax(0,1fr)_48px] items-center gap-3 text-sm">
        <span className="font-mono">{b === 256 ? 'EOT' : String.fromCharCode(b)}</span>
        <div className="h-4 bg-gray-800"><div className={b === 256 ? 'h-full bg-amber-500' : 'h-full bg-sky-500'} style={{ width: `${(distribution[b] ?? 0) * 100}%` }} /></div>
        <span>{(distribution[b] ?? 0).toFixed(3)}</span>
      </div>)}
      {!supported && <p className="text-amber-300">No remaining token continuation. A next-token teacher pass or an explicit boundary is required.</p>}
    </div>
    <p className="text-sm text-gray-400 mt-3">At prefix a, discarding token a renormalizes b and c. EOT keeps that terminal branch. At prefix ab, EOT has probability 1.</p>
    {seen.has('approximate:a') && seen.has('eot:a') && seen.has('eot:ab') && <ContinueBtn onClick={onDone} />}
  </div>
}

export function ByteEvidencePlay({ onDone }: WidgetProps) {
  const [budget, setBudget] = useState(20), [seen, setSeen] = useState(new Set(['measured']))
  const region = evidenceRegion([10, 20, 40], budget)
  return <div className="w-full max-w-lg" data-testid="byte-evidence-experiment">
    <h2 className="text-xl font-semibold mb-3">A prediction is not another training run</h2>
    <p className="text-sm text-gray-400 mb-4">Illustrative data, not paper measurements. Sampled scores are 40, 50, and 55 at budgets 10, 20, and 40. The toy curve is 60 - 200 / budget.</p>
    <label htmlFor="evidence-budget" className="text-sm">Compute budget: {budget} arbitrary units</label>
    <input id="evidence-budget" type="range" min="10" max="100" step="5" value={budget} onChange={e => { const n = +e.target.value; setBudget(n); setSeen(s => new Set(s).add(evidenceRegion([10, 20, 40], n))) }} className="w-full my-4 accent-sky-500" />
    <div className="space-y-4 border-y border-gray-700 py-4">
      {[10, 20, 40].map(n => <div key={n} className="grid grid-cols-[44px_minmax(0,1fr)_40px] gap-3 items-center text-sm"><span>C={n}</span><div className="h-5 bg-gray-800"><div className="h-full bg-emerald-500" style={{ width: `${60 - 200 / n}%` }} /></div><span>{60 - 200 / n}</span></div>)}
    </div>
    <p className="font-mono mt-5" data-testid="evidence-region" aria-live="polite">{region}: {(60 - 200 / budget).toFixed(1)}</p>
    <p className="text-sm text-gray-400 mt-3">A measured budget has an observation. Interpolation stays between observations; extrapolation goes beyond them. None of these labels supplies uncertainty bounds or proves serving quality.</p>
    {seen.size === 3 && <ContinueBtn onClick={onDone} />}
  </div>
}
