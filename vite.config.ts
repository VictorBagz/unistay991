import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import reactSwc from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProd = mode === 'production';

    return {
      base: './', 
      server: {
        port: 3000,
        host: '0.0.0.0',
        open: true,
      },
      plugins: [
        // Use SWC in development for faster refresh
        mode === 'development' ? reactSwc() : react()
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        include: ['react', 'react-dom'],
      },
      build: {
        sourcemap: !isProd,
        minify: isProd ? 'esbuild' : false,
        target: 'esnext',
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom']
            }
          }
        },
        chunkSizeWarningLimit: 1000
      },
      // Enable detailed error overlays in development
      esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' },
        ...(isProd && {
          drop: ['console', 'debugger']
        })
      }
    };
});