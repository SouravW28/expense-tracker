import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const projectRoot = fileURLToPath(new URL('.', import.meta.url))
  const apiUrl = loadEnv(mode, projectRoot, '').VITE_API_URL?.trim()

  if (!apiUrl) {
    throw new Error('VITE_API_URL must be set to the backend origin.')
  }

  let parsedApiUrl
  try {
    parsedApiUrl = new URL(apiUrl)
  } catch {
    throw new Error('VITE_API_URL must be a valid absolute URL.')
  }

  if (!['http:', 'https:'].includes(parsedApiUrl.protocol)) {
    throw new Error('VITE_API_URL must use HTTP or HTTPS.')
  }

  return {
    plugins: [react()],
  }
})
