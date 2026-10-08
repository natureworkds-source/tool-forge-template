import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), 'tool/manifest.json'), 'utf8'),
) as Record<string, unknown>

describe('tool/manifest.json', () => {
  it('has valid id and ui entry', () => {
    expect(manifest.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    expect(manifest.entry).toMatch(/^ui\//)
    expect(manifest.origin).toBeUndefined()
  })

  it('keeps effects within permissions', () => {
    const permissions = new Set(manifest.permissions as string[])
    for (const action of manifest.actions as Array<{ effects: string[] }>) {
      for (const effect of action.effects) {
        if (effect === 'readFiles' || effect === 'writeFiles') {
          expect(permissions.has('files')).toBe(true)
        } else if (effect === 'network') {
          expect(permissions.has('network')).toBe(true)
        } else if (effect === 'settings') {
          expect(permissions.has('settings')).toBe(true)
        }
      }
    }
  })
})
