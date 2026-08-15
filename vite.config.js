import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves a project site from a subpath
  // (/clean-shopper/), so assets need that prefix baked in at build time.
  // Vercel and local dev serve from the root, where the default '/' is correct.
  // The Pages workflow sets BASE_PATH; nothing else does.
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  // Respect an assigned PORT so more than one dev server can run against this
  // checkout; falls back to Vite's default when nothing is set.
  server: { port: Number(process.env.PORT) || 5173 },
})
