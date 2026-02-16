import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/auth": "http://localhost:8000",
      "/coaches": "http://localhost:8000",
      "/clients": "http://localhost:8000",
      "/workouts": "http://localhost:8000",
      "/checkins": "http://localhost:8000",
      "/videos": "http://localhost:8000",
      "/messages": "http://localhost:8000",
      "/automation": "http://localhost:8000",
      "/billing": "http://localhost:8000",
    },
  },
});
