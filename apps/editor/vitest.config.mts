import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'

export default defineConfig({
  plugins: [
    {
      name: 'shader-source',
      enforce: 'pre',
      load(id) {
        if (id.endsWith('.glsl')) {
          return 'export default ' + JSON.stringify(readFileSync(id, 'utf8'))
        }

        if (id.endsWith('.png')) {
          return 'export default ' + JSON.stringify('data:image/png;base64,' + readFileSync(id).toString('base64'))
        }
      }
    },
    vue()
  ],
  assetsInclude: ['**/*.glsl'],
  define: {
    __EDITOR_VERSION__: JSON.stringify('test'),
    __EDITOR_DEVELOPMENT__: JSON.stringify(false),
    __EDITOR_SCENES__: JSON.stringify([])
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    restoreMocks: true
  }
})
