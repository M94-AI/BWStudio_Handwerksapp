<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import UiButton from '@/components/ui/Button.vue'
import { getOrder, deleteOrder, type Order } from '@/services/orders'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const item = ref<Order | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Auftrag laden
onMounted(load)
async function load() {
  loading.value = true
  error.value = null
  try {
    const data = await getOrder(id)
    item.value = {
      status: 'offen',
      notes: '',
      due: '',
      ...data,
    }
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

// Bearbeiten
function goEdit() {
  if (!item.value?.id) return
  router.push({ name: 'orders-edit', params: { id: String(item.value.id) } })
}

// Löschen
async function remove() {
  if (!item.value?.id) return
  if (!confirm('Diesen Auftrag wirklich löschen?')) return
  await deleteOrder(item.value.id)
  router.push({ name: 'orders-list' })
}

// Zurück zur Auftragsliste
function cancel() {
  router.push({ name: 'orders-list' })
}
</script>

<template>
  <div class="stack">
    <h1>Auftrag #{{ id }}</h1>
    <LoadState :loading="loading" :error="error">
      <Card v-if="item" :title="item.title">
        <div class="grid">
          <div>
            <div class="label">Kunde</div>
            <div>#{{ item.customerId }}</div>
          </div>
          <div>
            <div class="label">Status</div>
            <div><StatusBadge :status="item.status" /></div>
          </div>
          <div>
            <div class="label">Fällig am</div>
            <div>{{ item.due || '—' }}</div>
          </div>
          <div>
            <div class="label">Notizen</div>
            <div>{{ item.notes || '—' }}</div>
          </div>
        </div>

        <div class="row">
          <UiButton @click="goEdit">Bearbeiten</UiButton>
          <UiButton variant="danger" @click="remove">Löschen</UiButton>
          <UiButton type="button" @click="cancel">Zurück</UiButton>
        </div>
      </Card>

      <Card v-else title="Auftrag nicht gefunden">
        <p v-if="error">Fehler: {{ error }}</p>
        <UiButton @click="cancel">Zur Liste</UiButton>
      </Card>
    </LoadState>
  </div>
</template>

<style scoped>
.stack > * + * {
  margin-top: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
@media (max-width: 800px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
.label {
  font-size: .85rem;
  color: #666;
}
.row {
  margin-top: 1rem;
  display: flex;
  gap: .5rem;
}
</style>
