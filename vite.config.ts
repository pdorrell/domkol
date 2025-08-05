import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function getFormattedDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getHostname() {
  try {
    return execSync('hostname', { encoding: 'utf8' }).trim();
  } catch {
    return 'localhost';
  }
}

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const hostname = getHostname();

  return {
    plugins: [react()],
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
      port: 3004,
      host: '0.0.0.0',
      open: `http://${hostname}.local:3004`,
      allowedHosts: ['localhost', '.local'],
    },
    define: {
      'process.env.APP_VERSION': JSON.stringify(
        fs.existsSync(path.resolve(process.cwd(), 'version.txt'))
          ? (isDevelopment
              ? fs.readFileSync(path.resolve(process.cwd(), 'version.txt'), 'utf-8').trim() + '+'
              : fs.readFileSync(path.resolve(process.cwd(), 'version.txt'), 'utf-8').trim())
          : getFormattedDateTime()
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
