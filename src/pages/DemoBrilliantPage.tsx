// Brilliant-style interactive demo of c1-l1 (Tensors & Shapes).
// Standalone experiment: reachable only at /demo, touches no engine state,
// no progress writes, nothing on the map links here.
//
// Mechanics borrowed from brilliant.org:
//   - one idea per screen, segmented progress bar
//   - tap-first checks with instant feedback, no typing
//   - wrong answers are gentle: shake, nudge, retry without penalty
//   - manipulatives you play with (axis collapse, slice explorer)
//   - commit-then-reveal prediction, in-session streak, end summary
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

// ── tiny building blocks ─────────────────────────────────────────────────────

function Cell({ v, hot, dim }: { v: string | number; hot?: boolean; dim?: boolean }) {
  return (
    <div className={`w-9 h-9 flex items-center justify-center rounded-md font-mono text-xs border transition-all duration-300
      ${hot ? 'bg-violet-600 border-violet-400 text-white scale-105' : dim ? 'bg-gray-900 border-gray-800 text-gray-700' : 'bg-gray-800 border-gray-700 text-gray-200'}`}>
      {v}
    </div>
  )
}

function Shape({ s }: { s: string }) {
  return <span className="font-mono text-emerald-400">{s}</span>
}

function ContinueBtn({ onClick, label = 'Continue' }: { onClick: () => void; label?: string }) {
  return (
    <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="mt-6 px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/40">
      {label}
    </motion.button>
  )
}

// ── MCQ: tap an option, instant feedback, retry on wrong ────────────────────

interface McqProps {
  prompt: string
  code?: string
  options: string[]
  answer: number
  explain: string
  nudge: string
  onDone: (firstTry: boolean) => void
}

