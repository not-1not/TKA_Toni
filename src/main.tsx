import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { syncServerTime } from './lib/utils'
import { api } from './lib/db'

Promise.all([syncServerTime(), api.initializeDatabase()]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
