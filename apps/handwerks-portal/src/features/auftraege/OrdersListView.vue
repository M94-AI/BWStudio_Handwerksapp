<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { listOrders, deleteOrder, type Order } from '@/services/orders'
import Dropdown from '@/components/ui/Dropdown.vue'

const router = useRouter()

// Daten
const items = ref<Order[]>([])
const loading = ref(false)
const error = ref<string|null>(null)

// Toolbar-States
const q = ref('')
const status = ref('') // '' = Alle (passt zum Dropdown)

// Sortier-State (Fällig)
const sortDir = ref<'asc'|'desc'>('asc')

// Laden
async function reload(){
  loading.value = true; error.value = null
  try { items.value = await listOrders() }
  catch(e:any){ error.value = e.message ?? String(e) }
  finally { loading.value = false }
}
onMounted(reload)

// Hilfen für Sortierung nach due (YYYY-MM-DD)
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

// Status-Optionen fürs Dropdown
const statusOptions = [
  { label: 'Offene Aufträge',     value: 'offen' },
  { label: 'In Arbeit',           value: 'in Arbeit' },
  { label: 'Erledigte Aufträge',  value: 'erledigt' },
]

// Filtern + Sortieren
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()

  let rows = items.value.filter(o => {
    const okQ = !term || o.title.toLowerCase().includes(term) || String(o.id).includes(term)
    const okS = !status.value
      ? true
      : status.value === 'offen'
        ? o.status !== 'erledigt'
        : o.status === status.value
    return okQ && okS
  })

  // Sortieren nach Fälligkeitsdatum (leer ans Ende/Anfang je nach Richtung)
  rows = [...rows].sort((a,b) => {
    const A = dueMs(a.due), B = dueMs(b.due)
    if (A === null && B === null) return 0
    if (A === null) return sortDir.value === 'asc' ? 1 : -1
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

    <!-- Einheitliche Toolbar -->
    <div class="toolbar">
      <div class="left">
        <input v-model="q" class="input" placeholder="Suchen…" />
        <Dropdown
          v-model="status"
          :options="statusOptions"
          placeholder="Alle Aufträge"
        />
        <button class="btn" type="button" @click="reload">Aktualisieren</button>
      </div>

      <div class="right">
        <button class="btn primary" type="button" @click="router.push({ name: 'orders-new' })">
          + Neuer Auftrag
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
.left{ display:flex; gap:.5rem; align-items:center; flex-wrap:wrap }
.right{ display:flex; gap:.5rem }

/* Tabelle */
.tbl{width:100%;border-collapse:collapse}
th,td{padding:.55rem;border-bottom:1px solid #eee;text-align:left}
.actions{display:flex;gap:.4rem;justify-content:flex-end}

/* Sortierbarer Header */
.th-btn{
  display:inline-flex; align-items:center; gap:.35rem;
  border:0; background:transparent; cursor:pointer; font:inherit; padding:0;
}
.arrow{ min-width:1em; display:inline-block; color:#888 }

/* Link in Titel */
a{color:#1a73e8;cursor:pointer}
</style>
