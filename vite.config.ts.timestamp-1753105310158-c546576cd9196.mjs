// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/coding_projects/Azad_proj/node_modules/vite/dist/node/index.js";
import react from "file:///D:/coding_projects/Azad_proj/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";

// vite-uri-plugin.js
function uriSafePlugin() {
  return {
    name: "vite-plugin-uri-safe",
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          try {
            const originalUrl = req.url;
            if (originalUrl) {
              let safeUrl = originalUrl.replace(/%(?![0-9A-Fa-f]{2})/g, "%25");
              safeUrl = safeUrl.replace(/%[0-9A-Fa-f]{2}/g, (match) => {
                try {
                  decodeURIComponent(match);
                  return match;
                } catch (e) {
                  return encodeURIComponent(match);
                }
              });
              safeUrl = safeUrl.replace(/[\u0080-\uFFFF]/g, (c) => encodeURIComponent(c));
              safeUrl = safeUrl.replace(/[\[\]\{\}\|\\^`<>]/g, (c) => encodeURIComponent(c));
              if (safeUrl !== originalUrl) {
                req.url = safeUrl;
                console.log(`[URI Safe Plugin] Sanitized URL: ${originalUrl} \u2192 ${req.url}`);
              }
            }
            next();
          } catch (error) {
            console.error("[URI Safe Plugin] Error processing URL:", error);
            next();
          }
        });
      };
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "D:\\coding_projects\\Azad_proj";
var vite_config_default = ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return defineConfig({
    // Configure MIME types for 3D models
    assetsInclude: ["**/*.glb"],
    plugins: [
      // Add our custom URI safe plugin first
      uriSafePlugin(),
      react()
    ],
    // Use a different index.html file for development
    appType: "spa",
    root: process.cwd(),
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "src")
      }
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: process.env.NODE_ENV !== "production",
      // Output assets to Django's static directory
      assetsDir: "static",
      assetsInlineLimit: 4096,
      // Optimize for production
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production",
          drop_debugger: process.env.NODE_ENV === "production"
        }
      },
      rollupOptions: {
        input: {
          main: resolve(__vite_injected_original_dirname, "index.dev.html")
        },
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            animations: ["framer-motion", "aos"],
            three: ["three", "@react-three/fiber", "@react-three/drei"]
          }
        }
      }
    },
    // Configure static file handling
    publicDir: "public",
    server: {
      port: 3e3,
      open: true,
      fs: {
        // Allow serving files from one level up to the project root
        allow: [".."],
        // Explicitly deny problematic paths
        deny: [".env", ".env.*", "node_modules/.vite"]
      },
      proxy: {
        // Proxy API requests to Django backend
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false
        },
        // Proxy media requests to Django backend
        "/media": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false
        },
        // Proxy admin requests to Django backend
        "/admin": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false
        }
      }
    },
    // Handle URI encoding issues
    optimizeDeps: {
      esbuildOptions: {
        target: "es2020"
      }
    },
    // Use environment variables for base URL
    base: env.VITE_BASE_URL || "/"
  });
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS11cmktcGx1Z2luLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcY29kaW5nX3Byb2plY3RzXFxcXEF6YWRfcHJvalwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcY29kaW5nX3Byb2plY3RzXFxcXEF6YWRfcHJvalxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovY29kaW5nX3Byb2plY3RzL0F6YWRfcHJvai92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcbmltcG9ydCB1cmlTYWZlUGx1Z2luIGZyb20gJy4vdml0ZS11cmktcGx1Z2luJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgKHsgbW9kZSB9KSA9PiB7XG4gIC8vIExvYWQgZW52aXJvbm1lbnQgdmFyaWFibGVzIGJhc2VkIG9uIG1vZGVcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIFxuICByZXR1cm4gZGVmaW5lQ29uZmlnKHtcbiAgLy8gQ29uZmlndXJlIE1JTUUgdHlwZXMgZm9yIDNEIG1vZGVsc1xuICBhc3NldHNJbmNsdWRlOiBbJyoqLyouZ2xiJ10sXG4gIHBsdWdpbnM6IFtcbiAgICAvLyBBZGQgb3VyIGN1c3RvbSBVUkkgc2FmZSBwbHVnaW4gZmlyc3RcbiAgICB1cmlTYWZlUGx1Z2luKCksXG4gICAgcmVhY3QoKVxuICBdLFxuICAvLyBVc2UgYSBkaWZmZXJlbnQgaW5kZXguaHRtbCBmaWxlIGZvciBkZXZlbG9wbWVudFxuICBhcHBUeXBlOiAnc3BhJyxcbiAgcm9vdDogcHJvY2Vzcy5jd2QoKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICBzb3VyY2VtYXA6IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsXG4gICAgLy8gT3V0cHV0IGFzc2V0cyB0byBEamFuZ28ncyBzdGF0aWMgZGlyZWN0b3J5XG4gICAgYXNzZXRzRGlyOiAnc3RhdGljJyxcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogNDA5NixcbiAgICAvLyBPcHRpbWl6ZSBmb3IgcHJvZHVjdGlvblxuICAgIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgZHJvcF9jb25zb2xlOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nLFxuICAgICAgICBkcm9wX2RlYnVnZ2VyOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIG1haW46IHJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguZGV2Lmh0bWwnKSxcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgYW5pbWF0aW9uczogWydmcmFtZXItbW90aW9uJywgJ2FvcyddLFxuICAgICAgICAgIHRocmVlOiBbJ3RocmVlJywgJ0ByZWFjdC10aHJlZS9maWJlcicsICdAcmVhY3QtdGhyZWUvZHJlaSddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICAvLyBDb25maWd1cmUgc3RhdGljIGZpbGUgaGFuZGxpbmdcbiAgcHVibGljRGlyOiAncHVibGljJyxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAwMCxcbiAgICBvcGVuOiB0cnVlLFxuICAgIGZzOiB7XG4gICAgICAvLyBBbGxvdyBzZXJ2aW5nIGZpbGVzIGZyb20gb25lIGxldmVsIHVwIHRvIHRoZSBwcm9qZWN0IHJvb3RcbiAgICAgIGFsbG93OiBbJy4uJ10sXG4gICAgICAvLyBFeHBsaWNpdGx5IGRlbnkgcHJvYmxlbWF0aWMgcGF0aHNcbiAgICAgIGRlbnk6IFsnLmVudicsICcuZW52LionLCAnbm9kZV9tb2R1bGVzLy52aXRlJ10sXG4gICAgfSxcbiAgICBwcm94eToge1xuICAgICAgLy8gUHJveHkgQVBJIHJlcXVlc3RzIHRvIERqYW5nbyBiYWNrZW5kXG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIC8vIFByb3h5IG1lZGlhIHJlcXVlc3RzIHRvIERqYW5nbyBiYWNrZW5kXG4gICAgICAnL21lZGlhJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgLy8gUHJveHkgYWRtaW4gcmVxdWVzdHMgdG8gRGphbmdvIGJhY2tlbmRcbiAgICAgICcvYWRtaW4nOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMCcsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgLy8gSGFuZGxlIFVSSSBlbmNvZGluZyBpc3N1ZXNcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgfSxcbiAgfSxcbiAgLy8gVXNlIGVudmlyb25tZW50IHZhcmlhYmxlcyBmb3IgYmFzZSBVUkxcbiAgYmFzZTogZW52LlZJVEVfQkFTRV9VUkwgfHwgJy8nLFxufSk7XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxjb2RpbmdfcHJvamVjdHNcXFxcQXphZF9wcm9qXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxjb2RpbmdfcHJvamVjdHNcXFxcQXphZF9wcm9qXFxcXHZpdGUtdXJpLXBsdWdpbi5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovY29kaW5nX3Byb2plY3RzL0F6YWRfcHJvai92aXRlLXVyaS1wbHVnaW4uanNcIjsvLyBDdXN0b20gVml0ZSBwbHVnaW4gdG8gaGFuZGxlIFVSSSBlbmNvZGluZyBpc3N1ZXNcblxuLyoqXG4gKiBBIFZpdGUgcGx1Z2luIHRoYXQgaW50ZXJjZXB0cyBhbmQgaGFuZGxlcyBVUkkgZW5jb2RpbmcgaXNzdWVzXG4gKiBieSBzYWZlbHkgcHJvY2Vzc2luZyBVUkxzIGJlZm9yZSB0aGV5J3JlIHBhc3NlZCB0byBkZWNvZGVVUklcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdXJpU2FmZVBsdWdpbigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndml0ZS1wbHVnaW4tdXJpLXNhZmUnLFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIEFkZCBhIG1pZGRsZXdhcmUgdGhhdCBydW5zIGJlZm9yZSBWaXRlJ3MgdHJhbnNmb3JtIG1pZGRsZXdhcmVcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBvcmlnaW5hbCBVUkxcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsVXJsID0gcmVxLnVybDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKG9yaWdpbmFsVXJsKSB7XG4gICAgICAgICAgICAgIC8vIE1vcmUgY29tcHJlaGVuc2l2ZSBVUkwgc2FuaXRpemF0aW9uXG4gICAgICAgICAgICAgIC8vIDEuIEhhbmRsZSBpbmNvbXBsZXRlIHBlcmNlbnQtZW5jb2RlZCBzZXF1ZW5jZXNcbiAgICAgICAgICAgICAgbGV0IHNhZmVVcmwgPSBvcmlnaW5hbFVybC5yZXBsYWNlKC8lKD8hWzAtOUEtRmEtZl17Mn0pL2csICclMjUnKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIDIuIEhhbmRsZSBpbnZhbGlkIHBlcmNlbnQtZW5jb2RlZCBzZXF1ZW5jZXNcbiAgICAgICAgICAgICAgc2FmZVVybCA9IHNhZmVVcmwucmVwbGFjZSgvJVswLTlBLUZhLWZdezJ9L2csIG1hdGNoID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KG1hdGNoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gMy4gRW5jb2RlIG5vbi1BU0NJSSBjaGFyYWN0ZXJzXG4gICAgICAgICAgICAgIHNhZmVVcmwgPSBzYWZlVXJsLnJlcGxhY2UoL1tcXHUwMDgwLVxcdUZGRkZdL2csIGMgPT4gZW5jb2RlVVJJQ29tcG9uZW50KGMpKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIDQuIEhhbmRsZSBzcGVjaWFsIGNoYXJhY3RlcnMgdGhhdCBtaWdodCBjYXVzZSBpc3N1ZXNcbiAgICAgICAgICAgICAgc2FmZVVybCA9IHNhZmVVcmwucmVwbGFjZSgvW1xcW1xcXVxce1xcfVxcfFxcXFxeYDw+XS9nLCBjID0+IGVuY29kZVVSSUNvbXBvbmVudChjKSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAvLyBPbmx5IHVwZGF0ZSBhbmQgbG9nIGlmIHdlIG1hZGUgY2hhbmdlc1xuICAgICAgICAgICAgICBpZiAoc2FmZVVybCAhPT0gb3JpZ2luYWxVcmwpIHtcbiAgICAgICAgICAgICAgICByZXEudXJsID0gc2FmZVVybDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1VSSSBTYWZlIFBsdWdpbl0gU2FuaXRpemVkIFVSTDogJHtvcmlnaW5hbFVybH0gXHUyMTkyICR7cmVxLnVybH1gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tVUkkgU2FmZSBQbHVnaW5dIEVycm9yIHByb2Nlc3NpbmcgVVJMOicsIGVycm9yKTtcbiAgICAgICAgICAgIC8vIENvbnRpbnVlIGRlc3BpdGUgZXJyb3JzIC0gbGV0IFZpdGUgaGFuZGxlIGl0XG4gICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFEsU0FBUyxjQUFjLGVBQWU7QUFDbFQsT0FB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
