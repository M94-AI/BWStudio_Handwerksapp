<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrder, createOrder, updateOrder, type Order } from '@/services/orders'
import { createCalendarEvent } from '@/services/calendar'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Textarea from '@/components/ui/Textarea.vue'

const route = useRoute()
const router = useRouter()

// ---- Form-State ----
const form = ref<Order>({
  customerId: 42,
  title: '',
  status: 'offen',
  due: '',
  notes: '',
})

const saving = ref(false)
const error = ref<string | null>(null)

// 🆕 Kalender-Optionen
const createCalendar = ref(false)
const startTime = ref('08:00')
const endTime = ref('09:00')

// ---- Edit / New ----
const idRaw = computed(() => (route.params.id as string | undefined) ?? '')
const hasId = computed(() => !!idRaw.value)
const isEdit = computed(() => hasId.value)

// ---- Bestehenden Auftrag laden (Edit) ----
onMounted(async () => {
  if (hasId.value) {
    try {
      const data = await getOrder(idRaw.value)
      form.value = {
        customerId: 42,
        title: '',
        status: 'offen',
        due: '',
        notes: '',
        ...data,
      }
    } catch (e: any) {
      error.value = e?.message ?? String(e)
    }
  }
})

// ---- Speichern ----
async function save() {
  if (saving.value) return
  saving.value = true
  error.value = null

  try {
    let orderId: string | null = null

    if (hasId.value) {
      // Bearbeiten
      await updateOrder(idRaw.value, form.value)
      orderId = idRaw.value
    } else {
      // Neu anlegen
      const created = await createOrder(form.value)
      const newId = (created as any)?.id
      orderId = newId != null ? String(newId) : null
    }

    // 🆕 Optional Kalendereintrag erstellen
    if (createCalendar.value && form.value.due) {
      try {
        const date = form.value.due // 'YYYY-MM-DD'

        const startIso = new Date(`${date}T${startTime.value}:00`).toISOString()
        const endIso = new Date(`${date}T${endTime.value}:00`).toISOString()

        await createCalendarEvent({
          title: form.value.title || 'Auftrag',
          start: startIso,
          end: endIso,
          relatedOrderId: orderId ?? undefined,
        })
      } catch (e: any) {
        console.error('Kalendereintrag fehlgeschlagen:', e)
        // Wenn du später magst:
        // error.value = 'Auftrag gespeichert, aber Kalendereintrag fehlgeschlagen.'
      }
    }

    // Nach dem Speichern zur Detailansicht
    if (orderId != null) {
      router.push({ name: 'orders-detail', params: { id: orderId } })
    } else {
      router.push({ name: 'orders-list' })
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
        <label>
          Titel
          <Input v-model.trim="form.title" required placeholder="z. B. Heizungswartung" />
        </label>

        <label>
          Kunde (ID)
          <Input v-model.number="form.customerId" type="number" min="1" />
        </label>

        <label>
          Status
          <Select v-model="form.status">
            <option>offen</option>
            <option>in Arbeit</option>
            <option>erledigt</option>
          </Select>
        </label>

        <label>
          Fällig am
          <Input v-model="form.due" type="date" />
        </label>

        <!-- 🆕 Kalender-Block -->
        <div class="calendar-block">
          <label class="inline">
            <input v-model="createCalendar" type="checkbox" />
            <span>Kalendereintrag für diesen Auftrag erstellen</span>
          </label>

          <div v-if="createCalendar" class="calendar-times">
            <div>
              <div class="label">Beginn</div>
              <Input v-model="startTime" type="time" />
            </div>
            <div>
              <div class="label">Ende</div>
              <Input v-model="endTime" type="time" />
            </div>
          </div>
        </div>

        <label>
          Notizen
          <Textarea v-model.trim="form.notes" rows="4" />
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
  margin-top: .5rem;
}

/* 🆕 Kalender-Styles */
.calendar-block {
  display: grid;
  gap: .5rem;
  margin-top: .25rem;
}

.calendar-block .inline {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
}

.calendar-times {
  display: flex;
  gap: .75rem;
  flex-wrap: wrap;
}

.calendar-times .label {
  font-size: .8rem;
  color: #666;
}
</style>
