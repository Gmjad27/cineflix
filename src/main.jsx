import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerServiceWorker, promptInstallPWA } from './utils/pwa'

// Register service worker for PWA functionality
registerServiceWorker()

// Setup PWA install prompt
promptInstallPWA()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
