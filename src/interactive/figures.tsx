// Static concept figures, referenced by ConceptStep.figure (see types.ts).
// Widgets handle interaction; figures show the *shape* of an idea at the moment
// it is introduced. Dark-theme SVG, no state, safe for the smoke harness.
import type { ReactElement } from 'react'
import { FIGURES_EXT } from './figuresExt'

export const C = {
  box: '#1f2937', edge: '#4b5563', text: '#d1d5db', dim: '#9ca3af', faint: '#6b7280',
  violet: '#a78bfa', emerald: '#34d399', sky: '#38bdf8', amber: '#fbbf24', bg: '#111827',
}
export const mono = { fontFamily: 'ui-monospace, monospace' }

export function TokenBox({ x, y, w = 60, label, accent }: { x: number; y: number; w?: number; label: string; accent?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={26} rx={6} fill={accent ? `${accent}22` : C.box} stroke={accent ?? C.edge} />
      <text x={x + w / 2} y={y + 17} textAnchor="middle" fontSize={12} fill={accent ?? C.text} style={mono}>{label}</text>
    </g>
  )
}

// attention-intuition: "it" gathering information from earlier positions
function AttentionRouting(): ReactElement {
  const toks = ['The', 'animal', 'did', 'not', 'cross', 'because', 'it']
  const xs = toks.map((_, i) => 14 + i * 73)
  const itX = xs[6] + 31
  const arcs = [
    { i: 1, w: 4, c: C.emerald, label: '0.6' },
    { i: 5, w: 2, c: C.sky, label: '0.2' },
    { i: 4, w: 1.2, c: C.faint, label: '0.1' },
    { i: 0, w: 0.7, c: C.faint },
    { i: 2, w: 0.7, c: C.faint },
    { i: 3, w: 0.7, c: C.faint },
  ]
  return (
    <svg viewBox="0 0 530 185" className="w-full h-auto">
      <text x={265} y={16} textAnchor="middle" fontSize={12} fill={C.dim}>attention weights: how much “it” uses each earlier position</text>
      {arcs.map(a => {
        const tx = xs[a.i] + 31
        const mid = (itX + tx) / 2
        const lift = 130 - Math.min(95, Math.abs(itX - tx) * 0.22)
        return <g key={a.i}>
          <path d={`M ${itX} 128 Q ${mid} ${lift} ${tx} 128`} fill="none" stroke={a.c} strokeWidth={a.w} opacity={0.9} />
          {a.label && <text x={mid} y={lift + 12} textAnchor="middle" fontSize={11} fill={a.c} style={mono}>{a.label}</text>}
        </g>
      })}
      {toks.map((t, i) => <TokenBox key={i} x={xs[i]} y={130} w={62} label={t} accent={i === 6 ? C.violet : i === 1 ? C.emerald : undefined} />)}
      <text x={265} y={178} textAnchor="middle" fontSize={11} fill={C.faint}>weights are non-negative and sum to 1 — a recipe for blending</text>
    </svg>
  )
}

// qkv-attention: one token's q, k, v roles and where each is used
function QkvFlow(): ReactElement {
  const roleBox = (y: number, label: string, role: string, color: string) => (
    <g>
      <rect x={150} y={y} width={96} height={30} rx={6} fill={`${color}18`} stroke={color} />
      <text x={198} y={y + 14} textAnchor="middle" fontSize={12} fill={color} style={mono}>{label}</text>
      <text x={198} y={y + 26} textAnchor="middle" fontSize={9} fill={C.dim}>{role}</text>
    </g>
  )
  const chainBox = (y: number, label: string) => (
    <g>
      <rect x={310} y={y} width={200} height={30} rx={6} fill={C.box} stroke={C.edge} />
      <text x={410} y={y + 19} textAnchor="middle" fontSize={11.5} fill={C.text} style={mono}>{label}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 530 232" className="w-full h-auto">
      <rect x={14} y={85} width={86} height={30} rx={6} fill={C.box} stroke={C.edge} />
      <text x={57} y={104} textAnchor="middle" fontSize={12} fill={C.text} style={mono}>token x</text>
      {[[35, 'W_q'], [100, 'W_k'], [165, 'W_v']].map(([y, w]) => <g key={w}>
        <line x1={100} y1={100} x2={148} y2={(y as number) + 15} stroke={C.edge} />
        <text x={118} y={(y as number) + (y === 100 ? 10 : y === 35 ? 24 : 8)} fontSize={10} fill={C.dim} style={mono}>{w}</text>
      </g>)}
      {roleBox(35, 'q — query', 'what am I looking for?', C.violet)}
      {roleBox(100, 'k — key', 'what do I contain?', C.sky)}
      {roleBox(165, 'v — value', 'what do I hand over?', C.emerald)}
      <line x1={246} y1={50} x2={308} y2={42} stroke={C.violet} />
      <line x1={246} y1={115} x2={308} y2={48} stroke={C.sky} />
      {chainBox(27, 'score = q · k  (every position)')}
      <line x1={410} y1={57} x2={410} y2={83} stroke={C.edge} markerEnd="url(#arr)" />
      {chainBox(85, 'softmax → attention weights')}
      <line x1={410} y1={115} x2={410} y2={141} stroke={C.edge} markerEnd="url(#arr)" />
      <line x1={246} y1={180} x2={308} y2={162} stroke={C.emerald} />
      {chainBox(143, 'output = Σ weight × v')}
      <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="none" stroke={C.edge} /></marker></defs>
      <text x={265} y={222} textAnchor="middle" fontSize={11} fill={C.faint}>three learned projections of the same vector, used in three different places</text>
    </svg>
  )
}

