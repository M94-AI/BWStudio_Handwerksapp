<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Dropdown from '@/components/ui/Dropdown.vue'
import { listInvoices, deleteInvoice, type Invoice } from '@/services/invoices'

const router = useRouter()

// Daten
const items = ref<Invoice[]>([])
const loading = ref(false)
const error = ref<string|null>(null)

// Toolbar-States
const q = ref('')
// '' = Alle (Default), ansonsten 'offen' | 'bezahlt' | 'überfällig'
const status = ref('')

// Sortier-State (Fällig)
type SortDir = 'asc' | 'desc'
const sortDueDir = ref<SortDir>('asc')

// Dropdown-Optionen
const statusOptions = [
  { label: 'Offene Rechnungen',   value: 'offen' },
  { label: 'Bezahlte Rechnungen', value: 'bezahlt' },
  { label: 'Überfällige Rechnungen', value: 'überfällig' },
]

// Laden
onMounted(reload)
async function reload(){
  loading.value = true; error.value = null
  try { items.value = await listInvoices() }
  catch(e:any){ error.value = e?.message ?? String(e) }
  finally { loading.value = false }
}

// Hilfen
function daysUntil(d?: string){
  if (!d) return Infinity
  const a = new Date(d+'T00:00:00'), b = new Date()
  const A = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const B = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((A-B)/86400000)
}
const isOverdue = (i: Invoice) => i.status !== 'bezahlt' && daysUntil(i.dueDate) < 0

function toggleDueSort(){
  sortDueDir.value = sortDueDir.value === 'asc' ? 'desc' : 'asc'
}
function sortArrow(){ return sortDueDir.value === 'asc' ? '▲' : '▼' }

// Filtern + Sortieren
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()

  let rows = items.value.filter(i => {
    // Suche
    const okQ = !term || [
      i.title,
      String(i.id ?? ''),
      String(i.customerId ?? ''),
      String(i.orderId ?? '')
    ].some(x => String(x).toLowerCase().includes(term))

    // Status-Filter (Dropdown steuert direkt `status`)
    let okS = true
    if (status.value === 'offen')         okS = i.status === 'offen'
    else if (status.value === 'bezahlt')  okS = i.status === 'bezahlt'
    else if (status.value === 'überfällig') okS = isOverdue(i)

    return okQ && okS
  })

  // Sortierung nach dueDate (leer ans Ende)
  rows = rows.sort((a,b) => {
    const A = a.dueDate ?? '9999-12-31'
    const B = b.dueDate ?? '9999-12-31'
    const cmp = A.localeCompare(B)
    return sortDueDir.value === 'asc' ? cmp : -cmp
  })

  return rows
})

async function remove(id: string | number | undefined){
  if (id == null) return
  if (!confirm('Diese Rechnung wirklich löschen?')) return
  await deleteInvoice(id)
  items.value = items.value.filter(i => i.id !== id)
}
</script>

<template>
  <div>
    <h1>Rechnungen</h1>

    <div class="toolbar">
      <div class="left">
        <input v-model="q" class="input" placeholder="Suchen…" />
        <Dropdown
          v-model="status"
          :options="statusOptions"
          placeholder="Alle Rechnungen"
        />

        <UiButton variant="ghost" type="button" @click="reload">Aktualisieren</UiButton>
      </div>

      <div class="right">

        <UiButton variant="primary" type="button" @click="router.push({ name: 'invoices-new' })">
          + Neue Rechnung
        </UiButton>
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
                <th style="width:160px">
                  <button class="th-btn" @click="toggleDueSort" :aria-label="`Nach Fällig sortieren ${sortArrow()}`">
                    Fällig <span class="arrow">{{ sortArrow() }}</span>
                  </button>
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

                  <UiButton @click="router.push(`/rechnungen/${i.id}`)">Details</UiButton>

                  <UiButton variant="danger" @click="remove(i.id)">Löschen</UiButton>
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
.left{ display:flex; gap:.5rem; align-items:center; flex-wrap:wrap }
.right{ display:flex; gap:.5rem }

/* Tabelle */
.tbl{ width:100%; border-collapse:collapse }
th, td{ padding:.55rem; border-bottom:1px solid #eee; text-align:left }
td.r{ text-align:right }
.actions{ display:flex; gap:.4rem; justify-content:flex-end }

/* Sortierbarer Header */
.th-btn{
  display:inline-flex; align-items:center; gap:.35rem;
  border:0; background:transparent; cursor:pointer; font:inherit; padding:0;
}
.arrow{ min-width:1em; display:inline-block; color:#888 }
</style>
