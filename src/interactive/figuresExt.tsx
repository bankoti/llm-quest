// Extended concept figures: stages 1 and 3-7, frontier, and papers.
// Same contract as figures.tsx: static dark-theme SVG, no state.
import type { ReactElement } from 'react'
import { C, mono, TokenBox } from './figures'

const Cap = ({ cx, y, t }: { cx: number; y: number; t: string }): ReactElement => (
  <text x={cx} y={y} textAnchor="middle" fontSize={11} fill={C.faint}>{t}</text>
)
function BoxL({ x, y, w, h = 30, label, sub, color }: { x: number; y: number; w: number; h?: number; label: string; sub?: string; color?: string }): ReactElement {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={color ? `${color}18` : C.box} stroke={color ?? C.edge} />
      <text x={x + w / 2} y={y + (sub ? 13 : h / 2 + 4)} textAnchor="middle" fontSize={11.5} fill={color ?? C.text} style={mono}>{label}</text>
      {sub ? <text x={x + w / 2} y={y + 25} textAnchor="middle" fontSize={9} fill={C.dim}>{sub}</text> : null}
    </g>
  )
}
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

// ---------------- Stage 1: foundations ----------------

// numbers-to-tensors: scalar / vector / matrix / batch
function TensorRanks(): ReactElement {
  const cell = (x: number, y: number, f?: string, k?: string) => <rect key={k} x={x} y={y} width={17} height={17} rx={3} fill={f ?? C.box} stroke={C.edge} />
  const grid = (ox: number, oy: number, rows: number, cols: number) => {
    const out: ReactElement[] = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push(cell(ox + c * 19, oy + r * 19, undefined, `${ox}-${r}-${c}`))
    return out
  }
  const lab = (x: number, t: string) => <text x={x} y={138} textAnchor="middle" fontSize={11} fill={C.dim} style={mono}>{t}</text>
  return (
    <svg viewBox="0 0 530 172" className="w-full h-auto">
      {cell(38, 76, `${C.violet}22`)}
      {grid(112, 76, 1, 4)}
      {grid(232, 48, 4, 3)}
      <g opacity={0.4}>{grid(384, 40, 4, 3)}</g>
      {grid(394, 50, 4, 3)}
      {lab(46, 'scalar')}
      {lab(148, 'vector (T,)')}
      {lab(259, 'matrix (T, C)')}
      {lab(426, 'batch (B, T, C)')}
      <Cap cx={265} y={163} t="the same kind of numbers with more axes — the shape names what each axis means" />
    </svg>
  )
}

// axes-and-slices: axis directions and one slice
function AxesDirections(): ReactElement {
  const s = 26, ox = 170, oy = 44
  const cells: ReactElement[] = []
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++)
    cells.push(<rect key={`${r}-${c}`} x={ox + c * s} y={oy + r * s} width={s - 3} height={s - 3} rx={4} fill={r === 1 ? `${C.emerald}22` : C.box} stroke={r === 1 ? C.emerald : C.edge} />)
  return (
    <svg viewBox="0 0 530 195" className="w-full h-auto">
      {cells}
      <Arr x1={ox - 16} y1={oy + 4} x2={ox - 16} y2={oy + 96} color={C.violet} />
      <text x={ox - 26} y={oy + 52} fontSize={10.5} fill={C.violet} transform={`rotate(-90 ${ox - 26} ${oy + 52})`} textAnchor="middle" style={mono}>axis 0</text>
      <Arr x1={ox + 4} y1={oy - 14} x2={ox + 118} y2={oy - 14} color={C.sky} />
      <text x={ox + 61} y={oy - 22} fontSize={10.5} fill={C.sky} textAnchor="middle" style={mono}>axis 1</text>
      <text x={ox + 148} y={oy + 42} fontSize={11} fill={C.emerald} style={mono}>x[1]</text>
      <text x={ox + 148} y={oy + 57} fontSize={9.5} fill={C.dim}>one row — shape (5,)</text>
      <Cap cx={265} y={182} t="indexing one axis removes it: one row of a (4, 5) matrix is a (5,) vector" />
    </svg>
  )
}

// matmul: row meets column
function MatmulRowCol(): ReactElement {
  const g = (ox: number, oy: number, rows: number, cols: number, hi: (r: number, c: number) => string | null) => {
    const out: ReactElement[] = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const h = hi(r, c)
      out.push(<rect key={`${ox}-${r}-${c}`} x={ox + c * 26} y={oy + r * 26} width={23} height={23} rx={4} fill={h ? `${h}22` : C.box} stroke={h ?? C.edge} />)
    }
    return out
  }
  return (
    <svg viewBox="0 0 530 190" className="w-full h-auto">
      {g(60, 52, 2, 3, (r) => r === 0 ? C.violet : null)}
      <text x={160} y={82} textAnchor="middle" fontSize={15} fill={C.dim} style={mono}>@</text>
      {g(190, 40, 3, 2, (_r, c) => c === 1 ? C.sky : null)}
      <text x={276} y={82} textAnchor="middle" fontSize={15} fill={C.dim} style={mono}>=</text>
      {g(310, 52, 2, 2, (r, c) => r === 0 && c === 1 ? C.emerald : null)}
      <text x={95} y={140} textAnchor="middle" fontSize={11} fill={C.violet} style={mono}>row 0</text>
      <text x={232} y={140} textAnchor="middle" fontSize={11} fill={C.sky} style={mono}>col 1</text>
      <text x={336} y={140} textAnchor="middle" fontSize={11} fill={C.emerald} style={mono}>C[0,1]</text>
      <text x={390} y={82} fontSize={10} fill={C.dim} style={mono}>(2,3)@(3,2)=(2,2)</text>
      <Cap cx={265} y={178} t="C[0,1] = row 0 of A · column 1 of B — the inner 3s must match, then they disappear" />
    </svg>
  )
}

// dot-product-similarity: agreement of directions
function DotAgreement(): ReactElement {
  const panel = (cx: number, a2: [number, number], b2: [number, number], color: string, t1: string, t2: string) => (
    <g>
      <circle cx={cx} cy={104} r={3} fill={C.dim} />
      <Arr x1={cx} y1={104} x2={cx + a2[0]} y2={104 + a2[1]} color={color} />
      <Arr x1={cx} y1={104} x2={cx + b2[0]} y2={104 + b2[1]} color={C.dim} />
      <text x={cx} y={140} textAnchor="middle" fontSize={11} fill={color} style={mono}>{t1}</text>
      <text x={cx} y={155} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>{t2}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 530 185" className="w-full h-auto">
      {panel(95, [46, -40], [24, -52], C.emerald, 'aligned', 'a·b large +')}
      {panel(265, [52, -6], [4, -56], C.sky, 'orthogonal', 'a·b ≈ 0')}
      {panel(435, [48, -26], [-46, 26], C.amber, 'opposed', 'a·b negative')}
      <Cap cx={265} y={176} t="treat vectors as directions: the dot product scores how much they agree" />
    </svg>
  )
}

// tokens-and-ids: text to pieces to integers
function TokenPipeline(): ReactElement {
  const ids = ['517', '1256', '481']
  const tx = [300, 360, 420]
  return (
    <svg viewBox="0 0 530 175" className="w-full h-auto">
      <BoxL x={14} y={52} w={118} label={'“unbelievable”'} />
      <Arr x1={132} y1={67} x2={162} y2={67} />
      <BoxL x={164} y={52} w={94} label="tokenizer" color={C.violet} />
      <Arr x1={258} y1={67} x2={294} y2={67} />
      <TokenBox x={300} y={54} w={52} label="un" accent={C.sky} />
      <TokenBox x={360} y={54} w={52} label="believ" accent={C.sky} />
      <TokenBox x={420} y={54} w={52} label="able" accent={C.sky} />
      {tx.map((x, i) => <g key={i}>
        <Arr x1={x + 26} y1={82} x2={x + 26} y2={104} />
        <text x={x + 26} y={122} textAnchor="middle" fontSize={12} fill={C.emerald} style={mono}>{ids[i]}</text>
      </g>)}
      <Cap cx={265} y={162} t="the model never sees letters — only these integers reach it" />
    </svg>
  )
}

// subword-tokenization: three vocabularies, one word
function SubwordTradeoff(): ReactElement {
  const row = (y: number, name: string, color: string | undefined, boxes: string[], w: number, note: string) => (
    <g>
      <text x={128} y={y + 17} textAnchor="end" fontSize={11} fill={color ?? C.dim} style={mono}>{name}</text>
      {boxes.map((b, i) => <TokenBox key={i} x={140 + i * (w + 3)} y={y} w={w} label={b} accent={color} />)}
      <text x={516} y={y + 17} textAnchor="end" fontSize={9.5} fill={C.faint}>{note}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 530 175" className="w-full h-auto">
      {row(20, 'word', C.amber, ['[UNK]'], 62, 'not in vocabulary')}
      {row(62, 'character', undefined, ['u','n','b','e','l','i','e','v','a','b','l','e'], 22, '12 steps')}
      {row(104, 'subword', C.emerald, ['un','believ','able'], 62, '3 reusable pieces')}
      <Cap cx={265} y={162} t="a fixed vocabulary that still covers any string — rare words become known pieces" />
    </svg>
  )
}

// embedding-lookup: id selects one learned row
function EmbeddingRow(): ReactElement {
  const cells: ReactElement[] = []
  for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++)
    cells.push(<rect key={`${r}-${c}`} x={196 + c * 22} y={22 + r * 22} width={19} height={19} rx={3} fill={r === 4 ? `${C.emerald}22` : C.box} stroke={r === 4 ? C.emerald : C.edge} />)
  return (
    <svg viewBox="0 0 530 190" className="w-full h-auto">
      {cells}
      {[0,1,2,3,4,5].map(r => <text key={r} x={186} y={36 + r * 22} textAnchor="end" fontSize={9.5} fill={r === 4 ? C.emerald : C.faint} style={mono}>{r}</text>)}
      <TokenBox x={44} y={107} w={70} label="id = 4" accent={C.violet} />
      <Arr x1={114} y1={120} x2={190} y2={120} color={C.violet} />
      <Arr x1={310} y1={120} x2={352} y2={120} color={C.emerald} />
      {[0,1,2,3,4].map(c => <rect key={c} x={358 + c * 22} y={110} width={19} height={19} rx={3} fill={`${C.emerald}22`} stroke={C.emerald} />)}
      <text x={412} y={148} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>shape (C,)</text>
      <text x={251} y={172} textAnchor="middle" fontSize={10} fill={C.faint}>embedding table (V × C)</text>
      <Cap cx={265} y={188} t="a lookup, not a computation — and every number in the row is learned" />
    </svg>
  )
}

