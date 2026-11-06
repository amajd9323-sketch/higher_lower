import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

function offlinePrecachePlugin() {
  return {
    name: 'offline-precache',
    apply: 'build',
    async writeBundle(outputOptions) {
      const outputDir = resolve(outputOptions.dir || 'dist')
      const files = await readdir(join(outputDir, 'assets'))
      const buildAssets = files.filter((file) => /\.(?:js|css|woff2?|png|svg)$/.test(file)).map((file) => `assets/${file}`)
      const serviceWorkerPath = join(outputDir, 'sw.js')
      const serviceWorker = await readFile(serviceWorkerPath, 'utf8')
      const cacheVersion = createHash('sha256').update(`${serviceWorker}\n${buildAssets.join('\n')}`).digest('hex').slice(0, 10)
      const builtServiceWorker = serviceWorker
        .replace('const BUILD_ASSETS = []', `const BUILD_ASSETS = ${JSON.stringify(buildAssets)}`)
        .replace("const CACHE_VERSION = '__CACHE_VERSION__'", `const CACHE_VERSION = '${cacheVersion}'`)
      await writeFile(serviceWorkerPath, builtServiceWorker)
    },
  }
}

export default defineConfig({
  plugins: [react(), offlinePrecachePlugin()],
  base: './',
})
