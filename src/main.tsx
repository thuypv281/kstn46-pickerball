import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Admin from './Admin.tsx'
import App from './App.tsx'

const path = window.location.pathname.replace(/\/$/, '') || '/'
const rootEl = document.getElementById('root')!

createRoot(rootEl).render(
  <StrictMode>{path === '/admin' ? <Admin /> : <App />}</StrictMode>,
)
