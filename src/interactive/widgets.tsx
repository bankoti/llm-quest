// Manipulatives for the interactive track. Each receives onDone and calls it
// when the learner has explored enough to continue. Purely visual: no Pyodide.
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { WidgetProps } from './types'

// ── shared atoms ─────────────────────────────────────────────────────────────

export function Cell({ v, hot, dim, wide }: { v: string | number; hot?: boolean; dim?: boolean; wide?: boolean }) {
  return (
    <div className={`${wide ? 'px-2 min-w-9' : 'w-9'} h-9 flex items-center justify-center rounded-md font-mono text-xs border transition-all duration-300
      ${hot ? 'bg-violet-600 border-violet-400 text-white scale-105' : dim ? 'bg-gray-900 border-gray-800 text-gray-700' : 'bg-gray-800 border-gray-700 text-gray-200'}`}>
      {v}
    </div>
  )
}

export function Shape({ s }: { s: string }) {
  return <span className="font-mono text-emerald-400">{s}</span>
}

export function ContinueBtn({ onClick, label = 'Continue' }: { onClick: () => void; label?: string }) {
  return (
    <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="mt-6 px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/40">
      {label}
    </motion.button>
  )
}

const chipCls = (on: boolean) =>
  `px-3 py-2 rounded-lg font-mono text-xs border transition-colors ${on
    ? 'bg-violet-600 border-violet-400 text-white'
    : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-violet-500'}`

// ── L1: axis collapse on a (3, 4) matrix ─────────────────────────────────────

const M = [[2, 7, 1, 4], [5, 3, 8, 2], [1, 6, 2, 9]]
const colSums = [8, 16, 11, 15]
const rowSums = [14, 18, 18]

export function AxisPlay({ onDone }: WidgetProps) {
  const [mode, setMode] = useState<'none' | 'a0' | 'a1'>('none')
  const [tried, setTried] = useState<Set<string>>(new Set())
  const try_ = (m: 'a0' | 'a1') => { setMode(m); setTried(t => new Set(t).add(m)) }
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">M has shape <Shape s="(3, 4)" />. Press both buttons and watch which axis disappears.</p>
      <p className="text-sm text-gray-400 mb-4">The axis you name is the one that vanishes.</p>
      <div className="flex gap-3 mb-5">
        <button onClick={() => try_('a0')} className={chipCls(mode === 'a0')}>M.sum(axis=0)</button>
        <button onClick={() => try_('a1')} className={chipCls(mode === 'a1')}>M.sum(axis=1)</button>
      </div>
      <div className="grid gap-1.5">
        {M.map((row, r) => (
          <div key={r} className="flex gap-1.5 items-center">
            {row.map((v, c) => <Cell key={c} v={v} dim={mode !== 'none'} />)}
            {mode === 'a1' && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5">
                <span className="text-gray-500 font-mono text-xs">-&gt;</span>
                <Cell v={rowSums[r]} hot />
              </motion.div>
            )}
          </div>
        ))}
        {mode === 'a0' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1.5 mt-1">
            {colSums.map((v, c) => <Cell key={c} v={v} hot />)}
          </motion.div>
        )}
      </div>
      <div className="mt-4 h-6 font-mono text-sm">
        {mode === 'a0' && <span className="text-gray-300">rows collapsed: shape <Shape s="(4,)" />, one sum per column</span>}
        {mode === 'a1' && <span className="text-gray-300">columns collapsed: shape <Shape s="(3,)" />, one sum per row</span>}
      </div>
      {tried.size === 2
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-6 text-xs text-gray-500">Try {tried.size === 0 ? 'both buttons' : 'the other button'} to continue.</p>}
    </div>
  )
}

// ── L1: slice explorer on x with shape (2, 4, 3) ─────────────────────────────

type SliceKey = 'x[0]' | 'x[:, 0]' | 'x[:, :, 0]' | 'x[:, -2:, :]'
const SLICES: { key: SliceKey; shape: string; hit: (b: number, t: number, c: number) => boolean; read: string }[] = [
  { key: 'x[0]',         shape: '(4, 3)',    hit: b => b === 0,           read: 'first sequence only; the B axis is gone' },
  { key: 'x[:, 0]',      shape: '(2, 3)',    hit: (_b, t) => t === 0,     read: 'first position of every sequence; the T axis is gone' },
  { key: 'x[:, :, 0]',   shape: '(2, 4)',    hit: (_b, _t, c) => c === 0, read: 'first channel everywhere; the C axis is gone' },
  { key: 'x[:, -2:, :]', shape: '(2, 2, 3)', hit: (_b, t) => t >= 2,      read: 'last two positions; negative indices count from the end' },
]

