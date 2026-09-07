import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { cwd } from 'node:process'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), "");

  return {
    plugins: [react()],
    server: {
      host: true,
      proxy: {
        "/api/tmdb": {
          target: "https://api.themoviedb.org",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tmdb/, "/3"),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (env.TMDB_API_KEY || env.VITE_TMDB_API_KEY) {
                const separator = proxyReq.path.includes("?") ? "&" : "?";
                const apiKey = env.TMDB_API_KEY || env.VITE_TMDB_API_KEY;
                proxyReq.path += `${separator}api_key=${encodeURIComponent(apiKey)}`;
              }
            });
          },
        },
      },
    },
  };
});
