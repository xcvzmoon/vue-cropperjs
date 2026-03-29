import { defineConfig } from 'tsdown';
import Starter from 'unplugin-vue/rolldown';

export default defineConfig({
  deps: {
    neverBundle: ['vue', /^@vue\//],
  },
  entry: './packages/src/index.ts',
  dts: {
    vue: true,
  },
  minify: true,
  platform: 'neutral',
  // oxlint-disable-next-line new-cap
  plugins: [Starter({ isProduction: true })],
});
