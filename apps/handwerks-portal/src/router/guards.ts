import type { Router } from 'vue-router'
import { useAuthStore } from '@/features/auth/auth.store'

export function installGuards(router: Router) {
  router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.path !== '/login' && !auth.isLoggedIn) {
      return { path: '/login' }
    }
    return true
  })
}
