import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';

  return {
    plugins: [
      react(),
      {
        name: 'kill-server',
        configureServer(server) {
          server.middlewares.use('/kill', (req, res) => {
            res.end('Killing server...');
            setTimeout(() => {
              process.exit(0);
            }, 100);
          });
        }
      }
    ],
  root: './src',
  publicDir: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3003,
    host: 'localhost',
    open: false,
    allowedHosts: 'all',
  },
  define: {
    'process.env.APP_VERSION': JSON.stringify(
      fs.existsSync(path.resolve(process.cwd(), 'version.txt'))
        ? (isDevelopment
            ? fs.readFileSync(path.resolve(process.cwd(), 'version.txt'), 'utf-8').trim() + '+'
            : fs.readFileSync(path.resolve(process.cwd(), 'version.txt'), 'utf-8').trim())
        : '-'
    )
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
  };
});
