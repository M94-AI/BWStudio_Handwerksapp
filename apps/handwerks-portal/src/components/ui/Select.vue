<template>
  <select class="select" :value="modelValue" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)" v-bind="$attrs">
    <slot/>
  </select>
</template>
<script setup lang="ts">
defineProps<{ modelValue?: string | number }>()
defineEmits<{ (e:'update:modelValue', v:string | number):void }>()
</script>
