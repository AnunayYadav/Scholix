import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';

// Dev middleware plugin to serve Vercel serverless API handlers in local Vite dev server
function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const urlPath = req.url.split('?')[0];
        const apiName = urlPath.replace('/api/', '');
        const handlerFile = path.resolve(__dirname, `api/${apiName}.ts`);

        try {
          if (!fs.existsSync(handlerFile)) {
            return next();
          }

          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          await new Promise((resolve) => req.on('end', resolve));

          if (body) {
            try {
              req.body = JSON.parse(body);
            } catch (e) {
              req.body = body;
            }
          }

          const module = await server.ssrLoadModule(`/api/${apiName}.ts`);
          const handler = module.default;

          if (typeof handler === 'function') {
            res.status = (code: number) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
            res.send = (data: any) => {
              res.end(data);
              return res;
            };

            await handler(req, res);
            return;
          }
        } catch (err: any) {
          console.error(`Dev API Handler Error (${urlPath}):`, err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss(), apiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      target: 'es2020',
      cssTarget: 'safari13',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
            lucide: ['lucide-react'],
          }
        }
      }
    }
  };
});
