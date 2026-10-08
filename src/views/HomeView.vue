<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { requestShell } from '../lib/toolforge'

const theme = ref<string>('unknown')
const status = ref('等待平台 invoke…')

onMounted(async () => {
  try {
    const data = await requestShell('theme.get')
    theme.value = typeof data === 'object' && data && 'mode' in (data as object)
      ? String((data as { mode?: string }).mode ?? JSON.stringify(data))
      : JSON.stringify(data)
  } catch {
    theme.value = '（未在平台内，theme.get 不可用）'
  }
})
</script>

<template>
  <main style="font-family: system-ui, sans-serif; padding: 1.5rem; max-width: 40rem">
    <h1>外部工具推荐模板</h1>
    <p>Vue 3 + TypeScript + Rust WASM。逻辑在 <code>crates/</code>，与 host 仅通过 toolforge 消息交互。</p>
    <p>主题：{{ theme }}</p>
    <p>状态：{{ status }}</p>
  </main>
</template>
