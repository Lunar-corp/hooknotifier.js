import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  // The package has a single default export: make `require('hook.notifier')`
  // return the class directly, like v1 did with `module.exports = HookNotifier`.
  cjsInterop: true,
  splitting: true,
});