// linear-layers: rows as learned questions
function LinearQuestions(): ReactElement {
  const vcell = (x: number, y: number, color?: string) => <rect x={x} y={y} width={19} height={19} rx={3} fill={color ? `${color}22` : C.box} stroke={color ?? C.edge} />
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      {[0,1,2,3].map(i => <g key={i}>{vcell(60, 34 + i * 22, C.sky)}</g>)}
      <text x={69} y={140} textAnchor="middle" fontSize={10.5} fill={C.sky} style={mono}>x (4,)</text>
      {[0,1,2].map(r => <g key={r}>
        {[0,1,2,3].map(c => <g key={c}>{vcell(170 + c * 22, 40 + r * 34, C.violet)}</g>)}
        <text x={160} y={54 + r * 34} textAnchor="end" fontSize={10} fill={C.violet} style={mono}>{`w${r}`}</text>
        <Arr x1={262} y1={50 + r * 34} x2={330} y2={50 + r * 34} />
        {vcell(336, 40 + r * 34, C.emerald)}
        <text x={368} y={54 + r * 34} fontSize={10} fill={C.emerald} style={mono}>{`y${r}`}</text>
      </g>)}
      <text x={214} y={160} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>W (3 × 4)</text>
      <text x={430} y={90} fontSize={11} fill={C.text} style={mono}>{'yᵢ = wᵢ·x + bᵢ'}</text>
      <Cap cx={265} y={192} t="three learned rows ask three different questions of the same input" />
    </svg>
  )
}

// softmax-probabilities: scores to shares
function SoftmaxShares(): ReactElement {
  const logits = [3.1, 1.2, 0.4, -0.8]
  const probs = [0.81, 0.12, 0.05, 0.02]
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      <line x1={40} y1={120} x2={200} y2={120} stroke={C.edge} />
      {logits.map((v, i) => <g key={i}>
        <rect x={54 + i * 36} y={v > 0 ? 120 - v * 22 : 120} width={22} height={Math.abs(v) * 22} rx={2} fill={v > 0 ? `${C.sky}55` : `${C.amber}55`} stroke={v > 0 ? C.sky : C.amber} />
        <text x={65 + i * 36} y={148} textAnchor="middle" fontSize={9.5} fill={C.dim} style={mono}>{v}</text>
      </g>)}
      <text x={120} y={172} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>logits — any real numbers</text>
      <Arr x1={215} y1={100} x2={290} y2={100} color={C.violet} />
      <text x={252} y={88} textAnchor="middle" fontSize={10} fill={C.violet} style={mono}>exp, ÷ sum</text>
      <line x1={300} y1={120} x2={470} y2={120} stroke={C.edge} />
      {probs.map((v, i) => <g key={i}>
        <rect x={314 + i * 40} y={120 - v * 100} width={24} height={v * 100} rx={2} fill={`${C.emerald}55`} stroke={C.emerald} />
        <text x={326 + i * 40} y={148} textAnchor="middle" fontSize={9.5} fill={C.dim} style={mono}>{v.toFixed(2)}</text>
      </g>)}
      <text x={390} y={172} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>probabilities — sum = 1</text>
      <Cap cx={265} y={195} t="order preserved, gaps exaggerated, negatives welcome" />
    </svg>
  )
}

// next-token-prediction: one distribution at a time
function NextTokenDist(): ReactElement {
  const toks = ['The', 'cat', 'sat', 'on', 'the']
  const cand = [ { t: 'mat', p: 0.61 }, { t: 'sofa', p: 0.18 }, { t: 'floor', p: 0.09 }, { t: 'rug', p: 0.05 }, { t: '…rest', p: 0.07 } ]
  return (
    <svg viewBox="0 0 530 235" className="w-full h-auto">
      {toks.map((t, i) => <TokenBox key={i} x={110 + i * 62} y={14} w={56} label={t} />)}
      <Arr x1={265} y1={42} x2={265} y2={62} />
      <BoxL x={218} y={64} w={94} label="model" color={C.violet} />
      <Arr x1={265} y1={94} x2={265} y2={112} />
      {cand.map((c, i) => <g key={i}>
        <rect x={130 + i * 60} y={190 - c.p * 120} width={30} height={c.p * 120} rx={3} fill={i === 0 ? `${C.emerald}55` : `${C.sky}33`} stroke={i === 0 ? C.emerald : C.sky} />
        <text x={145 + i * 60} y={205} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>{c.t}</text>
        <text x={145 + i * 60} y={185 - c.p * 120} textAnchor="middle" fontSize={9.5} fill={i === 0 ? C.emerald : C.faint} style={mono}>{c.p.toFixed(2)}</text>
      </g>)}
      <Cap cx={265} y={228} t="one forward pass, one distribution over the entire vocabulary" />
    </svg>
  )
}

// ---------------- Stage 3: training ----------------

// training-objective: text is its own answer key
function AnswerKey(): ReactElement {
  const toks = ['The', 'cat', 'sat', 'on', 'the', 'mat']
  const row = (y: number, n: number) => (
    <g>
      {toks.slice(0, n).map((t, i) => <TokenBox key={i} x={40 + i * 56} y={y} w={50} label={t} />)}
      <Arr x1={40 + n * 56 + 2} y1={y + 13} x2={40 + n * 56 + 30} y2={y + 13} color={C.emerald} />
      <TokenBox x={40 + n * 56 + 36} y={y} w={50} label={toks[n]} accent={C.emerald} />
    </g>
  )
  return (
    <svg viewBox="0 0 530 195" className="w-full h-auto">
      {row(16, 1)}
      {row(54, 2)}
      {row(92, 3)}
      <text x={265} y={140} textAnchor="middle" fontSize={13} fill={C.faint}>⋮</text>
      <text x={440} y={30} fontSize={9.5} fill={C.emerald}>target</text>
      <Cap cx={265} y={162} t="six tokens = five supervised examples — and one pass scores them all" />
    </svg>
  )
}

// training-data: crawl to corpus
function DataFunnel(): ReactElement {
  const rows = [
    { w: 440, label: 'raw crawl', note: 'boilerplate, spam, duplicates', color: undefined },
    { w: 320, label: 'quality + language filters', note: 'classifiers and heuristics', color: undefined },
    { w: 220, label: 'deduplication', note: 'near-copies removed', color: undefined },
    { w: 150, label: 'weighted mix', note: 'books, code, web, reference', color: C.emerald },
  ]
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      {rows.map((r, i) => <g key={i}>
        <rect x={265 - r.w / 2} y={14 + i * 42} width={r.w} height={26} rx={6} fill={r.color ? `${r.color}18` : C.box} stroke={r.color ?? C.edge} />
        <text x={265} y={31 + i * 42} textAnchor="middle" fontSize={11} fill={r.color ?? C.text} style={mono}>{r.label}</text>
        <text x={500} y={31 + i * 42} textAnchor="end" fontSize={9.5} fill={C.faint}>{r.note}</text>
        {i < 3 ? <Arr x1={265} y1={40 + i * 42} x2={265} y2={54 + i * 42} /> : null}
      </g>)}
      <Cap cx={265} y={196} t="most of the crawl never reaches training — curation is the quiet lever" />
    </svg>
  )
}

// gradients: loss slope at a point
function LossSlope(): ReactElement {
  return (
    <svg viewBox="0 0 530 235" className="w-full h-auto">
      <line x1={50} y1={200} x2={490} y2={200} stroke={C.edge} />
      <line x1={50} y1={200} x2={50} y2={20} stroke={C.edge} />
      <text x={480} y={216} textAnchor="end" fontSize={10.5} fill={C.dim} style={mono}>one weight w</text>
      <text x={42} y={30} textAnchor="end" fontSize={10.5} fill={C.dim} style={mono}>loss</text>
      <path d="M 70 30 Q 265 250 460 30" fill="none" stroke={C.sky} strokeWidth={1.5} />
      <circle cx={167} cy={112} r={4} fill={C.violet} />
      <line x1={115} y1={83} x2={219} y2={141} stroke={C.violet} strokeDasharray="4 3" />
      <text x={120} y={70} fontSize={10} fill={C.violet} style={mono}>gradient = slope here</text>
      <Arr x1={175} y1={124} x2={232} y2={156} color={C.emerald} />
      <text x={248} y={172} fontSize={10} fill={C.emerald} style={mono}>step the other way</text>
      <Cap cx={265} y={230} t="the gradient is local — it only promises improvement for a small step" />
    </svg>
  )
}

