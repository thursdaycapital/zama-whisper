import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  minify: false,
  esbuildOptions(options) {
    // Only remove debugger in production build, keep console for error tracking
    options.drop = ['debugger']
  },
})
