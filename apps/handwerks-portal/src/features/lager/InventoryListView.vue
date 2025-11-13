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

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="left">
        <input v-model="q" class="input" placeholder="Suchen… (Name, SKU, ID, Lagerplatz)" />
        <Dropdown v-model="status" :options="statusOptions" placeholder="Alle Artikel" />
        <UiButton variant="ghost" type="button" @click="reload">Aktualisieren</UiButton>
      </div>
      <div class="right">
        <UiButton variant="primary" type="button" @click="router.push({ name: 'inventory-new' })">
          + Neuer Artikel
        </UiButton>
      </div>
    </div>

    <LoadState :loading="inv.loading" :error="inv.error">
      <Card>
        <template #default>
          <div class="inv">
            <div class="table-wrap">
              <table v-if="filtered.length" class="tbl">
                <colgroup>
                  <col style="width:72px" />
                  <col />
                  <col style="width:110px" />
                  <col style="width:130px" />
                  <col style="width:200px" />
                  <col style="width:220px" />
                </colgroup>

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th class="r">Bestand</th>
                    <th>Status</th>
                    <th>Lagerplatz</th>
                    <th class="r">Aktionen</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(a,i) in filtered" :key="rowKey(a,i)">
                    <td>#{{ a.id }}</td>
                    <td class="cell-name">{{ a.name }}</td>
                    <td class="r">{{ a.stock }}</td>
                    <td><StatusBadge :status="inv.statusOf(a)" /></td>
                    <td>{{ a.location || '—' }}</td>
                    <td class="actions">
                      <UiButton class="btn-sm" @click="router.push({ name: 'inventory-detail', params:{ id: a.id } })">Details</UiButton>
                      <UiButton class="btn-sm" variant="danger" @click="remove(a.id)">Löschen</UiButton>
                    </td>
                  </tr>
                </tbody>
              </table>

              <p v-else>Keine Artikel gefunden.</p>
            </div>
          </div>
        </template>
      </Card>
    </LoadState>
  </div>
</template>

<style>
.toolbar{
  display:flex; align-items:center; justify-content:space-between;
  gap:.5rem; margin:.75rem 0; flex-wrap:wrap;
}
.left{ display:flex; gap:.5rem; align-items:center; flex-wrap:wrap }
.right{ display:flex; gap:.5rem }

/* alles in .inv gekapselt, damit nichts anderes leidet */
.inv .table-wrap{ width:100%; overflow-x:auto; }
.inv .tbl{ width:100%; border-collapse:collapse; table-layout:auto; }

.inv th, .inv td{
  padding:.55rem; border-bottom:1px solid #eee; text-align:left; vertical-align:middle;
}
.inv td.r, .inv th.r{ text-align:right }

/* einzeilig + Ellipsis hält Head/Body bündig */
.inv .tbl th, .inv .tbl td{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

/* Name darf flexibel sein, bleibt aber einzeilig */
.inv .cell-name{ max-width:1px }

/* Actions: in einer Reihe, kein Umbruch */
.inv .actions{
  display:flex; gap:.4rem; justify-content:flex-end; white-space:nowrap;
}

/* kleine Buttons in der Tabelle */
.inv .btn-sm{ padding:.35rem .55rem; font-size:.9rem }
</style>
