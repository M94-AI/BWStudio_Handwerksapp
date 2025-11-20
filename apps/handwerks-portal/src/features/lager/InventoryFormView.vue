<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { useInventoryStore } from '@/stores/inventory'

const route = useRoute()
const router = useRouter()
const inv = useInventoryStore()

const isNew = computed(() => !route.params.id)
const title = computed(() => (isNew.value ? 'Neuer Lagerartikel' : 'Artikel bearbeiten'))

//refs
const name = ref('')
const sku = ref('')
const stock = ref<number | null>(0)
const minStock = ref<number | null>(0)
const unit = ref('')
const location = ref('')
const notes = ref('')

const localError = ref<string | null>(null)
const saving = ref(false)

onMounted(async () => {
  if (!isNew.value) {
    await inv.fetchAll()
    const id = route.params.id
    const item = inv.all.find(a => String(a.id) === String(id))
    if (!item) {
      localError.value = 'Artikel wurde nicht gefunden.'
      return
    }
    name.value = item.name
    sku.value = item.sku ?? ''
    stock.value = item.stock
    minStock.value = item.minStock ?? null
    unit.value = item.unit ?? ''
    location.value = item.location ?? ''
    notes.value = item.notes ?? ''
  }
})

async function save() {
  saving.value = true
  localError.value = null
  try {
    if (!name.value.trim()) {
      throw new Error('Name darf nicht leer sein.')
    }

    const payload = {
      name: name.value.trim(),
      sku: sku.value.trim() || null,
      stock: Number(stock.value ?? 0),
      minStock: minStock.value != null ? Number(minStock.value) : null,
      unit: unit.value.trim() || null,
      location: location.value.trim() || null,
      notes: notes.value.trim() || null,
    }

    if (isNew.value) {
      await inv.createOne(payload as any)
    } else {
      const id = route.params.id as string | number
      await inv.updateOne(id, payload as any)
    }

    //nach Erfolg immer zurück zur Lagerliste
    router.push({ name: 'inventory-list' })
  } catch (e: any) {
    localError.value = e?.message ?? String(e)
  } finally {
    saving.value = false
  }
}

function cancel() {
  router.push({ name: 'inventory-list' })
}
</script>

<template>
  <div>
    <h1>{{ title }}</h1>

    <LoadState :loading="inv.loading || saving" :error="inv.error || localError">
      <Card>
        <template #default>
          <form class="form" @submit.prevent="save">
            <div class="grid">
              <div class="field">
                <label for="name">Name *</label>
                <input id="name" v-model="name" class="input" required />
              </div>

              <div class="field">
                <label for="sku">SKU / Artikelnummer</label>
                <input id="sku" v-model="sku" class="input" />
              </div>

              <div class="field">
                <label for="stock">Bestand</label>
                <input
                  id="stock"
                  v-model.number="stock"
                  type="number"
                  min="0"
                  class="input"
                />
              </div>

              <div class="field">
                <label for="minStock">Mindestbestand</label>
                <input
                  id="minStock"
                  v-model.number="minStock"
                  type="number"
                  min="0"
                  class="input"
                />
                <small class="hint">
                  Sobald der Bestand ≤ Mindestbestand ist, erscheint der Artikel im Dashboard.
                </small>
              </div>

              <div class="field">
                <label for="unit">Einheit (z. B. Stk, m, kg)</label>
                <input id="unit" v-model="unit" class="input" />
              </div>

              <div class="field">
                <label for="location">Lagerplatz</label>
                <input id="location" v-model="location" class="input" />
              </div>

              <div class="field field-notes">
                <label for="notes">Notizen</label>
                <textarea id="notes" v-model="notes" class="input" rows="4" />
              </div>
            </div>

            <div class="actions">
              <UiButton type="button" variant="ghost" @click="cancel">
                Abbrechen
              </UiButton>
              <UiButton type="submit" variant="primary">
                {{ isNew ? 'Artikel anlegen' : 'Änderungen speichern' }}
              </UiButton>
            </div>
          </form>
        </template>
      </Card>
    </LoadState>
  </div>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: .25rem;
}
.field-notes {
  grid-column: 1 / -1;
}
label {
  font-size: .9rem;
  font-weight: 500;
}
.hint {
  font-size: .8rem;
  color: #666;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: .5rem;
  margin-top: .5rem;
}
@media (max-width: 800px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
