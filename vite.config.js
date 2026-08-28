import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawBase = env.VITE_BASE_PATH || '/';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  return {
    base,
    logLevel: 'error', // Suppress warnings, only show errors
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      preserveSymlinks: true,
    },
    plugins: [react()],
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.js"],
      globals: true,
      css: true,
      pool: "threads",
    },
  };
});
