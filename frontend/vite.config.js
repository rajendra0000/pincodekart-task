import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    cors: true,
    // Proxy configuration if needed
    proxy: {
      // Uncomment if you want to proxy GraphQL requests
      // '/graphql': {
      //   target: 'http://localhost:4000',
      //   changeOrigin: true,
      //   ws: true,
      // },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize bundle
    rollupOptions: {
      output: {
        manualChunks: {
          'apollo-client': ['@apollo/client'],
          'graphql': ['graphql', 'graphql-ws'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['@apollo/client', 'graphql', 'graphql-ws', 'react', 'react-dom'],
  },
});