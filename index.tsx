
/**
 * Scholix Environment Bootstrap
 * This must run at the absolute top of the entry point to ensure
 * environment variables are available to all subsequently loaded modules.
 */
(function initializeScholixGlobalEnv() {
  const g = (typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : ({} as any));

  // Ensure standard process.env structure exists
  if (!g.process) g.process = { env: {} };
  if (!g.process.env) g.process.env = {};

  const varsToBootstrap = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

  varsToBootstrap.forEach(varName => {
    try {
      const vitePrefix = `VITE_${varName}`;
      // Check import.meta.env (Standard for Vite/Modern ESM)
      // @ts-ignore
      const meta: any = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

      const val = meta[vitePrefix] ||
        meta[varName] ||
        g.process.env[varName] ||
        g.process.env[vitePrefix] ||
        g[varName] ||
        g[vitePrefix];

      if (val) {
        g.process.env[varName] = val;
        // Also map to global if needed by some legacy libs
        g[varName] = val;
      }
    } catch (e) {
      // Fail silently for individual variables
    }
  });


})();

// Global fetch interceptor for Capacitor mobile app environments.
// If VITE_API_BASE_URL is set, relative /api/ requests are redirected to the hosted backend.
(function setupCapacitorFetchInterceptor() {
  try {
    // @ts-ignore
    const meta: any = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
    const apiBase = meta.VITE_API_BASE_URL;
    if (apiBase) {
      const originalFetch = window.fetch;
      window.fetch = function (input, init) {
        let url = '';
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.toString();
        } else if (input && typeof input === 'object' && 'url' in input) {
          url = input.url;
        }

        const localOrigin = window.location.origin;
        if (url.startsWith('/api/')) {
          const newUrl = `${apiBase}${url}`;
          if (typeof input === 'string') {
            return originalFetch(newUrl, init);
          } else if (input instanceof URL) {
            return originalFetch(new URL(newUrl), init);
          } else {
            const newRequest = new Request(newUrl, input);
            return originalFetch(newRequest, init);
          }
        } else if (url.startsWith(`${localOrigin}/api/`)) {
          const newUrl = url.replace(localOrigin, apiBase);
          if (typeof input === 'string') {
            return originalFetch(newUrl, init);
          } else if (input instanceof URL) {
            return originalFetch(new URL(newUrl), init);
          } else {
            const newRequest = new Request(newUrl, input);
            return originalFetch(newRequest, init);
          }
        }
        return originalFetch(input, init);
      };
    }
  } catch (e) {
    console.error('Failed to initialize Capacitor fetch interceptor:', e);
  }
})();


// Automatically reload page when a dynamically imported asset fails to load (e.g. after a redeployment)
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('Vite preload error detected, reloading page to fetch latest assets:', event);
    window.location.reload();
  });
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Target container 'root' not found in DOM.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
