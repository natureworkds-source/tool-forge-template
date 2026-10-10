/** 与主体 themes 对齐的品牌色注入（外部 iframe 无法继承壳层 CSS 变量）。 */

export interface ThemeDef {
  id: string
  name: string
  primary: string
  primaryHover: string
  primaryActive: string
  primarySoft: string
  ring: string
  gradientFrom: string
  gradientTo: string
}

export const THEMES: ThemeDef[] = [
  {
    id: 'indigo',
    name: '靛青',
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryActive: '#3730a3',
    primarySoft: '#eef2ff',
    ring: 'rgba(79, 70, 229, 0.28)',
    gradientFrom: '#6366f1',
    gradientTo: '#0ea5e9',
  },
  {
    id: 'teal',
    name: '青碧',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryActive: '#115e59',
    primarySoft: '#f0fdfa',
    ring: 'rgba(13, 148, 136, 0.28)',
    gradientFrom: '#14b8a6',
    gradientTo: '#0ea5e9',
  },
  {
    id: 'emerald',
    name: '翠绿',
    primary: '#059669',
    primaryHover: '#047857',
    primaryActive: '#065f46',
    primarySoft: '#ecfdf5',
    ring: 'rgba(5, 150, 105, 0.28)',
    gradientFrom: '#10b981',
    gradientTo: '#84cc16',
  },
  {
    id: 'amber',
    name: '琥珀',
    primary: '#d97706',
    primaryHover: '#b45309',
    primaryActive: '#92400e',
    primarySoft: '#fffbeb',
    ring: 'rgba(217, 119, 6, 0.28)',
    gradientFrom: '#f59e0b',
    gradientTo: '#ef4444',
  },
  {
    id: 'rose',
    name: '绯樱',
    primary: '#e11d48',
    primaryHover: '#be123c',
    primaryActive: '#9f1239',
    primarySoft: '#fff1f2',
    ring: 'rgba(225, 29, 72, 0.28)',
    gradientFrom: '#f43f5e',
    gradientTo: '#a855f7',
  },
  {
    id: 'violet',
    name: '紫罗兰',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryActive: '#5b21b6',
    primarySoft: '#f5f3ff',
    ring: 'rgba(124, 58, 237, 0.28)',
    gradientFrom: '#8b5cf6',
    gradientTo: '#ec4899',
  },
  {
    id: 'slate',
    name: '石墨',
    primary: '#475569',
    primaryHover: '#334155',
    primaryActive: '#1e293b',
    primarySoft: '#f1f5f9',
    ring: 'rgba(71, 85, 105, 0.28)',
    gradientFrom: '#64748b',
    gradientTo: '#0ea5e9',
  },
]

export function getTheme(id: string): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

function lighten(hex: string, amount: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return hex
  const num = parseInt(m[1], 16)
  const r = Math.min(255, Math.round(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * amount))
  const g = Math.min(255, Math.round(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * amount))
  const b = Math.min(255, Math.round((num & 255) + (255 - (num & 255)) * amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function rgba(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return hex
  const num = parseInt(m[1], 16)
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`
}

export function resolveMode(mode: string): 'light' | 'dark' {
  if (mode === 'dark') return 'dark'
  if (mode === 'light') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function parseHostTheme(data: unknown): { theme: string; mode: string } {
  const rec = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  const theme = typeof rec.theme === 'string' && rec.theme.trim() ? rec.theme.trim() : 'indigo'
  const mode =
    rec.mode === 'light' || rec.mode === 'dark' || rec.mode === 'auto' ? rec.mode : 'light'
  return { theme, mode }
}

/** Apply appearance pushed/pulled from the host shell. */
export function applyHostThemeInput(input: { theme?: string; mode?: string }): void {
  const theme = typeof input.theme === 'string' && input.theme.trim() ? input.theme.trim() : 'indigo'
  const mode =
    input.mode === 'light' || input.mode === 'dark' || input.mode === 'auto' ? input.mode : 'light'
  applyTheme(theme, mode)
}

/** Apply host theme tokens onto this document (sandboxed iframe). */
export function applyTheme(themeId: string, mode: string = 'light'): void {
  const t = getTheme(themeId || 'indigo')
  const resolved = resolveMode(mode)
  const root = document.documentElement
  root.setAttribute('data-theme', t.id)
  root.setAttribute('data-mode', resolved)

  const isDark = resolved === 'dark'
  const primary = isDark ? lighten(t.primary, 0.22) : t.primary
  const hover = isDark ? lighten(t.primaryHover, 0.2) : t.primaryHover
  const active = isDark ? lighten(t.primaryActive, 0.16) : t.primaryActive

  root.style.setProperty('--c-primary', primary)
  root.style.setProperty('--c-primary-hover', hover)
  root.style.setProperty('--c-primary-active', active)
  root.style.setProperty('--c-primary-soft', isDark ? rgba(t.primary, 0.16) : t.primarySoft)
  root.style.setProperty('--c-primary-text', isDark ? lighten(t.primary, 0.35) : t.primary)
  root.style.setProperty('--c-ring', isDark ? rgba(primary, 0.4) : t.ring)
  root.style.setProperty('--c-grad-from', t.gradientFrom)
  root.style.setProperty('--c-grad-to', t.gradientTo)
  root.style.setProperty('--c-on-primary', isDark ? '#0b1020' : '#ffffff')
}