// backpropagation: sensitivity flows backward
function BackpropChain(): ReactElement {
  return (
    <svg viewBox="0 0 530 190" className="w-full h-auto">
      <TokenBox x={14} y={50} w={44} label="x" accent={C.sky} />
      <Arr x1={58} y1={63} x2={86} y2={63} />
      <BoxL x={88} y={50} w={72} label="op₁" />
      <Arr x1={160} y1={63} x2={188} y2={63} />
      <TokenBox x={190} y={50} w={44} label="a" accent={C.sky} />
      <Arr x1={234} y1={63} x2={262} y2={63} />
      <BoxL x={264} y={50} w={72} label="op₂" />
      <Arr x1={336} y1={63} x2={364} y2={63} />
      <TokenBox x={366} y={50} w={44} label="b" accent={C.sky} />
      <Arr x1={410} y1={63} x2={438} y2={63} />
      <BoxL x={440} y={50} w={72} label="loss" color={C.amber} />
      <Arr x1={440} y1={120} x2={392} y2={120} color={C.amber} dash />
      <Arr x1={366} y1={120} x2={240} y2={120} color={C.amber} dash />
      <Arr x1={214} y1={120} x2={64} y2={120} color={C.amber} dash />
      <text x={415} y={138} textAnchor="middle" fontSize={10} fill={C.amber} style={mono}>∂L/∂b</text>
      <text x={300} y={138} textAnchor="middle" fontSize={10} fill={C.amber} style={mono}>∂L/∂a</text>
      <text x={140} y={138} textAnchor="middle" fontSize={10} fill={C.amber} style={mono}>∂L/∂x</text>
      <Cap cx={265} y={172} t="each op multiplies in its local sensitivity — the chain rule, applied backward" />
    </svg>
  )
}

// optimizer-loop: four phases repeat
function TrainCycle(): ReactElement {
  return (
    <svg viewBox="0 0 530 245" className="w-full h-auto">
      <BoxL x={205} y={16} w={120} label="forward" sub="predictions" color={C.sky} />
      <BoxL x={382} y={102} w={120} label="loss" sub="compare with targets" color={C.amber} />
      <BoxL x={205} y={188} w={120} label="backward" sub="gradients" color={C.violet} />
      <BoxL x={28} y={102} w={120} label="update" sub="nudge every weight" color={C.emerald} />
      <Arr x1={330} y1={40} x2={420} y2={98} />
      <Arr x1={420} y1={136} x2={330} y2={196} />
      <Arr x1={200} y1={196} x2={110} y2={136} />
      <Arr x1={110} y1={98} x2={200} y2={40} />
      <text x={265} y={125} textAnchor="middle" fontSize={11} fill={C.dim} style={mono}>one step</text>
      <Cap cx={265} y={238} t="four phases, one loop — repeated millions of times" />
    </svg>
  )
}

// validation-generalization: two curves diverge
function TrainValCurves(): ReactElement {
  return (
    <svg viewBox="0 0 530 225" className="w-full h-auto">
      <line x1={50} y1={190} x2={490} y2={190} stroke={C.edge} />
      <line x1={50} y1={190} x2={50} y2={20} stroke={C.edge} />
      <text x={480} y={206} textAnchor="end" fontSize={10.5} fill={C.dim} style={mono}>training steps</text>
      <text x={42} y={30} textAnchor="end" fontSize={10.5} fill={C.dim} style={mono}>loss</text>
      <path d="M 60 40 C 160 150, 300 170, 480 178" fill="none" stroke={C.violet} strokeWidth={1.5} />
      <path d="M 60 44 C 160 130, 240 120, 300 118 C 370 116, 430 90, 478 62" fill="none" stroke={C.amber} strokeWidth={1.5} />
      <line x1={300} y1={30} x2={300} y2={190} stroke={C.faint} strokeDasharray="4 3" />
      <text x={306} y={40} fontSize={9.5} fill={C.faint}>validation stops improving</text>
      <text x={420} y={175} fontSize={10} fill={C.violet} style={mono}>train</text>
      <text x={420} y={72} fontSize={10} fill={C.amber} style={mono}>validation</text>
      <Cap cx={265} y={218} t="falling training loss with rising validation loss = memorization, not learning" />
    </svg>
  )
}

// ---------------- Stage 4: generation ----------------

// decoding-basics: prediction vs choice
function DecodeTree(): ReactElement {
  const cand = [ { t: 'mat', p: 0.62 }, { t: 'sofa', p: 0.20 }, { t: 'rug', p: 0.10 }, { t: '…', p: 0.08 } ]
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      {cand.map((c, i) => <g key={i}>
        <rect x={40 + i * 44} y={130 - c.p * 140} width={26} height={c.p * 140} rx={3} fill={`${C.sky}33`} stroke={C.sky} />
        <text x={53 + i * 44} y={146} textAnchor="middle" fontSize={9.5} fill={C.dim} style={mono}>{c.t}</text>
      </g>)}
      <text x={128} y={170} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>the model's distribution</text>
      <Arr x1={230} y1={70} x2={290} y2={50} color={C.violet} />
      <Arr x1={230} y1={110} x2={290} y2={130} color={C.emerald} />
      <BoxL x={296} y={32} w={212} label="greedy: always argmax" sub="same text every run; can loop" color={C.violet} />
      <BoxL x={296} y={116} w={212} label="sample: draw ∝ probability" sub="varied runs; controlled surprise" color={C.emerald} />
      <Cap cx={265} y={196} t="prediction is the model's job; choice belongs to the decoding rule" />
    </svg>
  )
}

// decoding-controls: reshape or truncate
function DistReshape(): ReactElement {
  const base = [0.45, 0.25, 0.15, 0.10, 0.05]
  const sharp = [0.68, 0.21, 0.07, 0.03, 0.01]
  const topk = [0.64, 0.36, 0, 0, 0]
  const topp = [0.53, 0.29, 0.18, 0, 0]
  const panel = (ox: number, vals: number[], title: string, color: string) => (
    <g>
      <line x1={ox} y1={120} x2={ox + 130} y2={120} stroke={C.edge} />
      {vals.map((v, i) => v > 0
        ? <rect key={i} x={ox + 8 + i * 25} y={120 - v * 130} width={17} height={v * 130} rx={2} fill={`${color}44`} stroke={color} />
        : <rect key={i} x={ox + 8 + i * 25} y={112} width={17} height={8} rx={2} fill="none" stroke={C.faint} strokeDasharray="2 2" />)}
      <text x={ox + 65} y={140} textAnchor="middle" fontSize={10.5} fill={color} style={mono}>{title}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 530 185" className="w-full h-auto">
      {panel(20, sharp, 'temperature 0.5', C.violet)}
      {panel(195, topk, 'top-k (k = 2)', C.sky)}
      {panel(370, topp, 'top-p (p = 0.85)', C.emerald)}
      <text x={265} y={22} textAnchor="middle" fontSize={10.5} fill={C.dim}>the same base distribution under three controls</text>
      <Cap cx={265} y={172} t="temperature reshapes; top-k and top-p truncate — all before the draw" />
    </svg>
  )
}

// llm-in-practice: anatomy of a few-shot prompt
function PromptAnatomy(): ReactElement {
  const seg = (x: number, w: number, label: string, sub: string, color: string) => (
    <g>
      <rect x={x} y={46} width={w} height={34} fill={`${color}18`} stroke={color} />
      <text x={x + w / 2} y={60} textAnchor="middle" fontSize={10} fill={color} style={mono}>{label}</text>
      <text x={x + w / 2} y={73} textAnchor="middle" fontSize={8.5} fill={C.dim}>{sub}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 530 175" className="w-full h-auto">
      <rect x={20} y={40} width={380} height={46} rx={8} fill="none" stroke={C.edge} strokeDasharray="4 3" />
      <text x={210} y={30} textAnchor="middle" fontSize={10} fill={C.faint} style={mono}>context window</text>
      {seg(28, 86, 'system', 'instructions', C.violet)}
      {seg(118, 88, 'example 1', 'in → out', C.sky)}
      {seg(210, 88, 'example 2', 'in → out', C.sky)}
      {seg(302, 90, 'question', 'the real task', C.emerald)}
      <Arr x1={400} y1={63} x2={434} y2={63} />
      <BoxL x={436} y={48} w={80} label="model" />
      <Cap cx={265} y={125} t="the pattern lives in the context; the weights never change" />
      <Cap cx={265} y={143} t="the model completes the pattern it was shown" />
    </svg>
  )
}

// ---------------- Stage 5: adaptation ----------------

// finetuning-basics: continue training, narrower data
function SftShift(): ReactElement {
  return (
    <svg viewBox="0 0 530 175" className="w-full h-auto">
      <BoxL x={14} y={64} w={140} label="pretrained model" sub="broad web patterns" />
      <Arr x1={154} y1={79} x2={192} y2={79} />
      <BoxL x={194} y={64} w={160} label="continue training" sub="instruction → response pairs" color={C.violet} />
      <Arr x1={354} y1={79} x2={392} y2={79} />
      <BoxL x={394} y={64} w={122} label="same weights" sub="assistant behavior" color={C.emerald} />
      <rect x={238} y={16} width={72} height={10} rx={3} fill={`${C.violet}30`} stroke={C.violet} />
      <rect x={244} y={30} width={60} height={10} rx={3} fill={`${C.violet}30`} stroke={C.violet} />
      <Arr x1={274} y1={42} x2={274} y2={60} color={C.violet} />
      <text x={330} y={28} fontSize={9} fill={C.dim}>small curated dataset</text>
      <Cap cx={265} y={130} t="same objective, same architecture, narrower data — behavior follows the data" />
    </svg>
  )
}

// lora: a thin bypass around a frozen matrix
function LoraBypass(): ReactElement {
  return (
    <svg viewBox="0 0 530 215" className="w-full h-auto">
      <TokenBox x={14} y={62} w={44} label="x" accent={C.sky} />
      <Arr x1={58} y1={75} x2={116} y2={75} />
      <BoxL x={118} y={56} w={170} h={38} label="W — frozen" sub="d × k, never updated" />
      <Arr x1={288} y1={75} x2={382} y2={75} />
      <circle cx={396} cy={75} r={12} fill={C.bg} stroke={C.amber} />
      <text x={396} y={80} textAnchor="middle" fontSize={13} fill={C.amber} style={mono}>+</text>
      <Arr x1={408} y1={75} x2={452} y2={75} />
      <TokenBox x={456} y={62} w={44} label="y" accent={C.emerald} />
      <path d="M 36 88 L 36 160 L 130 160" fill="none" stroke={C.violet} />
      <BoxL x={132} y={145} w={60} label="A" sub="d × r" color={C.violet} />
      <Arr x1={192} y1={160} x2={226} y2={160} color={C.violet} />
      <BoxL x={228} y={145} w={60} label="B" sub="r × k" color={C.violet} />
      <path d="M 288 160 L 396 160 L 396 91" fill="none" stroke={C.violet} />
      <path d="M 392 99 L 396 91 L 400 99" fill="none" stroke={C.violet} />
      <text x={330} y={135} fontSize={10.5} fill={C.violet} style={mono}>r ≪ d</text>
      <Cap cx={265} y={205} t="the whole update lives in two thin matrices — W itself is never touched" />
    </svg>
  )
}

