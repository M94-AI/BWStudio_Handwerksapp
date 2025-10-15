<template>
  <input class="input" :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" v-bind="$attrs" />
</template>
<script setup lang="ts">
defineProps<{ modelValue?: string | number }>()
defineEmits<{ (e:'update:modelValue', v:string | number):void }>()
</script>
