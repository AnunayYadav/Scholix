
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
      const meta = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

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
