# ZeroOne funnel beacon

Counts four anonymous events per day per level/lesson: `level_start`,
`level_complete`, `lesson_start`, `lesson_complete`. No cookies, no IPs
stored, no user identifiers — just counters. The client half lives in
`src/engine/beacon.ts` and is a no-op until `SITE.beaconUrl` is set.

## Deploy (one time, ~5 minutes)

```bash
cd worker/beacon
npx wrangler login                          # opens browser, authorizes Cloudflare
npx wrangler kv namespace create COUNTS    # prints an id
# paste that id into wrangler.toml (kv_namespaces.id)
npx wrangler secret put STATS_KEY           # invent a long random string
npx wrangler deploy                         # prints https://zeroone-beacon.<account>.workers.dev
```

Then set in `src/config/site.ts`:

```ts
beaconUrl: 'https://zeroone-beacon.<account>.workers.dev/e',
```

rebuild, push. Done.

## Read the funnel

```
https://zeroone-beacon.<account>.workers.dev/stats?key=<STATS_KEY>
```

Returns JSON like:

```json
{
  "2026-08-18:level_start:c1-l1": 42,
  "2026-08-18:level_complete:c1-l1": 31,
  "2026-08-18:level_start:c1-l2": 29
}
```

Drop-off per level = complete/start per id. The first level where the ratio
craters is where learners stall.

## Caveats

- KV counter increments are read-modify-write: concurrent writes can drop
  counts. Fine as a funnel signal; use a Durable Object if exactness matters.
- Free plan limits (100k requests/day, 1k KV writes/day) comfortably cover a
  course site; each event is one write.
