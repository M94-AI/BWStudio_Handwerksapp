<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Dropdown from '@/components/ui/Dropdown.vue'
import { useInventoryStore } from '@/stores/inventory'

const router = useRouter()
const inv = useInventoryStore()

// Toolbar
const q = ref('')
const status = ref('') // '', 'ok', 'niedrig', 'leer'
const statusOptions = [
  { label: 'Alle Artikel', value: '' },
  { label: 'Auf Lager', value: 'ok' },
  { label: 'Unter Mindestbestand', value: 'niedrig' },
  { label: 'Bestand leer', value: 'leer' },
]

function reload(){ inv.fetchAll({ force: true }) }
onMounted(() => inv.fetchAll())

// stabiler key-Fallback
const rowKey = (a: any, i: number) => (a?.id ?? a?.sku ?? `row-${i}`)

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  return inv.all.filter(a => {
    const okQ = !term || [a.name, a.sku, String(a.id), a.location ?? '', a.notes ?? '']
      .some(x => String(x).toLowerCase().includes(term))
    const okS = !status.value || inv.statusOf(a) === status.value
    return okQ && okS
  })
})

async function remove(id: string|number|undefined) {
  if (id == null) return
  if (!confirm('Diesen Artikel wirklich löschen?')) return
  await inv.removeOne(id)
}
</script>

<template>
  <div>
    <h1>Lager</h1>

    <!-- Einheitliche Toolbar -->
    <div class="toolbar">
      <div class="left">
        <input v-model="q" class="input" placeholder="Suchen… (Name, SKU, ID, Lagerplatz)" />
        <Dropdown v-model="status" :options="statusOptions" placeholder="Alle Artikel" />
        <button class="btn" type="button" @click="reload">Aktualisieren</button>
      </div>

      <div class="right">
        <button class="btn primary" type="button" @click="router.push({ name: 'inventory-new' })">
          + Neuer Artikel
        </button>
      </div>
    </div>

    <LoadState :loading="inv.loading" :error="inv.error">
      <Card>
        <template #default>
          <table v-if="filtered.length" class="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>SKU</th>
                <th>Name</th>
                <th class="r">Bestand</th>
                <th class="r">Mindest</th>
                <th>Status</th>
                <th>Lagerplatz</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(a,i) in filtered" :key="rowKey(a,i)">
                <td>#{{ a.id }}</td>
                <td>{{ a.sku }}</td>
                <td>{{ a.name }}</td>
                <td class="r">{{ a.stock }}</td>
                <td class="r">{{ a.minStock ?? '—' }}</td>
                <td>
                  <StatusBadge :status="inv.statusOf(a)" />
                </td>
                <td>{{ a.location || '—' }}</td>
                <td class="actions">
                  <button class="btn" @click="router.push({ name: 'inventory-detail', params:{ id: a.id } })">
                    Details
                  </button>
                  <button class="btn danger" @click="remove(a.id)">Löschen</button>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-else>Keine Artikel gefunden.</p>
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
.left{ display:flex; gap:.5rem; align-items:center; flex-wrap:wrap }
.right{ display:flex; gap:.5rem }

.tbl{ width:100%; border-collapse:collapse }
th, td{ padding:.55rem; border-bottom:1px solid #eee; text-align:left }
td.r{ text-align:right }
.actions{ display:flex; gap:.4rem; justify-content:flex-end }
</style>
