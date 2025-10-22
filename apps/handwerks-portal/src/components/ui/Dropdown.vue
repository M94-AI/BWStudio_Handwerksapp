<!-- src/components/ui/Dropdown.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

type Option = { label: string; value: string }

const props = defineProps<{
  modelValue: string
  options: Option[]
  /** Text wenn modelValue leer ist (z.B. "Alle Aufträge" / "Alle Rechnungen") */
  placeholder: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const currentLabel = computed(() => {
  if (!props.modelValue) return props.placeholder
  return props.options.find(o => o.value === props.modelValue)?.label ?? props.placeholder
})

function toggle() { open.value = !open.value }
function close() { open.value = false }
function choose(val: string) {
  emit('update:modelValue', val)
  close()
}

// Click-outside
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) close()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="dropdown" ref="root">
    <button class="btn ghost dd-trigger" type="button" @click="toggle" :aria-expanded="open ? 'true' : 'false'">
      <span>{{ currentLabel }}</span>
      <svg class="chev" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
      </svg>
    </button>

    <div class="dd-menu" v-show="open" role="menu">
      <button class="dd-item" type="button" @click="choose('')">{{ placeholder }}</button>
      <button v-for="opt in options" :key="opt.value" class="dd-item" type="button" @click="choose(opt.value)">
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.dropdown{ position:relative; display:inline-block }
.dd-trigger{ display:inline-flex; align-items:center; gap:.4rem; }
.chev{ opacity:.8 }
.dd-menu{
  position:absolute; top:calc(100% + 6px); left:0; z-index:50;
  min-width: 200px; background:var(--c-surface); border:1px solid var(--c-border);
  border-radius: var(--radius); box-shadow: var(--shadow-1); padding:.25rem;
}
.dd-item{
  display:block; width:100%; text-align:left; padding:.45rem .6rem;
  border:0; background:transparent; border-radius:.4rem; cursor:pointer;
}
.dd-item:hover{ background:#f5f7fb }
</style>
