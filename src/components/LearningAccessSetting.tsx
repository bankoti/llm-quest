import { setPrerequisiteLocks, usePrerequisiteLocks } from '@/engine/learningAccess'

export function LearningAccessSetting() {
  const enabled = usePrerequisiteLocks()
  return <label className="flex flex-wrap items-center gap-3 py-3 text-sm text-gray-300 cursor-pointer">
    <input type="checkbox" checked={enabled}
      onChange={event => setPrerequisiteLocks(event.target.checked)}
      className="h-5 w-5 shrink-0 accent-emerald-500" />
    <span>Prerequisite locks</span>
    <span className="text-xs text-gray-500">{enabled ? 'On' : 'Off'} · This browser</span>
  </label>
}
