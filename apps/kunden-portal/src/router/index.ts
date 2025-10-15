import { createRouter, createWebHistory } from 'vue-router'
import PortalView from '../views/PortalView.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'portal', component: PortalView },
  ],
})
