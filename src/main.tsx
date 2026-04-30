import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { ThemeProvider } from 'next-themes'
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { AuthProvider } from './hooks/useAuth'

import "./main.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
   </ErrorBoundary>
)
