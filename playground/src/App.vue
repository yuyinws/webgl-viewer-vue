<template>
  <div class="webgl-viewer-example">
    <h2>WebGL图像查看器示例</h2>

    <div class="controls">
      <button @click="zoomIn">放大</button>
      <button @click="zoomOut">缩小</button>
      <button @click="resetView">重置视图</button>
      <span>当前缩放: {{ currentScale.toFixed(2) }}</span>
    </div>

    <div class="viewer-container">
      <WebGLImageViewer ref="viewerRef" :src="imageSrc" :width="800" :height="600" :initial-scale="1" :min-scale="0.1"
        :max-scale="10" :debug="true" @zoom-change="handleZoomChange" @image-copied="handleImageCopied"
        @loading-state-change="handleLoadingStateChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { WebGLImageViewer } from 'webgl-viewer-vue'
import type { WebGLImageViewerRef } from 'webgl-viewer-vue'

// 响应式数据
const viewerRef = ref<WebGLImageViewerRef>()
const currentScale = ref(1)
const imageSrc = ref('https://cdn.jsdelivr.net/gh/slidevjs/slidev-covers@main/static/RUYCsWDSJFo.webp')

// 方法
const zoomIn = () => {
  viewerRef.value?.zoomIn(true)
}

const zoomOut = () => {
  viewerRef.value?.zoomOut(true)
}

const resetView = () => {
  viewerRef.value?.resetView()
}

const handleZoomChange = (scale: number) => {
  currentScale.value = scale
  console.log('缩放变化:', scale)
}

const handleImageCopied = () => {
  console.log('图像已复制')
}

const handleLoadingStateChange = (loading: boolean) => {
  console.log('加载状态变化:', loading)
}
</script>

<style scoped>
.webgl-viewer-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
}

.controls button:hover {
  background: #e5e5e5;
}

.viewer-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}
</style>
