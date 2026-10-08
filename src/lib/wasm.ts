type WasmModule = {
  default: (input?: unknown) => Promise<unknown>
  sample_message: () => string
}

let ready: Promise<WasmModule> | null = null

export async function loadWasm(): Promise<WasmModule> {
  if (!ready) {
    ready = import('../wasm-pkg/tool_wasm.js') as Promise<WasmModule>
    const mod = await ready
    await mod.default()
    return mod
  }
  return ready
}

export async function sampleMessageFromWasm(): Promise<string> {
  const mod = await loadWasm()
  return mod.sample_message()
}
