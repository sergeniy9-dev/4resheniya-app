import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      workbox: {
        navigateFallbackDenylist: [
          /^\/docs\//,
          /^\/api\//,
          /^\/go\//,
        ],
      },

      manifest: {
        name: "4РЕШЕНИЯ",
        short_name: "4РЕШЕНИЯ",

        description:
          "Проектирование, строительство и комплексная реализация пространств",

        theme_color: "#050505",
        background_color: "#050505",

        display: "standalone",

        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
