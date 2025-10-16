<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { listEventsToday, type CalendarEvent } from '@/services/events'
import { listTechnicians, type Technician } from '@/services/technicians'
import { listOrders, type Order } from '@/services/orders'
import { listInvoices, type Invoice } from '@/services/invoices'
import { listOffers, type Offer } from '@/services/offers'

const loading = ref(false)
const error = ref<string|null>(null)
const events = ref<CalendarEvent[]>([])
const techs = ref<Technician[]>([])
const orders = ref<Order[]>([])
const invoices = ref<Invoice[]>([])
const offers = ref<Offer[]>([])

onMounted(load)
async function load() {
  loading.value = true; error.value = null
  try {
    const [e, t, o, i, of] = await Promise.all([
  listEventsToday(), listTechnicians(), listOrders(), listInvoices(), listOffers()
  ])
  events.value = e
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
const formatTime = (iso?:string) => iso ? new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '—'

// KPIs (heutige Termine, offene Aufträge, offene/überfällige Rechnungen)
const kpiTodayEvents = computed(() => events.value.length)
const kpiOpenOrders = computed(() => orders.value.filter(o => o.status !== 'erledigt').length)
const kpiInvoicesOverdue = computed(() => overdue.value.length)

// Aufträge – priorisiert: offen/in Arbeit, sortiert nach Priority (1 hoch) und due
const prioritizedOrders = computed(() => {
  const open = orders.value.filter(o => o.status !== 'erledigt')
  return open.sort((a,b) => (a.priority ?? 9) - (b.priority ?? 9) || (a.due ?? '').localeCompare(b.due ?? ''))
}).value // optional: .slice(0,6) machen - sollte dann nur die top 6 anzeigen


// Rechnungen – überfällig und bald fällig (<= 7 Tage)
const todayYmd = () => new Date().toISOString().slice(0,10)
function daysUntil(dateYmd?:string) {
  if (!dateYmd) return Infinity
  const a = new Date(dateYmd+'T00:00:00'); const b = new Date(todayYmd()+'T00:00:00')
  return Math.round((a.getTime()-b.getTime())/(1000*60*60*24))
}
const overdue = computed(() => invoices.value.filter(i => i.status !== 'bezahlt' && daysUntil(i.dueDate) < 0))
const dueSoon = computed(() => invoices.value.filter(i => i.status !== 'bezahlt' && daysUntil(i.dueDate) >= 0 && daysUntil(i.dueDate) <= 7)
  .sort((a,b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '')))

const openOffers = computed(() => offers.value.filter(o => o.status === 'offen'))
//Liste für offers


const offersDueSoon = computed(() =>
  openOffers.value
    .filter(o => daysUntil(o.validUntil) >= 0 && daysUntil(o.validUntil) <= 14)
    .sort((a,b) => (a.validUntil ?? '').localeCompare(b.validUntil ?? ''))
)



</script>

<template>
  <div class="container stack">
    <h1>Dashboard</h1>

    <!-- KPI-Zeile -->
    <div class="kpis">
      <Card title="Heute: Termine">{{ kpiTodayEvents }}</Card>
      <Card title="Offene Aufträge">{{ kpiOpenOrders }}</Card>
      <Card title="Überfällige Rechnungen">{{ kpiInvoicesOverdue }}</Card>
      <Card title="Offene Angebote">{{ kpiOpenOffers }}</Card>
    </div>

    <div class="grid">
      <!-- Heutige Termine -->
      <Card>
        <template #default>
          <h3 class="panel-title">Heute (Termine)</h3>
          <ul class="events" v-if="events.length">
            <li v-for="ev in events" :key="ev.id">
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
          <p v-else>Heute keine Termine.</p>
        </template>
      </Card>

      <!-- Offene Aufträge (priorisiert) -->
      <Card>
        <template #default>
          <h3 class="panel-title">Offene Aufträge (Priorität)</h3>
          <table class="tbl" v-if="prioritizedOrders.length">
            <thead><tr><th>#</th><th>Titel</th><th>Status</th><th>Fällig</th><th>Prio</th><th></th></tr></thead>
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

      <!-- Rechnungen im Fokus -->
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
    </div>
  </div>
    <!-- Angebote --->
  <Card>
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

</template>

<style scoped>
.container{max-width:1200px;margin:0 auto;padding:0 1rem}
.stack>*+*{margin-top:1rem}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.grid{display:grid;grid-template-columns:2fr 1fr; gap:1rem}
@media (max-width: 1000px){ .grid{grid-template-columns:1fr} .kpis{grid-template-columns:1fr} }
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
