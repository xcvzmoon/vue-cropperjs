import { fileURLToPath } from 'node:url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '@xcvzmoon/vue-cropperjs': fileURLToPath(new URL('../../packages/src/index.ts', import.meta.url)),
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
});