// distillation: soft targets beat hard labels
function TeacherStudent(): ReactElement {
  const soft = [ { t: 'Paris', p: 0.85 }, { t: 'Lyon', p: 0.10 }, { t: 'Rome', p: 0.03 }, { t: 'Oslo', p: 0.02 } ]
  return (
    <svg viewBox="0 0 530 215" className="w-full h-auto">
      <BoxL x={14} y={40} w={130} h={36} label="teacher" sub="large, expensive" color={C.violet} />
      <Arr x1={144} y1={58} x2={186} y2={58} color={C.violet} />
      {soft.map((c, i) => <g key={i}>
        <rect x={196 + i * 46} y={130 - c.p * 90} width={26} height={c.p * 90} rx={3} fill={`${C.emerald}44`} stroke={C.emerald} />
        <text x={209 + i * 46} y={146} textAnchor="middle" fontSize={9.5} fill={C.dim} style={mono}>{c.t}</text>
        <text x={209 + i * 46} y={124 - c.p * 90} textAnchor="middle" fontSize={9} fill={C.faint} style={mono}>{c.p.toFixed(2)}</text>
      </g>)}
      <text x={287} y={166} textAnchor="middle" fontSize={9.5} fill={C.emerald}>soft targets — the near-misses carry structure</text>
      <Arr x1={390} y1={100} x2={430} y2={100} color={C.emerald} />
      <BoxL x={432} y={82} w={84} h={36} label="student" sub="small, cheap" color={C.sky} />
      <text x={14} y={104} fontSize={9.5} fill={C.faint} style={mono}>hard label: Paris=1, rest=0</text>
      <Cap cx={265} y={205} t="the teacher's full distribution teaches similarity the hard label throws away" />
    </svg>
  )
}

// rlhf-reward-models: comparisons become a scorer
function PreferencePair(): ReactElement {
  return (
    <svg viewBox="0 0 530 225" className="w-full h-auto">
      <BoxL x={215} y={12} w={100} label="prompt" />
      <Arr x1={240} y1={42} x2={185} y2={62} />
      <Arr x1={290} y1={42} x2={345} y2={62} />
      <BoxL x={95} y={66} w={130} label="response A" />
      <BoxL x={305} y={66} w={130} h={30} label="response B" color={C.emerald} />
      <text x={442} y={85} fontSize={11} fill={C.emerald}>✓ rater prefers B</text>
      <Arr x1={160} y1={96} x2={230} y2={136} />
      <Arr x1={370} y1={96} x2={300} y2={136} color={C.emerald} />
      <BoxL x={175} y={140} w={180} h={38} label="reward model" sub="learns score(B) > score(A)" color={C.violet} />
      <Cap cx={265} y={200} t="a comparison is cheaper than writing the ideal answer — and it trains a scorer" />
    </svg>
  )
}

// direct-preference-optimization: removing the moving parts
function DpoDirect(): ReactElement {
  return (
    <svg viewBox="0 0 530 210" className="w-full h-auto">
      <BoxL x={14} y={82} w={130} h={36} label="preference" sub="pairs (A ≺ B)" />
      <text x={168} y={40} fontSize={10} fill={C.amber} style={mono}>RLHF</text>
      <path d="M 144 92 L 200 62" fill="none" stroke={C.amber} />
      <BoxL x={202} y={44} w={120} label="reward model" color={C.amber} />
      <Arr x1={322} y1={59} x2={354} y2={59} color={C.amber} />
      <BoxL x={356} y={44} w={100} label="RL loop" color={C.amber} />
      <path d="M 456 59 L 490 59 L 490 96" fill="none" stroke={C.amber} />
      <path d="M 486 88 L 490 96 L 494 88" fill="none" stroke={C.amber} />
      <text x={168} y={175} fontSize={10} fill={C.emerald} style={mono}>DPO</text>
      <path d="M 144 108 L 200 142" fill="none" stroke={C.emerald} />
      <BoxL x={202} y={128} w={200} h={30} label="one direct loss" color={C.emerald} />
      <path d="M 402 143 L 490 143 L 490 122" fill="none" stroke={C.emerald} />
      <path d="M 486 130 L 490 122 L 494 130" fill="none" stroke={C.emerald} />
      <BoxL x={440} y={96} w={76} h={26} label="policy" color={C.violet} />
      <Cap cx={265} y={200} t="same data, same goal — DPO removes the reward model and the RL loop" />
    </svg>
  )
}

// calibration: reliability diagram
function ReliabilityDiagram(): ReactElement {
  return (
    <svg viewBox="0 0 530 245" className="w-full h-auto">
      <rect x={150} y={20} width={190} height={190} fill="none" stroke={C.edge} />
      <line x1={150} y1={210} x2={340} y2={20} stroke={C.faint} strokeDasharray="5 3" />
      <path d="M 150 210 C 220 190, 280 150, 340 80" fill="none" stroke={C.amber} strokeWidth={1.5} />
      <text x={352} y={30} fontSize={9.5} fill={C.faint}>perfectly calibrated</text>
      <text x={352} y={86} fontSize={9.5} fill={C.amber}>this model: overconfident</text>
      <text x={245} y={228} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>stated confidence →</text>
      <text x={140} y={115} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono} transform="rotate(-90 140 115)">actual accuracy →</text>
      <Cap cx={265} y={243} t="below the diagonal: the model claims more than it delivers" />
    </svg>
  )
}

// adaptation-capstone: which mechanism for which need
function AdaptToolkit(): ReactElement {
  const rows = [
    { need: 'shape stable behavior', mech: 'SFT', color: C.violet },
    { need: 'many cheap task variants', mech: 'LoRA', color: C.sky },
    { need: 'align with human preferences', mech: 'RLHF / DPO', color: C.emerald },
    { need: 'trustworthy confidence', mech: 'calibration', color: C.amber },
  ]
  return (
    <svg viewBox="0 0 530 215" className="w-full h-auto">
      {rows.map((r, i) => <g key={i}>
        <text x={250} y={38 + i * 40} textAnchor="end" fontSize={11} fill={C.dim}>{r.need}</text>
        <Arr x1={262} y1={34 + i * 40} x2={296} y2={34 + i * 40} color={r.color} />
        <BoxL x={300} y={20 + i * 40} w={140} h={28} label={r.mech} color={r.color} />
      </g>)}
      <Cap cx={265} y={202} t="diagnose the failure first — each mechanism buys a different fix" />
    </svg>
  )
}

// ---------------- Stage 6: systems ----------------

// scaling-laws: one budget, two knobs
function BudgetSplit(): ReactElement {
  return (
    <svg viewBox="0 0 530 215" className="w-full h-auto">
      <rect x={90} y={30} width={70} height={150} rx={6} fill={`${C.violet}18`} stroke={C.violet} />
      <text x={125} y={100} textAnchor="middle" fontSize={10.5} fill={C.violet} style={mono}>big N</text>
      <text x={125} y={116} textAnchor="middle" fontSize={9.5} fill={C.dim}>few tokens</text>
      <rect x={250} y={105} width={210} height={50} rx={6} fill={`${C.emerald}18`} stroke={C.emerald} />
      <text x={355} y={126} textAnchor="middle" fontSize={10.5} fill={C.emerald} style={mono}>smaller N</text>
      <text x={355} y={142} textAnchor="middle" fontSize={9.5} fill={C.dim}>many more tokens D</text>
      <text x={265} y={22} textAnchor="middle" fontSize={10.5} fill={C.dim} style={mono}>{'same area = same compute (C ≈ 6·N·D)'}</text>
      <Cap cx={265} y={202} t="a fixed budget buys parameters or experience — scaling laws say how to split it" />
    </svg>
  )
}

// kv-cache: reuse everything but the newest pair
function KvGrowth(): ReactElement {
  const col = (x: number, t: string, fresh: boolean) => (
    <g>
      <rect x={x} y={70} width={40} height={24} rx={4} fill={fresh ? `${C.emerald}22` : C.box} stroke={fresh ? C.emerald : C.edge} />
      <text x={x + 20} y={86} textAnchor="middle" fontSize={10} fill={fresh ? C.emerald : C.dim} style={mono}>K</text>
      <rect x={x} y={100} width={40} height={24} rx={4} fill={fresh ? `${C.emerald}22` : C.box} stroke={fresh ? C.emerald : C.edge} />
      <text x={x + 20} y={116} textAnchor="middle" fontSize={10} fill={fresh ? C.emerald : C.dim} style={mono}>V</text>
      <text x={x + 20} y={144} textAnchor="middle" fontSize={9.5} fill={fresh ? C.emerald : C.faint} style={mono}>{t}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      {['t1','t2','t3','t4','t5'].map((t, i) => col(40 + i * 52, t, false))}
      {col(40 + 5 * 52, 't6', true)}
      <text x={170} y={40} textAnchor="middle" fontSize={9.5} fill={C.faint}>cached — computed once, reused every step</text>
      <text x={320} y={168} fontSize={9.5} fill={C.emerald}>computed this step</text>
      <TokenBox x={410} y={84} w={70} label="q₆" accent={C.violet} />
      <text x={445} y={130} textAnchor="middle" fontSize={9} fill={C.dim}>new query reads all columns</text>
      <Cap cx={265} y={196} t="one new K,V pair per step — memory grows with context, compute per step stays flat" />
    </svg>
  )
}

