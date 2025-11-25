<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { listCustomers, type Customer, deleteCustomer } from '@/services/customers'

const router = useRouter()
const items = ref<Customer[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Toolbar-States
const q = ref('')

// Sortierung nach Name
const sortDir = ref<'asc' | 'desc'>('asc')
function toggleSortName() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}
function sortArrow() {
  return sortDir.value === 'asc' ? '▲' : '▼'
}

async function reload() {
  loading.value = true
  error.value = null
  try {
    items.value = await listCustomers()
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}
onMounted(reload)

const visible = computed(() => {
  const term = q.value.trim().toLowerCase()
  let rows = items.value.filter(c => {
    const inText =
      !term ||
      [c.name, c.email, c.phone, String(c.id)]
        .filter(Boolean)
        .some(s => String(s).toLowerCase().includes(term))
    return inText
  })

  rows = [...rows].sort((a, b) => {
    const A = (a.name || '').toLowerCase()
    const B = (b.name || '').toLowerCase()
    return sortDir.value === 'asc'
      ? A > B
        ? 1
        : A < B
        ? -1
        : 0
      : A < B
      ? 1
      : A > B
      ? -1
      : 0
  })
  return rows
})

async function remove(id: string | number) {
  if (!confirm('Diesen Kunden wirklich löschen?')) return
  await deleteCustomer(id)
  items.value = items.value.filter(c => String(c.id) !== String(id))
}
</script>

<template>
  <div class="stack">
    <h1>Kunden</h1>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="left">
        <input
          v-model="q"
          class="input"
          placeholder="Suchen… (Name, E-Mail, Telefon, #ID)"
        />
        <UiButton variant="ghost" @click="reload">Aktualisieren</UiButton>
      </div>

      <div class="right">
        <UiButton
          variant="primary"
          type="button"
          @click="router.push({ name: 'customers-new' })"
        >
          + Neuer Kunde
        </UiButton>
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
              <td class="actions">
                <UiButton @click="router.push(`/kunden/${c.id}`)">
                  Details
                </UiButton>
                <UiButton variant="danger" @click="remove(c.id)">
                  Löschen
                </UiButton>
              </td>
            </tr>
            <tr v-if="!visible.length">
              <td colspan="5" style="color:#777; padding:.9rem .55rem;">
                Keine Kunden gefunden.
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </LoadState>
  </div>
</template>

<style scoped>
.stack > * + * {
  margin-top: 1rem;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  margin: .75rem 0;
  flex-wrap: wrap;
}
.left {
  display: flex;
  gap: .5rem;
  align-items: center;
  flex-wrap: wrap;
}
.right {
  display: flex;
  gap: .5rem;
}

/* Tabelle */
.tbl {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: .55rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}

/* Actions-Zelle */
.actions {
  display: flex;
  gap: .4rem;
  justify-content: flex-end;
  white-space: nowrap;
}

/* Sortierbarer Header */
.th-btn {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
  padding: 0;
}
.arrow {
  min-width: 1em;
  display: inline-block;
  color: #888;
}
</style>
