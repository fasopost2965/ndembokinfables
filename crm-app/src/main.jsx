import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import { CRMProvider } from './contexts/CRMContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <CRMProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CRMProvider>
    </ErrorBoundary>
  </StrictMode>,
)
