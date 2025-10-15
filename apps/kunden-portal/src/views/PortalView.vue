<template>
  <main style="padding: 2rem;">
    <h1>Kundenportal</h1>

    <p v-if="!customerId">
      Keine <code>customerId</code> in der URL gefunden.
      Öffne z. B.: <a href="http://localhost:5174/?customerId=42">/?customerId=42</a>
    </p>

    <section v-else>
      <h2>Willkommen, Kunde #{{ customerId }}</h2>
      <p>Dies ist Ihre persönliche Übersicht.</p>

      <h3 style="margin-top:1rem;">Kundendaten (Mock)</h3>
      <p v-if="customerLoading">Lade Kundendaten…</p>
      <p v-else-if="customerError" style="color:#b00020;">Fehler: {{ customerError }}</p>
      <div v-else-if="customer">
        <p><strong>Name:</strong> {{ customer.name }}</p>
        <p><strong>Status:</strong> {{ customer.status }}</p>
        <p><strong>Aufträge:</strong> {{ (customer.orders || []).length }}</p>

        <ul>
          <li v-for="o in (customer.orders || [])" :key="o.id">
            {{ o.title }} – {{ o.status }}
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getCustomerById } from '@/services/customer'

const route = useRoute()
const customerId = computed(() => route.query.customerId ?? '')

const customer = ref(null)
const customerLoading = ref(false)
const customerError = ref(null)

async function loadCustomer() {
  const id = String(customerId.value || '').trim()
  if (!id) return
  customerLoading.value = true
  customerError.value = null
  try {
    customer.value = await getCustomerById(id)
  } catch (e) {
    customerError.value = String(e)
  } finally {
    customerLoading.value = false
  }
}

onMounted(() => {
  loadCustomer()
})
</script>
