import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the app under /fuhrwerk/, Vercel and local dev under /.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/fuhrwerk/' : '/',
  plugins: [react(), tailwindcss()],
})
