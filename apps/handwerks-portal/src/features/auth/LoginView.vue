<template>
  <div class="auth-wrap">
    <div class="card">
      <header class="header">
        <div class="logo">🔧</div>
        <div>
          <h1>Handwerker-Portal</h1>
          <p class="sub">Bitte anmelden</p>
        </div>
      </header>

      <form class="form" @submit.prevent="onSubmit">
        <label>
          <span>Benutzername</span>
          <input v-model.trim="name" placeholder="z. B. max" autocomplete="username" />
        </label>

        <label>
          <span>Passwort</span>
          <input v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" />
        </label>

        <p class="hint">Test-User: <code>max</code> (Disponent), <code>lena</code> (Handwerker), <code>admin</code> (Admin)</p>

        <button class="btn-primary" :disabled="loading">
          {{ loading ? 'Anmelden…' : 'Anmelden' }}
        </button>

        <p v-if="error" class="err">⚠️ {{ error }}</p>
      </form>

      <div class="divider"><span>oder</span></div>

      <div class="customer-switch">
        <button class="link" @click="isCustomer = !isCustomer">Ich bin Kunde</button>
        <transition name="fade">
          <div v-if="isCustomer" class="customer-inline">
            <label>
              <span>Kunden-ID</span>
              <input v-model.trim="customerId" placeholder="z. B. 42" inputmode="numeric" />
            </label>
            <button class="btn-secondary" :disabled="!customerId" @click="goCustomer">Zum Kundenportal</button>
          </div>
        </transition>
      </div>
    </div>
    <footer class="footer">© {{ new Date().getFullYear() }} Dein Handwerksbetrieb</footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth.store'

const router = useRouter()
const auth = useAuthStore()

const name = ref('max')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const isCustomer = ref(false)
const customerId = ref('')

onMounted(() => auth.restore())

async function onSubmit() {
  loading.value = true
  error.value = null
  try {
    await auth.login(name.value || 'max', password.value || '')
    // Weiterleitung je Rolle:
    if (auth.role === 'handwerker') router.push('/termine')
    else router.push('/dashboard')
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

function goCustomer() {
  const id = customerId.value || ''
  const target = id ? `http://localhost:5174/?customerId=${encodeURIComponent(id)}` : `http://localhost:5174/`
  window.open(target, '_blank')
}
</script>

<style scoped>
/* (gleiches modernes Styling wie zuvor) */
.auth-wrap {
  min-height: 100vh;
  background:
    radial-gradient(60rem 40rem at -10% -20%, #e8f0fe 0%, transparent 40%),
    radial-gradient(70rem 50rem at 120% -10%, #eaf7f0 0%, transparent 45%),
    #f6f7fb;
  display: grid; place-items: center; padding: 2rem 1rem;
}
.card {
  width: 100%; max-width: 420px; background: #fff;
  border: 1px solid #eceff3; border-radius: 16px; box-shadow: 0 10px 30px rgba(16, 24, 40, 0.05);
  padding: 1.25rem 1.25rem 1rem;
}
.header { display: grid; grid-template-columns: auto 1fr; gap: .75rem 1rem; align-items: center; margin-bottom: .25rem; }
.logo { width: 42px; height: 42px; border-radius: 10px; display: grid; place-items: center; background: #e8f0fe; color: #1a73e8; font-size: 1.2rem; }
h1 { font-size: 1.25rem; margin: 0; } .sub { margin: .15rem 0 0; color: #667085; font-size: .9rem; }
.form { display: grid; gap: .8rem; margin-top: .75rem; }
label { display: grid; gap: .35rem; }
label span { font-size: .85rem; color: #344054; }
input, select { width: 100%; padding: .65rem .7rem; border: 1px solid #d0d5dd; border-radius: .55rem; background: #fff; font-size: .95rem; }
input:focus, select:focus { outline: none; border-color: #84a9ff; box-shadow: 0 0 0 3px rgba(41,112,255,.15); }
.hint { font-size: .8rem; color: #667085; }
.btn-primary, .btn-secondary, .link { border-radius: .6rem; padding: .65rem .75rem; font-weight: 600; cursor: pointer; }
.btn-primary { background: #2b74ff; color: #fff; border: none; margin-top: .25rem; }
.btn-primary:hover { background: #1f5fe0; }
.btn-secondary { background: #f2f4f7; color: #111; border: 1px solid #e5e7eb; }
.link { background: transparent; border: none; color: #1a73e8; padding: .2rem 0; }
.link:hover { text-decoration: underline; }
.divider { text-align: center; color: #98a2b3; font-size: .85rem; margin: .9rem 0 .2rem; position: relative; }
.divider span { background: #fff; padding: 0 .5rem; position: relative; z-index: 1; }
.divider::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; border-top: 1px solid #eef2f6; transform: translateY(-50%); }
.customer-switch { margin-top: .3rem; }
.customer-inline { display: grid; grid-template-columns: 1fr auto; gap: .5rem; align-items: end; margin-top: .6rem; }
.customer-inline label span { font-size: .8rem; color: #475467; }
.footer { margin-top: 1rem; color: #98a2b3; font-size: .85rem; text-align: center; }
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.err { color: #b00020; margin-top: .5rem; }
</style>
