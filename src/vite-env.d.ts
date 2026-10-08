/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '../wasm-pkg/tool_wasm.js' {
  const init: (input?: unknown) => Promise<unknown>
  export default init
  export function sample_message(): string
}