// precision-quantization: bits per weight
function BitLayout(): ReactElement {
  const rows = [
    { bits: 32, name: 'fp32', gb: '28 GB', color: C.violet },
    { bits: 16, name: 'fp16', gb: '14 GB', color: C.sky },
    { bits: 8, name: 'int8', gb: '7 GB', color: C.emerald },
    { bits: 4, name: 'int4', gb: '3.5 GB', color: C.amber },
  ]
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      {rows.map((r, i) => <g key={i}>
        <text x={70} y={40 + i * 38} textAnchor="end" fontSize={11} fill={r.color} style={mono}>{r.name}</text>
        <rect x={82} y={26 + i * 38} width={r.bits * 8} height={20} rx={4} fill={`${r.color}22`} stroke={r.color} />
        <text x={90 + r.bits * 8} y={40 + i * 38} fontSize={10} fill={C.dim} style={mono}>{`${r.bits} bits — 7B model ≈ ${r.gb}`}</text>
      </g>)}
      <Cap cx={265} y={196} t="fewer bits per weight: same shapes, smaller memory, slightly blurrier values" />
    </svg>
  )
}

// grouped-query-attention: sharing K/V heads
function GqaSharing(): ReactElement {
  const panel = (ox: number, kv: number, name: string, sub: string) => {
    const qs = [0, 1, 2, 3]
    const kvw = 130 / kv
    return (
      <g>
        {qs.map(i => <circle key={i} cx={ox + 20 + i * 32} cy={54} r={9} fill={`${C.violet}22`} stroke={C.violet} />)}
        {qs.map(i => {
          const target = ox + 10 + Math.floor(i / (4 / kv)) * kvw + kvw / 2
          return <line key={i} x1={ox + 20 + i * 32} y1={63} x2={target} y2={92} stroke={C.edge} />
        })}
        {Array.from({ length: kv }, (_, i) => <rect key={i} x={ox + 12 + i * kvw} y={94} width={kvw - 6} height={22} rx={4} fill={`${C.sky}22`} stroke={C.sky} />)}
        <text x={ox + 75} y={134} textAnchor="middle" fontSize={10.5} fill={C.text} style={mono}>{name}</text>
        <text x={ox + 75} y={148} textAnchor="middle" fontSize={9} fill={C.dim}>{sub}</text>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 530 200" className="w-full h-auto">
      <text x={265} y={24} textAnchor="middle" fontSize={10.5} fill={C.dim}>query heads (violet) vs K/V heads (blue)</text>
      {panel(20, 4, 'MHA', 'every Q owns a K/V')}
      {panel(190, 2, 'GQA', 'groups share')}
      {panel(360, 1, 'MQA', 'all share one')}
      <Cap cx={265} y={188} t="queries stay diverse; keys and values are shared — the KV cache shrinks to match" />
    </svg>
  )
}

// mixture-of-experts: route to a few experts
function MoeRouter(): ReactElement {
  const active = [2, 5]
  return (
    <svg viewBox="0 0 530 215" className="w-full h-auto">
      <TokenBox x={40} y={30} w={70} label="token" accent={C.sky} />
      <Arr x1={110} y1={43} x2={160} y2={43} />
      <BoxL x={162} y={28} w={100} label="router" color={C.violet} />
      {Array.from({ length: 8 }, (_, i) => {
        const on = active.includes(i)
        return <g key={i} opacity={on ? 1 : 0.35}>
          <line x1={240} y1={58} x2={62 + i * 58} y2={112} stroke={on ? C.emerald : C.edge} strokeWidth={on ? 1.6 : 0.7} />
          <rect x={36 + i * 58} y={114} width={50} height={30} rx={6} fill={on ? `${C.emerald}22` : C.box} stroke={on ? C.emerald : C.edge} />
          <text x={61 + i * 58} y={133} textAnchor="middle" fontSize={9.5} fill={on ? C.emerald : C.dim} style={mono}>{`FFN ${i}`}</text>
        </g>
      })}
      <text x={265} y={170} textAnchor="middle" fontSize={10} fill={C.emerald} style={mono}>active: 2 of 8 experts per token</text>
      <Cap cx={265} y={200} t="store many experts, run a few — capacity without matching per-token compute" />
    </svg>
  )
}

// speculative-decoding: draft, then verify in parallel
function DraftVerify(): ReactElement {
  const toks = ['the', 'cat', 'sat', 'up']
  return (
    <svg viewBox="0 0 530 215" className="w-full h-auto">
      <BoxL x={14} y={24} w={140} h={34} label="draft model" sub="small, fast, proposes" color={C.sky} />
      {toks.map((t, i) => <TokenBox key={i} x={190 + i * 70} y={28} w={60} label={t} accent={C.sky} />)}
      <BoxL x={14} y={110} w={140} h={34} label="target model" sub="one parallel check pass" color={C.violet} />
      {toks.map((_, i) => {
        const ok = i < 3
        return <g key={i}>
          <Arr x1={220 + i * 70} y1={58} x2={220 + i * 70} y2={102} color={ok ? C.emerald : C.amber} dash={!ok} />
          <text x={220 + i * 70} y={124} textAnchor="middle" fontSize={13} fill={ok ? C.emerald : C.amber}>{ok ? '✓' : '✗'}</text>
        </g>
      })}
      <text x={430} y={148} textAnchor="middle" fontSize={9.5} fill={C.amber}>reject — resample here</text>
      <text x={290} y={148} textAnchor="middle" fontSize={9.5} fill={C.emerald}>accepted: 3 tokens for one big pass</text>
      <Cap cx={265} y={200} t="the accepted prefix is exactly what the target would have produced — speed, no drift" />
    </svg>
  )
}

// systems-capstone: every optimization names its price
function ServingTradeoffs(): ReactElement {
  const rows = [
    { t: 'quantization', give: 'numeric precision', get: 'memory', color: C.amber },
    { t: 'GQA', give: 'K/V head diversity', get: 'cache size', color: C.sky },
    { t: 'MoE', give: 'memory (all experts)', get: 'per-token compute', color: C.violet },
    { t: 'speculative', give: 'extra draft compute', get: 'latency', color: C.emerald },
  ]
  return (
    <svg viewBox="0 0 530 225" className="w-full h-auto">
      <text x={150} y={26} textAnchor="middle" fontSize={10} fill={C.faint} style={mono}>technique</text>
      <text x={300} y={26} textAnchor="middle" fontSize={10} fill={C.faint} style={mono}>spends</text>
      <text x={445} y={26} textAnchor="middle" fontSize={10} fill={C.faint} style={mono}>buys</text>
      {rows.map((r, i) => <g key={i}>
        <BoxL x={80} y={38 + i * 40} w={140} h={28} label={r.t} color={r.color} />
        <text x={300} y={56 + i * 40} textAnchor="middle" fontSize={10.5} fill={C.dim}>{r.give}</text>
        <Arr x1={365} y1={52 + i * 40} x2={395} y2={52 + i * 40} color={r.color} />
        <text x={445} y={56 + i * 40} textAnchor="middle" fontSize={10.5} fill={r.color}>{r.get}</text>
      </g>)}
      <Cap cx={265} y={215} t="no free lunch — every serving trick pays with one resource to buy another" />
    </svg>
  )
}

// ---------------- Stage 7: applications ----------------

// semantic-embeddings: text becomes a point
function TextToPoint(): ReactElement {
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      <BoxL x={14} y={20} w={150} h={26} label="reset my password" />
      <BoxL x={14} y={56} w={150} h={26} label="cannot log in" />
      <BoxL x={14} y={92} w={150} h={26} label="pizza in Naples" />
      <Arr x1={164} y1={70} x2={214} y2={70} />
      <BoxL x={216} y={54} w={120} h={32} label="embedding" sub="one vector per text" color={C.violet} />
      <Arr x1={336} y1={70} x2={378} y2={70} />
      <rect x={382} y={16} width={134} height={134} rx={8} fill="none" stroke={C.edge} />
      <circle cx={424} cy={58} r={5} fill={C.emerald} />
      <circle cx={444} cy={74} r={5} fill={C.emerald} />
      <circle cx={488} cy={126} r={5} fill={C.amber} />
      <circle cx={434} cy={66} r={26} fill="none" stroke={C.emerald} strokeDasharray="3 3" />
      <text x={434} y={165} textAnchor="middle" fontSize={9} fill={C.emerald}>close in meaning</text>
      <Cap cx={265} y={196} t="distance in vector space approximates similarity of meaning, not of wording" />
    </svg>
  )
}

// retrieval-basics: evidence at answer time
function RagPipeline(): ReactElement {
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      <BoxL x={14} y={24} w={100} label="question" />
      <Arr x1={114} y1={39} x2={148} y2={39} />
      <BoxL x={150} y={24} w={130} label="embed + search" sub="vector index" color={C.violet} />
      <Arr x1={280} y1={39} x2={314} y2={39} />
      <BoxL x={316} y={24} w={130} label="top-k passages" sub="ranked evidence" color={C.sky} />
      <path d="M 381 54 L 381 86 L 250 86 L 250 106" fill="none" stroke={C.edge} />
      <path d="M 246 98 L 250 106 L 254 98" fill="none" stroke={C.edge} />
      <BoxL x={120} y={108} w={260} h={30} label="prompt = question + passages" />
      <Arr x1={380} y1={123} x2={412} y2={123} />
      <BoxL x={414} y={108} w={72} h={30} label="model" color={C.violet} />
      <path d="M 450 138 L 450 164 L 330 164" fill="none" stroke={C.emerald} />
      <text x={230} y={168} textAnchor="middle" fontSize={10.5} fill={C.emerald} style={mono}>answer, with citations</text>
      <Cap cx={265} y={196} t="the model reads evidence at answer time instead of recalling from frozen weights" />
    </svg>
  )
}

