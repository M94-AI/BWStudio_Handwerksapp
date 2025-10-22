<template>
  <main style="padding:1rem; max-width: 900px; margin: 0 auto;">
    <h1>Kundenportal</h1>

    <p v-if="!customerId">
      Keine <code>customerId</code> in der URL.
      Beispiel: <a href="/?customerId=42">/?customerId=42</a>
    </p>

    <section v-else>
      <h2>Ihre Aufträge</h2>

      <p v-if="loading">Lade…</p>
      <p v-else-if="error" style="color:#b00020;">Fehler: {{ error }}</p>

      <div v-else>
        <article v-for="o in enrichedOrders" :key="o.id" class="card">
          <header class="card-head">
            <strong>#{{ o.id }}</strong>
            <span class="title">{{ o.title }}</span>
            <span class="status" :data-s="o.status">{{ o.status }}</span>
          </header>

          <div class="rows">
            <div class="row">
              <span class="label">Termin</span>
              <span class="value">
                <template v-if="o.event">
                  {{ formatDateTime(o.event.when) }}
                </template>
                <template v-else>—</template>
              </span>
            </div>

            <div class="row">
              <span class="label">Handwerker</span>
              <span class="value">
                <template v-if="o.tech">
                  {{ o.tech.name }}
                  <span v-if="o.tech.phone">· <a :href="`tel:${o.tech.phone}`">{{ o.tech.phone }}</a></span>
                  <span v-if="o.tech.email">· <a :href="`mailto:${o.tech.email}`">{{ o.tech.email }}</a></span>
                </template>
                <template v-else>—</template>
              </span>
            </div>

            <div class="row">
              <span class="label">Angebot</span>
              <span class="value">
                <template v-if="o.offer">
                  {{ o.offer.title }} · <strong>{{ o.offer.status }}</strong>
                  <span v-if="o.offer.total != null">· {{ o.offer.total.toFixed(2) }}€</span>
                  <span v-if="o.offer.validUntil">· gültig bis {{ o.offer.validUntil }}</span>
                </template>
                <template v-else>—</template>
              </span>
            </div>

            <div class="row">
              <span class="label">Rechnung</span>
              <span class="value">
                <template v-if="o.invoice">
                  {{ o.invoice.title }} · <strong>{{ o.invoice.status }}</strong>
                  · {{ o.invoice.total.toFixed(2) }}€
                  <span v-if="o.invoice.dueDate">· fällig bis {{ o.invoice.dueDate }}</span>
                </template>
                <template v-else>—</template>
              </span>
            </div>
          </div>

          <footer class="card-actions">
            <RouterLink :to="`/auftraege/${o.id}`">Details ansehen</RouterLink>
            <a v-if="o.tech?.phone" :href="`tel:${o.tech.phone}`" class="btn">Anrufen</a>
            <a v-if="o.tech?.email" :href="`mailto:${o.tech.email}`" class="btn">E-Mail</a>
          </footer>
        </article>

        <p v-if="!enrichedOrders.length">Noch keine Aufträge vorhanden.</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { listOrdersByCustomer, type Order } from '@/services/orders'
import { listEventsByCustomer, type CalendarEvent } from '@/services/events'
import { listOffersByCustomer, type Offer } from '@/services/offers'
import { listInvoicesByCustomer, type Invoice } from '@/services/invoices'
import { getTechnician, type Technician } from '@/services/technicians'

const route = useRoute()
const customerId = computed(() => route.query.customerId ?? '')

const loading = ref(false)
const error = ref<string|null>(null)

const orders = ref<Order[]>([])
const events = ref<CalendarEvent[]>([])
const offers = ref<Offer[]>([])
const invoices = ref<Invoice[]>([])
const techMap = ref<Record<string|number, Technician>>({})

onMounted(load)

async function load() {
  if (!customerId.value) return
  loading.value = true; error.value = null
  try {
    const [o, e, of, iv] = await Promise.all([
      listOrdersByCustomer(customerId.value as string),
      listEventsByCustomer(customerId.value as string),
      listOffersByCustomer(customerId.value as string),
      listInvoicesByCustomer(customerId.value as string),
    ])
    orders.value = o
    events.value = e
    offers.value = of
    invoices.value = iv

    // Techniker vorab nachladen (einmalig pro ID)
    const techIds = Array.from(new Set(e.map(ev => ev.technicianId).filter(Boolean))) as (string|number)[]
    const entries = await Promise.all(techIds.map(async id => [id, await getTechnician(id!)] as const))
    techMap.value = Object.fromEntries(entries)
  } catch (err:any) {
    error.value = err?.message ?? String(err)
  } finally {
    loading.value = false
  }
}

const enrichedOrders = computed(() => {
  return orders.value.map(o => {
    const ev = events.value.find(ev => String(ev.orderId) === String(o.id))
    const offer = offers.value.find(x => String(x.orderId) === String(o.id))
    const invoice = invoices.value.find(x => String(x.orderId) === String(o.id))
    const tech = ev?.technicianId ? techMap.value[ev.technicianId] : null
    return { ...o, event: ev ?? null, offer: offer ?? null, invoice: invoice ?? null, tech }
  })
})

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<style scoped>
.card {
  border: 1px solid #e6e8ec; border-radius: .6rem; padding: .8rem; background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.04); margin-bottom: .8rem;
}
.card-head { display:flex; align-items:center; gap:.6rem; margin-bottom:.4rem; }
.card-head .title { font-weight:600; flex:1; }
.status[data-s="offen"]{ background:#fff7d6; color:#8d6e00; padding:.1rem .5rem; border-radius:999px; font-size:.78rem }
.status[data-s="in Arbeit"]{ background:#e8f0fe; color:#1967d2; padding:.1rem .5rem; border-radius:999px; font-size:.78rem }
.status[data-s="erledigt"]{ background:#e6f4ea; color:#137333; padding:.1rem .5rem; border-radius:999px; font-size:.78rem }
.rows { display:grid; gap:.35rem; }
.row { display:grid; grid-template-columns: 140px 1fr; gap:.6rem; }
.label { color:#5f6368 }
.value a { color:#1a73e8; text-decoration: none }
.card-actions { display:flex; gap:.5rem; margin-top:.6rem }
.card-actions .btn { padding:.35rem .6rem; border:1px solid #e6e8ec; border-radius:.5rem; background:#fff; }
@media (max-width: 600px){ .row{ grid-template-columns: 1fr } .label{ font-weight:600 } }
</style>
