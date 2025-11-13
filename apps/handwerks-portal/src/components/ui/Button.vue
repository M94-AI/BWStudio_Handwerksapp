<template>
  <button
    :class="['btn', variant]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <slot/>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary'|'ghost'|'danger'|'default'
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'default',
  disabled: false,
  loading: false
})
</script>
