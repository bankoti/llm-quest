import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLevel } from '@/data/curriculum'
import { INTERACTIVE_LESSONS } from './curriculum'
import { WARMUPS, markWarmupDone } from './warmups'
import { StepMcq, StepNumeric, StepPredict } from './InteractiveLessonPage'
import type { McqStep, NumericStep, PredictStep, Step, WorkedStep } from './types'

export function WarmupPage() {
  const { levelId } = useParams<{ levelId: string }>()
  const level = levelId ? getLevel(levelId) : undefined
  const lesson = levelId ? INTERACTIVE_LESSONS.find(l => l.slug === WARMUPS[levelId]) : undefined
  const concept = lesson?.steps.find(s => s.kind === 'concept')
  const worked = lesson?.steps.find((s): s is WorkedStep => s.kind === 'worked')
  const check = lesson?.steps.find((s): s is McqStep | PredictStep | NumericStep => s.kind === 'mcq' || s.kind === 'predict' || s.kind === 'numeric')
  const stages: ('concept'|'worked'|'check')[] = [concept && 'concept', worked && 'worked', check && 'check'].filter(Boolean) as ('concept'|'worked'|'check')[]
  const [pos, setPos] = useState(0)
  const done = pos >= stages.length

  if (!level || !lesson || !concept || !check) return <div className="min-h-screen bg-gray-950 text-white grid place-items-center px-6"><div><p>Warm-up unavailable.</p><Link to="/map" className="text-violet-400">Back to map</Link></div></div>
  const finish = () => { markWarmupDone(level.id); setPos(stages.length) }
  const advance = () => pos + 1 >= stages.length ? finish() : setPos(p => p + 1)
  const stage = stages[pos]

  return <div className="min-h-screen bg-gray-950 text-gray-100 px-6 py-8">
    <div className="max-w-lg mx-auto">
      <header className="mb-8">
        <Link to={`/level/${level.id}`} className="text-sm text-gray-500 hover:text-white">← {level.title}</Link>
        <div className="flex items-center gap-3 mt-5"><div className="flex-1 flex gap-1">{stages.map((_,i)=><div key={i} className={`h-2 flex-1 rounded-full ${i<=pos?'bg-violet-500':'bg-gray-800'}`}/>)}</div><span className="text-xs font-mono text-gray-500">{Math.min(pos+1,stages.length)}/{stages.length}</span></div>
        <p className="mt-4 text-xs font-mono uppercase tracking-widest text-violet-400">Just-in-time warm-up · ~3–5 min</p>
        <h1 className="text-2xl font-bold mt-1">Before you code: {lesson.title}</h1>
        <p className="text-sm text-gray-400 mt-2">This refresher stands alone. It does not require completing the full concept course.</p>
      </header>

      {done ? <div className="text-center py-10"><div className="text-5xl mb-4">⚡</div><h2 className="text-2xl font-bold">Ready to apply it</h2><p className="text-gray-400 mt-2 mb-7">The mechanism is fresh. Now make it pass a real test.</p><Link to={`/level/${level.id}`} className="inline-block px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold">Open {level.title} →</Link></div>
      : stage === 'concept' ? <div><h2 className="text-xl font-bold mb-4">{concept.title}</h2>{concept.lines.slice(0,3).map((x,i)=><p key={i} className="text-gray-300 leading-relaxed mb-3">{x}</p>)}{concept.code&&<pre className="p-3 rounded-lg bg-gray-900 text-sky-300 overflow-x-auto">{concept.code}</pre>}<button onClick={advance} className="mt-6 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold">See one example</button></div>
      : stage === 'worked' && worked ? <div><p className="text-xs font-mono text-amber-400 uppercase tracking-wider">Worked example</p><h2 className="text-xl font-bold mt-1 mb-2">{worked.title}</h2><p className="text-gray-400 mb-5">{worked.prompt}</p><ol className="space-y-4 border-l-2 border-gray-800 pl-4">{worked.stages.map((x,i)=><li key={i}><p className="text-xs font-mono text-violet-400">{i+1}. {x.label}</p><p className="text-sm text-gray-300 mt-1">{x.body}</p>{x.code&&<pre className="mt-2 p-3 rounded bg-gray-900 text-sky-300 overflow-x-auto">{x.code}</pre>}</li>)}</ol><p className="mt-5 text-sm text-emerald-300">{worked.takeaway}</p><button onClick={advance} className="mt-6 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold">Try one</button></div>
      : check.kind === 'mcq' ? <StepMcq step={check} showConfidence={false} onDone={advance as never}/>
      : check.kind === 'numeric' ? <StepNumeric step={check} onDone={advance as never}/>
      : <StepPredict step={check} onDone={advance as never}/>} 
    </div>
  </div>
}
