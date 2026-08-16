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
