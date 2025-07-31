import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import uriSafePlugin from './vite-uri-plugin'
import fs from 'fs'

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return defineConfig({
  // Configure MIME types for 3D models
  assetsInclude: ['**/*.glb'],
  plugins: [
    // Add our custom URI safe plugin first
    uriSafePlugin(),
    react()
  ],
  // Use a different index.html file for development
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
      // Explicitly deny problematic paths
      deny: ['.env', '.env.*', 'node_modules/.vite'],
    },
    proxy: {
      // Proxy API requests to Django backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy media requests to Django backend
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy admin requests to Django backend
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== 'production',
    // Output assets to Django's static directory
    assetsDir: 'static',
    assetsInlineLimit: 4096,
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion', 'aos'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
  // Server configuration is already defined above
  // Handle URI encoding issues
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
  // Use environment variables for base URL
  base: env.VITE_BASE_URL || '/',
});
}