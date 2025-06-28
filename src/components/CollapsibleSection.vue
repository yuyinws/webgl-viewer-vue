<template>
  <div :style="{ marginBottom: '8px' }">
    <div :style="{
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '2px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom: expanded ? '4px' : '0',
    }" @click="toggleExpanded">
      <span :style="{
        marginRight: '6px',
        fontSize: '10px',
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
      }">
        ▶
      </span>
      <span :style="{ fontWeight: 'bold', fontSize: '11px' }">{{ title }}</span>
    </div>
    <div v-if="expanded" :style="{ paddingLeft: '16px', fontSize: '11px' }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  defaultExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpanded: false,
})

const expanded = ref(props.defaultExpanded)

const toggleExpanded = () => {
  expanded.value = !expanded.value
}
</script>
