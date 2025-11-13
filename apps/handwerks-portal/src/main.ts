import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { installGuards } from './router/guards'
import './styles/base.css'
import './styles/utilities.css'
import UiButton from '@/components/ui/Button.vue'


const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

installGuards(router)
app.component('UiButton', UiButton)
app.mount('#app')
