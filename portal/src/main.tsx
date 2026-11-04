import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from '@/lib/auth';
import '@/index.css';

/**
 * Client & designer portal — the second website.
 * Served from `portal.html` in single-domain mode, or its own domain when
 * VITE_PORTAL_URL / VITE_SITE_URL point the two apps at each other.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
