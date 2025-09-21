import { wayfinder } from "@laravel/vite-plugin-wayfinder";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    laravel({
      input: [
        "resources/css/app.css",
        "resources/js/app.tsx",
        "resources/js/pages/session/room.tsx",
      ],
      ssr: "resources/js/ssr.tsx",
      refresh: true,
    }),
    react(),
    tailwindcss(),
    wayfinder({
      formVariants: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "resources/js"),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  // server: {
  //     host: '0.0.0.0',
  //     port: 5173,
  //     hmr: {
  //         protocol: 'wss',
  //         host: 'https://5172c0a8dccb.ngrok-free.app',
  //     },
  // },
});
