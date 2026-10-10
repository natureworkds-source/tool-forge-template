/**
 * 工具私有设置读写范例（settings.*）。
 *
 * 克隆草稿时务必先 toRaw，再 normalize / JSON 深拷贝。
 * 不要对 Vue 响应式 Proxy 直接 structuredClone（会 DataCloneError，设置弹层空白）。
 */
import { toRaw } from 'vue'
import { requestShell } from './toolforge'

/** 派生工具请改成 tools/<manifest.id>/settings.json */
export const SETTINGS_KEY = 'tools/sample-tool/settings.json'

export type SampleSettings = {
  greeting: string
}

export function defaultSettings(): SampleSettings {
  return { greeting: 'hello' }
}

export function normalizeSettings(raw: unknown): SampleSettings {
  const base = defaultSettings()
  if (!raw || typeof raw !== 'object') return base
  const obj = raw as Partial<SampleSettings>
  return {
    greeting: typeof obj.greeting === 'string' ? obj.greeting : base.greeting,
  }
}

/** 从 props / ref 取出 plain object 再规范化（设置面板草稿用）。 */
export function cloneSettings(value: SampleSettings): SampleSettings {
  return normalizeSettings(toRaw(value))
}

export async function loadSettings(): Promise<SampleSettings> {
  try {
    const data = await requestShell('settings.get', { key: SETTINGS_KEY })
    const value =
      data && typeof data === 'object' && 'value' in (data as object)
        ? (data as { value: unknown }).value
        : data
    if (typeof value === 'string') return normalizeSettings(JSON.parse(value))
    return normalizeSettings(value)
  } catch {
    return defaultSettings()
  }
}

export async function saveSettings(settings: SampleSettings): Promise<void> {
  const normalized = normalizeSettings(settings)
  try {
    await requestShell('settings.set', {
      key: SETTINGS_KEY,
      value: JSON.stringify(normalized),
    })
  } catch {
    // Dev / offline: ignore
  }
}