function Mcq({ prompt, code, options, answer, explain, nudge, onDone }: McqProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const [wrongOnes, setWrongOnes] = useState<number[]>([])
  const solved = picked === answer

  const pick = (i: number) => {
    if (solved) return
    setPicked(i)
    if (i !== answer) setWrongOnes(w => (w.includes(i) ? w : [...w, i]))
  }

  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-3">{prompt}</p>
      {code && (
        <pre className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4 font-mono text-sm text-sky-300 overflow-x-auto">{code}</pre>
      )}
      <div className="grid gap-3">
        {options.map((o, i) => {
          const isWrong = wrongOnes.includes(i)
          const isRight = solved && i === answer
          return (
            <motion.button key={i} onClick={() => pick(i)}
              animate={picked === i && isWrong ? { x: [0, -8, 8, -5, 5, 0] } : {}}
              transition={{ duration: 0.35 }}
              disabled={solved}
              className={`px-4 py-3 rounded-xl border text-left font-mono text-sm transition-colors
                ${isRight ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : isWrong ? 'bg-red-900/20 border-red-800 text-red-300'
                : 'bg-gray-800/60 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
              {o}
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence>
        {picked !== null && !solved && (
          <motion.p key={'n' + picked} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-4 text-sm text-amber-300">{nudge} Try again, no penalty.</motion.p>
        )}
        {solved && (
          <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <p className="text-sm text-emerald-300 font-semibold">Correct.</p>
            <p className="text-sm text-gray-300 mt-1">{explain}</p>
            <ContinueBtn onClick={() => onDone(wrongOnes.length === 0)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── manipulative 1: axis collapse on a (3, 4) matrix ─────────────────────────

const M = [
  [2, 7, 1, 4],
  [5, 3, 8, 2],
  [1, 6, 2, 9],
]
const colSums = [8, 16, 11, 15]
const rowSums = [14, 18, 18]

function AxisPlay({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'none' | 'a0' | 'a1'>('none')
  const [tried, setTried] = useState<Set<string>>(new Set())
  const try_ = (m: 'a0' | 'a1') => { setMode(m); setTried(t => new Set(t).add(m)) }

  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">M has shape <Shape s="(3, 4)" />. Press both buttons and watch which axis disappears.</p>
      <p className="text-sm text-gray-400 mb-4">The axis you name is the one that vanishes.</p>
      <div className="flex gap-3 mb-5">
        <button onClick={() => try_('a0')}
          className={`px-4 py-2 rounded-lg font-mono text-sm border ${mode === 'a0' ? 'bg-violet-600 border-violet-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
          M.sum(axis=0)
        </button>
        <button onClick={() => try_('a1')}
          className={`px-4 py-2 rounded-lg font-mono text-sm border ${mode === 'a1' ? 'bg-violet-600 border-violet-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
          M.sum(axis=1)
        </button>
      </div>
      <div className="flex items-start gap-6">
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
      </div>
      <div className="mt-4 h-6 font-mono text-sm">
        {mode === 'a0' && <span className="text-gray-300">rows collapsed: shape <Shape s="(4,)" />, one sum per column</span>}
        {mode === 'a1' && <span className="text-gray-300">columns collapsed: shape <Shape s="(3,)" />, one sum per row</span>}
      </div>
      {tried.size === 2 && <ContinueBtn onClick={onDone} label="Got it, continue" />}
      {tried.size < 2 && <p className="mt-6 text-xs text-gray-500">Try {tried.size === 0 ? 'both buttons' : 'the other button'} to continue.</p>}
    </div>
  )
}

// ── manipulative 2: slice explorer on x with shape (2, 4, 3) ─────────────────

type SliceKey = 'x[0]' | 'x[:, 0]' | 'x[:, :, 0]' | 'x[:, -2:, :]'
const SLICES: { key: SliceKey; shape: string; hit: (b: number, t: number, c: number) => boolean; read: string }[] = [
  { key: 'x[0]',         shape: '(4, 3)',    hit: b => b === 0,          read: 'first sequence only; the B axis is gone' },
  { key: 'x[:, 0]',      shape: '(2, 3)',    hit: (_b, t) => t === 0,    read: 'first position of every sequence; the T axis is gone' },
  { key: 'x[:, :, 0]',   shape: '(2, 4)',    hit: (_b, _t, c) => c === 0, read: 'first channel everywhere; the C axis is gone' },
  { key: 'x[:, -2:, :]', shape: '(2, 2, 3)', hit: (_b, t) => t >= 2,     read: 'last two positions; negative indices count from the end' },
]

function SlicePlay({ onDone }: { onDone: () => void }) {
  const [active, setActive] = useState<SliceKey | null>(null)
  const [tried, setTried] = useState<Set<SliceKey>>(new Set())
  const cur = SLICES.find(s => s.key === active)
  const try_ = (k: SliceKey) => { setActive(k); setTried(t => new Set(t).add(k)) }

  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-1">x has shape <Shape s="(B=2, T=4, C=3)" />. Tap a slice; lit cells survive.</p>
      <p className="text-sm text-gray-400 mb-4">B sequences, T positions, C channels. A colon keeps the whole axis.</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {SLICES.map(s => (
          <button key={s.key} onClick={() => try_(s.key)}
            className={`px-3 py-2 rounded-lg font-mono text-xs border ${active === s.key ? 'bg-violet-600 border-violet-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
            {s.key}
          </button>
        ))}
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
      {tried.size >= 3 && <ContinueBtn onClick={onDone} label="Got it, continue" />}
      {tried.size < 3 && <p className="mt-6 text-xs text-gray-500">Explore at least 3 slices to continue ({tried.size}/3).</p>}
    </div>
  )
}

// ── commit-then-reveal: predict two results ──────────────────────────────────

function Predict({ onDone }: { onDone: (firstTryBoth: boolean) => void }) {
  const qs = useMemo(() => ([
    { label: 'a + b', options: ['(2, 2)', '(2,)', 'error: shapes differ'], answer: 0,
      reveal: 'b stretches across both rows: [[11, 22], [13, 24]]. Broadcasting fills the missing axis.' },
    { label: 'a @ b', options: ['(2, 2)', '(2,)', 'error: shapes differ'], answer: 1,
      reveal: 'b acts as a column: [1*10 + 2*20, 3*10 + 4*20] = [50, 110]. Matmul eats the inner axis.' },
  ]), [])
  const [picks, setPicks] = useState<(number | null)[]>([null, null])
  const [misses, setMisses] = useState(0)
  const done = picks.every((p, i) => p === qs[i].answer)

  return (
    <div className="w-full max-w-lg">
      <p className="text-lg text-gray-100 mb-3">Commit before you reveal. Predict both result shapes.</p>
      <pre className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4 font-mono text-sm text-sky-300">{`a = [[1., 2.], [3., 4.]]   # (2, 2)
b = [10., 20.]             # (2,)`}</pre>
      {qs.map((q, qi) => (
        <div key={qi} className="mb-4">
          <p className="font-mono text-sm text-gray-200 mb-2">{q.label} <span className="text-gray-500">-&gt; ?</span></p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((o, oi) => {
              const isPick = picks[qi] === oi
              const isRight = isPick && oi === q.answer
              const isWrong = isPick && oi !== q.answer
              return (
                <button key={oi}
                  onClick={() => {
                    if (picks[qi] === q.answer) return
                    if (oi !== q.answer) setMisses(m => m + 1)
                    setPicks(p => p.map((v, i) => (i === qi ? oi : v)))
                  }}
                  className={`px-3 py-2 rounded-lg font-mono text-xs border
                    ${isRight ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : isWrong ? 'bg-red-900/20 border-red-800 text-red-300'
                    : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-violet-500'}`}>
                  {o}
                </button>
              )
            })}
          </div>
          {picks[qi] === q.answer && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-gray-400">{q.reveal}</motion.p>
          )}
          {picks[qi] !== null && picks[qi] !== q.answer && (
            <p className="mt-2 text-xs text-amber-300">Not quite. Which axis survives? Try again.</p>
          )}
        </div>
      ))}
      {done && <ContinueBtn onClick={() => onDone(misses === 0)} />}
    </div>
  )
}

// ── concept cards ─────────────────────────────────────────────────────────────

function Concept({ title, lines, children, onDone }: { title: string; lines: string[]; children?: React.ReactNode; onDone: () => void }) {
  return (
    <div className="w-full max-w-lg">
      <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
      {lines.map((l, i) => <p key={i} className="text-gray-300 mb-2 leading-relaxed">{l}</p>)}
      {children}
      <ContinueBtn onClick={onDone} label="Show me" />
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 9
const SCORED = 5

export function DemoBrilliantPage() {
  const [step, setStep] = useState(0)
  const [firstTries, setFirstTries] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  const next = () => setStep(s => s + 1)
  const scored = (firstTry: boolean) => {
    if (firstTry) {
      setFirstTries(n => n + 1)
      setStreak(s => { const ns = s + 1; setBestStreak(b => Math.max(b, ns)); return ns })
    } else setStreak(0)
    next()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center px-6 py-8">
      {/* header: progress segments + streak */}
      <div className="w-full max-w-lg flex items-center gap-3 mb-10">
        <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm shrink-0">✕</Link>
        <div className="flex-1 flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors duration-500 ${i < step ? 'bg-violet-500' : i === step ? 'bg-violet-800' : 'bg-gray-800'}`} />
          ))}
        </div>
        <span className={`font-mono text-sm shrink-0 ${streak > 0 ? 'text-orange-400' : 'text-gray-600'}`}>🔥 {streak}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}
          className="w-full flex justify-center">
          {step === 0 && (
            <Concept title="Think in shapes" onDone={next}
              lines={[
                'Every bug in this course shows up first as a wrong shape. Predict shapes before running code and you get a free debugger for everything that follows.',
                'This is a 3 minute interactive warm-up for the real level. No code yet, just your intuition.',
              ]}>
              <div className="flex items-end gap-6 my-5">
                <div><p className="text-[10px] font-mono text-gray-500 mb-1">scalar ()</p><Cell v="3" /></div>
                <div><p className="text-[10px] font-mono text-gray-500 mb-1">vector (3,)</p><div className="flex gap-1.5">{[1, 2, 3].map(v => <Cell key={v} v={v} />)}</div></div>
                <div><p className="text-[10px] font-mono text-gray-500 mb-1">matrix (2, 3)</p><div className="grid gap-1.5">{[[4, 5, 6], [7, 8, 9]].map((r, i) => <div key={i} className="flex gap-1.5">{r.map(v => <Cell key={v} v={v} />)}</div>)}</div></div>
              </div>
            </Concept>
          )}
          {step === 1 && (
            <Mcq
              prompt="A shape lists how many steps each index can take, outermost first. What is the shape here?"
              code={'t = [[1, 2],\n     [3, 4],\n     [5, 6]]'}
              options={['(3, 2)', '(2, 3)', '(6,)', '(3, 3)']}
              answer={0}
              explain="Three rows, then two columns per row. Outermost axis first is the whole convention."
              nudge="Count the outer brackets first: how many rows?"
              onDone={scored}
            />
          )}
          {step === 2 && <AxisPlay onDone={next} />}
          {step === 3 && (
            <Mcq
              prompt="No grid this time. M has shape (5, 7). What shape is M.sum(axis=1)?"
              options={['(5,)', '(7,)', '(5, 7)', '(1, 7)']}
              answer={0}
              explain="The axis you name disappears. Axis 1 is the 7 columns, so 5 row-sums remain."
              nudge="Which axis did you name? That one vanishes."
              onDone={scored}
            />
          )}
          {step === 4 && (
            <Concept title="Batches: (B, T, C)" onDone={next}
              lines={[
                'Real model tensors carry three axes: B sequences per batch, T token positions, C channels describing each position.',
                'Slicing picks out pieces, and every slice has a predictable shape. Play with one.',
              ]} />
          )}
          {step === 5 && <SlicePlay onDone={next} />}
          {step === 6 && (
            <Mcq
              prompt="Reshape never invents numbers; it only rearranges them. x has shape (2, 3, 4), so 24 values. Which reshape is impossible?"
              options={['x.reshape(4, 7)', 'x.reshape(6, 4)', 'x.reshape(24,)', 'x.reshape(2, 12)']}
              answer={0}
              explain="4 x 7 = 28 slots for 24 values. Every legal reshape multiplies out to exactly 24."
              nudge="Multiply each pair out. Which one is not 24?"
              onDone={scored}
            />
          )}
          {step === 7 && <Predict onDone={scored} />}
          {step === 8 && (
            <div className="w-full max-w-lg text-center">
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                <p className="text-5xl mb-4">🏆</p>
                <h2 className="text-2xl font-bold text-white mb-2">Warm-up complete</h2>
                <p className="text-gray-300 mb-1">{firstTries} of {SCORED} checks on the first try. Best streak: {bestStreak} 🔥</p>
                <p className="text-gray-400 text-sm mb-8">You just used every idea the real level grades: shapes, axis collapse, slicing, reshape arithmetic, broadcasting, and matmul.</p>
              </motion.div>
              <div className="flex justify-center gap-4">
                <Link to="/level/c1-l1" className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Take on the real level</Link>
                <button onClick={() => { setStep(0); setFirstTries(0); setStreak(0); setBestStreak(0) }}
                  className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold">Replay</button>
              </div>
              <p className="mt-10 text-xs text-gray-600">Demo only: nothing here writes progress or XP.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
