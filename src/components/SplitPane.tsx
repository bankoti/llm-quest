import { useEffect, useRef, useState, type ReactNode } from 'react'

const MIN_PCT = 15
const MAX_PCT = 75
const DEFAULT_PCT = 40

interface Props {
  storageKey: string
  left: ReactNode
  right: ReactNode
}

/**
 * Two-pane horizontal split with a draggable divider.
 * - Drag the divider to resize; the ratio persists per browser.
 * - Double-click the divider to reset to the default split.
 * - The chevron button collapses the left pane entirely so the code
 *   editor can take the whole width (and back).
 * Pointer capture keeps the drag alive even when the cursor crosses
 * the Monaco editor, which otherwise swallows mouse events.
 */
export function SplitPane({ storageKey, left, right }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState<number>(() => {
    const saved = Number(localStorage.getItem(storageKey))
    return saved >= MIN_PCT && saved <= MAX_PCT ? saved : DEFAULT_PCT
  })
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(`${storageKey}:collapsed`) === '1',
  )
  const [dragging, setDragging] = useState(false)

  useEffect(() => { localStorage.setItem(storageKey, String(pct)) }, [pct, storageKey])
  useEffect(() => {
    localStorage.setItem(`${storageKey}:collapsed`, collapsed ? '1' : '0')
  }, [collapsed, storageKey])

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (collapsed) return
    e.preventDefault()
    // Capture can throw for synthetic or already-released pointers; the drag
    // still works without it, capture just keeps events flowing over Monaco.
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* noop */ }
    setDragging(true)
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const raw = ((e.clientX - rect.left) / rect.width) * 100
    setPct(Math.min(MAX_PCT, Math.max(MIN_PCT, raw)))
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* noop */ }
    setDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-1 min-h-0"
      style={dragging ? { userSelect: 'none', cursor: 'col-resize' } : undefined}
    >
      {!collapsed && (
        <div style={{ width: `${pct}%` }} className="shrink-0 overflow-hidden">
          {left}
        </div>
      )}

      {/* Divider */}
      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => { setCollapsed(false); setPct(DEFAULT_PCT) }}
        title={collapsed ? '' : 'Drag to resize · double-click to reset'}
        className={`relative shrink-0 w-1.5 group transition-colors
                    ${collapsed ? 'bg-gray-800' : 'cursor-col-resize bg-gray-800 hover:bg-violet-600'}
                    ${dragging ? 'bg-violet-500' : ''}`}
      >
        {/* Wider invisible hit area so the divider is easy to grab */}
        {!collapsed && <div className="absolute inset-y-0 -left-1.5 -right-1.5" />}
        <button
          onPointerDown={e => e.stopPropagation()}
          onDoubleClick={e => e.stopPropagation()}
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Show lesson' : 'Hide lesson: full-width editor'}
          className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10
                     w-5 h-10 rounded-md border border-gray-700 bg-gray-900 text-gray-400
                     hover:text-white hover:border-violet-500 transition-colors
                     flex items-center justify-center text-[10px] font-mono cursor-pointer"
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        {right}
      </div>
    </div>
  )
}
