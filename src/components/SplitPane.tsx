import { useEffect, useRef, useState, type ReactNode } from 'react'
const MIN_PCT=15, MAX_PCT=75, DEFAULT_PCT=40
interface Props { storageKey:string; left:ReactNode; right:ReactNode }
export function SplitPane({ storageKey,left,right }:Props) {
  const containerRef=useRef<HTMLDivElement>(null)
  const [pct,setPct]=useState(()=>{const n=Number(localStorage.getItem(storageKey));return n>=MIN_PCT&&n<=MAX_PCT?n:DEFAULT_PCT})
  const [collapsed,setCollapsed]=useState(()=>localStorage.getItem(`${storageKey}:collapsed`)==='1')
  const [dragging,setDragging]=useState(false)
  const [mobileTab,setMobileTab]=useState<'lesson'|'code'>('lesson')
  useEffect(()=>localStorage.setItem(storageKey,String(pct)),[pct,storageKey])
  useEffect(()=>localStorage.setItem(`${storageKey}:collapsed`,collapsed?'1':'0'),[collapsed,storageKey])
  function down(e:React.PointerEvent<HTMLDivElement>){if(collapsed)return;e.preventDefault();try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}setDragging(true)}
  function move(e:React.PointerEvent<HTMLDivElement>){if(!dragging||!containerRef.current)return;const r=containerRef.current.getBoundingClientRect();setPct(Math.min(MAX_PCT,Math.max(MIN_PCT,((e.clientX-r.left)/r.width)*100)))}
  function up(e:React.PointerEvent<HTMLDivElement>){try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}setDragging(false)}
  function key(e:React.KeyboardEvent<HTMLDivElement>){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setCollapsed(false);setPct(p=>Math.min(MAX_PCT,Math.max(MIN_PCT,p+(e.key==='ArrowRight'?5:-5))))}if(e.key==='Home'){setCollapsed(false);setPct(MIN_PCT)}if(e.key==='End'){setCollapsed(false);setPct(MAX_PCT)}}
  return <div className="flex flex-1 min-h-0 flex-col md:flex-row" ref={containerRef} style={dragging?{userSelect:'none',cursor:'col-resize'}:undefined}>
    <div className="md:hidden flex border-b border-gray-800" role="tablist" aria-label="Level workspace">
      {(['lesson','code'] as const).map(t=><button key={t} role="tab" aria-selected={mobileTab===t} onClick={()=>setMobileTab(t)} className={`flex-1 py-3 text-sm font-mono capitalize ${mobileTab===t?'text-violet-300 border-b-2 border-violet-500':'text-gray-500'}`}>{t}</button>)}
    </div>
    {!collapsed&&<div style={{width:`${pct}%`}} className={`${mobileTab==='lesson'?'block':'hidden'} md:block md:shrink-0 overflow-hidden flex-1 md:flex-none min-h-0`}>{left}</div>}
    <div role="separator" tabIndex={0} aria-label="Resize lesson and code panes" aria-orientation="vertical" aria-valuemin={MIN_PCT} aria-valuemax={MAX_PCT} aria-valuenow={collapsed?0:Math.round(pct)} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onDoubleClick={()=>{setCollapsed(false);setPct(DEFAULT_PCT)}} className={`hidden md:block relative shrink-0 w-1.5 group transition-colors ${collapsed?'bg-gray-800':'cursor-col-resize bg-gray-800 hover:bg-violet-600'} ${dragging?'bg-violet-500':''}`}>
      {!collapsed&&<div className="absolute inset-y-0 -left-1.5 -right-1.5"/>}
      <button onPointerDown={e=>e.stopPropagation()} onDoubleClick={e=>e.stopPropagation()} onClick={()=>setCollapsed(c=>!c)} aria-label={collapsed?'Show lesson':'Hide lesson for full-width editor'} className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10 w-6 h-11 rounded-md border border-gray-700 bg-gray-900 text-gray-400 hover:text-white hover:border-violet-500 flex items-center justify-center text-xs">{collapsed?'»':'«'}</button>
    </div>
    <div className={`${mobileTab==='code'?'flex':'hidden'} md:flex flex-1 min-w-0 overflow-hidden min-h-0`}>{right}</div>
  </div>
}