// causal-attention: lower-triangular visibility grid
function CausalMaskFig(): ReactElement {
  const n = 5, cell = 34, ox = 120, oy = 42
  return (
    <svg viewBox="0 0 400 260" className="w-full h-auto">
      <text x={ox + (n * cell) / 2} y={18} textAnchor="middle" fontSize={11} fill={C.dim}>position seen (key)</text>
      <text x={26} y={oy + (n * cell) / 2} textAnchor="middle" fontSize={11} fill={C.dim} transform={`rotate(-90 26 ${oy + (n * cell) / 2})`}>position attending (query)</text>
      {Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => {
        const ok = c <= r
        return <g key={`${r}${c}`}>
          <rect x={ox + c * cell} y={oy + r * cell} width={cell - 3} height={cell - 3} rx={4}
            fill={ok ? `${C.emerald}22` : C.bg} stroke={ok ? C.emerald : '#1f2937'} />
          <text x={ox + c * cell + (cell - 3) / 2} y={oy + r * cell + 21} textAnchor="middle" fontSize={12}
            fill={ok ? C.emerald : '#374151'} style={mono}>{ok ? '✓' : '✕'}</text>
        </g>
      }))}
      {Array.from({ length: n }, (_, i) => <g key={i}>
        <text x={ox + i * cell + 15} y={36} textAnchor="middle" fontSize={10} fill={C.faint} style={mono}>t{i + 1}</text>
        <text x={ox - 14} y={oy + i * cell + 21} textAnchor="middle" fontSize={10} fill={C.faint} style={mono}>t{i + 1}</text>
      </g>)}
      <text x={ox + (n * cell) / 2} y={248} textAnchor="middle" fontSize={11} fill={C.faint}>each position sees itself and the past — never the future</text>
    </svg>
  )
}

// position-information: same tokens, different order, different meaning
function PositionOrder(): ReactElement {
  const chip = (x: number, y: number, label: string, color: string) => <TokenBox x={x} y={y} w={70} label={label} accent={color} />
  return (
    <svg viewBox="0 0 530 150" className="w-full h-auto">
      {chip(20, 28, 'dog', C.amber)}{chip(100, 28, 'bites', C.violet)}{chip(180, 28, 'man', C.sky)}
      <text x={290} y={45} fontSize={12} fill={C.text}>→ man is hurt</text>
      {chip(20, 84, 'man', C.sky)}{chip(100, 84, 'bites', C.violet)}{chip(180, 84, 'dog', C.amber)}
      <text x={290} y={101} fontSize={12} fill={C.text}>→ dog is hurt</text>
      <text x={455} y={73} textAnchor="middle" fontSize={22} fill={C.amber} style={mono}>≠</text>
      <text x={265} y={138} textAnchor="middle" fontSize={11} fill={C.faint}>identical token vectors, rearranged — content alone cannot tell these apart</text>
    </svg>
  )
}

