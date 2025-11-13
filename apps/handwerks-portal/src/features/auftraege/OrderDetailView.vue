<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { getOrder, deleteOrder, type Order } from '@/services/orders'

const route = useRoute()
const router = useRouter()
const item = ref<Order | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function loadWithRetry() {
  loading.value = true
  error.value = null
  const id = route.params.id as string

  // bis zu 2 Versuche (direkt + nach kurzer Pause)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const data = await getOrder(id)
      // Defaults setzen, falls Felder fehlen
      item.value = {
        status: 'offen',
        notes: '',
        due: '',
        ...data,
      }
      error.value = null
      break
    } catch (e: any) {
      error.value = e?.message ?? String(e)
      if (/HTTP 404/.test(error.value) && attempt === 0) {
        // kurzer Retry nach 200ms
        await new Promise(r => setTimeout(r, 200))
        continue
      }
    }
  }
  loading.value = false
}

onMounted(loadWithRetry)

async function remove() {
  if (!item.value?.id) return
  if (!confirm('Diesen Auftrag wirklich löschen?')) return
  await deleteOrder(item.value.id)
  router.push('/auftraege')
}
</script>

<template>
  <div>
    <h1>Auftrag</h1>
    <LoadState :loading="loading" :error="error">
      <Card v-if="item" :title="`#${item.id} · ${item.title}`">
        <p><strong>Kunde:</strong> #{{ item.customerId }}</p>
        <p><strong>Status:</strong> <StatusBadge :status="item.status" /></p>
        <p><strong>Fällig:</strong> {{ item.due || '—' }}</p>
        <p><strong>Notizen:</strong> {{ item.notes || '—' }}</p>

        <div class="actions">
          <UiButton @click="$router.push(`/auftraege/${item.id}?edit=1`)">Bearbeiten</UiButton>
          <UiButton variant="danger" @click="remove">Löschen</UiButton>
          <UiButton @click="$router.push('/auftraege')">Zurück</UiButton>
        </div>
      </Card>

      <!-- Fallback, falls item trotz allem fehlt -->
      <Card v-else title="Auftrag nicht gefunden">
        <p v-if="error">Fehler: {{ error }}</p>
        <UiButton @click="$router.push('/auftraege')">Zur Liste</UiButton>
      </Card>
    </LoadState>
  </div>
</template>

<style scoped>
.actions{
  display:flex;
  gap:.5rem;
  margin-top:.75rem;
  flex-wrap:wrap;
}
</style>
