export type ToolforgeDirection = 'invoke' | 'result' | 'request'

export type ToolforgeMessage = {
  type: 'toolforge'
  direction: ToolforgeDirection
  requestId: string
  action?: string
  input?: unknown
  ok?: boolean
  data?: unknown
  error?: string
}

export type InvokeHandler = (
  action: string,
  input: unknown,
) => Promise<{ ok: true; data: unknown } | { ok: false; error: string }>

const HOST_ORIGIN = 'http://127.0.0.1:17321'

function isToolforge(data: unknown): data is ToolforgeMessage {
  if (!data || typeof data !== 'object') return false
  const m = data as Record<string, unknown>
  return m.type === 'toolforge' && typeof m.direction === 'string' && typeof m.requestId === 'string' && m.requestId.length > 0
}

export function replyResult(
  requestId: string,
  result: { ok: true; data: unknown } | { ok: false; error: string },
  targetOrigin: string = HOST_ORIGIN,
): void {
  const msg: ToolforgeMessage = result.ok
    ? { type: 'toolforge', direction: 'result', requestId, ok: true, data: result.data }
    : { type: 'toolforge', direction: 'result', requestId, ok: false, error: result.error }
  // opaque sandbox: fall back to *
  try {
    parent.postMessage(msg, targetOrigin)
  } catch {
    parent.postMessage(msg, '*')
  }
}

export type HostThemeHandler = (input: { theme?: string; mode?: string }) => void

/** 监听宿主 invoke；`host.theme` 单独回调，其余交给业务 handler。 */
export function startToolforgeHostBridge(
  handler: InvokeHandler,
  onHostTheme?: HostThemeHandler,
): void {
  window.addEventListener('message', (event) => {
    if (!isToolforge(event.data)) return
    if (event.data.direction !== 'invoke') return
    const { requestId, action, input } = event.data
    if (!action) {
      replyResult(requestId, { ok: false, error: '缺少 action' }, event.origin || HOST_ORIGIN)
      return
    }
    if (action === 'host.theme') {
      const body = (input && typeof input === 'object' ? input : {}) as {
        theme?: string
        mode?: string
      }
      onHostTheme?.(body)
      replyResult(requestId, { ok: true, data: { ok: true } }, event.origin || HOST_ORIGIN)
      return
    }
    void handler(action, input ?? {}).then((result) => {
      replyResult(requestId, result, event.origin || HOST_ORIGIN)
    })
  })
}

export function requestShell(action: string, input: Record<string, unknown> = {}): Promise<unknown> {
  const requestId = `req-${crypto.randomUUID()}`
  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent) => {
      if (!isToolforge(event.data)) return
      if (event.data.direction !== 'result' || event.data.requestId !== requestId) return
      window.removeEventListener('message', onMessage)
      if (event.data.ok) resolve(event.data.data)
      else reject(new Error(event.data.error || 'request failed'))
    }
    window.addEventListener('message', onMessage)
    const msg: ToolforgeMessage = {
      type: 'toolforge',
      direction: 'request',
      requestId,
      action,
      input,
    }
    try {
      parent.postMessage(msg, HOST_ORIGIN)
    } catch {
      parent.postMessage(msg, '*')
    }
  })
}
