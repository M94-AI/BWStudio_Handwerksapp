<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import UiButton from '@/components/ui/Button.vue'
import {
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer,
} from '@/services/customers'


const route = useRoute()
const router = useRouter()

// ---- State ----
const form = ref<Partial<Customer>>({
  name: '',
  email: '',
  phone: '',
  street: '',
  zip: '',
  city: '',
  notes: '',
})

const saving = ref(false)
const error = ref<string | null>(null)

// ---- Edit / New-Erkennung ----
const idRaw = computed(() => (route.params.id as string | undefined) ?? '')
const hasId = computed(() => !!idRaw.value)
const isEdit = computed(() => hasId.value)

// ---- Kunde laden ----
onMounted(async () => {
  if (!hasId.value) return

  try {
    const data = await getCustomer(idRaw.value)

    // Defaults + Daten aus Backend
    form.value = {
      name: '',
      email: '',
      phone: '',
      street: '',
      zip: '',
      city: '',
      notes: '',
      ...data,
    }
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  }
})

// ---- Speichern ----
async function save() {
  if (saving.value) return
  saving.value = true
  error.value = null

  try {
    if (hasId.value) {
      // Bearbeiten
      await updateCustomer(idRaw.value, form.value as Customer)
      router.push({ name: 'customers-detail', params: { id: idRaw.value } })
    } else {
      // Neu anlegen
      const created = await createCustomer(form.value as Customer)
      const newId = (created as any)?.id

      if (newId != null) {
        router.replace({ name: 'customers-detail', params: { id: String(newId) } })
      } else {
        router.push({ name: 'customers-list' })
      }
    }
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  } finally {
    saving.value = false
  }
}

// ---- Lösche ----
async function removeCustomer() {
  if (!hasId.value) return
  if (!confirm('Diesen Kunden wirklich löschen?')) return

  try {
    await deleteCustomer(idRaw.value)
    router.push({ name: 'customers-list' })
  } catch (e: any) {
    alert(e?.message ?? String(e))
  }
}
</script>

<template>
  <div>
    <h1>{{ isEdit ? 'Kunde bearbeiten' : 'Neuen Kunden anlegen' }}</h1>

    <Card>
      <form class="form" @submit.prevent="save">
        <label>
          Name
          <Input v-model.trim="form.name" required placeholder="z. B. Max Mustermann" />
        </label>

        <label>
          E-Mail
          <Input v-model.trim="form.email" type="email" placeholder="kunde@example.de" />
        </label>

        <label>
          Telefon
          <Input v-model.trim="form.phone" placeholder="+49 ..." />
        </label>

        <label>
          Straße
          <Input v-model.trim="form.street" placeholder="Musterstraße 1" />
        </label>

        <label>
          PLZ
          <Input v-model.trim="form.zip" placeholder="12345" />
        </label>

        <label>
          Ort
          <Input v-model.trim="form.city" placeholder="Musterstadt" />
        </label>

        <label>
          Notizen
          <Textarea v-model.trim="form.notes" rows="4" placeholder="Besondere Hinweise..." />
        </label>

        <div v-if="error" style="color:#b00020;margin-top:.25rem">
          {{ error }}
        </div>

        <div class="row">
          <UiButton
            variant="primary"
            type="submit"
            :disabled="saving"
            :loading="saving"
          >
            {{ saving ? 'Speichern…' : 'Speichern' }}
          </UiButton>

          <UiButton type="button" @click="$router.back()">
            Abbrechen
          </UiButton>

          <UiButton
            v-if="isEdit"
            type="button"
            variant="danger"
            class="spacer-left"
            @click="removeCustomer"
          >
            Löschen
          </UiButton>
        </div>
      </form>
    </Card>
  </div>
</template>

<style scoped>
.form {
  display: grid;
  gap: .75rem;
  max-width: 560px;
}

label {
  display: grid;
  gap: .3rem;
}

.row {
  display: flex;
  gap: .5rem;
  margin-top: .75rem;
  flex-wrap: wrap;
}

.spacer-left {
  margin-left: auto;
}
</style>
