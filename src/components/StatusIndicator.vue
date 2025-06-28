<template>
  <span :style="{ display: 'flex', alignItems: 'center', gap: '4px' }">
    <span :style="{
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: color,
      display: 'inline-block',
    }" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  color: string
  label: string
}

defineProps<Props>()
</script>
