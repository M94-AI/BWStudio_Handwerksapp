<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { createInvoice, type Invoice } from '@/services/invoices'

const router = useRouter()
const loading = ref(false)
const error = ref<string|null>(null)

const form = ref<Invoice>({
  title: '',
  customerId: 0,
  orderId: undefined,
  status: 'offen',
  total: 0,
  dueDate: new Date(Date.now() + 14*86400000).toISOString().slice(0,10),
  notes: ''
})

async function submit(){
  error.value = null; loading.value = true
  try{
    if (!form.value.title) throw new Error('Bitte einen Titel angeben.')
    if (!form.value.customerId || Number.isNaN(Number(form.value.customerId))) {
      throw new Error('Bitte eine gültige Kunden-ID angeben.')
    }
    const created = await createInvoice(form.value)
    const id = (created as any)?.id ?? form.value.id
    if (id != null) router.push(`/rechnungen/${id}`)
    else router.push({ name: 'invoices-list' })
  } catch(e:any){
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1>Neue Rechnung</h1>

    <LoadState :loading="loading" :error="error">
      <Card>
        <template #default>
          <form class="form" @submit.prevent="submit">
            <div class="row">
              <label class="lbl">Titel</label>
              <input v-model="form.title" class="input" placeholder="z. B. Rechnung für Auftrag #123" />
            </div>

            <div class="row">
              <label class="lbl">Kunde (ID)</label>
              <input v-model.number="form.customerId" type="number" min="1" class="input" placeholder="z. B. 42" />
            </div>

            <div class="row">
              <label class="lbl">Auftrag (optional)</label>
              <input v-model="form.orderId" class="input" placeholder="z. B. 123" />
            </div>

            <div class="row">
              <label class="lbl">Status</label>
              <select v-model="form.status" class="input">
                <option value="offen">offen</option>
                <option value="bezahlt">bezahlt</option>
              </select>
            </div>

            <div class="row">
              <label class="lbl">Summe (Brutto)</label>
              <input v-model.number="form.total" type="number" step="0.01" min="0" class="input" placeholder="0.00" />
            </div>

            <div class="row">
              <label class="lbl">Fällig am</label>
              <input type="date" v-model="form.dueDate" class="input" />
            </div>

            <div class="row">
              <label class="lbl">Notizen</label>
              <textarea v-model="form.notes" class="input" rows="3" />
            </div>

            <div class="actions">
              <UiButton variant="primary" type="submit" :disabled="loading" :loading="loading">
                Rechnung anlegen
              </UiButton>
              <UiButton type="button" @click="router.push({ name: 'invoices-list' })">
                Abbrechen
              </UiButton>
            </div>
          </form>
        </template>
      </Card>
    </LoadState>
  </div>
</template>

<style scoped>
.form{ display:grid; gap:.75rem; margin-top:.75rem }
.row{ display:grid; gap:.35rem }
.lbl{ font-size:.85rem; opacity:.7 }
.input{
  border:1px solid #e5e5e5;
  border-radius:.5rem;
  padding:.5rem .6rem;
  min-height:2.25rem;
}
.actions{
  display:flex;
  gap:.5rem;
  justify-content:flex-end;
  margin-top:.5rem;
}
</style>
