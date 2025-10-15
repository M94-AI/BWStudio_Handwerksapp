<template>
  <div>
    <h1>Kunde: {{ customer.name }}</h1>
    <a :href="kundenPortalUrl" target="_blank">Zum Kundenportal</a>
  </div>







</template>

<script setup>
import { computed } from 'vue'
const customer = { id: 42, name: 'Muster GmbH' }
const kundenPortalUrl = computed(() =>
  `http://localhost:5174/?customerId=${customer.id}`
)
</script>

