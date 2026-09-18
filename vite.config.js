import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// NOTA: cuando despliegues en GitHub Pages como project site
// (https://<user>.github.io/<repo>/), setea VITE_BASE_PATH="/<repo>/"
// en el workflow. Para dev local queda en "/".
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/',
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      port: 5173,
    },
  }
})
