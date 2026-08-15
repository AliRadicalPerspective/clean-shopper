import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Respect an assigned PORT so more than one dev server can run against this
  // checkout; falls back to Vite's default when nothing is set.
  server: { port: Number(process.env.PORT) || 5173 },
})