// retrieval-quality: complementary failures
function LexicalVsSemantic(): ReactElement {
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      <text x={265} y={26} textAnchor="middle" fontSize={10} fill={C.faint} style={mono}>query case</text>
      <text x={280} y={58} textAnchor="middle" fontSize={10.5} fill={C.dim}>{'“automobile” vs “car”'}</text>
      <text x={280} y={98} textAnchor="middle" fontSize={10.5} fill={C.dim}>{'exact id “XR-2481”'}</text>
      <text x={415} y={40} textAnchor="middle" fontSize={10.5} fill={C.sky} style={mono}>lexical</text>
      <text x={490} y={40} textAnchor="middle" fontSize={10.5} fill={C.violet} style={mono}>semantic</text>
      <text x={415} y={58} textAnchor="middle" fontSize={13} fill={C.amber}>✗</text>
      <text x={490} y={58} textAnchor="middle" fontSize={13} fill={C.emerald}>✓</text>
      <text x={415} y={98} textAnchor="middle" fontSize={13} fill={C.emerald}>✓</text>
      <text x={490} y={98} textAnchor="middle" fontSize={13} fill={C.amber}>✗</text>
      <text x={140} y={58} textAnchor="end" fontSize={9.5} fill={C.faint}>no shared words</text>
      <text x={140} y={98} textAnchor="end" fontSize={9.5} fill={C.faint}>meaning ≈, token ≠</text>
      <line x1={40} y1={72} x2={510} y2={72} stroke={C.edge} strokeDasharray="2 3" />
      <text x={265} y={140} textAnchor="middle" fontSize={10} fill={C.dim}>BM25 scores shared words; embeddings score meaning</text>
      <Cap cx={265} y={170} t="each fails where the other is strong — production retrieval combines both" />
    </svg>
  )
}

// tool-use: request/execute loop
function ToolLoop(): ReactElement {
  return (
    <svg viewBox="0 0 530 225" className="w-full h-auto">
      <BoxL x={40} y={80} w={110} h={34} label="model" sub="writes a request" color={C.violet} />
      <Arr x1={150} y1={84} x2={230} y2={52} />
      <text x={190} y={48} textAnchor="middle" fontSize={9.5} fill={C.dim} style={mono}>{'call: search(“…”)'}</text>
      <BoxL x={232} y={38} w={150} h={34} label="program" sub="the only part with hands" color={C.emerald} />
      <Arr x1={382} y1={55} x2={452} y2={55} color={C.emerald} />
      <BoxL x={410} y={120} w={106} h={34} label="observation" sub="result text" color={C.sky} />
      <path d="M 466 72 L 466 116" fill="none" stroke={C.emerald} />
      <path d="M 462 108 L 466 116 L 470 108" fill="none" stroke={C.emerald} />
      <Arr x1={408} y1={140} x2={152} y2={104} color={C.sky} />
      <text x={280} y={140} textAnchor="middle" fontSize={9.5} fill={C.dim}>appended to context; the model continues</text>
      <Arr x1={95} y1={114} x2={95} y2={160} />
      <text x={95} y={178} textAnchor="middle" fontSize={10.5} fill={C.text} style={mono}>final answer</text>
      <Cap cx={265} y={215} t="the model proposes; the program disposes — execution never happens inside the model" />
    </svg>
  )
}

// agent-reliability: errors compound
function ErrorCompounding(): ReactElement {
  const pts = Array.from({ length: 21 }, (_, n) => {
    const v = Math.pow(0.95, n)
    return `${60 + n * 20.5},${40 + (1 - v) * 150}`
  }).join(' ')
  return (
    <svg viewBox="0 0 530 235" className="w-full h-auto">
      <line x1={50} y1={200} x2={490} y2={200} stroke={C.edge} />
      <line x1={50} y1={200} x2={50} y2={20} stroke={C.edge} />
      <text x={480} y={216} textAnchor="end" fontSize={10.5} fill={C.dim} style={mono}>steps in the loop</text>
      <text x={8} y={30} fontSize={10.5} fill={C.dim} style={mono}>P(all good)</text>
      <polyline points={pts} fill="none" stroke={C.amber} strokeWidth={1.5} />
      <line x1={50} y1={115} x2={490} y2={115} stroke={C.faint} strokeDasharray="4 3" />
      <text x={484} y={110} textAnchor="end" fontSize={9.5} fill={C.faint}>50%</text>
      <text x={92} y={38} fontSize={9.5} fill={C.amber} style={mono}>0.95 per step</text>
      <text x={470} y={150} textAnchor="end" fontSize={9.5} fill={C.amber} style={mono}>0.36 after 20 steps</text>
      <Cap cx={265} y={230} t="per-step reliability multiplies — long loops need limits, checks, and early exits" />
    </svg>
  )
}

// token-economics: what a call costs
function TokenCosts(): ReactElement {
  return (
    <svg viewBox="0 0 530 195" className="w-full h-auto">
      <rect x={60} y={40} width={330} height={26} rx={5} fill={`${C.sky}22`} stroke={C.sky} />
      <text x={225} y={57} textAnchor="middle" fontSize={10} fill={C.sky} style={mono}>input: the whole context, resent every call</text>
      <rect x={394} y={40} width={80} height={26} rx={5} fill={`${C.violet}22`} stroke={C.violet} />
      <text x={434} y={57} textAnchor="middle" fontSize={10} fill={C.violet} style={mono}>output</text>
      <text x={225} y={86} textAnchor="middle" fontSize={9.5} fill={C.dim}>cheap per token, but there are many</text>
      <text x={434} y={86} textAnchor="middle" fontSize={9.5} fill={C.dim}>3-5× the price</text>
      <text x={265} y={120} textAnchor="middle" fontSize={11} fill={C.text} style={mono}>cost = input·p_in + output·p_out</text>
      <Cap cx={265} y={152} t="growing history makes every later call dearer — context is the hidden multiplier" />
    </svg>
  )
}

// ---------------- Frontier ----------------

// reading-model-cards: card vs deployment question
function CardAnatomy(): ReactElement {
  const rows = [
    { k: 'params: 47B total / 13B active', q: 'fits in memory? → total', color: C.violet },
    { k: 'context: 128K tokens', q: 'KV cache at full length?', color: C.sky },
    { k: 'license: research-only', q: 'may I ship it?', color: C.amber },
    { k: 'MMLU 78 (5-shot)', q: 'same shots as my use?', color: C.emerald },
  ]
  return (
    <svg viewBox="0 0 530 215" className="w-full h-auto">
      <rect x={24} y={14} width={250} height={172} rx={10} fill={C.box} stroke={C.edge} />
      <text x={149} y={34} textAnchor="middle" fontSize={10.5} fill={C.text} style={mono}>model card</text>
      {rows.map((r, i) => <g key={i}>
        <text x={40} y={62 + i * 32} fontSize={10} fill={r.color} style={mono}>{r.k}</text>
        <Arr x1={280} y1={58 + i * 32} x2={314} y2={58 + i * 32} color={r.color} />
        <text x={320} y={62 + i * 32} fontSize={10} fill={C.dim}>{r.q}</text>
      </g>)}
      <Cap cx={265} y={207} t="read the card against your deployment question, not the headline number" />
    </svg>
  )
}

// long-context-architectures: the bill for perfect access
function AttentionCost(): ReactElement {
  return (
    <svg viewBox="0 0 530 225" className="w-full h-auto">
      <line x1={50} y1={190} x2={490} y2={190} stroke={C.edge} />
      <line x1={50} y1={190} x2={50} y2={20} stroke={C.edge} />
      <text x={480} y={206} textAnchor="end" fontSize={10.5} fill={C.dim} style={mono}>context length</text>
      <text x={8} y={30} fontSize={10.5} fill={C.dim} style={mono}>memory + work</text>
      <path d="M 60 185 Q 300 150 470 40" fill="none" stroke={C.amber} strokeWidth={1.5} />
      <path d="M 60 185 L 220 130 L 470 122" fill="none" stroke={C.emerald} strokeWidth={1.5} />
      <line x1={220} y1={130} x2={220} y2={190} stroke={C.faint} strokeDasharray="4 3" />
      <text x={226} y={184} fontSize={9} fill={C.faint}>window size w</text>
      <text x={410} y={52} fontSize={9.5} fill={C.amber} style={mono}>full attention</text>
      <text x={400} y={110} fontSize={9.5} fill={C.emerald} style={mono}>sliding window</text>
      <Cap cx={265} y={220} t="exact access to everything grows without bound; approximations cap the bill" />
    </svg>
  )
}

// parallel-decoding: refine unknowns together
function ParallelRefine(): ReactElement {
  const sweep = (y: number, known: number[], label: string) => (
    <g>
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={130 + i * 40} y={y} width={34} height={22} rx={4}
        fill={known.includes(i) ? `${C.emerald}22` : C.box} stroke={known.includes(i) ? C.emerald : C.edge} />)}
      {Array.from({ length: 8 }, (_, i) => <text key={i} x={147 + i * 40} y={y + 15} textAnchor="middle" fontSize={10} fill={known.includes(i) ? C.emerald : C.faint} style={mono}>{known.includes(i) ? 'tok' : '?'}</text>)}
      <text x={120} y={y + 15} textAnchor="end" fontSize={9.5} fill={C.dim} style={mono}>{label}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 530 200" className="w-full h-auto">
      {sweep(20, [2, 5], 'sweep 1')}
      {sweep(58, [0, 2, 3, 5, 7], 'sweep 2')}
      {sweep(96, [0, 1, 2, 3, 4, 5, 6, 7], 'sweep 3')}
      <text x={265} y={150} textAnchor="middle" fontSize={10} fill={C.dim}>every unknown position is refined at once, in a few rounds</text>
      <Cap cx={265} y={188} t="autoregressive: N tokens = N dependent steps; here: a few parallel sweeps" />
    </svg>
  )
}

// ---------------- Papers ----------------

