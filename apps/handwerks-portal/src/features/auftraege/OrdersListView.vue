<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { listOrders, deleteOrder, type Order } from '@/services/orders'

const router = useRouter()
const items = ref<Order[]>([])
const loading = ref(false)
const error = ref<string|null>(null)
const q = ref(''); const status = ref('')

async function reload(){
  loading.value = true; error.value = null
  try { items.value = await listOrders() } catch(e:any){ error.value = e.message ?? String(e) }
  finally { loading.value = false }
}
onMounted(reload)

const filtered = computed(() =>
  items.value.filter(o => {
    const okQ = !q.value || o.title.toLowerCase().includes(q.value.toLowerCase())
    const okS = !status.value || o.status === status.value
    return okQ && okS
  })
)

async function remove(id:number) {
  if (!confirm('Diesen Auftrag wirklich löschen?')) return
  await deleteOrder(id); items.value = items.value.filter(o => o.id !== id)
}
</script>

<template>
  <div>
    <h1>Aufträge</h1>

    <div class="toolbar">
      <input v-model="q" placeholder="Suchen…" />
      <select v-model="status">
        <option value="">Alle Status</option>
        <option>offen</option><option>in Arbeit</option><option>erledigt</option>
      </select>
      <button class="btn" @click="reload">Aktualisieren</button>
    <button class="btn primary" @click="router.push({ name: 'orders-new' })">Neuer Auftrag</button>
    </div>

    <LoadState :loading="loading" :error="error">
      <Card>
        <table class="tbl">
          <thead>
            <tr><th>ID</th><th>Titel</th><th>Kunde</th><th>Status</th><th>Fällig</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="o in filtered" :key="o.id">
              <td>#{{ o.id }}</td>
              <td><a @click.prevent="router.push(`/auftraege/${o.id}`)" href="">{{ o.title }}</a></td>
              <td>#{{ o.customerId }}</td>
              <td><StatusBadge :status="o.status" /></td>
              <td>{{ o.due || '—' }}</td>
              <td class="actions">
                <button class="btn" @click="router.push(`/auftraege/${o.id}`)">Details</button>
                <button class="btn danger" @click="remove(o.id!)">Löschen</button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </LoadState>
  </div>
</template>

<style scoped>
.toolbar{display:flex;gap:.5rem;margin:.75rem 0}
.btn{padding:.5rem .7rem;border:1px solid #ddd;border-radius:.5rem;background:#fff;cursor:pointer}
.primary{background:#2b74ff;color:#fff;border-color:#2b74ff}
.danger{color:#b3261e;border-color:#f4c7c3;background:#fde7e9}
.tbl{width:100%;border-collapse:collapse}
th,td{padding:.55rem;border-bottom:1px solid #eee;text-align:left}
.actions{display:flex;gap:.4rem;justify-content:flex-end}
a{color:#1a73e8;cursor:pointer}
</style>
