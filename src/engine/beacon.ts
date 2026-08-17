// Anonymous funnel beacon. Fires four event types to a Cloudflare Worker
// (worker/beacon in this repo) that increments per-day counters in KV.
// No cookies, no user IDs, no payload beyond event name + level/lesson id.
// Disabled entirely while SITE.beaconUrl is empty — safe default.
import { SITE } from '@/config/site'

export type BeaconEvent = 'level_start' | 'level_complete' | 'lesson_start' | 'lesson_complete'

export function beacon(e: BeaconEvent, id: string): void {
  const url = SITE.beaconUrl
  if (!url) return
  try {
    const body = JSON.stringify({ e, id })
    // sendBeacon survives page unload; fetch keepalive is the fallback
    const ok = navigator.sendBeacon?.(url, new Blob([body], { type: 'application/json' }))
    if (!ok) {
      fetch(url, {
        method: 'POST',
        body,
        keepalive: true,
        headers: { 'content-type': 'application/json' },
      }).catch(() => { /* analytics must never surface an error */ })
    }
  } catch { /* ditto */ }
}