// multihead-attention: one wide vector split into parallel heads
function MultiheadSplit(): ReactElement {
  const bw = 480, n = 12, sw = bw / n
  const hi: Record<number, string> = { 0: C.violet, 5: C.sky, 11: C.emerald }
  const headBox = (x: number, label: string, color: string) => (
    <g>
      <rect x={x} y={104} width={118} height={30} rx={6} fill={`${color}18`} stroke={color} />
      <text x={x + 59} y={116} textAnchor="middle" fontSize={10.5} fill={color} style={mono}>{label}</text>
      <text x={x + 59} y={128} textAnchor="middle" fontSize={9} fill={C.dim}>attends on its own</text>
    </g>
  )
  return (
    <svg viewBox="0 0 530 240" className="w-full h-auto">
      <text x={265} y={16} textAnchor="middle" fontSize={11} fill={C.dim}>hidden vector · width 768</text>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={25 + i * sw} y={24} width={sw - 2} height={24} rx={3}
          fill={hi[i] ? `${hi[i]}33` : C.box} stroke={hi[i] ?? '#374151'} />
      ))}
      <text x={45} y={40} textAnchor="middle" fontSize={9} fill={C.violet} style={mono}>64</text>
      <line x1={45} y1={50} x2={84} y2={102} stroke={C.violet} />
      <line x1={245} y1={50} x2={265} y2={102} stroke={C.sky} />
      <line x1={485} y1={50} x2={446} y2={102} stroke={C.emerald} />
      {headBox(25, 'head 1 · 64 wide', C.violet)}
      <text x={183} y={123} textAnchor="middle" fontSize={12} fill={C.faint} style={mono}>…</text>
      {headBox(206, 'head 6 · 64 wide', C.sky)}
      <text x={364} y={123} textAnchor="middle" fontSize={12} fill={C.faint} style={mono}>…</text>
      {headBox(387, 'head 12 · 64 wide', C.emerald)}
      {[84, 265, 446].map((x, i) => <line key={i} x1={x} y1={134} x2={x} y2={158} stroke={C.edge} />)}
      <rect x={25} y={160} width={bw} height={24} rx={4} fill={C.box} stroke={C.edge} />
      <text x={265} y={176} textAnchor="middle" fontSize={11} fill={C.text} style={mono}>concatenate → 768 again → output projection W_O</text>
      <text x={265} y={218} textAnchor="middle" fontSize={11} fill={C.faint}>12 small attentions in parallel, each free to track a different relationship</text>
    </svg>
  )
}

// transformer-block: pre-norm residual stream, attention + FFN sublayers
function TransformerBlockFig(): ReactElement {
  const cx = 190
  const stage = (y: number, label: string, color?: string) => (
    <g>
      <rect x={cx - 75} y={y} width={150} height={30} rx={6} fill={color ? `${color}18` : C.box} stroke={color ?? C.edge} />
      <text x={cx} y={y + 19} textAnchor="middle" fontSize={11.5} fill={color ?? C.text} style={mono}>{label}</text>
    </g>
  )
  const plus = (y: number) => (
    <g>
      <circle cx={cx} cy={y} r={11} fill={C.bg} stroke={C.amber} />
      <text x={cx} y={y + 4} textAnchor="middle" fontSize={13} fill={C.amber} style={mono}>+</text>
    </g>
  )
  const v = (y1: number, y2: number) => <line x1={cx} y1={y1} x2={cx} y2={y2} stroke={C.edge} />
  return (
    <svg viewBox="0 0 380 344" className="w-full h-auto">
      <text x={cx} y={16} textAnchor="middle" fontSize={11} fill={C.dim} style={mono}>x from previous block</text>
      {v(22, 38)}
      {stage(40, 'LayerNorm')}
      {v(70, 78)}
      {stage(80, 'attention', C.violet)}
      {v(110, 121)}
      {plus(132)}
      <path d={`M ${cx} 30 L 60 30 L 60 132 L ${cx - 11} 132`} fill="none" stroke={C.amber} strokeDasharray="4 3" />
      <text x={54} y={85} fontSize={9.5} fill={C.amber} transform="rotate(-90 54 85)" textAnchor="middle" style={mono}>residual: x carried around</text>
      {v(143, 158)}
      {stage(160, 'LayerNorm')}
      {v(190, 198)}
      {stage(200, 'feed-forward', C.emerald)}
      {v(230, 241)}
      {plus(252)}
      <path d={`M ${cx} 150 L 320 150 L 320 252 L ${cx + 11} 252`} fill="none" stroke={C.amber} strokeDasharray="4 3" />
      {v(263, 280)}
      <text x={cx} y={296} textAnchor="middle" fontSize={11} fill={C.dim} style={mono}>to next block</text>
      <text x={330} y={60} fontSize={12} fill={C.faint} style={mono}>× N</text>
      <text x={cx} y={318} textAnchor="middle" fontSize={11} fill={C.faint}>two sublayers, each wrapped in “add it back”</text>
      <text x={cx} y={334} textAnchor="middle" fontSize={11} fill={C.faint}>the whole model is this block, stacked</text>
    </svg>
  )
}

