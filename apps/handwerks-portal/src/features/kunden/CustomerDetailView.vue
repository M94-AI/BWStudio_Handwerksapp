<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { getCustomer, type Customer } from '@/services/customers'
import UiButton from '@/components/ui/Button.vue'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const item = ref<Customer | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Bearbeiten
function goEdit() {
  if (!item.value?.id) return
  router.push({ name: 'customer-edit', params: { id: String(item.value.id) } })
}

// Laden
onMounted(load)
async function load() {
  loading.value = true
  error.value = null
  try {
    item.value = await getCustomer(id)
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

// Zur Kundenliste zurück
function cancel() {
  router.push({ name: 'customers-list' })
}
</script>

<template>
  <div class="stack">
    <h1>Kunde #{{ id }}</h1>
    <LoadState :loading="loading" :error="error">
      <Card v-if="item" :title="item.name">
        <div class="grid">
          <div>
            <div class="label">E-Mail</div>
            <div>
              <a v-if="item.email" :href="`mailto:${item.email}`">
                {{ item.email }}
              </a>
              <span v-else>—</span>
            </div>
          </div>

          <div>
            <div class="label">Telefon</div>
            <div>
              <a v-if="item.phone" :href="`tel:${item.phone}`">
                {{ item.phone }}
              </a>
              <span v-else>—</span>
            </div>
          </div>

          <div>
            <div class="label">Adresse</div>
            <div>
              {{
                [item.street, item.zip, item.city]
                  .filter(Boolean)
                  .join(', ') || '—'
              }}
            </div>
          </div>

          <div>
            <div class="label">Rechnungsadresse</div>
            <div>
              {{
                [item.billingStreet, item.billingZip, item.billingCity]
                  .filter(Boolean)
                  .join(', ') || '—'
              }}
            </div>
          </div>

          <div v-if="item.notes">
            <div class="label">Notizen</div>
            <div>{{ item.notes }}</div>
          </div>
        </div>

        <div class="row">
          <UiButton @click="goEdit">Bearbeiten</UiButton>
          <UiButton type="button" @click="cancel">Zurück</UiButton>
        </div>
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
