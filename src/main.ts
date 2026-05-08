import { createApp } from 'vue'
import App from './App.vue'
import './styles/theme.css'
import '@vuepic/vue-datepicker/dist/main.css'
import 'vant/lib/index.css'

createApp(App).mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
