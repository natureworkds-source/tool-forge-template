import { createApp } from 'vue'
import App from './App.vue'
import { startToolforgeHostBridge } from './lib/toolforge'
import { handleInvoke } from './actions/sample-run'

startToolforgeHostBridge(handleInvoke)
createApp(App).mount('#app')
