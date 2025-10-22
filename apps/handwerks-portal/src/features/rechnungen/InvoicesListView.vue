<!-- apps/handwerks-portal/src/features/rechnungen/InvoicesListView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { listInvoices, deleteInvoice, type Invoice } from '@/services/invoices'

const router = useRouter()

const items = ref<Invoice[]>([])
const loading = ref(false)
const error = ref<string|null>(null)

const q = ref('')
type FilterKey = 'alle' | 'offen' | 'bezahlt' | 'überfällig'
const filter = ref<FilterKey>('alle')

// Sortier-State für Fälligkeitsdatum
type SortDir = 'asc' | 'desc'
const sortDueDir = ref<SortDir>('asc')

onMounted(reload)
async function reload(){
  loading.value = true; error.value = null
  try { items.value = await listInvoices() }
  catch(e:any){ error.value = e?.message ?? String(e) }
  finally { loading.value = false }
}

function daysUntil(d?: string){
  if (!d) return Infinity
  const a = new Date(d+'T00:00:00'), b = new Date()
  const A = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const B = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((A-B)/86400000)
}
const isOverdue = (i: Invoice) =>
  i.status !== 'bezahlt' && daysUntil(i.dueDate) < 0

// gefiltert + sortiert
const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  let arr = items.value.filter(i => {
    const okQ = !query || [
      i.title,
      String(i.id ?? ''),
      String(i.customerId ?? ''),
      String(i.orderId ?? '')
    ].some(x => String(x).toLowerCase().includes(query))

    let okF = true
    if (filter.value === 'offen') okF = i.status === 'offen'
    else if (filter.value === 'bezahlt') okF = i.status === 'bezahlt'
    else if (filter.value === 'überfällig') okF = isOverdue(i)

    return okQ && okF
  })

  // sort by dueDate (leer → ans Ende)
  arr = arr.sort((a,b) => {
    const A = a.dueDate ?? '9999-12-31'
    const B = b.dueDate ?? '9999-12-31'
    const cmp = A.localeCompare(B)
    return sortDueDir.value === 'asc' ? cmp : -cmp
  })

  return arr
})

function toggleDueSort(){
  sortDueDir.value = sortDueDir.value === 'asc' ? 'desc' : 'asc'
}

async function remove(id: string | number | undefined){
  if (id == null) return
  if (!confirm('Diese Rechnung wirklich löschen?')) return
  await deleteInvoice(id)
  items.value = items.value.filter(i => i.id !== id)
}
</script>

<template>

  <div class="title-decor">
    <h1>Rechnungen</h1>

  </div>

  <div>
    <div class="toolbar">
      <div class="right">
        <input class="input" v-model="q" placeholder="Suchen (#, Titel, Kunde, Auftrag)..." />
        <select class="select" v-model="filter" title="Status filtern">
          <option value="alle">Alle</option>
          <option value="offen">Offen</option>
          <option value="bezahlt">Bezahlt</option>
          <option value="überfällig">Überfällig</option>
        </select>
        <button class="btn" @click="reload">Aktualisieren</button>
        <button class="btn primary add" @click="router.push('/rechnungen/neu')">Neue Rechnung</button>
      </div>
    </div>

    <LoadState :loading="loading" :error="error">
      <Card>
        <template #default>
          <table v-if="filtered.length" class="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Titel</th>
                <th>Kunde</th>
                <th>Status</th>
                <th class="click" @click="toggleDueSort">
                  Fällig
                  <span aria-hidden="true">{{ sortDueDir === 'asc' ? ' ▲' : ' ▼' }}</span>
                </th>
                <th class="r">Summe</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in filtered" :key="i.id">
                <td>#{{ i.id }}</td>
                <td>{{ i.title }}</td>
                <td>#{{ i.customerId }}</td>
                <td>
                  <StatusBadge :status="isOverdue(i) ? 'überfällig' : i.status" />
                </td>
                <td>{{ i.dueDate || '—' }}</td>
                <td class="r">{{ (i.total ?? 0).toFixed(2) }}€</td>
                <td class="actions">
                  <button class="btn" @click="router.push(`/rechnungen/${i.id}`)">Details</button>
                  <button class="btn danger" @click="remove(i.id)">Löschen</button>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-else>Keine Rechnungen gefunden.</p>
        </template>
      </Card>
    </LoadState>
  </div>
</template>

<style scoped>
.toolbar{
  display:flex; align-items:center; justify-content:space-between;
  gap:.5rem; margin:.75rem 0; flex-wrap:wrap;
}
.right{ display:flex; gap:.5rem; align-items:center }
.tbl{ width:100%; border-collapse:collapse }
th, td{ padding:.55rem; border-bottom:1px solid #eee; text-align:left }
td.r{ text-align:right }
.actions{ display:flex; gap:.4rem; justify-content:flex-end }
.click{ user-select:none; cursor:pointer }
</style>
