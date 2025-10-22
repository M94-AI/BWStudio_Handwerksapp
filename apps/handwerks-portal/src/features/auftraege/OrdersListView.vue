<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { listOrders, deleteOrder, type Order } from '@/services/orders'

const router = useRouter()

// Daten
const items = ref<Order[]>([])
const loading = ref(false)
const error = ref<string|null>(null)

// Toolbar-States
const q = ref('')
// 'alle' | 'offen' | 'erledigt'
const statusFilter = ref<'alle'|'offen'|'erledigt'>('alle')

// Sortier-States
const sortDir = ref<'asc'|'desc'>('asc') // Start: aufsteigend (alt -> neu)

// Laden
async function reload(){
  loading.value = true; error.value = null
  try { items.value = await listOrders() }
  catch(e:any){ error.value = e.message ?? String(e) }
  finally { loading.value = false }
}
onMounted(reload)

// Hilfen
function dueMs(due?: string) {
  if (!due) return null
  const d = new Date(due + 'T00:00:00')
  return isNaN(+d) ? null : +d
}
function toggleSortDue(){
  sortDir.value = (sortDir.value === 'asc' ? 'desc' : 'asc')
}
function sortArrow(){
  return sortDir.value === 'asc' ? '▲' : '▼'
}

// Filtern + Sortieren
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  let rows = items.value.filter(o => {
    const okQ = !term || o.title.toLowerCase().includes(term) || String(o.id).includes(term)
    const okS =
      statusFilter.value === 'alle' ? true
      : statusFilter.value === 'offen' ? o.status !== 'erledigt'
      : /* 'erledigt'         */        o.status === 'erledigt'
    return okQ && okS
  })

  // Sortieren nach due
  rows = [...rows].sort((a,b) => {
    const A = dueMs(a.due), B = dueMs(b.due)
    if (A === null && B === null) return 0
    if (A === null) return sortDir.value === 'asc' ? 1 : -1  // leere ans Ende (asc)
    if (B === null) return sortDir.value === 'asc' ? -1 : 1
    return sortDir.value === 'asc' ? A - B : B - A
  })

  return rows
})

async function remove(id: number | string) {
  if (!confirm('Diesen Auftrag wirklich löschen?')) return
  await deleteOrder(id as any)
  items.value = items.value.filter(o => String(o.id) !== String(id))
}
</script>

<template>
  <div>
    <h1>Aufträge</h1>

    <!-- Toolbar: links Filter/Suche, rechts Neuer Auftrag -->
    <div class="toolbar">
      <div class="left">
        <input class="search" v-model="q" placeholder="Suchen… (Titel oder #ID)" />
        <label class="filter">
          <span>Alle Aufträge</span>
          <select v-model="statusFilter">
            <option value="alle">Alle Aufträge</option>
            <option value="offen">Offene Aufträge</option>
            <option value="erledigt">Erledigte Aufträge</option>
          </select>
        </label>
        <button class="btn ghost" @click="reload">Aktualisieren</button>
      </div>
      <div class="right">
        <button class="btn primary add" @click="router.push({ name: 'orders-new' })">
          Neuer Auftrag
        </button>
      </div>
    </div>

    <LoadState :loading="loading" :error="error">
      <Card>
        <table class="tbl">
          <thead>
            <tr>
              <th style="width:96px">ID</th>
              <th>Titel</th>
              <th>Kunde</th>
              <th>Status</th>
              <th style="width:160px">
                <button class="th-btn" @click="toggleSortDue" :aria-label="`Nach Fällig sortieren ${sortArrow()}`">
                  Fällig <span class="arrow">{{ sortArrow() }}</span>
                </button>
              </th>
              <th style="width:1%"></th>
            </tr>
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
            <tr v-if="!filtered.length">
              <td colspan="6" style="color:#777; padding:.9rem .55rem;">Keine Aufträge gefunden.</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </LoadState>
  </div>
</template>

<style scoped>
.toolbar{
  display:flex; align-items:center; justify-content:space-between;
  gap:.5rem; margin:.75rem 0; flex-wrap:wrap;
}
.left{ display:flex; align-items:center; gap:.5rem; flex-wrap:wrap }
.right{ margin-left:auto; display:flex; gap:.5rem }

.search{
  min-width: 260px;
  padding:.5rem .65rem; border:1px solid #ddd; border-radius:.5rem; background:#fff;
}

.filter{
  display:inline-flex; align-items:center; gap:.4rem;
  border:1px solid #ddd; padding:.35rem .5rem; border-radius:.5rem; background:#fff;
}
.filter select{ border:0; outline:0; background:transparent; padding:.2rem 0 }

.btn{padding:.5rem .7rem;border:1px solid #ddd;border-radius:.5rem;background:#fff;cursor:pointer}
.btn.ghost{ background:#fff }
.primary{background:#2b74ff;color:#fff;border-color:#2b74ff}
.danger{color:#b3261e;border-color:#f4c7c3;background:#fde7e9}

.tbl{width:100%;border-collapse:collapse}
th,td{padding:.55rem;border-bottom:1px solid #eee;text-align:left}
.actions{display:flex;gap:.4rem;justify-content:flex-end}

/* Sortierbarer Header */
.th-btn{
  display:inline-flex; align-items:center; gap:.35rem;
  border:0; background:transparent; cursor:pointer; font:inherit; padding:0;
}
.arrow{ min-width:1em; display:inline-block; color:#888 }
a{color:#1a73e8;cursor:pointer}
</style>
