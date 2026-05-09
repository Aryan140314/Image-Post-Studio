import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/create-post': 'http://localhost:3000',
      '/posts': 'http://localhost:3000',
    },
  },
});
