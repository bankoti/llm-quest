import { useSyncExternalStore } from 'react'
import { isAdminMode } from '@/engine/admin'

const KEY = 'llmquest_prerequisite_locks_v1'
const EVENT = 'llmquest-learning-access'
let sessionPreference: boolean | undefined

function locksEnabled(): boolean {
  if (sessionPreference !== undefined) return sessionPreference
  try {
    const value = localStorage.getItem(KEY)
    if (value === 'on' || value === 'off') return value === 'on'
  } catch { /* Keep the setting usable when browser storage is unavailable. */ }
  return !isAdminMode()
}

function storageChanged(event: StorageEvent): void {
  if (event.key === KEY || event.key === null || event.key === 'llmquest_admin_v1') {
    if (event.key === KEY || event.key === null) sessionPreference = undefined
    window.dispatchEvent(new Event(EVENT))
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', storageChanged)
  import.meta.hot?.dispose(() => window.removeEventListener('storage', storageChanged))
}

function subscribe(notify: () => void): () => void {
  window.addEventListener(EVENT, notify)
  return () => window.removeEventListener(EVENT, notify)
}

export function setPrerequisiteLocks(enabled: boolean): void {
  try {
    localStorage.setItem(KEY, enabled ? 'on' : 'off')
    sessionPreference = undefined
  } catch { sessionPreference = enabled }
  window.dispatchEvent(new Event(EVENT))
}

export function usePrerequisiteLocks(): boolean {
  return useSyncExternalStore(subscribe, locksEnabled, () => true)
}
