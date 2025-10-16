<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { listOffers, type Offer } from '@/services/offers'

const loading = ref(false)
const error = ref<string|null>(null)
const items = ref<Offer[]>([])

onMounted(load)
async function load() {
  loading.value = true; error.value = null
  try { items.value = await listOffers() }
  catch (e:any) { error.value = e?.message ?? String(e) }
  finally { loading.value = false }
}
</script>

<template>
  <div>
    <h1>Angebote</h1>
    <Card>
      <!-- kein #default nötig, default slot ist implizit -->
      <p v-if="loading">Lade…</p>
      <p v-else-if="error" style="color:#b3261e">Fehler: {{ error }}</p>

      <!-- v-else-Block kapseln -->
      <template v-else>
        <!-- innen wieder mit template arbeiten, damit v-else sicher „adjacent“ ist -->
        <template v-if="items.length">
          <table class="tbl">
            <thead>
              <tr>
                <th>#</th><th>Titel</th><th>Status</th><th>Summe</th><th>Gültig bis</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in items" :key="o.id">
                <td>#{{ o.id }}</td>
                <td>{{ o.title }}</td>
                <td><StatusBadge :status="o.status" /></td>
                <td>{{ o.total != null ? o.total.toFixed(2) + '€' : '—' }}</td>
                <td>{{ o.validUntil || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <p v-else>Keine Angebote.</p>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.tbl{width:100%;border-collapse:collapse}
th,td{padding:.5rem;border-bottom:1px solid #eee;text-align:left}
</style>
