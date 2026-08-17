// ZeroOne funnel beacon — Cloudflare Worker.
// POST /e            {e: <event>, id: <levelOrLessonId>}  → increments a per-day KV counter
// GET  /stats?key=…  dumps all counters as JSON (STATS_KEY secret guards it)
//
// Counters are KV read-modify-write, which can drop increments under
// concurrent writes. At course-site traffic that error is noise; if it ever
// matters, move the counter to a Durable Object.

const EVENTS = ['level_start', 'level_complete', 'lesson_start', 'lesson_complete']

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    }
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    if (req.method === 'POST' && url.pathname === '/e') {
      let b
      try { b = await req.json() } catch { return new Response('bad json', { status: 400, headers: cors }) }
      if (!EVENTS.includes(b?.e) || typeof b?.id !== 'string' || b.id.length === 0 || b.id.length > 40) {
        return new Response('bad event', { status: 400, headers: cors })
      }
      const day = new Date().toISOString().slice(0, 10)
      const key = `${day}:${b.e}:${b.id.replace(/[^\w.-]/g, '')}`
      const cur = parseInt((await env.COUNTS.get(key)) ?? '0', 10)
      await env.COUNTS.put(key, String(cur + 1))
      return new Response('ok', { headers: cors })
    }

    if (req.method === 'GET' && url.pathname === '/stats') {
      if (!env.STATS_KEY || url.searchParams.get('key') !== env.STATS_KEY) {
        return new Response('forbidden', { status: 403, headers: cors })
      }
      const out = {}
      let cursor
      do {
        const page = await env.COUNTS.list({ cursor })
        for (const k of page.keys) out[k.name] = parseInt((await env.COUNTS.get(k.name)) ?? '0', 10)
        cursor = page.list_complete ? undefined : page.cursor
      } while (cursor)
      return new Response(JSON.stringify(out, null, 2), {
        headers: { 'content-type': 'application/json', ...cors },
      })
    }

    return new Response('not found', { status: 404, headers: cors })
  },
}
