import { describe, expect, it } from 'vitest'

function isValidEnvelope(msg: Record<string, unknown>): boolean {
  return (
    msg.type === 'toolforge' &&
    typeof msg.direction === 'string' &&
    typeof msg.requestId === 'string' &&
    msg.requestId.length > 0
  )
}

describe('toolforge envelope', () => {
  it('accepts invoke with requestId', () => {
    expect(
      isValidEnvelope({
        type: 'toolforge',
        direction: 'invoke',
        requestId: 'r1',
        action: 'sample.run',
      }),
    ).toBe(true)
  })

  it('rejects missing requestId', () => {
    expect(isValidEnvelope({ type: 'toolforge', direction: 'invoke', requestId: '' })).toBe(false)
  })
})
