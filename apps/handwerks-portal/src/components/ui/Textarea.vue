<template>
  <textarea class="textarea" :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" v-bind="$attrs"></textarea>
</template>
<script setup lang="ts">
defineProps<{ modelValue?: string }>()
defineEmits<{ (e:'update:modelValue', v:string):void }>()
</script>
