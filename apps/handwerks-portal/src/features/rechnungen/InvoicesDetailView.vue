<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { getInvoice, type Invoice } from '@/services/invoices'

const route = useRoute()
const router = useRouter()

const item = ref<Invoice | null>(null)
const loading = ref(false)
const error = ref<string|null>(null)

onMounted(async () => {
  loading.value = true; error.value = null
  try {
    item.value = await getInvoice(String(route.params.id))
  } catch (e:any) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
})

function back(){ router.push({ name: 'invoices-list' }) }

function isOverdue(i: Invoice){
  if (i.status === 'bezahlt') return false
  if (!i.dueDate) return false
  const a = new Date(i.dueDate + 'T00:00:00'), b = new Date()
  const A = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const B = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return (A - B) < 0
}
</script>

<template>
  <div>
    <div class="hdr">
      <h1>Rechnung #{{ item?.id ?? '—' }}</h1>
      <div class="hdr-actions">
        <button class="btn" @click="back">Zur Übersicht</button>
      </div>
    </div>

    <LoadState :loading="loading" :error="error">
      <Card>
        <template #default>
          <div v-if="item" class="grid gap-12">
            <section class="grid gap-.5">
              <div class="label">Titel</div>
              <div class="val">{{ item.title }}</div>
            </section>

            <section class="grid gap-1 info">
              <div><span class="label">Kunde:</span> #{{ item.customerId }}</div>
              <div><span class="label">Auftrag:</span> {{ item.orderId ?? '—' }}</div>
              <div class="row">
                <span class="label">Status:</span>
                <StatusBadge :status="isOverdue(item) ? 'überfällig' : item.status" />
              </div>
              <div><span class="label">Fällig am:</span> {{ item.dueDate || '—' }}</div>
              <div><span class="label">Summe:</span> {{ (item.total ?? 0).toFixed(2) }}€</div>
            </section>

            <section class="grid gap-.5">
              <div class="label">Notizen</div>
              <div class="val">{{ item.notes || '—' }}</div>
            </section>
          </div>
          <p v-else>Keine Daten gefunden.</p>
        </template>
      </Card>
    </LoadState>
  </div>
</template>

<style scoped>
.hdr{ display:flex; align-items:center; justify-content:space-between; gap:.5rem; margin-bottom:.75rem }
.hdr-actions{ display:flex; gap:.5rem }
.label{ font-size:.85rem; opacity:.7 }
.val{ font-weight:600 }
.info{ display:grid; gap:.35rem }
.row{ display:flex; align-items:center; gap:.5rem }
</style>
