import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { ConfigEnv, UserConfig } from 'vite';

export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  return {
    plugins: [react()],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') }
      ]
    },
    server: {
      port: 3000,
      open: true,
      host: true, // needed for docker
      strictPort: true
    },
    preview: {
      port: 3000,
      open: true,
      strictPort: true
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom']
          }
        }
      }
    }
  }
});



