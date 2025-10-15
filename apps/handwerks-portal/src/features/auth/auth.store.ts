import { defineStore } from 'pinia'
import type { Role, User } from '@/services/auth'
import { loginWithUsernamePassword } from '@/services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | User
  }),
  getters: {
    isLoggedIn: (s) => !!s.user,
    role: (s) => s.user?.role ?? null
  },
  actions: {
    async login(username: string, password: string) {
      const user = await loginWithUsernamePassword(username, password)
      this.user = user
      localStorage.setItem('auth', JSON.stringify(user))
    },
    restore() {
      const raw = localStorage.getItem('auth')
      if (raw) this.user = JSON.parse(raw)
    },
    logout() {
      this.user = null
      localStorage.removeItem('auth')
    }
  }
})
