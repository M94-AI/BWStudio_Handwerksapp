<template>
  <button :class="['btn', variant]" v-bind="$attrs"><slot/></button>
</template>
<script setup lang="ts">
defineProps<{ variant?: 'primary'|'ghost'|'danger' }>()
</script>
