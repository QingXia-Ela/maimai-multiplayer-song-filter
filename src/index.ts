import App from './App.vue'
import { createApp } from 'vue'
import router from '@/router'
import { createPinia } from 'pinia'
import './styles/theme.css'
import { useThemeStore } from '@/store'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router)

// 初始化主题（跟随系统 / 手动切换 + 持久化）
useThemeStore(pinia).init()

app.mount('#root')