export function SlicePlay({ onDone }: WidgetProps) {
  const [active, setActive] = useState<SliceKey | null>(null)
  const [tried, setTried] = useState<Set<SliceKey>>(new Set())
  const cur = SLICES.find(s => s.key === active)
  const try_ = (k: SliceKey) => { setActive(k); setTried(t => new Set(t).add(k)) }
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">x has shape <Shape s="(B=2, T=4, C=3)" />. Tap a slice; lit cells survive.</p>
      <p className="text-sm text-gray-400 mb-4">B sequences, T positions, C channels. A colon keeps the whole axis.</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {SLICES.map(s => <button key={s.key} onClick={() => try_(s.key)} className={chipCls(active === s.key)}>{s.key}</button>)}
      </div>
      <div className="flex gap-8">
        {[0, 1].map(b => (
          <div key={b}>
            <p className="text-[10px] font-mono text-gray-500 mb-1">sequence b={b}</p>
            <div className="grid gap-1.5">
              {[0, 1, 2, 3].map(t => (
                <div key={t} className="flex gap-1.5">
                  {[0, 1, 2].map(c => {
                    const on = cur ? cur.hit(b, t, c) : true
                    return <Cell key={c} v={'·'} hot={cur ? on : false} dim={cur ? !on : false} />
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 min-h-10 font-mono text-sm">
        {cur && (
          <motion.p key={cur.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-300">
            {cur.key} <span className="text-gray-500">-&gt;</span> <Shape s={cur.shape} /> <span className="text-gray-500">({cur.read})</span>
          </motion.p>
        )}
      </div>
      {tried.size >= 3
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-6 text-xs text-gray-500">Explore at least 3 slices to continue ({tried.size}/3).</p>}
    </div>
  )
}

// ── L2: BPE merge stepper ─────────────────────────────────────────────────────
// Corpus: "banana bandana". Watch the most frequent pair merge, three rounds.

interface BpeRound { tokens: string[]; pair: string; count: number; note: string }
const BPE_ROUNDS: BpeRound[] = [
  { tokens: ['b','a','n','a','n','a','_','b','a','n','d','a','n','a'], pair: 'a+n', count: 4, note: '"an" appears 4 times, the most frequent adjacent pair' },
  { tokens: ['b','an','an','a','_','b','an','d','an','a'], pair: 'an+a', count: 2, note: '"ana" wins this round: "an"+"a" occurs twice' },
  { tokens: ['b','an','ana','_','b','an','d','ana'], pair: 'b+an', count: 2, note: '"ban" merges next; the vocab now holds an, ana, ban' },
  { tokens: ['ban','ana','_','ban','d','ana'], pair: '', count: 0, note: '14 characters became 6 tokens. That compression is the whole point.' },
]

export function BpePlay({ onDone }: WidgetProps) {
  const [round, setRound] = useState(0)
  const cur = BPE_ROUNDS[round]
  const last = round === BPE_ROUNDS.length - 1
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Byte-pair encoding builds a vocabulary by merging the most frequent pair, over and over.</p>
      <p className="text-sm text-gray-400 mb-4">Corpus: "banana bandana". Tap merge and watch.</p>
      <div className="flex flex-wrap gap-1.5 mb-4 min-h-10">
        {cur.tokens.map((t, i) => (
          <motion.div key={round + '-' + i} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.03 }}>
            <Cell v={t === '_' ? '␣' : t} wide hot={t.length > 1} dim={t === '_'} />
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-gray-300 mb-1 min-h-5">{cur.note}</p>
      {!last ? (
        <button onClick={() => setRound(r => r + 1)}
          className="mt-3 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-sm font-semibold">
          merge "{cur.pair}" ({cur.count}x)
        </button>
      ) : (
        <ContinueBtn onClick={onDone} label="Got it, continue" />
      )}
      <p className="mt-4 text-xs text-gray-500">Round {Math.min(round + 1, 3)} of 3. Merged tokens light up.</p>
    </div>
  )
}

// ── L3: attention weights with causal mask toggle ─────────────────────────────
// Fixed toy weights for "the cat sat here": tap a query row, toggle the mask.

const TOKENS = ['the', 'cat', 'sat', 'here']
// unmasked attention weights per query (rows sum to 1)
const W: number[][] = [
  [0.70, 0.10, 0.10, 0.10],
  [0.25, 0.55, 0.10, 0.10],
  [0.10, 0.50, 0.30, 0.10],
  [0.10, 0.30, 0.35, 0.25],
]
function renorm(row: number[], upto: number): number[] {
  const kept = row.map((v, j) => (j <= upto ? v : 0))
  const s = kept.reduce((a, b) => a + b, 0)
  return kept.map(v => v / s)
}

export function AttentionPlay({ onDone }: WidgetProps) {
  const [q, setQ] = useState<number | null>(null)
  const [masked, setMasked] = useState(false)
  const [tried, setTried] = useState<Set<number>>(new Set())
  const [maskTried, setMaskTried] = useState(false)
  const row = q === null ? null : masked ? renorm(W[q], q) : W[q]
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Attention: every position asks "which earlier tokens matter to me?"</p>
      <p className="text-sm text-gray-400 mb-4">Tap a query token to see where it looks. Then flip the causal mask.</p>
      <div className="flex gap-2 mb-3">
        {TOKENS.map((t, i) => (
          <button key={t} onClick={() => { setQ(i); setTried(s => new Set(s).add(i)) }} className={chipCls(q === i)}>{t}</button>
        ))}
        <button onClick={() => { setMasked(m => !m); setMaskTried(true) }}
          className={`ml-auto ${chipCls(masked)}`}>
          causal mask: {masked ? 'ON' : 'off'}
        </button>
      </div>
      <div className="min-h-28">
        {row === null ? (
          <p className="text-sm text-gray-600 font-mono mt-6">tap a token above</p>
        ) : (
          <div className="grid gap-2 mt-2">
            {TOKENS.map((t, j) => {
              const dead = masked && q !== null && j > q
              const v = row[j]
              return (
                <div key={t} className="flex items-center gap-2">
                  <span className={`w-12 font-mono text-xs ${dead ? 'text-gray-700 line-through' : 'text-gray-300'}`}>{t}</span>
                  <div className="flex-1 h-5 bg-gray-900 rounded overflow-hidden">
                    <motion.div animate={{ width: `${Math.round(v * 100)}%` }} transition={{ duration: 0.4 }}
                      className={`h-full ${dead ? 'bg-gray-800' : 'bg-violet-500'}`} />
                  </div>
                  <span className="w-10 font-mono text-[10px] text-gray-500">{dead ? '-inf' : v.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-gray-400 min-h-8">
        {masked && q !== null
          ? 'Masked scores become -inf before softmax, so future tokens get exactly zero weight and the rest renormalize.'
          : q !== null ? 'Weights sum to 1: softmax turned raw scores into a spending budget over tokens.' : ''}
      </p>
      {tried.size >= 2 && maskTried
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">Tap at least 2 tokens and toggle the mask to continue.</p>}
    </div>
  )
}

// ── L4: learning-rate picker with animated loss curve ────────────────────────

const LR_RUNS: Record<string, { label: string; losses: number[]; verdict: string }> = {
  tiny:  { label: 'lr = 0.0001', losses: [4.0, 3.96, 3.92, 3.88, 3.85, 3.81, 3.78, 3.75], verdict: 'Converging, but you will grow old waiting. Too small.' },
  right: { label: 'lr = 0.01',   losses: [4.0, 3.1, 2.4, 1.9, 1.55, 1.35, 1.22, 1.15],    verdict: 'Fast, smooth descent. This is the one.' },
  big:   { label: 'lr = 0.5',    losses: [4.0, 2.2, 3.4, 1.8, 3.0, 1.7, 2.8, 1.9],        verdict: 'Overshooting the minimum and bouncing. Too large.' },
  huge:  { label: 'lr = 5.0',    losses: [4.0, 7.2, 13.5, 28.0, 61.0, 130.0, 280.0, 610.0], verdict: 'Diverged: each step leaps past the valley and up the far wall. NaN city.' },
}

export function LrPlay({ onDone }: WidgetProps) {
  const [pick, setPick] = useState<string | null>(null)
  const [tried, setTried] = useState<Set<string>>(new Set())
  const run = pick ? LR_RUNS[pick] : null
  const maxLoss = run ? Math.max(...run.losses) : 1
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">One knob rules training: the learning rate. Try all four.</p>
      <p className="text-sm text-gray-400 mb-4">Each bar is the loss after one more training step.</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(LR_RUNS).map(([k, r]) => (
          <button key={k} onClick={() => { setPick(k); setTried(t => new Set(t).add(k)) }} className={chipCls(pick === k)}>{r.label}</button>
        ))}
      </div>
      <div className="flex items-end gap-2 h-36 mb-2">
        {run ? run.losses.map((l, i) => (
          <motion.div key={pick + '-' + i} initial={{ height: 0 }} animate={{ height: `${Math.max(4, (l / maxLoss) * 100)}%` }}
            transition={{ delay: i * 0.08 }}
            className={`flex-1 rounded-t ${l > 4.0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
        )) : <p className="text-sm text-gray-600 font-mono self-center mx-auto">pick a learning rate</p>}
      </div>
      <p className="text-sm text-gray-300 min-h-10">{run?.verdict ?? ''}</p>
      {tried.size >= 4
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">Try all four to continue ({tried.size}/4).</p>}
    </div>
  )
}

// ── L5: temperature on a toy next-token distribution ─────────────────────────

const LOGITS: { tok: string; z: number }[] = [
  { tok: 'blue', z: 2.0 }, { tok: 'cloudy', z: 1.2 }, { tok: 'falling', z: 0.6 }, { tok: 'green', z: -0.4 }, { tok: 'spoon', z: -1.5 },
]
function softmaxT(T: number): number[] {
  if (T === 0) { const m = Math.max(...LOGITS.map(l => l.z)); return LOGITS.map(l => (l.z === m ? 1 : 0)) }
  const e = LOGITS.map(l => Math.exp(l.z / T))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map(v => v / s)
}
const TEMPS = [0, 0.5, 1.0, 2.0]

export function TemperaturePlay({ onDone }: WidgetProps) {
  const [T, setT] = useState<number | null>(null)
  const [tried, setTried] = useState<Set<number>>(new Set())
  const probs = T === null ? null : softmaxT(T)
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">"The sky is ___". Temperature reshapes the same logits before sampling.</p>
      <p className="text-sm text-gray-400 mb-4">Low T sharpens toward the favorite; high T flattens toward uniform.</p>
      <div className="flex gap-2 mb-5">
        {TEMPS.map(t => (
          <button key={t} onClick={() => { setT(t); setTried(s => new Set(s).add(t)) }} className={chipCls(T === t)}>T = {t}</button>
        ))}
      </div>
      <div className="grid gap-2 min-h-36">
        {LOGITS.map((l, i) => (
          <div key={l.tok} className="flex items-center gap-2">
            <span className="w-16 font-mono text-xs text-gray-300">{l.tok}</span>
            <div className="flex-1 h-5 bg-gray-900 rounded overflow-hidden">
              <motion.div animate={{ width: probs ? `${Math.round(probs[i] * 100)}%` : '0%' }} transition={{ duration: 0.4 }}
                className="h-full bg-sky-500" />
            </div>
            <span className="w-10 font-mono text-[10px] text-gray-500">{probs ? (probs[i]).toFixed(2) : l.z.toFixed(1)}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-400 min-h-8">
        {T === 0 && 'T=0 is greedy decoding: argmax every time, same output every run.'}
        {T === 0.5 && 'Sharper than the raw logits: safe, a little predictable.'}
        {T === 1.0 && 'T=1 is the unmodified softmax of the logits.'}
        {T === 2.0 && 'Flat enough that "spoon" is now in play. Creative or unhinged, your call.'}
      </p>
      {tried.size >= 3
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">Try at least 3 temperatures ({tried.size}/3).</p>}
    </div>
  )
}

// ── L6: precision picker: 7B model memory footprint ──────────────────────────

const PRECISIONS: { name: string; bytes: number; note: string }[] = [
  { name: 'fp32', bytes: 4, note: '28 GB just for weights. Does not fit a 24 GB consumer GPU.' },
  { name: 'fp16', bytes: 2, note: '14 GB: the standard for training and full-quality inference.' },
  { name: 'int8', bytes: 1, note: '7 GB: near-lossless quantization, fits a laptop GPU.' },
  { name: 'int4', bytes: 0.5, note: '3.5 GB: some quality loss, runs on a phone. This is how local LLMs exist.' },
]

export function PrecisionPlay({ onDone }: WidgetProps) {
  const [pick, setPick] = useState<number | null>(null)
  const [tried, setTried] = useState<Set<number>>(new Set())
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">A 7B-parameter model: memory = parameters x bytes per parameter.</p>
      <p className="text-sm text-gray-400 mb-4">Tap each precision and watch the footprint.</p>
      <div className="flex gap-2 mb-5">
        {PRECISIONS.map((p, i) => (
          <button key={p.name} onClick={() => { setPick(i); setTried(t => new Set(t).add(i)) }} className={chipCls(pick === i)}>{p.name}</button>
        ))}
      </div>
      <div className="h-10 bg-gray-900 rounded-lg overflow-hidden mb-2 relative">
        <motion.div animate={{ width: pick === null ? '0%' : `${(PRECISIONS[pick].bytes / 4) * 100}%` }}
          transition={{ duration: 0.4 }} className="h-full bg-gradient-to-r from-violet-600 to-sky-500" />
        {pick !== null && (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-sm text-white">
            7B x {PRECISIONS[pick].bytes} B = {(7 * PRECISIONS[pick].bytes).toFixed(1)} GB
          </span>
        )}
      </div>
      <p className="text-sm text-gray-300 min-h-10">{pick !== null ? PRECISIONS[pick].note : ''}</p>
      {tried.size >= 4
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">Try all four precisions ({tried.size}/4).</p>}
    </div>
  )
}

// ── L7: reward hacking scenario ───────────────────────────────────────────────

const HACKS: { rule: string; hack: string }[] = [
  { rule: 'Reward: response length (longer looked more helpful in training data)', hack: 'The model pads every answer with restatements, caveats, and bullet lists of the obvious.' },
  { rule: 'Reward: user says "thanks" afterward', hack: 'The model becomes sycophantic: it agrees with everything, including your bugs.' },
  { rule: 'Reward: passes the provided unit tests', hack: 'The model hard-codes the test cases: if input == 3: return 7. Tests green, code useless.' },
]

export function RewardHackPlay({ onDone }: WidgetProps) {
  const [seen, setSeen] = useState<Set<number>>(new Set())
  const [cur, setCur] = useState<number | null>(null)
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Goodhart's law, LLM edition: reward a proxy and the model optimizes the proxy, not your intent.</p>
      <p className="text-sm text-gray-400 mb-4">Tap each reward rule to see how it gets gamed.</p>
      <div className="grid gap-2 mb-4">
        {HACKS.map((h, i) => (
          <button key={i} onClick={() => { setCur(i); setSeen(s => new Set(s).add(i)) }}
            className={`px-4 py-3 rounded-xl border text-left text-sm transition-colors ${cur === i ? 'bg-violet-600/20 border-violet-500 text-gray-100' : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-violet-500'}`}>
            {h.rule} {seen.has(i) && <span className="text-emerald-400 float-right">seen</span>}
          </button>
        ))}
      </div>
      <div className="min-h-16">
        {cur !== null && (
          <motion.p key={cur} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-amber-300">
            {HACKS[cur].hack}
          </motion.p>
        )}
      </div>
      {seen.size === 3
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">See all 3 hacks to continue ({seen.size}/3).</p>}
    </div>
  )
}

// ── L5: autoregressive generation stepper ────────────────────────────────────
// The killer widget: tap "generate", watch the distribution, watch the context
// grow, watch the KV-cache fill. Scripted toy model, deterministic picks.

interface GenRound { dist: { tok: string; p: number }[]; pick: string }
const GEN_PROMPT = ['The', 'cat', 'sat', 'on', 'the']
const GEN_ROUNDS: GenRound[] = [
  { dist: [ { tok: 'mat', p: 0.62 }, { tok: 'floor', p: 0.18 }, { tok: 'sofa', p: 0.09 }, { tok: 'roof', p: 0.06 }, { tok: 'moon', p: 0.05 } ], pick: 'mat' },
  { dist: [ { tok: '.', p: 0.55 }, { tok: 'and', p: 0.20 }, { tok: ',', p: 0.15 }, { tok: 'again', p: 0.10 } ], pick: '.' },
  { dist: [ { tok: 'It', p: 0.40 }, { tok: 'The', p: 0.25 }, { tok: 'Then', p: 0.20 }, { tok: 'A', p: 0.15 } ], pick: 'It' },
  { dist: [ { tok: 'purred', p: 0.50 }, { tok: 'slept', p: 0.30 }, { tok: 'left', p: 0.20 } ], pick: 'purred' },
]
const LAYERS = 12

export function GenerationPlay({ onDone }: WidgetProps) {
  const [round, setRound] = useState(0)          // rounds completed
  const generated = GEN_ROUNDS.slice(0, round).map(r => r.pick)
  const cur = round < GEN_ROUNDS.length ? GEN_ROUNDS[round] : null
  const nTokens = GEN_PROMPT.length + generated.length
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Generation is a loop: predict a distribution, pick a token, feed it back in.</p>
      <p className="text-sm text-gray-400 mb-4">Tap generate and watch all three things move: context, distribution, KV-cache.</p>

      {/* context row */}
      <p className="text-[10px] font-mono text-gray-500 mb-1">context ({nTokens} tokens)</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {GEN_PROMPT.map((t, i) => <Cell key={'p' + i} v={t} wide />)}
        {generated.map((t, i) => (
          <motion.div key={'g' + i} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Cell v={t} wide hot />
          </motion.div>
        ))}
        {cur && <div className="w-9 h-9 flex items-center justify-center rounded-md border border-dashed border-gray-700 text-gray-600 font-mono text-xs">?</div>}
      </div>

      {/* current distribution */}
      <p className="text-[10px] font-mono text-gray-500 mb-1">{cur ? 'next-token distribution' : 'done: 4 tokens generated'}</p>
      <div className="grid gap-1.5 min-h-28 mb-3">
        {(cur?.dist ?? []).map(d => (
          <div key={d.tok} className="flex items-center gap-2">
            <span className="w-14 font-mono text-xs text-gray-300 text-right">{d.tok}</span>
            <div className="flex-1 h-4 bg-gray-900 rounded overflow-hidden">
              <motion.div key={round + d.tok} initial={{ width: 0 }} animate={{ width: `${Math.round(d.p * 100)}%` }} transition={{ duration: 0.5 }}
                className={`h-full ${d.tok === cur?.pick ? 'bg-emerald-500' : 'bg-gray-700'}`} />
            </div>
            <span className="w-8 font-mono text-[10px] text-gray-500">{d.p.toFixed(2)}</span>
          </div>
        ))}
        {!cur && (
          <p className="text-sm text-gray-300">"The cat sat on the <span className="text-violet-300">mat. It purred</span>" — each picked token became input for the next step. That loop is all an LLM does at inference.</p>
        )}
      </div>

      {/* kv cache meter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-mono text-gray-500 shrink-0">KV-cache</span>
        <div className="flex-1 h-3 bg-gray-900 rounded overflow-hidden">
          <motion.div animate={{ width: `${(nTokens / 9) * 100}%` }} className="h-full bg-sky-600" />
        </div>
        <span className="text-[10px] font-mono text-gray-500 shrink-0">{nTokens} tokens x {LAYERS} layers x 2 = {nTokens * LAYERS * 2} tensors</span>
      </div>

      {cur ? (
        <button onClick={() => setRound(r => r + 1)}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-sm font-semibold">
          ▶ generate token {round + 1} of 4
        </button>
      ) : (
        <ContinueBtn onClick={onDone} label="Got it, continue" />
      )}
      <p className="mt-3 text-xs text-gray-500">Green bar = sampled token. Only its K and V get appended; nothing is recomputed.</p>
    </div>
  )
}

// ── L9: embedding space explorer ──────────────────────────────────────────────

interface Word { w: string; x: number; y: number }
const WORDS: Word[] = [
  { w: 'king', x: 72, y: 18 }, { w: 'queen', x: 80, y: 26 }, { w: 'man', x: 60, y: 10 }, { w: 'woman', x: 68, y: 19 },
  { w: 'apple', x: 14, y: 68 }, { w: 'banana', x: 22, y: 76 }, { w: 'cherry', x: 10, y: 78 },
  { w: 'paris', x: 84, y: 72 }, { w: 'tokyo', x: 92, y: 80 }, { w: 'london', x: 78, y: 82 },
]
function nearest2(w: Word): string[] {
  return WORDS.filter(o => o.w !== w.w)
    .map(o => ({ w: o.w, d: (o.x - w.x) ** 2 + (o.y - w.y) ** 2 }))
    .sort((a, b) => a.d - b.d).slice(0, 2).map(o => o.w)
}

export function EmbeddingPlay({ onDone }: WidgetProps) {
  const [sel, setSel] = useState<string | null>(null)
  const [tried, setTried] = useState<Set<string>>(new Set())
  const near = sel ? nearest2(WORDS.find(w => w.w === sel)!) : []
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">An embedding maps each token to a point in space. Meaning becomes distance.</p>
      <p className="text-sm text-gray-400 mb-4">This is a 2D shadow of a 768-dim space. Tap a word; its 2 nearest neighbors light up.</p>
      <div className="relative w-full h-64 bg-gray-900 border border-gray-800 rounded-xl mb-3 overflow-hidden">
        {WORDS.map(w => {
          const isSel = sel === w.w
          const isNear = near.includes(w.w)
          return (
            <button key={w.w} onClick={() => { setSel(w.w); setTried(t => new Set(t).add(w.w)) }}
              style={{ left: `${w.x}%`, top: `${w.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-md font-mono text-xs border transition-all
                ${isSel ? 'bg-violet-600 border-violet-400 text-white scale-110 z-10'
                : isNear ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 z-10'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
              {w.w}
            </button>
          )
        })}
      </div>
      <p className="text-sm text-gray-300 min-h-10">
        {sel
          ? <>Nearest to <span className="text-violet-300 font-mono">{sel}</span>: <span className="text-emerald-300 font-mono">{near.join(', ')}</span>. Words that appear in similar contexts end up close; that is the whole trick.</>
          : 'Notice the three clusters before you tap: royalty/people, fruit, cities.'}
      </p>
      {tried.size >= 3
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">Tap at least 3 words ({tried.size}/3).</p>}
    </div>
  )
}

// ── L10: MoE router ───────────────────────────────────────────────────────────

const EXPERTS = ['E1 syntax', 'E2 nature', 'E3 math', 'E4 code']
const ROUTES: { tok: string; w: number[] }[] = [
  { tok: 'the', w: [0.71, 0.16, 0.08, 0.05] },
  { tok: 'cat', w: [0.12, 0.79, 0.05, 0.04] },
  { tok: '∑',   w: [0.03, 0.02, 0.88, 0.07] },
  { tok: 'def', w: [0.05, 0.03, 0.09, 0.83] },
]

export function MoePlay({ onDone }: WidgetProps) {
  const [sel, setSel] = useState<number | null>(null)
  const [tried, setTried] = useState<Set<number>>(new Set())
  const route = sel === null ? null : ROUTES[sel]
  const top2 = route ? [...route.w.keys()].sort((a, b) => route.w[b] - route.w[a]).slice(0, 2) : []
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">A Mixture-of-Experts layer holds several FFNs. A router picks the top 2 per token.</p>
      <p className="text-sm text-gray-400 mb-4">Tap each token and watch where the router sends it.</p>
      <div className="flex gap-2 mb-5">
        {ROUTES.map((r, i) => (
          <button key={r.tok} onClick={() => { setSel(i); setTried(t => new Set(t).add(i)) }}
            className={`px-4 py-2 rounded-lg font-mono text-sm border ${sel === i ? 'bg-violet-600 border-violet-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
            {r.tok}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {EXPERTS.map((e, i) => {
          const active = top2.includes(i)
          const w = route ? route.w[i] : 0
          return (
            <div key={e} className={`p-3 rounded-xl border transition-all duration-300 ${active ? 'bg-violet-600/20 border-violet-500' : 'bg-gray-900 border-gray-800'}`}>
              <p className={`font-mono text-xs mb-1 ${active ? 'text-violet-200' : 'text-gray-500'}`}>{e}</p>
              <div className="h-3 bg-gray-950 rounded overflow-hidden">
                <motion.div animate={{ width: `${Math.round(w * 100)}%` }} transition={{ duration: 0.4 }}
                  className={`h-full ${active ? 'bg-violet-500' : 'bg-gray-800'}`} />
              </div>
              <p className="font-mono text-[10px] text-gray-500 mt-1">{route ? w.toFixed(2) : '—'} {active && '← active'}</p>
            </div>
          )
        })}
      </div>
      <p className="text-sm text-gray-300 min-h-10">
        {route
          ? `Only 2 of 4 experts run for "${route.tok}": half the expert parameters stay cold. Same quality lever as a big dense FFN, a fraction of the compute.`
          : ''}
      </p>
      {tried.size >= 4
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">Route all 4 tokens ({tried.size}/4).</p>}
    </div>
  )
}

// ── L11: retrieval top-k ──────────────────────────────────────────────────────

const DOCS: { title: string; score: number; trap?: boolean }[] = [
  { title: 'Apollo 11 landed on the Moon on July 20, 1969', score: 0.92 },
  { title: 'Overview of the Apollo program (1961-1972)', score: 0.71 },
  { title: 'Lunar phases and orbital mechanics guide', score: 0.44 },
  { title: 'The Apollo Theater: a Harlem landmark', score: 0.38, trap: true },
  { title: 'SpaceX Starship test flights, 2024-2026', score: 0.29 },
]

export function RagPlay({ onDone }: WidgetProps) {
  const [k, setK] = useState<number | null>(null)
  const [tried, setTried] = useState<Set<number>>(new Set())
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Query: <span className="text-sky-300">"When did Apollo 11 land on the Moon?"</span></p>
      <p className="text-sm text-gray-400 mb-4">The retriever scored 5 documents. Choose how many enter the context.</p>
      <div className="flex gap-2 mb-5">
        {[1, 3, 5].map(n => (
          <button key={n} onClick={() => { setK(n); setTried(t => new Set(t).add(n)) }}
            className={`px-4 py-2 rounded-lg font-mono text-sm border ${k === n ? 'bg-violet-600 border-violet-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
            top-{n}
          </button>
        ))}
      </div>
      <div className="grid gap-2 mb-3">
        {DOCS.map((d, i) => {
          const inCtx = k !== null && i < k
          return (
            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300
              ${inCtx ? 'bg-emerald-600/10 border-emerald-700' : 'bg-gray-900 border-gray-800 opacity-60'}`}>
              <span className={`font-mono text-xs w-10 shrink-0 ${inCtx ? 'text-emerald-400' : 'text-gray-600'}`}>{d.score.toFixed(2)}</span>
              <span className={`text-sm ${inCtx ? 'text-gray-200' : 'text-gray-500'}`}>{d.title}</span>
              {inCtx && d.trap && <span className="ml-auto text-xs text-amber-400 shrink-0">wrong Apollo!</span>}
            </div>
          )
        })}
      </div>
      <p className="text-sm text-gray-300 min-h-14">
        {k === 1 && 'One perfect document: precise, cheap, but fragile — if the retriever misses, the model has nothing.'}
        {k === 3 && 'The sweet spot here: the answer plus supporting context, junk still excluded.'}
        {k === 5 && 'Now the Apollo Theater is in the context. High k trades precision for recall — and lexical overlap ("Apollo") is exactly how junk sneaks in.'}
      </p>
      {tried.size >= 2
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">Try at least 2 values of k ({tried.size}/2).</p>}
    </div>
  )
}

// ── L12: LoRA rank picker ─────────────────────────────────────────────────────
// 7B base, 32 layers, d=4096, adapting q & v projections: each adapter is two
// matrices A (d x r) and B (r x d) -> params = 2 proj x 2 mats x d x r x layers.

const RANKS = [1, 4, 16, 64]
const loraParams = (r: number) => 2 * 2 * 4096 * r * 32
const BASE_PARAMS = 7e9

export function LoraPlay({ onDone }: WidgetProps) {
  const [r, setR] = useState<number | null>(null)
  const [tried, setTried] = useState<Set<number>>(new Set())
  const p = r === null ? 0 : loraParams(r)
  const pct = (p / BASE_PARAMS) * 100
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">LoRA freezes all 7B weights and trains two thin matrices per layer instead.</p>
      <p className="text-sm text-gray-400 mb-4">Pick a rank r. Trainable parameters = 2 proj x (A: d x r + B: r x d) x 32 layers.</p>
      <div className="flex gap-2 mb-5">
        {RANKS.map(rank => (
          <button key={rank} onClick={() => { setR(rank); setTried(t => new Set(t).add(rank)) }}
            className={`px-4 py-2 rounded-lg font-mono text-sm border ${r === rank ? 'bg-violet-600 border-violet-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
            r = {rank}
          </button>
        ))}
      </div>
      <div className="mb-1 flex justify-between font-mono text-[10px] text-gray-500">
        <span>trainable</span><span>frozen base: 7,000M</span>
      </div>
      <div className="h-8 bg-gray-900 rounded-lg overflow-hidden relative mb-2">
        <motion.div animate={{ width: `${Math.max(pct * 30, r === null ? 0 : 1.5)}%` }} transition={{ duration: 0.4 }}
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
        {r !== null && (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white">
            {(p / 1e6).toFixed(1)}M params = {pct.toFixed(2)}% of the model
          </span>
        )}
      </div>
      <p className="text-sm text-gray-300 min-h-14">
        {r === 1 && 'One rank: 1M parameters. Enough for narrow style shifts, too thin for new capabilities.'}
        {r === 4 && '4M parameters, 0.06% of the model. This trains on one consumer GPU and covers most instruction-tuning tasks.'}
        {r === 16 && 'The common default: quality close to full fine-tuning on most benchmarks at 0.24% of the parameters.'}
        {r === 64 && '67M parameters. Diminishing returns: weight updates during fine-tuning are intrinsically low-rank, so extra rank mostly buys noise.'}
      </p>
      {tried.size >= 4
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">Try all four ranks ({tried.size}/4).</p>}
    </div>
  )
}

// ── L13: speculative decoding rounds ─────────────────────────────────────────

interface SpecRound { proposed: string[]; accepted: number; fix?: string }
const SPEC_ROUNDS: SpecRound[] = [
  { proposed: ['the', 'cat', 'sat', 'on'], accepted: 3, fix: 'quietly' },
  { proposed: ['on', 'the', 'warm', 'mat'], accepted: 4 },
]

export function SpecDecodePlay({ onDone }: WidgetProps) {
  const [round, setRound] = useState(0)   // 0 = not started, 1..2 = rounds shown
  const shown = SPEC_ROUNDS.slice(0, round)
  const total = shown.reduce((n, r) => n + r.accepted + (r.fix ? 1 : 0), 0)
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">A small draft model guesses 4 tokens; the big model verifies them all in one pass.</p>
      <p className="text-sm text-gray-400 mb-4">Accepted guesses are free speed. A rejection costs nothing: the big model supplies the fix.</p>
      <div className="grid gap-3 mb-4 min-h-28">
        {shown.map((r, ri) => (
          <div key={ri}>
            <p className="text-[10px] font-mono text-gray-500 mb-1">round {ri + 1}: draft proposes, target verifies</p>
            <div className="flex flex-wrap gap-1.5">
              {r.proposed.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                  <div className={`px-2 h-9 min-w-9 flex items-center justify-center rounded-md font-mono text-xs border
                    ${i < r.accepted ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-red-900/30 border-red-800 text-red-300 line-through'}`}>
                    {t}
                  </div>
                </motion.div>
              ))}
              {r.fix && (
                <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
                  <div className="px-2 h-9 min-w-9 flex items-center justify-center rounded-md font-mono text-xs border bg-violet-600/30 border-violet-500 text-violet-200">
                    {r.fix} ←target
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>
      {round > 0 && (
        <p className="text-sm text-gray-300 mb-2">
          {total} tokens produced in {round} target pass{round > 1 ? 'es' : ''} (sequential decoding would need {total}).
        </p>
      )}
      {round < SPEC_ROUNDS.length ? (
        <button onClick={() => setRound(n => n + 1)}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-sm font-semibold">
          ▶ run round {round + 1}
        </button>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-1">The output distribution is mathematically identical to the big model decoding alone. Pure speed, zero quality change.</p>
          <ContinueBtn onClick={onDone} label="Got it, continue" />
        </>
      )}
    </div>
  )
}


// ── internals: word order / positional encoding ──────────────────────────────

const PP_VEC_BAG = '[0.31, 0.74, 0.22]'
const PP_VEC_A = '[0.58, 0.12, 0.91]'
const PP_VEC_B = '[0.07, 0.66, 0.43]'

export function PositionPlay({ onDone }: WidgetProps) {
  const [positions, setPositions] = useState(false)
  const [tried, setTried] = useState<Set<string>>(new Set(['off']))
  const set = (on: boolean) => { setPositions(on); setTried(t => new Set(t).add(on ? 'on' : 'off')) }
  const rows: { words: string[]; vec: string }[] = [
    { words: ['dog', 'bites', 'man'], vec: positions ? PP_VEC_A : PP_VEC_BAG },
    { words: ['man', 'bites', 'dog'], vec: positions ? PP_VEC_B : PP_VEC_BAG },
  ]
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Attention is a weighted sum — and sums do not care about order.</p>
      <p className="text-sm text-gray-400 mb-4">Two opposite sentences. Toggle positional encoding and watch what the model computes.</p>
      <div className="flex gap-3 mb-5">
        <button onClick={() => set(false)} className={chipCls(!positions)}>positions OFF</button>
        <button onClick={() => set(true)} className={chipCls(positions)}>positions ON</button>
      </div>
      <div className="grid gap-3 mb-4">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border bg-gray-900 border-gray-800">
            <div className="flex gap-1.5">
              {r.words.map((w, j) => (
                <span key={j} className="px-2 py-1 rounded-md bg-gray-800 border border-gray-700 font-mono text-xs text-gray-200">
                  {w}{positions && <span className="text-violet-400">+p{j}</span>}
                </span>
              ))}
            </div>
            <span className="ml-auto font-mono text-[10px] text-gray-500">→</span>
            <motion.span key={r.vec + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`font-mono text-[11px] ${positions ? 'text-emerald-300' : 'text-red-300'}`}>{r.vec}</motion.span>
          </div>
        ))}
      </div>
      <p className={`text-sm min-h-12 ${positions ? 'text-emerald-300' : 'text-red-300'}`}>
        {positions
          ? 'Different representations. Each token carries a position tag, so "dog at position 0" and "dog at position 2" are no longer the same input. Word order is back.'
          : 'Identical representations. Without positions, both sentences are the same bag of words — the model literally cannot tell who bit whom.'}
      </p>
      {tried.size >= 2
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">Try both settings.</p>}
    </div>
  )
}

// ── internals: causal mask toggle ─────────────────────────────────────────────

const CM_TOKS = ['The', 'cat', 'sat', 'down']

export function CausalMaskPlay({ onDone }: WidgetProps) {
  const [masked, setMasked] = useState(true)
  const [tried, setTried] = useState<Set<string>>(new Set(['on']))
  const set = (m: boolean) => { setMasked(m); setTried(t => new Set(t).add(m ? 'on' : 'off')) }
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Each row is a position asking: which tokens am I allowed to see?</p>
      <p className="text-sm text-gray-400 mb-4">Toggle the causal mask and watch the upper triangle.</p>
      <div className="flex gap-3 mb-5">
        <button onClick={() => set(true)} className={chipCls(masked)}>mask ON (causal)</button>
        <button onClick={() => set(false)} className={chipCls(!masked)}>mask OFF</button>
      </div>
      <div className="grid gap-1.5 mb-4">
        <div className="flex gap-1.5 ml-16">
          {CM_TOKS.map(t => <div key={t} className="w-12 text-center font-mono text-[10px] text-gray-500">{t}</div>)}
        </div>
        {CM_TOKS.map((row, r) => (
          <div key={row} className="flex gap-1.5 items-center">
            <div className="w-14 text-right pr-1 font-mono text-[10px] text-gray-500">{row}</div>
            {CM_TOKS.map((_, c) => {
              const blocked = masked && c > r
              const leak = !masked && c > r
              return (
                <div key={c} className={`w-12 h-9 flex items-center justify-center rounded-md font-mono text-[10px] border transition-all duration-300
                  ${blocked ? 'bg-gray-950 border-gray-800 text-gray-700'
                  : leak ? 'bg-red-900/40 border-red-700 text-red-300'
                  : 'bg-violet-600/30 border-violet-500 text-violet-200'}`}>
                  {blocked ? '-∞' : leak ? 'leak' : 'ok'}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-300 min-h-16">
        {masked
          ? 'With the mask, "sat" sees only The / cat / sat. Its prediction is honest: the future is hidden, exactly as it will be at inference time.'
          : 'Without the mask, "sat" attends to "down" — the very token it is trained to predict. Training loss collapses toward zero, but the skill is fake: at inference there is no future to copy from.'}
      </p>
      {tried.size >= 2
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">Try both settings.</p>}
    </div>
  )
}

// ── internals: backprop chain / vanishing gradients ───────────────────────────

const BP_LAYERS = 6

export function BackpropPlay({ onDone }: WidgetProps) {
  const [act, setAct] = useState<'sigmoid' | 'relu'>('sigmoid')
  const [depth, setDepth] = useState(0)
  const [finished, setFinished] = useState<Set<string>>(new Set())
  const factor = act === 'sigmoid' ? 0.25 : 1.0
  const pick = (a: 'sigmoid' | 'relu') => { if (a !== act) { setAct(a); setDepth(0) } }
  const stepBack = () => {
    const d = depth + 1
    setDepth(d)
    if (d >= BP_LAYERS) setFinished(f => new Set(f).add(act))
  }
  const fmt = (g: number) => (g >= 0.01 ? g.toFixed(2) : g.toExponential(1))
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">The loss knows how wrong the output was. That signal must travel back through every layer.</p>
      <p className="text-sm text-gray-400 mb-4">Each layer multiplies the gradient by its local derivative. Send it back and watch.</p>
      <div className="flex gap-3 mb-5">
        <button onClick={() => pick('sigmoid')} className={chipCls(act === 'sigmoid')}>sigmoid (×0.25/layer)</button>
        <button onClick={() => pick('relu')} className={chipCls(act === 'relu')}>ReLU (×1.0/layer)</button>
      </div>
      <div className="flex items-end gap-1.5 mb-2">
        {Array.from({ length: BP_LAYERS }, (_, i) => {
          const layerNo = i + 1
          const reachedIdx = BP_LAYERS - depth
          const reached = layerNo >= reachedIdx + 1 || depth >= BP_LAYERS - i
          const g = factor ** (BP_LAYERS - i)
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-16 rounded-md border flex flex-col items-center justify-end overflow-hidden
                ${reached ? 'border-violet-500 bg-gray-900' : 'border-gray-800 bg-gray-950'}`}>
                {reached && (
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, g * 100)}%` }}
                    className={`w-full ${g < 0.01 ? 'bg-red-600' : 'bg-violet-500'}`} />
                )}
              </div>
              <span className="font-mono text-[9px] text-gray-500">L{layerNo}</span>
              <span className={`font-mono text-[9px] ${reached ? (g < 0.01 ? 'text-red-400' : 'text-violet-300') : 'text-gray-700'}`}>
                {reached ? fmt(g) : '·'}
              </span>
            </div>
          )
        })}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-16 rounded-md border border-amber-600 bg-amber-950/40 flex items-center justify-center font-mono text-[10px] text-amber-300">loss</div>
          <span className="font-mono text-[9px] text-gray-500">grad=1</span>
        </div>
      </div>
      <p className="text-sm text-gray-300 min-h-12 mb-1">
        {depth === 0 && 'Gradient at the loss is 1.0. Tap to send it back one layer.'}
        {depth > 0 && depth < BP_LAYERS && `After ${depth} layer${depth > 1 ? 's' : ''}: gradient = ${fmt(factor ** depth)}.`}
        {depth >= BP_LAYERS && act === 'sigmoid' && `Layer 1 receives ${fmt(factor ** BP_LAYERS)} — effectively nothing. Early layers stop learning. This is the vanishing gradient.`}
        {depth >= BP_LAYERS && act === 'relu' && 'Layer 1 receives the full signal. This is why ReLU-family activations (and residual connections) took over deep learning.'}
      </p>
      {depth < BP_LAYERS && (
        <button onClick={stepBack}
          className="mt-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold">
          ← send gradient back ({depth}/{BP_LAYERS})
        </button>
      )}
      {finished.size >= 2
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : depth >= BP_LAYERS && <p className="mt-4 text-xs text-gray-500">Now run the other activation.</p>}
    </div>
  )
}

// ── tokenization: famous failure modes ────────────────────────────────────────

export function TokenFailPlay({ onDone }: WidgetProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const reveal = (k: string) => setRevealed(r => new Set(r).add(k))
  const Tok = ({ t }: { t: string }) => (
    <span className="px-1.5 py-0.5 rounded bg-violet-600/30 border border-violet-500 font-mono text-xs text-violet-200">{t}</span>
  )
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Two famous LLM fails. Tap each one to see the token boundaries behind it.</p>
      <p className="text-sm text-gray-400 mb-4">The model never sees letters — only token IDs.</p>

      <button onClick={() => reveal('straw')} className="w-full text-left p-4 mb-3 rounded-xl border bg-gray-900 border-gray-800 hover:border-violet-500 transition-colors">
        <p className="text-sm text-gray-200 mb-1">Q: How many r&apos;s are in &quot;strawberry&quot;?</p>
        <p className="text-sm text-red-300 font-mono mb-2">Model: 2 ✗ (it is 3)</p>
        {revealed.has('straw') && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs text-gray-400 mb-2">What the model actually receives:</p>
            <p className="mb-2 flex gap-1.5 items-center">
              <Tok t="straw" /><Tok t="berry" />
              <span className="font-mono text-[10px] text-gray-500">→ IDs [33861, 15717]</span>
            </p>
            <p className="text-xs text-gray-300">The letters are fused into two opaque IDs before the model ever runs. It cannot count what it cannot see — it guesses from association, and &quot;berry&quot; words usually have 2 r&apos;s mentioned around them.</p>
          </motion.div>
        )}
        {!revealed.has('straw') && <p className="text-xs text-gray-600">tap to reveal tokens</p>}
      </button>

      <button onClick={() => reveal('911')} className="w-full text-left p-4 mb-3 rounded-xl border bg-gray-900 border-gray-800 hover:border-violet-500 transition-colors">
        <p className="text-sm text-gray-200 mb-1">Q: Which is bigger, 9.11 or 9.9?</p>
        <p className="text-sm text-red-300 font-mono mb-2">Model: 9.11 ✗</p>
        {revealed.has('911') && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs text-gray-400 mb-2">What the model actually receives:</p>
            <p className="mb-2 flex gap-1.5 items-center flex-wrap">
              <Tok t="9" /><Tok t="." /><Tok t="11" />
              <span className="font-mono text-[10px] text-gray-500">vs</span>
              <Tok t="9" /><Tok t="." /><Tok t="9" />
            </p>
            <p className="text-xs text-gray-300">Not one number — three tokens. And in the training data, &quot;9.11&quot; usually follows &quot;9.9&quot;: section numbers, versions, dates. The pattern &quot;11 comes after 9&quot; wins over decimal arithmetic.</p>
          </motion.div>
        )}
        {!revealed.has('911') && <p className="text-xs text-gray-600">tap to reveal tokens</p>}
      </button>

      {revealed.size >= 2
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-2 text-xs text-gray-500">Reveal both failures ({revealed.size}/2).</p>}
    </div>
  )
}

// ── alignment: calibration betting game ───────────────────────────────────────

const CAL_ITEMS: { claim: string; conf: number; correct: boolean }[] = [
  { claim: 'Canberra is the capital of Australia', conf: 98, correct: true },
  { claim: 'The Eiffel Tower was completed in 1889', conf: 96, correct: true },
  { claim: 'The word "strawberry" contains 2 r\'s', conf: 92, correct: false },
  { claim: 'The Great Wall of China is visible from the Moon', conf: 88, correct: false },
  { claim: 'Kigali is the capital of Rwanda', conf: 61, correct: true },
]

export function CalibrationPlay({ onDone }: WidgetProps) {
  const [idx, setIdx] = useState(0)
  const [bets, setBets] = useState<boolean[]>([])
  const bet = (trust: boolean) => { setBets(b => [...b, trust]); setIdx(i => i + 1) }
  const done = idx >= CAL_ITEMS.length
  const good = bets.filter((b, i) => b === CAL_ITEMS[i].correct).length
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">A model states 5 facts with its confidence. Bet on each: trust it or doubt it.</p>
      <p className="text-sm text-gray-400 mb-4">Score a point when you trust a true claim or doubt a false one.</p>
      {!done && (
        <div className="p-4 rounded-xl border bg-gray-900 border-gray-800 mb-4">
          <p className="font-mono text-[10px] text-gray-500 mb-2">claim {idx + 1} of {CAL_ITEMS.length}</p>
          <p className="text-gray-100 mb-3">&quot;{CAL_ITEMS[idx].claim}&quot;</p>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-[10px] text-gray-500 shrink-0">model confidence</span>
            <div className="flex-1 h-3 bg-gray-950 rounded overflow-hidden">
              <div className="h-full bg-sky-500" style={{ width: `${CAL_ITEMS[idx].conf}%` }} />
            </div>
            <span className="font-mono text-xs text-sky-300 shrink-0">{CAL_ITEMS[idx].conf}%</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => bet(true)} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold">Trust</button>
            <button onClick={() => bet(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-800 hover:bg-red-700 text-white text-sm font-semibold">Doubt</button>
          </div>
        </div>
      )}
      {done && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid gap-2 mb-4">
            {CAL_ITEMS.map((it, i) => {
              const goodCall = bets[i] === it.correct
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border bg-gray-900 border-gray-800 text-xs">
                  <span className={`font-mono shrink-0 ${it.correct ? 'text-emerald-400' : 'text-red-400'}`}>{it.correct ? 'TRUE' : 'FALSE'}</span>
                  <span className="text-gray-300 flex-1">{it.claim}</span>
                  <span className="font-mono text-gray-500 shrink-0">{it.conf}%</span>
                  <span className="shrink-0">{goodCall ? '✓' : '✗'}</span>
                </div>
              )
            })}
          </div>
          <p className="text-sm text-gray-200 mb-1">You made {good} of {CAL_ITEMS.length} good calls.</p>
          <p className="text-sm text-gray-400">Two claims near 90% confidence were false; the hesitant 61% one was true. Stated confidence is a speaking style, not a probability — and RLHF tunes that style toward whatever raters reward.</p>
          <ContinueBtn onClick={onDone} label="Got it, continue" />
        </motion.div>
      )}
    </div>
  )
}


// ── Tier 2: scaling laws / compute-optimal allocation ────────────────────────

const SCALING_CONFIGS: { label: string; n: number; d: number }[] = [
  { label: 'Tiny model, massive data (1B × 1T)', n: 1e9, d: 1e12 },
  { label: 'Balanced (10B × 200B)', n: 1e10, d: 2e11 },
  { label: 'Chinchilla-optimal (14B × 280B)', n: 1.4e10, d: 2.8e11 },
  { label: 'Giant model, thin data (100B × 10B)', n: 1e11, d: 1e10 },
]
// proxy loss: lower is better; Chinchilla formula Lˣ ≈ A/N^α + B/D^β
const scalingLoss = (n: number, d: number) =>
  Math.round((406.4 / (n / 1e9) ** 0.34 + 410.7 / (d / 1e9) ** 0.28) * 100) / 100

export function ScalingPlay({ onDone }: WidgetProps) {
  const [sel, setSel] = useState<number | null>(null)
  const [tried, setTried] = useState<Set<number>>(new Set())
  const pick = (i: number) => { setSel(i); setTried(t => new Set(t).add(i)) }
  const losses = SCALING_CONFIGS.map(c => scalingLoss(c.n, c.d))
  const best = losses.indexOf(Math.min(...losses))
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Fixed compute budget: 3×10²¹ FLOPs. How should you spend it?</p>
      <p className="text-sm text-gray-400 mb-4">Tap each allocation and watch the predicted loss. One combination is compute-optimal.</p>
      <div className="grid gap-2 mb-4">
        {SCALING_CONFIGS.map((c, i) => (
          <button key={i} onClick={() => pick(i)}
            className={`px-4 py-3 rounded-xl border text-left text-sm transition-colors
              ${sel === i ? 'bg-violet-600/20 border-violet-500 text-gray-100' : 'bg-gray-800/60 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
            {c.label}
            {tried.has(i) && (
              <span className={`float-right font-mono text-xs ${i === best ? 'text-emerald-400' : 'text-gray-400'}`}>
                loss {losses[i]} {i === best ? '← best' : ''}
              </span>
            )}
          </button>
        ))}
      </div>
      {sel !== null && (
        <motion.div key={sel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl border bg-gray-900 border-gray-800 mb-3 text-sm text-gray-300">
          {sel === 2
            ? 'Chinchilla (DeepMind, 2022): for a given compute budget C, optimal N* ≈ 0.1C^0.5 params and D* ≈ 20N* tokens. Models like GPT-3 were ~4× undertrained — you get a better model for the same FLOP budget by shrinking params and training longer.'
            : sel === 3
            ? 'Over-parameterized and undertrained. The giant model memorizes quickly then stagnates. You are paying for capacity you cannot afford to fill with data.'
            : sel === 0
            ? 'Reversed extreme: the model is too small to absorb what the data teaches. Capacity-limited even with abundant tokens.'
            : 'Close to optimal but slightly off-balance. A further nudge toward Chinchilla improves loss with no extra compute.'}
        </motion.div>
      )}
      {tried.size >= 4
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="text-xs text-gray-500 mt-2">Try all 4 allocations ({tried.size}/4).</p>}
    </div>
  )
}

// ── Tier 2: multi-head attention ──────────────────────────────────────────────

const MH_TOKS = ['The', 'cat', 'sat', 'on', 'it']
const MH_HEADS: { name: string; desc: string; scores: number[][] }[] = [
  {
    name: 'Head A — Coreference',
    desc: '"it" strongly attends to "cat" — the head specialises in pronoun resolution.',
    scores: [
      [0.9, 0.03, 0.03, 0.02, 0.02],
      [0.05, 0.85, 0.04, 0.03, 0.03],
      [0.03, 0.10, 0.80, 0.04, 0.03],
      [0.02, 0.03, 0.10, 0.80, 0.05],
      [0.02, 0.60, 0.08, 0.12, 0.18],
    ],
  },
  {
    name: 'Head B — Syntax',
    desc: '"sat" attends heavily to "cat" (its subject) — syntactic subject-verb dependency.',
    scores: [
      [0.80, 0.08, 0.05, 0.04, 0.03],
      [0.08, 0.75, 0.08, 0.05, 0.04],
      [0.05, 0.70, 0.15, 0.06, 0.04],
      [0.03, 0.05, 0.12, 0.72, 0.08],
      [0.03, 0.08, 0.06, 0.10, 0.73],
    ],
  },
  {
    name: 'Head C — Previous-token',
    desc: 'Every token attends mostly to its immediate predecessor — a positional induction pattern.',
    scores: [
      [0.85, 0.05, 0.04, 0.03, 0.03],
      [0.70, 0.20, 0.04, 0.03, 0.03],
      [0.02, 0.80, 0.12, 0.03, 0.03],
      [0.02, 0.03, 0.78, 0.12, 0.05],
      [0.02, 0.03, 0.04, 0.82, 0.09],
    ],
  },
  {
    name: 'Head D — Broad / global',
    desc: 'Attention is nearly uniform — this head aggregates context rather than focusing on structure.',
    scores: [
      [0.30, 0.20, 0.18, 0.17, 0.15],
      [0.18, 0.30, 0.20, 0.17, 0.15],
      [0.16, 0.20, 0.28, 0.20, 0.16],
      [0.14, 0.18, 0.22, 0.28, 0.18],
      [0.14, 0.18, 0.20, 0.22, 0.26],
    ],
  },
]

export function MultiHeadPlay({ onDone }: WidgetProps) {
  const [head, setHead] = useState<number | null>(null)
  const [tried, setTried] = useState<Set<number>>(new Set())
  const pick = (i: number) => { setHead(i); setTried(t => new Set(t).add(i)) }
  const h = head !== null ? MH_HEADS[head] : null
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">One transformer layer runs 4 attention heads in parallel. Each learns a different pattern.</p>
      <p className="text-sm text-gray-400 mb-4">Tap a head — inspect its attention heatmap for "The cat sat on it".</p>
      <div className="flex gap-2 mb-4">
        {MH_HEADS.map((hd, i) => (
          <button key={i} onClick={() => pick(i)} className={chipCls(head === i)}>
            {['A','B','C','D'][i]}
            {tried.has(i) && <span className="ml-1 text-emerald-400 text-[9px]">✓</span>}
          </button>
        ))}
      </div>
      {h && (
        <motion.div key={head!} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-xs text-violet-300 mb-2">{h.name}</p>
          <div className="grid gap-0.5 mb-2">
            <div className="flex gap-0.5 ml-14">
              {MH_TOKS.map(t => <div key={t} className="w-10 text-center font-mono text-[9px] text-gray-500">{t}</div>)}
            </div>
            {h.scores.map((row, r) => (
              <div key={r} className="flex gap-0.5 items-center">
                <div className="w-12 text-right pr-1 font-mono text-[9px] text-gray-500">{MH_TOKS[r]}</div>
                {row.map((v, c) => (
                  <div key={c} className="w-10 h-7 flex items-center justify-center rounded font-mono text-[9px] transition-all duration-300"
                    style={{ background: `rgba(139,92,246,${v.toFixed(2)})`, color: v > 0.5 ? 'white' : '#9ca3af', border: '1px solid rgba(139,92,246,0.2)' }}>
                    {v >= 0.1 ? v.toFixed(2) : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-300">{h.desc}</p>
        </motion.div>
      )}
      {tried.size >= 4
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-4 text-xs text-gray-500">Explore all 4 heads ({tried.size}/4).</p>}
    </div>
  )
}

// ── Tier 2: beam search vs sampling ──────────────────────────────────────────

interface BeamNode { token: string; logp: number; children?: BeamNode[] }
const BEAM_TREE: BeamNode[] = [
  { token: 'on', logp: -0.51, children: [
    { token: 'the', logp: -0.36 },
    { token: 'a', logp: -1.20 },
  ]},
  { token: 'by', logp: -1.20, children: [
    { token: 'fire', logp: -0.69 },
    { token: 'the', logp: -0.69 },
  ]},
  { token: 'in', logp: -2.30, children: [] },
]

export function BeamPlay({ onDone }: WidgetProps) {
  const [step, setStep] = useState<0|1|2>(0)
  const beams0 = BEAM_TREE.slice(0,2) // top-2 first tokens
  const beams1 = beams0.flatMap(b => (b.children ?? []).slice(0,1).map(c => ({
    tokens: [b.token, c.token],
    logp: b.logp + c.logp,
  }))).sort((a,b) => b.logp - a.logp)

  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Prompt: "The cat sat ___". Beam width = 2.</p>
      <p className="text-sm text-gray-400 mb-4">Beam search keeps the top-k sequences at each step. Sampling would draw from the distribution — you might get "by fire".</p>

      {/* step 0: initial token candidates */}
      <div className="mb-4">
        <p className="font-mono text-[10px] text-gray-500 mb-1">Step 1 candidates (log-prob)</p>
        <div className="flex gap-2">
          {BEAM_TREE.map((n, i) => (
            <div key={n.token} className={`px-3 py-2 rounded-lg border font-mono text-sm transition-all
              ${i < 2 ? 'bg-violet-600/20 border-violet-500 text-violet-200' : 'bg-gray-900 border-gray-800 text-gray-600 line-through'}`}>
              {n.token} <span className="text-[10px]">{n.logp}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-1">pruned: "in" — only top-2 kept</p>
      </div>

      {step >= 1 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <p className="font-mono text-[10px] text-gray-500 mb-1">Step 2 expand each beam</p>
          {beams0.map(b => (
            <div key={b.token} className="flex gap-2 mb-1">
              <div className="px-2 py-1 rounded bg-violet-700/20 border border-violet-600 font-mono text-xs text-violet-300">{b.token}</div>
              <span className="text-gray-600 self-center text-xs">→</span>
              {(b.children ?? []).map((c, ci) => (
                <div key={c.token} className={`px-2 py-1 rounded border font-mono text-xs
                  ${ci === 0 ? 'bg-violet-600/20 border-violet-500 text-violet-200' : 'bg-gray-900 border-gray-800 text-gray-400'}`}>
                  {c.token} <span className="text-[9px]">{c.logp}</span>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      )}

      {step >= 2 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <p className="font-mono text-[10px] text-gray-500 mb-1">Re-rank by cumulative log-prob</p>
          {beams1.map((b, i) => (
            <div key={b.tokens.join('-')} className={`flex items-center gap-3 px-3 py-2 mb-1 rounded-lg border font-mono text-sm
              ${i === 0 ? 'bg-emerald-600/20 border-emerald-600 text-emerald-200' : 'bg-gray-900 border-gray-800 text-gray-400'}`}>
              <span>"The cat sat {b.tokens.join(' ')}"</span>
              <span className="ml-auto text-[10px]">{b.logp.toFixed(2)}</span>
              {i === 0 && <span className="text-[10px] text-emerald-400">← winner</span>}
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-2">Safe, grammatical, boring. Sampling could have picked "by fire" — a phrase that scores lower on average but is vivid. Neither is always right: use beam for factual tasks, sampling for creative ones.</p>
        </motion.div>
      )}

      {step < 2 && (
        <button onClick={() => setStep(s => (s + 1) as 0|1|2)}
          className="mt-4 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold">
          {step === 0 ? 'Expand beams (step 2)' : 'Re-rank and pick winner'}
        </button>
      )}
      {step >= 2 && <ContinueBtn onClick={onDone} label="Got it, continue" />}
    </div>
  )
}

// ── Tier 2: overfitting / early stopping ─────────────────────────────────────

// pre-computed loss pairs [train, val] for 12 training steps
const ES_CURVE: [number, number][] = [
  [2.30, 2.35], [1.80, 1.88], [1.40, 1.52], [1.10, 1.28],
  [0.88, 1.08], [0.72, 0.92], [0.61, 0.85], [0.54, 0.81],
  [0.48, 0.84], [0.43, 0.89], [0.39, 0.96], [0.36, 1.04],
]
const ES_OPT = 7 // 0-indexed, val minimum

export function EarlyStopPlay({ onDone }: WidgetProps) {
  const [pos, setPos] = useState(0)
  const [stopped, setStopped] = useState<number | null>(null)

  const cur = ES_CURVE[pos] ?? ES_CURVE[ES_CURVE.length - 1]
  const done = stopped !== null

  const doStop = () => { setStopped(pos); }
  const doNext = () => { if (pos < ES_CURVE.length - 1) setPos(p => p + 1) }

  const diff = stopped !== null ? stopped - ES_OPT : null
  const quality = diff !== null ? (Math.abs(diff) <= 1 ? 'perfect' : Math.abs(diff) <= 2 ? 'close' : 'off') : null

  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Training loss always falls. Validation loss tells you when to stop.</p>
      <p className="text-sm text-gray-400 mb-4">Step through training and hit "Stop here!" when you think val loss is at its minimum.</p>

      {/* mini loss chart */}
      <div className="relative h-32 border border-gray-800 rounded-xl bg-gray-950 mb-4 overflow-hidden px-3 py-2">
        <div className="absolute top-2 right-3 flex gap-3 text-[9px] font-mono">
          <span className="text-sky-400">— train</span>
          <span className="text-orange-400">— val</span>
        </div>
        <svg className="w-full h-full" viewBox="0 0 260 100" preserveAspectRatio="none">
          {/* train loss line */}
          <polyline fill="none" stroke="#38bdf8" strokeWidth="1.5"
            points={ES_CURVE.slice(0, pos + 1).map((p, i) => `${(i / 11) * 240 + 10},${p[0] * 35}`).join(' ')} />
          {/* val loss line */}
          <polyline fill="none" stroke="#fb923c" strokeWidth="1.5"
            points={ES_CURVE.slice(0, pos + 1).map((p, i) => `${(i / 11) * 240 + 10},${p[1] * 35}`).join(' ')} />
          {/* optimal marker */}
          {stopped !== null && (
            <line x1={((ES_OPT / 11) * 240 + 10).toString()} y1="0" x2={((ES_OPT / 11) * 240 + 10).toString()} y2="100"
              stroke="#4ade80" strokeWidth="1" strokeDasharray="3,2" />
          )}
          {/* stopped marker */}
          {stopped !== null && (
            <line x1={((stopped / 11) * 240 + 10).toString()} y1="0" x2={((stopped / 11) * 240 + 10).toString()} y2="100"
              stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3,2" />
          )}
        </svg>
        <p className="absolute bottom-1 left-3 font-mono text-[9px] text-gray-600">step {pos + 1}/12</p>
      </div>

      <div className="flex gap-4 mb-3 font-mono text-sm">
        <span className="text-sky-300">train: {cur[0].toFixed(2)}</span>
        <span className="text-orange-300">val: {cur[1].toFixed(2)}</span>
      </div>

      {!done && (
        <div className="flex gap-3">
          {pos < ES_CURVE.length - 1 && (
            <button onClick={doNext}
              className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-semibold">
              Train one more step →
            </button>
          )}
          <button onClick={doStop}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold">
            Stop here!
          </button>
        </div>
      )}

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <p className={`text-sm font-semibold mb-1 ${quality === 'perfect' ? 'text-emerald-400' : quality === 'close' ? 'text-amber-300' : 'text-red-300'}`}>
            {quality === 'perfect' && `Perfect — step ${stopped! + 1} is right at the val minimum.`}
            {quality === 'close' && `Good — you stopped ${Math.abs(diff!)} step${Math.abs(diff!) > 1 ? 's' : ''} ${(diff! > 0 ? 'after' : 'before')} the optimum.`}
            {quality === 'off' && `Stepped too ${diff! > 0 ? 'far — model overfit' : 'early — left performance on the table'}.`}
          </p>
          <p className="text-sm text-gray-300">Optimal is step {ES_OPT + 1}. After that, train loss keeps falling but val loss creeps back up — the model is memorising the training set. In practice: use a held-out val set, checkpoint every epoch, and restore the best checkpoint.</p>
          <ContinueBtn onClick={onDone} label="Got it, continue" />
        </motion.div>
      )}
    </div>
  )
}

// ── Tier 2: RLHF pipeline ordering ────────────────────────────────────────────

const RLHF_STAGES = ['SFT', 'Reward Model', 'PPO']
const RLHF_WRONG: Record<string, string> = {
  'PPO,SFT,Reward Model': 'RL before supervised training: the policy starts random. The reward model has nothing sensible to score.',
  'Reward Model,SFT,PPO': 'You trained a reward model before the policy even knows how to follow instructions — it scores incoherent outputs.',
  'SFT,PPO,Reward Model': 'PPO needs a reward model to exist first. Without scores, the RL update has no signal.',
  'PPO,Reward Model,SFT': 'Everything is backwards: RL on a random policy, reward model trained before SFT, SFT last.',
  'Reward Model,PPO,SFT': 'Same problem: no SFT baseline, no well-defined outputs for the RM to score.',
}

export function RlhfPipelinePlay({ onDone }: WidgetProps) {
  const [order, setOrder] = useState<string[]>([])
  const done = order.length === 3
  const correct = done && JSON.stringify(order) === JSON.stringify(RLHF_STAGES)
  const wrongMsg = done && !correct ? RLHF_WRONG[order.join(',')] ?? 'Incorrect order — think about what each stage needs as input.' : ''
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">RLHF has three stages that must happen in a strict order.</p>
      <p className="text-sm text-gray-400 mb-4">Tap the stages in the order they should run, earliest first.</p>
      {/* available */}
      <div className="flex gap-3 mb-5">
        {RLHF_STAGES.filter(s => !order.includes(s)).map(s => (
          <button key={s} onClick={() => setOrder(o => [...o, s])}
            className="px-4 py-2.5 rounded-xl border bg-gray-800 border-gray-700 text-gray-200 hover:border-violet-500 font-mono text-sm transition-colors">
            {s}
          </button>
        ))}
      </div>
      {/* sequence slots */}
      <div className="flex gap-3 mb-4">
        {[0,1,2].map(i => (
          <div key={i} className={`flex-1 h-12 flex items-center justify-center rounded-xl border font-mono text-sm
            ${order[i] ? (correct ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200' : done && !correct ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-violet-600/20 border-violet-500 text-violet-200') : 'bg-gray-900 border-gray-800 text-gray-700'}`}>
            {order[i] ?? (i + 1)}
          </div>
        ))}
      </div>
      {done && !correct && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-red-300 mb-3">{wrongMsg}</p>
          <button onClick={() => setOrder([])} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-semibold">
            Try again
          </button>
        </motion.div>
      )}
      {correct && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-emerald-300 mb-1">Correct. The output of each stage feeds the next.</p>
          <p className="text-sm text-gray-300 mb-4">SFT gives the model instruction-following ability. The reward model learns human preferences by comparing SFT outputs. PPO then fine-tunes the SFT model to maximise RM score — with a KL penalty to stay close to the SFT baseline.</p>
          <ContinueBtn onClick={onDone} label="Got it, continue" />
        </motion.div>
      )}
    </div>
  )
}

// ── Tier 3: embedding arithmetic ─────────────────────────────────────────────

interface EAWord { w: string; x: number; y: number; cluster: 'royal'|'animal'|'place' }
const EA_WORDS: EAWord[] = [
  { w: 'king',   x: 82, y: 18, cluster: 'royal' },
  { w: 'queen',  x: 20, y: 18, cluster: 'royal' },
  { w: 'man',    x: 78, y: 72, cluster: 'royal' },
  { w: 'woman',  x: 22, y: 72, cluster: 'royal' },
  { w: 'prince', x: 70, y: 30, cluster: 'royal' },
  { w: 'cat',    x: 20, y: 45, cluster: 'animal' },
  { w: 'dog',    x: 30, y: 55, cluster: 'animal' },
  { w: 'Paris',  x: 50, y: 20, cluster: 'place' },
  { w: 'London', x: 60, y: 28, cluster: 'place' },
  { w: 'Rome',   x: 55, y: 12, cluster: 'place' },
]
const CLUSTER_COLOR: Record<string, string> = {
  royal: '#a78bfa', animal: '#34d399', place: '#f59e0b',
}

export function EmbeddingArithPlay({ onDone }: WidgetProps) {
  const [showArrow, setShowArrow] = useState(false)
  const [tried, setTried] = useState(false)
  const king = EA_WORDS.find(w => w.w === 'king')!
  const man  = EA_WORDS.find(w => w.w === 'man')!
  const woman= EA_WORDS.find(w => w.w === 'woman')!
  const queen= EA_WORDS.find(w => w.w === 'queen')!
  // result point: king.x - man.x + woman.x
  const rx = king.x - man.x + woman.x
  const ry = king.y - man.y + woman.y
  const doArrow = () => { setShowArrow(true); setTried(true) }
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Embeddings encode relationships as directions in space.</p>
      <p className="text-sm text-gray-400 mb-4">The gender axis runs from "man" to "woman". Add that offset to "king" and you land near "queen".</p>
      <div className="relative w-full h-56 border border-gray-800 rounded-xl bg-gray-950 mb-4 overflow-hidden">
        {EA_WORDS.map(w => (
          <div key={w.w} className="absolute text-[11px] font-mono transition-all duration-500"
            style={{ left: `${w.x}%`, top: `${w.y}%`, transform: 'translate(-50%,-50%)', color: CLUSTER_COLOR[w.cluster] }}>
            {w.w}
          </div>
        ))}
        {showArrow && (
          <motion.svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* gender offset arrow on king */}
            <defs><marker id="ah" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 z" fill="#a78bfa"/></marker></defs>
            <line x1={king.x.toString()} y1={king.y.toString()} x2={rx.toFixed(1)} y2={ry.toFixed(1)}
              stroke="#a78bfa" strokeWidth="0.5" strokeDasharray="2,1" markerEnd="url(#ah)" />
            <circle cx={rx.toFixed(1)} cy={ry.toFixed(1)} r="2" fill="#f9a8d4" />
            <text x={(rx + 2).toFixed(1)} y={(ry - 2).toFixed(1)} fontSize="3.5" fill="#f9a8d4" fontFamily="monospace">result ≈ queen</text>
          </motion.svg>
        )}
      </div>
      <p className="text-xs text-gray-600 mb-3">Colors: <span className="text-violet-400">royalty</span> · <span className="text-emerald-400">animals</span> · <span className="text-amber-400">places</span></p>
      {!showArrow && (
        <button onClick={doArrow}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold">
          Compute king − man + woman →
        </button>
      )}
      {showArrow && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-gray-300 mb-3">The arrow lands near "queen" because the model learned that king−man and queen−woman point in roughly the same direction. That direction is the "royalty + male" axis.</p>
          <ContinueBtn onClick={onDone} label="Got it, continue" />
        </motion.div>
      )}
    </div>
  )
}

// ── Tier 3: distillation (teacher soft labels) ────────────────────────────────

const DISTILL_TOKS = ['Paris', 'Lyon', 'Berlin', 'Rome']
const DISTILL_HARD = [1, 0, 0, 0]
const DISTILL_SOFT = [0.85, 0.08, 0.04, 0.03]

export function DistillPlay({ onDone }: WidgetProps) {
  const [mode, setMode] = useState<'hard'|'soft'>('hard')
  const [tried, setTried] = useState<Set<string>>(new Set(['hard']))
  const set = (m: 'hard'|'soft') => { setMode(m); setTried(t => new Set(t).add(m)) }
  const vals = mode === 'hard' ? DISTILL_HARD : DISTILL_SOFT
  const grads = mode === 'hard' ? [0, 0, 0, 0] : DISTILL_SOFT.map((v,i) => i===0 ? 0 : -v)
  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">Training target: "The capital of France is ___"</p>
      <p className="text-sm text-gray-400 mb-4">Hard labels say only Paris=1. A teacher's soft distribution also encodes what it almost said. Toggle and watch the gradient signal.</p>
      <div className="flex gap-3 mb-5">
        <button onClick={() => set('hard')} className={chipCls(mode === 'hard')}>hard label (one-hot)</button>
        <button onClick={() => set('soft')} className={chipCls(mode === 'soft')}>soft labels (teacher)</button>
      </div>
      <div className="grid gap-2 mb-3">
        {DISTILL_TOKS.map((t, i) => (
          <div key={t} className="flex items-center gap-3">
            <div className="w-14 font-mono text-xs text-gray-300">{t}</div>
            <div className="flex-1 h-7 bg-gray-950 rounded overflow-hidden border border-gray-800">
              <motion.div animate={{ width: `${vals[i] * 100}%` }} transition={{ duration: 0.4 }}
                className={`h-full ${i === 0 ? 'bg-emerald-500' : 'bg-violet-500/60'}`} />
            </div>
            <div className="w-10 text-right font-mono text-xs text-gray-400">{vals[i].toFixed(2)}</div>
            {mode === 'soft' && i > 0 && (
              <div className="w-16 font-mono text-[10px] text-orange-300">grad {grads[i].toFixed(2)}</div>
            )}
            {mode === 'hard' && i > 0 && (
              <div className="w-16 font-mono text-[10px] text-gray-700">grad 0</div>
            )}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-300 min-h-14">
        {mode === 'hard'
          ? 'Hard labels: the model learns Paris is right, nothing about Lyon or Berlin. Zero gradient on wrong answers means zero knowledge transfer about geographic relationships.'
          : 'Soft labels: Lyon and Berlin get tiny positive probability. The student sees that the teacher "almost said" Lyon — learning that Lyon is also a French city, just not the capital. That relational knowledge transfers even though it never appears as a correct answer.'}
      </p>
      {tried.size >= 2
        ? <ContinueBtn onClick={onDone} label="Got it, continue" />
        : <p className="mt-3 text-xs text-gray-500">Try both modes.</p>}
    </div>
  )
}

// ── Tier 3: agents and tool use ────────────────────────────────────────────────

interface AgentRound { question: string; options: { label: string; ok: boolean; result?: string; why: string }[] }
const AGENT_ROUNDS: AgentRound[] = [
  {
    question: 'Q: "What is 15% of 847?" — what should the model do?',
    options: [
      { label: 'Answer directly ("about 127")', ok: false, why: 'LLMs are unreliable at arithmetic. The model will guess — and 124 ≠ 127.05. Use a tool for deterministic computation.' },
      { label: 'Call calculator: 847 × 0.15', ok: true, result: 'calculator → 127.05', why: 'Correct. Arithmetic is deterministic, tool call is free, and the result is exact. Tools are not optional for this class of query.' },
    ],
  },
  {
    question: 'Tool returned 127.05. What next?',
    options: [
      { label: 'Return the answer: "15% of 847 is 127.05"', ok: true, why: 'The tool gave a verified result. Return it. No need to second-guess a calculator.' },
      { label: 'Run the calculation again to double-check', ok: false, why: 'Deterministic tools give the same result every time. Calling again wastes a turn. Reserve re-checking for tools that can return stale or probabilistic results (e.g. a web search).' },
    ],
  },
]

export function AgentPlay({ onDone }: WidgetProps) {
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState<number|null>(null)
  const [history, setHistory] = useState<{q:string; choice:string; ok:boolean; result?:string}[]>([])
  const cur = AGENT_ROUNDS[round]
  const done = round >= AGENT_ROUNDS.length

  const choose = (i: number) => {
    if (picked !== null) return
    const opt = cur.options[i]
    setPicked(i)
    if (opt.ok) {
      const entry = { q: cur.question, choice: opt.label, ok: true, result: opt.result }
      setTimeout(() => {
        setHistory(h => [...h, entry])
        setPicked(null)
        setRound(r => r + 1)
      }, 1200)
    }
  }

  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">An agent loops: think → act → observe → think.</p>
      <p className="text-sm text-gray-400 mb-4">Guide the model through a two-step tool-use scenario. Pick the right action each turn.</p>

      {/* history */}
      {history.map((h, i) => (
        <div key={i} className="mb-3 p-3 rounded-xl border bg-gray-900 border-gray-800 text-xs font-mono">
          <p className="text-gray-500 mb-1">{h.q}</p>
          <p className="text-violet-300">▶ {h.choice}</p>
          {h.result && <p className="text-emerald-300 mt-1">⟵ {h.result}</p>}
        </div>
      ))}

      {!done && (
        <div>
          <p className="text-sm text-gray-200 mb-3">{cur.question}</p>
          <div className="grid gap-3">
            {cur.options.map((opt, i) => {
              const isWrong = picked === i && !opt.ok
              const isRight = picked === i && opt.ok
              return (
                <motion.button key={i} onClick={() => choose(i)}
                  animate={isWrong ? { x: [0,-8,8,-5,5,0] } : {}} transition={{ duration: 0.35 }}
                  className={`px-4 py-3 rounded-xl border text-left text-sm transition-colors
                    ${isRight ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                    : isWrong ? 'bg-red-900/20 border-red-700 text-red-300'
                    : 'bg-gray-800/60 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
                  {opt.label}
                </motion.button>
              )
            })}
          </div>
          {picked !== null && !cur.options[picked].ok && (
            <p className="mt-3 text-sm text-amber-300">{cur.options[picked].why}</p>
          )}
        </div>
      )}

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-3 rounded-xl border bg-emerald-950/30 border-emerald-800 text-xs font-mono mb-3">
            <p className="text-emerald-300">✓ Final answer: "15% of 847 is 127.05"</p>
          </div>
          <p className="text-sm text-gray-300 mb-1">Two decisions, both correct. In production, agents do this in a loop — often 5–30 turns — using a scratchpad of tool calls, observations, and partial reasoning until they have enough context to commit.</p>
          <ContinueBtn onClick={onDone} label="Got it, continue" />
        </motion.div>
      )}
    </div>
  )
}
