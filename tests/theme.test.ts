import { describe, expect, it } from 'vitest'
import { THEMES, getTheme, parseHostTheme } from '../src/lib/theme'

describe('theme catalog', () => {
  it('matches host theme ids', () => {
    expect(THEMES.map((t) => t.id)).toEqual([
      'indigo',
      'teal',
      'emerald',
      'amber',
      'rose',
      'violet',
      'slate',
    ])
  })

  it('falls back to indigo for unknown id', () => {
    expect(getTheme('not-a-theme').id).toBe('indigo')
    expect(getTheme('teal').primary).toBe('#0d9488')
  })

  it('reads host theme.get mode (not system auto by default)', () => {
    expect(parseHostTheme({ theme: 'teal', mode: 'dark' })).toEqual({
      theme: 'teal',
      mode: 'dark',
    })
    expect(parseHostTheme({ theme: 'indigo' })).toEqual({ theme: 'indigo', mode: 'light' })
  })
})
