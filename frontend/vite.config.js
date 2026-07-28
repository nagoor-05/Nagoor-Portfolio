import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  cacheDir: "work/vite-cache",
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || "http://127.0.0.1:5001",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
    },
  },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      "@emailjs/browser",
      "@react-three/drei",
      "@react-three/fiber",
      "@tsparticles/react",
      "@tsparticles/slim",
      "framer-motion",
      "gsap",
      "lucide-react",
      "react",
      "react-dom",
      "react-dom/client",
      "react-icons/fa",
      "react-icons/fa6",
      "react-router",
      "react-router-dom",
      "three",
      "cookie",
    ],
  },
});
