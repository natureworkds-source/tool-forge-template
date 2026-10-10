import { createApp } from 'vue'
import App from './App.vue'
import { handleInvoke } from './actions/sample-run'
import { applyHostThemeInput } from './lib/theme'
import { startToolforgeHostBridge } from './lib/toolforge'
import './styles.css'

startToolforgeHostBridge(handleInvoke, applyHostThemeInput)
createApp(App).mount('#app')
