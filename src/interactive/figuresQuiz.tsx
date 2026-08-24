// Quiz-step figures: rendered post-reveal on mcq/predict steps and as setup
// diagrams on numeric/worked steps. Same contract as figures.tsx.
import type { ReactElement } from 'react'
import { C, mono } from './figures'

const Cap = ({ cx, y, t }: { cx: number; y: number; t: string }): ReactElement => (
  <text x={cx} y={y} textAnchor="middle" fontSize={11} fill={C.faint}>{t}</text>
)
function Arr({ x1, y1, x2, y2, color = C.edge, dash = false }: { x1: number; y1: number; x2: number; y2: number; color?: string; dash?: boolean }): ReactElement {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const p = (off: number) => `${x2 - 8 * Math.cos(a + off)},${y2 - 8 * Math.sin(a + off)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeDasharray={dash ? '4 3' : undefined} />
      <path d={`M ${p(0.4)} L ${x2},${y2} L ${p(-0.4)}`} fill="none" stroke={color} />
    </g>
  )
}
function Grid({ ox, oy, rows, cols, size = 20, hi }: { ox: number; oy: number; rows: number; cols: number; size?: number; hi?: (r: number, c: number) => string | null }): ReactElement {
  const cells: ReactElement[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const h = hi ? hi(r, c) : null
    cells.push(<rect key={`${r}-${c}`} x={ox + c * (size + 2)} y={oy + r * (size + 2)} width={size} height={size} rx={3} fill={h ? `${h}22` : C.box} stroke={h ?? C.edge} />)
  }
  return <g>{cells}</g>
}

// numbers-to-tensors worked: shape (2,3,4) as 2 stacked 3x4 slabs, 24 values
function BatchCount(): ReactElement {
  return (
    <svg viewBox="0 0 530 185" className="w-full h-auto">
      <Grid ox={80} oy={46} rows={3} cols={4} hi={() => C.violet} />
      <Grid ox={250} oy={46} rows={3} cols={4} hi={() => C.sky} />
      <text x={124} y={38} textAnchor="middle" fontSize={10.5} fill={C.violet} style={mono}>sequence 0</text>
      <text x={294} y={38} textAnchor="middle" fontSize={10.5} fill={C.sky} style={mono}>sequence 1</text>
      <text x={74} y={82} textAnchor="end" fontSize={10} fill={C.dim} style={mono}>3 positions</text>
      <text x={124} y={126} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>4 features</text>
      <text x={430} y={70} textAnchor="middle" fontSize={13} fill={C.emerald} style={mono}>(2, 3, 4)</text>
      <text x={430} y={92} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>2 x 3 x 4 = 24 values</text>
      <Cap cx={265} y={168} t="outermost axis first: sequences, then positions, then features" />
    </svg>
  )
}

// numbers-to-tensors mcq: reading a (3,2) matrix outside-in
function ReadShape(): ReactElement {
  return (
    <svg viewBox="0 0 530 170" className="w-full h-auto">
      <Grid ox={120} oy={30} rows={3} cols={2} size={26} hi={(r) => r === 0 ? C.violet : null} />
      <text x={100} y={48} textAnchor="end" fontSize={10.5} fill={C.violet} style={mono}>row 0</text>
      <text x={100} y={76} textAnchor="end" fontSize={10.5} fill={C.dim} style={mono}>row 1</text>
      <text x={100} y={104} textAnchor="end" fontSize={10.5} fill={C.dim} style={mono}>row 2</text>
      <text x={148} y={126} textAnchor="middle" fontSize={10.5} fill={C.sky} style={mono}>2 per row</text>
      <text x={370} y={62} textAnchor="middle" fontSize={13} fill={C.emerald} style={mono}>(3, 2)</text>
      <text x={370} y={84} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>3 rows, each holding 2</text>
      <Cap cx={265} y={155} t="read outside-in: count the outer groups first, then what each contains" />
    </svg>
  )
}

// axes-and-slices: (5,7) collapsed along each axis
function AxisCollapse(): ReactElement {
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      <Grid ox={175} oy={40} rows={5} cols={7} size={16} />
      <text x={265} y={30} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>M: (5, 7)</text>
      <Arr x1={160} y1={90} x2={110} y2={90} color={C.violet} />
      <Grid ox={62} oy={70} rows={5} cols={1} size={16} hi={() => C.violet} />
      <text x={70} y={172} textAnchor="middle" fontSize={10.5} fill={C.violet} style={mono}>axis=1 → (5,)</text>
      <text x={70} y={186} textAnchor="middle" fontSize={9.5} fill={C.dim}>columns combined</text>
      <Arr x1={265} y1={135} x2={265} y2={158} color={C.sky} />
      <Grid ox={211} oy={162} rows={1} cols={7} size={16} hi={() => C.sky} />
      <text x={390} y={175} fontSize={10.5} fill={C.sky} style={mono}>axis=0 → (7,)</text>
      <text x={390} y={189} fontSize={9.5} fill={C.dim}>rows combined</text>
      <Cap cx={265} y={16} t="the axis you reduce is the one that disappears" />
    </svg>
  )
}

// axes-and-slices mcq: legal vs impossible reshapes of 24 values
function ReshapeLegal(): ReactElement {
  return (
    <svg viewBox="0 0 530 190" className="w-full h-auto">
      <Grid ox={30} oy={44} rows={2} cols={12} size={13} hi={() => C.emerald} />
      <text x={128} y={34} textAnchor="middle" fontSize={10.5} fill={C.emerald} style={mono}>(2,12) = 24 ✓</text>
      <Grid ox={250} oy={30} rows={4} cols={6} size={13} hi={() => C.emerald} />
      <text x={295} y={110} textAnchor="middle" fontSize={10.5} fill={C.emerald} style={mono}>(4,6) = 24 ✓</text>
      <Grid ox={390} oy={30} rows={4} cols={7} size={13} hi={(r, c) => (r === 3 && c > 2) ? C.amber : null} />
      <text x={444} y={110} textAnchor="middle" fontSize={10.5} fill={C.amber} style={mono}>(4,7) = 28 ✗</text>
      <text x={444} y={126} textAnchor="middle" fontSize={9.5} fill={C.amber}>needs 4 values that do not exist</text>
      <Cap cx={265} y={172} t="reshape regroups the same 24 values — the product of the axes must stay 24" />
    </svg>
  )
}

// dot-product worked: q=[1,0] vs a=[0.8,0.2] and b=[0,1] as arrows
function VecCompare(): ReactElement {
  const ox = 175, oy = 150, s = 110
  return (
    <svg viewBox="0 0 530 185" className="w-full h-auto">
      <line x1={ox} y1={oy} x2={ox + s + 20} y2={oy} stroke={C.edge} />
      <line x1={ox} y1={oy} x2={ox} y2={oy - s - 15} stroke={C.edge} />
      <Arr x1={ox} y1={oy} x2={ox + s} y2={oy} color={C.violet} />
      <text x={ox + s + 8} y={oy + 14} fontSize={10.5} fill={C.violet} style={mono}>q=[1,0]</text>
      <Arr x1={ox} y1={oy} x2={ox + 0.8 * s} y2={oy - 0.2 * s} color={C.emerald} />
      <text x={ox + 0.8 * s + 6} y={oy - 0.2 * s - 6} fontSize={10.5} fill={C.emerald} style={mono}>a — nearly aligned, q·a=0.8</text>
      <Arr x1={ox} y1={oy} x2={ox} y2={oy - s} color={C.amber} />
      <text x={ox + 8} y={oy - s + 4} fontSize={10.5} fill={C.amber} style={mono}>b — perpendicular, q·b=0</text>
      <Cap cx={265} y={176} t="the dot product scores direction agreement: aligned is large, perpendicular is zero" />
    </svg>
  )
}

// dot-product numeric setup: q=[2,1] with candidates a=[1,2], b=[1,-2]
function VecCompare2(): ReactElement {
  const ox = 200, oy = 105, s = 34
  return (
    <svg viewBox="0 0 530 200" className="w-full h-auto">
      <line x1={ox - 60} y1={oy} x2={ox + 110} y2={oy} stroke={C.edge} />
      <line x1={ox} y1={oy + 78} x2={ox} y2={oy - 85} stroke={C.edge} />
      <Arr x1={ox} y1={oy} x2={ox + 2 * s} y2={oy - 1 * s} color={C.violet} />
      <text x={ox + 2 * s + 8} y={oy - 1 * s} fontSize={10.5} fill={C.violet} style={mono}>q=[2,1]</text>
      <Arr x1={ox} y1={oy} x2={ox + 1 * s} y2={oy - 2 * s} color={C.emerald} />
      <text x={ox + s + 6} y={oy - 2 * s - 6} fontSize={10.5} fill={C.emerald} style={mono}>a=[1,2]</text>
      <Arr x1={ox} y1={oy} x2={ox + 1 * s} y2={oy + 2 * s} color={C.amber} />
      <text x={ox + s + 6} y={oy + 2 * s + 10} fontSize={10.5} fill={C.amber} style={mono}>b=[1,-2]</text>
      <Cap cx={265} y={16} t="score each candidate against q — the picture shows direction; your arithmetic gives the number" />
    </svg>
  )
}

// subword mcq: why letter-counting fails — tokens are not letters
function Strawberry(): ReactElement {
  const piece = (x: number, w: number, t: string) => (
    <g>
      <rect x={x} y={46} width={w} height={28} rx={6} fill={`${C.violet}18`} stroke={C.violet} />
      <text x={x + w / 2} y={64} textAnchor="middle" fontSize={11.5} fill={C.violet} style={mono}>{t}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 530 190" className="w-full h-auto">
      <text x={120} y={34} textAnchor="middle" fontSize={11} fill={C.text} style={mono}>"strawberry"</text>
      {piece(60, 52, 'str')}
      {piece(118, 46, 'aw')}
      {piece(170, 72, 'berry')}
      <text x={150} y={96} textAnchor="middle" fontSize={9.5} fill={C.dim}>what the model sees: 3 token vectors</text>
      <text x={390} y={34} textAnchor="middle" fontSize={11} fill={C.text} style={mono}>s-t-r-a-w-b-e-r-r-y</text>
      <text x={390} y={60} textAnchor="middle" fontSize={10.5} fill={C.emerald} style={mono}>10 letters, 3 r's</text>
      <text x={390} y={82} textAnchor="middle" fontSize={9.5} fill={C.dim}>visible only when spelled out</text>
      <text x={390} y={96} textAnchor="middle" fontSize={9.5} fill={C.dim}>as separate pieces</text>
      <Cap cx={265} y={132} t="no token boundary falls between the r's — the letters are buried inside the pieces" />
      <Cap cx={265} y={152} t="a model that never sees letters cannot reliably count them" />
    </svg>
  )
}

// softmax predict: temperature flattens the distribution
function TempCurves(): ReactElement {
  const p1 = [0.71, 0.26, 0.03]
  const p2 = [0.52, 0.36, 0.12]
  const bars = (ox: number, ps: number[], color: string) => ps.map((p, i) => (
    <g key={i}>
      <rect x={ox + i * 44} y={130 - p * 110} width={34} height={p * 110} rx={4} fill={`${color}44`} stroke={color} />
      <text x={ox + i * 44 + 17} y={124 - p * 110} textAnchor="middle" fontSize={9.5} fill={C.dim} style={mono}>{p.toFixed(2)}</text>
    </g>
  ))
  return (
    <svg viewBox="0 0 530 185" className="w-full h-auto">
      {bars(80, p1, C.violet)}
      <text x={144} y={152} textAnchor="middle" fontSize={10.5} fill={C.violet} style={mono}>T = 1</text>
      {bars(310, p2, C.sky)}
      <text x={374} y={152} textAnchor="middle" fontSize={10.5} fill={C.sky} style={mono}>T = 2 — flatter, same order</text>
      <Cap cx={265} y={176} t="dividing logits by a larger T pulls them together; probabilities even out but never reorder" />
    </svg>
  )
}

// qkv concept + numeric: why scores are scaled by sqrt(d_k)
function ScaleSoftmax(): ReactElement {
  const bars = (ox: number, ps: number[], color: string) => ps.map((p, i) => (
    <g key={i}>
      <rect x={ox + i * 34} y={128 - p * 100} width={26} height={p * 100} rx={3} fill={`${color}44`} stroke={color} />
    </g>
  ))
  return (
    <svg viewBox="0 0 530 195" className="w-full h-auto">
      <text x={130} y={20} textAnchor="middle" fontSize={10.5} fill={C.amber} style={mono}>raw scores: 24, 8, 4</text>
      {bars(80, [0.98, 0.015, 0.005], C.amber)}
      <text x={130} y={148} textAnchor="middle" fontSize={9.5} fill={C.dim}>softmax saturates: winner takes all,</text>
      <text x={130} y={162} textAnchor="middle" fontSize={9.5} fill={C.dim}>gradients vanish</text>
      <Arr x1={230} y1={90} x2={290} y2={90} color={C.emerald} />
      <text x={260} y={80} textAnchor="middle" fontSize={10} fill={C.emerald} style={mono}>÷ √d_k</text>
      <text x={390} y={20} textAnchor="middle" fontSize={10.5} fill={C.sky} style={mono}>scaled: 3, 1, 0.5</text>
      {bars(340, [0.79, 0.11, 0.10], C.sky)}
      <text x={390} y={148} textAnchor="middle" fontSize={9.5} fill={C.dim}>still ranked, but soft —</text>
      <text x={390} y={162} textAnchor="middle" fontSize={9.5} fill={C.dim}>every position keeps a gradient</text>
      <Cap cx={265} y={186} t="dot products grow with d_k; dividing by √d_k keeps softmax in its useful range" />
    </svg>
  )
}

// transformer-block worked + numeric: LayerNorm on one token vector
function LayerNormFig(): ReactElement {
  const vals = [2, 4, 6, 8]
  const out = [-1.34, -0.45, 0.45, 1.34]
  return (
    <svg viewBox="0 0 530 195" className="w-full h-auto">
      {vals.map((v, i) => (
        <g key={i}>
          <rect x={70 + i * 40} y={120 - v * 11} width={30} height={v * 11} rx={3} fill={`${C.violet}44`} stroke={C.violet} />
          <text x={85 + i * 40} y={134} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>{v}</text>
        </g>
      ))}
      <line x1={62} y1={120 - 5 * 11} x2={238} y2={120 - 5 * 11} stroke={C.amber} strokeDasharray="4 3" />
      <text x={150} y={54} textAnchor="middle" fontSize={9.5} fill={C.amber} style={mono}>mean = 5</text>
      <Arr x1={255} y1={90} x2={300} y2={90} color={C.emerald} />
      <text x={277} y={78} textAnchor="middle" fontSize={9.5} fill={C.emerald} style={mono}>− mean, ÷ std</text>
      {out.map((v, i) => (
        <g key={i}>
          <rect x={330 + i * 40} y={v < 0 ? 85 : 85 - v * 26} width={30} height={Math.abs(v) * 26} rx={3} fill={`${C.sky}44`} stroke={C.sky} />
          <text x={345 + i * 40} y={140} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>{v}</text>
        </g>
      ))}
      <line x1={322} y1={85} x2={498} y2={85} stroke={C.edge} strokeDasharray="3 3" />
      <text x={410} y={162} textAnchor="middle" fontSize={9.5} fill={C.dim}>centered on 0, spread rescaled</text>
      <Cap cx={265} y={186} t="one token's features: subtract their mean, divide by their spread — done per token" />
    </svg>
  )
}

// training-objective worked + numeric: shift-by-one supervision
function ShiftTargets(): ReactElement {
  const toks = ['BOS', 'cats', 'sleep', 'EOS']
  return (
    <svg viewBox="0 0 530 175" className="w-full h-auto">
      {toks.map((t, i) => (
        <g key={i}>
          <rect x={90 + i * 95} y={36} width={72} height={28} rx={6} fill={`${C.violet}18`} stroke={C.violet} />
          <text x={126 + i * 95} y={54} textAnchor="middle" fontSize={11} fill={C.violet} style={mono}>{t}</text>
        </g>
      ))}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <path d={`M ${126 + i * 95} 68 C ${126 + i * 95} 96, ${221 + i * 95} 96, ${221 + i * 95} 68`} fill="none" stroke={C.emerald} />
          <text x={173 + i * 95} y={104} textAnchor="middle" fontSize={9.5} fill={C.emerald} style={mono}>predicts</text>
        </g>
      ))}
      <Cap cx={265} y={140} t="4 known tokens, 3 supervised questions — every position's target is simply the next token" />
      <Cap cx={265} y={158} t="no labels needed: the text is its own answer key" />
    </svg>
  )
}

// training-objective: loss = -ln p, surprise curve
function SurpriseLoss(): ReactElement {
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const p = 0.03 + (i / 60) * 0.96
    pts.push(`${90 + (p - 0.03) * 380},${34 + Math.min(Math.log(1 / p), 3.6) * 30}`)
  }
  const px = (p: number) => 90 + (p - 0.03) * 380
  const py = (p: number) => 34 + Math.log(1 / p) * 30
  return (
    <svg viewBox="0 0 530 195" className="w-full h-auto">
      <line x1={90} y1={150} x2={480} y2={150} stroke={C.edge} />
      <line x1={90} y1={20} x2={90} y2={150} stroke={C.edge} />
      <polyline points={pts.join(' ')} fill="none" stroke={C.violet} strokeWidth={1.6} />
      <circle cx={px(0.5)} cy={py(0.5)} r={4} fill={C.emerald} />
      <text x={px(0.5) + 10} y={py(0.5) + 20} fontSize={10} fill={C.emerald} style={mono}>p=0.5 → loss 0.69</text>
      <circle cx={px(0.125)} cy={py(0.125)} r={4} fill={C.amber} />
      <text x={px(0.125) + 10} y={py(0.125)} fontSize={10} fill={C.amber} style={mono}>p=1/8 → loss 2.08</text>
      <text x={480} y={166} textAnchor="end" fontSize={10} fill={C.dim} style={mono}>p given to the right answer →</text>
      <text x={82} y={30} textAnchor="end" fontSize={10} fill={C.dim} style={mono}>-ln p</text>
      <Cap cx={265} y={186} t="loss is surprise: confident and right is cheap, unsure is expensive, certain-and-wrong explodes" />
    </svg>
  )
}

// gradients worked + mcq: one downhill step on the loss curve
function GradStep(): ReactElement {
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const w = i / 60 * 4
    pts.push(`${80 + w * 100},${140 - (2.2 - 0.55 * (w - 2) * (w - 2)) * 42}`)
  }
  const wy = (w: number) => 140 - (2.2 - 0.55 * (w - 2) * (w - 2)) * 42
  return (
    <svg viewBox="0 0 530 190" className="w-full h-auto">
      <line x1={70} y1={148} x2={490} y2={148} stroke={C.edge} />
      <polyline points={pts.join(' ')} fill="none" stroke={C.violet} strokeWidth={1.6} />
      <circle cx={80 + 2.0 * 100} cy={wy(2.0)} r={5} fill={C.amber} />
      <text x={80 + 2.0 * 100} y={wy(2.0) - 12} textAnchor="middle" fontSize={10} fill={C.amber} style={mono}>w = 2.0, gradient +0.5</text>
      <Arr x1={80 + 2.0 * 100 - 8} y1={wy(2.0) + 10} x2={80 + 1.95 * 100 - 22} y2={wy(1.8) + 6} color={C.emerald} />
      <circle cx={80 + 1.95 * 100 - 26} cy={wy(1.93)} r={5} fill={C.emerald} />
      <text x={280} y={108} textAnchor="middle" fontSize={10} fill={C.emerald} style={mono}>w ← 2.0 − 0.1 × 0.5 = 1.95</text>
      <text x={480} y={164} textAnchor="end" fontSize={10} fill={C.dim} style={mono}>w →</text>
      <Cap cx={265} y={182} t="positive gradient means uphill to the right — so the update moves w left, against the gradient" />
    </svg>
  )
}

// parameter-counts mcq: weight tying reuses the embedding table
function WeightTying(): ReactElement {
  return (
    <svg viewBox="0 0 530 195" className="w-full h-auto">
      <rect x={60} y={40} width={110} height={70} rx={8} fill={`${C.violet}18`} stroke={C.violet} />
      <text x={115} y={70} textAnchor="middle" fontSize={10.5} fill={C.violet} style={mono}>embedding</text>
      <text x={115} y={86} textAnchor="middle" fontSize={9.5} fill={C.dim} style={mono}>(V, C) = 38.6M</text>
      <rect x={230} y={55} width={90} height={40} rx={8} fill={C.box} stroke={C.edge} />
      <text x={275} y={79} textAnchor="middle" fontSize={10.5} fill={C.text} style={mono}>blocks</text>
      <rect x={380} y={40} width={110} height={70} rx={8} fill="none" stroke={C.amber} strokeDasharray="5 3" />
      <text x={435} y={70} textAnchor="middle" fontSize={10.5} fill={C.amber} style={mono}>output head</text>
      <text x={435} y={86} textAnchor="middle" fontSize={9.5} fill={C.amber} style={mono}>(V, C) — not stored</text>
      <Arr x1={170} y1={75} x2={228} y2={75} />
      <Arr x1={320} y1={75} x2={378} y2={75} />
      <path d={`M 115 112 C 115 155, 435 155, 435 112`} fill="none" stroke={C.emerald} strokeDasharray="5 3" />
      <text x={265} y={162} textAnchor="middle" fontSize={10} fill={C.emerald} style={mono}>same matrix, used twice</text>
      <Cap cx={265} y={186} t="tying reuses the (V, C) table as the output head — one full copy, 38.6M parameters, never allocated" />
    </svg>
  )
}

// decoding-basics worked + numeric: the sampling roulette strip
function Roulette(): ReactElement {
  const segs = [
    { t: 'the', p: 0.50, c: C.violet },
    { t: 'cat', p: 0.30, c: C.sky },
    { t: 'sat', p: 0.15, c: C.emerald },
    { t: 'mat', p: 0.05, c: C.amber },
  ]
  let x = 70
  const w = 400
  const parts = segs.map((s, i) => {
    const sw = s.p * w
    const el = (
      <g key={i}>
        <rect x={x} y={60} width={sw} height={34} fill={`${s.c}33`} stroke={s.c} />
        <text x={x + sw / 2} y={81} textAnchor="middle" fontSize={10.5} fill={s.c} style={mono}>{s.t}</text>
        <text x={x} y={112} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>{(x - 70) / w === 0 ? '0.00' : ((x - 70) / w).toFixed(2)}</text>
      </g>
    )
    x += sw
    return el
  })
  return (
    <svg viewBox="0 0 530 175" className="w-full h-auto">
      {parts}
      <text x={484} y={112} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>1.00</text>
      <text x={265} y={44} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>one random draw between 0 and 1 lands somewhere on this strip</text>
      <Cap cx={265} y={150} t="slot widths are the probabilities — likely tokens catch more of the line, but never all of it" />
    </svg>
  )
}

// decoding-controls worked + predict: top-p nucleus cut
function NucleusCut(): ReactElement {
  const ps = [0.50, 0.25, 0.12, 0.08, 0.05]
  const cum = [0.50, 0.75, 0.87, 0.95, 1.00]
  return (
    <svg viewBox="0 0 530 200" className="w-full h-auto">
      {ps.map((p, i) => (
        <g key={i}>
          <rect x={80 + i * 72} y={140 - p * 200} width={50} height={p * 200} rx={4}
            fill={i < 4 ? `${C.violet}44` : `${C.edge}44`} stroke={i < 4 ? C.violet : C.edge} />
          <text x={105 + i * 72} y={134 - p * 200} textAnchor="middle" fontSize={9.5} fill={C.dim} style={mono}>{p.toFixed(2)}</text>
          <text x={105 + i * 72} y={156} textAnchor="middle" fontSize={9} fill={C.faint} style={mono}>cum {cum[i].toFixed(2)}</text>
        </g>
      ))}
      <line x1={368} y1={20} x2={368} y2={160} stroke={C.emerald} strokeDasharray="5 3" />
      <text x={376} y={32} fontSize={10} fill={C.emerald} style={mono}>p = 0.90 reached → cut</text>
      <text x={376} y={48} fontSize={9.5} fill={C.dim}>sample only from the kept set</text>
      <Cap cx={265} y={188} t="top-p keeps the smallest set whose probabilities sum past the threshold — the count adapts" />
    </svg>
  )
}

// finetuning mcq: catastrophic forgetting as skill bars
function CatastrophicForget(): ReactElement {
  const bars = (ox: number, med: number, code: number, chat: number) => (
    <g>
      <rect x={ox} y={130 - med * 100} width={34} height={med * 100} rx={4} fill={`${C.emerald}44`} stroke={C.emerald} />
      <rect x={ox + 46} y={130 - code * 100} width={34} height={code * 100} rx={4} fill={`${C.sky}44`} stroke={C.sky} />
      <rect x={ox + 92} y={130 - chat * 100} width={34} height={chat * 100} rx={4} fill={`${C.violet}44`} stroke={C.violet} />
      <text x={ox + 17} y={144} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>medical</text>
      <text x={ox + 63} y={144} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>coding</text>
      <text x={ox + 109} y={144} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>general</text>
    </g>
  )
  return (
    <svg viewBox="0 0 530 195" className="w-full h-auto">
      {bars(70, 0.35, 0.80, 0.85)}
      <text x={133} y={30} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>before fine-tuning</text>
      <Arr x1={230} y1={90} x2={290} y2={90} color={C.amber} />
      <text x={260} y={78} textAnchor="middle" fontSize={9.5} fill={C.amber} style={mono}>narrow medical SFT</text>
      {bars(320, 0.90, 0.45, 0.60)}
      <text x={383} y={30} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>after</text>
      <Cap cx={265} y={168} t="the same weights serve every skill — updates that help the new task can overwrite the old ones" />
      <Cap cx={265} y={186} t="mitigations: mixed replay data, lower learning rates, or adapters that leave the base frozen" />
    </svg>
  )
}

// rlhf mcq + paper-instruct-rlhf mcq: the KL penalty as a leash
function KlLeash(): ReactElement {
  return (
    <svg viewBox="0 0 530 190" className="w-full h-auto">
      <circle cx={130} cy={94} r={40} fill={`${C.sky}18`} stroke={C.sky} />
      <text x={130} y={91} textAnchor="middle" fontSize={10} fill={C.sky} style={mono}>reference</text>
      <text x={130} y={105} textAnchor="middle" fontSize={8.5} fill={C.dim} style={mono}>SFT model</text>
      <circle cx={325} cy={94} r={40} fill={`${C.violet}18`} stroke={C.violet} />
      <text x={325} y={91} textAnchor="middle" fontSize={10} fill={C.violet} style={mono}>policy</text>
      <text x={325} y={105} textAnchor="middle" fontSize={8.5} fill={C.dim} style={mono}>being optimized</text>
      <path d="M 166 76 C 210 54, 245 54, 289 76" fill="none" stroke={C.amber} strokeDasharray="5 3" />
      <text x={228} y={42} textAnchor="middle" fontSize={9.5} fill={C.amber} style={mono}>KL penalty: cost grows with distance</text>
      <Arr x1={369} y1={94} x2={434} y2={94} color={C.emerald} dash />
      <text x={436} y={72} fontSize={9.5} fill={C.emerald} style={mono}>reward pulls</text>
      <text x={436} y={86} fontSize={9.5} fill={C.emerald} style={mono}>further away</text>
      <Cap cx={265} y={152} t="reward alone finds degenerate text that games the reward model" />
      <Cap cx={265} y={170} t="the KL term is a leash: improve the reward, but stay close to coherent language" />
    </svg>
  )
}

// scaling-laws + chinchilla: the ~20 tokens per parameter rule
function TwentyToOne(): ReactElement {
  return (
    <svg viewBox="0 0 530 190" className="w-full h-auto">
      <rect x={90} y={50} width={18} height={26} rx={3} fill={`${C.violet}44`} stroke={C.violet} />
      <text x={130} y={67} fontSize={10.5} fill={C.violet} style={mono}>parameters N</text>
      <rect x={90} y={96} width={360} height={26} rx={3} fill={`${C.emerald}33`} stroke={C.emerald} />
      <text x={130} y={140} fontSize={10.5} fill={C.emerald} style={mono}>training tokens D ≈ 20 × N</text>
      <text x={470} y={67} textAnchor="end" fontSize={9.5} fill={C.dim} style={mono}>7B → 140B tokens</text>
      <text x={470} y={140} textAnchor="end" fontSize={9.5} fill={C.dim} style={mono}>70B → 1.4T tokens</text>
      <Cap cx={265} y={172} t="compute-optimal training feeds each parameter roughly twenty tokens — head arithmetic, not a launch plan" />
    </svg>
  )
}

// retrieval-basics + application-capstone numeric: context window budgeting
function ContextBudget(): ReactElement {
  return (
    <svg viewBox="0 0 530 175" className="w-full h-auto">
      <rect x={50} y={56} width={430} height={40} rx={8} fill="none" stroke={C.edge} />
      <rect x={50} y={56} width={78} height={40} rx={8} fill={`${C.amber}33`} stroke={C.amber} />
      <text x={89} y={80} textAnchor="middle" fontSize={9.5} fill={C.amber} style={mono}>reserved</text>
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          <rect x={136 + i * 62} y={62} width={56} height={28} rx={5} fill={`${C.violet}33`} stroke={C.violet} />
          <text x={164 + i * 62} y={80} textAnchor="middle" fontSize={8.5} fill={C.violet} style={mono}>{i === 2 ? '…' : 'chunk'}</text>
        </g>
      ))}
      <rect x={446} y={62} width={30} height={28} rx={5} fill="none" stroke={C.edge} strokeDasharray="4 3" />
      <text x={461} y={80} textAnchor="middle" fontSize={9} fill={C.faint} style={mono}>?</text>
      <text x={265} y={42} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>window = reserved (prompt + answer) + n full chunks</text>
      <Cap cx={265} y={124} t="n = floor((window − reserved) ÷ chunk size) — a partial chunk does not fit, so round down" />
      <Cap cx={265} y={142} t="the leftover sliver stays empty; budgets are integers" />
    </svg>
  )
}

// retrieval-quality mcq + model-cards predict: lost in the middle
function LostMiddle(): ReactElement {
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const x = i / 60
    const y = 0.86 - 0.55 * Math.exp(-((x - 0.5) * (x - 0.5)) / 0.045)
    pts.push(`${70 + x * 400},${140 - y * 120}`)
  }
  return (
    <svg viewBox="0 0 530 190" className="w-full h-auto">
      <line x1={70} y1={144} x2={480} y2={144} stroke={C.edge} />
      <line x1={70} y1={20} x2={70} y2={144} stroke={C.edge} />
      <polyline points={pts.join(' ')} fill="none" stroke={C.violet} strokeWidth={1.6} />
      <text x={90} y={36} fontSize={9.5} fill={C.emerald} style={mono}>start: recalled well</text>
      <text x={460} y={36} textAnchor="end" fontSize={9.5} fill={C.emerald} style={mono}>end: recalled well</text>
      <text x={265} y={116} textAnchor="middle" fontSize={9.5} fill={C.amber} style={mono}>middle: recall sags</text>
      <text x={480} y={160} textAnchor="end" fontSize={10} fill={C.dim} style={mono}>position of the fact in the context →</text>
      <text x={62} y={30} textAnchor="end" fontSize={10} fill={C.dim} style={mono}>recall</text>
      <Cap cx={265} y={182} t="accepting a long context is not the same as using it uniformly — placement and pruning still matter" />
    </svg>
  )
}

// tool-use mcq + application-capstone mcq: the trust boundary
function TrustBoundary(): ReactElement {
  return (
    <svg viewBox="0 0 530 200" className="w-full h-auto">
      <rect x={40} y={50} width={130} height={44} rx={8} fill={`${C.violet}18`} stroke={C.violet} />
      <text x={105} y={69} textAnchor="middle" fontSize={10.5} fill={C.violet} style={mono}>model</text>
      <text x={105} y={84} textAnchor="middle" fontSize={9} fill={C.dim}>proposes actions</text>
      <rect x={200} y={50} width={130} height={44} rx={8} fill={`${C.emerald}18`} stroke={C.emerald} />
      <text x={265} y={69} textAnchor="middle" fontSize={10.5} fill={C.emerald} style={mono}>application code</text>
      <text x={265} y={84} textAnchor="middle" fontSize={9} fill={C.dim}>validates, limits, executes</text>
      <rect x={360} y={50} width={130} height={44} rx={8} fill={C.box} stroke={C.edge} />
      <text x={425} y={69} textAnchor="middle" fontSize={10.5} fill={C.text} style={mono}>world</text>
      <text x={425} y={84} textAnchor="middle" fontSize={9} fill={C.dim}>APIs, payments, files</text>
      <Arr x1={170} y1={72} x2={198} y2={72} />
      <Arr x1={330} y1={72} x2={358} y2={72} />
      <path d="M 425 98 C 425 140, 105 140, 105 98" fill="none" stroke={C.amber} strokeDasharray="5 3" />
      <text x={265} y={150} textAnchor="middle" fontSize={9.5} fill={C.amber} style={mono}>tool output returns as untrusted text — data, never instructions</text>
      <line x1={186} y1={36} x2={186} y2={108} stroke={C.emerald} strokeDasharray="3 3" />
      <text x={186} y={28} textAnchor="middle" fontSize={9} fill={C.emerald} style={mono}>trust boundary</text>
      <Cap cx={265} y={186} t="authorization and side effects live in deterministic code; the model only ever suggests" />
    </svg>
  )
}

// agent-reliability worked + numeric, token-economics mcq: context grows every turn
function ContextGrowth(): ReactElement {
  const base = 500
  const per = 320
  return (
    <svg viewBox="0 0 530 195" className="w-full h-auto">
      {[0, 2, 4, 6, 8, 10].map((turn, i) => {
        const total = base + turn * per
        const h = (total / 3700) * 104
        const bh = (base / 3700) * 104
        const x = 70 + i * 72
        return (
          <g key={turn}>
            <rect x={x} y={152 - bh} width={44} height={bh} fill={`${C.sky}44`} stroke={C.sky} />
            {turn > 0 && <rect x={x} y={152 - h} width={44} height={h - bh} fill={`${C.violet}33`} stroke={C.violet} />}
            <text x={x + 22} y={166} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>turn {turn}</text>
            <text x={x + 22} y={146 - h} textAnchor="middle" fontSize={9} fill={C.text} style={mono}>{total}</text>
          </g>
        )
      })}
      <text x={70} y={26} fontSize={9.5} fill={C.sky} style={mono}>fixed: system prompt + task</text>
      <text x={230} y={26} fontSize={9.5} fill={C.violet} style={mono}>stacks: reasoning + tool call + observation, every turn</text>
      <Cap cx={265} y={188} t="nothing leaves the context between turns, so each turn is priced on everything before it" />
    </svg>
  )
}

// parallel-decoding predict: two unrelated meanings of the word mask
function TwoMasks(): ReactElement {
  const n = 4
  return (
    <svg viewBox="0 0 530 200" className="w-full h-auto">
      <text x={142} y={28} textAnchor="middle" fontSize={10} fill={C.violet} style={mono}>causal mask: attention rule</text>
      {Array.from({ length: n }).map((_, r) =>
        Array.from({ length: n }).map((_, c) => (
          <rect key={`m-${r}-${c}`} x={90 + c * 26} y={42 + r * 26} width={22} height={22} rx={3}
            fill={c <= r ? `${C.violet}55` : C.box} stroke={c <= r ? C.violet : C.edge} />
        ))
      )}
      <text x={142} y={166} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>who may look at whom</text>
      <text x={390} y={28} textAnchor="middle" fontSize={10} fill={C.amber} style={mono}>[MASK] token: placeholder in text</text>
      {['the', 'cat', '[MASK]', 'mat'].map((t, i) => (
        <g key={`t-${i}`}>
          <rect x={286 + i * 54} y={78} width={50} height={26} rx={5}
            fill={t === '[MASK]' ? `${C.amber}33` : C.box} stroke={t === '[MASK]' ? C.amber : C.edge} />
          <text x={311 + i * 54} y={95} textAnchor="middle" fontSize={8.5} fill={t === '[MASK]' ? C.amber : C.text} style={mono}>{t}</text>
        </g>
      ))}
      <text x={390} y={166} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>a slot the model must fill</text>
      <Cap cx={265} y={192} t="same word, two mechanisms: one hides positions from attention, the other is a token to predict" />
    </svg>
  )
}

// paper-aiayn-architecture predict + paper-bert-objective mcq: full vs triangular attention
function BidirVsCausal(): ReactElement {
  const n = 5
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      <text x={147} y={28} textAnchor="middle" fontSize={10} fill={C.emerald} style={mono}>bidirectional (encoder, BERT)</text>
      {Array.from({ length: n }).map((_, r) =>
        Array.from({ length: n }).map((_, c) => (
          <rect key={`b-${r}-${c}`} x={92 + c * 22} y={40 + r * 22} width={19} height={19} rx={3}
            fill={`${C.emerald}44`} stroke={C.emerald} />
        ))
      )}
      <text x={147} y={168} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>every token sees every token</text>
      <text x={385} y={28} textAnchor="middle" fontSize={10} fill={C.violet} style={mono}>causal (decoder, GPT)</text>
      {Array.from({ length: n }).map((_, r) =>
        Array.from({ length: n }).map((_, c) => (
          <rect key={`c-${r}-${c}`} x={330 + c * 22} y={40 + r * 22} width={19} height={19} rx={3}
            fill={c <= r ? `${C.violet}44` : C.box} stroke={c <= r ? C.violet : C.edge} />
        ))
      )}
      <text x={385} y={168} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>each token sees only its past</text>
      <Cap cx={265} y={196} t="rows are queries, columns are keys; the fill pattern is the whole architectural difference" />
    </svg>
  )
}

// paper-bert-finetuning mcq: the [CLS] token as sentence summary
function ClsToken(): ReactElement {
  const toks = ['[CLS]', 'the', 'film', 'was', 'great', '[SEP]']
  return (
    <svg viewBox="0 0 530 180" className="w-full h-auto">
      <text x={265} y={26} textAnchor="middle" fontSize={9.5} fill={C.dim} style={mono}>encoder attends bidirectionally across the whole sentence</text>
      {toks.map((t, i) => (
        <g key={i}>
          <rect x={40 + i * 60} y={40} width={54} height={26} rx={5}
            fill={i === 0 ? `${C.violet}33` : C.box} stroke={i === 0 ? C.violet : C.edge} />
          <text x={67 + i * 60} y={57} textAnchor="middle" fontSize={8.5} fill={i === 0 ? C.violet : C.text} style={mono}>{t}</text>
        </g>
      ))}
      <Arr x1={67} y1={68} x2={67} y2={96} />
      <rect x={26} y={98} width={82} height={26} rx={5} fill={`${C.violet}22`} stroke={C.violet} />
      <text x={67} y={115} textAnchor="middle" fontSize={8.5} fill={C.violet} style={mono}>CLS vector</text>
      <Arr x1={110} y1={111} x2={186} y2={111} />
      <rect x={188} y={98} width={138} height={26} rx={5} fill={`${C.emerald}22`} stroke={C.emerald} />
      <text x={257} y={115} textAnchor="middle" fontSize={8.5} fill={C.emerald} style={mono}>classification head</text>
      <Arr x1={328} y1={111} x2={384} y2={111} />
      <text x={392} y={115} fontSize={9.5} fill={C.text} style={mono}>positive / negative</text>
      <Cap cx={265} y={160} t="[CLS] carries no meaning of its own; attention lets it soak up a summary of the sentence" />
    </svg>
  )
}

// paper-instruct-rlhf mcq: a small aligned model beats a huge raw one
function SizeVsAlign(): ReactElement {
  return (
    <svg viewBox="0 0 530 190" className="w-full h-auto">
      <rect x={55} y={42} width={170} height={96} rx={8} fill={`${C.dim}15`} stroke={C.edge} />
      <text x={140} y={66} textAnchor="middle" fontSize={11} fill={C.text} style={mono}>GPT-3</text>
      <text x={140} y={84} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>175B params</text>
      <text x={140} y={104} textAnchor="middle" fontSize={8.5} fill={C.faint} style={mono}>objective: predict next token</text>
      <rect x={330} y={92} width={110} height={46} rx={8} fill={`${C.emerald}22`} stroke={C.emerald} />
      <text x={385} y={110} textAnchor="middle" fontSize={10.5} fill={C.emerald} style={mono}>InstructGPT</text>
      <text x={385} y={126} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>1.3B params</text>
      <text x={385} y={46} textAnchor="middle" fontSize={8.5} fill={C.emerald} style={mono}>objective: preferred by humans</text>
      <line x1={385} y1={52} x2={385} y2={88} stroke={C.amber} strokeWidth={1.4} strokeDasharray="4 3" />
      <text x={385} y={30} textAnchor="middle" fontSize={9.5} fill={C.amber} style={mono}>human labelers preferred this one</text>
      <Cap cx={265} y={164} t="135x fewer parameters, yet preferred: what a model optimizes matters more than how big it is" />
      <Cap cx={265} y={180} t="capability was never missing; it was pointed at the wrong target" />
    </svg>
  )
}

// paper-lora-hypothesis mcq: B initialized to zero means step 1 is the pretrained model
function LoraZeroInit(): ReactElement {
  return (
    <svg viewBox="0 0 530 175" className="w-full h-auto">
      <rect x={45} y={52} width={90} height={54} rx={8} fill={`${C.violet}22`} stroke={C.violet} />
      <text x={90} y={83} textAnchor="middle" fontSize={11} fill={C.violet} style={mono}>W</text>
      <text x={158} y={83} textAnchor="middle" fontSize={12} fill={C.dim} style={mono}>+</text>
      <rect x={180} y={52} width={64} height={54} rx={8} fill={`${C.amber}22`} stroke={C.amber} />
      <text x={212} y={76} textAnchor="middle" fontSize={10.5} fill={C.amber} style={mono}>B = 0</text>
      <text x={212} y={94} textAnchor="middle" fontSize={8} fill={C.dim} style={mono}>zeros</text>
      <rect x={252} y={52} width={64} height={54} rx={8} fill={`${C.sky}22`} stroke={C.sky} />
      <text x={284} y={76} textAnchor="middle" fontSize={10.5} fill={C.sky} style={mono}>A</text>
      <text x={284} y={94} textAnchor="middle" fontSize={8} fill={C.dim} style={mono}>random</text>
      <Arr x1={324} y1={79} x2={366} y2={79} />
      <text x={412} y={70} textAnchor="middle" fontSize={10} fill={C.text} style={mono}>BA = 0</text>
      <text x={412} y={88} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>W + 0 = W</text>
      <Cap cx={265} y={136} t="at step one the adapted model is bit-for-bit the pretrained model" />
      <Cap cx={265} y={152} t="training then grows the update away from zero, gradually and safely" />
    </svg>
  )
}

// paper-lora-math mcq: merging W' = W + BA removes all inference overhead
function LoraMerge(): ReactElement {
  return (
    <svg viewBox="0 0 530 200" className="w-full h-auto">
      <text x={140} y={28} textAnchor="middle" fontSize={10} fill={C.amber} style={mono}>adapter kept separate</text>
      <rect x={60} y={44} width={70} height={30} rx={6} fill={C.box} stroke={C.edge} />
      <text x={95} y={63} textAnchor="middle" fontSize={9} fill={C.text} style={mono}>x</text>
      <Arr x1={130} y1={59} x2={158} y2={59} />
      <rect x={160} y={44} width={70} height={30} rx={6} fill={`${C.violet}22`} stroke={C.violet} />
      <text x={195} y={63} textAnchor="middle" fontSize={9} fill={C.violet} style={mono}>Wx</text>
      <rect x={160} y={92} width={70} height={30} rx={6} fill={`${C.amber}22`} stroke={C.amber} />
      <text x={195} y={111} textAnchor="middle" fontSize={9} fill={C.amber} style={mono}>BAx</text>
      <path d="M 130 62 C 146 62, 146 107, 158 107" fill="none" stroke={C.amber} />
      <text x={140} y={146} textAnchor="middle" fontSize={9} fill={C.amber} style={mono}>two paths per layer: extra work</text>
      <text x={390} y={28} textAnchor="middle" fontSize={10} fill={C.emerald} style={mono}>merged for deployment</text>
      <rect x={300} y={58} width={70} height={30} rx={6} fill={C.box} stroke={C.edge} />
      <text x={335} y={77} textAnchor="middle" fontSize={9} fill={C.text} style={mono}>x</text>
      <Arr x1={370} y1={73} x2={398} y2={73} />
      <rect x={400} y={58} width={106} height={30} rx={6} fill={`${C.emerald}22`} stroke={C.emerald} />
      <text x={453} y={77} textAnchor="middle" fontSize={9} fill={C.emerald} style={mono}>(W + BA) x</text>
      <text x={390} y={112} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>same shape as W, one matmul</text>
      <text x={390} y={146} textAnchor="middle" fontSize={9} fill={C.emerald} style={mono}>zero extra latency</text>
      <Cap cx={265} y={188} t="because BA has the same shape as W, addition folds the adapter away before serving" />
    </svg>
  )
}

// paper-cot-limits predict: more tokens literally buys more compute
function TokenCompute(): ReactElement {
  return (
    <svg viewBox="0 0 530 185" className="w-full h-auto">
      <text x={70} y={34} fontSize={10} fill={C.dim} style={mono}>direct answer:</text>
      <rect x={200} y={20} width={26} height={22} rx={4} fill={`${C.violet}44`} stroke={C.violet} />
      <text x={240} y={35} fontSize={9} fill={C.faint} style={mono}>1 forward pass of compute</text>
      <text x={70} y={86} fontSize={10} fill={C.dim} style={mono}>chain of thought:</text>
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={200 + i * 30} y={72} width={26} height={22} rx={4} fill={`${C.emerald}33`} stroke={C.emerald} />
      ))}
      <text x={200} y={116} fontSize={9} fill={C.faint} style={mono}>every generated token is one more full forward pass</text>
      <Cap cx={265} y={150} t="per-token compute is fixed, so total thinking = passes x per-pass cost" />
      <Cap cx={265} y={166} t="a longer chain is not just organized text; it is a bigger computation budget" />
    </svg>
  )
}

export const FIGURES_QUIZ: Record<string, () => ReactElement> = {
  'fx-batch-count': BatchCount,
  'fx-read-shape': ReadShape,
  'fx-axis-collapse': AxisCollapse,
  'fx-reshape-legal': ReshapeLegal,
  'fx-vec-compare': VecCompare,
  'fx-vec-compare2': VecCompare2,
  'fx-strawberry': Strawberry,
  'fx-temp-curves': TempCurves,
  'fx-scale-softmax': ScaleSoftmax,
  'fx-layernorm': LayerNormFig,
  'fx-shift-targets': ShiftTargets,
  'fx-surprise-loss': SurpriseLoss,
  'fx-grad-step': GradStep,
  'fx-weight-tying': WeightTying,
  'fx-roulette': Roulette,
  'fx-nucleus': NucleusCut,
  'fx-catastrophic': CatastrophicForget,
  'fx-kl-leash': KlLeash,
  'fx-twenty-to-one': TwentyToOne,
  'fx-context-budget': ContextBudget,
  'fx-lost-middle': LostMiddle,
  'fx-trust-boundary': TrustBoundary,
  'fx-context-growth': ContextGrowth,
  'fx-two-masks': TwoMasks,
  'fx-bidir-vs-causal': BidirVsCausal,
  'fx-cls-token': ClsToken,
  'fx-size-vs-align': SizeVsAlign,
  'fx-lora-zero-init': LoraZeroInit,
  'fx-lora-merge': LoraMerge,
  'fx-token-compute': TokenCompute,
}