// paper-aiayn-problem: the sequential bottleneck
function SequentialBottleneck(): ReactElement {
  return (
    <svg viewBox="0 0 530 215" className="w-full h-auto">
      {[0,1,2,3,4,5].map(i => <g key={i}>
        <rect x={70 + i * 66} y={26} width={44} height={24} rx={5} fill={C.box} stroke={C.edge} />
        <text x={92 + i * 66} y={42} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>{`h${i + 1}`}</text>
        {i < 5 ? <Arr x1={114 + i * 66} y1={38} x2={134 + i * 66} y2={38} color={C.amber} /> : null}
      </g>)}
      <text x={265} y={72} textAnchor="middle" fontSize={9.5} fill={C.amber}>RNN: each state waits for the previous one — training cannot parallelize</text>
      {[0,1,2,3,4,5].map(i => <TokenBox key={i} x={70 + i * 66} y={130} w={44} label={`t${i + 1}`} accent={i === 5 ? C.violet : undefined} />)}
      {[0,1,2,3,4].map(i => {
        const x1 = 92 + 5 * 66, x2 = 92 + i * 66
        return <path key={i} d={`M ${x1} 128 Q ${(x1 + x2) / 2} ${94 - Math.abs(x1 - x2) * 0.08} ${x2} 128`} fill="none" stroke={C.emerald} strokeWidth={0.9} opacity={0.8} />
      })}
      <text x={265} y={182} textAnchor="middle" fontSize={9.5} fill={C.emerald}>attention: every pair connected in one step — the whole sequence trains in parallel</text>
      <Cap cx={265} y={206} t="the 2017 bet: routing by attention beats carrying state through time" />
    </svg>
  )
}

// paper-aiayn-architecture: encoder, decoder, cross-attention
function EncoderDecoder(): ReactElement {
  return (
    <svg viewBox="0 0 530 235" className="w-full h-auto">
      <rect x={80} y={40} width={150} height={120} rx={10} fill={`${C.sky}10`} stroke={C.sky} />
      <text x={155} y={64} textAnchor="middle" fontSize={11} fill={C.sky} style={mono}>encoder</text>
      <text x={155} y={82} textAnchor="middle" fontSize={9} fill={C.dim}>bidirectional self-attention</text>
      <text x={155} y={96} textAnchor="middle" fontSize={9} fill={C.dim}>reads the whole input</text>
      <rect x={300} y={40} width={150} height={120} rx={10} fill={`${C.violet}10`} stroke={C.violet} />
      <text x={375} y={64} textAnchor="middle" fontSize={11} fill={C.violet} style={mono}>decoder</text>
      <text x={375} y={82} textAnchor="middle" fontSize={9} fill={C.dim}>causal self-attention</text>
      <text x={375} y={96} textAnchor="middle" fontSize={9} fill={C.dim}>+ cross-attention</text>
      <Arr x1={230} y1={120} x2={296} y2={120} color={C.emerald} />
      <text x={263} y={110} textAnchor="middle" fontSize={9} fill={C.emerald} style={mono}>cross-attention</text>
      <text x={155} y={182} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>English in</text>
      <Arr x1={155} y1={186} x2={155} y2={164} />
      <text x={375} y={182} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>French so far</text>
      <Arr x1={375} y1={186} x2={375} y2={164} />
      <Arr x1={375} y1={36} x2={375} y2={18} color={C.emerald} />
      <text x={410} y={16} fontSize={9.5} fill={C.emerald} style={mono}>next French token</text>
      <Cap cx={265} y={228} t="the decoder queries the encoder's finished reading — translation needs both halves" />
    </svg>
  )
}

// paper-aiayn-legacy: the family split
function StackSplit(): ReactElement {
  return (
    <svg viewBox="0 0 530 215" className="w-full h-auto">
      <BoxL x={165} y={16} w={200} h={34} label="2017: encoder-decoder" sub="built for translation" />
      <Arr x1={215} y1={50} x2={140} y2={92} color={C.sky} />
      <Arr x1={315} y1={50} x2={390} y2={92} color={C.violet} />
      <BoxL x={40} y={96} w={200} h={38} label="BERT: encoder only" sub="understand — classify, extract" color={C.sky} />
      <BoxL x={290} y={96} w={200} h={38} label="GPT: decoder only" sub="generate — continue text" color={C.violet} />
      <text x={140} y={158} textAnchor="middle" fontSize={9.5} fill={C.dim}>2018 — masked-token pretraining</text>
      <text x={390} y={158} textAnchor="middle" fontSize={9.5} fill={C.dim}>2018 — next-token pretraining</text>
      <Cap cx={265} y={200} t="the halves went further than the whole — one stack per job became the default" />
    </svg>
  )
}

// paper-bert-objective: masked language modeling
function MlmMasking(): ReactElement {
  const toks = ['The', '[MASK]', 'sat', 'on', 'the', '[MASK]']
  return (
    <svg viewBox="0 0 530 195" className="w-full h-auto">
      {toks.map((t, i) => <TokenBox key={i} x={50 + i * 74} y={92} w={66} label={t} accent={t === '[MASK]' ? C.amber : undefined} />)}
      {[[0, 1], [2, 1], [3, 1], [4, 5], [2, 5]].map(([f, m], i) => {
        const x1 = 83 + f * 74, x2 = 83 + m * 74
        return <path key={i} d={`M ${x1} 90 Q ${(x1 + x2) / 2} ${58 - Math.abs(x1 - x2) * 0.05} ${x2} 90`} fill="none" stroke={C.sky} strokeWidth={0.9} opacity={0.85} />
      })}
      <text x={157} y={148} textAnchor="middle" fontSize={10} fill={C.emerald} style={mono}>→ cat</text>
      <text x={453} y={148} textAnchor="middle" fontSize={10} fill={C.emerald} style={mono}>→ mat</text>
      <text x={265} y={26} textAnchor="middle" fontSize={9.5} fill={C.dim}>context flows from BOTH sides into each mask</text>
      <Cap cx={265} y={182} t="bidirectional by design — great for understanding, unusable for left-to-right generation" />
    </svg>
  )
}

// paper-bert-finetuning: pretrain once, adapt per task
function PretrainFinetune(): ReactElement {
  const heads = [ { t: 'sentiment head', y: 30 }, { t: 'QA head', y: 86 }, { t: 'NER head', y: 142 } ]
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      <BoxL x={30} y={72} w={190} h={44} label="pretrained encoder" sub="trained once, unlabeled text" color={C.sky} />
      {heads.map((h, i) => <g key={i}>
        <Arr x1={220} y1={94} x2={320} y2={h.y + 15} color={C.emerald} />
        <BoxL x={324} y={h.y} w={160} h={30} label={h.t} color={C.emerald} />
      </g>)}
      <text x={404} y={190} textAnchor="middle" fontSize={9.5} fill={C.dim}>small head + a few epochs each</text>
      <Cap cx={200} y={190} t="pretrain once, adapt everywhere" />
    </svg>
  )
}

// paper-gpt3-scale: two orders of magnitude
function ScaleJump(): ReactElement {
  const bars = [
    { name: 'GPT (2018)', v: '117M', h: 28, x: 100 },
    { name: 'GPT-2 (2019)', v: '1.5B', h: 64, x: 240, note: '×13' },
    { name: 'GPT-3 (2020)', v: '175B', h: 150, x: 380, note: '×117' },
  ]
  return (
    <svg viewBox="0 0 530 235" className="w-full h-auto">
      <line x1={60} y1={190} x2={490} y2={190} stroke={C.edge} />
      {bars.map((b, i) => <g key={i}>
        <rect x={b.x} y={190 - b.h} width={60} height={b.h} rx={4} fill={`${C.violet}${30 + i * 20}`} stroke={C.violet} />
        <text x={b.x + 30} y={182 - b.h} textAnchor="middle" fontSize={10.5} fill={C.violet} style={mono}>{b.v}</text>
        <text x={b.x + 30} y={206} textAnchor="middle" fontSize={9.5} fill={C.dim} style={mono}>{b.name}</text>
        {b.note ? <text x={b.x + 30} y={162 - b.h} textAnchor="middle" fontSize={9} fill={C.faint} style={mono}>{b.note}</text> : null}
      </g>)}
      <text x={70} y={40} fontSize={9} fill={C.faint} style={mono}>log scale</text>
      <Cap cx={265} y={228} t="same architecture family — the variable under test was scale itself" />
    </svg>
  )
}

// paper-gpt3-incontext: zero / one / few shot
function ShotTaxonomy(): ReactElement {
  const card = (x: number, title: string, segs: string[], color: string) => (
    <g>
      <rect x={x} y={36} width={140} height={110} rx={8} fill="none" stroke={C.edge} />
      <text x={x + 70} y={28} textAnchor="middle" fontSize={10} fill={color} style={mono}>{title}</text>
      {segs.map((s, i) => <g key={i}>
        <rect x={x + 10} y={46 + i * 24} width={120} height={18} rx={4} fill={s === 'Q' ? `${C.emerald}22` : s === 'task' ? `${C.violet}22` : `${C.sky}22`} stroke={s === 'Q' ? C.emerald : s === 'task' ? C.violet : C.sky} />
        <text x={x + 70} y={59 + i * 24} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>{s === 'Q' ? 'your question' : s === 'task' ? 'task description' : s}</text>
      </g>)}
    </g>
  )
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      {card(20, 'zero-shot', ['task', 'Q'], C.violet)}
      {card(195, 'one-shot', ['task', 'example 1', 'Q'], C.sky)}
      {card(370, 'few-shot', ['task', 'example 1', 'example 2', 'Q'], C.emerald)}
      <Cap cx={265} y={172} t="no gradient updates in any of them — the examples live only in the context window" />
      <Cap cx={265} y={190} t="more shots = steeper in-context learning curve, especially for big models" />
    </svg>
  )
}

// paper-instruct-gap: objective vs intent
function ObjectiveGap(): ReactElement {
  return (
    <svg viewBox="0 0 530 205" className="w-full h-auto">
      <BoxL x={30} y={30} w={200} h={40} label="training objective" sub="predict the next corpus token" color={C.violet} />
      <BoxL x={300} y={30} w={200} h={40} label="user need" sub="follow my instruction, help me" color={C.emerald} />
      <line x1={230} y1={50} x2={300} y2={50} stroke={C.amber} strokeDasharray="5 3" />
      <text x={265} y={40} textAnchor="middle" fontSize={9.5} fill={C.amber} style={mono}>the gap</text>
      <text x={60} y={106} fontSize={10} fill={C.dim} style={mono}>prompt: “Explain the moon landing to a 6-year-old”</text>
      <text x={60} y={130} fontSize={10} fill={C.amber} style={mono}>base model: “Explain gravity to a 6-year-old. Explain…”</text>
      <text x={60} y={150} fontSize={9} fill={C.faint}>(it continues the pattern — on the web, lists of prompts follow prompts)</text>
      <Cap cx={265} y={192} t="a perfect next-token predictor can still be a poor assistant — that is a data property" />
    </svg>
  )
}

