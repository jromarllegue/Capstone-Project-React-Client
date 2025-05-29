import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    server: {
      port: process.env.PORT || 5173,
    },
    define: {
      'process.env': {},
    },
    build: {
      outDir: 'build',
    },
  };

  if (command !== 'serve') {
    config.base = '/';
  }

  return config;
});
