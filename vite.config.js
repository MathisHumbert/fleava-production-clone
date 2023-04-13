import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  server: { open: true },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        'works/noir': resolve(__dirname, 'src/works/noir.html'),
        'works/turiya': resolve(__dirname, 'src/works/turiya.html'),
      },
    },
  },
  plugins: [glsl()],
});