// paper-instruct-rlhf: three stages, three signals
function RlhfStages(): ReactElement {
  return (
    <svg viewBox="0 0 530 190" className="w-full h-auto">
      <BoxL x={20} y={40} w={150} h={40} label="1 · SFT" sub="humans write ideal answers" color={C.sky} />
      <Arr x1={170} y1={60} x2={198} y2={60} />
      <BoxL x={200} y={40} w={150} h={40} label="2 · reward model" sub="humans rank outputs" color={C.violet} />
      <Arr x1={350} y1={60} x2={378} y2={60} />
      <BoxL x={380} y={40} w={130} h={40} label="3 · PPO" sub="optimize vs the RM" color={C.emerald} />
      <text x={95} y={104} textAnchor="middle" fontSize={9.5} fill={C.faint} style={mono}>demonstrations</text>
      <text x={275} y={104} textAnchor="middle" fontSize={9.5} fill={C.faint} style={mono}>comparisons</text>
      <text x={445} y={104} textAnchor="middle" fontSize={9.5} fill={C.faint} style={mono}>scalar reward</text>
      <Cap cx={265} y={140} t="three stages, three different kinds of human signal — each cheaper than the last" />
      <Cap cx={265} y={158} t="1.3B aligned beat 175B raw in human preference — alignment is not capability" />
    </svg>
  )
}

// paper-scaling-powerlaws: straight lines on log-log
function PowerlawLines(): ReactElement {
  return (
    <svg viewBox="0 0 530 225" className="w-full h-auto">
      <line x1={60} y1={190} x2={490} y2={190} stroke={C.edge} />
      <line x1={60} y1={190} x2={60} y2={20} stroke={C.edge} />
      <text x={480} y={206} textAnchor="end" fontSize={10.5} fill={C.dim} style={mono}>scale (log)</text>
      <text x={8} y={30} fontSize={10.5} fill={C.dim} style={mono}>loss (log)</text>
      <line x1={80} y1={60} x2={470} y2={140} stroke={C.violet} strokeWidth={1.5} />
      <line x1={80} y1={90} x2={470} y2={162} stroke={C.sky} strokeWidth={1.5} />
      <line x1={80} y1={120} x2={470} y2={180} stroke={C.emerald} strokeWidth={1.5} />
      <text x={478} y={140} fontSize={9.5} fill={C.violet} style={mono}>N</text>
      <text x={478} y={164} fontSize={9.5} fill={C.sky} style={mono}>D</text>
      <text x={478} y={184} fontSize={9.5} fill={C.emerald} style={mono}>C</text>
      <text x={180} y={50} fontSize={9.5} fill={C.faint}>hundreds of runs, one ruler</text>
      <Cap cx={265} y={220} t="straight lines on log-log axes — performance became predictable before training" />
    </svg>
  )
}

// paper-scaling-chinchilla: same budget, opposite split
function ChinchillaShift(): ReactElement {
  return (
    <svg viewBox="0 0 530 215" className="w-full h-auto">
      <rect x={80} y={30} width={64} height={140} rx={6} fill={`${C.amber}18`} stroke={C.amber} />
      <text x={112} y={90} textAnchor="middle" fontSize={10} fill={C.amber} style={mono}>Gopher</text>
      <text x={112} y={106} textAnchor="middle" fontSize={9} fill={C.dim}>280B params</text>
      <text x={112} y={120} textAnchor="middle" fontSize={9} fill={C.dim}>300B tokens</text>
      <rect x={240} y={100} width={250} height={70} rx={6} fill={`${C.emerald}18`} stroke={C.emerald} />
      <text x={365} y={128} textAnchor="middle" fontSize={10} fill={C.emerald} style={mono}>Chinchilla</text>
      <text x={365} y={144} textAnchor="middle" fontSize={9} fill={C.dim}>70B params · 1.4T tokens</text>
      <text x={265} y={22} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>equal areas = equal training compute</text>
      <text x={365} y={188} textAnchor="middle" fontSize={9.5} fill={C.emerald}>wins on the same budget — and is 4× cheaper to serve</text>
      <Cap cx={265} y={208} t="a 4× smaller model trained ~4.7× longer — most 2020-era models were undertrained" />
    </svg>
  )
}

// paper-lora-math: the sliver vs the matrix
function LoraArith(): ReactElement {
  return (
    <svg viewBox="0 0 530 195" className="w-full h-auto">
      <rect x={60} y={36} width={420} height={26} rx={5} fill={`${C.violet}22`} stroke={C.violet} />
      <text x={270} y={53} textAnchor="middle" fontSize={10} fill={C.violet} style={mono}>full update: 4096 × 4096 = 16,777,216 entries</text>
      <rect x={60} y={86} width={5} height={26} rx={2} fill={C.emerald} stroke={C.emerald} />
      <text x={78} y={103} fontSize={10} fill={C.emerald} style={mono}>LoRA r=8: 2 × (4096 × 8) = 65,536 — 0.39%</text>
      <text x={60} y={148} fontSize={9.5} fill={C.dim}>per task you store and ship the sliver, not the matrix</text>
      <Cap cx={265} y={182} t="the low-rank hypothesis, in one ratio — and swap-at-serve-time falls out for free" />
    </svg>
  )
}

// paper-cot-emergence: what the examples demonstrate
function CotPrompt(): ReactElement {
  const card = (x: number, title: string, color: string, mid: string, midColor: string) => (
    <g>
      <rect x={x} y={36} width={200} height={120} rx={8} fill="none" stroke={C.edge} />
      <text x={x + 100} y={28} textAnchor="middle" fontSize={10} fill={color} style={mono}>{title}</text>
      <rect x={x + 12} y={48} width={176} height={20} rx={4} fill={`${C.sky}22`} stroke={C.sky} />
      <text x={x + 100} y={62} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>Q: Roger has 5 balls…</text>
      <rect x={x + 12} y={76} width={176} height={20} rx={4} fill={`${midColor}22`} stroke={midColor} />
      <text x={x + 100} y={90} textAnchor="middle" fontSize={9} fill={midColor} style={mono}>{mid}</text>
      <rect x={x + 12} y={104} width={176} height={20} rx={4} fill={`${C.emerald}22`} stroke={C.emerald} />
      <text x={x + 100} y={118} textAnchor="middle" fontSize={9} fill={C.dim} style={mono}>A: 11</text>
    </g>
  )
  return (
    <svg viewBox="0 0 530 215" className="w-full h-auto">
      {card(40, 'standard few-shot', C.dim, '(answer directly)', C.faint)}
      {card(290, 'chain-of-thought', C.emerald, '5 + 2×3 = 11 — steps shown', C.amber)}
      <text x={265} y={178} textAnchor="middle" fontSize={10} fill={C.dim} style={mono}>GSM8K, PaLM 540B: 18% → 57%</text>
      <Cap cx={265} y={202} t="same model, same question — the only change is what the examples demonstrate" />
    </svg>
  )
}

export const FIGURES_EXT: Record<string, () => ReactElement> = {
  'tensor-ranks': TensorRanks,
  'axes-directions': AxesDirections,
  'matmul-rowcol': MatmulRowCol,
  'dot-agreement': DotAgreement,
  'token-pipeline': TokenPipeline,
  'subword-tradeoff': SubwordTradeoff,
  'embedding-row': EmbeddingRow,
  'linear-questions': LinearQuestions,
  'softmax-shares': SoftmaxShares,
  'next-token-dist': NextTokenDist,
  'answer-key': AnswerKey,
  'data-funnel': DataFunnel,
  'loss-slope': LossSlope,
  'backprop-chain': BackpropChain,
  'train-cycle': TrainCycle,
  'train-val-curves': TrainValCurves,
  'decode-tree': DecodeTree,
  'dist-reshape': DistReshape,
  'prompt-anatomy': PromptAnatomy,
  'sft-shift': SftShift,
  'lora-bypass': LoraBypass,
  'teacher-student': TeacherStudent,
  'preference-pair': PreferencePair,
  'dpo-direct': DpoDirect,
  'reliability-diagram': ReliabilityDiagram,
  'adapt-toolkit': AdaptToolkit,
  'budget-split': BudgetSplit,
  'kv-growth': KvGrowth,
  'bit-layout': BitLayout,
  'gqa-sharing': GqaSharing,
  'moe-router': MoeRouter,
  'draft-verify': DraftVerify,
  'serving-tradeoffs': ServingTradeoffs,
  'text-to-point': TextToPoint,
  'rag-pipeline': RagPipeline,
  'lexical-vs-semantic': LexicalVsSemantic,
  'tool-loop': ToolLoop,
  'error-compounding': ErrorCompounding,
  'token-costs': TokenCosts,
  'card-anatomy': CardAnatomy,
  'attention-cost': AttentionCost,
  'parallel-refine': ParallelRefine,
  'sequential-bottleneck': SequentialBottleneck,
  'encoder-decoder': EncoderDecoder,
  'stack-split': StackSplit,
  'mlm-masking': MlmMasking,
  'pretrain-finetune': PretrainFinetune,
  'scale-jump': ScaleJump,
  'shot-taxonomy': ShotTaxonomy,
  'objective-gap': ObjectiveGap,
  'rlhf-stages': RlhfStages,
  'powerlaw-lines': PowerlawLines,
  'chinchilla-shift': ChinchillaShift,
  'lora-arith': LoraArith,
  'cot-prompt': CotPrompt,
}
