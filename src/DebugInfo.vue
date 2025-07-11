<template>
  <div v-if="debugInfo" :style="{
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    padding: '8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontFamily: 'monospace',
    lineHeight: '1.3',
    pointerEvents: 'auto',
    zIndex: 1000,
    minWidth: '240px',
    maxWidth: '300px',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }">
    <!-- 调试面板标题和折叠按钮 -->
    <div :style="{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
      paddingBottom: '4px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    }">
      <span :style="{ fontWeight: 'bold', fontSize: '12px' }">
        WebGL Debug
      </span>
      <button type="button" :style="{
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '10px',
        padding: '2px 4px',
        borderRadius: '2px',
        opacity: 0.7,
      }" @click="collapsed = !collapsed" @mouseenter="(e: any) => (e.currentTarget.style.opacity = '1')"
        @mouseleave="(e: any) => (e.currentTarget.style.opacity = '0.7')">
        {{ collapsed ? '📈' : '📉' }}
      </button>
    </div>

    <template v-if="!collapsed">
      <!-- 核心状态信息 - 始终显示 -->
      <div :style="{ marginBottom: '8px' }">
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Scale:</span>
          <span>{{ debugInfo.scale.toFixed(2) }}</span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>LOD:</span>
          <span>
            {{ debugInfo.currentLOD }} / {{ debugInfo.lodLevels - 1 }}
          </span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Quality:</span>
          <StatusIndicator :color="getQualityColor(debugInfo.quality)" :label="debugInfo.quality" />
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Status:</span>
          <StatusIndicator :color="debugInfo.isLoading ? '#fbbf24' : '#4ade80'"
            :label="debugInfo.isLoading ? 'Loading' : 'Ready'" />
        </div>
      </div>

      <!-- 位置和变换信息 -->
      <CollapsibleSection title="Transform">
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Relative Scale:</span>
          <span>{{ debugInfo.relativeScale.toFixed(3) }}</span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Position:</span>
          <span>
            ({{ debugInfo.translateX.toFixed(0) }},
            {{ debugInfo.translateY.toFixed(0) }})
          </span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Fit Scale:</span>
          <span>{{ debugInfo.fitToScreenScale.toFixed(3) }}</span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Max Scale:</span>
          <span>{{ debugInfo.effectiveMaxScale.toFixed(3) }}</span>
        </div>
      </CollapsibleSection>

      <!-- 画布和图像信息 -->
      <CollapsibleSection title="Image Info">
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Canvas:</span>
          <span>
            {{ debugInfo.canvasSize.width }}×{{ debugInfo.canvasSize.height }}
          </span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Image:</span>
          <span>
            {{ debugInfo.imageSize.width }}×{{ debugInfo.imageSize.height }}
          </span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>DPR:</span>
          <span>{{ devicePixelRatio }}</span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Max Texture:</span>
          <span>{{ debugInfo.maxTextureSize }}</span>
        </div>
      </CollapsibleSection>

      <!-- 内存信息 -->
      <CollapsibleSection title="Memory">
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Textures:</span>
          <span>{{ debugInfo.memory.textures.toFixed(1) }} MB</span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Estimated:</span>
          <span>{{ debugInfo.memory.estimated.toFixed(1) }} MB</span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Budget:</span>
          <span>{{ debugInfo.memory.budget.toFixed(1) }} MB</span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Pressure:</span>
          <StatusIndicator :color="getMemoryPressureColor(debugInfo.memory.pressure)"
            :label="`${debugInfo.memory.pressure.toFixed(1)}%`" />
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Active LODs:</span>
          <span>
            {{ debugInfo.memory.activeLODs }} /
            {{ debugInfo.memory.maxConcurrentLODs }}
          </span>
        </div>
      </CollapsibleSection>

      <!-- 瓦片系统调试信息展示 -->
      <CollapsibleSection v-if="tileSystem" title="Tile System" :default-expanded="false">
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Cache Size:</span>
          <span>
            {{ tileSystem.cacheSize }} / {{ tileSystem.cacheLimit }}
          </span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Visible Tiles:</span>
          <span>{{ tileSystem.visibleTiles }}</span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Loading Tiles:</span>
          <span>{{ tileSystem.loadingTiles }}</span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Pending Requests:</span>
          <span>{{ tileSystem.pendingRequests }}</span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Tile Size:</span>
          <span>{{ tileSystem.tileSize }}</span>
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>Max Tiles/Frame:</span>
          <span>{{ tileSystem.maxTilesPerFrame }}</span>
        </div>
        <!-- 可选：显示部分 key 信息，避免过长 -->
        <div :style="{ fontSize: '10px', marginTop: 4, opacity: 0.7 }">
          <div>
            Cache Keys: {{ tileSystem.cacheKeys?.slice(0, 3).join(', ') }}
            {{ tileSystem.cacheKeys?.length > 3 ? ' ...' : '' }}
          </div>
          <div>
            Visible Keys: {{ tileSystem.visibleKeys?.slice(0, 3).join(', ') }}
            {{ tileSystem.visibleKeys?.length > 3 ? ' ...' : '' }}
          </div>
          <div>
            Loading Keys: {{ tileSystem.loadingKeys?.slice(0, 3).join(', ') }}
            {{ tileSystem.loadingKeys?.length > 3 ? ' ...' : '' }}
          </div>
          <div>
            Pending Keys: {{ tileSystem.pendingKeys?.slice(0, 3).join(', ') }}
            {{ tileSystem.pendingKeys?.length > 3 ? ' ...' : '' }}
          </div>
        </div>
      </CollapsibleSection>
    </template>

    <!-- 折叠状态下的简化显示 -->
    <div v-if="collapsed" :style="{ fontSize: '10px', opacity: 0.8 }">
      <div>
        Scale: {{ debugInfo.scale.toFixed(2) }} | LOD: {{ debugInfo.currentLOD }} |
        <StatusIndicator :color="getQualityColor(debugInfo.quality)" :label="debugInfo.quality" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * WebGL 图片查看器调试信息Vue组件
 *
 * 该组件用于显示 WebGL 图片查看器的实时调试信息，
 * 包括缩放比例、位置、LOD 级别、性能指标等。
 */

import { computed, ref } from 'vue'
import type { DebugInfo } from './interface'
import CollapsibleSection from './components/CollapsibleSection.vue'
import StatusIndicator from './components/StatusIndicator.vue'

// 定义组件属性
interface Props {
  defaultExpanded?: boolean
}

// 定义组件暴露的方法
interface Expose {
  updateDebugInfo: (debugInfo: DebugInfo) => void
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpanded: false,
})

// 响应式数据
const debugInfo = ref<DebugInfo | null>(null)
const collapsed = ref(false)

// 计算属性
const devicePixelRatio = computed(() => window.devicePixelRatio || 1)
const tileSystem = computed(() => (debugInfo.value as any)?.tileSystem)

// 暴露方法给父组件
const updateDebugInfo = (info: DebugInfo) => {
  debugInfo.value = info
}

defineExpose<Expose>({
  updateDebugInfo,
})

// 工具函数
const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'high': {
      return '#4ade80'
    }
    case 'medium': {
      return '#fbbf24'
    }
    case 'low': {
      return '#f87171'
    }
    default: {
      return '#94a3b8'
    }
  }
}

const getMemoryPressureColor = (pressure: number) => {
  if (pressure < 50) return '#4ade80'
  if (pressure < 80) return '#fbbf24'
  return '#f87171'
}
</script>
