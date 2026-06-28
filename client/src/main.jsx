/**
 * main.jsx — React application entry point
 * Mounts the app and wraps it with global context providers.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/* ── Style imports (order matters) ── */
import './styles/theme.css';      // Theme variables (light/dark)
import './styles/global.css';     // Global utility classes + theme transitions
import './index.css';             // Feature-specific component styles
import './styles/responsive.css'; // Responsive breakpoint overrides

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Toast />
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
