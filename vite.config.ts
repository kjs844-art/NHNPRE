import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages는 https://<user>.github.io/NHNPRE/ 하위 경로에서 서빙된다
  base: process.env.GITHUB_PAGES === 'true' ? '/NHNPRE/' : '/',
})
