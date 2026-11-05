// One authored unit supplies interactive prose, coding lesson, and notebook.
import { createServer } from 'vite'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const server = await createServer({ root, server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  const { EXPANSION_TRACKS } = await server.ssrLoadModule('/src/data/expansion/index.ts')
  const result = spawnSync(process.env.PYTHON ?? 'python3', ['scripts/build_expansion_notebooks.py', ...process.argv.slice(2)], {
    cwd: root, input: JSON.stringify(EXPANSION_TRACKS), encoding: 'utf8', maxBuffer: 50 * 1024 * 1024,
  })
  process.stdout.write(result.stdout ?? '')
  process.stderr.write(result.stderr ?? '')
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
} finally {
  await server.close()
}
