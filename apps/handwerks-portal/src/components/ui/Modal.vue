<template>
  <div v-if="open" class="modal" @click.self="$emit('close')">
    <div class="panel">
      <header class="row" style="justify-content:space-between">
        <strong>{{ title }}</strong>
        <button class="btn ghost" @click="$emit('close')">✕</button>
      </header>
      <div class="body"><slot/></div>
      <footer class="row" style="justify-content:flex-end"><slot name="actions"/></footer>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ open:boolean; title?:string }>()
defineEmits<{ (e:'close'):void }>()
</script>
<style scoped>
.modal{position:fixed;inset:0;background:rgba(0,0,0,.35);display:grid;place-items:center;z-index:50}
.panel{width:min(640px,95vw);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--radius);box-shadow:var(--shadow-1);padding:var(--sp-4)}
.body{margin:var(--sp-3) 0}
</style>
