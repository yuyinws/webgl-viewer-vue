import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import turboConsole from 'unplugin-turbo-console/vite'

export default defineConfig({
  plugins: [
    vue(),
    turboConsole(),
  ],
})
