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

function subscribe(notify: () => void): () => void {
  const storageChanged = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null || event.key === 'llmquest_admin_v1') {
      if (event.key === KEY || event.key === null) sessionPreference = undefined
      notify()
    }
  }
  window.addEventListener(EVENT, notify)
  window.addEventListener('storage', storageChanged)
  return () => {
    window.removeEventListener(EVENT, notify)
    window.removeEventListener('storage', storageChanged)
  }
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
