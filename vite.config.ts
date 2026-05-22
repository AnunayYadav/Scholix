import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      configureServer: (server) => {
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url.startsWith('/api/') || req.url.includes('/api/'))) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: "API not running in standalone Vite dev mode. Use 'vercel dev' to run API functions." }));
            return;
          }
          next();
        });
      }
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      target: 'es2020',
      cssTarget: 'safari13',
    }

  };
});
