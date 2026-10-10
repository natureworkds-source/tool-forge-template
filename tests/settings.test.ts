import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { cloneSettings, normalizeSettings } from '../src/lib/settings'

describe('settings normalize / clone', () => {
  it('fills defaults', () => {
    expect(normalizeSettings(null).greeting).toBe('hello')
    expect(normalizeSettings({ greeting: 'hi' }).greeting).toBe('hi')
  })

  it('clones Vue reactive props without structuredClone', () => {
    const proxy = reactive({ greeting: 'from-ui' })
    const draft = cloneSettings(proxy)
    expect(draft.greeting).toBe('from-ui')
    draft.greeting = 'edited'
    expect(proxy.greeting).toBe('from-ui')
  })
})
