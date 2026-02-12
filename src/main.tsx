
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeStorageManagement } from './utils/storage-manager';
import { initWebVitals } from './utils/webVitals';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[main] Root element not found');
  throw new Error('Root element not found');
}

console.log('[main] Starting app render');

// Initialize storage management before app render
initializeStorageManagement();

try {
  const root = createRoot(rootElement);
  root.render(

      <App />
  );
  
  // Initialize Web Vitals tracking in production
  if (!import.meta.env.DEV) {
    initWebVitals();
  }
} catch (error) {
  console.error('[main] Failed to render app:', error);
}
