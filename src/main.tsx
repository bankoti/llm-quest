import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { processUrlFlags } from '@/engine/admin'

// Apply ?admin= / ?grant= before React reads progress from localStorage
processUrlFlags()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
