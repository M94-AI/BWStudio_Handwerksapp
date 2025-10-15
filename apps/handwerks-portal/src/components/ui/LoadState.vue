<template>
  <p v-if="loading">Lade…</p>
  <p v-else-if="error" style="color:#b00020;">Fehler: {{ error }}</p>
  <slot v-else />
</template>

<script setup lang="ts">
defineProps<{ loading: boolean; error: string | null }>()
</script>
