import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: './packages/src/index.ts',
  dts: true,
  minify: true,
});
