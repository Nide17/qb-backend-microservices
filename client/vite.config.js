import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['reactstrap', 'bootstrap'],
          'utils-vendor': ['axios', 'moment', 'uuid'],
          'editor-vendor': ['draft-js', 'react-draft-wysiwyg'],
          'charts-vendor': ['react-google-charts'],
          'socket-vendor': ['socket.io-client']
        },
        // Optimize asset filenames
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@utils': '/src/utils',
      '@redux': '/src/redux',
      '@images': '/src/images'
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'axios',
      'reactstrap'
    ]
  },
  // Additional performance optimizations
  esbuild: {
    drop: ['console', 'debugger']
  }
})