// parameter-counts: where GPT-2 small's 124M parameters live (area-true bar)
function ParamSlabs(): ReactElement {
  const total = 124.4
  const segs = [
    { label: 'embeddings', val: 39.4, color: C.sky },
    { label: 'attention ×12', val: 28.3, color: C.violet },
    { label: 'FFN ×12', val: 56.7, color: C.emerald },
  ]
  let x = 25
  const bw = 480
  return (
    <svg viewBox="0 0 530 130" className="w-full h-auto">
      <text x={265} y={18} textAnchor="middle" fontSize={11} fill={C.dim}>GPT-2 small · 124M parameters, drawn to scale</text>
      {segs.map(s => {
        const w = (s.val / total) * bw
        const g = (
          <g key={s.label}>
            <rect x={x} y={30} width={w - 2} height={36} rx={4} fill={`${s.color}26`} stroke={s.color} />
            <text x={x + w / 2} y={46} textAnchor="middle" fontSize={10.5} fill={s.color} style={mono}>{s.label}</text>
            <text x={x + w / 2} y={59} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>{s.val}M</text>
          </g>
        )
        x += w
        return g
      })}
      <text x={265} y={92} textAnchor="middle" fontSize={11} fill={C.faint}>the repeated blocks dominate — and FFN outweighs attention 2:1 inside each block</text>
      <text x={265} y={112} textAnchor="middle" fontSize={10} fill={C.faint} style={mono}>attention/block: 4 × 768² ≈ 2.36M · FFN/block: 2 × 768 × 3072 ≈ 4.72M</text>
    </svg>
  )
}

// inference-loop: inner forward pass, outer append-and-repeat loop
function InferenceLoops(): ReactElement {
  const box = (x: number, y: number, w: number, label: string, sub?: string, color?: string) => (
    <g>
      <rect x={x} y={y} width={w} height={sub ? 44 : 30} rx={6} fill={color ? `${color}18` : C.box} stroke={color ?? C.edge} />
      <text x={x + w / 2} y={y + 19} textAnchor="middle" fontSize={11.5} fill={color ?? C.text} style={mono}>{label}</text>
      {sub && <text x={x + w / 2} y={y + 34} textAnchor="middle" fontSize={9.5} fill={C.dim} style={mono}>{sub}</text>}
    </g>
  )
  const arrow = (x1: number, x2: number, y: number) => <g>
    <line x1={x1} y1={y} x2={x2 - 6} y2={y} stroke={C.edge} />
    <path d={`M ${x2 - 6} ${y - 4} L ${x2} ${y} L ${x2 - 6} ${y + 4}`} fill="none" stroke={C.edge} />
  </g>
  return (
    <svg viewBox="0 0 530 185" className="w-full h-auto">
      {box(14, 70, 96, 'context', 'token ids so far')}
      {arrow(110, 132, 92)}
      {box(134, 63, 170, 'one forward pass', 'embed → N blocks → logits', C.violet)}
      {arrow(304, 326, 92)}
      {box(328, 70, 100, 'probabilities', 'over the vocab', C.sky)}
      {arrow(428, 450, 92)}
      {box(452, 70, 64, 'pick one', undefined, C.emerald)}
      <path d="M 484 68 L 484 30 L 62 30 L 62 66" fill="none" stroke={C.amber} strokeDasharray="5 3" />
      <path d="M 58 60 L 62 68 L 66 60" fill="none" stroke={C.amber} />
      <text x={273} y={22} textAnchor="middle" fontSize={10.5} fill={C.amber} style={mono}>append the new token, run again — once per generated token</text>
      <text x={265} y={150} textAnchor="middle" fontSize={11} fill={C.faint}>weights never change during inference; only the growing context does</text>
      <text x={265} y={170} textAnchor="middle" fontSize={11} fill={C.faint}>the model never plans a sentence — it only ever picks the next token</text>
    </svg>
  )
}

export const FIGURES: Record<string, () => ReactElement> = {
  'attention-routing': AttentionRouting,
  'qkv-flow': QkvFlow,
  'causal-mask': CausalMaskFig,
  'position-order': PositionOrder,
  'multihead-split': MultiheadSplit,
  'transformer-block': TransformerBlockFig,
  'param-slabs': ParamSlabs,
  'inference-loops': InferenceLoops,
  ...FIGURES_EXT,
}

export function Figure({ name }: { name: string }) {
  const F = FIGURES[name]
  if (!F) return null
  return <div data-figure={name} className="my-4 px-3 py-2 rounded-xl bg-gray-900/70 border border-gray-800"><F /></div>
}
