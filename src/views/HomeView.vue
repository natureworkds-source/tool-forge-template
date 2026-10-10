<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { applyTheme, parseHostTheme } from '../lib/theme'
import { requestShell } from '../lib/toolforge'

const themeLabel = ref('unknown')
const status = ref('等待平台 invoke…')

onMounted(async () => {
  try {
    const data = await requestShell('theme.get')
    const { theme, mode } = parseHostTheme(data)
    applyTheme(theme, mode)
    themeLabel.value = `${theme} / ${mode}`
  } catch {
    applyTheme('indigo', 'light')
    themeLabel.value = '（未在平台内，theme.get 不可用；已回落 indigo/light）'
  }
})
</script>

<template>
  <main class="page">
    <h1>外部工具推荐模板</h1>
    <p class="meta">
      Vue 3 + TypeScript + Rust WASM。逻辑在 <code>crates/</code>，与 host 仅通过 toolforge 消息交互。
    </p>
    <p>主题：{{ themeLabel }}</p>
    <p>状态：{{ status }}</p>
  </main>
</template>
