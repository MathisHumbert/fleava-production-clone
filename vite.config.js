import glsl from 'vite-plugin-glsl';
import pugPlugin from 'vite-plugin-pug';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    base: 'https://fleava-production-clone.vercel.app/',
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        about: resolve(__dirname, 'src/about.html'),
        'works/noir': resolve(__dirname, 'src/works/noir.html'),
        'works/turiya': resolve(__dirname, 'src/works/turiya.html'),
        'works/samsara': resolve(__dirname, 'src/works/samsara.html'),
        'works/ayana': resolve(__dirname, 'src/works/ayana.html'),
        'works/tentrem': resolve(__dirname, 'src/works/tentrem.html'),
        'works/eyelike': resolve(__dirname, 'src/works/eyelike.html'),
        'works/wonderful-indonesia': resolve(
          __dirname,
          'src/works/wonderful-indonesia.html'
        ),
      },
    },
  },
  plugins: [glsl(), pugPlugin({ localImports: true })],
});
