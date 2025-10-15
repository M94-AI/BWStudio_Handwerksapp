<template>
  <div class="card">
    <h3 v-if="title">{{ title }}</h3>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<style scoped>
.card {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: .75rem;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
h3 { margin: 0 0 .5rem; font-weight: 600; }
</style>
