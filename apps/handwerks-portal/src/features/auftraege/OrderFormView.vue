<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrder, createOrder, updateOrder, type Order } from '@/services/orders'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Textarea from '@/components/ui/Textarea.vue'

const route = useRoute()
const router = useRouter()

// ---- Refs deklarieren ----
const form = ref<Order>({
  customerId: 42,
  title: '',
  status: 'offen',
  due: '',
  notes: ''
})
const saving = ref(false)
const error = ref<string | null>(null)

// ---- Computeds deklarieren ----
const idRaw = computed(() => (route.params.id as string | undefined) ?? '')
const hasId = computed(() => !!idRaw.value)
const isEdit = computed(() => hasId.value)

onMounted(async () => {
  if (hasId.value) {
    try {
      const data = await getOrder(idRaw.value)
      form.value = { status: 'offen', notes: '', due: '', ...data }
    } catch (e: any) {
      error.value = e?.message ?? String(e)
    }
  }
})

async function save() {
  if (saving.value) return
  saving.value = true
  error.value = null
  try {
    if (hasId.value) {
      await updateOrder(idRaw.value, form.value)
      router.push({ name: 'orders-detail', params: { id: idRaw.value } })
    } else {
      const created = await createOrder(form.value)
      const newId = (created as any)?.id
      if (newId != null) {
        router.replace({ name: 'orders-detail', params: { id: String(newId) } })
      } else {
        router.push({ name: 'orders-list' })
      }
    }
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h1>{{ isEdit ? 'Auftrag bearbeiten' : 'Neuen Auftrag anlegen' }}</h1>
    <Card>
      <form class="form" @submit.prevent="save">
        <label> Titel
          <Input v-model.trim="form.title" required placeholder="z. B. Heizungswartung" />
        </label>

        <label> Kunde (ID)
          <Input v-model.number="form.customerId" type="number" min="1" />
        </label>

        <label> Status
          <Select v-model="form.status">
            <option>offen</option>
            <option>in Arbeit</option>
            <option>erledigt</option>
          </Select>
        </label>

        <label> Fällig am
          <Input v-model="form.due" type="date" />
        </label>

        <label> Notizen
          <Textarea v-model.trim="form.notes" rows="4" />
        </label>

        <div v-if="error" style="color:#b00020;margin-top:.25rem">{{ error }}</div>

        <div class="row">
          <UiButton variant="primary" type="submit" :disabled="saving" :loading="saving">
            {{ saving ? 'Speichern…' : 'Speichern' }}
          </UiButton>
          <UiButton type="button" @click="$router.back()">Abbrechen</UiButton>
        </div>
      </form>
    </Card>
  </div>
</template>

<style scoped>
.form{display:grid;gap:.75rem;max-width:560px}
label{display:grid;gap:.3rem}
input,select,textarea{padding:.55rem;border:1px solid #ddd;border-radius:.5rem}
.row{display:flex;gap:.5rem;margin-top:.5rem}
</style>
