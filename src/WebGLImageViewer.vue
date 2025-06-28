<template>
  <div :style="{
    position: 'relative',
    width: '100%',
    height: '100%',
    ...($attrs.style as object),
  }" v-bind="$attrs">
    <canvas ref="canvasRef" :class="className" :style="{
      display: 'block',
      width: '100%',
      height: '100%',
      touchAction: 'none',
      border: 'none',
      outline: 'none',
      margin: 0,
      padding: 0,
      // 对于像素艺术和小图片保持锐利，使用最新的标准属性
      imageRendering: 'pixelated',
    }" />
  </div>
</template>

<script setup lang="ts">
/**
 * WebGL图像查看器Vue组件
 *
 * 高性能的WebGL图像查看器组件
 */

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import {
  defaultAlignmentAnimation,
  defaultDoubleClickConfig,
  defaultPanningConfig,
  defaultPinchConfig,
  defaultVelocityAnimation,
  defaultWheelConfig,
} from './constants'
import type { WebGLImageViewerProps, WebGLImageViewerRef } from './interface'
import { WebGLImageViewerEngine } from './WebGLImageViewerEngine'

// 定义组件属性
interface Props extends WebGLImageViewerProps {
  src: string
  className?: string
  width?: number
  height?: number
  initialScale?: number
  minScale?: number
  maxScale?: number
  wheel?: typeof defaultWheelConfig
  pinch?: typeof defaultPinchConfig
  doubleClick?: typeof defaultDoubleClickConfig
  panning?: typeof defaultPanningConfig
  limitToBounds?: boolean
  centerOnInit?: boolean
  smooth?: boolean
  alignmentAnimation?: typeof defaultAlignmentAnimation
  velocityAnimation?: typeof defaultVelocityAnimation
  onZoomChange?: (scale: number) => void
  onImageCopied?: () => void
  onLoadingStateChange?: (loading: boolean) => void
  debug?: boolean
}

// 定义组件暴露的方法
interface Expose {
  zoomIn: (animated?: boolean) => void
  zoomOut: (animated?: boolean) => void
  resetView: () => void
  getScale: () => number
}

// 定义属性，使用withDefaults提供默认值
const props = withDefaults(defineProps<Props>(), {
  className: '',
  initialScale: 1,
  minScale: 0.1,
  maxScale: 10,
  limitToBounds: true,
  centerOnInit: true,
  smooth: true,
  debug: false,
  onZoomChange: () => { },
  onImageCopied: () => { },
  onLoadingStateChange: () => { },
})

// 定义暴露的方法
const emit = defineEmits<{
  zoomChange: [scale: number]
  imageCopied: []
  loadingStateChange: [loading: boolean]
}>()

// 模板引用
const canvasRef = ref<HTMLCanvasElement>()
const viewerRef = ref<WebGLImageViewerEngine | null>(null)

// 计算配置对象
const config = computed<Required<WebGLImageViewerProps>>(() => ({
  src: props.src,
  className: props.className,
  width: props.width || 0,
  height: props.height || 0,
  initialScale: props.initialScale,
  minScale: props.minScale,
  maxScale: props.maxScale,
  wheel: {
    ...defaultWheelConfig,
    ...props.wheel,
  },
  pinch: { ...defaultPinchConfig, ...props.pinch },
  doubleClick: { ...defaultDoubleClickConfig, ...props.doubleClick },
  panning: { ...defaultPanningConfig, ...props.panning },
  limitToBounds: props.limitToBounds,
  centerOnInit: props.centerOnInit,
  smooth: props.smooth,
  alignmentAnimation: {
    ...defaultAlignmentAnimation,
    ...props.alignmentAnimation,
  },
  velocityAnimation: { ...defaultVelocityAnimation, ...props.velocityAnimation },
  onZoomChange: (scale: number) => {
    props.onZoomChange(scale)
    emit('zoomChange', scale)
  },
  onImageCopied: () => {
    props.onImageCopied()
    emit('imageCopied')
  },
  onLoadingStateChange: (loading: boolean) => {
    props.onLoadingStateChange(loading)
    emit('loadingStateChange', loading)
  },
  debug: props.debug,
}))

// 暴露的方法实现
const zoomIn = (animated?: boolean) => {
  viewerRef.value?.zoomIn(animated)
}

const zoomOut = (animated?: boolean) => {
  viewerRef.value?.zoomOut(animated)
}

const resetView = () => {
  viewerRef.value?.resetView()
}

const getScale = (): number => {
  return viewerRef.value?.getScale() || 1
}

// 暴露方法给父组件
defineExpose<Expose>({
  zoomIn,
  zoomOut,
  resetView,
  getScale,
})

// 初始化WebGL查看器
const initViewer = () => {
  if (!canvasRef.value) return

  const webGLImageViewerEngine = new WebGLImageViewerEngine(
    canvasRef.value,
    config.value,
    undefined, // 暂时移除debug功能
  )

  try {
    // 如果提供了尺寸，传递给loadImage进行优化
    const preknownWidth = config.value.width > 0 ? config.value.width : undefined
    const preknownHeight = config.value.height > 0 ? config.value.height : undefined
    webGLImageViewerEngine
      .loadImage(props.src, preknownWidth, preknownHeight)
      .catch(console.error)
    viewerRef.value = webGLImageViewerEngine
  } catch (error) {
    console.error('Failed to initialize WebGL Image Viewer:', error)
  }
}

// 清理函数
const cleanup = () => {
  viewerRef.value?.destroy()
  viewerRef.value = null
}

// 监听src变化，重新初始化
watch(() => props.src, () => {
  cleanup()
  initViewer()
})

// 监听配置变化
watch(config, () => {
  cleanup()
  initViewer()
}, { deep: true })

// 组件挂载时初始化
onMounted(() => {
  initViewer()
})

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
})
</script>
