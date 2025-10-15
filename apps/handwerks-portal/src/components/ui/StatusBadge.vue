<template><span :class="['badge', colorClass]">{{ status }}</span></template>

<script setup lang="ts">
const { status } = defineProps<{ status: string }>()
const map: Record<string, string> = {
  offen: 'yellow', 'in Arbeit': 'blue', erledigt: 'gray',
  aktiv: 'green', inaktiv: 'gray', überfällig: 'red'
}
const colorClass = map[status] ?? 'gray'
</script>

<style scoped>
.badge{padding:.15rem .5rem;border-radius:999px;font-size:.78rem}
.green{background:#e6f4ea;color:#137333}
.gray{background:#f1f3f4;color:#5f6368}
.yellow{background:#fff7d6;color:#8d6e00}
.blue{background:#e8f0fe;color:#1967d2}
.red{background:#fde7e9;color:#b3261e}
</style>
