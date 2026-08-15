// Pyodide loader — loads once, shared across all challenge runs.
// numpy is loaded eagerly (needed by all C1-3 challenges).
// mini_llm is loaded lazily when a C4-8 level starts.

declare global {
  interface Window {
    loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInterface>
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>
  loadPackage: (pkgs: string[]) => Promise<void>
  globals: { set: (k: string, v: unknown) => void }
  pyimport: (mod: string) => unknown
}

let pyodideInstance: PyodideInterface | null = null
let loadingPromise: Promise<PyodideInterface> | null = null

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => {
      s.remove() // leave no dead tag behind, so a retry re-injects
      reject(new Error(`Failed to load ${src}`))
    }
    document.head.appendChild(s)
  })
}

export async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    await injectScript(`${PYODIDE_CDN}pyodide.js`)
    const py = await window.loadPyodide({ indexURL: PYODIDE_CDN })
    await py.loadPackage(['numpy'])
    pyodideInstance = py
    return py
  })().catch(e => {
    // Do not cache a failed load: reset so the next Run retries the CDN.
    loadingPromise = null
    throw e
  })

  return loadingPromise
}

export interface RunResult {
  ok: boolean
  output: string      // captured stdout (includes print statements)
  error?: string      // assertion or runtime error message
  durationMs: number
}

// Run user code, capturing stdout/stderr, returning structured result.
// The challenge test code is APPENDED to user code and runs in the same namespace.
export async function runChallenge(
  userCode: string,
  testCode: string,
): Promise<RunResult> {
  const py = await getPyodide()
  const fullCode = `${userCode}\n\n${testCode}`
  py.globals.set('_challenge_code', fullCode)

  const t0 = performance.now()
  try {
    // NOTE: return JSON string, not a Python dict — a dict crosses the JS
    // bridge as a PyProxy whose properties are NOT plain JS fields.
    const result = await py.runPythonAsync(`
import io, json
from contextlib import redirect_stdout, redirect_stderr

_out = io.StringIO()
_err = io.StringIO()
_ok = True
_error_msg = None

try:
    with redirect_stdout(_out), redirect_stderr(_err):
        exec(_challenge_code, {})
except AssertionError as e:
    _ok = False
    _error_msg = f"Assertion failed: {e}" if str(e) else "Assertion failed — check your implementation."
except Exception as e:
    _ok = False
    _error_msg = f"{type(e).__name__}: {e}"

json.dumps({"ok": _ok, "output": _out.getvalue(), "error": _error_msg})
`)
    const durationMs = performance.now() - t0
    const r = JSON.parse(String(result)) as { ok: boolean; output: string; error: string | null }
    return { ok: r.ok, output: r.output, error: r.error ?? undefined, durationMs }
  } catch (e) {
    return { ok: false, output: '', error: String(e), durationMs: performance.now() - t0 }
  }
}
