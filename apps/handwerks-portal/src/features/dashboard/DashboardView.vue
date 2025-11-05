<!-- src/features/dashboard/DashboardView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

import { listEvents, type CalendarEvent } from '@/services/events'
import { listTechnicians, type Technician } from '@/services/technicians'
import { listOrders, type Order } from '@/services/orders'
import { listInvoices, type Invoice } from '@/services/invoices'
import { listOffers, type Offer } from '@/services/offers'

// Lager-Store einbinden
import { useInventoryStore } from '@/stores/inventory'
const inv = useInventoryStore()

const loading = ref(false)
const error = ref<string|null>(null)

const allEvents = ref<CalendarEvent[]>([])
const techs = ref<Technician[]>([])
const orders = ref<Order[]>([])
const invoices = ref<Invoice[]>([])
const offers = ref<Offer[]>([])

onMounted(load)

async function load() {
  loading.value = true; error.value = null
  try {
    // Lager parallel laden (eigene Lade-/Fehlerzustände im Store)
    inv.fetchAll()

    const e  = await listEvents().catch((err:any) => { throw new Error('events: ' + (err?.message||String(err))) })
    const t  = await listTechnicians().catch((err:any) => { throw new Error('technicians: ' + (err?.message||String(err))) })
    const o  = await listOrders().catch((err:any) => { throw new Error('orders: ' + (err?.message||String(err))) })
    const i  = await listInvoices().catch((err:any) => { throw new Error('invoices: ' + (err?.message||String(err))) })
    const of = await listOffers().catch((err:any) => { throw new Error('offers: ' + (err?.message||String(err))) })

    allEvents.value = e
    techs.value = t
    orders.value = o
    invoices.value = i
    offers.value = of
  } catch (e:any) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

// Helfer
const techById = (id:any) => techs.value.find(t => String(t.id) === String(id))

function formatTime(iso?: string): string {
  if (!iso) return '—'
  const m = iso.match(/T(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : '—'
}

function daysUntilISO(iso?: string) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return Infinity
  const [y,m,d] = iso.slice(0,10).split('-').map(n => parseInt(n,10))
  const A = new Date(y, m-1, d).getTime()
  const now = new Date()
  const B = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((A-B)/(1000*60*60*24))
}
const todayYmd = () => {
  const d = new Date()
  const y = d.getFullYear(), m = (d.getMonth()+1).toString().padStart(2,'0'), day = d.getDate().toString().padStart(2,'0')
  return `${y}-${m}-${day}`
}

// Termine
const eventsNext7Days = computed(() =>
  (allEvents.value ?? [])
    .filter(ev => daysUntilISO(ev.when) >= 0 && daysUntilISO(ev.when) <= 7)
    .sort((a,b) => (a.when ?? '').localeCompare(b.when ?? ''))
)
const kpiTodayEvents = computed(() =>
  (allEvents.value ?? []).filter(ev => (ev.when ?? '').slice(0,10) === todayYmd()).length
)

// Aufträge
const prioritizedOrders = computed(() => {
  const open = orders.value.filter(o => o.status !== 'erledigt')
  return open.sort(
    (a,b) => (a.priority ?? 9) - (b.priority ?? 9) || (a.due ?? '').localeCompare(b.due ?? '')
  )
})
const kpiOpenOrders = computed(() => orders.value.filter(o => o.status !== 'erledigt').length)

// Rechnungen
const overdue = computed(() =>
  invoices.value.filter(i => i.status !== 'bezahlt' && daysUntilISO(i.dueDate) < 0)
)
const dueSoon = computed(() =>
  invoices.value
    .filter(i => i.status !== 'bezahlt' && daysUntilISO(i.dueDate) >= 0 && daysUntilISO(i.dueDate) <= 7)
    .sort((a,b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
)
const kpiInvoicesOverdue = computed(() => overdue.value.length)

// Angebote
const openOffers = computed(() => offers.value.filter(o => o.status === 'offen'))
const kpiOpenOffers = computed(() => openOffers.value.length)

// Lager — direkt aus dem Store
const lowStockItems = computed(() => inv.lowStockItems.slice(0, 6))
</script>

<template>
  <div class="container stack">
    <h1>Dashboard</h1>
    <p v-if="error" style="color:#b00020;margin:.25rem 0;">Fehler: {{ error }}</p>

    <!-- KPI-Zeile -->
    <div class="kpis">
      <Card title="Heute: Termine">{{ kpiTodayEvents }}</Card>
      <Card title="Offene Aufträge">{{ kpiOpenOrders }}</Card>
      <Card title="Überfällige Rechnungen">{{ kpiInvoicesOverdue }}</Card>
      <Card title="Offene Angebote">{{ kpiOpenOffers }}</Card>
    </div>

    <div class="grid">
      <!-- Termine (nächste 7 Tage) -->
      <Card>
        <template #default>
          <h3 class="panel-title">Termine (nächste 7 Tage)</h3>
          <ul class="events" v-if="eventsNext7Days.length">
            <li v-for="ev in eventsNext7Days" :key="ev.id">
              <span class="time">{{ formatTime(ev.when) }}</span>
              <div class="info">
                <div class="title">{{ ev.title }}</div>
                <div class="meta">
                  <span class="tech" v-if="techById(ev.technicianId)">👤 {{ techById(ev.technicianId)!.name }}</span>
                  <span class="loc" v-if="ev.location">📍 {{ ev.location }}</span>
                  <RouterLink v-if="ev.orderId" class="link" :to="`/auftraege/${ev.orderId}`">Auftrag öffnen →</RouterLink>
                </div>
              </div>
            </li>
          </ul>
          <p v-else>Keine Termine in den nächsten 7 Tagen.</p>
        </template>
      </Card>

      <!-- Offene Aufträge (priorisiert) -->
      <Card>
        <template #default>
          <h3 class="panel-title">Offene Aufträge (Priorität)</h3>
          <table class="tbl" v-if="prioritizedOrders.length">
            <thead>
              <tr><th>#</th><th>Titel</th><th>Status</th><th>Fällig</th><th>Prio</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="o in prioritizedOrders" :key="o.id">
                <td>#{{ o.id }}</td>
                <td>{{ o.title }}</td>
                <td><StatusBadge :status="o.status"/></td>
                <td>{{ o.due || '—' }}</td>
                <td>{{ o.priority ?? '—' }}</td>
                <td class="r"><RouterLink :to="`/auftraege/${o.id}`">Details</RouterLink></td>
              </tr>
            </tbody>
          </table>
          <p v-else>Keine offenen Aufträge.</p>
        </template>
      </Card>

      <!-- Rechnungen -->
      <Card>
        <template #default>
          <h3 class="panel-title">Rechnungen</h3>
          <div class="invoices">
            <div class="col">
              <h4>Überfällig</h4>
              <ul v-if="overdue.length">
                <li v-for="i in overdue" :key="i.id">
                  <strong>#{{ i.id }}</strong> – {{ i.title }} · {{ i.total.toFixed(2) }}€
                  <span class="badge red">überfällig</span>
                </li>
              </ul>
              <p v-else>Keine überfälligen Rechnungen.</p>
            </div>
            <div class="col">
              <h4>Fällig ≤ 7 Tage</h4>
              <ul v-if="dueSoon.length">
                <li v-for="i in dueSoon" :key="i.id">
                  <strong>#{{ i.id }}</strong> – {{ i.title }} · {{ i.total.toFixed(2) }}€
                  <span class="badge warn">bald fällig</span>
                  <small v-if="i.dueDate">· bis {{ i.dueDate }}</small>
                </li>
              </ul>
              <p v-else>Keine demnächst fälligen Rechnungen.</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Lager: Niedrige Bestände -->
      <Card>
        <template #default>
          <h3 class="panel-title">Lager: Niedrige Bestände</h3>
          <ul v-if="lowStockItems.length" class="events">
            <li v-for="a in lowStockItems" :key="a.id">
              <div class="info">
                <div class="title">{{ a.name }}</div>
                <div class="meta">
                  <span>Bestand: {{ a.stock }} {{ a.unit || '' }}</span>
                  <span>· Mindestbestand: {{ a.minStock ?? '—' }}</span>
                  <RouterLink class="link" to="/lager">Zum Lager →</RouterLink>
                </div>
              </div>
            </li>
          </ul>
          <p v-else>Keine niedrigen Bestände.</p>
        </template>
      </Card>

      <!-- Angebote (offen) – volle Breite -->
      <Card class="wide">
        <template #default>
          <h3 class="panel-title">Angebote (offen)</h3>
          <ul v-if="openOffers.length" class="events">
            <li v-for="o in openOffers.slice(0,5)" :key="o.id">
              <div class="info">
                <div class="title">{{ o.title }}</div>
                <div class="meta">
                  <span>Summe: {{ o.total != null ? o.total.toFixed(2) + '€' : '—' }}</span>
                  <span v-if="o.validUntil">· gültig bis {{ o.validUntil }}</span>
                </div>
              </div>
            </li>
          </ul>
          <p v-else>Keine offenen Angebote.</p>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.container{max-width:1200px;margin:0 auto;padding:0 1rem}
.stack>*+*{margin-top:1rem}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}

.grid{display:grid;grid-template-columns:2fr 1fr; gap:1rem}
.wide{ grid-column: 1 / -1; }
@media (max-width: 1000px){
  .grid{grid-template-columns:1fr}
  .kpis{grid-template-columns:1fr}
}

.panel-title{margin:0 0 .5rem;font-weight:600}

/* Events-Liste */
.events{list-style:none;padding:0;margin:0}
.events li{display:flex;gap:.75rem;align-items:flex-start;padding:.45rem .25rem;border-bottom:1px solid #eee}
.time{width:3.2rem; font-variant-numeric:tabular-nums}
.info .title{font-weight:600}
.meta{display:flex;flex-wrap:wrap;gap:.5rem;font-size:.9rem;color:#555}
.link{color:#1a73e8}

/* Tabellen */
.tbl{width:100%;border-collapse:collapse}
th,td{padding:.5rem;border-bottom:1px solid #eee;text-align:left}
td.r{text-align:right}

/* Invoices */
.invoices{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.badge{padding:.1rem .4rem;border-radius:999px;font-size:.75rem}
.badge.red{background:#fde7e9;color:#b3261e}
.badge.warn{background:#fff7d6;color:#8d6e00}
@media (max-width: 700px){ .invoices{grid-template-columns:1fr} }
</style>
