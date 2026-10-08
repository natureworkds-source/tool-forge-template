import type { InvokeHandler } from '../lib/toolforge'
import { sampleMessageFromWasm } from '../lib/wasm'

export const handleInvoke: InvokeHandler = async (action, _input) => {
  if (action !== 'sample.run') {
    return { ok: false, error: `未声明的动作：${action}` }
  }
  try {
    const message = await sampleMessageFromWasm()
    return { ok: true, data: { message } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message.slice(0, 200) : 'WASM 调用失败' }
  }
}
