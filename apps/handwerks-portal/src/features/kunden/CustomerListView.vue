<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { listCustomers, type Customer, deleteCustomer } from '@/services/customers'

const router = useRouter()
const items = ref<Customer[]>([])
const loading = ref(false)
const error = ref<string|null>(null)

// Toolbar-States
const q = ref('')
const statusFilter = ref<'alle' | 'aktiv' | 'inaktiv'>('alle')

// Sortierung nach Name
const sortDir = ref<'asc'|'desc'>('asc')
function toggleSortName() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}
function sortArrow() { return sortDir.value === 'asc' ? '▲' : '▼' }

async function reload(){
  loading.value = true; error.value = null
  try { items.value = await listCustomers() }
  catch(e:any){ error.value = e?.message ?? String(e) }
  finally { loading.value = false }
}
onMounted(reload)

const visible = computed(() => {
  const term = q.value.trim().toLowerCase()
  let rows = items.value.filter(c => {
    const inText = !term || [c.name, c.email, c.phone, String(c.id)].filter(Boolean)
      .some(s => String(s).toLowerCase().includes(term))
    const inStatus =
      statusFilter.value === 'alle' ? true : (c.status ?? 'aktiv') === statusFilter.value
    return inText && inStatus
  })
  rows = [...rows].sort((a,b) => {
    const A = (a.name || '').toLowerCase()
    const B = (b.name || '').toLowerCase()
    return sortDir.value === 'asc' ? (A > B ? 1 : A < B ? -1 : 0) : (A < B ? 1 : A > B ? -1 : 0)
  })
  return rows
})

async function remove(id: string|number) {
  if (!confirm('Diesen Kunden wirklich löschen?')) return
  await deleteCustomer(id)
  items.value = items.value.filter(c => String(c.id) !== String(id))
}
</script>

<template>
  <div class="stack">
    <h1>Kunden</h1>

    <div class="toolbar">
      <div class="left">
        <input class="search" v-model="q" placeholder="Suchen… (Name, E-Mail, Telefon, #ID)" />
        <label class="filter">
          <span>Alle Kunden</span>
          <select v-model="statusFilter">
            <option value="alle">Alle Kunden</option>
            <option value="aktiv">Aktive</option>
            <option value="inaktiv">Inaktive</option>
          </select>
        </label>
        <button class="btn ghost" @click="reload">Aktualisieren</button>
      </div>
      <div class="right">
        <button class="btn primary" type="button" @click="router.push({ name: 'customers-new' })">
          Neuer Kunde
        </button>
      </div>
    </div>

    <LoadState :loading="loading" :error="error">
      <Card>
        <table class="tbl">
          <thead>
            <tr>
              <th style="width:90px">#</th>
              <th>
                <button class="th-btn" @click="toggleSortName">
                  Name <span class="arrow">{{ sortArrow() }}</span>
                </button>
              </th>
              <th>E-Mail</th>
              <th>Telefon</th>
              <th>Status</th>
              <th style="width:1%"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in visible" :key="c.id">
              <td>#{{ c.id }}</td>
              <td>
                <RouterLink :to="`/kunden/${c.id}`">{{ c.name }}</RouterLink>
              </td>
              <td>
                <a v-if="c.email" :href="`mailto:${c.email}`">{{ c.email }}</a>
                <span v-else>—</span>
              </td>
              <td>
                <a v-if="c.phone" :href="`tel:${c.phone}`">{{ c.phone }}</a>
                <span v-else>—</span>
              </td>
              <td>
                <span class="badge" :class="(c.status ?? 'aktiv') === 'aktiv' ? 'ok' : 'muted'">
                  {{ c.status ?? 'aktiv' }}
                </span>
              </td>
              <td class="r">
                <button class="btn" @click="router.push(`/kunden/${c.id}`)">Details</button>
                <button class="btn danger" @click="remove(c.id)">Löschen</button>
              </td>
            </tr>
            <tr v-if="!visible.length">
              <td colspan="6" style="color:#777; padding:.9rem .55rem;">Keine Kunden gefunden.</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </LoadState>
  </div>
</template>

<style scoped>
.stack>*+*{ margin-top:1rem }

/* Toolbar */
.toolbar{
  display:flex; align-items:center; justify-content:space-between;
  gap:.5rem; margin:.75rem 0; flex-wrap:wrap;
}
.left{ display:flex; align-items:center; gap:.5rem; flex-wrap:wrap }
.right{ margin-left:auto; display:flex; gap:.5rem }

.search{
  min-width:260px; padding:.5rem .65rem; border:1px solid #ddd; border-radius:.5rem; background:#fff;
}
.filter{
  display:inline-flex; align-items:center; gap:.4rem;
  border:1px solid #ddd; padding:.35rem .5rem; border-radius:.5rem; background:#fff;
}
.filter select{ border:0; outline:0; background:transparent; padding:.2rem 0 }

.btn{padding:.5rem .7rem;border:1px solid #ddd;border-radius:.5rem;background:#fff;cursor:pointer}
.btn.ghost{ background:#fff }
.btn.primary{ background:#2b74ff;color:#fff;border-color:#2b74ff }
.btn.danger{ color:#b3261e;border-color:#f4c7c3;background:#fde7e9 }

.tbl{width:100%;border-collapse:collapse}
th,td{padding:.55rem;border-bottom:1px solid #eee;text-align:left}
td.r{ text-align:right }

.th-btn{ display:inline-flex; align-items:center; gap:.35rem; border:0; background:transparent; cursor:pointer; font:inherit; padding:0 }
.arrow{ min-width:1em; display:inline-block; color:#888 }

.badge{padding:.1rem .45rem;border-radius:999px;font-size:.78rem}
.badge.ok{ background:#e6f4ea; color:#137333 }
.badge.muted{ background:#eee; color:#555 }
</style>
