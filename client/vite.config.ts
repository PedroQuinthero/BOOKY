import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000, // Use environment variable or fallback to 3000
    proxy: {
      '/graphql': {
        target: 'http://localhost:3001', // Adjust target if your backend server URL differs
        changeOrigin: true,
        secure: false, // Disable SSL verification for development purposes
      },
    },
  },
});