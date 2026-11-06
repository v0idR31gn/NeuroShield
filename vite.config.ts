import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    base: '/',
    build: {
      sourcemap: isDev ? 'inline' : false,
      minify: !isDev,
      outDir: 'dist',
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443', 10),
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443', 10),
    },
  }
})
